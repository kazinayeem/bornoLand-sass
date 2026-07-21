import { getApiUrl } from "@/lib/urls";
import { getAccessToken } from "@/lib/access-token";

function customerToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customer_token");
}

async function fetchInvoicePdf(url: string, token: string | null) {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message || "Failed to load invoice");
  }
  return res.blob();
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadStoreOrderInvoice(storeId: string, orderId: string, orderNumber: string) {
  const blob = await fetchInvoicePdf(
    `${getApiUrl()}/stores/${storeId}/orders/${orderId}/invoice.pdf`,
    getAccessToken(),
  );
  triggerDownload(blob, `invoice-${orderNumber}.pdf`);
}

export async function viewStoreOrderInvoice(storeId: string, orderId: string) {
  const blob = await fetchInvoicePdf(
    `${getApiUrl()}/stores/${storeId}/orders/${orderId}/invoice.pdf`,
    getAccessToken(),
  );
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function printStoreOrderInvoice(storeId: string, orderId: string) {
  const blob = await fetchInvoicePdf(
    `${getApiUrl()}/stores/${storeId}/orders/${orderId}/invoice.pdf`,
    getAccessToken(),
  );
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (win) {
    win.addEventListener("load", () => {
      win.focus();
      win.print();
    });
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function emailStoreOrderInvoice(storeId: string, orderId: string, email?: string) {
  const token = getAccessToken();
  const res = await fetch(`${getApiUrl()}/stores/${storeId}/orders/${orderId}/invoice/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(email ? { email } : {}),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message || "Failed to email invoice");
  }
  return res.json();
}

export async function downloadCustomerOrderInvoice(orderId: string, orderNumber: string) {
  const blob = await fetchInvoicePdf(`${getApiUrl()}/orders/${orderId}/invoice.pdf`, customerToken());
  triggerDownload(blob, `invoice-${orderNumber}.pdf`);
}

export async function viewCustomerOrderInvoice(orderId: string) {
  const blob = await fetchInvoicePdf(`${getApiUrl()}/orders/${orderId}/invoice.pdf`, customerToken());
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function printCustomerOrderInvoice(orderId: string) {
  const blob = await fetchInvoicePdf(`${getApiUrl()}/orders/${orderId}/invoice.pdf`, customerToken());
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (win) {
    win.addEventListener("load", () => {
      win.focus();
      win.print();
    });
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function shareCustomerOrderInvoice(orderId: string, orderNumber: string) {
  const blob = await fetchInvoicePdf(`${getApiUrl()}/orders/${orderId}/invoice.pdf`, customerToken());
  const file = new File([blob], `invoice-${orderNumber}.pdf`, { type: "application/pdf" });
  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: `Invoice ${orderNumber}`,
      files: [file],
    });
    return;
  }
  triggerDownload(blob, `invoice-${orderNumber}.pdf`);
}
