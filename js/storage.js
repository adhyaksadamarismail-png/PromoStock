/**
 * PROMOHOLIC TRACKER / PROMOVAULT - Storage & State Management
 * Handles LocalStorage persistence, Automatic Device management, Reset Devices, History & Auto Phone Normalization.
 */

const STORAGE_KEYS = {
  SESSION: 'promoholic_session',
  ACCESS_CODE: 'promoholic_access_code',
  KOPKEN_NORMAL: 'promoholic_kopken_normal_devices',
  KOPKEN_BAPERAN: 'promoholic_kopken_baperan',
  TOMORO: 'promoholic_tomoro_coffee',
  NEXT_DEVICE_ID: 'promoholic_next_device_id',
  HISTORY: 'promoholic_history_accounts'
};

const DEFAULT_ACCESS_CODE = 'PROMOHOLIC2026';

function formatHistoryDate(d = new Date()) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

// Initial Seed Data (Normalized starting with 8)
const INITIAL_KOPKEN_NORMAL_DEVICES = [
  {
    id: 'device-1',
    name: 'DEVICE 1',
    accounts: [
      { id: 'kn-1', number: '85612345678', vouchers: { tanpaMin: false, min50k: false, min70k: false } },
      { id: 'kn-2', number: '85623456789', vouchers: { tanpaMin: false, min50k: true, min70k: false } },
      { id: 'kn-3', number: '83145678901', vouchers: { tanpaMin: false, min50k: false, min70k: false } }
    ]
  },
  {
    id: 'device-2',
    name: 'DEVICE 2',
    accounts: [
      { id: 'kn-4', number: '87845678901', vouchers: { tanpaMin: false, min50k: false, min70k: false } },
      { id: 'kn-5', number: '81234567890', vouchers: { tanpaMin: false, min50k: false, min70k: false } }
    ]
  }
];

const INITIAL_KOPKEN_BAPERAN = [
  { id: 'bp-1', number: '85698765432', pin: '882194', used: false },
  { id: 'bp-2', number: '81377889900', pin: '142536', used: true },
  { id: 'bp-3', number: '87711223344', pin: '990011', used: false }
];

const INITIAL_TOMORO = [
  { id: 'tm-1', number: '85711223344', vouchers: { b1g1: false, v50: false } },
  { id: 'tm-2', number: '81299887766', vouchers: { b1g1: true, v50: false } },
  { id: 'tm-3', number: '83844556677', vouchers: { b1g1: false, v50: false } }
];

class StorageManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.ACCESS_CODE)) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_CODE, DEFAULT_ACCESS_CODE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.KOPKEN_NORMAL)) {
      localStorage.setItem(STORAGE_KEYS.KOPKEN_NORMAL, JSON.stringify(INITIAL_KOPKEN_NORMAL_DEVICES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.KOPKEN_BAPERAN)) {
      localStorage.setItem(STORAGE_KEYS.KOPKEN_BAPERAN, JSON.stringify(INITIAL_KOPKEN_BAPERAN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOMORO)) {
      localStorage.setItem(STORAGE_KEYS.TOMORO, JSON.stringify(INITIAL_TOMORO));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NEXT_DEVICE_ID)) {
      localStorage.setItem(STORAGE_KEYS.NEXT_DEVICE_ID, '3');
    }
    if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    }

    // Auto-normalize any existing numbers stored in LocalStorage upon initialization
    this.normalizeExistingData();
  }

  /**
   * Phone Number Normalization Rule:
   * Removes non-digits and any leading "62" or "0" prefixes so the number always starts with "8".
   * E.g.: "6285123852107" -> "85123852107", "085123852107" -> "85123852107", "85123852107" -> "85123852107"
   */
  cleanPhoneNumber(raw) {
    if (!raw) return '';
    let digits = raw.trim().replace(/\D/g, '');
    while (digits.startsWith('62') || digits.startsWith('0')) {
      if (digits.startsWith('62')) {
        digits = digits.substring(2);
      } else if (digits.startsWith('0')) {
        digits = digits.substring(1);
      }
    }
    return digits;
  }

  isValidPhone(phone) {
    const cleaned = this.cleanPhoneNumber(phone);
    return cleaned.length >= 7 && cleaned.length <= 15 && cleaned.startsWith('8');
  }

  normalizeExistingData() {
    try {
      const devices = JSON.parse(localStorage.getItem(STORAGE_KEYS.KOPKEN_NORMAL));
      if (devices) {
        let changed = false;
        devices.forEach(d => {
          d.accounts.forEach(a => {
            const cleaned = this.cleanPhoneNumber(a.number);
            if (cleaned !== a.number) {
              a.number = cleaned;
              changed = true;
            }
          });
        });
        if (changed) this.saveKopKenDevices(devices);
      }
    } catch (e) {}

    try {
      const accounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.KOPKEN_BAPERAN));
      if (accounts) {
        let changed = false;
        accounts.forEach(a => {
          const cleaned = this.cleanPhoneNumber(a.number);
          if (cleaned !== a.number) {
            a.number = cleaned;
            changed = true;
          }
        });
        if (changed) this.saveBaperanAccounts(accounts);
      }
    } catch (e) {}

    try {
      const accounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOMORO));
      if (accounts) {
        let changed = false;
        accounts.forEach(a => {
          const cleaned = this.cleanPhoneNumber(a.number);
          if (cleaned !== a.number) {
            a.number = cleaned;
            changed = true;
          }
        });
        if (changed) this.saveTomoroAccounts(accounts);
      }
    } catch (e) {}

    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY));
      if (history) {
        let changed = false;
        history.forEach(h => {
          const cleaned = this.cleanPhoneNumber(h.number);
          if (cleaned !== h.number) {
            h.number = cleaned;
            changed = true;
          }
        });
        if (changed) this.saveHistoryAccounts(history);
      }
    } catch (e) {}
  }

  // --- Auth Session ---
  isLoggedIn() {
    return localStorage.getItem(STORAGE_KEYS.SESSION) === 'true';
  }

  setLoggedIn(status) {
    if (status) {
      localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }

  getAccessCode() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_CODE) || DEFAULT_ACCESS_CODE;
  }

  setAccessCode(newCode) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_CODE, newCode);
  }

  verifyAccessCode(code) {
    return code.trim() === this.getAccessCode();
  }

  // --- Persistent Device Counter ---
  getNextDeviceId() {
    const val = localStorage.getItem(STORAGE_KEYS.NEXT_DEVICE_ID);
    if (val) return parseInt(val, 10);
    const devices = this.getKopKenDevices();
    let max = 0;
    devices.forEach(d => {
      const match = d.name.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > max) max = num;
      }
    });
    const nextVal = Math.max(max + 1, 3);
    this.setNextDeviceId(nextVal);
    return nextVal;
  }

  setNextDeviceId(num) {
    localStorage.setItem(STORAGE_KEYS.NEXT_DEVICE_ID, num.toString());
  }

  // --- KopKen Normal (Devices) ---
  getKopKenDevices() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.KOPKEN_NORMAL)) || [];
      data.forEach(d => {
        d.accounts.forEach(a => {
          a.number = this.cleanPhoneNumber(a.number);
          if (!a.vouchers) {
            a.vouchers = { tanpaMin: false, min50k: false, min70k: false };
          }
        });
      });
      return data;
    } catch (e) {
      return [];
    }
  }

  saveKopKenDevices(devices) {
    localStorage.setItem(STORAGE_KEYS.KOPKEN_NORMAL, JSON.stringify(devices));
  }

  // Auto Add Account into Device (Max 3 per device)
  addKopKenAccount(number) {
    const cleaned = this.cleanPhoneNumber(number);
    const devices = this.getKopKenDevices();
    let targetDevice = devices.find(d => d.accounts.length < 3);

    if (!targetDevice) {
      const nextId = this.getNextDeviceId();
      targetDevice = {
        id: `device-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: `DEVICE ${nextId}`,
        accounts: []
      };
      devices.push(targetDevice);
      this.setNextDeviceId(nextId + 1);
    }

    const newAcc = {
      id: `kn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: cleaned,
      vouchers: { tanpaMin: false, min50k: false, min70k: false }
    };

    targetDevice.accounts.push(newAcc);
    this.saveKopKenDevices(devices);
    return targetDevice;
  }

  toggleKopKenVoucher(accountId, voucherKey) {
    const devices = this.getKopKenDevices();
    for (const d of devices) {
      const acc = d.accounts.find(a => a.id === accountId);
      if (acc) {
        if (!acc.vouchers) acc.vouchers = { tanpaMin: false, min50k: false, min70k: false };
        acc.vouchers[voucherKey] = !acc.vouchers[voucherKey];
        this.saveKopKenDevices(devices);
        return acc.vouchers[voucherKey];
      }
    }
    return false;
  }

  updateKopKenAccount(accountId, newNumber) {
    const cleaned = this.cleanPhoneNumber(newNumber);
    const devices = this.getKopKenDevices();
    for (const d of devices) {
      const acc = d.accounts.find(a => a.id === accountId);
      if (acc) {
        acc.number = cleaned;
        this.saveKopKenDevices(devices);
        return true;
      }
    }
    return false;
  }

  deleteKopKenAccount(accountId) {
    let devices = this.getKopKenDevices();
    for (const d of devices) {
      const idx = d.accounts.findIndex(a => a.id === accountId);
      if (idx !== -1) {
        const [deletedAcc] = d.accounts.splice(idx, 1);
        this.addAccountsToHistory([deletedAcc], d.name, 'kopkenNormal');
        break;
      }
    }
    devices = devices.filter(d => d.accounts.length > 0);
    this.saveKopKenDevices(devices);
    return true;
  }

  deleteKopKenDevice(deviceId) {
    let devices = this.getKopKenDevices();
    const targetDev = devices.find(d => d.id === deviceId);
    if (targetDev && targetDev.accounts.length > 0) {
      this.addAccountsToHistory(targetDev.accounts, targetDev.name, 'kopkenNormal');
    }
    devices = devices.filter(d => d.id !== deviceId);
    this.saveKopKenDevices(devices);
  }

  // --- KopKen Baperan ---
  getBaperanAccounts() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.KOPKEN_BAPERAN)) || [];
      data.forEach(a => {
        a.number = this.cleanPhoneNumber(a.number);
        if (typeof a.used === 'undefined') a.used = false;
      });
      return data;
    } catch (e) {
      return [];
    }
  }

  saveBaperanAccounts(accounts) {
    localStorage.setItem(STORAGE_KEYS.KOPKEN_BAPERAN, JSON.stringify(accounts));
  }

  addBaperanAccount(number, pin) {
    const cleaned = this.cleanPhoneNumber(number);
    const accounts = this.getBaperanAccounts();
    const newAcc = {
      id: `bp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: cleaned,
      pin: pin.trim(),
      used: false
    };
    accounts.unshift(newAcc);
    this.saveBaperanAccounts(accounts);
    return newAcc;
  }

  toggleBaperanVoucher(accountId) {
    const accounts = this.getBaperanAccounts();
    const acc = accounts.find(a => a.id === accountId);
    if (acc) {
      acc.used = !acc.used;
      this.saveBaperanAccounts(accounts);
      return acc.used;
    }
    return false;
  }

  updateBaperanAccount(id, number, pin) {
    const cleaned = this.cleanPhoneNumber(number);
    const accounts = this.getBaperanAccounts();
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      acc.number = cleaned;
      acc.pin = pin.trim();
      this.saveBaperanAccounts(accounts);
      return true;
    }
    return false;
  }

  deleteBaperanAccount(id) {
    let accounts = this.getBaperanAccounts();
    const targetAcc = accounts.find(a => a.id === id);
    if (targetAcc) {
      this.addAccountsToHistory([targetAcc], 'KopKen Baperan', 'kopkenBaperan');
    }
    accounts = accounts.filter(a => a.id !== id);
    this.saveBaperanAccounts(accounts);
  }

  // --- Tomoro Coffee ---
  getTomoroAccounts() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOMORO)) || [];
      data.forEach(a => {
        a.number = this.cleanPhoneNumber(a.number);
        if (!a.vouchers) a.vouchers = { b1g1: false, v50: false };
      });
      return data;
    } catch (e) {
      return [];
    }
  }

  saveTomoroAccounts(accounts) {
    localStorage.setItem(STORAGE_KEYS.TOMORO, JSON.stringify(accounts));
  }

  addTomoroAccount(number) {
    const cleaned = this.cleanPhoneNumber(number);
    const accounts = this.getTomoroAccounts();
    const newAcc = {
      id: `tm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: cleaned,
      vouchers: { b1g1: false, v50: false }
    };
    accounts.unshift(newAcc);
    this.saveTomoroAccounts(accounts);
    return newAcc;
  }

  toggleTomoroVoucher(accountId, voucherKey) {
    const accounts = this.getTomoroAccounts();
    const acc = accounts.find(a => a.id === accountId);
    if (acc) {
      if (!acc.vouchers) acc.vouchers = { b1g1: false, v50: false };
      acc.vouchers[voucherKey] = !acc.vouchers[voucherKey];
      this.saveTomoroAccounts(accounts);
      return acc.vouchers[voucherKey];
    }
    return false;
  }

  updateTomoroAccount(id, number) {
    const cleaned = this.cleanPhoneNumber(number);
    const accounts = this.getTomoroAccounts();
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      acc.number = cleaned;
      this.saveTomoroAccounts(accounts);
      return true;
    }
    return false;
  }

  deleteTomoroAccount(id) {
    let accounts = this.getTomoroAccounts();
    const targetAcc = accounts.find(a => a.id === id);
    if (targetAcc) {
      this.addAccountsToHistory([targetAcc], 'Tomoro Coffee', 'tomoroCoffee');
    }
    accounts = accounts.filter(a => a.id !== id);
    this.saveTomoroAccounts(accounts);
  }

  // --- History & Reset Devices Management ---
  getHistoryAccounts() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
      data.forEach(h => {
        h.number = this.cleanPhoneNumber(h.number);
      });
      return data;
    } catch (e) {
      return [];
    }
  }

  saveHistoryAccounts(history) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }

  addAccountsToHistory(accounts, deviceName, type) {
    const history = this.getHistoryAccounts();
    const formattedDate = formatHistoryDate(new Date());

    accounts.forEach(acc => {
      const historyItem = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        originalId: acc.id,
        number: this.cleanPhoneNumber(acc.number),
        pin: acc.pin || '',
        vouchers: JSON.parse(JSON.stringify(acc.vouchers || {})),
        used: typeof acc.used !== 'undefined' ? acc.used : false,
        deviceName: deviceName || 'Device',
        type: type || 'kopkenNormal',
        deletedAt: formattedDate,
        timestamp: Date.now()
      };
      history.unshift(historyItem);
    });

    this.saveHistoryAccounts(history);
  }

  resetDevices(deviceIds) {
    const devices = this.getKopKenDevices();
    const remainingDevices = [];

    devices.forEach(d => {
      if (deviceIds.includes(d.id)) {
        if (d.accounts && d.accounts.length > 0) {
          this.addAccountsToHistory(d.accounts, d.name, 'kopkenNormal');
        }
      } else {
        remainingDevices.push(d);
      }
    });

    this.saveKopKenDevices(remainingDevices);
    return remainingDevices;
  }

  toggleHistoryVoucher(historyId, voucherKey) {
    const history = this.getHistoryAccounts();
    const item = history.find(h => h.id === historyId);
    if (item) {
      if (item.type === 'kopkenBaperan') {
        item.used = !item.used;
      } else if (item.vouchers && voucherKey) {
        item.vouchers[voucherKey] = !item.vouchers[voucherKey];
      }
      this.saveHistoryAccounts(history);
      return true;
    }
    return false;
  }

  deleteHistoryAccount(historyId) {
    let history = this.getHistoryAccounts();
    history = history.filter(h => h.id !== historyId);
    this.saveHistoryAccounts(history);
  }

  // --- Stock Summary (Active Available Vouchers) ---
  getVoucherStockSummary() {
    const devices = this.getKopKenDevices();
    let tanpaMinCount = 0;
    let min50kCount = 0;
    let min70kCount = 0;

    devices.forEach(d => {
      d.accounts.forEach(a => {
        if (!a.vouchers.tanpaMin) tanpaMinCount++;
        if (!a.vouchers.min50k) min50kCount++;
        if (!a.vouchers.min70k) min70kCount++;
      });
    });

    const baperanAccounts = this.getBaperanAccounts();
    let baperanActiveCount = 0;
    baperanAccounts.forEach(a => {
      if (!a.used) baperanActiveCount++;
    });

    return {
      tanpaMin: tanpaMinCount,
      min50k: min50kCount,
      min70k: min70kCount,
      potongan8k: baperanActiveCount
    };
  }

  // --- Bulk Imports (Deduplication after Normalization) ---
  bulkImportKopKenNormal(rawText) {
    let successCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    if (!rawText || !rawText.trim()) {
      return { successCount: 0, duplicateCount: 0, invalidCount: 0 };
    }

    const devices = this.getKopKenDevices();
    const existingNumbersSet = new Set();
    devices.forEach(d => {
      d.accounts.forEach(a => existingNumbersSet.add(this.cleanPhoneNumber(a.number)));
    });

    const lines = rawText.split(/\r?\n/);

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const cleanedNum = this.cleanPhoneNumber(trimmed);

      if (!this.isValidPhone(cleanedNum)) {
        invalidCount++;
        return;
      }

      if (existingNumbersSet.has(cleanedNum)) {
        duplicateCount++;
        return;
      }

      let targetDevice = devices.find(d => d.accounts.length < 3);

      if (!targetDevice) {
        const nextId = this.getNextDeviceId();
        targetDevice = {
          id: `device-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: `DEVICE ${nextId}`,
          accounts: []
        };
        devices.push(targetDevice);
        this.setNextDeviceId(nextId + 1);
      }

      targetDevice.accounts.push({
        id: `kn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        number: cleanedNum,
        vouchers: { tanpaMin: false, min50k: false, min70k: false }
      });

      existingNumbersSet.add(cleanedNum);
      successCount++;
    });

    this.saveKopKenDevices(devices);
    return { successCount, duplicateCount, invalidCount };
  }

  bulkImportBaperan(rawText) {
    let successCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    if (!rawText || !rawText.trim()) {
      return { successCount: 0, duplicateCount: 0, invalidCount: 0 };
    }

    const accounts = this.getBaperanAccounts();
    const existingNumbersSet = new Set(accounts.map(a => this.cleanPhoneNumber(a.number)));

    const lines = rawText.split(/\r?\n/);

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = trimmed.split('|');
      if (parts.length < 2) {
        invalidCount++;
        return;
      }

      const rawNum = parts[0].trim();
      const rawPin = parts.slice(1).join('|').trim();

      const cleanedNum = this.cleanPhoneNumber(rawNum);

      if (!this.isValidPhone(cleanedNum) || !rawPin) {
        invalidCount++;
        return;
      }

      if (existingNumbersSet.has(cleanedNum)) {
        duplicateCount++;
        return;
      }

      accounts.unshift({
        id: `bp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        number: cleanedNum,
        pin: rawPin,
        used: false
      });

      existingNumbersSet.add(cleanedNum);
      successCount++;
    });

    this.saveBaperanAccounts(accounts);
    return { successCount, duplicateCount, invalidCount };
  }

  bulkImportTomoro(rawText) {
    let successCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    if (!rawText || !rawText.trim()) {
      return { successCount: 0, duplicateCount: 0, invalidCount: 0 };
    }

    const accounts = this.getTomoroAccounts();
    const existingNumbersSet = new Set(accounts.map(a => this.cleanPhoneNumber(a.number)));

    const lines = rawText.split(/\r?\n/);

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const cleanedNum = this.cleanPhoneNumber(trimmed);

      if (!this.isValidPhone(cleanedNum)) {
        invalidCount++;
        return;
      }

      if (existingNumbersSet.has(cleanedNum)) {
        duplicateCount++;
        return;
      }

      accounts.unshift({
        id: `tm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        number: cleanedNum,
        vouchers: { b1g1: false, v50: false }
      });

      existingNumbersSet.add(cleanedNum);
      successCount++;
    });

    this.saveTomoroAccounts(accounts);
    return { successCount, duplicateCount, invalidCount };
  }
}

window.storage = new StorageManager();
