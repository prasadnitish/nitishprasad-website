(function () {
  var progressPath = document.querySelector("[data-vine-progress]");
  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-vine-node]"));
  var progressBar = document.querySelector("[data-mobile-progress]");
  var frames = Array.prototype.slice.call(document.querySelectorAll("[data-frame]"));
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
    if (!frames.length || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = frames.indexOf(entry.target);
        nodes.forEach(function (node, nodeIndex) {
          node.classList.toggle("is-active", nodeIndex === index || (index >= nodes.length && nodeIndex === nodes.length - 1));
        });
      });
    }, { threshold: 0.48 });
    frames.forEach(function (frame) {
      observer.observe(frame);
    });
    if (nodes[0]) nodes[0].classList.add("is-active");
  }

  function setupLightbox() {
    var images = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    if (!images.length) return;
    var box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = '<button type="button" aria-label="Close image">x</button><img alt="" />';
    document.body.appendChild(box);
    var boxImage = box.querySelector("img");
    var close = box.querySelector("button");
    function closeBox() {
      box.classList.remove("is-open");
    }
    images.forEach(function (image) {
      image.style.cursor = "zoom-in";
      image.addEventListener("click", function () {
        boxImage.src = image.currentSrc || image.src;
        boxImage.alt = image.alt || "";
        box.classList.add("is-open");
      });
    });
    close.addEventListener("click", closeBox);
    box.addEventListener("click", function (event) {
      if (event.target === box) closeBox();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeBox();
    });
  }

  setupVine();
  setupFrameObserver();
  setupLightbox();
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", function () {
    setupVine();
    updateProgress();
  });
}());
