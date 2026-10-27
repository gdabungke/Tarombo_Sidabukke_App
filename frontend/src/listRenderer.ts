/**
 * FUNGSI KODE: listRenderer.ts
 * Visualisasi Silsilah Mode Daftar Hirarki (Indented List)
 * Versi Bersih: Merender data langsung ke container-tree-list
 */
import { openModalFromRenderer, openAddChildModalFromRenderer } from "./modalHelper.js";

export async function renderGenealogyList(containerSelector: string, branchFilter?: string) {
  const container = document.querySelector(containerSelector) as HTMLElement;
  if (!container) return;

  container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">Mamillit data silsilah (Memuat daftar)...</div>`;

  try {
    const res = await fetch("http://localhost:5001/api/genealogy/tree");
    if (!res.ok) throw new Error("Gagal memuat data silsilah");

    const json = await res.json();
    let rootData = json.data;

    if (!rootData) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">Data silsilah kosong.</div>`;
      return;
    }

    // Filter Cabang Ompu jika dipilih
    if (branchFilter && branchFilter.trim() !== "") {
      const match = (rootData.children || []).find((c: any) => c.fullName.includes(branchFilter));
      if (match) {
        rootData = {
          ...rootData,
          children: [match]
        };
      }
    }

    const crownSvg = `
      <svg style="width: 14px; height: 14px; color: #fbbf24; flex-shrink: 0;" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 18h18l-2-11-5 5-2-7-2 7-5-5-2 11z"></path>
      </svg>
    `;

    const branchSvg = `
      <svg style="width: 13px; height: 13px; color: var(--accent-red); flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="6" y1="3" x2="6" y2="15"></line>
        <circle cx="18" cy="6" r="3"></circle>
        <circle cx="6" cy="18" r="3"></circle>
        <path d="M18 9a9 9 0 0 1-9 9"></path>
      </svg>
    `;

    function buildListHtml(node: any, depth = 0): string {
      const isAlive = Boolean(node.isAlive);
      const statusLabel = isAlive ? "Mangolu" : "Marujung Ngolu";
      const badgeBg = isAlive ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.2)";
      const badgeColor = isAlive ? "#34d399" : "#9ca3af";
      const borderBadge = isAlive ? "rgba(16, 185, 129, 0.3)" : "rgba(107, 114, 128, 0.3)";

      const spouse = node.spouseInfo && node.spouseInfo.trim() !== "" ? node.spouseInfo : "(Belum diisi)";
      const origin = node.originVillage && node.originVillage.trim() !== "" ? node.originVillage : "(Belum diisi)";
      const indent = depth * 24;
      const children = node.children || node._children || [];
      const hasChildren = children.length > 0;

      let html = `
        <div class="list-member-item"
          data-id="${node.id || ''}"
          data-name="${node.fullName || 'Tanpa Nama'}"
          data-alias="${node.taromboName || ''}"
          data-alive="${isAlive}"
          data-gen="${node.generationLevel || depth + 1}"
          data-spouse="${node.spouseInfo || ''}"
          data-origin="${node.originVillage || ''}"
          data-notes="${node.notes || ''}"
          style="margin-left: ${indent}px; margin-bottom: 8px; background: var(--bg-card); border: 1px solid var(--border-color); border-left: 3px solid ${depth === 0 ? 'var(--accent-red)' : '#4b5563'}; border-radius: 6px; padding: 10px 14px; cursor: pointer; transition: transform 0.15s ease, border-color 0.15s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${depth === 0 ? crownSvg : branchSvg}
              <strong style="color: var(--text-main); font-size: 13px;">${node.fullName || 'Tanpa Nama'}</strong>
              ${node.taromboName && node.taromboName !== node.fullName ? `<small style="color: var(--text-muted); font-size: 11px;">(${node.taromboName})</small>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${
                !hasChildren
                  ? `<button type="button" class="btn-list-add-child" data-parent-id="${node.id || ''}" data-parent-name="${node.fullName || 'Tanpa Nama'}" data-gen="${node.generationLevel || depth + 1}" title="+ Tambah Anak Baru" style="display: flex; align-items: center; justify-content: center; gap: 4px; background: #059669; color: #fff; border: none; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; cursor: pointer;">
                      <svg style="width: 11px; height: 11px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Anak
                    </button>`
                  : `<span style="font-size: 10px; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">${children.length} Cabang</span>`
              }
              <span style="font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 4px; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${borderBadge}; white-space: nowrap;">
                ${statusLabel}
              </span>
            </div>
          </div>
          <div style="margin-top: 6px; display: flex; gap: 16px; font-size: 11px; color: var(--text-muted); flex-wrap: wrap;">
            <span>Sundut Ke-${node.generationLevel || depth + 1}</span>
            <span>Parripean: <em style="color: var(--text-main); font-style: normal;">${spouse}</em></span>
            <span>Huta: <em style="color: var(--text-main); font-style: normal;">${origin}</em></span>
          </div>
        </div>
      `;

      for (const child of children) {
        html += buildListHtml(child, depth + 1);
      }

      return html;
    }

    container.innerHTML = `
      <div id="list-tree-content" style="display: flex; flex-direction: column; width: 100%;">
        ${buildListHtml(rootData, 0)}
      </div>
    `;

    // 1. Klik baris membuka modal detail tokoh lewat helper
    container.querySelectorAll(".list-member-item").forEach((el) => {
      el.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target.closest(".btn-list-add-child")) return;

        const item = {
          id: el.getAttribute("data-id"),
          fullName: el.getAttribute("data-name"),
          taromboName: el.getAttribute("data-alias"),
          isAlive: el.getAttribute("data-alive") === "true",
          generationLevel: parseInt(el.getAttribute("data-gen") || "1"),
          spouseInfo: el.getAttribute("data-spouse"),
          originVillage: el.getAttribute("data-origin"),
          notes: el.getAttribute("data-notes"),
        };
        openModalFromRenderer(item);
      });
    });

    // 2. Klik tombol hijau membuka modal tambah anak lewat helper
    container.querySelectorAll(".btn-list-add-child").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        const parentId = btn.getAttribute("data-parent-id") || "";
        const parentName = btn.getAttribute("data-parent-name") || "Tokoh Ini";
        const currentGen = parseInt(btn.getAttribute("data-gen") || "1") || 1;
        openAddChildModalFromRenderer({ id: parentId, fullName: parentName }, currentGen);
      });
    });

  } catch (err) {
    container.innerHTML = `<div style="text-align: center; color: #f87171; padding: 40px;">Gagal memuat daftar silsilah.</div>`;
  }
}