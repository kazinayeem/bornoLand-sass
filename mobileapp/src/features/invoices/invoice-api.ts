import { apiRequest } from "../../lib/api";
import { config } from "../../config";
import type { Invoice, InvoiceListResponse, InvoiceDetailResponse } from "./invoice-types";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export async function getInvoices(storeId: string): Promise<Invoice[]> {
  const result = await apiRequest<InvoiceListResponse>(`/invoices/stores/${storeId}`);
  return result.data ?? [];
}

export async function getInvoice(invoiceId: string): Promise<Invoice> {
  const result = await apiRequest<InvoiceDetailResponse>(`/invoices/${invoiceId}`);
  if (!result.data) throw new Error("Invoice not found");
  return result.data;
}

export async function getInvoiceByStoreSlug(storeSlug: string, invoiceId: string): Promise<Invoice> {
  const result = await apiRequest<InvoiceDetailResponse>(`/invoices/store/${storeSlug}/${invoiceId}`);
  if (!result.data) throw new Error("Invoice not found");
  return result.data;
}

export async function verifyInvoice(verificationCode: string): Promise<Invoice> {
  const result = await apiRequest<InvoiceDetailResponse>(`/invoices/verify/${verificationCode}`);
  if (!result.data) throw new Error("Invoice verification failed");
  return result.data;
}

export function getInvoicePdfUrl(invoiceId: string): string {
  return `${config.apiUrl}/invoices/${invoiceId}/pdf`;
}

export function getPublicInvoiceUrl(verificationCode?: string): string | null {
  if (verificationCode) return `${config.webUrl}/invoices/verify/${verificationCode}`;
  return null;
}

export async function downloadInvoicePdf(invoiceId: string): Promise<string> {
  const pdfUrl = getInvoicePdfUrl(invoiceId);
  const localPath = `${FileSystem.cacheDirectory}invoice-${invoiceId}.pdf`;

  const download = FileSystem.createDownloadResumable(pdfUrl, localPath);
  const result = await download.downloadAsync();
  if (!result) throw new Error("Download failed");
  return result.uri;
}

export async function sharePdf(fileUri: string, title = "Invoice") {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/pdf",
      dialogTitle: title,
    });
  }
}
