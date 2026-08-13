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

export interface AdminReturnSummary {
  count: number;
  latestStatus: string;
  latestReturnNumber: string;
}

export interface AdminCustomerListItem {
  identityKey: string;
  encodedKey: string;
  displayName: string | null;
  phone: string | null;
  email: string | null;
  retailerCount: number;
  retailerNames: string[];
  receiptCount: number;
  lastActivityAt: string | null;
  firstSeenAt: string;
}

export interface AdminCustomerIdentity {
  customerId: string;
  retailerId: string;
  retailerName: string;
  retailerIsActive: boolean;
  name: string | null;
  phone: string | null;
  email: string | null;
  joinedAt: string;
}

export interface AdminCustomerReceiptHistoryItem {
  id: string;
  receiptNumber: string;
  date: string;
  total: string;
  currency: string;
  paymentStatus: string;
  status: string;
  paymentMethod: string;
  balanceDue: string;
  retailerId: string;
  retailerName: string;
  storeId: string;
  storeName: string;
  returnSummary: AdminReturnSummary | null;
}

export interface AdminCustomerReturnHistoryItem {
  id: string;
  returnNumber: string;
  status: string;
  reasonCode: string | null;
  reason: string | null;
  refundAmount: string | null;
  createdAt: string;
  receiptId: string;
  receiptNumber: string;
  retailerName: string;
}

export interface AdminCustomerProfile {
  identityKey: string;
  encodedKey: string;
  displayName: string | null;
  phone: string | null;
  email: string | null;
  identities: AdminCustomerIdentity[];
  summary: {
    totalReceipts: number;
    lifetimeSpendByCurrency: Record<string, string>;
    outstandingByCurrency: Record<string, string>;
    returnsCount: number;
    returnsByStatus: Record<string, number>;
  };
  receiptHistory: AdminCustomerReceiptHistoryItem[];
  returnHistory: AdminCustomerReturnHistoryItem[];
}

export interface AdminReceiptListItem {
  id: string;
  receiptNumber: string;
  date: string;
  total: string;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  balanceDue: string;
  retailerId: string;
  retailerName: string;
  storeId: string;
  storeName: string;
  customer: {
    id: string | null;
    name: string | null;
    phone: string | null;
    email: string | null;
    encodedIdentityKey: string | null;
  };
  returnSummary: AdminReturnSummary | null;
}

export interface AdminReceiptDetail {
  id: string;
  receiptNumber: string;
  date: string;
  currency: string;
  paymentMethod: string;
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  total: string;
  amountPaid: string;
  balanceDue: string;
  paymentStatus: string;
  marketingText: string | null;
  qrCodeTokenMasked: string;
  status: string;
  returnDeadline: string | null;
  createdAt: string;
  retailer: {
    id: string;
    name: string;
    logoUrl: string | null;
    isActive: boolean;
  };
  store: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
  };
  customer: {
    id: string | null;
    name: string | null;
    phone: string | null;
    email: string | null;
    encodedIdentityKey: string | null;
  };
  returnPolicy: {
    id: string;
    returnWindow: string;
    customWindowDays: number | null;
    returnCondition: string;
    refundType: string;
  } | null;
  items: Array<{
    id: string;
    name: string;
    detail: string | null;
    quantity: number;
    originalPrice: string;
    unitPrice: string;
    lineTotal: string;
    discountReason: string | null;
  }>;
  payments: Array<{
    id: string;
    amount: string;
    paymentMethod: string;
    reference: string | null;
    note: string | null;
    recordedBy: string | null;
    createdAt: string;
  }>;
  returns: Array<{
    id: string;
    returnNumber: string;
    status: string;
    reasonCode: string | null;
    reason: string | null;
    refundAmount: string | null;
    createdAt: string;
    reviewedAt: string | null;
    resolvedAt: string | null;
    collectedAt: string | null;
    inTransitAt: string | null;
    withRetailerAt: string | null;
  }>;
}

export interface AdminReceiptQr {
  qrCodeToken: string;
  verifyUrl: string;
  receiptId: string;
  receiptNumber: string;
}

export type AdminAuditAction =
  | "receipt.created"
  | "return.requested"
  | "return.approved"
  | "return.rejected"
  | "retailer.updated"
  | "admin.retailer_status_updated"
  | "admin.qr_revealed";

export type AdminAuditEntityType = "receipt" | "return_request" | "retailer";

export type AdminAuditActorType =
  | "admin"
  | "retailer_user"
  | "customer"
  | "system";

export interface AdminAuditLog {
  id: string;
  createdAt: string;
  action: AdminAuditAction | string;
  actorId: string | null;
  actorType: AdminAuditActorType | string;
  actorLabel: string;
  entityType: AdminAuditEntityType | string;
  entityId: string;
  entityLabel: string;
  retailerId: string | null;
  metadata: Record<string, unknown> | null;
}

export type PlatformHealthStatus = "healthy" | "warning" | "down";

export type PlatformHealthServiceName =
  | "api"
  | "database"
  | "receipt_generation"
  | "email"
  | "sms";

export interface PlatformHealthService {
  name: PlatformHealthServiceName | string;
  status: PlatformHealthStatus;
  latencyMs: number | null;
  message: string;
  checkedAt: string;
}

export interface PlatformHealthReport {
  overall: PlatformHealthStatus;
  services: PlatformHealthService[];
}
