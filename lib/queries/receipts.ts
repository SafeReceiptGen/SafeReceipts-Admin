import { queryOptions } from "@tanstack/react-query";
import {
  getAdminReceipt,
  getAdminReceiptQr,
  listAdminReceipts,
} from "@/lib/api/admin";

export function receiptsQueryOptions(params?: {
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
  return queryOptions({
    queryKey: ["admin", "receipts", params ?? {}],
    queryFn: async () => {
      const result = await listAdminReceipts(params);
      if (result.error) {
        throw new Error(result.message);
      }
      return { items: result.data, totalCount: result.totalCount ?? 0 };
    },
  });
}

export function receiptQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["admin", "receipts", id],
    queryFn: async () => {
      const result = await getAdminReceipt(id);
      if (result.error) {
        throw new Error(result.message);
      }
      return result.data;
    },
  });
}

export function receiptQrQueryOptions(id: string, enabled: boolean) {
  return queryOptions({
    queryKey: ["admin", "receipts", id, "qr"],
    queryFn: async () => {
      const result = await getAdminReceiptQr(id);
      if (result.error) {
        throw new Error(result.message);
      }
      return result.data;
    },
    enabled,
  });
}
