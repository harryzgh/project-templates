"use client"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export default function Button() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  return (
    <div>
      <h1>{t("hello")}</h1>
      <button
        className="border cursor-pointer rounded-2xl ml-[10px] pl-[10px] pr-[10px]"
        type="button"
        onClick={() => router.push(`/${locale}`)}
      >
        goto home page
      </button>
    </div>
  )
}
