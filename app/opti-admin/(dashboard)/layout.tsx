import AdminShell from '@/components/admin/AdminShell'

// Never statically generate admin pages — they require live Graph data and
// auth cookie checks that are only available at request time.
export const dynamic = 'force-dynamic'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
