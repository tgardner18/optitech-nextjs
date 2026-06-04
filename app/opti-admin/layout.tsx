// Applies the .opti-admin token scope to all /opti-admin/* routes.
// This overrides the marketing site tokens with a neutral admin palette
// that is completely decoupled from whatever brand color the CMS theme uses.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="opti-admin min-h-screen bg-canvas text-fg font-sans">
      {children}
    </div>
  )
}
