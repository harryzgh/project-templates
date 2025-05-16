"use client"
import { useRouter, usePathname } from "next/navigation"

import { ChangeEvent } from "react"

export default function LanguageSwitcher({
  locale,
  className,
}: {
  locale: string
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value
    // 保留路径，只替换语言部分
    /* const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath) */
    router.replace(
      // 保留其他路径部分
      pathname.replace(`/${locale}`, `/${newLocale}`)
    )
  }

  return (
    <select onChange={onSelectChange} value={locale} className={className}>
      <option value="en">English</option>
      <option value="zh">中文</option>
      <option value="es">日本语</option>
      <option value="fr">西班牙语</option>
    </select>
  )
}
