/**
 * FUNGSI KODE: modalHelper.ts
 * Helper global pengendali Modal Detail Tokoh & Modal Tambah Anak.
 * Terintegrasi sinkron dengan semua mode tampilan (Tree, List, Gen, Table).
 */
import { showToast } from "./toast.js";
import { renderGenealogyTree } from "./treeRenderer.js";
import { renderGenealogyList } from "./listRenderer.js";
import { renderByGeneration } from "./generationRenderer.js";
import { renderGenealogyTable } from "./tableRenderer.js";

const API_BASE_URL = "http://localhost:5001";

/**
 * 1. BUKA MODAL DETAIL TOKOH
 */
export function openModalFromRenderer(item: any) {
  // Sembunyikan modal tambah anak jika sebelumnya aktif
  const modalAdd = document.getElementById("modal-add-member");
  if (modalAdd) {
    modalAdd.classList.remove("show");
    modalAdd.style.display = "none";
  }

  const modal = document.getElementById("modal-member-detail");
  if (!modal) return;

  const viewMode = document.getElementById("detail-view-mode");
  const formEdit = document.getElementById("form-edit-member");
  const elName = document.getElementById("detail-name");
  const elAlias = document.getElementById("detail-alias");
  const elStatus = document.getElementById("detail-status");
  const elGen = document.getElementById("detail-gen");
  const elSpouse = document.getElementById("detail-spouse");
  const elOrigin = document.getElementById("detail-origin");
  const elNotes = document.getElementById("detail-notes");
  const elEditId = document.getElementById("edit-member-id") as HTMLInputElement;

  // Nama Lengkap & Gelar/Goar
  if (elName) elName.innerText = item.fullName || "Tanpa Nama";
  if (elAlias) {
    elAlias.innerText = item.taromboName && item.taromboName !== item.fullName ? `(${item.taromboName})` : "";
  }

  // Label Status (Mangolu / Nunga Marujung Ngolu)
  if (elStatus) {
    const isAlive = Boolean(item.isAlive);
    if (isAlive) {
      elStatus.innerText = "Mangolu (Dihahipason)";
      elStatus.style.background = "rgba(16, 185, 129, 0.15)";
      elStatus.style.color = "#34d399";
    } else {
      elStatus.innerText = "Nunga Marujung Ngolu";
      elStatus.style.background = "rgba(107, 114, 128, 0.2)";
      elStatus.style.color = "#9ca3af";
    }
  }

  // Sundut / Generasi
  if (elGen) elGen.innerText = `Sundut Ke-${item.generationLevel || 1}`;

  // Parripean (Istri)
  if (elSpouse) {
    elSpouse.innerText = item.spouseInfo && item.spouseInfo.trim() !== "" ? item.spouseInfo : "(Belum diisi)";
    elSpouse.style.fontStyle = item.spouseInfo ? "normal" : "italic";
  }

  // Huta / Bona Pasogit
  if (elOrigin) {
    elOrigin.innerText = item.originVillage && item.originVillage.trim() !== "" ? item.originVillage : "(Belum diisi)";
    elOrigin.style.fontStyle = item.originVillage ? "normal" : "italic";
  }

  // Turi-turian & Barita (Catatan Riwayat)
  if (elNotes) {
    elNotes.innerText = item.notes && item.notes.trim() !== "" ? item.notes : "(Belum diisi — Klik tombol di bawah untuk melengkapi)";
    elNotes.style.fontStyle = item.notes ? "normal" : "italic";
  }

  if (elEditId) elEditId.value = item.id || "";

  // Pastikan mode baca aktif & form koreksi tersembunyi
  if (viewMode) viewMode.style.display = "block";
  if (formEdit) formEdit.style.display = "none";

  // Tampilkan modal secara eksplisit
  modal.classList.add("show");
  modal.style.display = "flex";
}

/**
 * 2. BUKA MODAL FORM TAMBAH ANAK / GENERASI BARU
 */
export function openAddChildModalFromRenderer(item: any, currentGen: number) {
  // Sembunyikan & matikan interaksi modal detail
  const modalDetail = document.getElementById("modal-member-detail");
  if (modalDetail) {
    modalDetail.classList.remove("show");
    modalDetail.style.display = "none";
    modalDetail.style.pointerEvents = "none";
  }

  // Ambil elemen modal tambah
  const modalAdd = document.getElementById("modal-add-member");
  if (!modalAdd) {
    console.error("Elemen #modal-add-member tidak ditemukan!");
    return;
  }

  // Ambil input form
  const elParentId = document.getElementById("add-parent-id") as HTMLInputElement;
  const elParentName = document.getElementById("add-parent-name");
  const elGen = document.getElementById("add-generation") as HTMLInputElement;
  const elFullName = document.getElementById("add-fullname") as HTMLInputElement;
  const elTaromboName = document.getElementById("add-tarombo-name") as HTMLInputElement;
  const elSpouse = document.getElementById("add-spouse") as HTMLInputElement;
  const elOrigin = document.getElementById("add-origin") as HTMLInputElement;

  // Masukkan data pangkal
  if (elParentId) elParentId.value = item.id || "";
  if (elParentName) elParentName.innerText = item.fullName || "Tokoh Ini";
  if (elGen) elGen.value = `${(Number(currentGen) || 1) + 1}`;

  // Kosongkan isian lama
  if (elFullName) elFullName.value = "";
  if (elTaromboName) elTaromboName.value = "";
  if (elSpouse) elSpouse.value = "";
  if (elOrigin) elOrigin.value = "";

  // Pastikan semua input aktif
  [elFullName, elTaromboName, elSpouse, elOrigin].forEach((input) => {
    if (input) {
      input.removeAttribute("disabled");
      input.removeAttribute("readonly");
      input.style.pointerEvents = "auto";
      input.style.userSelect = "text";
    }
  });

  // Buka modal di layer tertinggi
  modalAdd.classList.add("show");
  modalAdd.style.display = "flex";
  modalAdd.style.pointerEvents = "auto";
  modalAdd.style.zIndex = "999999";

  // Isolasi event bubbling
  const modalBox = modalAdd.querySelector(".modal-box-animated") as HTMLElement;
  if (modalBox) {
    modalBox.style.pointerEvents = "auto";
    modalBox.onmousedown = (e) => e.stopPropagation();
    modalBox.onpointerdown = (e) => e.stopPropagation();
    modalBox.onclick = (e) => e.stopPropagation();
    modalBox.onkeydown = (e) => e.stopPropagation();
  }

  setTimeout(() => {
    if (elFullName) {
      elFullName.focus();
    }
  }, 100);
}

