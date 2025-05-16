import { useAppSelector } from "../hooks"

export const useNum = () => {
  return useAppSelector((state) => state.counterSlice.num)
}
