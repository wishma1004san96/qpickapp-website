import type { Locale } from './config'
import en from '@/messages/en.json'
import si from '@/messages/si.json'
import ta from '@/messages/ta.json'

export type Messages = typeof en

const catalog: Record<Locale, Messages> = {
  en,
  si: si as Messages,
  ta: ta as Messages,
}

export function getMessages(locale: Locale): Messages {
  return catalog[locale] ?? catalog.en
}
