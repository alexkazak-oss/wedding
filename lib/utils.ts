import type {Locale} from '@/types'
import {clsx, type ClassValue} from 'clsx'
import {twMerge} from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function localized<T extends Record<string, unknown>>(
	obj: T,
	field: string,
	locale: Locale,
): string {
	const key = `${field}_${locale}` as keyof T
	return (obj[key] as string) ?? ''
}
