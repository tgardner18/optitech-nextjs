import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { SearchProvider } from "@/components/search/SearchProvider";
import SiteSearch from "@/components/search/SiteSearch";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { getRequestLocale } from "@/lib/optimizely";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale()

  return (
    <LocaleProvider locale={locale}>
      <SearchProvider>
        <Header />
        <SiteSearch />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTop />
      </SearchProvider>
    </LocaleProvider>
  )
}
