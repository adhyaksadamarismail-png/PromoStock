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
  HISTORY: 'promoholic_history_accounts',
  RECEIPT_PRODUCTS: 'promoholic_receipt_products',
  RECEIPTS: 'promoholic_receipts'
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

const FORE_CUSTOMIZATION_SCHEMA = {
  cup_size: {
    category: 'Ukuran Cup',
    options: [
      { code: 'regular', name: 'Regular Ice', display: 'Regular', price: 0, default: true },
      { code: 'large_6kiced', name: 'Large Ice', display: 'Large', price: 7000, default: false }
    ]
  },
  sweetness: {
    category: 'Sweetness',
    options: [
      { code: 'normal_sweet', name: 'Normal Sweet', display: 'Normal Sweet', price: 0, default: true },
      { code: 'less_sweet', name: 'Less Sweet', display: 'Less Sweet', price: 0, default: false }
    ]
  },
  ice: {
    category: 'Ice Cube',
    options: [
      { code: 'normal_ice', name: 'Normal Ice', display: 'Normal Ice', price: 0, default: true },
      { code: 'less_ice', name: 'Less Ice', display: 'Less Ice', price: 0, default: false },
      { code: 'more_ice', name: 'More Ice', display: 'More Ice', price: 0, default: false },
      { code: 'no_ice', name: 'No Ice', display: 'No Ice', price: 0, default: false },
      { code: 'ice_separately', name: 'Ice Separately', display: 'Ice Separately', price: 0, default: false }
    ]
  },
  espresso: {
    category: 'Espresso',
    options: [
      { code: 'normal_shot', name: 'Normal Shot', display: 'Normal Shot', price: 0, default: true },
      { code: 'shot_1', name: '+1 Shot', display: '+1 Shot', price: 7000, default: false },
      { code: 'shot_2', name: '+2 Shot', display: '+2 Shot', price: 14000, default: false }
    ]
  },
  dairy: {
    category: 'Dairy',
    options: [
      { code: 'milk', name: 'Milk', display: 'Milk', price: 0, default: true },
      { code: 'oat_milk', name: 'Oat Milk', display: 'Oat Milk', price: 15000, default: false },
      { code: 'almond_milk', name: 'Almond Milk', display: 'Almond Milk', price: 15000, default: false },
      { code: 'soy_multigrain', name: 'Soy Multigrain', display: 'Soy Multigrain', price: 7000, default: false }
    ]
  },
  syrup: {
    category: 'Syrup',
    isMultiple: true,
    maxMultiple: 2,
    options: [
      { code: 'pandan', name: 'Pandan', display: 'Pandan', price: 7000 },
      { code: 'aren', name: 'Aren', display: 'Aren', price: 7000 },
      { code: 'hazelnut', name: 'Hazelnut', display: 'Hazelnut', price: 7000 },
      { code: 'vanilla', name: 'Vanilla', display: 'Vanilla', price: 7000 },
      { code: 'salted_caramel', name: 'Salted Caramel', display: 'Salted Caramel', price: 7000 }
    ]
  },
  topping: {
    category: 'Topping',
    isMultiple: true,
    maxMultiple: 2,
    options: [
      { code: 'caramel_sauce', name: 'Caramel Sauce', display: 'Caramel Sauce', price: 7000 },
      { code: 'crumble', name: 'Crumble', display: 'Crumble', price: 7000 },
      { code: 'sea_salt_cream', name: 'Sea Salt Cream', display: 'Sea Salt Cream', price: 7000 },
      { code: 'oreo_crumbs', name: 'Oreo Crumbs', display: 'Oreo Crumbs', price: 7000 }
    ]
  }
};

