(function () {
  function selectByKey(buttons, panels, key, buttonAttr, panelAttr) {
    buttons.forEach(function (button) {
      var active = button.getAttribute(buttonAttr) === key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });

    panels.forEach(function (panel) {
      var active = panel.getAttribute(panelAttr) === key;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  }

  var choices = document.querySelectorAll("[data-answer-target]");
  var answers = document.querySelectorAll("[data-answer-panel]");
  choices.forEach(function (choice) {
    choice.addEventListener("click", function () {
      selectByKey(choices, answers, choice.getAttribute("data-answer-target"), "data-answer-target", "data-answer-panel");
    });
  });

  var rooms = document.querySelectorAll("[data-room-target]");
  var panels = document.querySelectorAll("[data-room-panel]");
  rooms.forEach(function (room) {
    room.addEventListener("click", function () {
      selectByKey(rooms, panels, room.getAttribute("data-room-target"), "data-room-target", "data-room-panel");
    });
  });

  document.querySelectorAll("[data-next-room]").forEach(function (button) {
    button.addEventListener("click", function () {
      var current = document.querySelector("[data-room-target].is-active");
      var list = Array.prototype.slice.call(rooms);
      var index = list.indexOf(current);
      var next = list[(index + 1) % list.length];
      if (next) next.click();
    });
  });

  var threadLinks = document.querySelectorAll("[data-thread-target]");
  var threadStages = document.querySelectorAll("[data-thread-stage]");
  threadLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      var target = document.querySelector('[data-thread-stage="' + link.getAttribute("data-thread-target") + '"]');
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll("[data-thread-next]").forEach(function (button) {
    button.addEventListener("click", function () {
      var current = button.closest("[data-thread-stage]");
      var next = current ? current.nextElementSibling : null;
      if (next && next.hasAttribute("data-thread-stage")) next.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  if ("IntersectionObserver" in window && threadStages.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var key = entry.target.getAttribute("data-thread-stage");
          threadLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("data-thread-target") === key);
          });
          var count = document.querySelector("[data-thread-count]");
          if (count) count.textContent = key.padStart(2, "0");
          var label = document.querySelector("[data-thread-label]");
          var active = document.querySelector('[data-thread-target="' + key + '"] span');
          if (label && active) label.textContent = active.textContent;
        }
      });
    }, { threshold: 0.58 });
    threadStages.forEach(function (stage) { observer.observe(stage); });
  }
})();
