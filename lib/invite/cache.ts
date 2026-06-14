// Единый источник имени тега кэша для приглашения. Используется и при
// чтении (unstable_cache в server action), и при инвалидации (revalidateTag
// в хуках коллекции Invites). Тег привязан к tokenHash — у каждой ссылки свой.
export function inviteTag(tokenHash: string): string {
	return `invite:${tokenHash}`
}
