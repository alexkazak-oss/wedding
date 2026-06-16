-- ╔════════════════════════════════════════════════════════════╗
-- ║  Wedding DB — диагностика здоровья и поиск недостатков        ║
-- ║  Read-only. Запускай блоки по одному в Supabase SQL Editor.   ║
-- ║  Покрывает обе схемы: public (свадьба) и payload (приглашения)║
-- ╚════════════════════════════════════════════════════════════╝


-- ─── 1. Размеры таблиц и оценка числа строк ──────────────────────
-- Где лежат данные и что растёт. invite_sessions/_access_logs — самые
-- горячие под нагрузкой (~500 сессий).
select
  n.nspname                                    as schema,
  c.relname                                    as table,
  c.reltuples::bigint                          as est_rows,
  pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
  pg_size_pretty(pg_relation_size(c.oid))       as table_size,
  pg_size_pretty(pg_indexes_size(c.oid))        as indexes_size
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname in ('public', 'payload')
order by pg_total_relation_size(c.oid) desc;


-- ─── 2. ❗ Внешние ключи без индекса (главная находка) ───────────
-- FK без индекса на стороне «многих» = seq scan при джойнах, выборках
-- по родителю и каскадных удалениях. Ожидаем здесь invite_sessions.invite_id
-- и invite_access_logs.invite_id (в Payload у relationship нет index:true).
select
  ns.nspname                              as schema,
  cl.relname                              as table,
  con.conname                             as fk_constraint,
  pg_get_constraintdef(con.oid)           as definition
from pg_constraint con
join pg_class cl       on cl.oid = con.conrelid
join pg_namespace ns   on ns.oid = cl.relnamespace
where con.contype = 'f'
  and ns.nspname in ('public', 'payload')
  and not exists (
    -- есть ли индекс, чей первый столбец совпадает с первым столбцом FK
    select 1
    from pg_index i
    where i.indrelid = con.conrelid
      and (i.indkey::smallint[])[0] = con.conkey[1]
  )
order by ns.nspname, cl.relname;


-- ─── 3. Неиспользуемые / избыточные индексы ──────────────────────
-- idx_scan = 0 при заметном размере → кандидат на удаление (тормозит запись).
select
  s.schemaname                                  as schema,
  s.relname                                      as table,
  s.indexrelname                                 as index,
  s.idx_scan                                     as scans,
  pg_size_pretty(pg_relation_size(s.indexrelid)) as size
from pg_stat_user_indexes s
join pg_index i on i.indexrelid = s.indexrelid
where s.schemaname in ('public', 'payload')
  and not i.indisunique          -- unique/PK не трогаем
  and not i.indisprimary
order by s.idx_scan asc, pg_relation_size(s.indexrelid) desc;


-- ─── 4. Sequential scans по таблицам ─────────────────────────────
-- Высокий seq_scan при ненулевых строках = не хватает индекса под
-- частый запрос. Сопоставь с разделом 2.
select
  schemaname              as schema,
  relname                 as table,
  seq_scan,
  idx_scan,
  seq_tup_read,
  n_live_tup              as live_rows,
  case when seq_scan > 0
       then round(seq_tup_read::numeric / seq_scan, 1) end as avg_rows_per_seqscan
from pg_stat_user_tables
where schemaname in ('public', 'payload')
order by seq_scan desc;


-- ─── 5. Мёртвые строки и здоровье autovacuum ─────────────────────
-- Высокий dead_ratio = раздувание (bloat), медленные сканы, давление на pool.
select
  schemaname                                              as schema,
  relname                                                  as table,
  n_live_tup                                               as live,
  n_dead_tup                                               as dead,
  case when n_live_tup > 0
       then round(100.0 * n_dead_tup / n_live_tup, 1) end  as dead_pct,
  last_autovacuum,
  last_autoanalyze
from pg_stat_user_tables
where schemaname in ('public', 'payload')
order by n_dead_tup desc;


-- ─── 6. Cache hit ratio (должно быть > 99%) ──────────────────────
-- Низкий heap hit = данные не помещаются в shared_buffers / мало RAM.
select
  'heap' as kind,
  round(100.0 * sum(heap_blks_hit) /
        nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0), 2) as hit_pct
from pg_statio_user_tables
where schemaname in ('public', 'payload')
union all
select
  'index',
  round(100.0 * sum(idx_blks_hit) /
        nullif(sum(idx_blks_hit) + sum(idx_blks_read), 0), 2)
from pg_statio_user_tables
where schemaname in ('public', 'payload');


-- ─── 7. Соединения по состоянию (насыщение pool'а) ───────────────
-- Важно для transaction-пулера Supabase (:6543) и max:5 на инстанс.
-- Много 'idle in transaction' = подвисшие транзакции держат коннекты.
select
  state,
  count(*)                                                   as connections,
  max(now() - state_change)                                  as longest_in_state
from pg_stat_activity
where datname = current_database()
group by state
order by connections desc;


-- ─── 8. Долгие / заблокированные запросы прямо сейчас ────────────
select
  pid,
  now() - query_start as duration,
  state,
  wait_event_type,
  wait_event,
  left(query, 120)    as query
from pg_stat_activity
where datname = current_database()
  and state <> 'idle'
  and now() - query_start > interval '2 seconds'
order by duration desc;


-- ─── 9. Топ запросов по времени (нужен pg_stat_statements) ───────
-- В Supabase расширение обычно включено. Если ошибка — пропусти блок.
select
  round(total_exec_time)            as total_ms,
  calls,
  round(mean_exec_time, 2)          as mean_ms,
  round(100.0 * total_exec_time /
        sum(total_exec_time) over (), 1) as pct,
  left(query, 100)                  as query
from pg_stat_statements
order by total_exec_time desc
limit 20;


-- ─── 10. RLS включён на всех публичных таблицах? ─────────────────
-- В public RLS обязателен (данные доступны анону через Supabase API).
-- Схема payload ходит через сервисный пул Payload — там RLS не нужен.
select
  n.nspname            as schema,
  c.relname            as table,
  c.relrowsecurity     as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  (select count(*) from pg_policies p
     where p.schemaname = n.nspname and p.tablename = c.relname) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname = 'public'
order by c.relrowsecurity asc, c.relname;
