/** Minimum time the navigation / action progress bar stays visible (ms). */
export const LOADING_MIN_VISIBLE_MS = 300;

/** Delay before showing progress bar to avoid flicker on instant navigations (ms). */
export const LOADING_SHOW_DELAY_MS = 80;

/** Delay before showing route skeletons so fast loads skip the flash (ms). */
export const SKELETON_SHOW_DELAY_MS = 180;

/** How long success/error action toasts remain visible (ms). */
export const ACTION_TOAST_DURATION_MS = 4000;

/** Default loading labels for common button actions. */
export const LOADING_LABELS = {
  login: "Signing in…",
  register: "Creating account…",
  logout: "Signing out…",
  save: "Saving…",
  update: "Updating…",
  delete: "Deleting…",
  create: "Creating…",
  publish: "Publishing…",
  unpublish: "Unpublishing…",
  upload: "Uploading…",
  download: "Downloading…",
  export: "Exporting…",
  import: "Importing…",
  send: "Sending…",
  invite: "Sending invite…",
  checkout: "Processing…",
  payment: "Processing payment…",
  retry: "Retrying…",
  refresh: "Refreshing…",
  sync: "Syncing…",
  submit: "Submitting…",
  loading: "Loading…",
} as const;

export type LoadingLabelKey = keyof typeof LOADING_LABELS;
