import { configureStore } from "@reduxjs/toolkit"
import counterSlice from "./slices/counterSlice"
import themeSlice from "./slices/themeSlice"

export const makeStore = () => {
  return configureStore({
    reducer: {
      counterSlice,
      themeSlice,
      // 添加其他 reducer
    },
  })
}

// 导出类型
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
