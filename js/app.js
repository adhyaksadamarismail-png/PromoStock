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

  // Helper Phone Formatter: 8132 883 0740 or 0856 1234 5678
  function formatPhoneDisplay(phone) {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 12) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8)}`;
    } else if (clean.length === 11) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
    } else if (clean.length === 13) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8)}`;
    } else if (clean.length === 10) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
    }
    return phone;
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

    if (activeTab === 'voucherKopken' || activeTab === 'riwayat') {
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
      importFormatTitle.textContent = 'Format Input: 1 nomor per baris';
      importFormatExample.innerHTML = '085612345678<br>082134567890<br>083145678901';
      bulkTextarea.placeholder = '085612345678\n082134567890\n083145678901';
    } else if (targetTab === 'kopkenBaperan') {
      bulkImportModalTitle.textContent = 'Bulk Import KopKen Baperan';
      importFormatTitle.textContent = 'Format Input: Nomor|PIN per baris';
      importFormatExample.innerHTML = '085612345678|112233<br>082134567890|889900<br>083145678901|556611';
      bulkTextarea.placeholder = '085612345678|112233\n082134567890|889900\n083145678901|556611';
    } else if (targetTab === 'tomoroCoffee') {
      bulkImportModalTitle.textContent = 'Bulk Import Tomoro Coffee';
      importFormatTitle.textContent = 'Format Input: 1 nomor per baris';
      importFormatExample.innerHTML = '081111111111<br>082222222222<br>083333333333';
      bulkTextarea.placeholder = '081111111111\n082222222222\n083333333333';
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

  // Run Auth check on start
  checkAuth();
});
