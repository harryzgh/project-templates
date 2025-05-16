import { getRequestConfig } from "next-intl/server"
import { hasLocale } from "next-intl"
import { defineRouting } from "next-intl/routing"
import { locales, defaultLocale } from "./config"

const routing = defineRouting({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale,
  // URL前缀策略
  localePrefix: "as-needed", // 'always' | 'as-needed' | 'never'
})

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    // messages: (await import(`../${locale}.json`)).default,
  }
})
