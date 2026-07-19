import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const legacyHeader = document.querySelector(".site-nav");
const legacyNav = legacyHeader?.querySelector(".nav-links");
const legacyBrand = legacyHeader?.querySelector(".brand-lockup");

if (legacyHeader && legacyNav) {
  legacyHeader.classList.add("platform-nav");
  legacyNav.classList.add("primary-nav");
  legacyBrand?.classList.add("platform-brand");
  if (!legacyHeader.querySelector(".menu-toggle")) {
    const generatedMenu = document.createElement("button");
    generatedMenu.className = "menu-toggle";
    generatedMenu.type = "button";
    generatedMenu.textContent = "Menu";
    generatedMenu.setAttribute("aria-expanded", "false");
    generatedMenu.setAttribute("aria-controls", "primary-nav");
    legacyNav.id ||= "primary-nav";
    legacyHeader.insertBefore(generatedMenu, legacyNav);
  }
}

const menuButton = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

document.querySelector("[data-print-resume]")?.addEventListener("click", () => window.print());

if (menuButton && primaryNav) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };
  menuButton.addEventListener("click", () => {
    const opening = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(opening));
    primaryNav.classList.toggle("is-open", opening);
    document.body.classList.toggle("menu-open", opening);
  });
  primaryNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      menuButton.focus();
    }
  });
}

document.querySelectorAll("[data-capability]").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.parentElement;
    group.querySelectorAll("[data-capability]").forEach((item) => {
      const active = item === button;
      item.setAttribute("aria-expanded", String(active));
      const icon = item.querySelector("b");
      if (icon) icon.textContent = active ? "−" : "+";
    });
  });
});

const carousel = document.querySelector("[data-carousel]");
if (carousel) {
  const slides = [...carousel.querySelectorAll("article")];
  let current = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === current));
  };
  document.querySelector("[data-carousel-prev]")?.addEventListener("click", () => show(current - 1));
  document.querySelector("[data-carousel-next]")?.addEventListener("click", () => show(current + 1));
}

if (!reduceMotion) {
  gsap.from(".hero-copy > *", { y: 55, opacity: 0, duration: 1, stagger: 0.12, ease: "power3.out" });
  gsap.from(".hero-support > *", { y: 35, opacity: 0, duration: 0.9, delay: 0.25, stagger: 0.1, ease: "power3.out" });
  gsap.utils.toArray(".proof-card").forEach((card) => {
    gsap.from(card, { y: 48, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 88%", once: true } });
  });
  gsap.utils.toArray(".operating-stack article").forEach((card, index) => {
    gsap.to(card, { scale: 1 - index * 0.012, transformOrigin: "center top", ease: "none", scrollTrigger: { trigger: card, start: "top 115px", end: "bottom 115px", scrub: 0.5 } });
  });
  const platformCopy = document.querySelector(".platform-copy");
  const capabilityList = document.querySelector(".capability-list");
  if (platformCopy && capabilityList && window.innerWidth > 1000) {
    ScrollTrigger.create({ trigger: ".platform-capabilities", start: "top 115px", endTrigger: capabilityList, end: "bottom bottom-=120", pin: platformCopy, pinSpacing: false });
  }
  gsap.utils.toArray(".platform-cases a, .horizon-grid article, .funding-grid article").forEach((item) => {
    gsap.from(item, { y: 28, duration: 0.75, ease: "power2.out", scrollTrigger: { trigger: item, start: "top 91%", once: true } });
  });
}
