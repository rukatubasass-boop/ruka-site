document.documentElement.classList.add("js");

// GA4の測定IDをindex.htmlのRUKA_ANALYTICS_IDに設定すると、CTAクリックを計測する。
// 未設定時は何も送信しないため、公開前にGA4のG-から始まるIDを入れること。
(function setupAnalytics() {
  const id = window.RUKA_ANALYTICS_ID;
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", id);
})();

function trackCTA(name) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "cta_click", { cta_name: name });
  }
}

document.querySelectorAll("[data-track]").forEach((link) => {
  link.addEventListener("click", () => trackCTA(link.dataset.track));
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const progressBar = document.querySelector(".scroll-progress");
if (progressBar) {
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
}

const siteNav = document.getElementById("site-nav");
if (siteNav) {
  const updateNav = () => siteNav.classList.toggle("scrolled", window.scrollY > 16);
  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();
}

const clock = document.getElementById("stat-clock");
if (clock) {
  const updateClock = () => {
    clock.textContent = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date());
  };
  updateClock();
  window.setInterval(updateClock, 30000);
}

const menuOverlay = document.getElementById("menu-overlay");
const menuBtn = document.getElementById("nav-menu-btn");
const menuClose = document.getElementById("menu-close");
if (menuOverlay && menuBtn && menuClose) {
  const setMenu = (open, returnFocus = true) => {
    menuOverlay.classList.toggle("open", open);
    menuOverlay.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) menuClose.focus();
    else if (returnFocus) menuBtn.focus();
  };
  menuBtn.addEventListener("click", () => setMenu(true));
  menuClose.addEventListener("click", () => setMenu(false));
  menuOverlay.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false, false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOverlay.classList.contains("open")) setMenu(false);
  });
}

function splitChars(element) {
  const text = element.textContent.trim();
  element.textContent = "";
  [...text].forEach((char) => {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = char === " " ? "\u00a0" : char;
    element.appendChild(span);
  });
  return element.querySelectorAll(".char");
}

function setupMotion() {
  const revealItems = document.querySelectorAll("[data-reveal]");
  if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
    revealItems.forEach((item) => { item.style.opacity = "1"; item.style.transform = "none"; });
    document.querySelector(".process")?.classList.add("is-in");
    return;
  }

  const { gsap } = window;
  gsap.registerPlugin(window.ScrollTrigger);
  const titleChars = [...document.querySelectorAll(".hero-title .line-inner")].flatMap((line) => [...splitChars(line)]);
  gsap.set([titleChars, "[data-intro]", ".hero-status"], { opacity: 0 });
  gsap.set(titleChars, { yPercent: 115, rotate: 2 });
  gsap.set("[data-intro]", { y: 22 });
  gsap.set(".hero-status", { y: 18 });
  gsap.set(".hero-orbit", { scale: .76, opacity: 0 });

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .to(".site-nav", { opacity: 1, duration: .35 })
    .to(titleChars, { yPercent: 0, rotate: 0, opacity: 1, duration: .7, stagger: .026 }, .12)
    .to("[data-intro]", { y: 0, opacity: 1, duration: .55, stagger: .08 }, .42)
    .to(".hero-status", { y: 0, opacity: 1, duration: .5 }, .7)
    .to(".hero-orbit", { scale: 1, opacity: 1, duration: 1, stagger: .14 }, .25);

  const hero = document.querySelector(".hero");
  const watermark = document.querySelector(".hero-watermark");
  if (hero && watermark) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      gsap.to(watermark, { "--water-x": `${x * -22}px`, "--water-y": `${y * -14}px`, duration: .8, overwrite: true });
    });
    hero.addEventListener("pointerleave", () => {
      gsap.to(watermark, { "--water-x": "0px", "--water-y": "0px", duration: .8, overwrite: true });
    });
  }

  gsap.to(".hero-watermark", {
    yPercent: 17,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero-roll", {
    xPercent: -10,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  revealItems.forEach((item) => {
    gsap.fromTo(item, { autoAlpha: 0, y: 42 }, {
      autoAlpha: 1, y: 0, duration: .72, ease: "power3.out",
      scrollTrigger: { trigger: item, start: "top 85%", once: true },
    });
  });
  document.querySelectorAll(".work-row").forEach((row) => {
    const media = row.querySelector(".work-media");
    if (!media) return;
    gsap.to(media, {
      yPercent: -7,
      ease: "none",
      scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  const process = document.querySelector(".process");
  if (process) {
    window.ScrollTrigger.create({
      trigger: process,
      start: "top 65%",
      once: true,
      onEnter: () => process.classList.add("is-in"),
    });
  }

  // #process のような深いアンカーで開いた時も、通過済みの要素を隠したままにしない。
  window.requestAnimationFrame(() => {
    revealItems.forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight * .85) {
        gsap.set(item, { autoAlpha: 1, y: 0 });
      }
    });
    if (process && process.getBoundingClientRect().top < window.innerHeight * .65) process.classList.add("is-in");
  });
}

setupMotion();

document.querySelectorAll("[data-hover-video]").forEach((video) => {
  const play = () => video.play().catch(() => {});
  const pause = () => { video.pause(); video.currentTime = 0; };
  video.addEventListener("pointerenter", play);
  video.addEventListener("pointerleave", pause);
  video.addEventListener("focus", play);
  video.addEventListener("blur", pause);
});

if (!prefersReducedMotion && window.gsap) {
  const { gsap } = window;
  document.querySelectorAll("[data-magnet]").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      gsap.to(button, {
        x: (event.clientX - rect.left - rect.width / 2) * .13,
        y: (event.clientY - rect.top - rect.height / 2) * .13,
        duration: .25,
        overwrite: true,
      });
    });
    button.addEventListener("pointerleave", () => gsap.to(button, { x: 0, y: 0, duration: .4, ease: "elastic.out(1,.5)" }));
  });

  const transition = document.querySelector(".page-transition");
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target || !transition) return;
      event.preventDefault();
      gsap.timeline()
        .set(transition, { transformOrigin: "bottom" })
        .to(transition, { scaleY: 1, duration: .18, ease: "power2.in" })
        .add(() => target.scrollIntoView({ behavior: "auto", block: "start" }))
        .set(transition, { transformOrigin: "top" })
        .to(transition, { scaleY: 0, duration: .32, ease: "power3.out" });
    });
  });
}
