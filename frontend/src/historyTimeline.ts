/**
 * FUNGSI KODE: historyTimeline.ts
 * Visualisasi Sejarah Interaktif Raja Sidabukke / Sidabungke
 * Transisi Sinematik Ekstra Halus: Motion Blur Crossfade, Staggered Reveal,
 * serta Navigasi Melayang Berpendar yang Menyesuaikan Status Login (Guest vs Logged In).
 */
export function initHistoryTimeline(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const isUserLoggedIn = Boolean(localStorage.getItem("token") && localStorage.getItem("username"));

  // Koleksi Ilustrasi Vektor SVG Orisinil
  const illustrations = {
    mountain: `
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
        <polygon points="24 6 5 38 43 38 24 6" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444"></polygon>
        <polyline points="16 26 21 21 27 28 32 23 37 32" stroke="#fbbf24"></polyline>
        <circle cx="36" cy="12" r="4" fill="#fbbf24" stroke="none"></circle>
      </svg>
    `,
    lawScales: `
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
        <line x1="24" y1="6" x2="24" y2="42" stroke="#ef4444"></line>
        <line x1="10" y1="14" x2="38" y2="14" stroke="#fbbf24"></line>
        <polygon points="10 14 4 28 16 28 10 14" fill="rgba(251, 191, 36, 0.15)" stroke="#fbbf24"></polygon>
        <polygon points="38 14 32 28 44 28 38 14" fill="rgba(251, 191, 36, 0.15)" stroke="#fbbf24"></polygon>
        <line x1="16" y1="42" x2="32" y2="42" stroke="#ef4444"></line>
      </svg>
    `,
    forestExile: `
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
        <polygon points="18 10 8 30 28 30 18 10" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981"></polygon>
        <polygon points="32 16 24 34 40 34 32 16" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981"></polygon>
        <line x1="18" y1="30" x2="18" y2="40" stroke="#d97706"></line>
        <line x1="32" y1="34" x2="32" y2="40" stroke="#d97706"></line>
        <path d="M4 42 C14 38, 34 38, 44 42" stroke="#9ca3af"></path>
      </svg>
    `,
    hoeBungke: `
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
        <line x1="10" y1="38" x2="34" y2="12" stroke="#fbbf24" stroke-width="2.5"></line>
        <polygon points="32 10 44 8 40 22 28 18 32 10" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444"></polygon>
        <path d="M6 42 Q14 32 22 42" stroke="#9ca3af"></path>
      </svg>
    `,
    ulosMarriage: `
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
        <path d="M12 8 C12 8, 24 14, 36 8 L36 38 C24 44, 12 38, 12 38 Z" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444"></path>
        <line x1="18" y1="14" x2="30" y2="14" stroke="#fbbf24"></line>
        <line x1="18" y1="22" x2="30" y2="22" stroke="#fbbf24"></line>
        <line x1="18" y1="30" x2="30" y2="30" stroke="#fbbf24"></line>
        <circle cx="24" cy="22" r="3" fill="#fbbf24" stroke="none"></circle>
      </svg>
    `,
    threeBranches: `
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
        <line x1="24" y1="42" x2="24" y2="22" stroke="#fbbf24" stroke-width="2.5"></line>
        <path d="M24 22 C14 20, 10 14, 8 8" stroke="#ef4444" stroke-width="2"></path>
        <path d="M24 22 L24 6" stroke="#fbbf24" stroke-width="2"></path>
        <path d="M24 22 C34 20, 38 14, 40 8" stroke="#3b82f6" stroke-width="2"></path>
        <circle cx="8" cy="8" r="4" fill="#ef4444"></circle>
        <circle cx="24" cy="6" r="4" fill="#fbbf24"></circle>
        <circle cx="40" cy="8" r="4" fill="#3b82f6"></circle>
      </svg>
    `,
    scrollTongging: `
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
        <rect x="10" y="8" width="28" height="32" rx="4" fill="rgba(30, 30, 42, 0.8)" stroke="#fbbf24"></rect>
        <line x1="16" y1="16" x2="32" y2="16" stroke="#ef4444"></line>
        <line x1="16" y1="22" x2="32" y2="22" stroke="#9ca3af"></line>
        <line x1="16" y1="28" x2="26" y2="28" stroke="#9ca3af"></line>
        <circle cx="32" cy="32" r="5" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444"></circle>
      </svg>
    `
  };

  const detailedHistory = [
    {
      era: "Babak I: Bona Ni Pinompar Di Sibatubatu",
      title: "Huta Sangkal Sibatubatu & Parsadaan Napitu Raja",
      text: "Pada zaman dahulu, di Huta Sangkal Sibatubatu Samosir, bermukim perkumpulan keluarga Napitu Raja (Pitu Raja). Napitu Raja memiliki tiga orang putra dari hasil pernikahannya dengan Ompu Boru Malau, yaitu: Ompu Bahal Batu, Ompu Bunga Dapdap, dan Raja Sinalin (Sidabungke).",
      svg: illustrations.mountain,
      quote: "Napitu Raja marurat sian Sangkal Sibatubatu, maranak tolu sian Ompu Boru Malau."
    },
    {
      era: "Babak II: Pangalaosion Tona Ni Raja Nai Ambaton",
      title: "Niat Raja Sinalin Memperistri Boru Sidabutar",
      text: "Anak sulung Napitu Raja yang bernama Raja Sinalin melihat seorang gadis nan cantik rupawan putri Raja Sidabutar lalu mengingininya sebagai istri. Niat Raja Sinalin sampai ke telinga Napitu Raja. Napitu Raja menasihati Raja Sinalin agar menghentikan niatnya karena marga Sidabutar dan marga Napitu masih keluarga besar Parna yang diikat hukum adat tidak boleh saling kawin mawin merujuk pada Tona ni Raja Nai Ambaton. Nasihat Napitu Raja tidak dihiraukan Raja Sinalin. Raja Sinalin tetap melanggengkan niatnya memperistri ito-nya (saudaranya), Boru Sidabutar secara diam-diam di luar upacara adat istiadat yang berlaku pada masanya.",
      svg: illustrations.lawScales,
      quote: "Tona ni Raja Nai Ambaton: Sisada anak sisada boru, na so jadi marsioli."
    },
    {
      era: "Babak III: Uhum Adat & Harangan Pamburuon",
      title: "Murka Raja Sidabutar & Pengasingan ke Hutan",
      text: "Mengetahui boru-nya di-per-istri secara diam-diam oleh Raja Sinalin, pihak Raja Sidabutar selaku parboru marah/murka besar lalu menuntut agar Raja Sinalin dan istrinya dihukum tegas berdasarkan Tona ni Raja Nai Ambaton. Sementara pihak Raja Napitu terkesan ragu-ragu menegakkan hukum adat. Napitu Raja hanya mengasingkan anak sulungnya tersebut di suatu hutan bersama Boru Sidabutar yang menjadi istri terlarangnya. Sikap Napitu Raja kala itu sempat menuai konflik kecil antara kedua pihak. Di suatu hutan yang menjadi tempat pengasingannya, mereka tinggal dan membuka lahan pertanian hingga berketurunan, terpencil dari segala urusan sosial kemasyarakatan.",
      svg: illustrations.forestExile,
      quote: "Mambungka hauma di tonga harangan, terpencil sian pardomuan sosial."
    },
    {
      era: "Babak IV: Peristiwa Horja Bius Sibatubatu",
      title: "‘Bungke On Ma Di Au’ — Cikal Bakal Sidabukke",
      text: "Suatu hari di Sangkal Sibatubatu, Raja Napitu menyelenggarakan Horja Bius. Napitu Raja mengharap kehadiran anak sulungnya dan menyuruh utusan menyampaikan pesan ke pengasingan. Pada hari pelaksanaan, Raja Sinalin tidak kunjung tiba. Napitu Raja menyuruh salah satu anaknya menjemput. Menanggapi pesan ayahnya, Raja Sinalin berkata sembari mencangkul: 'Di hamu ma pestamu na i, bungke on ma di au!' Mendengar bisikan itu, Napitu Raja murka lalu mengumumkan pada hadirin: 'Mulai sadari on, ndang anakku be Sinalin, paloas ma bungkena i diallang. Jala mulai sadari on, ndang adong be na margoar Sinalin ianakhonhu, nunga mate be Sinalin anggo di ahu!' Sejak hari itu, namanya ditiadakan dari daftar keturunan Napitu Raja, dan masyarakat sekitar menjulukinya Si Bungke / Si Bukke sebagai cikal bakal Sidabungke/Sidabukke.",
      svg: illustrations.hoeBungke,
      quote: "‘Di hamu ma pestamu na i, bungke on ma di au!’ — Sumpah & Asal Mula Goar."
    },
    {
      era: "Babak V: Pambalason & Ikatan Tutur Imbaru",
      title: "Himbauan Mar-Hulahula tu Boru Napitu & Marga Parna",
      text: "Mengetahui namanya dihapus dari keturunan Napitu Raja, Raja Sinalin semakin sakit hati hingga melampiaskan dendamnya dengan sengaja menghimbau keturunannya untuk menikahi Boru Napitu. Himbauan Sidabungke membuahkan hasil di mana marga Sidabungke semakin banyak yang menikahi Boru Napitu di Sangkal Sibatubatu dan di daerah lainnya. Alhasil, di Sibatubatu marga Sidabungke lazim mar-hulahula pada marga Napitu. Tradisi kawin-mawin ini merembet pada marga Parna lainnya (seperti Boru Sidabutar atau Munte). Karena itu, marga Sidabungke tidak lagi diidentifikasi sebagai bagian dari Parsadaan Nai Ambaton (Parna).",
      svg: illustrations.ulosMarriage,
      quote: "Sidabungke mar-hulahula tu Napitu, gabe ruar sian ruhut parsadanan Parna."
    },
    {
      era: "Babak VI: Tolu Anak Ni Raja Sidabungke",
      title: "Ompu Dungkit Talun, Guru Marsait Lipan, & Ompu Niunggul",
      text: "Di pengasingannya, Raja Sinalin memiliki tiga anak laki-laki yang mengemban nama ayahnya menjadi marga mandiri: (1) Ompu Dungkit Talun, menetap di Sibatubatu, mayoritas keturunannya mar-hulahula pada marga Napitu, sigap memanggil tulang pada marga Parna dan tidak pernah menyebut dirinya Parna; (2) Guru Marsait Lipan, merantau ke Huta Silalahi Nabolak; dan (3) Ompu Niunggul, berdiam di Huta Sidabungke bersama Raja Sidabungke.",
      svg: illustrations.threeBranches,
      quote: "Tolu dangka ompu na manuraphon rami ni pomparan sahat tu sadari on."
    },
    {
      era: "Babak VII: Parserahan Tu Simalungun & Tongging",
      title: "Ompu Ombing & Sebutan Marga Saragi/h Sidabungke",
      text: "Guru Marsait Lipan di Silalahi Nabolak menikah tetapi tidak berketurunan, lalu mengangkat salah satu anak adiknya Ompu Niunggul, yaitu Ompu Ombing. Ompu Ombing dewasa mengenal dan dekat dengan Ompu Partumpuan Saragi di Tongging, dinikahkan dengan Boru Silalahi, sekaligus ditabalkan marga Saragi pada Ompu Ombing Sidabungke. Keturunan Ompu Ombing menyebar ke wilayah Simalungun dan memangku sebutan marga Saragih Sidabungke. Karena ketidaktahuan tarombo, sebagian perantau di Simalungun, Pakpak Dairi, dan Tanah Karo terkadang mengira dirinya keturunan Saragi Tua atau mengaku Parna, padahal silsilah aslinya bermula dari Ompu Ombing Sidabungke.",
      svg: illustrations.scrollTongging,
      quote: "Hatorangan tutur Saragi/Saragih Sidabungke sian bona Ompu Ombing."
    }
  ];

  let cardsHtml = "";
  detailedHistory.forEach((item, index) => {
    const isLeft = index % 2 === 0;
    // Jika tamu (guest), kartu langsung tampil tanpa harus menunggu trigger animasi buka
    const initialCardOpacity = isUserLoggedIn ? "0" : "1";
    const initialCardTransform = isUserLoggedIn ? "translateY(25px)" : "translateY(0)";

    cardsHtml += `
      <div class="history-step-card" style="display: flex; align-items: center; justify-content: ${isLeft ? 'flex-start' : 'flex-end'}; width: 100%; box-sizing: border-box; margin-bottom: 25px; opacity: ${initialCardOpacity}; transform: ${initialCardTransform}; transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);">
        <div class="timeline-card-floating" style="width: calc(50% - 30px); background: linear-gradient(135deg, rgba(28, 28, 38, 0.94) 0%, rgba(18, 18, 26, 0.98) 100%); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.08); border-left: 4px solid ${isLeft ? 'var(--accent-red, #ef4444)' : '#fbbf24'}; padding: 22px 24px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 36px; height: 36px; flex-shrink: 0; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 6px;">
              ${item.svg}
            </div>
            <div>
              <span style="display: block; font-size: 10px; font-weight: 800; color: #f87171; letter-spacing: 0.6px; text-transform: uppercase;">${item.era}</span>
              <h3 style="margin: 2px 0 0; font-size: 15.5px; color: #ffffff; font-weight: 800;">${item.title}</h3>
            </div>
          </div>
          <p style="margin: 0 0 14px; font-size: 12.5px; line-height: 1.7; color: #d1d5db; text-align: justify;">
            ${item.text}
          </p>
          <div style="background: rgba(0, 0, 0, 0.4); border-left: 2.5px solid #fbbf24; padding: 8px 12px; border-radius: 4px; font-size: 11px; font-style: italic; color: #fbbf24; line-height: 1.5;">
            ${item.quote}
          </div>
        </div>
      </div>
    `;
  });

  // Teks & Aksi Tombol Kembali (Bagan Tarombo untuk Guest, Dashboard untuk User Login)
  const backBtnText = isUserLoggedIn ? "Mulak Tu Dashboard" : "Mulak tu Bagan Tarombo";

  container.innerHTML = `
    <!-- TOMBOL NAVIGASI MELAYANG (KEMBALI KE TAROMBO / DASHBOARD) -->
    <div id="floating-back-dashboard" style="display: ${isUserLoggedIn ? 'none' : 'block'}; position: fixed; top: 24px; right: 30px; z-index: 9999; opacity: ${isUserLoggedIn ? '0' : '1'}; transition: opacity 0.4s ease, transform 0.4s ease; transform: translateY(${isUserLoggedIn ? '-10px' : '0'});">
      <button id="btn-floating-back" type="button" style="display: flex; align-items: center; gap: 8px; background: rgba(24, 24, 32, 0.9); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1.5px solid rgba(251, 191, 36, 0.5); padding: 9px 20px; border-radius: 30px; color: #fbbf24; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 25px rgba(0,0,0,0.6), 0 0 16px rgba(251, 191, 36, 0.25); transition: all 0.25s ease;">
        <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        ${backBtnText}
      </button>
    </div>

    <!-- AREA HEADER SEJARAH -->
    <div id="history-header-box" style="text-align: center; margin: ${isUserLoggedIn ? '40px auto 35px auto' : '15px auto 35px auto'}; max-width: 900px; position: relative; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);">
      
      <!-- Lencana Utama (Hanya Tampil Jika Login) -->
      ${
        isUserLoggedIn
          ? `
            <button id="btn-badge-trigger" type="button" title="Klik tu mambungka sejarah sandokna" style="display: inline-flex; align-items: center; gap: 9px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #fbbf24; background: rgba(30, 20, 25, 0.88); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); padding: 8px 20px; border-radius: 30px; border: 1.5px solid rgba(239, 68, 68, 0.65); box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 18px rgba(239, 68, 68, 0.3); cursor: pointer; transition: all 0.3s ease; position: relative; z-index: 5;">
              <span>TURITURIAN & BUKTI ADAT</span>
              <div class="scroll-bounce-arrow" style="width: 20px; height: 20px; border-radius: 50%; background: var(--accent-red, #ef4444); color: #fff; display: flex; align-items: center; justify-content: center;">
                <svg style="width: 12px; height: 12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </button>
          `
          : ''
      }

      <!-- TEKS JUDUL (Untuk Tamu Langsung Tajam Tanpa Blur) -->
      <div id="history-blur-text-group" style="filter: ${isUserLoggedIn ? 'blur(2.5px)' : 'none'}; opacity: ${isUserLoggedIn ? '0.55' : '1'}; user-select: none; transition: filter 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease; cursor: ${isUserLoggedIn ? 'pointer' : 'default'}; margin-top: 15px;">
        <h2 id="history-main-title" style="font-size: ${isUserLoggedIn ? '27px' : '30px'}; color: #ffffff; font-weight: 800; margin: 0 0 8px; transition: font-size 0.5s ease;">
          Sejarah & Barita Ni Raja Sidabukke
        </h2>
        <p id="history-main-desc" style="color: var(--text-muted, #9ca3af); font-size: 13.5px; max-width: 760px; margin: 0 auto; line-height: 1.65;">
          Hatorangan haroroan ni Marga Sidabukke/Sidabungke sian Sangkal Sibatubatu, pamburuon tu harangan, cikal bakal goar Bungke, sahat tu parserahan ni pinomparna.
        </p>
      </div>
    </div>

    <!-- WADAH LINIMASA KARTU (Untuk Tamu Langsung Terbuka Penuh) -->
    <div id="history-timeline-full-wrapper" style="display: ${isUserLoggedIn ? 'none' : 'block'}; position: relative; max-width: 960px; margin: 30px auto; opacity: ${isUserLoggedIn ? '0' : '1'}; transition: opacity 0.5s ease;">
      <div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; background: linear-gradient(to bottom, var(--accent-red, #ef4444) 0%, #fbbf24 50%, rgba(239, 68, 68, 0.15) 100%); transform: translateX(-50%); z-index: 1;"></div>
      <div style="position: flex; flex-direction: column; position: relative; z-index: 2;">
        ${cardsHtml}
      </div>
    </div>
  `;

  const btnBadge = document.getElementById("btn-badge-trigger");
  const blurTextGroup = document.getElementById("history-blur-text-group");
  const fullTimelineWrapper = document.getElementById("history-timeline-full-wrapper");
  const floatingBack = document.getElementById("floating-back-dashboard");
  const btnFloatingBack = document.getElementById("btn-floating-back");
  const mainNavbar = document.querySelector(".app-floating-navbar") as HTMLElement;
  const dashboardTopSections = document.querySelectorAll("#view-dashboard > div:not(#history-timeline-container)");
  const historyHeaderBox = document.getElementById("history-header-box");
  const viewDashboard = document.getElementById("view-dashboard");

  // FUNGSI BUKA SEJARAH PENUH (Hanya Dipakai Saat User Login Menekan Trigger Dari Dashboard)
  const openFullHistory = () => {
    if (!isUserLoggedIn) return;

    if (viewDashboard) {
      viewDashboard.style.transition = "filter 0.4s ease";
      viewDashboard.style.filter = "blur(8px)";
    }
    if (mainNavbar) {
      mainNavbar.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      mainNavbar.style.opacity = "0";
      mainNavbar.style.transform = "translate(-50%, -20px)";
    }
    dashboardTopSections.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      htmlEl.style.opacity = "0";
      htmlEl.style.transform = "translateY(-15px)";
    });

    setTimeout(() => {
      if (mainNavbar) mainNavbar.style.display = "none";
      dashboardTopSections.forEach((el) => ((el as HTMLElement).style.display = "none"));

      if (blurTextGroup) {
        blurTextGroup.style.filter = "none";
        blurTextGroup.style.opacity = "1";
        blurTextGroup.style.cursor = "default";
      }

      if (floatingBack) {
        floatingBack.style.display = "block";
        setTimeout(() => {
          floatingBack.style.opacity = "1";
          floatingBack.style.transform = "translateY(0)";
        }, 50);
      }

      if (historyHeaderBox) {
        historyHeaderBox.style.margin = "20px auto 40px auto";
        if (btnBadge) btnBadge.style.display = "none";
        const title = document.getElementById("history-main-title");
        if (title) title.style.fontSize = "32px";
      }

      if (fullTimelineWrapper) {
        fullTimelineWrapper.style.display = "block";
      }

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        if (viewDashboard) viewDashboard.style.filter = "none";
        if (fullTimelineWrapper) fullTimelineWrapper.style.opacity = "1";

        const cards = document.querySelectorAll(".history-step-card");
        cards.forEach((card, index) => {
          setTimeout(() => {
            const cardEl = card as HTMLElement;
            cardEl.style.opacity = "1";
            cardEl.style.transform = "translateY(0)";
          }, index * 80);
        });
      }, 100);
    }, 320);
  };

  // FUNGSI KEMBALI: LOGIC GUEST -> TAROMBO, LOGGED IN -> DASHBOARD
  const handleBackNavigation = () => {
    if (!isUserLoggedIn) {
      // Jika tamu (guest), kembali ke bagan silsilah
      const navTreeBtn = document.querySelector(".nav-pill-btn[data-target='view-tree']") as HTMLElement;
      if (navTreeBtn) {
        navTreeBtn.click();
      } else {
        document.querySelectorAll(".app-viewport > section").forEach((sec) => ((sec as HTMLElement).style.display = "none"));
        const treeSec = document.getElementById("view-tree");
        if (treeSec) treeSec.style.display = "flex";
      }
      return;
    }

    // Jika user login, kembalikan tampilan ke ringkasan dashboard
    if (floatingBack) {
      floatingBack.style.opacity = "0";
      floatingBack.style.transform = "translateY(-10px)";
    }
    if (viewDashboard) {
      viewDashboard.style.transition = "filter 0.35s ease";
      viewDashboard.style.filter = "blur(8px)";
    }

    setTimeout(() => {
      if (floatingBack) floatingBack.style.display = "none";
      if (mainNavbar) {
        mainNavbar.style.display = "flex";
        setTimeout(() => {
          mainNavbar.style.opacity = "1";
          mainNavbar.style.transform = "translateX(-50%)";
        }, 30);
      }
      dashboardTopSections.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = "";
        setTimeout(() => {
          htmlEl.style.opacity = "1";
          htmlEl.style.transform = "translateY(0)";
        }, 50);
      });

      if (blurTextGroup) {
        blurTextGroup.style.filter = "blur(2.5px)";
        blurTextGroup.style.opacity = "0.55";
        blurTextGroup.style.cursor = "pointer";
      }

      if (fullTimelineWrapper) {
        fullTimelineWrapper.style.display = "none";
        fullTimelineWrapper.style.opacity = "0";
        document.querySelectorAll(".history-step-card").forEach((card) => {
          const cardEl = card as HTMLElement;
          cardEl.style.opacity = "0";
          cardEl.style.transform = "translateY(25px)";
        });
      }

      if (historyHeaderBox) {
        historyHeaderBox.style.margin = "40px auto 35px auto";
        if (btnBadge) btnBadge.style.display = "inline-flex";
        const title = document.getElementById("history-main-title");
        if (title) title.style.fontSize = "27px";
      }

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        if (viewDashboard) viewDashboard.style.filter = "none";
      }, 150);
    }, 280);
  };

  // Event Listeners
  if (isUserLoggedIn) {
    btnBadge?.addEventListener("click", openFullHistory);
    blurTextGroup?.addEventListener("click", openFullHistory);
  }
  btnFloatingBack?.addEventListener("click", handleBackNavigation);
}