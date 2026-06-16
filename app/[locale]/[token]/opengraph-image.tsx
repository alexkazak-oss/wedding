import { openInviteByToken } from '@/lib/actions/invite'
import { loadGoogleFont } from '@/lib/og/font'
import type { Locale } from '@/types'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'

export const alt = 'Свадебное приглашение · Invito di nozze'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Превью-картинка ссылки (Open Graph / Telegram / WhatsApp и т.п.).
// Язык берётся из поля locale приглашения (то, что выбрано при заполнении
// в админке), а не из URL — превью отражает язык конкретного гостя.
export default async function Image({
	params,
}: {
	params: Promise<{ locale: string; token: string }>
}) {
	const { locale, token } = await params

	const result = await openInviteByToken(token)
	const lng: Locale =
		result.state === 'ok' ? result.invite.locale : locale === 'it' ? 'it' : 'ru'

	const t = await getTranslations({ locale: lng, namespace: 'cover' })
	const name1 = t('name1')
	const name2 = t('name2')
	const date = t('dateShort')
	const headline = t('headline')

	// Логотип — тот же icon.png, что и иконка приложения.
	const iconData = await readFile(join(process.cwd(), 'app/icon.png'))
	const iconSrc = `data:image/png;base64,${iconData.toString('base64')}`

	// Подмножество кириллицы/латиницы под фактический текст картинки.
	const glyphs = `${name1}${name2}${date}${headline}& `
	const [serif600, serif400] = await Promise.all([
		loadGoogleFont('Cormorant Garamond', 600, glyphs),
		loadGoogleFont('Cormorant Garamond', 400, glyphs),
	])

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					padding: 40,
					backgroundColor: '#F5F1EA',
					fontFamily: 'Cormorant',
				}}
			>
				<div
					style={{
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						border: '2px solid #D8D1C5',
						borderRadius: 10,
					}}
				>
					<img src={iconSrc} width={190} height={170} alt="" />
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 30,
							marginTop: 28,
							fontSize: 88,
							fontWeight: 600,
							color: '#16130F',
						}}
					>
						<span>{name1}</span>
						<span style={{ color: '#A89D91', fontSize: 64 }}>&</span>
						<span>{name2}</span>
					</div>
					<div
						style={{
							marginTop: 6,
							fontSize: 42,
							fontWeight: 400,
							letterSpacing: 10,
							color: '#6F6258',
						}}
					>
						{date}
					</div>
					<div style={{ width: 90, height: 1, backgroundColor: '#D8D1C5', margin: '30px 0' }} />
					<div style={{ fontSize: 44, fontWeight: 400, color: '#4A423B' }}>{headline}</div>
				</div>
			</div>
		),
		{
			...size,
			fonts: [
				{ name: 'Cormorant', data: serif600, weight: 600, style: 'normal' },
				{ name: 'Cormorant', data: serif400, weight: 400, style: 'normal' },
			],
		},
	)
}
