/**
 * FUNGSI KODE: tableRenderer.ts
 * Visualisasi Silsilah Mode Tabel Direktori Lengkap
 * Versi Bersih: Merender data langsung ke container-tree-table
 */
import { openModalFromRenderer, openAddChildModalFromRenderer } from "./modalHelper.js";

export async function renderGenealogyTable(containerSelector: string, branchFilter?: string) {
  const container = document.querySelector(containerSelector) as HTMLElement;
  if (!container) return;

  container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">Mamillit data tabel (Memuat tabel)...</div>`;

  try {
    const res = await fetch("http://localhost:5001/api/genealogy/tree");
    if (!res.ok) throw new Error("Gagal memuat data");

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

    const flatList: any[] = [];
    function flatten(node: any, parentName = "-") {
      const children = node.children || node._children || [];
      const hasChildren = children.length > 0;

      flatList.push({ ...node, parentName, hasChildren });
      for (const child of children) {
        flatten(child, node.fullName || "-");
      }
    }

    flatten(rootData);

    let tableHtml = `
      <div style="overflow-x: auto; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; width: 100%;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; color: var(--text-main);">
          <thead>
            <tr style="background: var(--bg-primary); border-bottom: 2px solid var(--border-color);">
              <th style="padding: 10px 14px; font-weight: 700; color: var(--accent-red); width: 60px;">Sundut</th>
              <th style="padding: 10px 14px; font-weight: 700;">Nama Lengkap / Goar</th>
              <th style="padding: 10px 14px; font-weight: 700;">Amang / Orang Tua</th>
              <th style="padding: 10px 14px; font-weight: 700;">Parripean</th>
              <th style="padding: 10px 14px; font-weight: 700;">Huta / Bona Pasogit</th>
              <th style="padding: 10px 14px; font-weight: 700; text-align: center; width: 110px;">Status</th>
              <th style="padding: 10px 14px; font-weight: 700; text-align: center; width: 130px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
    `;

    flatList.forEach((item, index) => {
      const isAlive = Boolean(item.isAlive);
      const statusLabel = isAlive ? "Mangolu" : "Marujung Ngolu";
      const badgeBg = isAlive ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.2)";
      const badgeColor = isAlive ? "#34d399" : "#9ca3af";

      const spouse = item.spouseInfo && item.spouseInfo.trim() !== "" ? item.spouseInfo : '<span style="color: var(--text-muted); font-style: italic;">(Belum diisi)</span>';
      const origin = item.originVillage && item.originVillage.trim() !== "" ? item.originVillage : '<span style="color: var(--text-muted); font-style: italic;">(Belum diisi)</span>';

      tableHtml += `
        <tr style="border-bottom: 1px solid var(--border-color); background: ${index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'};">
          <td style="padding: 10px 14px; font-weight: 600; color: var(--accent-red);">Sundut ${item.generationLevel || '-'}</td>
          <td style="padding: 10px 14px;">
            <strong style="color: var(--text-main);">${item.fullName || 'Tanpa Nama'}</strong>
            ${item.taromboName && item.taromboName !== item.fullName ? `<div style="font-size: 10px; color: var(--text-muted);">(${item.taromboName})</div>` : ''}
          </td>
          <td style="padding: 10px 14px; color: var(--text-muted);">${item.parentName}</td>
          <td style="padding: 10px 14px;">${spouse}</td>
          <td style="padding: 10px 14px;">${origin}</td>
          <td style="padding: 10px 14px; text-align: center;">
            <span style="font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 4px; background: ${badgeBg}; color: ${badgeColor}; white-space: nowrap;">
              ${statusLabel}
            </span>
          </td>
          <td style="padding: 10px 14px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
              <button class="tarombo-btn btn-table-view"
                      data-id="${item.id || ''}"
                      data-name="${item.fullName || 'Tanpa Nama'}"
                      data-alias="${item.taromboName || ''}"
                      data-alive="${isAlive}"
                      data-gen="${item.generationLevel || '-'}"
                      data-spouse="${item.spouseInfo || ''}"
                      data-origin="${item.originVillage || ''}"
                      data-notes="${item.notes || ''}"
                      style="display: flex; align-items: center; gap: 4px; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">
                <svg style="width: 11px; height: 11px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Detail
              </button>
              ${
                !item.hasChildren
                  ? `<button class="tarombo-btn btn-table-add"
                            data-parent-id="${item.id || ''}"
                            data-parent-name="${item.fullName || 'Tanpa Nama'}"
                            data-gen="${item.generationLevel || 1}"
                            title="+ Tambah Anak"
                            style="display: flex; align-items: center; justify-content: center; background: #059669; color: #fff; border: none; padding: 4px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
                      <svg style="width: 11px; height: 11px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>`
                  : ''
              }
            </div>
          </td>
        </tr>
      `;
    });

    tableHtml += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHtml;

    // 1. Klik tombol detail di tabel membuka modal lewat helper
    container.querySelectorAll(".btn-table-view").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = {
          id: btn.getAttribute("data-id"),
          fullName: btn.getAttribute("data-name"),
          taromboName: btn.getAttribute("data-alias"),
          isAlive: btn.getAttribute("data-alive") === "true",
          generationLevel: parseInt(btn.getAttribute("data-gen") || "1"),
          spouseInfo: btn.getAttribute("data-spouse"),
          originVillage: btn.getAttribute("data-origin"),
          notes: btn.getAttribute("data-notes"),
        };
        openModalFromRenderer(item);
      });
    });

    // 2. Klik tombol hijau tambah anak di tabel membuka modal lewat helper
    container.querySelectorAll(".btn-table-add").forEach((btn) => {
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
    container.innerHTML = `<div style="text-align: center; color: #f87171; padding: 40px;">Gagal memuat tabel silsilah.</div>`;
  }
}