"use client";

import { AuditCenterPanel } from "@/components/audit/audit-center-panel";
import { useGetWorkspaceAuditLogsQuery } from "@/redux/api/audit-api";

export default function WorkspaceActivityPage() {
  return (
    <AuditCenterPanel
      scope="workspace"
      title="Workspace Activity"
      description="Audit trail across all stores in your workspace."
      useQuery={(filters) => useGetWorkspaceAuditLogsQuery(filters)}
    />
  );
}
