/**
 * FUNGSI KODE: main.ts
 * Logika Pengendali Utama: Navigasi Menu, Sesi Akun,
 * Alih Mode Tampilan Silsilah Terpusat (Tree, List, Gen, Table),
 * Mode Sejarah Publik Murni (Guest) vs Dashboard Lengkap (Logged in),
 * Modal Koreksi Data, serta Integrasi Statistik Dashboard.
 */
import { renderGenealogyTree, searchAndFocusMember } from "./treeRenderer.js";
import { renderGenealogyList } from "./listRenderer.js";
import { renderByGeneration } from "./generationRenderer.js";
import { renderGenealogyTable } from "./tableRenderer.js";
import { initModals } from "./modalHelper.js";
import { showToast } from "./toast.js";
import { initHistoryTimeline } from "./historyTimeline.js";

const API_BASE_URL = "http://localhost:5001";

// Metadata Teks Master Banner Berdasarkan Mode Tampilan
const viewBannerMeta = {
  tree: {
    tag: "BAGAN GRAFIK SILSILAH",
    subtag: "Pohon Tarombo Interaktif",
    title: "Bagan Pohon Silsilah Raja Sidabukke",
    desc: "Tarik kanvas langsung, gunakan scroll 2-arah / touchpad, atau tombol panah keyboard (← → ↑ ↓) untuk menggeser ke kiri, kanan, atas, dan bawah."
  },
  list: {
    tag: "HIRARKI SILSILAH",
    subtag: "Daftar Terstruktur Pomparan",
    title: "Daftar Tutur & Sundut Berantai",
    desc: "Penelusuran silsilah vertikal bertingkat dari Ompu Parsadaan Raja Sidabukke hingga pomparan di ujung cabang generasi, memudahkan pembacaan urutan tutur berjenjang."
  },
  generation: {
    tag: "SUNDUT & TINGKATAN",
    subtag: "Klasifikasi Generasi Pomparan",
    title: "Silsilah Berdasarkan Sundut (Generasi)",
    desc: "Pengelompokan tokoh keluarga berdasarkan tingkatan sundut dari generasi pertama (G1 Raja Sinalin) hingga generasi penerus saat ini, memudahkan pemahaman kedudukan tutur antar pomparan."
  },
  table: {
    tag: "DIREKTORI DATA",
    subtag: "Pomparan Raja Sidabukke",
    title: "Daftar Tabel Silsilah Lengkap",
    desc: "Rangkuman data seluruh pomparan dalam format tabel direktori, memudahkan verifikasi hubungan tutur orang tua, sundut, parripean, serta bona pasogit."
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // 0. INISIALISASI PENGENDALI MODAL GLOBAL (DETAIL TOKOH & TAMBAH ANAK)
  initModals();

  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("username");
  const userRole = localStorage.getItem("role") || "Anggota Pomparan";
  const savedPhone = localStorage.getItem("user_phone") || "";

  // Variabel untuk menyimpan mode & filter cabang yang sedang aktif
  let currentBranchFilter = "";
  let currentActiveView: "tree" | "list" | "generation" | "table" = "tree";

  // 1. STATUS AUTENTIKASI: GUEST VS LOGGED IN
  const btnGuestLogin = document.getElementById("btn-guest-login");
  const authNavMenu = document.getElementById("auth-nav-menu");
  const pillUserWrapper = document.getElementById("pill-user-wrapper");
  const pillUserName = document.getElementById("pill-user-name");
  const pillAvatar = document.getElementById("pill-avatar-initial");
  const dropdownInfoName = document.getElementById("dropdown-info-name");
  const dropdownInfoRole = document.getElementById("dropdown-info-role");
  const btnPillUser = document.getElementById("btn-pill-user");
  const pillDropdown = document.getElementById("pill-user-dropdown");
  const btnPillLogout = document.getElementById("btn-pill-logout");
  const modalAuth = document.getElementById("modal-auth");

  if (token && savedUser) {
    // Mode Pengguna Masuk (Login)
    if (btnGuestLogin) btnGuestLogin.style.display = "none";
    if (authNavMenu) authNavMenu.style.display = "flex";
    if (pillUserWrapper) pillUserWrapper.style.display = "block";
    if (pillUserName) pillUserName.innerText = savedUser;
    if (dropdownInfoName) dropdownInfoName.innerText = savedUser;
    if (dropdownInfoRole) dropdownInfoRole.innerText = userRole;
    if (pillAvatar) pillAvatar.innerText = savedUser.charAt(0).toUpperCase();

    const setFullName = document.getElementById("set-fullname") as HTMLInputElement;
    const setUsername = document.getElementById("set-username") as HTMLInputElement;
    const setPhone = document.getElementById("set-phone") as HTMLInputElement;

    if (setFullName) setFullName.value = savedUser;
    if (setUsername) setUsername.value = savedUser;
    if (setPhone) setPhone.value = savedPhone;

    btnPillUser?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!pillDropdown) return;
      const isShow = pillDropdown.style.display === "flex";
      pillDropdown.style.display = isShow ? "none" : "flex";
    });

    btnPillLogout?.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("user_phone");
      showToast("Horas! Anda telah keluar dari akun.", "info");
      setTimeout(() => window.location.reload(), 500);
    });
  } else {
    // Mode Tamu (Belum Login)
    if (authNavMenu) authNavMenu.style.display = "none";
    if (pillUserWrapper) pillUserWrapper.style.display = "none";
    if (btnGuestLogin) {
      btnGuestLogin.style.display = "flex";
      btnGuestLogin.addEventListener("click", () => {
        if (modalAuth) modalAuth.classList.add("show");
      });
    }
  }

  // Tutup dropdown akun jika klik di luar area
  document.addEventListener("click", (e) => {
    if (pillDropdown && !pillDropdown.contains(e.target as Node)) {
      pillDropdown.style.display = "none";
    }
  });

  // 2. NAVIGASI MENU UTAMA VIA FLOATING PILL NAVBAR & LOGO BRAND
  const navPillBtns = document.querySelectorAll(".nav-pill-btn");
  const appSections = document.querySelectorAll(".app-viewport > section");

  navPillBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      let targetId = btn.getAttribute("data-target");
      if (!targetId) return;

      const isUserLoggedIn = Boolean(localStorage.getItem("token") && localStorage.getItem("username"));

      // KHUSUS LOGO BRAND: SEBELUM LOGIN ARAHKAN LANGSUNG KE HALAMAN SEJARAH
      if (btn.id === "btn-brand-dashboard") {
        targetId = "view-dashboard";
      }

      navPillBtns.forEach((b) => b.classList.remove("active"));
      appSections.forEach((sec) => ((sec as HTMLElement).style.display = "none"));

      // Aktifkan styling pill navigasi jika ada di menu utama
      const targetNavBtn = document.querySelector(`.nav-pill-btn[data-target="${targetId}"]`);
      if (targetNavBtn) {
        targetNavBtn.classList.add("active");
      }

      const targetSec = document.getElementById(targetId);
      if (targetSec) {
        targetSec.style.display = targetId === "view-tree" ? "flex" : "block";
      }

      if (targetId === "view-tree") {
        switchTreeView(currentActiveView, currentBranchFilter);
      } else if (targetId === "view-dashboard") {
        loadDashboardData(isUserLoggedIn);
      }
    });
  });

  // 3. FUNGSI SAKLAR WADAH 4 TAMPILAN SILSILAH DENGAN MASTER CONTROL BAR
  const cGraphic = document.getElementById("container-tree-graphic");
  const cList = document.getElementById("container-tree-list");
  const cGen = document.getElementById("container-tree-gen");
  const cTable = document.getElementById("container-tree-table");
  const secTree = document.getElementById("view-tree");

  function hideAllTreeContainers() {
    if (cGraphic) cGraphic.style.display = "none";
    if (cList) {
      cList.style.display = "none";
      cList.innerHTML = "";
    }
    if (cGen) {
      cGen.style.display = "none";
      cGen.innerHTML = "";
    }
    if (cTable) {
      cTable.style.display = "none";
      cTable.innerHTML = "";
    }
  }

  function switchTreeView(view: "tree" | "list" | "generation" | "table", branch = "") {
    currentActiveView = view;
    currentBranchFilter = branch;

    // Pastikan section view-tree aktif
    if (secTree) {
      secTree.style.display = "flex";
      secTree.style.flexDirection = "column";
      secTree.style.width = "92%";
      secTree.style.maxWidth = "1100px";
      secTree.style.margin = "0 auto";
      secTree.style.gap = "8px";
    }

    // 1. Update status tombol aktif di sub-bar master
    document.querySelectorAll(".btn-sub-view").forEach((b) => {
      b.classList.remove("active");
      (b as HTMLElement).style.background = "transparent";
    });
    const currentBtn = document.querySelector(`.btn-sub-view[data-view="${view}"]`) as HTMLElement;
    if (currentBtn) {
      currentBtn.classList.add("active");
      currentBtn.style.background = "var(--accent-red, #ef4444)";
    }

    // 2. Update teks Master Banner secara dinamis
    const meta = viewBannerMeta[view];
    if (meta) {
      const elTag = document.getElementById("master-banner-tag");
      const elSubtag = document.getElementById("master-banner-subtag");
      const elTitle = document.getElementById("master-banner-title");
      const elDesc = document.getElementById("master-banner-desc");
      if (elTag) elTag.textContent = meta.tag;
      if (elSubtag) elSubtag.textContent = meta.subtag;
      if (elTitle) elTitle.textContent = meta.title;
      if (elDesc) elDesc.textContent = meta.desc;
    }

    // 3. Sinkronkan nilai dropdown master filter cabang
    const masterFilter = document.getElementById("master-branch-filter") as HTMLSelectElement;
    if (masterFilter && masterFilter.value !== branch) {
      masterFilter.value = branch;
    }

    hideAllTreeContainers();

    // 4. Render tampilan sesuai tab aktif
    if (view === "tree") {
      if (cGraphic) cGraphic.style.display = "block";
      renderGenealogyTree("#genealogy-svg", currentBranchFilter || undefined);
    } else if (view === "list") {
      if (cList) {
        cList.style.display = "block";
        cList.scrollTop = 0;
      }
      renderGenealogyList("#container-tree-list", currentBranchFilter || undefined);
    } else if (view === "generation") {
      if (cGen) {
        cGen.style.display = "block";
        cGen.scrollTop = 0;
      }
      renderByGeneration("#container-tree-gen", currentBranchFilter || undefined);
    } else if (view === "table") {
      if (cTable) {
        cTable.style.display = "block";
        cTable.scrollTop = 0;
      }
      renderGenealogyTable("#container-tree-table", currentBranchFilter || undefined);
    }
  }

  // Delegasi Event Klik Tombol Mode Tampilan (.btn-sub-view) di Master Sub-Bar
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const subBtn = target.closest(".btn-sub-view") as HTMLElement;
    if (subBtn) {
      const viewMode = subBtn.getAttribute("data-view") as "tree" | "list" | "generation" | "table";
      if (viewMode) {
        switchTreeView(viewMode, currentBranchFilter);
      }
    }
  });

  // Delegasi Event Perubahan Dropdown Filter Cabang Terpusat
  document.addEventListener("change", (e) => {
    const target = e.target as HTMLElement;
    if (target.id === "master-branch-filter") {
      const selected = (target as HTMLSelectElement).value;
      switchTreeView(currentActiveView, selected);
    }
  });

  // Render awal pohon silsilah
  switchTreeView("tree", "");

  // Fitur Pencarian Tokoh Silsilah
  const inputSearch = document.getElementById("input-tree-search") as HTMLInputElement;
  const btnSearch = document.getElementById("btn-tree-search");
  const handleSearch = () => {
    const val = inputSearch?.value.trim();
    if (!val) return;
    const found = searchAndFocusMember(val);
    if (!found) {
      showToast(`Tokoh "${val}" ndang tardapot (tidak ditemukan).`, "info");
    }
  };
  btnSearch?.addEventListener("click", handleSearch);
  inputSearch?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  // Tombol Silang 'x' pada Modal Detail Tokoh
  const btnCloseDetailX = document.getElementById("btn-close-detail-x");
  btnCloseDetailX?.addEventListener("click", () => {
    const modalDetail = document.getElementById("modal-member-detail");
    if (modalDetail) {
      modalDetail.classList.remove("show");
      modalDetail.style.display = "none";
    }
  });

  // 4. SUBMIT FORM USULAN PERUBAHAN / KOREKSI DATA SILSILAH
  const formEdit = document.getElementById("form-edit-member") as HTMLFormElement;
  const viewMode = document.getElementById("detail-view-mode");

  formEdit?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const personId = (document.getElementById("edit-member-id") as HTMLInputElement).value;
    const personName = (document.getElementById("detail-name") as HTMLElement).innerText;
    const spouse = (document.getElementById("edit-spouse") as HTMLInputElement).value;
    const origin = (document.getElementById("edit-origin") as HTMLInputElement).value;
    const notes = (document.getElementById("edit-notes") as HTMLTextAreaElement).value;
    const proposer = (document.getElementById("edit-proposer") as HTMLInputElement)?.value || (savedUser || "Tamu Pomparan");

    const payload = {
      proposedName: personName,
      reason: `[Pengusul: ${proposer}] [Tokoh ID: ${personId}] Parripean: ${spouse || "-"} | Huta: ${origin || "-"} | Catatan: ${notes || "-"}`
    };

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/claims`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("Mauliate! Usulan koreksi silsilah berhasil dikirim ke pengurus.", "success");

        const elSpouse = document.getElementById("detail-spouse");
        const elOrigin = document.getElementById("detail-origin");
        const elNotes = document.getElementById("detail-notes");
        if (elSpouse && spouse) elSpouse.innerText = spouse;
        if (elOrigin && origin) elOrigin.innerText = origin;
        if (elNotes && notes) elNotes.innerText = notes;

        const historyBody = document.getElementById("dashboard-history-body");
        if (historyBody) {
          const newRow = document.createElement("tr");
          newRow.style.borderBottom = "1px solid rgba(255,255,255,0.04)";
          newRow.innerHTML = `
            <td style="padding: 8px 10px; color: var(--text-muted);">Baru saja</td>
            <td style="padding: 8px 10px; font-weight: 600; color: #fff;">${personName}</td>
            <td style="padding: 8px 10px; color: var(--text-muted);">${notes || "Usulan pembaruan data silsilah"}</td>
            <td style="padding: 8px 10px;">${proposer}</td>
            <td style="padding: 8px 10px; text-align: right; color: #fbbf24; font-weight: 600;">Menunggu</td>
          `;
          historyBody.prepend(newRow);
        }

        const elClaims = document.getElementById("stat-total-claims");
        if (elClaims && elClaims.innerText !== "-") {
          const currentCount = parseInt(elClaims.innerText) || 0;
          elClaims.innerText = `${currentCount + 1}`;
        }

        formEdit.reset();
        formEdit.style.display = "none";
        if (viewMode) viewMode.style.display = "block";
      } else {
        showToast("Gagal mengirim usulan koreksi.", "error");
      }
    } catch {
      showToast("Koneksi terputus saat mengirim data.", "error");
    }
  });

  // 5. PENGATURAN PROFIL & AKUN
  const formUserSettings = document.getElementById("form-user-settings") as HTMLFormElement;
  formUserSettings?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = (document.getElementById("set-fullname") as HTMLInputElement).value;
    const phone = (document.getElementById("set-phone") as HTMLInputElement).value;
    const passNew = (document.getElementById("set-password-new") as HTMLInputElement).value;
    const passConfirm = (document.getElementById("set-password-confirm") as HTMLInputElement).value;

    if (passNew && passNew !== passConfirm) {
      showToast("Konfirmasi kata sandi baru tidak cocok.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, phone, password: passNew || undefined })
      });

      if (res.ok) {
        localStorage.setItem("username", fullName);
        localStorage.setItem("user_phone", phone);
        if (pillUserName) pillUserName.innerText = fullName;
        showToast("Profil dan preferensi akun berhasil diperbarui.", "success");
        (document.getElementById("set-password-new") as HTMLInputElement).value = "";
        (document.getElementById("set-password-confirm") as HTMLInputElement).value = "";
      } else {
        localStorage.setItem("username", fullName);
        localStorage.setItem("user_phone", phone);
        if (pillUserName) pillUserName.innerText = fullName;
        showToast("Perubahan profil berhasil disimpan lokal.", "success");
      }
    } catch {
      localStorage.setItem("username", fullName);
      localStorage.setItem("user_phone", phone);
      if (pillUserName) pillUserName.innerText = fullName;
      showToast("Profil disimpan secara offline.", "info");
    }
  });

  // 6. PENGATURAN TEMA & BAHASA
  const selectTheme = document.getElementById("select-theme") as HTMLSelectElement;
  const selectLang = document.getElementById("select-lang") as HTMLSelectElement;

  if (selectTheme) {
    selectTheme.value = localStorage.getItem("tarombo_theme") || "dark";
    selectTheme.addEventListener("change", () => {
      const theme = selectTheme.value;
      document.body.setAttribute("data-theme", theme);
      localStorage.setItem("tarombo_theme", theme);
    });
    document.body.setAttribute("data-theme", selectTheme.value);
  }

  if (selectLang) {
    selectLang.value = localStorage.getItem("tarombo_lang") || "id";
    selectLang.addEventListener("change", () => {
      const lang = selectLang.value;
      localStorage.setItem("tarombo_lang", lang);
    });
  }

  // 7. MODAL AUTH (LOGIN & REGISTER)
  const tabBtnLogin = document.getElementById("tab-btn-login");
  const tabBtnRegister = document.getElementById("tab-btn-register");
  const formAuth = document.getElementById("form-auth") as HTMLFormElement;
  const formRegister = document.getElementById("form-register") as HTMLFormElement;
  const btnCloseAuth = document.getElementById("btn-close-auth");

  tabBtnLogin?.addEventListener("click", () => {
    tabBtnLogin.style.background = "var(--accent-red)";
    tabBtnLogin.style.color = "#fff";
    if (tabBtnRegister) {
      tabBtnRegister.style.background = "transparent";
      tabBtnRegister.style.color = "var(--text-muted)";
    }
    if (formAuth) formAuth.style.display = "flex";
    if (formRegister) formRegister.style.display = "none";
  });

  tabBtnRegister?.addEventListener("click", () => {
    tabBtnRegister.style.background = "#059669";
    tabBtnRegister.style.color = "#fff";
    if (tabBtnLogin) {
      tabBtnLogin.style.background = "transparent";
      tabBtnLogin.style.color = "var(--text-muted)";
    }
    if (formAuth) formAuth.style.display = "none";
    if (formRegister) formRegister.style.display = "flex";
  });

  const closeAuth = () => {
    if (modalAuth) modalAuth.classList.remove("show");
  };

  btnCloseAuth?.addEventListener("click", closeAuth);
  modalAuth?.addEventListener("click", (e) => {
    if (e.target === modalAuth) closeAuth();
  });

  formAuth?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = (document.getElementById("auth-identifier") as HTMLInputElement).value;
    const password = (document.getElementById("auth-password") as HTMLInputElement).value;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user?.username || data.user?.fullName || identifier);
        localStorage.setItem("role", data.user?.role || "Anggota Pomparan");
        if (data.user?.contact) localStorage.setItem("user_phone", data.user.contact);

        showToast("Horas! Berhasil masuk akun.", "success");
        closeAuth();
        setTimeout(() => window.location.reload(), 500);
      } else {
        showToast(data.message || "Periksa kembali akun Anda.", "error");
      }
    } catch {
      showToast("Koneksi server gagal.", "error");
    }
  });

  formRegister?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = (document.getElementById("reg-fullname") as HTMLInputElement).value;
    const username = (document.getElementById("reg-username") as HTMLInputElement).value;
    const phone = (document.getElementById("reg-phone") as HTMLInputElement).value;
    const password = (document.getElementById("reg-password") as HTMLInputElement).value;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, username, password, contact: phone })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Akun berhasil dibuat! Silakan masuk.", "success");
        formRegister.reset();
        tabBtnLogin?.click();
      } else {
        showToast(data.message || "Pendaftaran gagal.", "error");
      }
    } catch {
      showToast("Koneksi server gagal.", "error");
    }
  });
});

// 8. SINKRONISASI DATA SEJARAH & STATISTIK DASHBOARD
async function loadDashboardData(isLoggedIn = false) {
  const dashSection = document.getElementById("view-dashboard");

  // Jika tamu (belum login), sembunyikan semua kartu dashboard (termasuk banner tugu)
  // sehingga yang tampil murni hanya linimasa sejarah
  if (dashSection) {
    const allDashboardCards = dashSection.querySelectorAll(".dashboard-card-hover, div[style*='grid-template-columns']");
    allDashboardCards.forEach((el) => {
      (el as HTMLElement).style.display = isLoggedIn ? "" : "none";
    });
  }

  // Linimasa sejarah selalu dirender
  initHistoryTimeline("history-timeline-container");

  // Sesuaikan tombol kembali di dalam linimasa sejarah
  // Jika tamu, tombol di pojok kanan atas linimasa mengarahkan kembali ke pohon silsilah
  setTimeout(() => {
    const btnBackTimeline = document.querySelector("#history-timeline-container button, .btn-back-dashboard, [onclick*='view-dashboard']") as HTMLElement;
    if (btnBackTimeline && !isLoggedIn) {
      btnBackTimeline.innerHTML = `&lsaquo; Mulak tu Bagan Tarombo`;
      btnBackTimeline.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const navTreeBtn = document.querySelector(".nav-pill-btn[data-target='view-tree']") as HTMLElement;
        if (navTreeBtn) {
          navTreeBtn.click();
        } else {
          document.querySelectorAll(".app-viewport > section").forEach((sec) => ((sec as HTMLElement).style.display = "none"));
          const treeSec = document.getElementById("view-tree");
          if (treeSec) treeSec.style.display = "flex";
        }
      };
    }
  }, 60);

  // Jika belum login, hentikan proses (jangan ambil statistik internal admin)
  if (!isLoggedIn) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/genealogy/stats`);
    if (!res.ok) return;

    const { data } = await res.json();
    if (!data) return;

    const elMembers = document.getElementById("stat-total-members");
    const elGen = document.getElementById("stat-total-generations");
    const elClaims = document.getElementById("stat-total-claims");

    if (elMembers) elMembers.innerText = `${data.totalMembers}`;
    if (elGen) elGen.innerText = `${data.totalGenerations}`;
    if (elClaims) elClaims.innerText = `${data.totalClaims}`;

    const total = data.totalMembers || 1;
    const b1 = data.branches?.b1 || 0;
    const b2 = data.branches?.b2 || 0;
    const b3 = data.branches?.b3 || 0;

    const badge1 = document.getElementById("badge-branch-1");
    const badge2 = document.getElementById("badge-branch-2");
    const badge3 = document.getElementById("badge-branch-3");

    if (badge1) badge1.innerText = `${b1} Jiwa`;
    if (badge2) badge2.innerText = `${b2} Jiwa`;
    if (badge3) badge3.innerText = `${b3} Jiwa`;

    const bar1 = document.getElementById("bar-branch-1");
    const bar2 = document.getElementById("bar-branch-2");
    const bar3 = document.getElementById("bar-branch-3");

    if (bar1) bar1.style.width = `${Math.min(100, Math.round((b1 / total) * 100))}%`;
    if (bar2) bar2.style.width = `${Math.min(100, Math.round((b2 / total) * 100))}%`;
    if (bar3) bar3.style.width = `${Math.min(100, Math.round((b3 / total) * 100))}%`;
  } catch (err) {
    console.warn("Gagal mengambil data statistik dashboard:", err);
  }
}