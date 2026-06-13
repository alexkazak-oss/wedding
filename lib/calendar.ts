export interface IcsEvent {
	title: string
	description: string
	location: string
	startDate: Date
	endDate: Date
	uidSeed?: string
}

function formatIcsDate(d: Date) {
	return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function escapeIcs(text: string) {
	return text
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\r?\n/g, '\\n')
}

export function buildIcsContent(event: IcsEvent): string {
	const dtStart = formatIcsDate(event.startDate)
	const dtEnd = formatIcsDate(event.endDate)
	const dtStamp = formatIcsDate(new Date())
	const uid = `${event.uidSeed ?? dtStart}-wedding@kazak-av.site`

	return [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//kazak-av.site//Wedding//RU',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${dtStamp}`,
		`DTSTART:${dtStart}`,
		`DTEND:${dtEnd}`,
		`SUMMARY:${escapeIcs(event.title)}`,
		`DESCRIPTION:${escapeIcs(event.description)}`,
		`LOCATION:${escapeIcs(event.location)}`,
		'END:VEVENT',
		'END:VCALENDAR',
	].join('\r\n')
}

export function formatGoogleCalendarDate(iso: string) {
	return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}
