import ShowcaseNav from './nav'

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <ShowcaseNav />
      <main className="flex-1 divide-y divide-fg/5">
        {children}
      </main>
    </div>
  )
}
