// Загрузка шрифта для рендера OG-картинки через next/og (satori).
//
// satori не умеет woff2 и не имеет встроенной поддержки кириллицы, поэтому
// тянем нужное подмножество глифов из Google Fonts. Старый User-Agent (без
// поддержки woff2) заставляет Google отдать ссылки на .ttf — именно их
// понимает satori.
export async function loadGoogleFont(
	family: string,
	weight: number,
	text: string,
): Promise<ArrayBuffer> {
	const url =
		`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}` +
		`&text=${encodeURIComponent(text)}`

	const css = await fetch(url, {
		headers: {
			// Старый UA без поддержки woff2 → Google присылает woff/ttf,
			// которые satori умеет читать (woff2 — нет).
			'User-Agent':
				'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.0.0 Safari/537.36',
		},
	}).then((r) => r.text())

	const src = css.match(/src:\s*url\((https:\/\/[^)]+)\)/)?.[1]
	if (!src) throw new Error(`Не нашли шрифт ${family}:${weight}`)

	return fetch(src).then((r) => r.arrayBuffer())
}
