"use server";

import { serverRequest } from "./client";
import type { AdminMetrics, AdminRetailer } from "@/types/admin";

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
