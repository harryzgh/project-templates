import { defineRouting } from "next-intl/routing"

export const COOKIE_NAME = "USER_LOCALE"
export const locales = ["zh", "en", "es", "fr"]
export const defaultLocale = "zh"
/**
 * 该配置配合中间件，会将语言信息缓存到NEXT_LOCALE中
 */
export const routing = defineRouting({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale,
  // URL前缀策略
  localePrefix: "always", // 'always' | 'as-needed' | 'never'
})
