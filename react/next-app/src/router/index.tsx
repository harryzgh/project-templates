import dynamic from "next/dynamic"

export const DynamicHeader = dynamic(
  () => import("@/app/components/client/header"),
  {
    loading: () => <p>Loading...</p>,
  }
)
export const DynamicFooter = dynamic(
  () => import("@/app/components/client/footer"),
  {
    loading: () => <p>Loading...</p>,
  }
)
export const DynamicHello = dynamic(
  () => import("@/app/components/client/hello"),
  {
    loading: () => <p>Loading...</p>,
  }
)
export const DynamicHomePage = dynamic(
  () => import("@/app/components/client/home"),
  {
    loading: () => <p>Loading...</p>,
  }
)
export const DynamicRootHtml = dynamic(
  () => import("@/app/components/client/root-html"),
  {
    loading: () => <p>Loading...</p>,
  }
)
// 全站页面路由
export const routers = ["/", "/about"]
