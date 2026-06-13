'use client'

import { verifyGuestByName } from '@/lib/actions/invite'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface VerifyFormProps {
	guestId: string
	needsLastName: boolean
}

export function VerifyForm({ guestId, needsLastName }: VerifyFormProps) {
	const router = useRouter()
	const [first, setFirst] = useState('')
	const [last, setLast] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [pending, startTransition] = useTransition()

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		startTransition(async () => {
			const result = await verifyGuestByName({
				guestId,
				firstName: first,
				lastName: needsLastName ? last : undefined,
			})
			if (result.ok) {
				router.refresh()
			} else {
				setError(result.error)
			}
		})
	}

	return (
		<form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-5 text-left">
			<div>
				<label className="block text-[10px] uppercase tracking-[0.22em] text-ink-muted font-sans mb-2">
					Имя
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

			{needsLastName && (
				<div>
					<label className="block text-[10px] uppercase tracking-[0.22em] text-ink-muted font-sans mb-2">
						Фамилия
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
			)}

			{error && <p className="text-xs text-red-700/80 font-sans">{error}</p>}

			<button
				type="submit"
				disabled={pending || !first || (needsLastName && !last)}
				className="w-full py-3 bg-ink text-cream uppercase text-xs tracking-[0.18em] font-sans hover:bg-ink-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{pending ? 'Проверяем…' : 'Открыть приглашение'}
			</button>
		</form>
	)
}
