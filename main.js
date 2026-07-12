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

const menuOverlay = document.getElementById("menu-overlay");
const menuBtn = document.getElementById("nav-menu-btn");
const menuClose = document.getElementById("menu-close");
if (menuOverlay && menuBtn && menuClose) {
  const setMenu = (open) => {
    menuOverlay.classList.toggle("open", open);
    menuOverlay.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) menuClose.focus(); else menuBtn.focus();
  };
  menuBtn.addEventListener("click", () => setMenu(true));
  menuClose.addEventListener("click", () => setMenu(false));
  menuOverlay.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOverlay.classList.contains("open")) setMenu(false);
  });
}
