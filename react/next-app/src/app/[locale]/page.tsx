import type { Metadata } from "next"
import { DynamicHomePage } from "@/router"

// metadata每个页面可能不同，随页面
export const metadata: Metadata = {
  title: "这是首页",
  description: "首页 home",
}

export default function Home() {
  return (
    <>
      {/* 首页入口使用服务器组件是为了使用metadata */}
      <DynamicHomePage />
    </>
  )
}
