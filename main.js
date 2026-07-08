// ============ RUKA portfolio ============
document.documentElement.classList.add("js");

// ---- 過程ログを描画 ----
const logList = document.getElementById("log-list");
if (logList && typeof PROCESS_LOG !== "undefined") {
  logList.innerHTML = PROCESS_LOG.map(
    (item) => `
    <li class="log-item" data-reveal>
      <span class="log-date">${item.date}</span>
      <span class="log-text">${item.text}</span>
    </li>`
  ).join("");
}

// ---- ライブ実データ帯（henry.codes式） ----
(function liveStatus() {
  const BUILD_START = new Date("2026-05-01T00:00:00+09:00"); // X自動化が動き始めた月
  const days = Math.max(1, Math.floor((Date.now() - BUILD_START) / 86400000));
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("stat-days", "DAY " + days);
  if (typeof PROCESS_LOG !== "undefined" && PROCESS_LOG[0]) set("stat-update", PROCESS_LOG[0].date);
  const shipped = document.querySelectorAll(".work-row").length;
  if (shipped) set("stat-shipped", String(shipped).padStart(2, "0"));
  const clock = () => {
    const t = new Date().toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour12: false });
    set("stat-clock", t);
  };
  clock();
  setInterval(clock, 1000);
})();

// ---- 過程ログ ティッカー（PROCESS_LOGから自動生成） ----
const ticker = document.getElementById("log-ticker");
if (ticker && typeof PROCESS_LOG !== "undefined") {
  const items = PROCESS_LOG.map((item) => {
    const short = item.text.length > 42 ? item.text.slice(0, 42) + "…" : item.text;
    return `<span class="lt-date">${item.date}</span><span class="lt-text">${short}</span><i>✦</i>`;
  }).join("");
  ticker.innerHTML = `<div class="lt-group">${items}</div><div class="lt-group">${items}</div>`;
}

// ---- アニメーション（GSAP） ----
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (typeof gsap !== "undefined" && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);

  // ---- 見出しを1文字ずつspan化（Garden Eight式の下ごしらえ） ----
  document.querySelectorAll(".hero-title .line-inner").forEach((el) => {
    el.innerHTML = [...el.textContent]
      .map((c) => `<span class="ch">${c}</span>`)
      .join("");
  });

  // ---- 初回ロード演出：HEROの登場シーケンス（即発火） ----
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".hero-title .ch", { yPercent: 130, duration: 0.85, stagger: 0.04, ease: "power4.out" }, 0.2)
    .from(".hero-desc", { y: 24, opacity: 0, duration: 0.7 }, "-=0.45")
    .from(".hero-actions", { y: 24, opacity: 0, duration: 0.7 }, "-=0.5")
    .from(".hero-status", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
    .from(".hero-watermark", { opacity: 0, duration: 1.4 }, "-=0.7")
    .from(".hero-orbit", { scale: 0.85, opacity: 0, duration: 1, stagger: 0.15 }, "-=1.1")
    .from(".hero-roll-track span", { yPercent: 100, duration: 0.8, ease: "power4.out" }, 0.5)
    .from(".site-nav", { y: -16, opacity: 0, duration: 0.6 }, 0.3);

  // ---- 出現後：文字がずっと微妙に浮遊し続ける（Garden Eight式） ----
  intro.eventCallback("onComplete", () => {
    document.querySelectorAll(".hero-title .ch").forEach((ch) => {
      gsap.to(ch, {
        y: () => gsap.utils.random(-4, 4),
        rotation: () => gsap.utils.random(-1.5, 1.5),
        duration: () => gsap.utils.random(2.2, 3.8),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        repeatRefresh: true,
        delay: gsap.utils.random(0, 1.2),
      });
    });
  });

  // ---- スクロール視差：背景と手前に時差を出す（exoape式の浮遊感） ----
  // ヒーローの巨大ウォーターマークは"背景層"としてゆっくり動く
  gsap.to(".hero-watermark", {
    yPercent: 22, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
  });
  // 下端ローリングネームは逆方向にわずかに流す
  gsap.to(".hero-roll", {
    yPercent: -30, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.4 },
  });
  // 作ったものの実物メディアは、テキストより遅れて動く（浮いてる感）
  gsap.utils.toArray(".work-media").forEach((m) => {
    gsap.fromTo(m, { yPercent: 6 }, {
      yPercent: -6, ease: "none",
      scrollTrigger: { trigger: m.closest(".work-row"), start: "top bottom", end: "bottom top", scrub: 1 },
    });
  });

  // ---- 見出し(h2)：クリップマスクで下から立ち上がる ----
  gsap.utils.toArray(".section-head h2[data-reveal], .cta h2[data-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(0 0 100% 0)", y: 30 },
      {
        clipPath: "inset(0 0 -10% 0)",
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 86%", once: true },
      }
    );
  });

  // ---- その他要素：ふわっとリビール ----
  gsap.utils.toArray("[data-reveal]:not(h2)").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 26 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });

  // ---- 数字カウントアップ（data-count） ----
  gsap.utils.toArray("[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const state = { n: 0 };
    gsap.to(state, {
      n: target,
      duration: 1.4,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      onUpdate() {
        el.textContent = prefix + Math.round(state.n).toLocaleString() + suffix;
      },
    });
  });
  // HOW I WORK：セクション入場でツリー線描画＋カード立ち上げ（.is-in でCSSアニメ発火）
  const hiw = document.querySelector(".how-i-work");
  if (hiw) {
    ScrollTrigger.create({
      trigger: hiw,
      start: "top 70%",
      once: true,
      onEnter: () => hiw.classList.add("is-in"),
    });
  }
} else {
  // GSAPなし・reduced-motion時は全部表示
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.style.opacity = 1;
    el.style.transform = "none";
  });
  // HOW I WORK も静止で可視化（線・カードを即表示）
  const hiwEl = document.querySelector(".how-i-work");
  if (hiwEl) hiwEl.classList.add("is-in");
}

