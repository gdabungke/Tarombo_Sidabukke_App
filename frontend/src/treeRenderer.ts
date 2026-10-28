/**
 * FUNGSI KODE: treeRenderer.ts
 * Visualisasi Silsilah Mode Vertikal (Potret / Top-to-Bottom)
 * Versi Bersih: Banner & Filter kini terpusat di index.html
 */
import * as d3 from "d3";
import { openModalFromRenderer, openAddChildModalFromRenderer } from "./modalHelper.js";

export async function renderGenealogyTree(svgSelector: string, branchFilter?: string) {
  const svg = d3.select(svgSelector);
  if (svg.empty()) return;

  svg.selectAll("*").remove();

  const container = document.querySelector("#container-tree-graphic") as HTMLElement;
  const width = container ? container.clientWidth : 1200;
  const height = container ? container.clientHeight : 800;

  // Elemen Tooltip
  const tooltip = document.getElementById("tree-hover-tooltip");
  const ttName = document.getElementById("tt-name");
  const ttGen = document.getElementById("tt-gen");
  const ttSpouse = document.getElementById("tt-spouse");
  const ttOrigin = document.getElementById("tt-origin");
  const ttNotes = document.getElementById("tt-notes-box");

  // 1. Layer Transparan Penangkap Kursor Drag
  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "transparent")
    .style("pointer-events", "all")
    .style("cursor", "grab");

  const g = svg.append("g").attr("class", "tree-group");

  // 2. FITUR PAN & ZOOM
  const zoom = d3.zoom()
    .scaleExtent([0.15, 3])
    .filter((event) => {
      const target = event.target as HTMLElement;
      if (
        target.closest(".modal-backdrop-blur") ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "BUTTON" ||
        target.tagName === "TEXTAREA"
      ) {
        return false;
      }
      return !event.button;
    })
    .on("start", () => {
      svg.select("rect").style("cursor", "grabbing");
    })
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
      if (tooltip) tooltip.style.display = "none";
    })
    .on("end", () => {
      svg.select("rect").style("cursor", "grab");
    });

  svg.call(zoom as any);

  // 3. NAVIGASI SCROLL 2-ARAH (MOUSEWHEEL / TRACKPAD)
  svg.on("wheel", (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) return;
    event.preventDefault();

    const currentTransform = d3.zoomTransform(svg.node() as any);
    const deltaX = event.shiftKey ? -event.deltaY : -event.deltaX;
    const deltaY = event.shiftKey ? 0 : -event.deltaY;

    const newTransform = currentTransform.translate(deltaX / currentTransform.k, deltaY / currentTransform.k);
    svg.call(zoom.transform as any, newTransform);

    if (tooltip) tooltip.style.display = "none";
  }, { passive: false });

  // 4. NAVIGASI PANAH KEYBOARD
  const keyPanHandler = (e: KeyboardEvent) => {
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.tagName === "SELECT")) return;

    const step = 80;
    let dx = 0;
    let dy = 0;

    if (e.key === "ArrowLeft") dx = step;
    else if (e.key === "ArrowRight") dx = -step;
    else if (e.key === "ArrowUp") dy = step;
    else if (e.key === "ArrowDown") dy = -step;
    else return;

    e.preventDefault();
    const currentTransform = d3.zoomTransform(svg.node() as any);
    svg.transition().duration(120).call(
      zoom.transform as any,
      currentTransform.translate(dx / currentTransform.k, dy / currentTransform.k)
    );

    if (tooltip) tooltip.style.display = "none";
  };

  window.removeEventListener("keydown", keyPanHandler);
  window.addEventListener("keydown", keyPanHandler);

  // Posisi Y awal pohon di dalam kotak SVG (proporsional dari atas batas SVG)
  const INITIAL_TREE_Y = 110;

  // Tombol Kontrol Zoom
  d3.select("#btn-zoom-in").on("click", () => {
    svg.transition().duration(300).call(zoom.scaleBy as any, 1.3);
    if (tooltip) tooltip.style.display = "none";
  });

  d3.select("#btn-zoom-out").on("click", () => {
    svg.transition().duration(300).call(zoom.scaleBy as any, 0.7);
    if (tooltip) tooltip.style.display = "none";
  });

  d3.select("#btn-zoom-reset").on("click", () => {
    svg.transition().duration(400).call(
      zoom.transform as any,
      d3.zoomIdentity.translate(width / 2, INITIAL_TREE_Y).scale(0.85)
    );
    if (tooltip) tooltip.style.display = "none";
  });

  try {
  let rootData;

  // Cek apakah aplikasi sedang berjalan di GitHub Pages atau di localhost
  const isGitHubPages = window.location.hostname.includes("github.io");

  if (isGitHubPages) {
    // 1. Opsi saat online di GitHub Pages (mengambil seed.json statis dari public)
    console.log("Memuat data statis dari seed.json untuk GitHub Pages...");
    
    // Menggunakan BASE_URL Vite agar jalurnya akurat di GitHub Pages
    const jsonUrl = `${import.meta.env.BASE_URL}seed.json`;
    const res = await fetch(jsonUrl);
    
    if (!res.ok) throw new Error(`Gagal memuat file dari ${jsonUrl}`);
    const json = await res.json();
    rootData = Array.isArray(json) ? buildHierarchy(json) : json.data || json;
  } else {
    // 2. Opsi saat berjalan di komputer lokal (mengambil dari backend SQL/Prisma)
    console.log("Memuat data dari backend lokal...");
    const res = await fetch("http://localhost:5001/api/genealogy/tree");
    if (!res.ok) throw new Error("Gagal memuat silsilah dari server lokal");
    const json = await res.json();
    rootData = json.data;
  }

  if (!rootData) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;">Data silsilah kosong.</div>`;
      return;
    }

  // ... sisa kode selanjutnya tetap sama

    const root: any = d3.hierarchy(rootData);
    root.x0 = width / 2;
    root.y0 = INITIAL_TREE_Y;

    const treeLayout = d3.tree().nodeSize([190, 140]);
    let i = 0;

    function update(source: any) {
      const treeData = treeLayout(root);
      const nodes = treeData.descendants();
      const links = treeData.links();

      nodes.forEach((d: any) => {
        d.y = d.depth * 130;
      });

      // 1. RENDER GARIS HUBUNG CABANG
      const linkSelection = g.selectAll("path.link")
        .data(links, (d: any) => d.target.id || (d.target.id = ++i));

      const linkVertical = d3.linkVertical()
        .x((d: any) => d.x)
        .y((d: any) => d.y);

      const linkEnter = linkSelection.enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "var(--accent-red, #b91c1c)")
        .attr("stroke-opacity", 0.55)
        .attr("stroke-width", 1.8)
        .attr("d", () => {
          const o = { x: source.x0, y: source.y0 };
          return linkVertical({ source: o, target: o } as any);
        });

      linkSelection.merge(linkEnter as any)
        .transition()
        .duration(350)
        .attr("stroke", "var(--accent-red, #b91c1c)")
        .attr("stroke-opacity", 0.55)
        .attr("d", (d: any) => linkVertical(d as any));

      linkSelection.exit()
        .transition()
        .duration(350)
        .attr("d", () => {
          const o = { x: source.x, y: source.y };
          return linkVertical({ source: o, target: o } as any);
        })
        .remove();

      // 2. RENDER NODE TOKOH
      const nodeSelection = g.selectAll("g.node")
        .data(nodes, (d: any) => d.id || (d.id = ++i));

      const nodeEnter = nodeSelection.enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", () => `translate(${source.x0},${source.y0})`)
        .style("cursor", "pointer")
        .on("click", (event: MouseEvent, d: any) => {
          const target = event.target as HTMLElement;
          if (target && target.closest(".node-bottom-btn")) return;
          if (tooltip) tooltip.style.display = "none";
          openModalFromRenderer(d.data);
        })
        .on("mouseenter", function (event: MouseEvent, d: any) {
          d3.select(this).select("rect")
            .transition()
            .duration(150)
            .attr("stroke", "var(--accent-red, #b91c1c)")
            .attr("stroke-width", 2)
            .style("filter", "drop-shadow(0 6px 14px rgba(185, 28, 28, 0.25))");

          if (!tooltip) return;
          const data = d.data || {};
          if (ttName) ttName.innerText = data.fullName || "Tanpa Nama";
          if (ttGen) ttGen.innerText = `Sundut Ke-${data.generationLevel || d.depth + 1}`;
          if (ttSpouse) ttSpouse.innerText = data.spouseInfo && data.spouseInfo.trim() !== "" ? data.spouseInfo : "-";
          if (ttOrigin) ttOrigin.innerText = data.originVillage && data.originVillage.trim() !== "" ? data.originVillage : "-";

          if (ttNotes) {
            const rawNotes = data.notes && data.notes.trim() !== "" ? data.notes : "Klik untuk melihat riwayat tutur tokoh.";
            ttNotes.innerText = rawNotes.length > 70 ? rawNotes.substring(0, 67) + "..." : rawNotes;
            ttNotes.style.color = "var(--text-muted)";
            ttNotes.style.borderTopColor = "var(--border-color)";
          }

          tooltip.style.display = "block";
        })
        .on("mousemove", function (event: MouseEvent) {
          if (!tooltip || !container) return;
          const rect = container.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;
          tooltip.style.left = `${mouseX + 16}px`; tooltip.style.top = `${mouseY + 16}px`;
        })
        .on("mouseleave", function (_event: MouseEvent, d: any) {
          d3.select(this).select("rect")
            .transition()
            .duration(150)
            .attr("stroke", d.depth === 0 ? "var(--accent-red)" : "var(--border-color, #374151)")
            .attr("stroke-width", d.depth === 0 ? 2 : 1)
            .style("filter", "drop-shadow(0 4px 10px rgba(0,0,0,0.15))");

          if (tooltip) tooltip.style.display = "none";
        });

      // Kotak Node
      nodeEnter.append("rect")
        .attr("x", -75)
        .attr("y", -14)
        .attr("width", 150)
        .attr("height", 56)
        .attr("rx", 8)
        .attr("fill", "var(--bg-card, #1c1c24)")
        .attr("stroke", (d: any) => d.depth === 0 ? "var(--accent-red)" : "var(--border-color, #374151)")
        .attr("stroke-width", (d: any) => d.depth === 0 ? 2 : 1)
        .style("filter", "drop-shadow(0 4px 10px rgba(0,0,0,0.15))");

      // Mahkota Adat Emas
      const iconGroup = nodeEnter.append("g")
        .attr("transform", "translate(0, -14)");

      iconGroup.append("circle")
        .attr("r", 13)
        .attr("fill", "var(--accent-red, #b91c1c)")
        .attr("stroke", "var(--bg-card, #1c1c24)")
        .attr("stroke-width", 2);

      iconGroup.append("path")
        .attr("d", "M -6 4 L -5 -3 L -2 0 L 0 -5 L 2 0 L 5 -3 L 6 4 Z")
        .attr("fill", "#fbbf24")
        .attr("stroke", "#d97706")
        .attr("stroke-width", 0.6)
        .attr("stroke-linejoin", "round");

      // Nama Tokoh
      nodeEnter.append("text")
        .attr("dy", "16")
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text-main, #f3f4f6)")
        .style("font-size", "11px")
        .style("font-weight", (d: any) => d.depth <= 1 ? "700" : "600")
        .text((d: any) => {
          const name = d.data.fullName || "Tanpa Nama";
          return name.length > 20 ? name.substring(0, 18) + "..." : name;
        });

      // Sundut
      nodeEnter.append("text")
        .attr("dy", "30")
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text-muted, #9ca3af)")
        .style("font-size", "9.5px")
        .text((d: any) => `Sundut Ke-${d.data.generationLevel || d.depth + 1}`);

      // Tombol Bawah (Expand / Tambah Anak)
      const bottomBtnGroup = nodeEnter.append("g")
        .attr("class", "node-bottom-btn")
        .attr("transform", "translate(0, 42)")
        .style("cursor", "pointer")
        .on("click", (event: MouseEvent, d: any) => {
          event.stopPropagation();
          event.preventDefault();
          if (tooltip) tooltip.style.display = "none";

          const hasChildren = Boolean(d.children || d._children);
          if (hasChildren) {
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d);
          } else {
            const currentGen = d.data.generationLevel || d.depth + 1;
            openAddChildModalFromRenderer(d.data, currentGen);
          }
        });

      bottomBtnGroup.append("circle")
        .attr("r", 7)
        .attr("fill", (d: any) => {
          const hasChildren = Boolean(d.children || d._children);
          if (!hasChildren) return "#10b981";
          return d._children ? "#d97706" : "var(--accent-red, #b91c1c)";
        })
        .attr("stroke", "var(--bg-card, #1c1c24)")
        .attr("stroke-width", 1.5)
        .style("transition", "all 0.25s ease");

      bottomBtnGroup.append("line")
        .attr("x1", -3.5)
        .attr("y1", 0)
        .attr("x2", 3.5)
        .attr("y2", 0)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.4)
        .attr("stroke-linecap", "round");

      bottomBtnGroup.append("line")
        .attr("class", "toggle-vert-line")
        .attr("x1", 0)
        .attr("y1", -3.5)
        .attr("x2", 0)
        .attr("y2", 3.5)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.4)
        .attr("stroke-linecap", "round")
        .attr("opacity", (d: any) => {
          const hasChildren = Boolean(d.children || d._children);
          return (!hasChildren || d._children) ? 1 : 0;
        })
        .style("transition", "transform 0.25s ease, opacity 0.2s ease");

      bottomBtnGroup.append("title")
        .text((d: any) => (d.children || d._children ? "Buka / Tutup Cabang" : "+ Tambah Anak Baru"));

      // Transisi Posisi Node
      nodeSelection.merge(nodeEnter as any)
        .transition()
        .duration(350)
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

      nodeSelection.select(".node-bottom-btn circle")
        .transition()
        .duration(250)
        .attr("fill", (d: any) => {
          const hasChildren = Boolean(d.children || d._children);
          if (!hasChildren) return "#10b981";
          return d._children ? "#d97706" : "var(--accent-red, #b91c1c)";
        });

      nodeSelection.select(".node-bottom-btn .toggle-vert-line")
        .transition()
        .duration(250)
        .attr("opacity", (d: any) => {
          const hasChildren = Boolean(d.children || d._children);
          return (!hasChildren || d._children) ? 1 : 0;
        })
        .attr("transform", (d: any) => {
          const hasChildren = Boolean(d.children || d._children);
          if (!hasChildren) return "rotate(0)";
          return d._children ? "rotate(0)" : "rotate(90)";
        });

      nodeSelection.exit()
        .transition()
        .duration(350)
        .attr("transform", () => `translate(${source.x},${source.y})`)
        .remove();

      nodes.forEach((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    update(root);

    svg.call(
      zoom.transform as any,
      d3.zoomIdentity.translate(width / 2, INITIAL_TREE_Y).scale(0.85)
    );
  } catch (err) {
    console.error("Gagal menggambar pohon silsilah vertikal:", err);
  }
}

