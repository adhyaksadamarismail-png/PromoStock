/**
 * PROMOHOLIC TRACKER / PROMOVAULT - Storage & State Management
 * Handles LocalStorage persistence, Automatic Device management, and Voucher Used Toggles.
 */

const STORAGE_KEYS = {
  SESSION: 'promoholic_session',
  ACCESS_CODE: 'promoholic_access_code',
  KOPKEN_NORMAL: 'promoholic_kopken_normal_devices',
  KOPKEN_BAPERAN: 'promoholic_kopken_baperan',
  TOMORO: 'promoholic_tomoro_coffee'
};

const DEFAULT_ACCESS_CODE = 'PROMOHOLIC2026';

// Initial Seed Data
const INITIAL_KOPKEN_NORMAL_DEVICES = [
  {
    id: 'device-1',
    name: 'DEVICE 1',
    accounts: [
      { id: 'kn-1', number: '085612345678', vouchers: { tanpaMin: false, min50k: false, min70k: false } },
      { id: 'kn-2', number: '085623456789', vouchers: { tanpaMin: false, min50k: true, min70k: false } },
      { id: 'kn-3', number: '083145678901', vouchers: { tanpaMin: false, min50k: false, min70k: false } }
    ]
  },
  {
    id: 'device-2',
    name: 'DEVICE 2',
    accounts: [
      { id: 'kn-4', number: '087845678901', vouchers: { tanpaMin: false, min50k: false, min70k: false } },
      { id: 'kn-5', number: '081234567890', vouchers: { tanpaMin: false, min50k: false, min70k: false } }
    ]
  }
];

const INITIAL_KOPKEN_BAPERAN = [
  { id: 'bp-1', number: '085698765432', pin: '882194', used: false },
  { id: 'bp-2', number: '081377889900', pin: '142536', used: true },
  { id: 'bp-3', number: '087711223344', pin: '990011', used: false }
];

const INITIAL_TOMORO = [
  { id: 'tm-1', number: '085711223344', vouchers: { b1g1: false, v50: false } },
  { id: 'tm-2', number: '081299887766', vouchers: { b1g1: true, v50: false } },
  { id: 'tm-3', number: '083844556677', vouchers: { b1g1: false, v50: false } }
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
  }

  cleanPhoneNumber(raw) {
    if (!raw) return '';
    return raw.trim().replace(/[^\d+]/g, '');
  }

  isValidPhone(phone) {
    const cleaned = this.cleanPhoneNumber(phone);
    return cleaned.length >= 8 && cleaned.length <= 16;
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

  // --- KopKen Normal (Devices) ---
  getKopKenDevices() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.KOPKEN_NORMAL)) || [];
      // Ensure voucher structure on load
      data.forEach(d => {
        d.accounts.forEach(a => {
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
    // Clean up empty devices at tail, re-index Device names
    devices.forEach((d, idx) => {
      d.name = `DEVICE ${idx + 1}`;
    });
    localStorage.setItem(STORAGE_KEYS.KOPKEN_NORMAL, JSON.stringify(devices));
  }

  // Auto Add Account into Device (Max 3 per device)
  addKopKenAccount(number) {
    const devices = this.getKopKenDevices();
    let targetDevice = devices.find(d => d.accounts.length < 3);

    if (!targetDevice) {
      const newDevIndex = devices.length + 1;
      targetDevice = {
        id: `device-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: `DEVICE ${newDevIndex}`,
        accounts: []
      };
      devices.push(targetDevice);
    }

    const newAcc = {
      id: `kn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: this.cleanPhoneNumber(number),
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
    const devices = this.getKopKenDevices();
    for (const d of devices) {
      const acc = d.accounts.find(a => a.id === accountId);
      if (acc) {
        acc.number = this.cleanPhoneNumber(newNumber);
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
        d.accounts.splice(idx, 1);
        break;
      }
    }
    // Filter out completely empty devices unless it's the only one
    devices = devices.filter(d => d.accounts.length > 0);
    this.saveKopKenDevices(devices);
    return true;
  }

  deleteKopKenDevice(deviceId) {
    let devices = this.getKopKenDevices();
    devices = devices.filter(d => d.id !== deviceId);
    this.saveKopKenDevices(devices);
  }

  // --- KopKen Baperan ---
  getBaperanAccounts() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.KOPKEN_BAPERAN)) || [];
      data.forEach(a => {
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
    const accounts = this.getBaperanAccounts();
    const newAcc = {
      id: `bp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: this.cleanPhoneNumber(number),
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
    const accounts = this.getBaperanAccounts();
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      acc.number = this.cleanPhoneNumber(number);
      acc.pin = pin.trim();
      this.saveBaperanAccounts(accounts);
      return true;
    }
    return false;
  }

  deleteBaperanAccount(id) {
    let accounts = this.getBaperanAccounts();
    accounts = accounts.filter(a => a.id !== id);
    this.saveBaperanAccounts(accounts);
  }

  // --- Tomoro Coffee ---
  getTomoroAccounts() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOMORO)) || [];
      data.forEach(a => {
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
    const accounts = this.getTomoroAccounts();
    const newAcc = {
      id: `tm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: this.cleanPhoneNumber(number),
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
    const accounts = this.getTomoroAccounts();
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      acc.number = this.cleanPhoneNumber(number);
      this.saveTomoroAccounts(accounts);
      return true;
    }
    return false;
  }

  deleteTomoroAccount(id) {
    let accounts = this.getTomoroAccounts();
    accounts = accounts.filter(a => a.id !== id);
    this.saveTomoroAccounts(accounts);
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

  // --- Bulk Imports ---
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
      d.accounts.forEach(a => existingNumbersSet.add(a.number));
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
        const newDevIndex = devices.length + 1;
        targetDevice = {
          id: `device-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: `DEVICE ${newDevIndex}`,
          accounts: []
        };
        devices.push(targetDevice);
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
    const existingNumbersSet = new Set(accounts.map(a => a.number));

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
    const existingNumbersSet = new Set(accounts.map(a => a.number));

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
