'use client'

import { toast, useField } from '@payloadcms/ui'
import type { DefaultCellComponentProps } from 'payload'
import { useEffect, useState } from 'react'

// ─── shared helpers ──────────────────────────────────

// База ссылки: NEXT_PUBLIC_SITE_URL, иначе — текущий origin админки.
// origin ставим в useEffect (после гидрации), чтобы не было hydration-mismatch.
function useBaseUrl(): string {
	const env = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
	const [origin, setOrigin] = useState('')
	useEffect(() => {
		if (!env && typeof window !== 'undefined') setOrigin(window.location.origin)
	}, [env])
	return env || origin
}

function buildUrl(base: string, token?: string | null, locale?: string | null): string {
	if (!token) return ''
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
	const { rowData } = props
	const base = useBaseUrl()
	const url = buildUrl(base, rowData?.tokenRaw as string, rowData?.locale as string)
	return <CopyPill url={url} />
}

// ─── Edit view field ─────────────────────────────────

export function CopyLinkField() {
	const base = useBaseUrl()
	const { value: tokenRaw } = useField<string>({ path: 'tokenRaw' })
	const { value: locale } = useField<string>({ path: 'locale' })
	const url = buildUrl(base, tokenRaw, locale)

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
