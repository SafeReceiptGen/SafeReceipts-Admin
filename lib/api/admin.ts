"use server";

import { serverRequest } from "./client";
import type {
  AdminCustomerListItem,
  AdminCustomerProfile,
  AdminMetrics,
  AdminReceiptDetail,
  AdminReceiptListItem,
  AdminReceiptQr,
  AdminRetailer,
} from "@/types/admin";

export async function getAdminMetrics() {
  return serverRequest<AdminMetrics>("/admin/metrics");
}

export async function listAdminRetailers(params?: {
  q?: string;
  page?: number;
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return serverRequest<AdminRetailer[]>(
    `/admin/retailers${qs ? `?${qs}` : ""}`,
  );
}

export async function getAdminRetailer(id: string) {
  return serverRequest<AdminRetailer>(`/admin/retailers/${id}`);
}

export async function updateAdminRetailerStatus(
  id: string,
  isActive: boolean,
) {
  return serverRequest<AdminRetailer>(`/admin/retailers/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export async function listAdminCustomers(params?: {
  q?: string;
  page?: number;
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return serverRequest<AdminCustomerListItem[]>(
    `/admin/customers${qs ? `?${qs}` : ""}`,
  );
}

export async function getAdminCustomer(encodedKey: string) {
  return serverRequest<AdminCustomerProfile>(
    `/admin/customers/${encodeURIComponent(encodedKey)}`,
  );
}

export async function listAdminReceipts(params?: {
  q?: string;
  retailerId?: string;
  storeId?: string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  returnStatus?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.retailerId) search.set("retailerId", params.retailerId);
  if (params?.storeId) search.set("storeId", params.storeId);
  if (params?.status) search.set("status", params.status);
  if (params?.paymentMethod) search.set("paymentMethod", params.paymentMethod);
  if (params?.paymentStatus) search.set("paymentStatus", params.paymentStatus);
  if (params?.returnStatus) search.set("returnStatus", params.returnStatus);
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return serverRequest<AdminReceiptListItem[]>(
    `/admin/receipts${qs ? `?${qs}` : ""}`,
  );
}

export async function getAdminReceipt(id: string) {
  return serverRequest<AdminReceiptDetail>(`/admin/receipts/${id}`);
}

export async function getAdminReceiptQr(id: string) {
  return serverRequest<AdminReceiptQr>(`/admin/receipts/${id}/qr`);
}
