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

  // ---- 初回ロード演出：HEROの登場シーケンス ----
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".hero-kicker", { y: 22, opacity: 0, duration: 0.6 }, 0.15)
    .from(".hero-title .ch", { yPercent: 130, duration: 0.85, stagger: 0.04, ease: "power4.out" }, 0.2)
    .from(".hero-desc", { y: 24, opacity: 0, duration: 0.7 }, "-=0.45")
    .from(".hero-actions", { y: 24, opacity: 0, duration: 0.7 }, "-=0.5")
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
} else {
  // GSAPなし・reduced-motion時は全部表示
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.style.opacity = 1;
    el.style.transform = "none";
  });
}

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
