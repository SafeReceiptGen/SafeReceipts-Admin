import { AdminShell } from "@/components/layout/admin-shell";
import { requireAdminSession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return <AdminShell session={session}>{children}</AdminShell>;
}
