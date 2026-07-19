(function () {
  document.documentElement.classList.add("motion-ready");

  var revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealItems.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  function activatePair(buttons, panels, key, attr) {
    buttons.forEach(function (button) {
      var isActive = button.getAttribute(attr) === key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
    panels.forEach(function (panel) {
      var isActive = panel.getAttribute(attr.replace("target", "panel")) === key;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  }

  var specTabs = document.querySelectorAll("[data-spec-target]");
  var specPanels = document.querySelectorAll("[data-spec-panel]");
  specTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activatePair(specTabs, specPanels, tab.getAttribute("data-spec-target"), "data-spec-target");
    });
  });

  var intentTabs = document.querySelectorAll("[data-intent-target]");
  var intentPanels = document.querySelectorAll("[data-intent-panel]");
  intentTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activatePair(intentTabs, intentPanels, tab.getAttribute("data-intent-target"), "data-intent-target");
    });
  });
})();
