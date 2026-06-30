"use client";

import { AuditCenterPanel } from "@/components/audit/audit-center-panel";
import { useGetAdminAuditLogsQuery } from "@/redux/api/audit-api";

export default function AdminAuditCenterPage() {
  return (
    <AuditCenterPanel
      scope="admin"
      title="Audit Center"
      description="Immutable platform-wide audit trail across every workspace and store."
      useQuery={(filters) => useGetAdminAuditLogsQuery(filters)}
    />
  );
}