/**
 * Fitur Pencarian & Fokus Tokoh Silsilah
 */
export function searchAndFocusMember(name: string): boolean {
  const nodes = d3.selectAll("g.node");
  let found = false;

  nodes.each(function (d: any) {
    if (d.data.fullName && d.data.fullName.toLowerCase().includes(name.toLowerCase())) {
      found = true;
      const svg = d3.select("#genealogy-svg");
      const container = document.querySelector("#container-tree-graphic");
      const width = container ? container.clientWidth : 1200;
      const height = container ? container.clientHeight : 800;

      svg.transition().duration(750).call(
        d3.zoom().transform as any,
        d3.zoomIdentity.translate(width / 2 - d.x, height / 2 - d.y).scale(1.2)
      );

      d3.select(this).select("rect")
        .transition().duration(200)
        .attr("stroke", "#fbbf24")
        .attr("stroke-width", 3)
        .transition().duration(800)
        .attr("stroke", "var(--accent-red)")
        .attr("stroke-width", 2);
    }
  });

  return found;
}

/**
 * Fungsi untuk mengubah data array datar dari seed.json 
 * menjadi struktur hierarki (parent-child) untuk D3.js
 */
function buildHierarchy(flatData: any[]) {
  const map = new Map();
  let root = null;

  // Masukkan semua data ke dalam map
  flatData.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  // Susun hubungan parent-child berdasarkan parentIdRaw atau parentId
  flatData.forEach((item) => {
    const node = map.get(item.id);
    const parentId = item.parentIdRaw || item.parentId;
    
    if (parentId) {
      const parent = map.get(parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      root = node; // Node paling atas (Raja Sinalin / Generasi 1)
    }
  });

  return root;
}