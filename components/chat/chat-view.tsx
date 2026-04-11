'use client'

import { sendMessage } from '@/lib/actions/chat'
import { Link } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Guest, Message, SenderRole } from '@/types'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

interface ChatViewProps {
	guest: Guest
	initialMessages: Message[]
	senderRole: SenderRole
	backHref?: string
	headerTitle?: string
}

export function ChatView({
	guest,
	initialMessages,
	senderRole,
	backHref,
	headerTitle,
}: ChatViewProps) {
	const t = useTranslations('chat')
	const tCommon = useTranslations('common')
	const [messages, setMessages] = useState<Message[]>(initialMessages)
	const [input, setInput] = useState('')
	const [sending, setSending] = useState(false)
	const bottomRef = useRef<HTMLDivElement>(null)

	// Auto-scroll to bottom
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	// Realtime subscription
	useEffect(() => {
		const supabase = createClient()

		const channel = supabase
			.channel(`chat:${guest.id}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'messages',
					filter: `guest_id=eq.${guest.id}`,
				},
				(payload) => {
					const newMsg = payload.new as Message
					setMessages((prev) => {
						// Avoid duplicates
						if (prev.some((m) => m.id === newMsg.id)) return prev
						return [...prev, newMsg]
					})
				},
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [guest.id])

	async function handleSend(e: React.FormEvent) {
		e.preventDefault()
		if (!input.trim() || sending) return

		setSending(true)
		const content = input.trim()
		setInput('')

		// Optimistic update
		const optimisticMsg: Message = {
			id: `temp-${Date.now()}`,
			event_id: guest.event_id,
			guest_id: guest.id,
			sender_role: senderRole,
			content,
			created_at: new Date().toISOString(),
		}
		setMessages((prev) => [...prev, optimisticMsg])

		await sendMessage({
			guestId: guest.id,
			eventId: guest.event_id,
			content,
			senderRole,
		})

		setSending(false)
	}

	return (
		<div className="flex flex-col h-[100dvh] sm:h-[80vh]">
			{/* Header */}
			<div className="px-6 sm:px-8 pt-6 pb-4 border-b border-border-light flex-shrink-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{backHref && (
							<Link href={backHref} className="text-ink-muted hover:text-ink transition-colors">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
									<path d="M19 12H5M12 19l-7-7 7-7" />
								</svg>
							</Link>
						)}
						<div>
							<h2 className="font-serif text-lg text-ink">
								{headerTitle || t('title')}
							</h2>
							{senderRole === 'admin' && (
								<p className="text-xs text-ink-muted font-sans">{guest.name}</p>
							)}
						</div>
					</div>

					{!backHref && (
						<Link
							href="/cabinet"
							className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink transition-colors font-sans"
						>
							{tCommon('back')}
						</Link>
					)}
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 space-y-3">
				{messages.length === 0 && (
					<div className="flex items-center justify-center h-full">
						<p className="text-sm text-ink-muted/50 font-sans">{t('noMessages')}</p>
					</div>
				)}

				{messages.map((msg) => (
					<div
						key={msg.id}
						className={cn(
							'max-w-[80%]',
							msg.sender_role === senderRole ? 'ml-auto' : 'mr-auto',
						)}
					>
						<div
							className={cn(
								'px-4 py-2.5 rounded-2xl text-sm font-sans',
								msg.sender_role === senderRole
									? 'bg-ink text-cream rounded-br-sm'
									: 'bg-parchment text-ink border border-border-light rounded-bl-sm',
							)}
						>
							{msg.content}
						</div>
						<p
							className={cn(
								'text-[10px] text-ink-muted/50 mt-1 font-sans',
								msg.sender_role === senderRole ? 'text-right' : 'text-left',
							)}
						>
							{new Date(msg.created_at).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</p>
					</div>
				))}
				<div ref={bottomRef} />
			</div>

			{/* Input */}
			<div className="px-6 sm:px-8 py-4 border-t border-border-light flex-shrink-0">
				<form onSubmit={handleSend} className="flex gap-3">
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={t('placeholder')}
						className="flex-1 bg-parchment border border-border-light rounded-full px-4 py-2.5 text-sm font-sans text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-ink-muted transition-colors"
					/>
					<button
						type="submit"
						disabled={!input.trim() || sending}
						className="w-10 h-10 rounded-full bg-ink text-cream flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
						</svg>
					</button>
				</form>
			</div>
		</div>
	)
}
