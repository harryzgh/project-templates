"use client"
import { THEME } from "@/utils/const"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const initialState = {
  theme: THEME.none,
}

export const themeSlice = createSlice({
  name: "themeSlice",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<THEME>) => {
      state.theme = action.payload
    },
  },
})

export const { setTheme } = themeSlice.actions
export default themeSlice.reducer
