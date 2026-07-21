import type { ActionType } from "./types";

const TYPE_LABELS: Record<ActionType, string> = {
  saving: "Saving",
  creating: "Creating",
  updating: "Updating",
  deleting: "Deleting",
  publishing: "Publishing",
  uploading: "Uploading",
  processing: "Processing",
  generating: "Generating",
  syncing: "Syncing",
  importing: "Importing",
  exporting: "Exporting",
  downloading: "Downloading",
  sending: "Sending",
  loading: "Loading",
};

export function getActionLabel(type: ActionType, subject: string): string {
  const verb = TYPE_LABELS[type] ?? "Processing";
  return `${verb} ${subject}…`;
}
