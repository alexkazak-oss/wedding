import { buildIcsContent } from '@/lib/calendar'
import { WEDDING } from '@/lib/constants'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)

	const title = searchParams.get('title') ?? `${WEDDING.bride} & ${WEDDING.groom}`
	const description = searchParams.get('description') ?? `Мы женимся! ${WEDDING.domain}`
	const location = searchParams.get('location') ?? WEDDING.venue
	const start = searchParams.get('start') ?? WEDDING.dateIso
	const end = searchParams.get('end') ?? WEDDING.endDateIso

	const startDate = new Date(start)
	const endDate = new Date(end)

	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		return NextResponse.json({ error: 'Invalid start or end date' }, { status: 400 })
	}

	const ics = buildIcsContent({
		title,
		description,
		location,
		startDate,
		endDate,
		uidSeed: 'wedding-2026-09-08',
	})

	return new NextResponse(ics, {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'attachment; filename="wedding.ics"',
			'Cache-Control': 'public, max-age=3600',
		},
	})
}
