(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav-links]");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
  }

  document.querySelectorAll("[data-capability]").forEach((button) => {
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      document.querySelectorAll("[data-capability]").forEach((peer) => {
        peer.setAttribute("aria-expanded", "false");
        peer.querySelector("b").textContent = "+";
      });
      button.setAttribute("aria-expanded", String(!open));
      button.querySelector("b").textContent = open ? "+" : "−";
    });
  });

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll(".carousel-slide")];
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    let active = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));

    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const selected = slideIndex === active;
        slide.classList.toggle("is-active", selected);
        slide.setAttribute("aria-hidden", String(!selected));
      });
    };

    previous?.addEventListener("click", () => show(active - 1));
    next?.addEventListener("click", () => show(active + 1));
    show(active);
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".hero-copy > *", {
    opacity: 0,
    y: 40,
    duration: 1,
    stagger: 0.08,
    ease: "power3.out",
  });

  gsap.utils.toArray(".proof-image").forEach((image) => {
    gsap.fromTo(
      image,
      { scale: 0.82, opacity: 0.45 },
      {
        scale: 1,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: image.closest(".proof-card") || image,
          start: "top 90%",
          end: "bottom 20%",
          scrub: true,
        },
      },
    );
  });

  if (document.body.dataset.option === "a" && window.innerWidth > 900) {
    ScrollTrigger.create({
      trigger: ".platform-layout",
      start: "top 120px",
      end: "bottom bottom-=120",
      pin: ".pin-copy",
      pinSpacing: false,
    });
  }

  if (["a", "b"].includes(document.body.dataset.option)) {
    gsap.utils.toArray(".stack-card").forEach((card, index) => {
      gsap.to(card, {
        scale: 1 - index * 0.025,
        y: index * 9,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top 130px",
          end: "bottom 130px",
          scrub: true,
        },
      });
    });
  }

  if (document.body.dataset.option === "c") {
    const copy = document.querySelector("[data-scrub-copy]");
    if (copy) {
      const words = copy.textContent.trim().split(/\s+/);
      copy.innerHTML = words.map((word) => `<span>${word}</span>`).join(" ");
      gsap.to(copy.querySelectorAll("span"), {
        opacity: 1,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: {
          trigger: copy,
          start: "top 82%",
          end: "bottom 48%",
          scrub: true,
        },
      });
    }
  }
})();
