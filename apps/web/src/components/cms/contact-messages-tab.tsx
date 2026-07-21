"use client";

import { useMemo, useState } from "react";
import { Archive, Download, Loader2, Mail, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetContactMessagesQuery,
  useUpdateContactMessageMutation,
  useDeleteContactMessageMutation,
  type ContactMessage,
  type ContactMessageStatus,
} from "@/redux/api/contact-message-api";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { getApiUrl } from "@/lib/urls";
import { getAccessToken } from "@/lib/access-token";

type ContactMessagesTabProps = { storeId: string };

const statusOptions: ContactMessageStatus[] = ["new", "read", "replied", "closed", "spam"];

const statusVariant: Record<ContactMessageStatus, "warning" | "primary" | "success" | "danger" | "violet"> = {
  new: "warning",
  read: "primary",
  replied: "success",
  closed: "violet",
  spam: "danger",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ContactMessagesTab({ storeId }: ContactMessagesTabProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | "">("");
  const [showArchived, setShowArchived] = useState(false);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useGetContactMessagesQuery({
    storeId,
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
    archived: showArchived ? "true" : "false",
  });
  const [updateMessage] = useUpdateContactMessageMutation();
  const [deleteMessage] = useDeleteContactMessageMutation();

  const messages = data?.data?.messages ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const statusCounts = data?.data?.statusCounts ?? {};

  const openMessage = (message: ContactMessage) => {
    setSelected(message);
    setNotes(message.notes ?? "");
    if (message.status === "new") {
      void updateMessage({ storeId, messageId: message._id, data: { status: "read" } });
    }
  };

  const handleStatusChange = async (messageId: string, status: ContactMessageStatus) => {
    try {
      await updateMessage({ storeId, messageId, data: { status } }).unwrap();
      toast.success(`Marked as ${status}`);
      if (selected?._id === messageId) setSelected((prev) => (prev ? { ...prev, status } : prev));
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    try {
      await updateMessage({ storeId, messageId: selected._id, data: { notes } }).unwrap();
      toast.success("Notes saved");
    } catch {
      toast.error("Failed to save notes");
    }
  };

  const handleArchive = async (messageId: string) => {
    try {
      await updateMessage({ storeId, messageId, data: { archived: true } }).unwrap();
      toast.success("Message archived");
      if (selected?._id === messageId) setSelected(null);
    } catch {
      toast.error("Failed to archive message");
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage({ storeId, messageId }).unwrap();
      toast.success("Message deleted");
      if (selected?._id === messageId) setSelected(null);
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleExport = async () => {
    const apiUrl = getApiUrl();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (showArchived) params.set("archived", "true");

    try {
      const response = await fetch(`${apiUrl}/stores/${storeId}/contact-messages/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${getAccessToken() ?? ""}`,
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `contact-messages-${Date.now()}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Failed to export messages");
    }
  };

  const columns: Column<ContactMessage>[] = useMemo(
    () => [
      {
        key: "customer",
        label: "Customer",
        render: (message) => (
          <div>
            <p className="text-body-strong text-apple-ink">{message.name}</p>
            <p className="text-caption text-apple-ink-muted-48">{message.email}</p>
          </div>
        ),
      },
      {
        key: "subject",
        label: "Subject",
        hideOnMobile: true,
        render: (message) => (
          <p className="max-w-[200px] truncate text-caption text-apple-ink-muted-80">{message.subject || "—"}</p>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (message) => <Badge variant={statusVariant[message.status]}>{message.status}</Badge>,
      },
      {
        key: "date",
        label: "Submitted",
        hideOnTablet: true,
        render: (message) => <span className="text-caption text-apple-ink-muted-48">{formatDate(message.createdAt)}</span>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-5">
        {statusOptions.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter((current) => (current === status ? "" : status))}
            className={`rounded-apple-lg border px-4 py-3 text-left transition-colors ${
              statusFilter === status ? "border-apple-primary bg-apple-primary/5" : "border-apple-hairline bg-apple-canvas"
            }`}
          >
            <p className="text-caption text-apple-ink-muted-48 capitalize">{status}</p>
            <p className="mt-1 text-body-strong text-apple-ink">{statusCounts[status] ?? 0}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search messages…" className="min-w-[220px] flex-1" />
        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-apple-pill border px-4 py-2 text-caption font-medium ${
            showArchived ? "border-apple-primary bg-apple-primary/5 text-apple-primary" : "border-apple-hairline text-apple-ink-muted-48"
          }`}
        >
          <Archive className="h-4 w-4" />
          Archived
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-apple-pill border border-apple-hairline px-4 py-2 text-caption font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
        </div>
      ) : messages.length === 0 ? (
        <EmptyState icon={Mail} title="No messages yet" description="Customer messages from your contact form will appear here." />
      ) : (
        <>
          <DataTable columns={columns} data={messages} keyExtractor={(message) => message._id} onRowClick={openMessage} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Customer message" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-caption text-apple-ink-muted-48">Name</p>
                <p className="text-body-strong text-apple-ink">{selected.name}</p>
              </div>
              <div>
                <p className="text-caption text-apple-ink-muted-48">Email</p>
                <a href={`mailto:${selected.email}`} className="text-body text-apple-primary hover:underline">{selected.email}</a>
              </div>
              {selected.phone && (
                <div>
                  <p className="text-caption text-apple-ink-muted-48">Phone</p>
                  <p className="text-body text-apple-ink">{selected.phone}</p>
                </div>
              )}
              <div>
                <p className="text-caption text-apple-ink-muted-48">Submitted</p>
                <p className="text-body text-apple-ink">{formatDate(selected.createdAt)}</p>
              </div>
            </div>

            {selected.subject && (
              <div>
                <p className="text-caption text-apple-ink-muted-48">Subject</p>
                <p className="text-body text-apple-ink">{selected.subject}</p>
              </div>
            )}

            <div>
              <p className="text-caption text-apple-ink-muted-48">Message</p>
              <p className="mt-1 whitespace-pre-wrap rounded-apple-lg border border-apple-hairline bg-apple-canvas-parchment p-4 text-body text-apple-ink">
                {selected.message}
              </p>
            </div>

            <div>
              <label className="text-caption font-medium text-apple-ink-muted-48">Internal notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-apple-lg border border-apple-hairline bg-apple-canvas px-4 py-3 text-body text-apple-ink focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selected.status}
                onChange={(e) => void handleStatusChange(selected._id, e.target.value as ContactMessageStatus)}
                className="rounded-apple-pill border border-apple-hairline bg-apple-canvas px-4 py-2 text-caption"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void handleSaveNotes()}
                className="rounded-apple-pill bg-apple-primary px-4 py-2 text-caption font-medium text-apple-on-primary"
              >
                Save notes
              </button>
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "Your message")}`}
                className="rounded-apple-pill border border-apple-hairline px-4 py-2 text-caption font-medium text-apple-ink hover:bg-apple-canvas-parchment"
              >
                Reply by email
              </a>
              <button
                type="button"
                onClick={() => void handleArchive(selected._id)}
                className="inline-flex items-center gap-1 rounded-apple-pill border border-apple-hairline px-4 py-2 text-caption font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(selected._id)}
                className="inline-flex items-center gap-1 rounded-apple-pill border border-red-200 px-4 py-2 text-caption font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
