import { SiteHeader } from "@/components/layout/site-header";
import { AuditLogsTable } from "@/components/audit/audit-logs-table";

export default function AuditLogPage() {
  return (
    <>
      <SiteHeader title="Audit log" />
      <main className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Audit log
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            View system activity to troubleshoot issues and track changes across
            receipts, returns, retailers, and admin actions.
          </p>
        </div>
        <AuditLogsTable />
      </main>
    </>
  );
}
