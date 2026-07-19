(function () {
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.querySelector("[data-ambient]");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  var chips = Array.prototype.slice.call(document.querySelectorAll(".case-chip"));
  var panel = document.querySelector(".evidence-panel");
  var visual = document.querySelector("[data-evidence-visual]");
  var fields = {
    title: document.querySelector("[data-evidence-title]"),
    kind: document.querySelector("[data-evidence-kind]"),
    decision: document.querySelector("[data-evidence-decision]"),
    proof: document.querySelector("[data-evidence-proof]"),
    risk: document.querySelector("[data-evidence-risk]")
  };

  function updateEvidence(chip) {
    if (!chip || !panel || !visual) return;
    chips.forEach(function (item) {
      item.classList.toggle("is-active", item === chip);
    });
    panel.classList.add("is-switching");
    window.setTimeout(function () {
      if (fields.title) fields.title.textContent = chip.getAttribute("data-title") || "";
      if (fields.kind) fields.kind.textContent = chip.getAttribute("data-kind") || "";
      if (fields.decision) fields.decision.textContent = chip.getAttribute("data-decision") || "";
      if (fields.proof) fields.proof.textContent = chip.getAttribute("data-proof") || "";
      if (fields.risk) fields.risk.textContent = chip.getAttribute("data-risk") || "";
      visual.style.backgroundImage = "linear-gradient(180deg, rgba(9, 9, 8, 0.05), rgba(9, 9, 8, 0.84)), " + (chip.getAttribute("data-image") || "linear-gradient(135deg, rgba(216, 180, 95, 0.25), rgba(13, 13, 12, 0.08))");
      panel.classList.remove("is-switching");
    }, reducedMotion ? 0 : 140);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("mouseenter", function () {
      updateEvidence(chip);
    });
    chip.addEventListener("focus", function () {
      updateEvidence(chip);
    });
    chip.addEventListener("click", function () {
      updateEvidence(chip);
      if (window.matchMedia && window.matchMedia("(max-width: 980px)").matches && panel) {
        panel.scrollIntoView({ block: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
      }
    });
  });

  if (!ctx || reducedMotion) return;

  var points = [];
  var width = 0;
  var height = 0;
  var frame = 0;

  function resize() {
    var ratio = Math.min(2, window.devicePixelRatio || 1);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    points = Array.from({ length: width < 700 ? 22 : 44 }, function (_, index) {
      return {
        x: (index * 137) % width,
        y: (index * 223) % height,
        r: 0.9 + ((index * 7) % 18) / 10,
        vx: -0.08 + ((index * 11) % 17) / 100,
        vy: -0.05 + ((index * 5) % 13) / 120
      };
    });
  }

  function draw() {
    frame += 1;
    ctx.clearRect(0, 0, width, height);
    var hueShift = Math.sin(frame / 160) * 0.12;
    points.forEach(function (point, index) {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < -20) point.x = width + 20;
      if (point.x > width + 20) point.x = -20;
      if (point.y < -20) point.y = height + 20;
      if (point.y > height + 20) point.y = -20;

      ctx.beginPath();
      ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.fillStyle = index % 3 === 0 ? "rgba(216, 180, 95, 0.46)" : "rgba(157, 187, 135, " + (0.2 + hueShift) + ")";
      ctx.fill();
    });

    for (var i = 0; i < points.length; i += 1) {
      for (var j = i + 1; j < points.length; j += 1) {
        var a = points[i];
        var b = points[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 140) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(245, 245, 242, " + (0.055 * (1 - distance / 140)).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    window.requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
}());
