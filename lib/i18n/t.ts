import type { Messages } from "@/lib/i18n/get-messages";

export type TranslateVars = Record<string, string | number>;

export type Translator = (key: string, vars?: TranslateVars) => string;

function getByPath(messages: Messages, key: string): unknown {
  const parts = key.split(".");
  let current: unknown = messages;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    if (Array.isArray(current)) {
      const index = Number(part);
      if (!Number.isInteger(index)) return undefined;
      current = current[index];
      continue;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value == null ? match : String(value);
  });
}

/** Walk dotted keys on messages and replace `{var}` placeholders. */
export function createTranslator(messages: Messages): Translator {
  return (key, vars) => {
    const value = getByPath(messages, key);
    if (typeof value !== "string") return key;
    return interpolate(value, vars);
  };
}
