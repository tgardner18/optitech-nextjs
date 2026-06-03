// Light-mode wrapper for all /opti-admin/* routes.
// Scopes [data-theme="light"] to the admin so the token system switches to
// light-mode values without touching the root <html> element.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="light" className="min-h-screen bg-canvas text-fg font-sans">
      {children}
    </div>
  )
}
