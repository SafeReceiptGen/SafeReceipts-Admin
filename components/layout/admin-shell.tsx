import { AppSidebar } from "./app-sidebar";
import type { Session } from "@/lib/auth-client";

export function AdminShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
