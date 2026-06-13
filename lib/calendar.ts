import { WEDDING } from '@/lib/constants'

function toIcsDate(d: Date) {
	return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function buildIcsContent() {
	const dtStart = toIcsDate(WEDDING.date)
	const dtEnd = toIcsDate(WEDDING.endDate)
	const dtStamp = toIcsDate(new Date())
	const uid = `${dtStart}-${WEDDING.domain}`
	const title = `Свадьба · ${WEDDING.bride} и ${WEDDING.groom}`

	return [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		`PRODID:-//${WEDDING.domain}//Wedding//RU`,
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${dtStamp}`,
		`DTSTART:${dtStart}`,
		`DTEND:${dtEnd}`,
		`SUMMARY:${title}`,
		`LOCATION:${WEDDING.venue}`,
		`DESCRIPTION:Мы женимся! Ждём Вас на нашу свадьбу. ${WEDDING.domain}`,
		'END:VEVENT',
		'END:VCALENDAR',
	].join('\r\n')
}

export function downloadIcs() {
	const blob = new Blob([buildIcsContent()], { type: 'text/calendar;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = 'wedding.ics'
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}