/**
 * 3. INISIALISASI EVENT LISTENER TUTUP & FORM UNTUK KEDUA MODAL
 */
export function initModals() {
  // Handler Modal Detail
  const modalDetail = document.getElementById("modal-member-detail");
  const btnCloseDetail = document.getElementById("btn-close-detail");
  const btnOpenEdit = document.getElementById("btn-open-edit-member");
  const btnCancelEdit = document.getElementById("btn-cancel-edit");
  const viewMode = document.getElementById("detail-view-mode");
  const formEdit = document.getElementById("form-edit-member");

  const closeDetail = () => {
    if (modalDetail) {
      modalDetail.classList.remove("show");
      modalDetail.style.display = "none";
    }
  };

  btnCloseDetail?.addEventListener("click", closeDetail);
  modalDetail?.addEventListener("click", (e) => {
    if (e.target === modalDetail) closeDetail();
  });

  btnOpenEdit?.addEventListener("click", () => {
    if (viewMode) viewMode.style.display = "none";
    if (formEdit) formEdit.style.display = "flex";
  });

  btnCancelEdit?.addEventListener("click", () => {
    if (formEdit) formEdit.style.display = "none";
    if (viewMode) viewMode.style.display = "block";
  });

  // Handler Modal Tambah Anak
  const modalAdd = document.getElementById("modal-add-member");
  const btnCloseAdd = document.getElementById("btn-close-add-modal");
  const btnCancelAdd = document.getElementById("btn-cancel-add");
  const formAdd = document.getElementById("form-add-member") as HTMLFormElement;

  const closeAddModal = () => {
    if (modalAdd) {
      modalAdd.classList.remove("show");
      modalAdd.style.display = "none";
    }
  };

  btnCloseAdd?.addEventListener("click", closeAddModal);
  btnCancelAdd?.addEventListener("click", closeAddModal);
  modalAdd?.addEventListener("click", (e) => {
    if (e.target === modalAdd) closeAddModal();
  });

  // Eksekusi Submit Form Tambah Anak & Sinkronisasi
  formAdd?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const parentId = (document.getElementById("add-parent-id") as HTMLInputElement).value;
    const fullName = (document.getElementById("add-fullname") as HTMLInputElement).value;
    const taromboName = (document.getElementById("add-tarombo-name") as HTMLInputElement).value;
    const generationLevel = parseInt((document.getElementById("add-generation") as HTMLInputElement).value) || 1;
    const spouseInfo = (document.getElementById("add-spouse") as HTMLInputElement).value;
    const originVillage = (document.getElementById("add-origin") as HTMLInputElement).value;
    const token = localStorage.getItem("token");

    try {
      showToast("Menyimpan pomparan dan memperbarui silsilah...", "info");
      const res = await fetch(`${API_BASE_URL}/api/genealogy/add-and-seed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          parentId,
          fullName,
          taromboName: taromboName || fullName,
          generationLevel,
          spouseInfo,
          originVillage
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Horas! Anggota berhasil ditambahkan & data tersinkronisasi.", "success");
        formAdd.reset();
        closeAddModal();

        // Ambil filter cabang aktif
        const branchVal = (document.getElementById("master-branch-filter") as HTMLSelectElement)?.value || "";
        
        // Refresh otomatis view yang sedang aktif di layar
        const activeSubBtn = document.querySelector(".btn-sub-view.active")?.getAttribute("data-view");
        if (activeSubBtn === "list") {
          renderGenealogyList("#container-tree-list", branchVal);
        } else if (activeSubBtn === "generation") {
          renderByGeneration("#container-tree-gen", branchVal);
        } else if (activeSubBtn === "table") {
          renderGenealogyTable("#container-tree-table", branchVal);
        } else {
          renderGenealogyTree("#genealogy-svg", branchVal);
        }
      } else {
        showToast(data.message || "Gagal menambahkan pomparan baru.", "error");
      }
    } catch {
      showToast("Koneksi gagal saat menyinkronkan data.", "error");
    }
  });
}