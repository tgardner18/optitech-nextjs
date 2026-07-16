import Header from "@/components/layout/Header"
import SplitHeader from "@/components/layout/SplitHeader"
import SidebarNav from "@/components/layout/SidebarNav"
import Footer from "@/components/layout/Footer"
import ScrollToTop from "@/components/ui/ScrollToTop"
import { SearchProvider } from "@/components/search/SearchProvider"
import SiteSearch from "@/components/search/SiteSearch"
import { LocaleProvider } from "@/lib/i18n/LocaleProvider"
import { getRequestLocale, getRequestDomain, getSiteSettings } from "@/lib/optimizely"
import { resolveNavbarStyle } from "@/lib/theme-axes"

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale       = await getRequestLocale()
  const domain       = await getRequestDomain()
  const settings     = await getSiteSettings(domain, locale)
  const navbarStyle  = resolveNavbarStyle(settings?.navbarStyle)

  if (navbarStyle === 'sidebar') {
    return (
      <LocaleProvider locale={locale}>
        <SearchProvider>
          <SidebarNav />
          <SiteSearch />
          {/* Content shifts right of the fixed rail. The margin is driven by
              --ot-sidebar-width (emitted by buildThemeCSS, 0px when not sidebar).
              On mobile the rail is hidden, so no margin applies below lg. */}
          <div className="ot-sidebar-content flex flex-col min-h-dvh" data-nav="sidebar">
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            <ScrollToTop />
          </div>
        </SearchProvider>
      </LocaleProvider>
    )
  }

  return (
    <LocaleProvider locale={locale}>
      <SearchProvider>
        {navbarStyle === 'split-bar' ? <SplitHeader /> : <Header />}
        <SiteSearch />
        <main id="main-content" className="flex-1" data-nav={navbarStyle}>{children}</main>
        <Footer />
        <ScrollToTop />
      </SearchProvider>
    </LocaleProvider>
  )
}
