import AdminShell from '@/components/admin/AdminShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
