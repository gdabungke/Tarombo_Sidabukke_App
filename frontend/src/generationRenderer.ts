/**
 * FUNGSI KODE: generationRenderer.ts
 * Visualisasi Silsilah Dikelompokkan Berdasarkan Sundut / Generasi
 * Versi Bersih: Merender data langsung ke container-tree-gen
 */
import { openModalFromRenderer, openAddChildModalFromRenderer } from "./modalHelper.js";

export async function renderByGeneration(containerSelector: string, branchFilter?: string) {
  const container = document.querySelector(containerSelector) as HTMLElement;
  if (!container) return;
  
  container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">Mamillit data sundut (Memuat generasi)...</div>`;

  try {
    let rootData;

    // Cek apakah aplikasi sedang berjalan di GitHub Pages atau di localhost
    const isGitHubPages = window.location.hostname.includes("github.io");

    if (isGitHubPages) {
      // 1. Opsi saat online di GitHub Pages (mengambil seed.json statis)
      console.log("Memuat data generasi statis dari seed.json untuk GitHub Pages...");
      const res = await fetch("./seed.json");
      if (!res.ok) throw new Error("Gagal memuat file seed.json");
      const json = await res.json();
      rootData = Array.isArray(json) ? buildHierarchy(json) : json.data || json;
    } else {
      // 2. Opsi saat berjalan di komputer lokal (mengambil dari backend SQL/Prisma)
      console.log("Memuat data generasi dari backend lokal...");
      const res = await fetch("http://localhost:5001/api/genealogy/tree");
      if (!res.ok) throw new Error("Gagal memuat data dari server lokal");
      const json = await res.json();
      rootData = json.data;
    }

    if (!rootData) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">Data silsilah kosong.</div>`;
      return;
    }

    // Filter Cabang Ompu jika dipilih
    if (branchFilter && branchFilter.trim() !== "") {
      const match = (rootData.children || []).find((c: any) => c.fullName.includes(branchFilter));
      if (match) {
        rootData = { ...rootData, children: [match] };
      }
    }

    // Kelompokkan node berdasarkan level generasi (sundut)
    const genMap: Record<number, any[]> = {};
    function flatten(node: any) {
      const g = node.generationLevel || 1;
      if (!genMap[g]) genMap[g] = [];
      const children = node.children || node._children || [];
      const hasChildren = children.length > 0;
      genMap[g].push({ ...node, hasChildren });
      for (const child of children) {
        flatten(child);
      }
    }
    flatten(rootData);

    const sortedGens = Object.keys(genMap).map(Number).sort((a, b) => a - b);

    // RENDER STRUKTUR DAFTAR KELOMPOK GENERASI
    let cardsHtml = `<div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">`;

    for (const g of sortedGens) {
      const members = genMap[g];
      cardsHtml += `
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: rgba(185, 28, 28, 0.2); color: var(--accent-red); font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 4px;">Sundut ${g}</span>
              <strong style="color: var(--text-main); font-size: 13px;">Generasi Tingkat ${g}</strong>
            </div>
            <small style="color: var(--text-muted); font-size: 11px;">${members.length} Anggota Terdata</small>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px;">
      `;

      for (const m of members) {
        const isAlive = Boolean(m.isAlive);
        const statusLabel = isAlive ? "Mangolu" : "Marujung Ngolu";
        const badgeBg = isAlive ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.2)";
        const badgeColor = isAlive ? "#34d399" : "#9ca3af";
        const spouse = m.spouseInfo && m.spouseInfo.trim() !== "" ? m.spouseInfo : "(Belum diisi)";
        const origin = m.originVillage && m.originVillage.trim() !== "" ? m.originVillage : "(Belum diisi)";

        cardsHtml += `
          <div class="gen-member-card" 
            data-id="${m.id || ''}" 
            data-name="${m.fullName || 'Tanpa Nama'}" 
            data-alias="${m.taromboName || ''}" 
            data-alive="${isAlive}" 
            data-gen="${m.generationLevel || g}" 
            data-spouse="${m.spouseInfo || ''}" 
            data-origin="${m.originVillage || ''}" 
            data-notes="${m.notes || ''}" 
            style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 12px; cursor: pointer; transition: transform 0.15s ease, border-color 0.15s ease; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 6px;">
              <div>
                <strong style="font-size: 12px; color: var(--text-main);">${m.fullName || 'Tanpa Nama'}</strong>
                ${m.taromboName && m.taromboName !== m.fullName ? `<div style="font-size: 10px; color: var(--text-muted);">(${m.taromboName})</div>` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                ${
                  !m.hasChildren
                    ? `<button type="button" class="btn-gen-add-child" data-parent-id="${m.id || ''}" data-parent-name="${m.fullName || 'Tanpa Nama'}" data-gen="${m.generationLevel || g}" title="+ Tambah Anak Baru" style="display: flex; align-items: center; justify-content: center; background: #059669; color: #fff; border: none; width: 20px; height: 20px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer;">
                        <svg style="width: 11px; height: 11px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>`
                    : ''
                }
                <span style="font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${badgeBg}; color: ${badgeColor}; white-space: nowrap;">
                  ${statusLabel}
                </span>
              </div>
            </div>
            <div style="margin-top: 8px; font-size: 10px; color: var(--text-muted); display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; align-items: center; gap: 5px;">
                <svg style="width: 12px; height: 12px; color: var(--text-muted); flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <span>Parripean: <strong style="color: var(--text-main); font-weight: 500;">${spouse}</strong></span>
              </div>
              <div style="display: flex; align-items: center; gap: 5px;">
                <svg style="width: 12px; height: 12px; color: var(--text-muted); flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>Huta: <strong style="color: var(--text-main); font-weight: 500;">${origin}</strong></span>
              </div>
            </div>
          </div>
        `;
      }

      cardsHtml += `
          </div>
        </div>
      `;
    }

    cardsHtml += `</div>`;
    container.innerHTML = cardsHtml;

    // 1. Klik kartu generasi membuka modal detail lewat helper
    container.querySelectorAll(".gen-member-card").forEach((el) => {
      el.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target.closest(".btn-gen-add-child")) return;
        
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
    container.querySelectorAll(".btn-gen-add-child").forEach((btn) => {
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
    console.error("Gagal memuat visualisasi per generasi:", err);
    container.innerHTML = `<div style="text-align: center; color: #f87171; padding: 40px;">Gagal memuat visualisasi per generasi.</div>`;
  }
}

/**
 * Fungsi untuk mengubah data array datar dari seed.json 
 * menjadi struktur hierarki (parent-child)
 */
function buildHierarchy(flatData: any[]) {
  const map = new Map();
  let root = null;

  flatData.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  flatData.forEach((item) => {
    const node = map.get(item.id);
    const parentId = item.parentIdRaw || item.parentId;
    
    if (parentId) {
      const parent = map.get(parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      root = node;
    }
  });

  return root;
}