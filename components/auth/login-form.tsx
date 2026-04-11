'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Reveal } from '@/components/ui/reveal'
import { signInWithMagicLink } from '@/lib/actions/auth'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

export function LoginForm() {
	const t = useTranslations('auth')
	const locale = useLocale()
	const [sent, setSent] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setLoading(true)
		setError(null)

		const formData = new FormData(e.currentTarget)
		formData.set('locale', locale)

		const result = await signInWithMagicLink(formData)

		if (result.error) {
			setError(result.error)
			setLoading(false)
			return
		}

		setSent(true)
		setLoading(false)
	}

	if (sent) {
		return (
			<Reveal>
				<div className="text-center space-y-4 max-w-xs">
					<div className="text-3xl">✉</div>
					<h2 className="font-serif text-2xl text-ink">{t('checkEmail')}</h2>
					<p className="text-sm text-ink-muted font-sans">{t('magicLinkSent')}</p>
				</div>
			</Reveal>
		)
	}

	return (
		<Reveal>
			<div className="w-full max-w-xs space-y-8">
				<div className="text-center">
					<h2 className="font-serif text-2xl text-ink">{t('login')}</h2>
					<p className="mt-2 text-sm text-ink-muted font-sans">{t('loginDescription')}</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<Input
						id="email"
						name="email"
						type="email"
						label={t('email')}
						required
						autoComplete="email"
					/>

					{error && (
						<p className="text-xs text-rose font-sans text-center">{error}</p>
					)}

					<Button type="submit" loading={loading} className="w-full" size="lg">
						{t('sendLink')}
					</Button>
				</form>
			</div>
		</Reveal>
	)
}
