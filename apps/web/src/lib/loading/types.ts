export type ActionType =
  | "saving"
  | "creating"
  | "updating"
  | "deleting"
  | "publishing"
  | "uploading"
  | "processing"
  | "generating"
  | "syncing"
  | "importing"
  | "exporting"
  | "downloading"
  | "sending"
  | "loading";

export type ActionStatus = "pending" | "success" | "error";

export type ActionEntry = {
  id: string;
  type: ActionType;
  label: string;
  status: ActionStatus;
  message?: string;
  progress?: number;
  startedAt: number;
  retry?: () => void;
};

export type AsyncActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
