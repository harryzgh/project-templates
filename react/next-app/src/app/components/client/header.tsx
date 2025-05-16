"use client"
import { useTheme, changeThemeAction } from "@/store/action/themeAction"
import { setTheme } from "@/store/slices/themeSlice"
import { STORAGE_CONST, THEME } from "@/utils/const"
import { useAppDispatch } from "@/store/hooks"
import { useEffect } from "react"
import LanguageSwitcher from "./language-switcher"
import { useLocale } from "next-intl"

export default function Header() {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const locale = useLocale()
  useEffect(() => {
    // 初始化theme
    const savedTheme = localStorage.getItem(STORAGE_CONST.theme)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    dispatch(
      setTheme(
        (savedTheme === THEME.dark && THEME.dark) ||
          (savedTheme === THEME.light && THEME.light) ||
          (mediaQuery.matches ? THEME.dark : THEME.light)
      )
    )

    // 平台没设置主题时，设置浏览器背景主题更改监听器（无痕模式不起作用）
    if (!savedTheme) {
      // 设置浏览器背景主题更改监听器
      const handler = (e: MediaQueryListEvent) => {
        dispatch(setTheme(e.matches ? THEME.dark : THEME.light))
      }
      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    }
  }, [dispatch])
  return (
    <header className="flex justify-between h-[65px] items-center border">
      <LanguageSwitcher locale={locale} />
      <div>
        <label htmlFor="dropdown">选择主题：</label>
        <select
          id="dropdown"
          value={theme}
          onChange={(event) => changeThemeAction(event, dispatch)}
        >
          <option value={THEME.light}>浅色主题</option>
          <option value={THEME.dark}>深色主题</option>
        </select>
        <p>你选择了：{theme}</p>
      </div>
    </header>
  )
}
