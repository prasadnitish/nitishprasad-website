(function () {
  function markAdvanced() {
    document.body.classList.add("has-advanced");
  }

  var frames = Array.prototype.slice.call(document.querySelectorAll("[data-frame]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-frame-dot]"));
  if (frames.length && dots.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = frames.indexOf(entry.target);
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
        if (index > 0) markAdvanced();
      });
    }, { threshold: 0.55 });
    frames.forEach(function (frame) {
      observer.observe(frame);
    });
    dots[0].classList.add("is-active");
  }

  var track = document.querySelector("[data-horizontal-track]");
  if (!track) return;

  var panels = Array.prototype.slice.call(track.querySelectorAll(".h-frame"));
  var previous = document.querySelector("[data-prev]");
  var next = document.querySelector("[data-next]");
  var count = document.querySelector("[data-frame-count]");
  var lastWheelAt = 0;

  function currentIndex() {
    return Math.round(track.scrollLeft / Math.max(1, window.innerWidth));
  }

  function update() {
    if (!count) return;
    count.textContent = String(currentIndex() + 1) + " / " + String(panels.length);
  }

  function go(delta) {
    var index = Math.max(0, Math.min(panels.length - 1, currentIndex() + delta));
    markAdvanced();
    panels[index].scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", inline: "start" });
  }

  if (previous) previous.addEventListener("click", function () { go(-1); });
  if (next) next.addEventListener("click", function () { go(1); });

  track.addEventListener("wheel", function (event) {
    if (!window.matchMedia("(min-width: 761px)").matches) return;
    var delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!delta) return;
    event.preventDefault();
    if (Date.now() - lastWheelAt < 560) return;
    lastWheelAt = Date.now();
    go(delta > 0 ? 1 : -1);
  }, { passive: false });

  document.addEventListener("keydown", function (event) {
    var activeTag = document.activeElement && document.activeElement.tagName ? document.activeElement.tagName.toLowerCase() : "";
    if (["a", "button", "input", "select", "textarea"].indexOf(activeTag) !== -1) return;
    if (event.key === "ArrowRight" || event.key === "PageDown" || event.code === "Space") {
      event.preventDefault();
      go(1);
    }
    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      go(-1);
    }
  });

  track.addEventListener("scroll", window.requestAnimationFrame ? function () {
    if (track.scrollLeft > 12) markAdvanced();
    window.requestAnimationFrame(update);
  } : function () {
    if (track.scrollLeft > 12) markAdvanced();
    update();
  }, { passive: true });
  update();
}());
