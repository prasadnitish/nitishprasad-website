(function () {
  var progressPath = document.querySelector("[data-vine-progress]");
  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-vine-node]"));
  var progressBar = document.querySelector("[data-mobile-progress]");
  var frames = Array.prototype.slice.call(document.querySelectorAll("[data-frame]"));
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var moved = false;
  var pathLength = 0;

  function markMoved() {
    if (moved) return;
    moved = true;
    document.body.classList.add("has-moved");
  }

  function setupVine() {
    if (!progressPath || typeof progressPath.getTotalLength !== "function") return;
    pathLength = progressPath.getTotalLength();
    progressPath.style.strokeDasharray = pathLength;
    progressPath.style.strokeDashoffset = pathLength;
  }

  function updateProgress() {
    var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    document.documentElement.style.setProperty("--scroll-progress", ratio.toFixed(4));
    if (progressBar) progressBar.style.width = (ratio * 100).toFixed(2) + "%";
    if (progressPath && pathLength) {
      progressPath.style.strokeDashoffset = String(pathLength * (1 - ratio));
    }
    if (window.scrollY > 24) markMoved();
  }

  function setupFrameObserver() {
    if (!frames.length) return;
    frames[0].classList.add("is-visible", "is-active");
    if (!("IntersectionObserver" in window)) {
      frames.forEach(function (frame) {
        frame.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = frames.indexOf(entry.target);
        frames.forEach(function (frame) {
          frame.classList.toggle("is-active", frame === entry.target);
        });
        entry.target.classList.add("is-visible");
        nodes.forEach(function (node, nodeIndex) {
          node.classList.toggle("is-active", nodeIndex === index || (index >= nodes.length && nodeIndex === nodes.length - 1));
        });
      });
    }, { threshold: 0.42 });

    frames.forEach(function (frame) {
      observer.observe(frame);
    });
    if (nodes[0]) nodes[0].classList.add("is-active");
  }

  function setupMobileNav() {
    if (document.readyState === "loading" && !setupMobileNav.deferred) {
      setupMobileNav.deferred = true;
      window.setTimeout(setupMobileNav, 0);
      return;
    }
    // The platform shell owns its responsive navigation. Avoid creating a
    // second toggle when both progressive-enhancement bundles are present.
    if (document.querySelector('script[src*="platform-system"]')) return;
    var headers = Array.prototype.slice.call(document.querySelectorAll(".site-nav"));
    headers.forEach(function (header, index) {
      var nav = header.querySelector(".nav-links");
      if (!nav || header.querySelector(".mobile-nav-toggle")) return;

      var panelId = index === 0 ? "mobile-menu" : "mobile-menu-" + (index + 1);
      var toggle = document.createElement("button");
      var panel = document.createElement("nav");
      var isOpen = false;

      header.classList.add("has-mobile-menu");
      toggle.type = "button";
      toggle.className = "mobile-nav-toggle";
      toggle.setAttribute("aria-label", "Open navigation menu");
      toggle.setAttribute("aria-controls", panelId);
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menu";

      panel.id = panelId;
      panel.className = "mobile-nav-panel";
      panel.setAttribute("aria-label", "Mobile navigation");
      panel.hidden = true;

      Array.prototype.slice.call(nav.querySelectorAll("a")).forEach(function (link) {
        panel.appendChild(link.cloneNode(true));
      });

      function setOpen(open, returnFocus) {
        if (isOpen === open) return;
        isOpen = open;
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
        document.body.classList.toggle("mobile-menu-open", open);

        if (open) {
          panel.hidden = false;
          window.requestAnimationFrame(function () {
            panel.classList.add("is-open");
            var firstLink = panel.querySelector("a");
            if (firstLink) firstLink.focus({ preventScroll: true });
          });
        } else {
          panel.classList.remove("is-open");
          window.setTimeout(function () {
            if (!isOpen) panel.hidden = true;
          }, reducedMotion ? 0 : 180);
          if (returnFocus) toggle.focus({ preventScroll: true });
        }
      }

      toggle.addEventListener("click", function () {
        setOpen(!isOpen, true);
      });

      panel.addEventListener("click", function (event) {
        if (event.target && event.target.closest("a")) setOpen(false, false);
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") setOpen(false, true);
      });

      document.addEventListener("pointerdown", function (event) {
        if (!isOpen || header.contains(event.target)) return;
        setOpen(false, false);
      });

      if (window.matchMedia) {
        var desktopQuery = window.matchMedia("(min-width: 761px)");
        var closeOnDesktop = function (event) {
          if (event.matches) setOpen(false, false);
        };
        if (desktopQuery.addEventListener) {
          desktopQuery.addEventListener("change", closeOnDesktop);
        } else if (desktopQuery.addListener) {
          desktopQuery.addListener(closeOnDesktop);
        }
      }

      header.appendChild(toggle);
      header.appendChild(panel);
    });
  }

  function setupLightbox() {
    var images = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    if (!images.length) return;

    var box = document.createElement("dialog");
    var supportsDialog = typeof box.showModal === "function";
    var returnFocus = null;
    box.className = "lightbox";
    box.setAttribute("aria-label", "Image preview");
    box.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close image preview">Close</button><figure><img alt="" /><figcaption></figcaption></figure>';
    if (!supportsDialog) box.hidden = true;
    document.body.appendChild(box);

    var boxImage = box.querySelector("img");
    var boxCaption = box.querySelector("figcaption");
    var close = box.querySelector(".lightbox-close");

    function closeBox() {
      box.classList.remove("is-open");
      if (supportsDialog && box.open) {
        box.close();
      } else {
        box.hidden = true;
        if (returnFocus) returnFocus.focus({ preventScroll: true });
      }
    }

    function openBox(trigger, image) {
      var caption = image.closest("figure") && image.closest("figure").querySelector("figcaption");
      returnFocus = trigger;
      boxImage.src = image.currentSrc || image.src;
      boxImage.alt = image.alt || "";
      boxCaption.textContent = caption ? caption.textContent : image.alt || "";
      if (supportsDialog) {
        if (!box.open) box.showModal();
      } else {
        box.hidden = false;
      }
      box.classList.add("is-open");
      close.focus({ preventScroll: true });
    }

    images.forEach(function (image) {
      if (image.closest(".image-zoom")) return;
      var trigger = document.createElement("button");
      var caption = image.closest("figure") && image.closest("figure").querySelector("figcaption");
      trigger.type = "button";
      trigger.className = "image-zoom";
      trigger.setAttribute("aria-label", "Open full image: " + (caption ? caption.textContent : image.alt || "portfolio artifact"));
      image.parentNode.insertBefore(trigger, image);
      trigger.appendChild(image);
      trigger.addEventListener("click", function () {
        openBox(trigger, image);
      });
    });

    close.addEventListener("click", closeBox);
    box.addEventListener("click", function (event) {
      if (event.target === box) closeBox();
    });
    box.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeBox();
    });
    box.addEventListener("close", function () {
      box.classList.remove("is-open");
      if (returnFocus) returnFocus.focus({ preventScroll: true });
    });
  }

  function setupProofPreview() {
    var preview = document.querySelector(".proof-preview");
    var links = Array.prototype.slice.call(document.querySelectorAll(".proof-link"));
    if (!preview || !links.length) return;

    var title = preview.querySelector("[data-proof-preview-title]");
    var kind = preview.querySelector("[data-proof-preview-kind]");
    var detail = preview.querySelector("[data-proof-preview-detail]");

    function updatePreview(link) {
      if (!link) return;
      preview.style.setProperty("--preview-bg", link.getAttribute("data-preview-bg") || "linear-gradient(135deg, rgba(216, 180, 95, 0.18), rgba(245, 245, 247, 0.035))");
      if (title) title.textContent = link.getAttribute("data-preview-title") || link.querySelector("span").textContent;
      if (kind) kind.textContent = link.getAttribute("data-preview-kind") || "Case study";
      if (detail) detail.textContent = link.getAttribute("data-preview-detail") || link.querySelector("em").textContent;
      links.forEach(function (item) {
        item.classList.toggle("is-previewed", item === link);
      });
    }

    links.forEach(function (link) {
      link.addEventListener("mouseenter", function () {
        updatePreview(link);
      });
      link.addEventListener("focus", function () {
        updatePreview(link);
      });
    });

    updatePreview(links[0]);
  }

  function setupMotionEnhancements() {
    if (reducedMotion) {
      document.body.classList.add("motion-disabled");
      return;
    }
    var revealItems = Array.prototype.slice.call(document.querySelectorAll(".proof-link, .artifact, .visual, .evidence-panel, .operating-link, .surface-tile"));
    if (!revealItems.length && !frames.length) return;

    function markIfVisible(item) {
      var rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        item.classList.add("is-visible");
      }
    }

    document.body.classList.add("motion-ready");
    window.requestAnimationFrame(function () {
      document.body.classList.add("motion-visible");
      window.setTimeout(function () {
        document.body.classList.add("hero-motion-entered");
      }, 80);
      revealItems.concat(frames).forEach(markIfVisible);
    });

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.14 });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  setupVine();
  setupFrameObserver();
  setupMobileNav();
  setupLightbox();
  setupProofPreview();
  setupMotionEnhancements();
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", function () {
    setupVine();
    updateProgress();
  });
}());
