export interface AdminMetrics {
  totalRetailers: number;
  activeRetailers: number;
  totalCustomers: number;
  totalReceipts: number;
  receiptsIssuedToday: number;
  pendingReturns: number;
  approvedReturns: number;
}

export type AdminRetailerAccountStatus = "active" | "disabled";

export interface AdminRetailer {
  id: string;
  businessName: string;
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactName: string | null;
  registeredAt: string;
  accountStatus: AdminRetailerAccountStatus;
  totalReceipts: number;
}
