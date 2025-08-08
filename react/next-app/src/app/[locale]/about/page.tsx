import Button from "./button"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

// metadata每个页面可能不同，随页面
/* export const metadata: Metadata = {
  title: "这是about页",
  description: "首页 about",
} */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageAbout")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function About() {
  const t = await getTranslations("pageAbout")
  return (
    <main className="h-[200px] border">
      这是about页面
      <h1>{t("welcome")}</h1>
      <Button />
    </main>
  )
}
