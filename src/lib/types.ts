export type WorkerRole = 'MISTRI' | 'VELDAR' | 'HELPER' | 'REJA' | 'LABOUR' | 'CARPENTER' | 'PAINTER' | 'OTHER';

export type WorkerGender = 'MALE' | 'FEMALE';

export type AttendanceStatus = 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'OVERTIME';

export type ContractType = 'LUMP_SUM' | 'SQUARE_FEET' | 'DAILY';

export type SiteStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED';

export interface Worker {
  id: string;
  name: string;
  gender: WorkerGender;
  role: WorkerRole;
  defaultRate: number;
  isActive: boolean;
  createdAt: string;
}

export interface SiteWorker {
  id: string;
  siteId: string;
  workerId: string;
  customRate?: number | null;
  joinedAt: string;
  isActive: boolean;
  worker?: Worker;
}

export interface Site {
  id: string;
  name: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  status: SiteStatus;
  ownerName?: string | null;
  ownerPhone?: string | null;
  contractType: ContractType;
  contractAmount: number;
  notes?: string | null;
  createdAt: string;
  siteWorkers?: SiteWorker[];
  pastSiteWorkers?: SiteWorker[];
  _count?: {
    siteWorkers: number;
    attendances: number;
    advances: number;
    ownerPayments: number;
  };
}

export interface Attendance {
  id: string;
  siteId: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  overtimeHours: number;
  notes?: string | null;
  worker?: Worker;
}

export interface Advance {
  id: string;
  siteId: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  reason?: string | null;
  paymentMode: 'CASH' | 'UPI';
  worker?: Worker;
}

export interface OwnerPayment {
  id: string;
  siteId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'CHEQUE' | 'BANK_TRANSFER';
  stage?: string | null;
  notes?: string | null;
  receivedBy?: string | null;
}

export interface SiteExpense {
  id: string;
  siteId: string;
  date: string;
  category: 'MATERIAL' | 'TRANSPORT' | 'TOOLS' | 'TEA_SNACKS' | 'OTHER';
  amount: number;
  description?: string | null;
}

export interface WorkerAdvanceItem {
  id: string;
  date: string;
  amount: number;
  reason?: string | null;
  paymentMode: 'CASH' | 'UPI';
}

// Settlement / Hisab Calculation Row for the Master Chart
export interface WorkerHisabRow {
  workerId: string;
  workerName: string;
  gender: WorkerGender;
  role: WorkerRole;
  dailyRate: number;
  dates: Record<string, { status: AttendanceStatus; overtimeHours: number }>;
  totalDays: number;
  overtimeHoursTotal: number;
  grossAmount: number;
  totalAdvance: number;
  advancesList?: WorkerAdvanceItem[];
  netPayable: number;
}

export interface SiteCalculationSummary {
  site: Site;
  startDate: string;
  endDate: string;
  datesList: string[];
  rows: WorkerHisabRow[];
  totalLaborDays: number;
  totalGrossPayable: number;
  totalAdvancePaid: number;
  totalNetPayable: number;
  totalOtherExpenses: number;
  expensesList: SiteExpense[];
  ownerTotalContract: number;
  ownerTotalPaid: number;
  ownerBalanceDue: number;
  papaNetProfit: number;
}
