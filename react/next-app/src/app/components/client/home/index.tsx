"use client"
import { useAppDispatch } from "@/store/hooks"
import { useRouter } from "next/navigation"
import { useNum } from "@/store/action/counterAction"
import { increment, decrement } from "@/store/slices/counterSlice"
import { useTranslations, useLocale } from "next-intl"

// import TradingViewWidget from "../../kline/TradingViewWidget"
export default function HomePage() {
  const num = useNum()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()

  return (
    <main className="h-[200px] border">
      <h1>Counter: {num}</h1>
      <h2>{t("hello")}</h2>
      <button
        className="border cursor-pointer rounded-2xl pl-[10px] pr-[10px]"
        onClick={() => dispatch(increment())}
      >
        Increment
      </button>
      <button
        className="border cursor-pointer rounded-2xl ml-[10px] pl-[10px] pr-[10px]"
        onClick={() => dispatch(decrement())}
      >
        Decrement
      </button>
      <button
        className="border cursor-pointer rounded-2xl ml-[10px] pl-[10px] pr-[10px]"
        type="button"
        onClick={() => router.push(`/${locale}/about`)}
      >
        goto about page
      </button>
    </main>
  )
}
