import type { Locale } from "./config";
import en from "@/messages/en.json";
import si from "@/messages/si.json";
import ta from "@/messages/ta.json";
import de from "@/messages/de.json";
import fr from "@/messages/fr.json";
import es from "@/messages/es.json";
import it from "@/messages/it.json";
import ru from "@/messages/ru.json";
import zh from "@/messages/zh.json";
import ja from "@/messages/ja.json";
import ko from "@/messages/ko.json";
import nl from "@/messages/nl.json";
import pt from "@/messages/pt.json";
import pl from "@/messages/pl.json";
import sv from "@/messages/sv.json";
import da from "@/messages/da.json";
import no from "@/messages/no.json";
import fi from "@/messages/fi.json";
import ar from "@/messages/ar.json";
import hi from "@/messages/hi.json";

export type Messages = typeof en;

/** All 20 locale catalogs — statically imported and available synchronously on the client. */
export const messagesCatalog: Record<Locale, Messages> = {
  en,
  si: si as Messages,
  ta: ta as Messages,
  de: de as Messages,
  fr: fr as Messages,
  es: es as Messages,
  it: it as Messages,
  ru: ru as Messages,
  zh: zh as Messages,
  ja: ja as Messages,
  ko: ko as Messages,
  nl: nl as Messages,
  pt: pt as Messages,
  pl: pl as Messages,
  sv: sv as Messages,
  da: da as Messages,
  no: no as Messages,
  fi: fi as Messages,
  ar: ar as Messages,
  hi: hi as Messages,
};

export function getMessages(locale: Locale): Messages {
  return messagesCatalog[locale] ?? messagesCatalog.en;
}