const INITIAL_FORE_PRODUCTS = [
  // FORE SIGNATURE
  { id: 'p-1', brand: 'Fore Coffee', category: 'FORE SIGNATURE', product_name: 'Kopi Dari Tani', original_price: 25000, discounted_price: 21000, active: true },
  { id: 'p-2', brand: 'Fore Coffee', category: 'FORE SIGNATURE', product_name: 'Butterscotch Sea Salt Latte', original_price: 33000, discounted_price: 27000, active: true },
  { id: 'p-3', brand: 'Fore Coffee', category: 'FORE SIGNATURE', product_name: 'Buttercream Latte', original_price: 33000, discounted_price: 25000, active: true },
  { id: 'p-4', brand: 'Fore Coffee', category: 'FORE SIGNATURE', product_name: 'Aren Latte', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-5', brand: 'Fore Coffee', category: 'FORE SIGNATURE', product_name: 'Pandan Latte', original_price: 29000, discounted_price: 24000, active: true },

  // COFFEE
  { id: 'p-6', brand: 'Fore Coffee', category: 'COFFEE', product_name: 'Espresso', original_price: 21000, discounted_price: 18000, active: true },
  { id: 'p-7', brand: 'Fore Coffee', category: 'COFFEE', product_name: 'Bumi Latte', original_price: 25000, discounted_price: 21000, active: true },
  { id: 'p-8', brand: 'Fore Coffee', category: 'COFFEE', product_name: 'Malty Latte', original_price: 27000, discounted_price: 22000, active: true },
  { id: 'p-9', brand: 'Fore Coffee', category: 'COFFEE', product_name: 'Cappuccino', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-10', brand: 'Fore Coffee', category: 'COFFEE', product_name: 'Café Latte', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-11', brand: 'Fore Coffee', category: 'COFFEE', product_name: 'Dirty Matchapresso', original_price: 31000, discounted_price: 25000, active: true },
  { id: 'p-12', brand: 'Fore Coffee', category: 'COFFEE', product_name: 'Double Iced Shaken Latte', original_price: 33000, discounted_price: 27000, active: true },
  { id: 'p-13', brand: 'Fore Coffee', category: 'COFFEE', product_name: 'Buttercream Tiramisu Latte', original_price: 34000, discounted_price: 28000, active: true },
  { id: 'p-14', brand: 'Fore Coffee', category: 'COFFEE', product_name: 'Caramel Praline Macchiato', original_price: 34000, discounted_price: 28000, active: true },
  { id: 'p-15', brand: 'Fore Coffee', category: 'COFFEE', product_name: 'Nutty Oat Latte', original_price: 39000, discounted_price: 31000, active: true },

  // AMERICANO SERIES
  { id: 'p-16', brand: 'Fore Coffee', category: 'AMERICANO SERIES', product_name: 'Americano', original_price: 23000, discounted_price: 19000, active: true },
  { id: 'p-17', brand: 'Fore Coffee', category: 'AMERICANO SERIES', product_name: 'Manuka Americano', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-18', brand: 'Fore Coffee', category: 'AMERICANO SERIES', product_name: 'Triple Peach Americano', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-19', brand: 'Fore Coffee', category: 'AMERICANO SERIES', product_name: 'Berry Manuka Americano', original_price: 31000, discounted_price: 25000, active: true },

  // NON COFFEE
  { id: 'p-20', brand: 'Fore Coffee', category: 'NON COFFEE', product_name: 'Classic Milo', original_price: 25000, discounted_price: 21000, active: true },
  { id: 'p-21', brand: 'Fore Coffee', category: 'NON COFFEE', product_name: 'Matcha Butter Salt Cream', original_price: 31000, discounted_price: 25000, active: true },
  { id: 'p-22', brand: 'Fore Coffee', category: 'NON COFFEE', product_name: 'Dark Chocolate', original_price: 34000, discounted_price: 28000, active: true },
  { id: 'p-23', brand: 'Fore Coffee', category: 'NON COFFEE', product_name: 'Matcha Green Tea', original_price: 34000, discounted_price: 28000, active: true },
  { id: 'p-24', brand: 'Fore Coffee', category: 'NON COFFEE', product_name: 'Almond Choco', original_price: 39000, discounted_price: 31000, active: true },

  // FORE JUNIOR
  { id: 'p-25', brand: 'Fore Coffee', category: 'FORE JUNIOR', product_name: "Choco Cookie Shake", original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-26', brand: 'Fore Coffee', category: 'FORE JUNIOR', product_name: 'Butterscotch Milk Crumble', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-27', brand: 'Fore Coffee', category: 'FORE JUNIOR', product_name: "Vanilla O' Crumbs", original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-28', brand: 'Fore Coffee', category: 'FORE JUNIOR', product_name: 'Choco Caramel Cloud', original_price: 29000, discounted_price: 24000, active: true },

  // FORE DELI
  { id: 'p-29', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Butter Croissant', original_price: 24000, discounted_price: 20000, active: true },
  { id: 'p-30', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Roll Cake Cheese Pandan', original_price: 27000, discounted_price: 22000, active: true },
  { id: 'p-31', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Roll Cake Peanut Butter & Jam', original_price: 27000, discounted_price: 22000, active: true },
  { id: 'p-32', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Roll Cake Mocha', original_price: 27000, discounted_price: 22000, active: true },
  { id: 'p-33', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Banana Chocolate Cake', original_price: 27000, discounted_price: 22000, active: true },
  { id: 'p-34', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Cempedak Cake', original_price: null, discounted_price: 22000, active: true },
  { id: 'p-35', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Pain au Chocolat', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-36', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Kouign-Amann', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-37', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Beef & Omelette Toast', original_price: 36000, discounted_price: 29000, active: true },
  { id: 'p-38', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Cakalang Quiche', original_price: null, discounted_price: 29000, active: true },
  { id: 'p-39', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Pain au Tiramisu', original_price: null, discounted_price: 29000, active: true },
  { id: 'p-40', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Blueberry Cheese Muffin', original_price: 36000, discounted_price: 29000, active: true },
  { id: 'p-41', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Choco Melt Muffin', original_price: 36000, discounted_price: 29000, active: true },
  { id: 'p-42', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Triple Cheese Danish', original_price: 36000, discounted_price: 29000, active: true },
  { id: 'p-43', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Almond Croissant', original_price: 36000, discounted_price: 29000, active: true },
  { id: 'p-44', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Beef Mentai Sandwich', original_price: 39000, discounted_price: 31000, active: true },
  { id: 'p-45', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Chicken Teriyaki Sandwich', original_price: 39000, discounted_price: 31000, active: true },
  { id: 'p-46', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Smoked Beef & Cheese Sandwich', original_price: 39000, discounted_price: 31000, active: true },
  { id: 'p-47', brand: 'Fore Coffee', category: 'FORE DELI', product_name: 'Mushroom Truffle Sandwich', original_price: 42000, discounted_price: 34000, active: true },

  // REFRESHER
  { id: 'p-48', brand: 'Fore Coffee', category: 'REFRESHER', product_name: 'Hibiscus Lychee Peach Yakult', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-49', brand: 'Fore Coffee', category: 'REFRESHER', product_name: 'Coco Peach Fusion', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-50', brand: 'Fore Coffee', category: 'REFRESHER', product_name: 'Sunny Citrus Jasmine', original_price: 31000, discounted_price: 25000, active: true },

  // TEA
  { id: 'p-51', brand: 'Fore Coffee', category: 'TEA', product_name: 'English Breakfast', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-52', brand: 'Fore Coffee', category: 'TEA', product_name: 'Green Tea Jasmine', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-53', brand: 'Fore Coffee', category: 'TEA', product_name: 'Pure Chamomile', original_price: 29000, discounted_price: 24000, active: true },
  { id: 'p-54', brand: 'Fore Coffee', category: 'TEA', product_name: 'Green Tea Mint', original_price: 29000, discounted_price: 24000, active: true }
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
    if (!localStorage.getItem(STORAGE_KEYS.RECEIPT_PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.RECEIPT_PRODUCTS, JSON.stringify(INITIAL_FORE_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECEIPTS)) {
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify([]));
    }

    // Auto-fix duplicate or corrupted device numbers in existing LocalStorage
    this.fixAndDeduplicateDeviceNumbers();

    // Auto-normalize any existing numbers stored in LocalStorage upon initialization
    this.normalizeExistingData();
  }

  extractDeviceNumber(name) {
    if (!name) return 0;
    const match = name.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  findOrCreateSmallestAvailableDevice(devices) {
    devices.sort((a, b) => this.extractDeviceNumber(a.name) - this.extractDeviceNumber(b.name));

    let n = 1;
    while (true) {
      const existing = devices.find(d => this.extractDeviceNumber(d.name) === n);
      if (existing) {
        if (existing.accounts.length < 3) {
          return existing;
        }
        n++;
      } else {
        const newDev = {
          id: `device-${n}`,
          name: `DEVICE ${n}`,
          accounts: []
        };
        devices.push(newDev);
        devices.sort((a, b) => this.extractDeviceNumber(a.name) - this.extractDeviceNumber(b.name));
        return newDev;
      }
    }
  }

  fixAndDeduplicateDeviceNumbers() {
    let devices = [];
    try {
      devices = JSON.parse(localStorage.getItem(STORAGE_KEYS.KOPKEN_NORMAL)) || [];
    } catch (e) {
      return;
    }

    if (!Array.isArray(devices) || devices.length === 0) return;

    // Filter out empty devices
    devices = devices.filter(d => d.accounts && d.accounts.length > 0);

    // Sort by current device number
    devices.sort((a, b) => this.extractDeviceNumber(a.name) - this.extractDeviceNumber(b.name));

    const numbers = devices.map(d => this.extractDeviceNumber(d.name));
    const hasDuplicates = new Set(numbers).size !== numbers.length;
    const startsHigh = numbers.length > 0 && numbers[0] > 1;

    if (hasDuplicates || startsHigh) {
      devices.forEach((d, idx) => {
        const expectedNum = idx + 1;
        d.name = `DEVICE ${expectedNum}`;
        d.id = `device-${expectedNum}`;
      });
      localStorage.setItem(STORAGE_KEYS.KOPKEN_NORMAL, JSON.stringify(devices));
    }
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
    let val = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_DEVICE_ID), 10);
    
    let maxNum = 0;
    const devices = this.getKopKenDevices();
    devices.forEach(d => {
      const num = this.extractDeviceNumber(d.name);
      if (num > maxNum) maxNum = num;
    });

    const history = this.getHistoryAccounts();
    history.forEach(h => {
      if (h.deviceName) {
        const num = this.extractDeviceNumber(h.deviceName);
        if (num > maxNum) maxNum = num;
      }
    });

    if (isNaN(val) || val <= maxNum) {
      val = maxNum + 1;
      this.setNextDeviceId(val);
    }

    return val;
  }

  setNextDeviceId(num) {
    localStorage.setItem(STORAGE_KEYS.NEXT_DEVICE_ID, num.toString());
  }

  // --- KopKen Normal (Devices) ---
  getKopKenDevices() {
    try {
      let data = JSON.parse(localStorage.getItem(STORAGE_KEYS.KOPKEN_NORMAL)) || [];
      // Clean empty devices if any exist
      data = data.filter(d => d.accounts && d.accounts.length > 0);

      data.forEach(d => {
        d.accounts.forEach(a => {
          a.number = this.cleanPhoneNumber(a.number);
          if (!a.vouchers) {
            a.vouchers = { tanpaMin: false, min50k: false, min70k: false };
          }
        });
      });

      // Always sort devices by device number ascending
      data.sort((a, b) => this.extractDeviceNumber(a.name) - this.extractDeviceNumber(b.name));
      return data;
    } catch (e) {
      return [];
    }
  }

  saveKopKenDevices(devices) {
    devices.sort((a, b) => this.extractDeviceNumber(a.name) - this.extractDeviceNumber(b.name));
    localStorage.setItem(STORAGE_KEYS.KOPKEN_NORMAL, JSON.stringify(devices));
  }

  // Auto Add Account into Device (Max 3 per device, using smallest available device number)
  addKopKenAccount(number) {
    const cleaned = this.cleanPhoneNumber(number);
    const devices = this.getKopKenDevices();
    const targetDevice = this.findOrCreateSmallestAvailableDevice(devices);

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

      const targetDevice = this.findOrCreateSmallestAvailableDevice(devices);

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

  // --- E-RECEIPT MASTER PRODUCTS ---
  getReceiptProducts(brand = null) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECEIPT_PRODUCTS);
      const list = data ? JSON.parse(data) : INITIAL_FORE_PRODUCTS;
      if (!brand) return list;
      return list.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    } catch (e) {
      return INITIAL_FORE_PRODUCTS;
    }
  }

  saveReceiptProducts(products) {
    localStorage.setItem(STORAGE_KEYS.RECEIPT_PRODUCTS, JSON.stringify(products));
  }

  getBrandCustomizationSchema(brand = 'Fore Coffee') {
    return FORE_CUSTOMIZATION_SCHEMA;
  }

  getReceiptProductById(id) {
    const products = this.getReceiptProducts();
    return products.find(p => p.id === id) || null;
  }

  addOrUpdateReceiptProduct(product) {
    const products = this.getReceiptProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      products[existingIndex] = { ...products[existingIndex], ...product, updated_at: new Date().toISOString() };
    } else {
      product.id = product.id || `p-${Date.now()}`;
      product.created_at = new Date().toISOString();
      products.push(product);
    }
    this.saveReceiptProducts(products);
    return product;
  }

  // --- E-RECEIPTS HISTORY ---
  getReceipts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getReceiptByNumber(receiptNumber) {
    if (!receiptNumber) return null;
    const receipts = this.getReceipts();
    const cleanNo = receiptNumber.trim().toUpperCase();
    return receipts.find(r => r.receipt_number.toUpperCase() === cleanNo) || null;
  }

  saveReceipt(receiptData) {
    const receipts = this.getReceipts();
    if (!receiptData.id) {
      receiptData.id = `rcpt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    }
    if (!receiptData.receipt_number) {
      receiptData.receipt_number = this.generateReceiptNumber();
    }
    receiptData.created_at = receiptData.created_at || new Date().toISOString();

    const existingIndex = receipts.findIndex(r => r.id === receiptData.id || r.receipt_number === receiptData.receipt_number);
    if (existingIndex >= 0) {
      receipts[existingIndex] = { ...receipts[existingIndex], ...receiptData };
    } else {
      receipts.unshift(receiptData);
    }
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
    return receiptData;
  }

  deleteReceipt(id) {
    let receipts = this.getReceipts();
    receipts = receipts.filter(r => r.id !== id && r.receipt_number !== id);
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  }

  generateReceiptNumber() {
    const receipts = this.getReceipts();
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `PH${yy}${mm}${dd}`;

    const todayReceipts = receipts.filter(r => r.receipt_number && r.receipt_number.startsWith(datePrefix));
    const nextSeq = String(todayReceipts.length + 1).padStart(4, '0');
    return `${datePrefix}${nextSeq}`;
  }
}

window.storage = new StorageManager();

