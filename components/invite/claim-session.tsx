'use client'

import { claimInviteSession } from '@/lib/actions/invite'
import { useEffect } from 'react'

/**
 * Тихо устанавливает cookie-сессию для устройства, открывшего ссылку,
 * чтобы при следующем заходе на главную гостя сразу вело на его приглашение.
 * Ничего не рендерит.
 */
export function ClaimSession({ token }: { token: string }) {
	useEffect(() => {
		void claimInviteSession(token)
	}, [token])

	return null
}
