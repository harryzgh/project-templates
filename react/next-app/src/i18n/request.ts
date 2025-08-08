import { getRequestConfig } from "next-intl/server"
import { hasLocale } from "next-intl"
import { locales, defaultLocale } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const userLocale = await requestLocale
  const locale = hasLocale(locales, userLocale) ? userLocale : defaultLocale
  // 组件中可以通过 import { getLocale, getMessages } from "next-intl/server"
  // 获取下面配置的locale和messages
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