// ---- ローディング（数字カウンター）→ 完了でHERO演出発火 ----
// ---- スクロールはブラウザ標準（Lenisスムーススクロールは重いので廃止・2026-07-08） ----
// 視差(scrub)アニメはScrollTriggerが標準スクロールで動く。lenisはnull固定でナビはscrollIntoViewにフォールバック
let lenis = null;

// ---- ナビ内リンク：画面フェード切替（14islands式） ----
(function fadeNav() {
  const overlay = document.getElementById("page-transition");
  const links = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      // メニュー開いてたら閉じる
      const mo = document.getElementById("menu-overlay");
      if (mo && mo.classList.contains("open")) mo.classList.remove("open");
      if (!overlay || reduceMotion) { jumpTo(); return; }
      overlay.classList.add("active");                 // 幕を下ろす（フェードイン）
      setTimeout(() => {
        jumpTo();                                      // 幕の裏で瞬間移動
        requestAnimationFrame(() => overlay.classList.remove("active")); // 幕を上げる（フェードアウト）
      }, 430);
      function jumpTo() {
        if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
        else target.scrollIntoView({ behavior: "auto" });
      }
    });
  });
})();

// ---- スクロール進捗バー ----
const progressBar = document.querySelector(".scroll-progress");
if (progressBar) {
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();
}

// ---- HEROマウス視差（PC・reduced-motion無効時のみ） ----
const heroEl = document.querySelector(".hero");
if (heroEl && window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
  heroEl.addEventListener("mousemove", (e) => {
    const r = heroEl.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 26;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 18;
    heroEl.style.setProperty("--hx", `${x.toFixed(1)}px`);
    heroEl.style.setProperty("--hy", `${y.toFixed(1)}px`);
  });
  heroEl.addEventListener("mouseleave", () => {
    heroEl.style.setProperty("--hx", "0px");
    heroEl.style.setProperty("--hy", "0px");
  });
}

// ---- リール動画：ホバーで再生、離れたら停止（クリックでも切替） ----
document.querySelectorAll(".phone-frame video").forEach((v) => {
  const frame = v.closest(".phone-frame");
  frame.addEventListener("mouseenter", () => v.play());
  frame.addEventListener("mouseleave", () => v.pause());
  frame.addEventListener("click", () => (v.paused ? v.play() : v.pause()));
});

// ---- マグネットボタン（PCのみ・カーソルに軽く吸い付く） ----
if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
  document.querySelectorAll("[data-magnet]").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

// ---- 固定ナビ：スクロールで背景付与 ----
const siteNav = document.getElementById("site-nav");
if (siteNav) {
  const onScroll = () => siteNav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ---- 全画面メニュー開閉 ----
const menuOverlay = document.getElementById("menu-overlay");
const menuBtn = document.getElementById("nav-menu-btn");
const menuClose = document.getElementById("menu-close");
if (menuOverlay && menuBtn && menuClose) {
  const setMenu = (open) => {
    menuOverlay.classList.toggle("open", open);
    menuOverlay.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuBtn.addEventListener("click", () => setMenu(true));
  menuClose.addEventListener("click", () => setMenu(false));
  menuOverlay.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false))
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });
}

// ---- CLIENT WORK：制作実績ギャラリー生成（client-work-data.js の配列を読む） ----
(function buildClientWork() {
  const wall = document.getElementById("cw-wall");
  if (!wall) return;
  const works = Array.isArray(window.CLIENT_WORKS) ? window.CLIENT_WORKS : [];
  const ROWS = 3;
  const PLACEHOLDERS = 6; // 実績0件のとき各行に流す仮枠の総数
  const source = works.length ? works : Array.from({ length: PLACEHOLDERS }, () => null);

  const cardHTML = (w) =>
    w
      ? `<article class="cw-card"><a class="cw-thumb" href="${w.url || "#"}" style="background-image:url('${w.thumb || ""}')"><span class="cw-label"><span class="cw-k">${w.kind || ""}</span><span class="cw-t">${w.title || ""}</span></span></a></article>`
      : `<article class="cw-card is-placeholder"><span class="cw-ph">Coming soon</span></article>`;

  for (let r = 0; r < ROWS; r++) {
    const items = source.filter((_, i) => i % ROWS === r);
    const inner = items.map(cardHTML).join("");
    const row = document.createElement("div");
    row.className = "cw-row";
    // 中身を2セット並べて -50% で継ぎ目なし無限ループ
    row.innerHTML = `<div class="cw-row-track">${inner}${inner}</div>`;
    wall.appendChild(row);
  }

  // honest count：実データ件数（0なら0のまま）
  const countEl = document.getElementById("cw-count");
  if (countEl) countEl.textContent = works.length;
  // 0件のときはピル文言を「制作受付中」に寄せる（0という数字を不自然に見せない）
  const lead = document.querySelector(".cw-badge .cw-lead");
  if (lead && works.length === 0) lead.textContent = "制作受付中 · 第1号募集";
})();
