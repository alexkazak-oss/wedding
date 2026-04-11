'use client'

import { Reveal } from '@/components/ui/reveal'
import { signInWithInviteToken } from '@/lib/actions/auth'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

interface InviteHandlerProps {
	token: string
}

export function InviteHandler({ token }: InviteHandlerProps) {
	const locale = useLocale()
	const t = useTranslations('auth')
	const [status, setStatus] = useState<'loading' | 'sent' | 'error'>('loading')
	const [email, setEmail] = useState('')
	const [errorMsg, setErrorMsg] = useState('')

	useEffect(() => {
		async function processInvite() {
			const result = await signInWithInviteToken(token, locale)

			if (result.error) {
				setStatus('error')
				setErrorMsg(result.error)
				return
			}

			if (result.email) {
				setEmail(result.email)
			}
			setStatus('sent')
		}

		processInvite()
	}, [token, locale])

	if (status === 'loading') {
		return (
			<div className="text-center">
				<div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-ink-muted border-t-transparent" />
			</div>
		)
	}

	if (status === 'error') {
		return (
			<Reveal>
				<div className="text-center space-y-4">
					<div className="text-3xl">⚠</div>
					<p className="text-sm text-ink-muted font-sans">{errorMsg}</p>
				</div>
			</Reveal>
		)
	}

	return (
		<Reveal>
			<div className="text-center space-y-4 max-w-xs">
				<div className="text-3xl">✉</div>
				<h2 className="font-serif text-2xl text-ink">{t('checkEmail')}</h2>
				<p className="text-sm text-ink-muted font-sans">{t('magicLinkSent')}</p>
				{email && (
					<p className="text-xs text-ink-muted/70 font-sans">{email}</p>
				)}
			</div>
		</Reveal>
	)
}
