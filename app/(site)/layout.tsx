import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SearchProvider } from "@/components/search/SearchProvider";
import SiteSearch from "@/components/search/SiteSearch";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <Header />
      <SiteSearch />
      <main className="flex-1">{children}</main>
      <Footer />
    </SearchProvider>
  )
}
