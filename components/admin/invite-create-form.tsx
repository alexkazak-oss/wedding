'use client'

import { createInvite } from '@/lib/actions/invite'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface InviteCreateFormProps {
	eventId: string
	siteOrigin: string
}

export function InviteCreateForm({ eventId, siteOrigin }: InviteCreateFormProps) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()
	const [generated, setGenerated] = useState<{ token: string; locale: string } | null>(null)
	const [error, setError] = useState<string | null>(null)

	const [greeting, setGreeting] = useState('')
	const [displayNames, setDisplayNames] = useState('')
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [partnerFirst, setPartnerFirst] = useState('')
	const [partnerLast, setPartnerLast] = useState('')
	const [locale, setLocale] = useState<'ru' | 'it'>('ru')
	const [maxGuests, setMaxGuests] = useState(1)
	const [copied, setCopied] = useState(false)

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setGenerated(null)
		startTransition(async () => {
			const result = await createInvite({
				eventId,
				greeting,
				displayNames,
				firstName,
				lastName: lastName || null,
				partnerFirstName: partnerFirst || null,
				partnerLastName: partnerLast || null,
				locale,
				maxGuests,
			})
			if (!result.ok) {
				setError(result.error)
				return
			}
			setGenerated({ token: result.token, locale })
			router.refresh()
		})
	}

	function reset() {
		setGenerated(null)
		setGreeting('')
		setDisplayNames('')
		setFirstName('')
		setLastName('')
		setPartnerFirst('')
		setPartnerLast('')
		setMaxGuests(1)
	}

	const generatedUrl = generated ? `${siteOrigin}/${generated.locale}/invite/${generated.token}` : null

	async function copyLink() {
		if (!generatedUrl) return
		await navigator.clipboard.writeText(generatedUrl)
		setCopied(true)
		setTimeout(() => setCopied(false), 1500)
	}

	if (generated && generatedUrl) {
		return (
			<div className="space-y-4 p-5 border border-border bg-cream rounded-sm">
				<p className="text-xs uppercase tracking-[0.2em] text-ink-muted font-sans">Ссылка готова</p>
				<p className="break-all text-sm font-mono text-ink p-3 bg-parchment rounded-sm">{generatedUrl}</p>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={copyLink}
						className="px-4 py-2 bg-ink text-cream text-xs uppercase tracking-[0.18em] font-sans hover:bg-ink-light transition-colors"
					>
						{copied ? 'Скопировано' : 'Скопировать'}
					</button>
					<button
						type="button"
						onClick={reset}
						className="px-4 py-2 border border-border text-ink text-xs uppercase tracking-[0.18em] font-sans hover:border-ink transition-colors"
					>
						Создать ещё одно
					</button>
				</div>
			</div>
		)
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Field label="Обращение (greeting)" required>
					<input
						type="text"
						value={greeting}
						onChange={(e) => setGreeting(e.target.value)}
						placeholder="Дорогой Виктор!"
						required
						className={inputCls}
					/>
				</Field>
				<Field label="Имена в списке (display)" required>
					<input
						type="text"
						value={displayNames}
						onChange={(e) => setDisplayNames(e.target.value)}
						placeholder="Виктор Иванов"
						required
						className={inputCls}
					/>
				</Field>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Field label="Имя гостя" required>
					<input
						type="text"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						required
						className={inputCls}
					/>
				</Field>
				<Field label="Фамилия гостя">
					<input
						type="text"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						className={inputCls}
					/>
				</Field>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Field label="Имя партнёра (если пара)">
					<input
						type="text"
						value={partnerFirst}
						onChange={(e) => setPartnerFirst(e.target.value)}
						className={inputCls}
					/>
				</Field>
				<Field label="Фамилия партнёра">
					<input
						type="text"
						value={partnerLast}
						onChange={(e) => setPartnerLast(e.target.value)}
						className={inputCls}
					/>
				</Field>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Field label="Язык">
					<select
						value={locale}
						onChange={(e) => setLocale(e.target.value as 'ru' | 'it')}
						className={inputCls}
					>
						<option value="ru">Русский</option>
						<option value="it">Italiano</option>
					</select>
				</Field>
				<Field label="Кол-во гостей">
					<input
						type="number"
						min={1}
						max={20}
						value={maxGuests}
						onChange={(e) => setMaxGuests(Number(e.target.value))}
						className={inputCls}
					/>
				</Field>
			</div>

			{error && <p className="text-xs text-red-700/80 font-sans">{error}</p>}

			<button
				type="submit"
				disabled={pending}
				className="px-5 py-2.5 bg-ink text-cream uppercase text-xs tracking-[0.18em] font-sans hover:bg-ink-light transition-colors disabled:opacity-50"
			>
				{pending ? 'Создаём…' : 'Создать приглашение'}
			</button>
		</form>
	)
}

const inputCls =
	'w-full bg-cream border border-border focus:border-ink outline-none px-3 py-2 text-sm text-ink font-sans rounded-sm'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
	return (
		<label className="block">
			<span className="block text-[10px] uppercase tracking-[0.18em] text-ink-muted font-sans mb-2">
				{label}
				{required && <span className="text-ink ml-1">*</span>}
			</span>
			{children}
		</label>
	)
}
