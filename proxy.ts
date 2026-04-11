import createMiddleware from 'next-intl/middleware'
import {routing} from './lib/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export function proxy(request: import('next/server').NextRequest) {
	return intlMiddleware(request)
}

export const config = {
	matcher: ['/', '/(ru|it)/:path*'],
}
