import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  /* config options here */
  // 是否使用react严格模式，默认为true (严格模式会使代码执行两遍)
  reactStrictMode: false,
}
// createNextIntlPlugin 默认路径是 @/i18n/request.ts
// "./src/locales/i18n/request.ts"
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

export default withNextIntl(nextConfig)
