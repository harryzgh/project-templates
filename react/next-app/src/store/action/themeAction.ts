/**
 * 处理跟counterSlice.ts全局变量相关的功能
 */
import { useAppSelector } from "../hooks"
import { AppDispatch } from "../index"
import { setTheme } from "../slices/themeSlice"
import { type ChangeEvent } from "react"
import { STORAGE_CONST, THEME } from "@/utils/const"

export function useTheme() {
  return useAppSelector((state) => state.themeSlice.theme)
}

export function changeThemeAction(
  event: ChangeEvent<HTMLSelectElement>,
  dispatch: AppDispatch
) {
  const theme = event.target.value === THEME.dark ? THEME.dark : THEME.light
  localStorage.setItem(STORAGE_CONST.theme, theme)
  dispatch(setTheme(theme))
}
