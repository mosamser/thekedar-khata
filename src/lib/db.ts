import { readStore, writeStore } from './store';
import {
  Site,
  Worker,
  SiteWorker,
  Attendance,
  Advance,
  OwnerPayment,
  SiteExpense,
  WorkerHisabRow,
  SiteCalculationSummary,
  AttendanceStatus,
  WorkerGender,
  WorkerRole
} from './types';
import { sortWorkersByHierarchy, getRoleHierarchyPriority } from './utils';

export const db = {
  // Sites
  async getSites(): Promise<Site[]> {
    const store = readStore();
    return store.sites.map(s => {
      const activeWorkersCount = store.siteWorkers.filter(sw => sw.siteId === s.id && sw.isActive).length;
      const attCount = store.attendances.filter(a => a.siteId === s.id).length;
      const advCount = store.advances.filter(a => a.siteId === s.id).length;
      const opCount = store.ownerPayments.filter(o => o.siteId === s.id).length;
      return {
        ...s,
        _count: {
          siteWorkers: activeWorkersCount,
          attendances: attCount,
          advances: advCount,
          ownerPayments: opCount,
        }
      };
    });
  },

  async getSiteById(id: string): Promise<Site | null> {
    const store = readStore();
    const site = store.sites.find(s => s.id === id);
    if (!site) return null;

    // Attach currently active siteWorkers sorted by Indian construction hierarchy
    const siteWorkers = store.siteWorkers
      .filter(sw => sw.siteId === id && sw.isActive)
      .map(sw => {
        const worker = store.workers.find(w => w.id === sw.workerId);
        return {
          ...sw,
          worker: worker || {
            id: sw.workerId,
            name: 'मजदूर',
            role: 'LABOUR' as WorkerRole,
            gender: 'MALE' as WorkerGender,
            defaultRate: sw.customRate || 500,
            isActive: false,
            createdAt: ''
          },
        };
      })
      .sort((a, b) => {
        const pA = getRoleHierarchyPriority(a.worker?.role || '', a.worker?.gender);
        const pB = getRoleHierarchyPriority(b.worker?.role || '', b.worker?.gender);
        if (pA !== pB) return pA - pB;
        return (a.worker?.name || '').localeCompare(b.worker?.name || '');
      });

    // Also attach past / inactive workers who previously worked on this site
    const pastSiteWorkers = store.siteWorkers
      .filter(sw => sw.siteId === id && !sw.isActive)
      .map(sw => {
        const worker = store.workers.find(w => w.id === sw.workerId);
        return {
          ...sw,
          worker: worker || {
            id: sw.workerId,
            name: 'मजदूर',
            role: 'LABOUR' as WorkerRole,
            gender: 'MALE' as WorkerGender,
            defaultRate: sw.customRate || 500,
            isActive: false,
            createdAt: ''
          },
        };
      })
      .sort((a, b) => (a.worker?.name || '').localeCompare(b.worker?.name || ''));

    return {
      ...site,
      siteWorkers,
      pastSiteWorkers,
    };
  },

  async createSite(data: {
    name: string;
    location?: string;
    startDate: string;
    endDate?: string | null;
    ownerName?: string;
    ownerPhone?: string;
    contractType?: 'LUMP_SUM' | 'SQUARE_FEET' | 'DAILY';
    contractAmount?: number;
    notes?: string;
    assignedWorkerIds?: { workerId: string; customRate?: number }[];
  }): Promise<Site> {
    const store = readStore();
    const newSiteId = `site-${Date.now()}`;
    const newSite: Site = {
      id: newSiteId,
      name: data.name,
      location: data.location || '',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || null,
      status: 'ACTIVE',
      ownerName: data.ownerName || '',
      ownerPhone: data.ownerPhone || '',
      contractType: data.contractType || 'LUMP_SUM',
      contractAmount: Number(data.contractAmount) || 0,
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    store.sites.unshift(newSite);

    // Assign workers to the new site
    if (data.assignedWorkerIds && data.assignedWorkerIds.length > 0) {
      for (const item of data.assignedWorkerIds) {
        store.siteWorkers.push({
          id: `sw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          siteId: newSiteId,
          workerId: item.workerId,
          customRate: item.customRate !== undefined ? item.customRate : null,
          joinedAt: new Date().toISOString(),
          isActive: true
        });
      }
    }

    writeStore(store);
    return newSite;
  },

  async updateSite(id: string, data: Partial<Site>): Promise<Site | null> {
    const store = readStore();
    const index = store.sites.findIndex(s => s.id === id);
    if (index === -1) return null;

    store.sites[index] = {
      ...store.sites[index],
      ...data,
      contractAmount: data.contractAmount !== undefined ? Number(data.contractAmount) : store.sites[index].contractAmount,
    };
    writeStore(store);
    return store.sites[index];
  },

  async deleteSite(id: string): Promise<boolean> {
    const store = readStore();
    store.sites = store.sites.filter(s => s.id !== id);
    store.siteWorkers = store.siteWorkers.filter(sw => sw.siteId !== id);
    store.attendances = store.attendances.filter(a => a.siteId !== id);
    store.advances = store.advances.filter(a => a.siteId !== id);
    store.ownerPayments = store.ownerPayments.filter(o => o.siteId !== id);
    writeStore(store);
    return true;
  },

  // Workers
  async getWorkers(includeInactive = false): Promise<Worker[]> {
    const store = readStore();
    const list = includeInactive
      ? store.workers
      : store.workers.filter(w => w.isActive !== false);
    return sortWorkersByHierarchy(list);
  },

  async createWorker(data: {
    name: string;
    gender?: WorkerGender;
    role: WorkerRole;
    defaultRate: number;
  }): Promise<Worker> {
    const store = readStore();
    const gender = data.gender || (data.role === 'REJA' ? 'FEMALE' : 'MALE');
    const newWorker: Worker = {
      id: `w-${Date.now()}`,
      name: data.name,
      gender,
      role: data.role || (gender === 'FEMALE' ? 'REJA' : 'LABOUR'),
      defaultRate: Number(data.defaultRate) || 500,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    store.workers.unshift(newWorker);
    writeStore(store);
    return newWorker;
  },

  async updateWorker(id: string, data: Partial<Worker>): Promise<Worker | null> {
    const store = readStore();
    const index = store.workers.findIndex(w => w.id === id);
    if (index === -1) return null;

    store.workers[index] = {
      ...store.workers[index],
      ...data,
      defaultRate: data.defaultRate !== undefined ? Number(data.defaultRate) : store.workers[index].defaultRate,
    };
    writeStore(store);
    return store.workers[index];
  },

  async deleteWorker(id: string): Promise<boolean> {
    const store = readStore();
    const worker = store.workers.find(w => w.id === id);
    if (!worker) return false;

    // Check if worker has ANY past history (attendance, advances, or site assignments)
    const hasHistory =
      (store.attendances && store.attendances.some(a => a.workerId === id)) ||
      (store.advances && store.advances.some(adv => adv.workerId === id)) ||
      (store.siteWorkers && store.siteWorkers.some(sw => sw.workerId === id));

    if (hasHistory) {
      // SOFT DELETE: Mark as inactive in directory.
      // CRITICAL: DO NOT DELETE from store.workers and DO NOT DELETE from store.siteWorkers!
      // This ensures that all past sites, attendance records, wages, and master hisab remain 100% intact!
      worker.isActive = false;
    } else {
      // Safe to purge completely only if worker was never used anywhere
      store.workers = store.workers.filter(w => w.id !== id);
      store.siteWorkers = store.siteWorkers.filter(sw => sw.workerId !== id);
    }

    writeStore(store);
    return true;
  },

  // Assign worker to site
  async addWorkerToSite(siteId: string, workerId: string, customRate?: number): Promise<SiteWorker> {
    const store = readStore();
    const existing = store.siteWorkers.find(sw => sw.siteId === siteId && sw.workerId === workerId);
    if (existing) {
      existing.isActive = true;
      if (customRate !== undefined) existing.customRate = customRate;
      writeStore(store);
      return existing;
    }
    const newSw: SiteWorker = {
      id: `sw-${Date.now()}`,
      siteId,
      workerId,
      customRate: customRate !== undefined ? customRate : null,
      joinedAt: new Date().toISOString(),
      isActive: true,
    };
    store.siteWorkers.push(newSw);
    writeStore(store);
    return newSw;
  },

  async removeWorkerFromSite(siteId: string, workerId: string): Promise<boolean> {
    const store = readStore();
    const sw = store.siteWorkers.find(s => s.siteId === siteId && s.workerId === workerId);
    if (sw) {
      sw.isActive = false;
      writeStore(store);
      return true;
    }
    return false;
  },

  // Attendance
  async getAttendanceForDate(siteId: string, date: string): Promise<{ attendances: Attendance[]; advances: Advance[] }> {
    const store = readStore();
    const attendances = store.attendances.filter(a => a.siteId === siteId && a.date === date);
    const advances = store.advances.filter(adv => adv.siteId === siteId && adv.date === date);
    return { attendances, advances };
  },

  async saveBatchAttendance(
    siteId: string,
    date: string,
    records: { workerId: string; status: AttendanceStatus; overtimeHours?: number; advanceAmount?: number; advanceReason?: string }[]
  ): Promise<boolean> {
    const store = readStore();

    for (const item of records) {
      // Upsert attendance
      const existingIdx = store.attendances.findIndex(
        a => a.siteId === siteId && a.workerId === item.workerId && a.date === date
      );

      if (existingIdx >= 0) {
        store.attendances[existingIdx].status = item.status;
        store.attendances[existingIdx].overtimeHours = item.overtimeHours || 0;
      } else {
        store.attendances.push({
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          siteId,
          workerId: item.workerId,
          date,
          status: item.status,
          overtimeHours: item.overtimeHours || 0,
        });
      }

      // Handle daily advance / kharcha for this date
      const existingAdvIdx = store.advances.findIndex(
        adv => adv.siteId === siteId && adv.workerId === item.workerId && adv.date === date
      );

      if (item.advanceAmount && item.advanceAmount > 0) {
        if (existingAdvIdx >= 0) {
          store.advances[existingAdvIdx].amount = Number(item.advanceAmount);
          if (item.advanceReason) store.advances[existingAdvIdx].reason = item.advanceReason;
        } else {
          store.advances.push({
            id: `adv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            siteId,
            workerId: item.workerId,
            date,
            amount: Number(item.advanceAmount),
            reason: item.advanceReason || "दैनिक खर्चा / पेशगी",
            paymentMode: "CASH"
          });
        }
      } else if (item.advanceAmount === 0 && existingAdvIdx >= 0) {
        // If user cleared the advance amount to 0, remove the erroneous record
        store.advances.splice(existingAdvIdx, 1);
      }
    }

    writeStore(store);
    return true;
  },

  // Advances / Kharcha
  async getAdvances(siteId: string, workerId?: string): Promise<Advance[]> {
    const store = readStore();
    return store.advances
      .filter(a => a.siteId === siteId && (!workerId || a.workerId === workerId))
      .map(a => ({
        ...a,
        worker: store.workers.find(w => w.id === a.workerId)
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addAdvance(data: { siteId: string; workerId: string; date: string; amount: number; reason?: string; paymentMode?: 'CASH' | 'UPI' }): Promise<Advance> {
    const store = readStore();
    const newAdv: Advance = {
      id: `adv-${Date.now()}`,
      siteId: data.siteId,
      workerId: data.workerId,
      date: data.date,
      amount: Number(data.amount),
      reason: data.reason || "खर्चा",
      paymentMode: data.paymentMode || "CASH",
    };
    store.advances.push(newAdv);
    writeStore(store);
    return newAdv;
  },

  async deleteAdvance(id: string): Promise<boolean> {
    const store = readStore();
    store.advances = store.advances.filter(a => a.id !== id);
    writeStore(store);
    return true;
  },

  // Owner Payments (मालिक से हिसाब)
  async getOwnerPayments(siteId: string): Promise<OwnerPayment[]> {
    const store = readStore();
    return store.ownerPayments
      .filter(op => op.siteId === siteId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addOwnerPayment(data: {
    siteId: string;
    date: string;
    amount: number;
    paymentMode?: 'CASH' | 'UPI' | 'CHEQUE' | 'BANK_TRANSFER';
    stage?: string;
    notes?: string;
    receivedBy?: string;
  }): Promise<OwnerPayment> {
    const store = readStore();
    const payment: OwnerPayment = {
      id: `op-${Date.now()}`,
      siteId: data.siteId,
      date: data.date,
      amount: Number(data.amount),
      paymentMode: data.paymentMode || 'CASH',
      stage: data.stage || 'किश्त',
      notes: data.notes || '',
      receivedBy: data.receivedBy || 'पापा (ठेकेदार)',
    };
    store.ownerPayments.unshift(payment);
    writeStore(store);
    return payment;
  },

  async deleteOwnerPayment(id: string): Promise<boolean> {
    const store = readStore();
    store.ownerPayments = store.ownerPayments.filter(o => o.id !== id);
    writeStore(store);
    return true;
  },

  // Site Other Expenses (सामग्री, सीमेंट, रेत, भाड़ा, चाय-नाश्ता आदि)
  async getSiteExpenses(siteId: string): Promise<SiteExpense[]> {
    const store = readStore();
    return (store.expenses || [])
      .filter(e => e.siteId === siteId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addSiteExpense(data: {
    siteId: string;
    date: string;
    category: any;
    amount: number;
    description?: string;
  }): Promise<SiteExpense> {
    const store = readStore();
    if (!store.expenses) store.expenses = [];
    const expense: SiteExpense = {
      id: `exp-${Date.now()}`,
      siteId: data.siteId,
      date: data.date,
      category: data.category || 'OTHER',
      amount: Number(data.amount),
      description: data.description || '',
    };
    store.expenses.unshift(expense);
    writeStore(store);
    return expense;
  },

  async deleteSiteExpense(id: string): Promise<boolean> {
    const store = readStore();
    if (!store.expenses) return true;
    store.expenses = store.expenses.filter(e => e.id !== id);
    writeStore(store);
    return true;
  },

  // Master Hisab & Chart Calculation Engine
  async calculateSiteHisab(siteId: string, startDate: string, endDate: string): Promise<SiteCalculationSummary | null> {
    const store = readStore();
    const site = store.sites.find(s => s.id === siteId);
    if (!site) return null;

    // Helper to format date YYYY-MM-DD cleanly without timezone shift
    const formatYMD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Parse start and end dates locally
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    const datesList: string[] = [];
    let curr = new Date(start);
    let count = 0;
    while (curr <= end && count < 90) {
      datesList.push(formatYMD(curr));
      curr.setDate(curr.getDate() + 1);
      count++;
    }

    // Gather all workers who should be included in this hisab calculation:
    // 1. All currently active workers assigned to this site
    // 2. ANY worker who has attendance records on this site in this date range
    // 3. ANY worker who has advance records on this site in this date range
    const relevantAttendances = store.attendances.filter(
      a => a.siteId === siteId && a.date >= startDate && a.date <= endDate
    );
    const relevantAdvances = store.advances.filter(
      adv => adv.siteId === siteId && adv.date >= startDate && adv.date <= endDate
    );

    // Map of site worker info for customRate
    const siteWorkerMap = new Map<string, SiteWorker>();
    store.siteWorkers
      .filter(sw => sw.siteId === siteId)
      .forEach(sw => siteWorkerMap.set(sw.workerId, sw));

    // Collect all candidate worker IDs
    const workerIdsSet = new Set<string>();

    // Always include active site workers
    store.siteWorkers
      .filter(sw => sw.siteId === siteId && sw.isActive)
      .forEach(sw => workerIdsSet.add(sw.workerId));

    // Also include any worker who has attendance or advances on this site in this period
    for (const a of relevantAttendances) {
      workerIdsSet.add(a.workerId);
    }
    for (const adv of relevantAdvances) {
      workerIdsSet.add(adv.workerId);
    }

    const rows: WorkerHisabRow[] = [];
    let totalLaborDays = 0;
    let totalGrossPayable = 0;
    let totalAdvancePaid = 0;
    let totalNetPayable = 0;

    for (const workerId of Array.from(workerIdsSet)) {
      const sw = siteWorkerMap.get(workerId);
      const worker = store.workers.find(w => w.id === workerId);

      const workerAtts = relevantAttendances.filter(a => a.workerId === workerId);
      const workerAdvs = relevantAdvances.filter(a => a.workerId === workerId);

      // If worker was marked inactive or unassigned and has 0 attendance AND 0 advances in this period, skip
      const isCurrentlyActive = sw ? sw.isActive : false;
      if (!isCurrentlyActive && workerAtts.length === 0 && workerAdvs.length === 0) {
        continue;
      }

      const workerName = worker?.name || 'मजदूर';
      const role = worker?.role || 'LABOUR';
      const gender = worker?.gender || (role === 'REJA' ? 'FEMALE' : 'MALE');
      const dailyRate = sw?.customRate ?? worker?.defaultRate ?? 500;

      const datesMap: Record<string, { status: AttendanceStatus; overtimeHours: number }> = {};
      let workerDays = 0;
      let workerOtHours = 0;

      for (const d of datesList) {
        const att = workerAtts.find(a => a.date === d);
        if (att) {
          datesMap[d] = { status: att.status, overtimeHours: att.overtimeHours || 0 };
          if (att.status === 'PRESENT') workerDays += 1.0;
          else if (att.status === 'HALF_DAY') workerDays += 0.5;
          else if (att.status === 'OVERTIME') {
            workerDays += 1.0;
            workerOtHours += (att.overtimeHours || 2);
          }
        } else {
          datesMap[d] = { status: 'ABSENT', overtimeHours: 0 };
        }
      }

      // Overtime wage calculation (approx 8 hours standard day)
      const otWage = (dailyRate / 8) * workerOtHours;
      const grossAmount = Math.round(workerDays * dailyRate + otWage);
      const totalAdvance = workerAdvs.reduce((sum, item) => sum + item.amount, 0);
      const netPayable = grossAmount - totalAdvance;

      const advancesList = workerAdvs
        .map(adv => ({
          id: adv.id,
          date: adv.date,
          amount: adv.amount,
          reason: adv.reason,
          paymentMode: adv.paymentMode,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      totalLaborDays += workerDays;
      totalGrossPayable += grossAmount;
      totalAdvancePaid += totalAdvance;
      totalNetPayable += netPayable;

      rows.push({
        workerId: workerId,
        workerName: workerName,
        gender: gender,
        role: role,
        dailyRate,
        dates: datesMap,
        totalDays: workerDays,
        overtimeHoursTotal: workerOtHours,
        grossAmount,
        totalAdvance,
        advancesList,
        netPayable,
      });
    }

    // Always sort by Indian construction hierarchy: Mistri -> Veldar -> Reja -> Labour
    const sortedRows = sortWorkersByHierarchy(rows);

    // Other Expenses Calculation in this date range
    const siteExpenses = (store.expenses || []).filter(
      e => e.siteId === siteId && e.date >= startDate && e.date <= endDate
    );
    const totalOtherExpenses = siteExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Owner Payments Calculation
    const allOwnerPayments = store.ownerPayments.filter(op => op.siteId === siteId);
    const ownerTotalPaid = allOwnerPayments.reduce((sum, op) => sum + op.amount, 0);
    const ownerTotalContract = site.contractAmount || 0;
    const ownerBalanceDue = Math.max(0, ownerTotalContract - ownerTotalPaid);
    const papaNetProfit = ownerTotalPaid - (totalGrossPayable + totalOtherExpenses);

    return {
      site,
      startDate,
      endDate,
      datesList,
      rows: sortedRows,
      totalLaborDays,
      totalGrossPayable,
      totalAdvancePaid,
      totalNetPayable,
      totalOtherExpenses,
      expensesList: siteExpenses,
      ownerTotalContract,
      ownerTotalPaid,
      ownerBalanceDue,
      papaNetProfit,
    };
  }
};

