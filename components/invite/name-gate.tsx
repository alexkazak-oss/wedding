'use client'

import { findInviteByName } from '@/lib/actions/invite'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Locale = 'ru' | 'it'

const COPY: Record<
	Locale,
	{
		title: string
		subtitle: string
		first: string
		last: string
		submit: string
		pending: string
	}
> = {
	ru: {
		title: 'Добро пожаловать',
		subtitle: 'Введите имя и фамилию, чтобы открыть ваше приглашение.',
		first: 'Имя',
		last: 'Фамилия',
		submit: 'Открыть приглашение',
		pending: 'Ищем…',
	},
	it: {
		title: 'Benvenuti',
		subtitle: 'Inserisci nome e cognome per aprire il tuo invito.',
		first: 'Nome',
		last: 'Cognome',
		submit: 'Apri l’invito',
		pending: 'Ricerca…',
	},
}

export function NameGate({ locale }: { locale: Locale }) {
	const router = useRouter()
	const t = COPY[locale] ?? COPY.ru
	const [first, setFirst] = useState('')
	const [last, setLast] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [pending, startTransition] = useTransition()

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		startTransition(async () => {
			const result = await findInviteByName({ firstName: first, lastName: last })
			if (result.ok) {
				router.push(`/${result.locale}/${result.token}`)
			} else {
				setError(result.error)
			}
		})
	}

	return (
		<main className="min-h-screen flex items-center justify-center bg-linen px-6 py-12">
			<div className="w-full max-w-md bg-cream sm:shadow-[var(--shadow-card)] sm:rounded-sm px-6 sm:px-12 py-16 text-center">
				<h1 className="font-serif text-3xl sm:text-4xl text-ink mb-4 tracking-wide">{t.title}</h1>
				<p className="text-sm text-ink-light font-sans max-w-sm mx-auto mb-10 leading-[1.7]">
					{t.subtitle}
				</p>

				<form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-5 text-left">
					<div>
						<label className="block text-[10px] uppercase tracking-[0.22em] text-ink-muted font-sans mb-2">
							{t.first}
						</label>
						<input
							type="text"
							value={first}
							onChange={(e) => setFirst(e.target.value)}
							required
							autoComplete="given-name"
							autoFocus
							className="w-full bg-transparent border-0 border-b border-border focus:border-ink outline-none py-2 text-base text-ink font-sans"
						/>
					</div>

					<div>
						<label className="block text-[10px] uppercase tracking-[0.22em] text-ink-muted font-sans mb-2">
							{t.last}
						</label>
						<input
							type="text"
							value={last}
							onChange={(e) => setLast(e.target.value)}
							required
							autoComplete="family-name"
							className="w-full bg-transparent border-0 border-b border-border focus:border-ink outline-none py-2 text-base text-ink font-sans"
						/>
					</div>

					{error && <p className="text-xs text-red-700/80 font-sans">{error}</p>}

					<button
						type="submit"
						disabled={pending || !first || !last}
						className="w-full py-3 bg-ink text-cream uppercase text-xs tracking-[0.18em] font-sans hover:bg-ink-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{pending ? t.pending : t.submit}
					</button>
				</form>
			</div>
		</main>
	)
}
