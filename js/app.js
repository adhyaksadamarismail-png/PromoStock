/**
 * PROMOHOLIC TRACKER / PROMOVAULT - Application Controller
 * Ultra-Compact OPSI B (Bright Badge / Clean iPhone Style - Zero Overflow).
 */

document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let activeTab = 'kopkenNormal';
  let searchQuery = '';
  let currentBulkImportTab = 'kopkenNormal';
  
  // Selected item for 3-dots action sheet
  let selectedAccount = { id: null, type: null, number: null, pin: null, deviceId: null };

  // DOM Elements
  const loginScreenView = document.getElementById('loginScreenView');
  const dashboardScreenView = document.getElementById('dashboardScreenView');

  const loginForm = document.getElementById('loginForm');
  const loginCodeInput = document.getElementById('loginCode');
  const toggleLoginPassword = document.getElementById('toggleLoginPassword');
  
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const hamburgerModal = document.getElementById('hamburgerModal');
  const hbBtnBulkImport = document.getElementById('hbBtnBulkImport');
  const hbBtnChangeCode = document.getElementById('hbBtnChangeCode');
  const hbBtnLogout = document.getElementById('hbBtnLogout');

  const tabBtns = document.querySelectorAll('.tab-pill-btn');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  const tabContents = document.querySelectorAll('.tab-content-view');
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');

  const fabAddBtn = document.getElementById('fabAddBtn');

  // Action Sheet Elements
  const actionSheetModal = document.getElementById('actionSheetModal');
  const actionSheetTargetInfo = document.getElementById('actionSheetTargetInfo');
  const asBtnCopyPhone = document.getElementById('asBtnCopyPhone');
  const asBtnCopyPin = document.getElementById('asBtnCopyPin');
  const asBtnEdit = document.getElementById('asBtnEdit');
  const asBtnDelete = document.getElementById('asBtnDelete');

  // Modals
  const addModal = document.getElementById('addModal');
  const addForm = document.getElementById('addForm');
  const addModalTitle = document.getElementById('addModalTitle');
  const addPhoneNumberInput = document.getElementById('addPhoneNumber');
  const addPinField = document.getElementById('addPinField');
  const addPinNumberInput = document.getElementById('addPinNumber');

  const editModal = document.getElementById('editModal');
  const editForm = document.getElementById('editForm');
  const editAccountIdInput = document.getElementById('editAccountId');
  const editAccountTypeInput = document.getElementById('editAccountType');
  const editPhoneNumberInput = document.getElementById('editPhoneNumber');
  const editPinGroup = document.getElementById('editPinGroup');
  const editPinNumberInput = document.getElementById('editPinNumber');

  const changeCodeModal = document.getElementById('changeCodeModal');
  const changeAccessCodeForm = document.getElementById('changeAccessCodeForm');

  // Bulk Import Elements
  const bulkImportModal = document.getElementById('bulkImportModal');
  const bulkImportForm = document.getElementById('bulkImportForm');
  const bulkImportModalTitle = document.getElementById('bulkImportModalTitle');
  const importFormatTitle = document.getElementById('importFormatTitle');
  const importFormatExample = document.getElementById('importFormatExample');
  const bulkTextarea = document.getElementById('bulkTextarea');

  const importSummaryModal = document.getElementById('importSummaryModal');
  const summarySuccessCount = document.getElementById('summarySuccessCount');
  const summaryDuplicateCount = document.getElementById('summaryDuplicateCount');
  const summaryInvalidCount = document.getElementById('summaryInvalidCount');

  const closeModalBtns = document.querySelectorAll('.close-modal-btn');
  const toastContainer = document.getElementById('toastContainer');

  // Helper Phone Formatter: 8512 385 2107 (Always starts with 8, stripped 62 or 0)
  function formatPhoneDisplay(phone) {
    if (!phone) return '';
    const clean = window.storage.cleanPhoneNumber(phone);
    if (clean.length === 11) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
    } else if (clean.length === 12) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8)}`;
    } else if (clean.length === 10) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
    }
    return clean;
  }

  // --- Screen View Switcher ---
  function checkAuth() {
    if (window.storage.isLoggedIn()) {
      loginScreenView.style.display = 'none';
      dashboardScreenView.style.display = 'flex';
      renderAllViews();
    } else {
      loginScreenView.style.display = 'flex';
      dashboardScreenView.style.display = 'none';
    }
  }

  // --- Toast Notification ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
    
    let iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    if (type === 'error') {
      iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // --- Copy to Clipboard ---
  function copyToClipboard(text, label = 'Nomor') {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} berhasil disalin.`, 'success');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(`${label} berhasil disalin.`, 'success');
    });
  }

  // --- Login Form Handler ---
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = loginCodeInput.value;
    if (window.storage.verifyAccessCode(code)) {
      window.storage.setLoggedIn(true);
      loginCodeInput.value = '';
      showToast('Berhasil masuk admin!', 'success');
      checkAuth();
    } else {
      showToast('Kode akses salah.', 'error');
    }
  });

  toggleLoginPassword.addEventListener('click', () => {
    const isPass = loginCodeInput.type === 'password';
    loginCodeInput.type = isPass ? 'text' : 'password';
  });

  // --- Hamburger Menu Modal Actions ---
  hamburgerBtn.addEventListener('click', () => {
    openModal(hamburgerModal);
  });

  hbBtnBulkImport.addEventListener('click', () => {
    closeAllModals();
    openBulkImportModal(activeTab === 'voucherKopken' ? 'kopkenNormal' : activeTab);
  });

  hbBtnChangeCode.addEventListener('click', () => {
    closeAllModals();
    openModal(changeCodeModal);
  });

  hbBtnLogout.addEventListener('click', () => {
    closeAllModals();
    if (confirm('Yakin ingin keluar dari PromoHolic Tracker?')) {
      window.storage.setLoggedIn(false);
      showToast('Session berakhir, kembali ke login.');
      checkAuth();
    }
  });

  // Change Access Code Form
  changeAccessCodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const oldCode = document.getElementById('oldAccessCode').value;
    const newCode = document.getElementById('newAccessCode').value;
    const confirmCode = document.getElementById('confirmAccessCode').value;

    if (!window.storage.verifyAccessCode(oldCode)) {
      showToast('Kode lama salah!', 'error');
      return;
    }

    if (newCode !== confirmCode) {
      showToast('Konfirmasi kode baru tidak cocok!', 'error');
      return;
    }

    if (newCode.length < 4) {
      showToast('Kode baru minimal 4 karakter!', 'error');
      return;
    }

    window.storage.setAccessCode(newCode);
    changeAccessCodeForm.reset();
    closeAllModals();
    showToast('Kode akses berhasil diperbarui!', 'success');
  });

  // --- Synchronized Tab Navigation ---
  function switchTab(targetTab) {
    activeTab = targetTab;

    tabBtns.forEach(b => {
      if (b.dataset.tab === activeTab) {
        b.classList.add('active');
        b.setAttribute('aria-selected', 'true');
      } else {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      }
    });

    bottomNavItems.forEach(b => {
      if (b.dataset.tab === activeTab) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    tabContents.forEach(c => c.style.display = 'none');
    const targetContent = document.getElementById(`tab-${activeTab}`);
    if (targetContent) {
      targetContent.style.display = 'block';
    }

    if (activeTab === 'voucherKopken' || activeTab === 'riwayat' || activeTab === 'eReceipt') {
      fabAddBtn.style.display = 'none';
    } else {
      fabAddBtn.style.display = 'flex';
    }

    renderActiveTab();
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  bottomNavItems.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  const hbBtnEReceipt = document.getElementById('hbBtnEReceipt');
  if (hbBtnEReceipt) {
    hbBtnEReceipt.addEventListener('click', () => {
      closeAllModals();
      switchTab('eReceipt');
    });
  }

  // --- Search Handler ---
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    if (searchQuery) {
      searchClearBtn.classList.add('visible');
    } else {
      searchClearBtn.classList.remove('visible');
    }
    renderActiveTab();
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClearBtn.classList.remove('visible');
    renderActiveTab();
  });

  // --- Modals Logic ---
  function openModal(modalEl) {
    modalEl.classList.add('active');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeAllModals();
      }
    });
  });

  // --- Action Sheet Handler ---
  window.openActionSheet = function(id, type, number, pin = null, deviceId = null) {
    selectedAccount = { id, type, number, pin, deviceId };
    actionSheetTargetInfo.textContent = formatPhoneDisplay(number);

    if (pin) {
      asBtnCopyPin.style.display = 'flex';
    } else {
      asBtnCopyPin.style.display = 'none';
    }

    openModal(actionSheetModal);
  };

  asBtnCopyPhone.addEventListener('click', () => {
    if (selectedAccount.number) {
      copyToClipboard(selectedAccount.number, 'Nomor');
    }
    closeAllModals();
  });

  asBtnCopyPin.addEventListener('click', () => {
    if (selectedAccount.pin) {
      copyToClipboard(selectedAccount.pin, 'PIN');
    }
    closeAllModals();
  });

  asBtnEdit.addEventListener('click', () => {
    closeAllModals();
    if (selectedAccount.id && selectedAccount.type) {
      openEditModal(selectedAccount.id, selectedAccount.type);
    }
  });

  asBtnDelete.addEventListener('click', () => {
    closeAllModals();
    if (selectedAccount.id && selectedAccount.type) {
      deleteAccount(selectedAccount.id, selectedAccount.type);
    }
  });

  // --- Single Add Data Modal Handling ---
  fabAddBtn.addEventListener('click', () => {
    openAddModal();
  });

  function openAddModal() {
    addForm.reset();

    if (activeTab === 'kopkenNormal') {
      addModalTitle.textContent = 'Tambah Akun KopKen (Normal)';
      addPinField.style.display = 'none';
      addPinNumberInput.required = false;
    } else if (activeTab === 'kopkenBaperan') {
      addModalTitle.textContent = 'Tambah Akun KopKen Baperan';
      addPinField.style.display = 'block';
      addPinNumberInput.required = true;
    } else if (activeTab === 'tomoroCoffee') {
      addModalTitle.textContent = 'Tambah Akun Tomoro Coffee';
      addPinField.style.display = 'none';
      addPinNumberInput.required = false;
    } else {
      addModalTitle.textContent = 'Tambah Akun KopKen (Normal)';
      addPinField.style.display = 'none';
    }

    openModal(addModal);
  }

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = addPhoneNumberInput.value;

    if (activeTab === 'kopkenNormal') {
      const targetDevice = window.storage.addKopKenAccount(phone);
      showToast(`Akun masuk ke ${targetDevice.name}!`, 'success');
    } else if (activeTab === 'kopkenBaperan') {
      const pin = addPinNumberInput.value;
      window.storage.addBaperanAccount(phone, pin);
      showToast('Akun Baperan disimpan!', 'success');
    } else if (activeTab === 'tomoroCoffee') {
      window.storage.addTomoroAccount(phone);
      showToast('Akun Tomoro disimpan!', 'success');
    }

    closeAllModals();
    renderAllViews();
  });

  // --- Bulk Import Handling ---
  function openBulkImportModal(targetTab) {
    currentBulkImportTab = targetTab;
    bulkImportForm.reset();

    if (targetTab === 'kopkenNormal') {
      bulkImportModalTitle.textContent = 'Bulk Import KopKen (Normal)';
      importFormatTitle.textContent = 'Format Input: 1 nomor per baris (Otomatis diawali 8)';
      importFormatExample.innerHTML = '85612345678<br>082134567890<br>6283145678901';
      bulkTextarea.placeholder = '85612345678\n082134567890\n6283145678901';
    } else if (targetTab === 'kopkenBaperan') {
      bulkImportModalTitle.textContent = 'Bulk Import KopKen Baperan';
      importFormatTitle.textContent = 'Format Input: Nomor|PIN per baris (Otomatis diawali 8)';
      importFormatExample.innerHTML = '85612345678|112233<br>082134567890|889900<br>6283145678901|556611';
      bulkTextarea.placeholder = '85612345678|112233\n082134567890\n6283145678901|556611';
    } else if (targetTab === 'tomoroCoffee') {
      bulkImportModalTitle.textContent = 'Bulk Import Tomoro Coffee';
      importFormatTitle.textContent = 'Format Input: 1 nomor per baris (Otomatis diawali 8)';
      importFormatExample.innerHTML = '81111111111<br>082222222222<br>6283333333333';
      bulkTextarea.placeholder = '81111111111\n082222222222\n6283333333333';
    }

    openModal(bulkImportModal);
  }

  bulkImportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = bulkTextarea.value;
    if (!text.trim()) {
      showToast('Masukkan data yang akan diimport!', 'error');
      return;
    }

    let result = { successCount: 0, duplicateCount: 0, invalidCount: 0 };

    if (currentBulkImportTab === 'kopkenNormal') {
      result = window.storage.bulkImportKopKenNormal(text);
    } else if (currentBulkImportTab === 'kopkenBaperan') {
      result = window.storage.bulkImportBaperan(text);
    } else if (currentBulkImportTab === 'tomoroCoffee') {
      result = window.storage.bulkImportTomoro(text);
    }

    closeAllModals();

    summarySuccessCount.textContent = result.successCount;
    summaryDuplicateCount.textContent = result.duplicateCount;
    summaryInvalidCount.textContent = result.invalidCount;

    openModal(importSummaryModal);
    renderAllViews();
  });


  // --- Interactive Voucher Used Toggles ---
  window.toggleKopkenVoucherBadge = function(accountId, voucherKey, event) {
    if (event) event.stopPropagation();
    const isNowUsed = window.storage.toggleKopKenVoucher(accountId, voucherKey);
    if (isNowUsed) {
      showToast('Voucher TERPAKAI', 'info');
    } else {
      showToast('Voucher Aktif Kembali', 'success');
    }
    renderAllViews();
  };

  window.toggleBaperanVoucherBadge = function(accountId, event) {
    if (event) event.stopPropagation();
    const isNowUsed = window.storage.toggleBaperanVoucher(accountId);
    if (isNowUsed) {
      showToast('Voucher Baperan TERPAKAI', 'info');
    } else {
      showToast('Voucher Baperan Aktif Kembali', 'success');
    }
    renderAllViews();
  };

  window.toggleTomoroVoucherBadge = function(accountId, voucherKey, event) {
    if (event) event.stopPropagation();
    const isNowUsed = window.storage.toggleTomoroVoucher(accountId, voucherKey);
    if (isNowUsed) {
      showToast('Voucher Tomoro TERPAKAI', 'info');
    } else {
      showToast('Voucher Tomoro Aktif Kembali', 'success');
    }
    renderAllViews();
  };


  // --- Edit & Delete Data Modal ---
  function openEditModal(id, type) {
    editForm.reset();
    editAccountIdInput.value = id;
    editAccountTypeInput.value = type;

    if (type === 'kopkenNormal') {
      const devices = window.storage.getKopKenDevices();
      let foundAcc = null;
      for (const d of devices) {
        const a = d.accounts.find(x => x.id === id);
        if (a) {
          foundAcc = a;
          break;
        }
      }
      if (!foundAcc) return;

      editPhoneNumberInput.value = foundAcc.number;
      editPinGroup.style.display = 'none';

    } else if (type === 'kopkenBaperan') {
      const accounts = window.storage.getBaperanAccounts();
      const acc = accounts.find(x => x.id === id);
      if (!acc) return;

      editPhoneNumberInput.value = acc.number;
      editPinNumberInput.value = acc.pin || '';
      editPinGroup.style.display = 'block';

    } else if (type === 'tomoroCoffee') {
      const accounts = window.storage.getTomoroAccounts();
      const acc = accounts.find(x => x.id === id);
      if (!acc) return;

      editPhoneNumberInput.value = acc.number;
      editPinGroup.style.display = 'none';
    }

    openModal(editModal);
  }

  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = editAccountIdInput.value;
    const type = editAccountTypeInput.value;
    const phone = editPhoneNumberInput.value;

    if (type === 'kopkenNormal') {
      window.storage.updateKopKenAccount(id, phone);
      showToast('Akun KopKen diperbarui!', 'success');
    } else if (type === 'kopkenBaperan') {
      const pin = editPinNumberInput.value;
      window.storage.updateBaperanAccount(id, phone, pin);
      showToast('Akun Baperan diperbarui!', 'success');
    } else if (type === 'tomoroCoffee') {
      window.storage.updateTomoroAccount(id, phone);
      showToast('Akun Tomoro diperbarui!', 'success');
    }

    closeAllModals();
    renderAllViews();
  });

  function deleteAccount(id, type) {
    if (confirm('Yakin ingin menghapus akun ini?')) {
      if (type === 'kopkenNormal') {
        window.storage.deleteKopKenAccount(id);
      } else if (type === 'kopkenBaperan') {
        window.storage.deleteBaperanAccount(id);
      } else if (type === 'tomoroCoffee') {
        window.storage.deleteTomoroAccount(id);
      }
      showToast('Akun berhasil dihapus.', 'success');
      renderAllViews();
    }
  }


  // ==========================================================================
  // VIEW RENDERING LOGIC (ULTRA-COMPACT OPSI B - NO OVERFLOW)
  // ==========================================================================

  function renderAllViews() {
    renderKopKenNormal();
    renderKopKenBaperan();
    renderVoucherStockSummary();
    renderTomoroCoffee();
    renderRiwayatView();
  }

  function renderActiveTab() {
    if (activeTab === 'kopkenNormal') renderKopKenNormal();
    else if (activeTab === 'kopkenBaperan') renderKopKenBaperan();
    else if (activeTab === 'voucherKopken') renderVoucherStockSummary();
    else if (activeTab === 'tomoroCoffee') renderTomoroCoffee();
    else if (activeTab === 'riwayat') renderRiwayatView();
  }

  // --- Render 1: KopKen Akun (Normal) - ULTRA COMPACT OPSI B ---
  function renderKopKenNormal() {
    const container = document.getElementById('kopkenNormalDevicesList');
    const devices = window.storage.getKopKenDevices();

    container.innerHTML = '';

    if (devices.length === 0) {
      container.innerHTML = `
        <div class="empty-state-view">
          <div style="font-size: 20px; margin-bottom: 6px;">☕</div>
          <div style="font-size: 13px; font-weight: 500; color: var(--secondary-navy);">Belum ada akun</div>
          <div style="font-size: 11px;">Klik tombol "+" atau "📥 Bulk Import" untuk menambah akun.</div>
        </div>
      `;
      return;
    }

    let hasMatches = false;

    devices.forEach((dev) => {
      const filteredAccounts = searchQuery 
        ? dev.accounts.filter(a => a.number.toLowerCase().includes(searchQuery))
        : dev.accounts;

      if (searchQuery && filteredAccounts.length === 0) {
        return;
      }
      hasMatches = true;

      const isFull = dev.accounts.length >= 3;
      const deviceCard = document.createElement('div');
      deviceCard.className = 'block-card-container';

      let accountsHtml = '';
      
      filteredAccounts.forEach((acc, idx) => {
        const displayNum = formatPhoneDisplay(acc.number);
        const v = acc.vouchers || { tanpaMin: false, min50k: false, min70k: false };
        const isAnyUsed = v.tanpaMin || v.min50k || v.min70k;

        accountsHtml += `
          <div class="account-item-row">
            <div class="account-item-left">
              <span class="${isAnyUsed ? 'status-dot-red' : 'status-dot-green'}" title="${isAnyUsed ? 'Minimal 1 voucher terpakai' : 'Semua voucher masih aktif'}"></span>
              <span class="account-index-num">${idx + 1}</span>
              <span class="account-phone-text">${displayNum}</span>
              <button type="button" class="btn-inline-copy" onclick="window.copyPhone('${acc.number}')" title="Copy Nomor">
                📋
              </button>
            </div>

            <div class="account-item-center">
              <span class="badge-outline green ${v.tanpaMin ? 'used' : ''}" onclick="window.toggleKopkenVoucherBadge('${acc.id}', 'tanpaMin', event)" title="Tap status">
                ${v.tanpaMin ? '✓ TERPAKAI' : 'Tanpa Min'}
              </span>

              <span class="badge-outline orange ${v.min50k ? 'used' : ''}" onclick="window.toggleKopkenVoucherBadge('${acc.id}', 'min50k', event)" title="Tap status">
                ${v.min50k ? '✓ TERPAKAI' : 'Min 50K'}
              </span>

              <span class="badge-outline purple ${v.min70k ? 'used' : ''}" onclick="window.toggleKopkenVoucherBadge('${acc.id}', 'min70k', event)" title="Tap status">
                ${v.min70k ? '✓ TERPAKAI' : 'Min 70K'}
              </span>
            </div>

            <div class="account-item-right">
              <button type="button" class="btn-dots-menu" onclick="window.openActionSheet('${acc.id}', 'kopkenNormal', '${acc.number}')" title="Opsi">
                ⋮
              </button>
            </div>
          </div>
        `;
      });

      // Render Empty Slots if not searching and accounts < 3
      if (!searchQuery && dev.accounts.length < 3) {
        const emptySlotsCount = 3 - dev.accounts.length;
        const currentCount = dev.accounts.length;
        for (let i = 0; i < emptySlotsCount; i++) {
          const slotNum = currentCount + i + 1;
          accountsHtml += `
            <div class="slot-kosong-row">
              <div class="slot-kosong-left">
                <span class="account-index-num" style="background: #F8FAFC;">${slotNum}</span>
                <span class="slot-kosong-text">Slot Kosong</span>
              </div>
              <span class="slot-kosong-icon">➕</span>
            </div>
          `;
        }
      }

      deviceCard.innerHTML = `
        <div class="block-card-header">
          <div class="block-title-group">
            <span class="badge-block-tag">${dev.name}</span>
            <span class="block-account-count">${dev.accounts.length} / 3 akun</span>
          </div>

          <div class="block-status-right">
            ${isFull ? `<span class="badge-status-full">FULL</span>` : ''}
            <button type="button" class="btn-collapse-toggle" onclick="window.deleteDevice('${dev.id}', '${dev.name}')" title="Hapus Device" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
          </div>
        </div>
        
        <div class="block-accounts-list">
          ${accountsHtml}
        </div>
      `;

      container.appendChild(deviceCard);
    });

    if (searchQuery && !hasMatches) {
      container.innerHTML = `
        <div class="empty-state-view">
          <div style="font-size: 13px; font-weight: 500; color: var(--secondary-navy);">Nomor tidak ditemukan</div>
          <div style="font-size: 11px;">Tidak ada nomor "${searchQuery}" pada KopKen Normal.</div>
        </div>
      `;
    }
  }

  // --- Render 2: KopKen Baperan ---
  function renderKopKenBaperan() {
    const container = document.getElementById('baperanList');
    let accounts = window.storage.getBaperanAccounts();

    if (searchQuery) {
      accounts = accounts.filter(a => a.number.toLowerCase().includes(searchQuery) || (a.pin && a.pin.toLowerCase().includes(searchQuery)));
    }

    container.innerHTML = '';

    if (accounts.length === 0) {
      container.innerHTML = `
        <div class="empty-state-view">
          <div style="font-size: 20px; margin-bottom: 6px;">💔</div>
          <div style="font-size: 13px; font-weight: 500; color: var(--secondary-navy);">Belum ada akun Baperan</div>
          <div style="font-size: 11px;">Klik tombol "+" di kanan bawah untuk menambah akun.</div>
        </div>
      `;
      return;
    }

    const cardContainer = document.createElement('div');
    cardContainer.className = 'block-card-container';
    cardContainer.style.padding = '0';

    let accountsHtml = '';

    accounts.forEach((acc, idx) => {
      const displayNum = formatPhoneDisplay(acc.number);
      const isUsed = acc.used || false;
      const pinDisplay = acc.pin ? acc.pin : '------';

      accountsHtml += `
        <div class="baperan-account-row">
          <div class="baperan-left-group">
            <span class="baperan-index-num">${idx + 1}</span>
            <div class="baperan-info-box">
              <span class="baperan-phone-text">${displayNum}</span>
              <span class="baperan-pin-text" onclick="window.copyPin('${acc.pin || ''}', event)" title="Tap untuk Copy PIN">🔑 PIN : ${pinDisplay}</span>
            </div>
          </div>

          <div class="baperan-right-group">
            <button type="button" class="btn-baperan-copy" onclick="window.copyPhone('${acc.number}')" title="Copy Nomor">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <span class="badge-baperan-voucher ${isUsed ? 'used' : 'active'}" onclick="window.toggleBaperanVoucherBadge('${acc.id}', event)" title="Tap status">
              ${isUsed 
                ? 'TERPAKAI <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' 
                : '1 Voucher'
              }
            </span>
            <button type="button" class="btn-dots-menu" onclick="window.openActionSheet('${acc.id}', 'kopkenBaperan', '${acc.number}', '${acc.pin || ''}')" title="Opsi">
              ⋮
            </button>
          </div>
        </div>
      `;
    });

    cardContainer.innerHTML = accountsHtml;
    container.appendChild(cardContainer);
  }

  // --- Render 3: Voucher KopKen Overview ---
  function renderVoucherStockSummary() {
    const summary = window.storage.getVoucherStockSummary();
    document.getElementById('stockTanpaMin').textContent = summary.tanpaMin;
    document.getElementById('stockMin50k').textContent = summary.min50k;
    document.getElementById('stockMin70k').textContent = summary.min70k;
  }

  // --- Render 4: Tomoro Coffee ---
  function renderTomoroCoffee() {
    const container = document.getElementById('tomoroList');
    let accounts = window.storage.getTomoroAccounts();

    if (searchQuery) {
      accounts = accounts.filter(a => a.number.toLowerCase().includes(searchQuery));
    }

    container.innerHTML = '';

    if (accounts.length === 0) {
      container.innerHTML = `
        <div class="empty-state-view">
          <div style="font-size: 20px; margin-bottom: 6px;">🥤</div>
          <div style="font-size: 13px; font-weight: 500; color: var(--secondary-navy);">Belum ada akun Tomoro Coffee</div>
          <div style="font-size: 11px;">Klik tombol "+" di kanan bawah untuk menambah akun.</div>
        </div>
      `;
      return;
    }

    const cardContainer = document.createElement('div');
    cardContainer.className = 'block-card-container';

    let accountsHtml = '';

    accounts.forEach((acc, idx) => {
      const displayNum = formatPhoneDisplay(acc.number);
      const v = acc.vouchers || { b1g1: false, v50: false };
      const isAnyUsed = v.b1g1 || v.v50;

      accountsHtml += `
        <div class="account-item-row">
          <div class="account-item-left">
            <span class="${isAnyUsed ? 'status-dot-red' : 'status-dot-green'}"></span>
            <span class="account-index-num">${idx + 1}</span>
            <span class="account-phone-text">${displayNum}</span>
            <button type="button" class="btn-inline-copy" onclick="window.copyPhone('${acc.number}')" title="Copy Nomor">
              📋
            </button>
          </div>

          <div class="account-item-center">
            <span class="badge-outline orange ${v.b1g1 ? 'used' : ''}" onclick="window.toggleTomoroVoucherBadge('${acc.id}', 'b1g1', event)" title="Tap status">
              ${v.b1g1 ? '✓ TERPAKAI' : '🧡 B1G1'}
            </span>

            <span class="badge-outline purple ${v.v50 ? 'used' : ''}" onclick="window.toggleTomoroVoucherBadge('${acc.id}', 'v50', event)" title="Tap status">
              ${v.v50 ? '✓ TERPAKAI' : '💙 Voucher 50%'}
            </span>
          </div>

          <div class="account-item-right">
            <button type="button" class="btn-dots-menu" onclick="window.openActionSheet('${acc.id}', 'tomoroCoffee', '${acc.number}')" title="Opsi">
              ⋮
            </button>
          </div>
        </div>
      `;
    });

    cardContainer.innerHTML = accountsHtml;
    container.appendChild(cardContainer);
  }

  // --- Reset Device Modal Handlers ---
  const btnOpenResetModal = document.getElementById('btnOpenResetModal');
  const resetDeviceModal = document.getElementById('resetDeviceModal');
  const resetConfirmModal = document.getElementById('resetConfirmModal');
  const selectAllDevicesCheckbox = document.getElementById('selectAllDevicesCheckbox');
  const selectedDeviceCountText = document.getElementById('selectedDeviceCountText');
  const resetDeviceListContainer = document.getElementById('resetDeviceListContainer');
  const btnSubmitResetSelection = document.getElementById('btnSubmitResetSelection');
  const btnExecuteReset = document.getElementById('btnExecuteReset');
  const resetConfirmTitle = document.getElementById('resetConfirmTitle');

  let selectedDeviceIdsForReset = new Set();
  let historyFilter = 'all';

  if (btnOpenResetModal) {
    btnOpenResetModal.addEventListener('click', () => {
      openResetDeviceModal();
    });
  }

  function openResetDeviceModal() {
    selectedDeviceIdsForReset.clear();
    if (selectAllDevicesCheckbox) selectAllDevicesCheckbox.checked = false;
    updateResetDeviceModalUI();
    openModal(resetDeviceModal);
  }

  function updateResetDeviceModalUI() {
    const devices = window.storage.getKopKenDevices();
    resetDeviceListContainer.innerHTML = '';

    if (devices.length === 0) {
      resetDeviceListContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 16px; font-size: 12px;">
          Tidak ada device aktif untuk di-reset.
        </div>
      `;
      btnSubmitResetSelection.disabled = true;
      selectedDeviceCountText.textContent = '0 device terpilih';
      return;
    }

    let html = '';
    devices.forEach(dev => {
      const isChecked = selectedDeviceIdsForReset.has(dev.id);
      html += `
        <label class="reset-device-select-item">
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" class="device-reset-checkbox" data-id="${dev.id}" ${isChecked ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: #EF4444; cursor: pointer;">
            <div>
              <span style="font-size: 13px; font-weight: 700; color: var(--secondary-navy); display: block;">${dev.name}</span>
              <span style="font-size: 11px; color: var(--text-muted);">${dev.accounts.length}/3 akun</span>
            </div>
          </div>
        </label>
      `;
    });

    resetDeviceListContainer.innerHTML = html;

    resetDeviceListContainer.querySelectorAll('.device-reset-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const devId = e.target.dataset.id;
        if (e.target.checked) {
          selectedDeviceIdsForReset.add(devId);
        } else {
          selectedDeviceIdsForReset.delete(devId);
        }
        const allCbs = resetDeviceListContainer.querySelectorAll('.device-reset-checkbox');
        if (selectAllDevicesCheckbox) {
          selectAllDevicesCheckbox.checked = selectedDeviceIdsForReset.size === allCbs.length && allCbs.length > 0;
        }
        updateResetButtonState();
      });
    });

    updateResetButtonState();
  }

  function updateResetButtonState() {
    const count = selectedDeviceIdsForReset.size;
    selectedDeviceCountText.textContent = `${count} device terpilih`;
    btnSubmitResetSelection.disabled = count === 0;
  }

  if (selectAllDevicesCheckbox) {
    selectAllDevicesCheckbox.addEventListener('change', (e) => {
      const devices = window.storage.getKopKenDevices();
      if (e.target.checked) {
        devices.forEach(d => selectedDeviceIdsForReset.add(d.id));
      } else {
        selectedDeviceIdsForReset.clear();
      }
      updateResetDeviceModalUI();
    });
  }

  if (btnSubmitResetSelection) {
    btnSubmitResetSelection.addEventListener('click', () => {
      const count = selectedDeviceIdsForReset.size;
      if (count === 0) return;
      closeAllModals();
      resetConfirmTitle.textContent = `Reset ${count} Device?`;
      openModal(resetConfirmModal);
    });
  }

  if (btnExecuteReset) {
    btnExecuteReset.addEventListener('click', () => {
      const deviceIds = Array.from(selectedDeviceIdsForReset);
      if (deviceIds.length === 0) return;
      window.storage.resetDevices(deviceIds);
      closeAllModals();
      showToast(`${deviceIds.length} Device berhasil di-reset ke Riwayat!`, 'success');
      renderAllViews();
    });
  }

  // --- History Filter Buttons ---
  document.querySelectorAll('.history-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.history-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      historyFilter = btn.dataset.filter;
      renderRiwayatView();
    });
  });

  // --- Render 5: Riwayat & Stok Cadangan ---
  function renderRiwayatView() {
    const container = document.getElementById('riwayatList');
    if (!container) return;

    let history = window.storage.getHistoryAccounts();

    if (historyFilter !== 'all') {
      history = history.filter(h => h.type === historyFilter);
    }

    if (searchQuery) {
      history = history.filter(h => 
        h.number.toLowerCase().includes(searchQuery) || 
        (h.pin && h.pin.toLowerCase().includes(searchQuery)) ||
        (h.deviceName && h.deviceName.toLowerCase().includes(searchQuery))
      );
    }

    // REQUIREMENT #4 & #5: ONLY DISPLAY UNUSED (ACTIVE) VOUCHERS IN HISTORY!
    const activeHistory = history.filter(item => {
      if (item.type === 'kopkenNormal') {
        const v = item.vouchers || { tanpaMin: false, min50k: false, min70k: false };
        return !v.tanpaMin || !v.min50k || !v.min70k;
      } else if (item.type === 'kopkenBaperan') {
        return !item.used;
      } else if (item.type === 'tomoroCoffee') {
        const v = item.vouchers || { b1g1: false, v50: false };
        return !v.b1g1 || !v.v50;
      }
      return true;
    });

    container.innerHTML = '';

    if (activeHistory.length === 0) {
      container.innerHTML = `
        <div class="empty-state-view">
          <div style="font-size: 24px; margin-bottom: 6px;">📜</div>
          <div style="font-size: 13px; font-weight: 600; color: var(--secondary-navy);">Tidak ada stok voucher aktif di Riwayat</div>
          <div style="font-size: 11px;">Voucher di riwayat sudah terpakai seluruhnya atau belum ada akun di-reset.</div>
        </div>
      `;
      return;
    }

    let html = '';

    activeHistory.forEach(item => {
      const displayNum = formatPhoneDisplay(item.number);
      const pinDisplay = item.pin ? item.pin : null;

      let voucherBadgesHtml = '';

      if (item.type === 'kopkenNormal') {
        const v = item.vouchers || { tanpaMin: false, min50k: false, min70k: false };
        if (!v.tanpaMin) {
          voucherBadgesHtml += `<span class="badge-outline green" onclick="window.toggleHistoryVoucherBadge('${item.id}', 'tanpaMin', event)" title="Tap jika sudah terpakai">🟢 Tanpa Min</span> `;
        }
        if (!v.min50k) {
          voucherBadgesHtml += `<span class="badge-outline orange" onclick="window.toggleHistoryVoucherBadge('${item.id}', 'min50k', event)" title="Tap jika sudah terpakai">🟢 Min 50K</span> `;
        }
        if (!v.min70k) {
          voucherBadgesHtml += `<span class="badge-outline purple" onclick="window.toggleHistoryVoucherBadge('${item.id}', 'min70k', event)" title="Tap jika sudah terpakai">🟢 Min 70K</span> `;
        }
      } else if (item.type === 'kopkenBaperan') {
        if (!item.used) {
          voucherBadgesHtml += `<span class="badge-baperan-voucher active" onclick="window.toggleHistoryVoucherBadge('${item.id}', null, event)" title="Tap jika sudah terpakai">🟢 1 Voucher</span>`;
        }
      } else if (item.type === 'tomoroCoffee') {
        const v = item.vouchers || { b1g1: false, v50: false };
        if (!v.b1g1) {
          voucherBadgesHtml += `<span class="badge-outline orange" onclick="window.toggleHistoryVoucherBadge('${item.id}', 'b1g1', event)" title="Tap jika sudah terpakai">🟢 B1G1</span> `;
        }
        if (!v.v50) {
          voucherBadgesHtml += `<span class="badge-outline purple" onclick="window.toggleHistoryVoucherBadge('${item.id}', 'v50', event)" title="Tap jika sudah terpakai">🟢 Voucher 50%</span> `;
        }
      }

      html += `
        <div class="riwayat-card-item">
          <div class="riwayat-card-header">
            <span class="riwayat-device-tag">📱 ${item.deviceName || 'DEVICE'}</span>
            <span class="riwayat-date-text">📅 ${item.deletedAt}</span>
          </div>
          <div class="baperan-account-row" style="padding: 4px 0; border: none; min-height: auto;">
            <div class="baperan-left-group">
              <div class="baperan-info-box">
                <span class="baperan-phone-text">${displayNum}</span>
                ${pinDisplay ? `<span class="baperan-pin-text" onclick="window.copyPin('${pinDisplay}', event)">🔑 PIN : ${pinDisplay}</span>` : ''}
              </div>
            </div>

            <div class="baperan-right-group">
              <button type="button" class="btn-baperan-copy" onclick="window.copyPhone('${item.number}')" title="Copy Nomor">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
              ${voucherBadgesHtml}
              <button type="button" class="btn-dots-menu" onclick="window.deleteHistoryAccountItem('${item.id}')" title="Hapus dari Riwayat" style="color: #EF4444; font-size: 14px;">
                ✕
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // --- Helper Global Window Attachments ---
  window.copyPhone = function(number) {
    copyToClipboard(number, 'Nomor');
  };

  window.copyPin = function(pin, event) {
    if (event) event.stopPropagation();
    if (!pin || pin === '------') return;
    copyToClipboard(pin, 'PIN');
  };

  window.deleteDevice = function(deviceId, deviceName) {
    if (confirm(`Yakin hapus ${deviceName} beserta semua akun didalamnya?`)) {
      window.storage.deleteKopKenDevice(deviceId);
      showToast(`${deviceName} berhasil dihapus & dipindahkan ke Riwayat.`, 'success');
      renderAllViews();
    }
  };

  window.toggleHistoryVoucherBadge = function(historyId, voucherKey, event) {
    if (event) event.stopPropagation();
    window.storage.toggleHistoryVoucher(historyId, voucherKey);
    showToast('Voucher ditandai terpakai & diperbarui dari riwayat stok.', 'info');
    renderAllViews();
  };

  window.deleteHistoryAccountItem = function(historyId) {
    if (confirm('Hapus akun ini dari Riwayat?')) {
      window.storage.deleteHistoryAccount(historyId);
      showToast('Akun dihapus dari riwayat.', 'success');
      renderAllViews();
    }
  };

  // =========================================================================
  // 🧾 E-RECEIPT CONTROLLER & LOGIC
  // =========================================================================
  
  // E-Receipt Form State
  let erItemRows = [];
  let activeErSubTab = 'generator'; // 'generator' | 'history' | 'master'
  let activeMasterCategory = 'ALL';

  // DOM Elements for E-Receipt
  const subtabGenBtn = document.getElementById('subtabGenBtn');
  const subtabHistBtn = document.getElementById('subtabHistBtn');
  const subtabMasterBtn = document.getElementById('subtabMasterBtn');

  const ereceiptGeneratorView = document.getElementById('ereceiptGeneratorView');
  const ereceiptHistoryView = document.getElementById('ereceiptHistoryView');
  const ereceiptMasterView = document.getElementById('ereceiptMasterView');

  const erBrandSelect = document.getElementById('erBrandSelect');
  const erOutletName = document.getElementById('erOutletName');
  const erOutletCity = document.getElementById('erOutletCity');
  const erOutletAddress = document.getElementById('erOutletAddress');
  const erCustomerName = document.getElementById('erCustomerName');
  const erCustomerRequest = document.getElementById('erCustomerRequest');
  const erPickupNumber = document.getElementById('erPickupNumber');
  const erTransNumber = document.getElementById('erTransNumber');
  const erOrderDateTime = document.getElementById('erOrderDateTime');
  const erItemRowsContainer = document.getElementById('erItemRowsContainer');
  const erBtnAddItem = document.getElementById('erBtnAddItem');
  const erPaymentMethod = document.getElementById('erPaymentMethod');
  const erNotesInput = document.getElementById('erNotesInput');
  const erToggleShowOriginal = document.getElementById('erToggleShowOriginal');
  const erToggleShowRequest = document.getElementById('erToggleShowRequest');
  const erToggleShowNotes = document.getElementById('erToggleShowNotes');

  const erBtnGeneratePng = document.getElementById('erBtnGeneratePng');
  const erBtnShare = document.getElementById('erBtnShare');
  const erBtnSaveReceipt = document.getElementById('erBtnSaveReceipt');
  const erBtnPrintPdf = document.getElementById('erBtnPrintPdf');
  const erBtnResetForm = document.getElementById('erBtnResetForm');

  const ereceiptPaperPreview = document.getElementById('ereceiptPaperPreview');
  const erHistorySearchInput = document.getElementById('erHistorySearchInput');
  const erHistoryListContainer = document.getElementById('erHistoryListContainer');

  const erMasterCategoryTabs = document.getElementById('erMasterCategoryTabs');
  const erMasterProductsList = document.getElementById('erMasterProductsList');
  const erBtnAddMasterProduct = document.getElementById('erBtnAddMasterProduct');
  const erMasterProductModal = document.getElementById('erMasterProductModal');
  const erProductForm = document.getElementById('erProductForm');
  const erReceiptViewModal = document.getElementById('erReceiptViewModal');
  const erModalPaperPreview = document.getElementById('erModalPaperPreview');
  const erModalBtnDownloadPng = document.getElementById('erModalBtnDownloadPng');
  const erModalBtnCopyLink = document.getElementById('erModalBtnCopyLink');

  const publicReceiptView = document.getElementById('publicReceiptView');
  const publicReceiptCardContainer = document.getElementById('publicReceiptCardContainer');
  const btnPublicDownloadPng = document.getElementById('btnPublicDownloadPng');
  const btnPublicShare = document.getElementById('btnPublicShare');
  const publicBackToAppBtn = document.getElementById('publicBackToAppBtn');

  let currentViewedReceipt = null;

  // Format IDR Money
  function formatRp(val) {
    if (val === null || val === undefined || isNaN(val)) return 'Rp0';
    return 'Rp' + Math.round(val).toLocaleString('id-ID');
  }

  // Format Date string: "Friday, 4 September 2026, 09:03"
  function getFormattedCurrentDateTime() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const d = new Date();
    const dayName = days[d.getDay()];
    const dayDate = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${dayName}, ${dayDate} ${monthName} ${year}, ${hours}:${mins}`;
  }

  // Sub-tab Navigation Switcher
  function switchErSubTab(subTab) {
    activeErSubTab = subTab;
    [subtabGenBtn, subtabHistBtn, subtabMasterBtn].forEach(btn => btn && btn.classList.remove('active'));
    [ereceiptGeneratorView, ereceiptHistoryView, ereceiptMasterView].forEach(v => v && (v.style.display = 'none'));

    if (subTab === 'generator') {
      if (subtabGenBtn) subtabGenBtn.classList.add('active');
      if (ereceiptGeneratorView) ereceiptGeneratorView.style.display = 'block';
    } else if (subTab === 'history') {
      if (subtabHistBtn) subtabHistBtn.classList.add('active');
      if (ereceiptHistoryView) ereceiptHistoryView.style.display = 'block';
      renderReceiptHistory();
    } else if (subTab === 'master') {
      if (subtabMasterBtn) subtabMasterBtn.classList.add('active');
      if (ereceiptMasterView) ereceiptMasterView.style.display = 'block';
      renderMasterPricing();
    }
  }

  if (subtabGenBtn) subtabGenBtn.addEventListener('click', () => switchErSubTab('generator'));
  if (subtabHistBtn) subtabHistBtn.addEventListener('click', () => switchErSubTab('history'));
  if (subtabMasterBtn) subtabMasterBtn.addEventListener('click', () => switchErSubTab('master'));

  // --- E-RECEIPT CUSTOMIZATION HELPERS ---
  function getDefaultCustomizationState() {
    return {
      cup_size: 'regular',
      sweetness: 'normal_sweet',
      ice: 'normal_ice',
      espresso: 'normal_shot',
      dairy: 'milk',
      syrup: [],
      topping: [],
      item_request: ''
    };
  }

  function calculateCustomizationTotal(customization, brand = 'Fore Coffee') {
    if (!customization) return 0;
    const schema = window.storage.getBrandCustomizationSchema(brand);
    let total = 0;

    if (customization.cup_size && schema.cup_size) {
      const opt = schema.cup_size.options.find(o => o.code === customization.cup_size);
      if (opt && opt.price) total += opt.price;
    }
    if (customization.espresso && schema.espresso) {
      const opt = schema.espresso.options.find(o => o.code === customization.espresso);
      if (opt && opt.price) total += opt.price;
    }
    if (customization.dairy && schema.dairy) {
      const opt = schema.dairy.options.find(o => o.code === customization.dairy);
      if (opt && opt.price) total += opt.price;
    }
    if (Array.isArray(customization.syrup) && schema.syrup) {
      customization.syrup.forEach(code => {
        const opt = schema.syrup.options.find(o => o.code === code);
        if (opt && opt.price) total += opt.price;
      });
    }
    if (Array.isArray(customization.topping) && schema.topping) {
      customization.topping.forEach(code => {
        const opt = schema.topping.options.find(o => o.code === code);
        if (opt && opt.price) total += opt.price;
      });
    }

    return total;
  }

  function getCompactCustomizationLines(customization, brand = 'Fore Coffee') {
    if (!customization) return [];
    const schema = window.storage.getBrandCustomizationSchema(brand);

    const line1Parts = [];
    const line2Parts = [];
    const line3Parts = [];
    const line4Parts = [];

    // Line 1: Cup Size, Sweetness, Ice
    if (customization.cup_size && schema.cup_size) {
      const opt = schema.cup_size.options.find(o => o.code === customization.cup_size);
      if (opt && !opt.default) line1Parts.push(opt.display || opt.name);
    }
    if (customization.sweetness && schema.sweetness) {
      const opt = schema.sweetness.options.find(o => o.code === customization.sweetness);
      if (opt && !opt.default) line1Parts.push(opt.display || opt.name);
    }
    if (customization.ice && schema.ice) {
      const opt = schema.ice.options.find(o => o.code === customization.ice);
      if (opt && !opt.default) line1Parts.push(opt.display || opt.name);
    }

    // Line 2: Espresso, Dairy
    if (customization.espresso && schema.espresso) {
      const opt = schema.espresso.options.find(o => o.code === customization.espresso);
      if (opt && !opt.default) line2Parts.push(opt.display || opt.name);
    }
    if (customization.dairy && schema.dairy) {
      const opt = schema.dairy.options.find(o => o.code === customization.dairy);
      if (opt && !opt.default) line2Parts.push(opt.display || opt.name);
    }

    // Line 3: Syrup, Topping
    if (Array.isArray(customization.syrup) && schema.syrup) {
      customization.syrup.forEach(code => {
        const opt = schema.syrup.options.find(o => o.code === code);
        if (opt) line3Parts.push(`${opt.display || opt.name} Syrup`);
      });
    }
    if (Array.isArray(customization.topping) && schema.topping) {
      customization.topping.forEach(code => {
        const opt = schema.topping.options.find(o => o.code === code);
        if (opt) line3Parts.push(opt.display || opt.name);
      });
    }

    // Line 4: Item Request text
    if (customization.item_request && customization.item_request.trim()) {
      line4Parts.push(`Req: "${customization.item_request.trim()}"`);
    }

    const lines = [];
    if (line1Parts.length > 0) lines.push(line1Parts.join(' • '));
    if (line2Parts.length > 0) lines.push(line2Parts.join(' • '));
    if (line3Parts.length > 0) lines.push(line3Parts.join(' • '));
    if (line4Parts.length > 0) lines.push(line4Parts.join(' • '));

    return lines;
  }

  // Initialize Default Form Values
  function initErFormDefaults() {
    if (erOrderDateTime && !erOrderDateTime.value) {
      erOrderDateTime.value = getFormattedCurrentDateTime();
    }
    if (erTransNumber && !erTransNumber.value) {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const timePart = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0');
      erTransNumber.value = `#${yy}${mm}${dd}${timePart}`;
    }

    if (erItemRows.length === 0) {
      const products = window.storage.getReceiptProducts('Fore Coffee').filter(p => p.active);
      const prod1 = products.find(p => p.product_name.includes('Butterscotch')) || products[0];
      const prod2 = products.find(p => p.product_name.includes('Americano')) || products[1];

      if (prod1) {
        erItemRows.push({
          rowId: `row-${Date.now()}-1`,
          product_id: prod1.id,
          product_name: prod1.product_name,
          size: '',
          qty: 2,
          original_price: prod1.original_price,
          discounted_price: prod1.discounted_price,
          showCustomPanel: false,
          customization: getDefaultCustomizationState()
        });
      }
      if (prod2) {
        erItemRows.push({
          rowId: `row-${Date.now()}-2`,
          product_id: prod2.id,
          product_name: prod2.product_name,
          size: '',
          qty: 1,
          original_price: prod2.original_price,
          discounted_price: prod2.discounted_price,
          showCustomPanel: false,
          customization: getDefaultCustomizationState()
        });
      }
    }
    renderItemRows();
    updateReceiptPreview();
  }

  // Render Form Item Rows with Accordion Customization Panel
  function renderItemRows() {
    if (!erItemRowsContainer) return;
    const brand = erBrandSelect ? erBrandSelect.value : 'Fore Coffee';
    const products = window.storage.getReceiptProducts(brand).filter(p => p.active);
    const schema = window.storage.getBrandCustomizationSchema(brand);

    let html = '';
    erItemRows.forEach((row, idx) => {
      let productOptions = products.map(p => `
        <option value="${p.id}" ${p.id === row.product_id ? 'selected' : ''}>
          ${p.product_name} (${p.original_price ? formatRp(p.original_price) : 'UNKNOWN'} -> Jasdor: ${formatRp(p.discounted_price)})
        </option>
      `).join('');

      const customAddonTotal = calculateCustomizationTotal(row.customization, brand);
      const unitJasdorPrice = row.discounted_price + customAddonTotal;

      html += `
        <div class="er-item-row" data-row-id="${row.rowId}">
          <div class="er-item-row-head">
            <span style="font-weight: 700; font-size: 11px; color: var(--secondary-navy); width: 20px;">#${idx + 1}</span>
            <select class="form-control er-prod-select" style="flex: 1; font-size: 12px;" onchange="window.updateErRowProduct('${row.rowId}', this.value)">
              ${productOptions}
            </select>
            <button type="button" class="btn-toggle-customization ${row.showCustomPanel ? 'active' : ''}" onclick="window.toggleErRowCustomPanel('${row.rowId}')">
              ⚙️ Customization ${customAddonTotal > 0 ? `(+${formatRp(customAddonTotal)})` : ''}
            </button>
            <button type="button" class="btn-remove-item-row" onclick="window.removeErRow('${row.rowId}')">✕ Hapus</button>
          </div>

          <div class="er-item-row-prices" style="margin-top: 6px;">
            <div style="width: 70px;">
              <label style="font-size: 10px; font-weight: 700; color: var(--text-muted);">Qty</label>
              <input type="number" class="form-control" style="padding: 4px 6px; font-size: 12px; height: 32px;" value="${row.qty}" min="1" onchange="window.updateErRowQty('${row.rowId}', this.value)">
            </div>
            <div style="flex: 1; font-size: 11px; color: var(--text-muted); display: flex; flex-direction: column; justify-content: center;">
              <div>Jasdor Dasar: <strong style="color: var(--secondary-navy);">${formatRp(row.discounted_price)}</strong></div>
              ${customAddonTotal > 0 ? `<div>Add-ons: <strong style="color: #16A34A;">+${formatRp(customAddonTotal)}</strong></div>` : ''}
            </div>
            <div style="text-align: right; min-width: 110px;">
              <label style="font-size: 10px; font-weight: 700; color: var(--text-muted);">Total Item (${row.qty}x)</label>
              <div style="font-weight: 800; font-size: 13px; color: var(--primary-orange); margin-top: 2px;">
                ${formatRp(unitJasdorPrice * row.qty)}
              </div>
            </div>
          </div>

          ${row.showCustomPanel ? renderCustomizationPanelHtml(row, schema) : ''}
        </div>
      `;
    });

    erItemRowsContainer.innerHTML = html;
  }

  function renderCustomizationPanelHtml(row, schema) {
    const cust = row.customization || getDefaultCustomizationState();
    const brand = erBrandSelect ? erBrandSelect.value : 'Fore Coffee';
    const customAddonPrice = calculateCustomizationTotal(cust, brand);
    const unitPrice = row.discounted_price + customAddonPrice;

    const makeRadioGroup = (key, categoryData) => {
      const selectedCode = cust[key] || (categoryData.options.find(o => o.default) || categoryData.options[0]).code;
      return `
        <div class="er-custom-section">
          <div class="er-custom-section-title">${categoryData.category}</div>
          <div class="er-custom-options-wrap">
            ${categoryData.options.map(opt => `
              <label class="er-custom-radio-pill">
                <input type="radio" name="custom_${row.rowId}_${key}" value="${opt.code}" ${selectedCode === opt.code ? 'checked' : ''} onchange="window.setErRowCustomOption('${row.rowId}', '${key}', '${opt.code}')">
                <span>${opt.name}</span>
                ${opt.price ? `<span class="er-custom-price-tag">+${formatRp(opt.price)}</span>` : ''}
              </label>
            `).join('')}
          </div>
        </div>
      `;
    };

    const makeCheckboxGroup = (key, categoryData) => {
      const selectedArr = Array.isArray(cust[key]) ? cust[key] : [];
      return `
        <div class="er-custom-section">
          <div class="er-custom-section-title">
            <span>${categoryData.category}</span>
            <span style="font-size: 10px; font-weight: 600; color: var(--text-muted);">Maks. 2 pilihan</span>
          </div>
          <div class="er-custom-options-wrap">
            ${categoryData.options.map(opt => {
              const isChecked = selectedArr.includes(opt.code);
              return `
                <label class="er-custom-checkbox-pill">
                  <input type="checkbox" value="${opt.code}" ${isChecked ? 'checked' : ''} onchange="window.toggleErRowCustomCheckbox('${row.rowId}', '${key}', '${opt.code}', this.checked)">
                  <span>${opt.name}</span>
                  ${opt.price ? `<span class="er-custom-price-tag">+${formatRp(opt.price)}</span>` : ''}
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `;
    };

    return `
      <div class="er-item-custom-panel">
        ${makeRadioGroup('cup_size', schema.cup_size)}
        ${makeRadioGroup('sweetness', schema.sweetness)}
        ${makeRadioGroup('ice', schema.ice)}
        ${makeRadioGroup('espresso', schema.espresso)}
        ${makeRadioGroup('dairy', schema.dairy)}
        ${makeCheckboxGroup('syrup', schema.syrup)}
        ${makeCheckboxGroup('topping', schema.topping)}

        <div class="er-custom-section">
          <div class="er-custom-section-title">Request Tambahan Per-Item</div>
          <input type="text" class="form-control" style="font-size: 12px; height: 34px;" placeholder="Contoh: Pisahkan es / Less ice" value="${cust.item_request || ''}" oninput="window.setErRowItemRequest('${row.rowId}', this.value)">
        </div>

        <div class="er-custom-summary-box">
          <div>
            <span>Harga Dasar Jasdor: ${formatRp(row.discounted_price)}</span>
            ${customAddonPrice > 0 ? ` <span style="color: #16A34A;">+ Customization: +${formatRp(customAddonPrice)}</span>` : ''}
          </div>
          <div>
            Harga Per Item: <strong style="color: var(--primary-orange);">${formatRp(unitPrice)}</strong>
          </div>
        </div>
      </div>
    `;
  }

  // Window handlers for customization inputs
  window.toggleErRowCustomPanel = function(rowId) {
    const row = erItemRows.find(r => r.rowId === rowId);
    if (!row) return;
    row.showCustomPanel = !row.showCustomPanel;
    renderItemRows();
  };

  window.setErRowCustomOption = function(rowId, key, val) {
    const row = erItemRows.find(r => r.rowId === rowId);
    if (!row) return;
    if (!row.customization) row.customization = getDefaultCustomizationState();
    row.customization[key] = val;
    renderItemRows();
    updateReceiptPreview();
  };

  window.toggleErRowCustomCheckbox = function(rowId, key, code, isChecked) {
    const row = erItemRows.find(r => r.rowId === rowId);
    if (!row) return;
    if (!row.customization) row.customization = getDefaultCustomizationState();
    if (!Array.isArray(row.customization[key])) row.customization[key] = [];

    if (isChecked) {
      if (row.customization[key].length >= 2) {
        showToast('Maksimal 2 pilihan untuk ' + key, 'error');
        renderItemRows();
        return;
      }
      if (!row.customization[key].includes(code)) {
        row.customization[key].push(code);
      }
    } else {
      row.customization[key] = row.customization[key].filter(c => c !== code);
    }
    renderItemRows();
    updateReceiptPreview();
  };

  window.setErRowItemRequest = function(rowId, text) {
    const row = erItemRows.find(r => r.rowId === rowId);
    if (!row) return;
    if (!row.customization) row.customization = getDefaultCustomizationState();
    row.customization.item_request = text;
    updateReceiptPreview();
  };

  // Row item actions attached to window
  window.updateErRowProduct = function(rowId, productId) {
    const row = erItemRows.find(r => r.rowId === rowId);
    if (!row) return;
    const prod = window.storage.getReceiptProductById(productId);
    if (prod) {
      row.product_id = prod.id;
      row.product_name = prod.product_name;
      row.original_price = prod.original_price;
      row.discounted_price = prod.discounted_price;
    }
    renderItemRows();
    updateReceiptPreview();
  };

  window.updateErRowQty = function(rowId, qtyVal) {
    const row = erItemRows.find(r => r.rowId === rowId);
    if (!row) return;
    row.qty = Math.max(1, parseInt(qtyVal, 10) || 1);
    renderItemRows();
    updateReceiptPreview();
  };

  window.updateErRowSize = function(rowId, sizeVal) {
    const row = erItemRows.find(r => r.rowId === rowId);
    if (!row) return;
    row.size = sizeVal;
    updateReceiptPreview();
  };

  window.removeErRow = function(rowId) {
    if (erItemRows.length <= 1) {
      showToast('Minimal harus ada 1 item order.', 'error');
      return;
    }
    erItemRows = erItemRows.filter(r => r.rowId !== rowId);
    renderItemRows();
    updateReceiptPreview();
  };

  if (erBtnAddItem) {
    erBtnAddItem.addEventListener('click', () => {
      const brand = erBrandSelect ? erBrandSelect.value : 'Fore Coffee';
      const products = window.storage.getReceiptProducts(brand).filter(p => p.active);
      if (products.length === 0) return;
      const firstProd = products[0];

      erItemRows.push({
        rowId: `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        product_id: firstProd.id,
        product_name: firstProd.product_name,
        size: '',
        qty: 1,
        original_price: firstProd.original_price,
        discounted_price: firstProd.discounted_price,
        showCustomPanel: false,
        customization: getDefaultCustomizationState()
      });

      renderItemRows();
      updateReceiptPreview();
    });
  }

  // Update Realtime Preview
  function updateReceiptPreview() {
    if (!ereceiptPaperPreview) return;

    const brand = erBrandSelect ? erBrandSelect.value : 'Fore Coffee';
    const outletName = erOutletName ? erOutletName.value.trim() || 'Sipin' : 'Sipin';
    const outletCity = erOutletCity ? erOutletCity.value.trim() || 'Jambi' : 'Jambi';
    const outletAddress = erOutletAddress ? erOutletAddress.value.trim() || '' : '';
    const customerName = erCustomerName ? erCustomerName.value.trim() || 'CUSTOMER' : 'CUSTOMER';
    const customerRequest = erCustomerRequest ? erCustomerRequest.value.trim() || '' : '';
    const pickupNumber = erPickupNumber ? erPickupNumber.value.trim() || '1021' : '1021';
    const transNumber = erTransNumber ? erTransNumber.value.trim() || '#260914070516' : '#260914070516';
    const dateTimeStr = erOrderDateTime ? erOrderDateTime.value.trim() || getFormattedCurrentDateTime() : getFormattedCurrentDateTime();
    const paymentMethod = erPaymentMethod ? erPaymentMethod.value : 'QRIS';
    const notes = erNotesInput ? erNotesInput.value.trim() || '' : '';

    const showOriginal = erToggleShowOriginal ? erToggleShowOriginal.checked : false;
    const showRequest = erToggleShowRequest ? erToggleShowRequest.checked : true;
    const showNotes = erToggleShowNotes ? erToggleShowNotes.checked : true;

    let totalQty = 0;
    let originalTotal = 0;
    let discountedTotal = 0;

    let itemsHtml = '';
    erItemRows.forEach(item => {
      totalQty += item.qty;
      const customAddonTotal = calculateCustomizationTotal(item.customization, brand);
      const unitJasdorPrice = item.discounted_price + customAddonTotal;
      const baseOrig = item.original_price !== null ? item.original_price : item.discounted_price;
      const unitOrigPrice = baseOrig + customAddonTotal;

      const rowJasdorTotal = unitJasdorPrice * item.qty;
      const rowOrigTotal = unitOrigPrice * item.qty;

      originalTotal += rowOrigTotal;
      discountedTotal += rowJasdorTotal;

      const customLines = getCompactCustomizationLines(item.customization, brand);

      itemsHtml += `
        <div style="margin-bottom: 8px;">
          <div class="tr-item-line">
            <span class="tr-item-name">${item.qty}x ${item.product_name}</span>
            <span class="tr-item-price">${formatRp(rowJasdorTotal)}</span>
          </div>
          ${customLines.map(line => `<div class="tr-item-custom-text">${line}</div>`).join('')}
        </div>
      `;
    });

    const savingsTotal = originalTotal - discountedTotal;

    const receiptHtml = `
      <div class="tr-header">
        <div class="tr-title">E-RECEIPT</div>
        <div class="tr-brand-name">${brand}</div>
        <div class="tr-outlet-info">${outletName}, ${outletCity}</div>
        ${outletAddress ? `<div class="tr-outlet-info">${outletAddress}</div>` : ''}
      </div>

      <div class="tr-dashed-line"></div>

      <div class="tr-pickup-box">
        <div class="tr-pickup-number">${pickupNumber}</div>
        <div class="tr-pickup-label">Pick up Order</div>
      </div>

      <div class="tr-customer-info">
        <div>Nama Customer: <span class="tr-customer-name">${customerName}</span></div>
        <div>${dateTimeStr}</div>
        <div class="tr-trans-id">${transNumber}</div>
      </div>

      <div class="tr-dashed-line"></div>

      <div class="tr-order-head">
        <span>Order</span>
        <span>Total Order: ${totalQty}</span>
      </div>

      <div class="tr-order-items">
        ${itemsHtml}
      </div>

      ${showRequest && customerRequest ? `
      <div class="tr-request-box">
        <strong>Request:</strong> "${customerRequest}"
      </div>
      ` : ''}

      <div class="tr-dashed-line"></div>

      <div class="tr-totals-section">
        ${showOriginal ? `
        <div class="tr-total-row">
          <span>Sub Total</span>
          <span>${formatRp(originalTotal)}</span>
        </div>
        <div class="tr-total-row" style="color: #16A34A; font-weight: 600;">
          <span>Voucher Discount / Savings</span>
          <span>-${formatRp(savingsTotal)}</span>
        </div>
        ` : ''}

        <div class="tr-total-row highlight">
          <span>Total Pembayaran</span>
          <span>${formatRp(discountedTotal)}</span>
        </div>

        <div class="tr-total-row" style="margin-top: 6px;">
          <span>Metode Pembayaran</span>
          <span style="font-weight: 700; color: #0F172A;">${paymentMethod}</span>
        </div>

        ${showNotes && notes ? `
        <div class="tr-total-row" style="margin-top: 4px; font-size: 11px;">
          <span>Catatan</span>
          <span>${notes}</span>
        </div>
        ` : ''}
      </div>

      <div class="tr-dashed-line"></div>

      <div class="tr-footer">
        Terima Kasih ♡
      </div>
    `;

    ereceiptPaperPreview.innerHTML = receiptHtml;
  }

  // Attach live update listeners to form controls
  [erBrandSelect, erOutletName, erOutletCity, erOutletAddress, erCustomerName, erCustomerRequest, erPickupNumber, erTransNumber, erOrderDateTime, erPaymentMethod, erNotesInput, erToggleShowOriginal, erToggleShowRequest, erToggleShowNotes].forEach(el => {
    if (el) {
      el.addEventListener('input', updateReceiptPreview);
      el.addEventListener('change', updateReceiptPreview);
    }
  });

  // Export PNG Function
  async function generateReceiptPngBlob(targetElement) {
    if (!window.html2canvas) {
      showToast('Library html2canvas belum dimuat.', 'error');
      return null;
    }

    try {
      const canvas = await window.html2canvas(targetElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false
      });

      return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/png');
      });
    } catch (err) {
      showToast('Gagal membuat gambar PNG.', 'error');
      return null;
    }
  }

  async function handleDownloadPng(targetElement, fileName = 'E-Receipt.png') {
    showToast('Memproses gambar PNG high-res…', 'info');
    const blob = await generateReceiptPngBlob(targetElement);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('PNG berhasil didownload!', 'success');
  }

  async function handleSharePng(targetElement, fileName = 'E-Receipt.png', customerName = '') {
    showToast('Memproses untuk share…', 'info');
    const blob = await generateReceiptPngBlob(targetElement);
    if (!blob) return;

    const file = new File([blob], fileName, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'E-Receipt Customer',
          text: `E-Receipt Customer ${customerName}`
        });
        showToast('Berhasil dishare!', 'success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleDownloadPng(targetElement, fileName);
        }
      }
    } else {
      showToast('Web Share tidak didukung di browser ini. Mengunduh PNG…', 'info');
      handleDownloadPng(targetElement, fileName);
    }
  }

  // Button Listeners Generator
  if (erBtnGeneratePng) {
    erBtnGeneratePng.addEventListener('click', () => {
      const custName = erCustomerName ? erCustomerName.value.trim() || 'Customer' : 'Customer';
      const pickNo = erPickupNumber ? erPickupNumber.value.trim() || '1001' : '1001';
      handleDownloadPng(ereceiptPaperPreview, `Receipt_${custName}_${pickNo}.png`);
    });
  }

  if (erBtnShare) {
    erBtnShare.addEventListener('click', () => {
      const custName = erCustomerName ? erCustomerName.value.trim() || 'Customer' : 'Customer';
      const pickNo = erPickupNumber ? erPickupNumber.value.trim() || '1001' : '1001';
      handleSharePng(ereceiptPaperPreview, `Receipt_${custName}_${pickNo}.png`, custName);
    });
  }

  if (erBtnPrintPdf) {
    erBtnPrintPdf.addEventListener('click', () => {
      window.print();
    });
  }

  if (erBtnSaveReceipt) {
    erBtnSaveReceipt.addEventListener('click', () => {
      const receiptNo = window.storage.generateReceiptNumber();
      const originalTotal = erItemRows.reduce((sum, i) => sum + (i.qty * (i.original_price !== null ? i.original_price : i.discounted_price)), 0);
      const finalTotal = erItemRows.reduce((sum, i) => sum + (i.qty * i.discounted_price), 0);

      const receiptObj = {
        receipt_number: receiptNo,
        brand: erBrandSelect ? erBrandSelect.value || 'Fore Coffee' : 'Fore Coffee',
        outlet_name: erOutletName ? erOutletName.value.trim() || 'Sipin' : 'Sipin',
        outlet_city: erOutletCity ? erOutletCity.value.trim() || 'Jambi' : 'Jambi',
        outlet_address: erOutletAddress ? erOutletAddress.value.trim() || '' : '',
        customer_name: erCustomerName ? erCustomerName.value.trim() || 'CUSTOMER' : 'CUSTOMER',
        request_text: erCustomerRequest ? erCustomerRequest.value.trim() || '' : '',
        pickup_number: erPickupNumber ? erPickupNumber.value.trim() || '1021' : '1021',
        transaction_number: erTransNumber ? erTransNumber.value.trim() || '#260914070516' : '#260914070516',
        order_date_time: erOrderDateTime ? erOrderDateTime.value.trim() || getFormattedCurrentDateTime() : getFormattedCurrentDateTime(),
        payment_method: erPaymentMethod ? erPaymentMethod.value : 'QRIS',
        notes_text: erNotesInput ? erNotesInput.value.trim() || '' : '',
        show_original_price: erToggleShowOriginal ? erToggleShowOriginal.checked : false,
        show_request: erToggleShowRequest ? erToggleShowRequest.checked : true,
        show_notes: erToggleShowNotes ? erToggleShowNotes.checked : true,
        original_total: originalTotal,
        discount_total: originalTotal - finalTotal,
        final_total: finalTotal,
        items: JSON.parse(JSON.stringify(erItemRows)),
        created_at: new Date().toISOString()
      };

      window.storage.saveReceipt(receiptObj);
      showToast(`Receipt ${receiptNo} berhasil disimpan!`, 'success');
      switchErSubTab('history');
    });
  }

  if (erBtnResetForm) {
    erBtnResetForm.addEventListener('click', () => {
      if (confirm('Reset isi form receipt?')) {
        if (erCustomerName) erCustomerName.value = '';
        if (erCustomerRequest) erCustomerRequest.value = '';
        if (erPickupNumber) erPickupNumber.value = String(Math.floor(1000 + Math.random() * 9000));
        if (erNotesInput) erNotesInput.value = '';
        if (erOrderDateTime) erOrderDateTime.value = getFormattedCurrentDateTime();

        erItemRows = [];
        initErFormDefaults();
        showToast('Form direset.');
      }
    });
  }

  // Render Receipt History
  function renderReceiptHistory() {
    if (!erHistoryListContainer) return;
    const receipts = window.storage.getReceipts();
    const query = (erHistorySearchInput ? erHistorySearchInput.value.trim() : '').toLowerCase();

    const filtered = receipts.filter(r => {
      if (!query) return true;
      return (
        r.receipt_number.toLowerCase().includes(query) ||
        r.customer_name.toLowerCase().includes(query) ||
        r.outlet_name.toLowerCase().includes(query) ||
        r.brand.toLowerCase().includes(query)
      );
    });

    if (filtered.length === 0) {
      erHistoryListContainer.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">
          Belum ada receipt yang disimpan.
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(r => {
      html += `
        <div class="er-history-card">
          <div>
            <div style="font-weight: 800; font-size: 13px; color: var(--secondary-navy);">${r.receipt_number}</div>
            <div style="font-size: 12px; font-weight: 600; color: var(--text-color); margin-top: 2px;">
              ${r.customer_name} • <span style="color: var(--text-muted);">${r.brand} (${r.outlet_name})</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
              ${formatRp(r.final_total)} • ${r.payment_method} • ${new Date(r.created_at).toLocaleDateString('id-ID')}
            </div>
          </div>

          <div style="display: flex; gap: 6px;">
            <button type="button" class="history-filter-btn" onclick="window.viewReceiptDetail('${r.receipt_number}')" title="Lihat">
              👁️
            </button>
            <button type="button" class="history-filter-btn" onclick="window.duplicateReceipt('${r.receipt_number}')" title="Duplicate">
              📋
            </button>
            <button type="button" class="history-filter-btn" onclick="window.copyPublicReceiptLink('${r.receipt_number}')" title="Copy Link">
              🔗
            </button>
            <button type="button" class="history-filter-btn" onclick="window.deleteReceiptItem('${r.id}')" style="color: #EF4444;" title="Hapus">
              🗑️
            </button>
          </div>
        </div>
      `;
    });

    erHistoryListContainer.innerHTML = html;
  }

  if (erHistorySearchInput) {
    erHistorySearchInput.addEventListener('input', renderReceiptHistory);
  }

  // Global window functions for receipt history
  window.viewReceiptDetail = function(receiptNo) {
    const r = window.storage.getReceiptByNumber(receiptNo);
    if (!r) return;
    currentViewedReceipt = r;

    const titleEl = document.getElementById('erModalReceiptNumberTitle');
    if (titleEl) titleEl.textContent = `Receipt ${r.receipt_number}`;
    renderReceiptToElement(r, erModalPaperPreview);
    openModal(erReceiptViewModal);
  };

  window.duplicateReceipt = function(receiptNo) {
    const r = window.storage.getReceiptByNumber(receiptNo);
    if (!r) return;

    if (erBrandSelect) erBrandSelect.value = r.brand;
    if (erOutletName) erOutletName.value = r.outlet_name;
    if (erOutletCity) erOutletCity.value = r.outlet_city;
    if (erOutletAddress) erOutletAddress.value = r.outlet_address || '';
    if (erCustomerName) erCustomerName.value = r.customer_name;
    if (erCustomerRequest) erCustomerRequest.value = r.request_text || '';
    if (erPickupNumber) erPickupNumber.value = String(Math.floor(1000 + Math.random() * 9000));
    if (erPaymentMethod) erPaymentMethod.value = r.payment_method;
    if (erNotesInput) erNotesInput.value = r.notes_text || '';
    if (erToggleShowOriginal) erToggleShowOriginal.checked = r.show_original_price;

    erItemRows = JSON.parse(JSON.stringify(r.items));
    switchErSubTab('generator');
    renderItemRows();
    updateReceiptPreview();
    showToast(`Data receipt ${receiptNo} diduplikasi ke form!`, 'success');
  };

  window.copyPublicReceiptLink = function(receiptNo) {
    const url = `${window.location.origin}${window.location.pathname}#receipt/${receiptNo}`;
    copyToClipboard(url, 'Link public receipt');
  };

  window.deleteReceiptItem = function(id) {
    if (confirm('Hapus receipt ini dari riwayat?')) {
      window.storage.deleteReceipt(id);
      showToast('Receipt dihapus dari riwayat.');
      renderReceiptHistory();
    }
  };

  if (erModalBtnDownloadPng) {
    erModalBtnDownloadPng.addEventListener('click', () => {
      if (!currentViewedReceipt) return;
      handleDownloadPng(erModalPaperPreview, `Receipt_${currentViewedReceipt.customer_name}_${currentViewedReceipt.receipt_number}.png`);
    });
  }

  if (erModalBtnCopyLink) {
    erModalBtnCopyLink.addEventListener('click', () => {
      if (!currentViewedReceipt) return;
      window.copyPublicReceiptLink(currentViewedReceipt.receipt_number);
    });
  }

  // Render Receipt object into any container
  function renderReceiptToElement(r, container) {
    if (!container) return;
    const brand = r.brand || 'Fore Coffee';
    let itemsHtml = '';
    r.items.forEach(item => {
      const customAddonTotal = calculateCustomizationTotal(item.customization, brand);
      const unitJasdorPrice = item.discounted_price + customAddonTotal;
      const rowJasdorTotal = unitJasdorPrice * item.qty;

      const customLines = getCompactCustomizationLines(item.customization, brand);

      itemsHtml += `
        <div style="margin-bottom: 8px;">
          <div class="tr-item-line">
            <span class="tr-item-name">${item.qty}x ${item.product_name}</span>
            <span class="tr-item-price">${formatRp(rowJasdorTotal)}</span>
          </div>
          ${customLines.map(line => `<div class="tr-item-custom-text">${line}</div>`).join('')}
        </div>
      `;
    });

    container.innerHTML = `
      <div class="tr-header">
        <div class="tr-title">E-RECEIPT</div>
        <div class="tr-brand-name">${r.brand}</div>
        <div class="tr-outlet-info">${r.outlet_name}, ${r.outlet_city}</div>
        ${r.outlet_address ? `<div class="tr-outlet-info">${r.outlet_address}</div>` : ''}
      </div>

      <div class="tr-dashed-line"></div>

      <div class="tr-pickup-box">
        <div class="tr-pickup-number">${r.pickup_number || '1021'}</div>
        <div class="tr-pickup-label">Pick up Order</div>
      </div>

      <div class="tr-customer-info">
        <div>Nama Customer: <span class="tr-customer-name">${r.customer_name}</span></div>
        <div>${r.order_date_time || new Date(r.created_at).toLocaleString('id-ID')}</div>
        <div class="tr-trans-id">${r.transaction_number || r.receipt_number}</div>
      </div>

      <div class="tr-dashed-line"></div>

      <div class="tr-order-head">
        <span>Order</span>
      </div>

      <div class="tr-order-items">
        ${itemsHtml}
      </div>

      ${r.show_request && r.request_text ? `
      <div class="tr-request-box">
        <strong>Request:</strong> "${r.request_text}"
      </div>
      ` : ''}

      <div class="tr-dashed-line"></div>

      <div class="tr-totals-section">
        ${r.show_original_price ? `
        <div class="tr-total-row">
          <span>Sub Total</span>
          <span>${formatRp(r.original_total)}</span>
        </div>
        <div class="tr-total-row" style="color: #16A34A; font-weight: 600;">
          <span>Voucher Discount / Savings</span>
          <span>-${formatRp(r.discount_total)}</span>
        </div>
        ` : ''}

        <div class="tr-total-row highlight">
          <span>Total Pembayaran</span>
          <span>${formatRp(r.final_total)}</span>
        </div>

        <div class="tr-total-row" style="margin-top: 6px;">
          <span>Metode Pembayaran</span>
          <span style="font-weight: 700; color: #0F172A;">${r.payment_method}</span>
        </div>

        ${r.show_notes && r.notes_text ? `
        <div class="tr-total-row" style="margin-top: 4px; font-size: 11px;">
          <span>Catatan</span>
          <span>${r.notes_text}</span>
        </div>
        ` : ''}
      </div>

      <div class="tr-dashed-line"></div>

      <div class="tr-footer">
        Terima Kasih ♡
      </div>
    `;
  }

  // Render Master Pricing View
  function renderMasterPricing() {
    if (!erMasterProductsList) return;
    const brand = erBrandSelect ? erBrandSelect.value || 'Fore Coffee' : 'Fore Coffee';
    const products = window.storage.getReceiptProducts(brand);

    const categories = ['ALL', ...new Set(products.map(p => p.category))];
    if (erMasterCategoryTabs) {
      erMasterCategoryTabs.innerHTML = categories.map(cat => `
        <button type="button" class="master-category-tab ${activeMasterCategory === cat ? 'active' : ''}" onclick="window.switchMasterCategory('${cat}')">
          ${cat}
        </button>
      `).join('');
    }

    const filtered = products.filter(p => activeMasterCategory === 'ALL' || p.category === activeMasterCategory);

    let html = '';
    filtered.forEach(p => {
      html += `
        <div class="master-product-card">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: var(--primary-orange);">${p.category}</div>
            <div style="font-size: 13px; font-weight: 800; color: var(--secondary-navy); margin-top: 2px;">${p.product_name}</div>
            <div style="font-size: 12px; margin-top: 4px;">
              Original: <span style="text-decoration: line-through; color: var(--text-muted);">${p.original_price ? formatRp(p.original_price) : 'UNKNOWN'}</span>
              • Jasdor: <strong style="color: #16A34A;">${formatRp(p.discounted_price)}</strong>
            </div>
          </div>
          <button type="button" class="history-filter-btn" onclick="window.openEditMasterProduct('${p.id}')">
            ✏️ Edit
          </button>
        </div>
      `;
    });

    erMasterProductsList.innerHTML = html;
  }

  window.switchMasterCategory = function(cat) {
    activeMasterCategory = cat;
    renderMasterPricing();
  };

  if (erBtnAddMasterProduct) {
    erBtnAddMasterProduct.addEventListener('click', () => {
      if (erProductForm) erProductForm.reset();
      const idInput = document.getElementById('erProductId');
      const titleInput = document.getElementById('erProductModalTitle');
      if (idInput) idInput.value = '';
      if (titleInput) titleInput.textContent = 'Tambah Produk Master Baru';
      openModal(erMasterProductModal);
    });
  }

  window.openEditMasterProduct = function(id) {
    const p = window.storage.getReceiptProductById(id);
    if (!p) return;

    const idInput = document.getElementById('erProductId');
    const brandInput = document.getElementById('erProdBrand');
    const catInput = document.getElementById('erProdCategory');
    const nameInput = document.getElementById('erProdName');
    const origInput = document.getElementById('erProdOriginalPrice');
    const discInput = document.getElementById('erProdDiscountedPrice');
    const activeInput = document.getElementById('erProdActive');
    const titleInput = document.getElementById('erProductModalTitle');

    if (idInput) idInput.value = p.id;
    if (brandInput) brandInput.value = p.brand;
    if (catInput) catInput.value = p.category;
    if (nameInput) nameInput.value = p.product_name;
    if (origInput) origInput.value = p.original_price || '';
    if (discInput) discInput.value = p.discounted_price;
    if (activeInput) activeInput.checked = p.active;

    if (titleInput) titleInput.textContent = 'Edit Produk Master';
    openModal(erMasterProductModal);
  };

  if (erProductForm) {
    erProductForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('erProductId').value;
      const brand = document.getElementById('erProdBrand').value.trim();
      const category = document.getElementById('erProdCategory').value.trim().toUpperCase();
      const name = document.getElementById('erProdName').value.trim();
      const origPriceRaw = document.getElementById('erProdOriginalPrice').value;
      const discPriceRaw = document.getElementById('erProdDiscountedPrice').value;
      const active = document.getElementById('erProdActive').checked;

      const productObj = {
        id: id || `p-${Date.now()}`,
        brand: brand || 'Fore Coffee',
        category: category || 'GENERAL',
        product_name: name,
        original_price: origPriceRaw ? parseInt(origPriceRaw, 10) : null,
        discounted_price: parseInt(discPriceRaw, 10) || 0,
        active: active
      };

      window.storage.addOrUpdateReceiptProduct(productObj);
      closeAllModals();
      showToast('Produk master disimpan!', 'success');
      renderMasterPricing();
      renderItemRows();
      updateReceiptPreview();
    });
  }

  // Check Public Receipt Route (e.g. #receipt/PH2609040001 or ?receipt=PH2609040001)
  function checkPublicReceiptRoute() {
    if (!publicReceiptView) return false;
    let receiptNo = null;
    const hash = window.location.hash;
    const search = window.location.search;

    if (hash && hash.startsWith('#receipt/')) {
      receiptNo = hash.replace('#receipt/', '').trim();
    } else if (search && search.includes('receipt=')) {
      const params = new URLSearchParams(search);
      receiptNo = params.get('receipt');
    }

    if (receiptNo) {
      const r = window.storage.getReceiptByNumber(receiptNo);
      if (r) {
        if (loginScreenView) loginScreenView.style.display = 'none';
        if (dashboardScreenView) dashboardScreenView.style.display = 'none';
        publicReceiptView.style.display = 'flex';

        currentViewedReceipt = r;
        if (publicReceiptCardContainer) {
          publicReceiptCardContainer.innerHTML = '<div id="publicPaperCard" class="thermal-receipt-paper"></div>';
          renderReceiptToElement(r, document.getElementById('publicPaperCard'));
        }
        return true;
      }
    }

    publicReceiptView.style.display = 'none';
    return false;
  }

  window.addEventListener('hashchange', checkPublicReceiptRoute);

  if (publicBackToAppBtn) {
    publicBackToAppBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '';
      checkAuth();
    });
  }

  if (btnPublicDownloadPng) {
    btnPublicDownloadPng.addEventListener('click', () => {
      const card = document.getElementById('publicPaperCard');
      if (card && currentViewedReceipt) {
        handleDownloadPng(card, `Receipt_${currentViewedReceipt.customer_name}_${currentViewedReceipt.receipt_number}.png`);
      }
    });
  }

  if (btnPublicShare) {
    btnPublicShare.addEventListener('click', () => {
      const card = document.getElementById('publicPaperCard');
      if (card && currentViewedReceipt) {
        handleSharePng(card, `Receipt_${currentViewedReceipt.customer_name}_${currentViewedReceipt.receipt_number}.png`, currentViewedReceipt.customer_name);
      }
    });
  }

  // Add E-Receipt initialization inside main setup
  initErFormDefaults();
  checkPublicReceiptRoute();

  // Run Auth check on start
  checkAuth();
});

