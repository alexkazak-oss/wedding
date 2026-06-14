'use client'

import { toast, useField } from '@payloadcms/ui'
import type { DefaultCellComponentProps } from 'payload'

// ─── shared helpers ──────────────────────────────────

// Детерминированно (без window) — чтобы не было hydration-mismatch.
function buildUrl(token?: string | null, locale?: string | null): string {
	if (!token) return ''
	const base = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
	return `${base}/${locale ?? 'ru'}/${token}`
}

async function copy(url: string) {
	if (!url) return
	try {
		await navigator.clipboard.writeText(url)
		toast.success('Ссылка скопирована')
	} catch {
		toast.error('Не удалось скопировать ссылку')
	}
}

// ─── clickable pill (shared UI) ──────────────────────

function CopyPill({ url, large }: { url: string; large?: boolean }) {
	if (!url) return <span style={{ color: 'var(--theme-elevation-400)' }}>—</span>
	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault()
				e.stopPropagation()
				void copy(url)
			}}
			title="Нажмите, чтобы скопировать"
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 6,
				maxWidth: '100%',
				padding: large ? '8px 12px' : '2px 8px',
				border: '1px solid var(--theme-elevation-150)',
				borderRadius: 4,
				background: 'var(--theme-elevation-50)',
				color: 'var(--theme-text)',
				cursor: 'pointer',
				font: 'inherit',
				fontSize: large ? 14 : 13,
				lineHeight: 1.4,
			}}
		>
			<span
				style={{
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
				}}
			>
				{url}
			</span>
			<span aria-hidden style={{ flexShrink: 0, opacity: 0.6 }}>
				⧉
			</span>
		</button>
	)
}

// ─── List view cell ──────────────────────────────────

export function CopyLinkCell(props: DefaultCellComponentProps) {
	const { cellData, rowData } = props
	const url =
		(typeof cellData === 'string' && cellData) ||
		buildUrl(rowData?.tokenRaw as string, rowData?.locale as string)
	return <CopyPill url={url} />
}

// ─── Edit view field ─────────────────────────────────

export function CopyLinkField({ path }: { path: string }) {
	const { value } = useField<string>({ path })
	const { value: tokenRaw } = useField<string>({ path: 'tokenRaw' })
	const { value: locale } = useField<string>({ path: 'locale' })
	const url = value || buildUrl(tokenRaw, locale)

	return (
		<div className="field-type" style={{ marginBottom: 'var(--base)' }}>
			<label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
				Ссылка для гостя
			</label>
			<CopyPill url={url} large />
			<p
				style={{
					marginTop: 6,
					marginBottom: 0,
					fontSize: 12,
					color: 'var(--theme-elevation-500)',
				}}
			>
				Нажмите на ссылку, чтобы скопировать, и отправьте её гостю.
			</p>
		</div>
	)
}
