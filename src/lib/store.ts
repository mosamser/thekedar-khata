import fs from 'fs';
import path from 'path';
import { Site, Worker, SiteWorker, Attendance, Advance, OwnerPayment, SiteExpense } from './types';

export interface DataStore {
  sites: Site[];
  workers: Worker[];
  siteWorkers: SiteWorker[];
  attendances: Attendance[];
  advances: Advance[];
  ownerPayments: OwnerPayment[];
  expenses: SiteExpense[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'thekedar_store.json');

const INITIAL_DATA: DataStore = {
  workers: [
    {
      id: "w-1",
      name: "रमेश कुमार",
      gender: "MALE",
      role: "MISTRI",
      defaultRate: 850,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "w-2",
      name: "सुरेश पाल",
      gender: "MALE",
      role: "HELPER",
      defaultRate: 550,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "w-3",
      name: "शांति देवी",
      gender: "FEMALE",
      role: "REJA",
      defaultRate: 500,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "w-4",
      name: "दिनेश यादव",
      gender: "MALE",
      role: "LABOUR",
      defaultRate: 500,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "w-5",
      name: "कमला बाई (रेजा)",
      gender: "FEMALE",
      role: "REJA",
      defaultRate: 500,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  sites: [
    {
      id: "site-1",
      name: "शर्मा जी कोठी (सेक्टर 62)",
      location: "प्लॉट 45, सेक्टर 62, नोएडा",
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: null,
      status: "ACTIVE",
      ownerName: "श्री राजेश शर्मा",
      ownerPhone: "9811223344",
      contractType: "LUMP_SUM",
      contractAmount: 350000,
      notes: "G+2 मकान निर्माण (लेबर रेट ठेका)",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "site-2",
      name: "गोयल प्लाजा (दुकानें)",
      location: "मेन मार्केट, सदर बाजार",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: null,
      status: "ACTIVE",
      ownerName: "श्री विकास गोयल",
      ownerPhone: "9822334455",
      contractType: "SQUARE_FEET",
      contractAmount: 180000,
      notes: "प्लास्टर और फर्श का काम",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  siteWorkers: [
    { id: "sw-1", siteId: "site-1", workerId: "w-1", customRate: 850, joinedAt: new Date().toISOString(), isActive: true },
    { id: "sw-2", siteId: "site-1", workerId: "w-2", customRate: 550, joinedAt: new Date().toISOString(), isActive: true },
    { id: "sw-3", siteId: "site-1", workerId: "w-3", customRate: 500, joinedAt: new Date().toISOString(), isActive: true },
    { id: "sw-4", siteId: "site-1", workerId: "w-4", customRate: 500, joinedAt: new Date().toISOString(), isActive: true },
    { id: "sw-5", siteId: "site-1", workerId: "w-5", customRate: 500, joinedAt: new Date().toISOString(), isActive: true }
  ],
  attendances: [],
  advances: [
    {
      id: "adv-1",
      siteId: "site-1",
      workerId: "w-1",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 500,
      reason: "राशन का सामान",
      paymentMode: "CASH"
    },
    {
      id: "adv-2",
      siteId: "site-1",
      workerId: "w-2",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 300,
      reason: "दवाई के लिए",
      paymentMode: "CASH"
    }
  ],
  ownerPayments: [
    {
      id: "op-1",
      siteId: "site-1",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 50000,
      paymentMode: "BANK_TRANSFER",
      stage: "काम शुरू होने पर एडवांस",
      notes: "चेक द्वारा प्राप्त हुआ",
      receivedBy: "पापा (ठेकेदार)"
    },
    {
      id: "op-2",
      siteId: "site-1",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 40000,
      paymentMode: "UPI",
      stage: "ग्राउंड फ्लोर दीवार पूरा होने पर",
      notes: "Google Pay द्वारा प्राप्त",
      receivedBy: "पापा"
    }
  ],
  expenses: []
};

// Generate seed attendance for past 7 days for site-1
const today = new Date();
for (let i = 6; i >= 0; i--) {
  const d = new Date(today);
  d.setDate(d.getDate() - i);
  const dateStr = d.toISOString().split('T')[0];

  INITIAL_DATA.attendances.push(
    { id: `att-1-${i}`, siteId: "site-1", workerId: "w-1", date: dateStr, status: i === 2 ? "HALF_DAY" : "PRESENT", overtimeHours: i === 0 ? 2 : 0 },
    { id: `att-2-${i}`, siteId: "site-1", workerId: "w-2", date: dateStr, status: i === 4 ? "ABSENT" : "PRESENT", overtimeHours: 0 },
    { id: `att-3-${i}`, siteId: "site-1", workerId: "w-3", date: dateStr, status: "PRESENT", overtimeHours: 0 },
    { id: `att-4-${i}`, siteId: "site-1", workerId: "w-4", date: dateStr, status: "PRESENT", overtimeHours: 0 },
    { id: `att-5-${i}`, siteId: "site-1", workerId: "w-5", date: dateStr, status: "PRESENT", overtimeHours: 0 }
  );
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
  }
}

export function readStore(): DataStore {
  try {
    ensureDataFile();
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    // Make sure all workers have gender and no phone
    parsed.workers = parsed.workers.map((w: any) => ({
      ...w,
      gender: w.gender || (w.role === 'REJA' ? 'FEMALE' : 'MALE'),
      role: w.role === 'HELPER' ? 'VELDAR' : w.role,
    }));
    return parsed;
  } catch (err) {
    console.error("Error reading data store:", err);
    return INITIAL_DATA;
  }
}

export function writeStore(data: DataStore): void {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing data store:", err);
  }
}
