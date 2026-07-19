(function () {
  "use strict";
  if (document.querySelector(".recruiter-assistant")) return;

  var root = document.createElement("div");
  root.className = "recruiter-assistant";
  root.innerHTML = [
    '<button class="ra-launcher" type="button" aria-haspopup="dialog" aria-expanded="false"><span class="ra-launcher-dot" aria-hidden="true"></span>Recruiter? Ask me anything</button>',
    '<div class="ra-backdrop" hidden></div>',
    '<aside class="ra-panel" role="dialog" aria-modal="true" aria-labelledby="ra-title" hidden>',
      '<header class="ra-head"><div><p class="ra-eyebrow">Portfolio assistant</p><h2 id="ra-title">Ask about Nitish</h2></div><button class="ra-close" type="button" aria-label="Close assistant">×</button></header>',
      '<div class="ra-tabs" role="tablist" aria-label="Assistant sections"><button class="ra-tab" id="ra-tab-ask" role="tab" aria-selected="true" aria-controls="ra-ask" type="button">Ask</button><button class="ra-tab" id="ra-tab-contact" role="tab" aria-selected="false" aria-controls="ra-contact" type="button">Contact</button></div>',
      '<section class="ra-view ra-chat-view" id="ra-ask" role="tabpanel" aria-labelledby="ra-tab-ask">',
        '<div class="ra-messages" aria-live="polite" aria-relevant="additions"><div class="ra-message ra-message-assistant"><span class="ra-message-label">Nitish\'s portfolio assistant</span><p>Nitish is open to Principal/Staff PM and AI Product Lead roles. Ask me about his experience, strengths, AI and platform work, or work preferences — answers use approved portfolio sources.</p></div></div>',
        '<div><div class="ra-suggestions" aria-label="Suggested questions"></div><form class="ra-compose"><div class="ra-compose-row"><textarea name="question" maxlength="1200" rows="2" required aria-label="Question about Nitish" placeholder="Ask about role fit, experience, or strengths…"></textarea><button class="ra-send" type="submit">Ask</button></div><p class="ra-hint">Enter to send · Shift+Enter for a new line. No live web search or inferred personal details.</p></form></div>',
      '</section>',
      '<section class="ra-view ra-contact-view" id="ra-contact" role="tabpanel" aria-labelledby="ra-tab-contact" hidden>',
        '<p class="ra-contact-intro">Share a role or opportunity. Your details are stored separately from chat questions and used only to respond.</p>',
        '<form class="ra-contact-form">',
          '<div class="ra-contact-grid"><div class="ra-field"><label for="ra-name">Name</label><input id="ra-name" name="name" maxlength="100" autocomplete="name" required></div><div class="ra-field"><label for="ra-email">Work email</label><input id="ra-email" name="email" type="email" maxlength="254" autocomplete="email" required></div></div>',
          '<div class="ra-contact-grid"><div class="ra-field"><label for="ra-company">Company</label><input id="ra-company" name="company" maxlength="140" autocomplete="organization" required></div><div class="ra-field"><label for="ra-role">Role / opportunity</label><input id="ra-role" name="role" maxlength="180" required></div></div>',
          '<div class="ra-field"><label for="ra-job">Job link <span aria-hidden="true">(optional)</span></label><input id="ra-job" name="job_url" type="url" inputmode="url" maxlength="500" placeholder="https://"></div>',
          '<div class="ra-field"><label for="ra-message">Message</label><textarea id="ra-message" name="message" maxlength="3000" required></textarea></div>',
          '<label class="ra-consent"><input name="consent" type="checkbox" required><span>I consent to Nitish storing these details to respond to this opportunity.</span></label>',
          '<button class="ra-submit" type="submit">Send to Nitish</button><p class="ra-status" role="status" aria-live="polite"></p>',
        '</form>',
      '</section>',
      '<footer class="ra-footer"><span>FAQ cache + GPT-5.6 for approved-source synthesis</span><a href="/portfolio-privacy.html">Privacy</a></footer>',
    '</aside>'
  ].join("");
  document.body.appendChild(root);

  if (!document.body.classList.contains("resume-page") && !document.querySelector(".sticky-resume")) {
    var resumePill = document.createElement("a");
    resumePill.className = "sticky-resume";
    resumePill.href = "resume.html";
    resumePill.setAttribute("aria-label", "Download resume");
    resumePill.appendChild(document.createTextNode("Resume "));
    var resumeArrow = document.createElement("span");
    resumeArrow.setAttribute("aria-hidden", "true");
    resumeArrow.textContent = "↓";
    resumePill.appendChild(resumeArrow);
    document.body.appendChild(resumePill);
  }

  var launcher = root.querySelector(".ra-launcher");
  var backdrop = root.querySelector(".ra-backdrop");
  var panel = root.querySelector(".ra-panel");
  var closeButton = root.querySelector(".ra-close");
  var messages = root.querySelector(".ra-messages");
  var suggestions = root.querySelector(".ra-suggestions");
  var chatForm = root.querySelector(".ra-compose");
  var questionInput = chatForm.elements.question;
  var sendButton = root.querySelector(".ra-send");
  var contactForm = root.querySelector(".ra-contact-form");
  var contactStatus = root.querySelector(".ra-status");
  var tabs = Array.prototype.slice.call(root.querySelectorAll(".ra-tab"));
  var returnFocus = null;
  var open = false;
  var busy = false;
  var history = [];
  var defaultQuestions = ["What roles is Nitish looking for?", "What are Nitish's strongest capabilities?", "How has Nitish worked with engineering and data teams?", "What technologies and tools has Nitish worked with?"];

  function sessionId() {
    var key = "nitish-recruiter-session";
    try {
      var existing = sessionStorage.getItem(key);
      if (existing) return existing;
      var created = crypto.randomUUID();
      sessionStorage.setItem(key, created);
      return created;
    } catch (_error) {
      return crypto.randomUUID();
    }
  }
  var currentSessionId = sessionId();

  function setOpen(next) {
    if (next === open) return;
    open = next;
    launcher.setAttribute("aria-expanded", String(next));
    document.body.style.overflow = next ? "hidden" : "";
    if (next) {
      returnFocus = document.activeElement;
      panel.hidden = false;
      backdrop.hidden = false;
      requestAnimationFrame(function () { panel.classList.add("is-open"); backdrop.classList.add("is-open"); questionInput.focus(); });
    } else {
      panel.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      window.setTimeout(function () { if (!open) { panel.hidden = true; backdrop.hidden = true; } }, 280);
      if (returnFocus && returnFocus.focus) returnFocus.focus();
    }
  }

  function setTab(id) {
    tabs.forEach(function (tab) {
      var selected = tab.id === id;
      tab.setAttribute("aria-selected", String(selected));
      document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
    });
    (id === "ra-tab-ask" ? questionInput : contactForm.elements.name).focus();
  }

  function addMessage(role, text, citations) {
    var item = document.createElement("div");
    item.className = "ra-message " + (role === "user" ? "ra-message-user" : "ra-message-assistant");
    if (role !== "user") {
      var label = document.createElement("span");
      label.className = "ra-message-label";
      label.textContent = "Portfolio assistant";
      item.appendChild(label);
    }
    var paragraph = document.createElement("p");
    paragraph.textContent = text;
    item.appendChild(paragraph);
    if (citations && citations.length) {
      var sourceList = document.createElement("div");
      sourceList.className = "ra-sources";
      citations.forEach(function (source) {
        var link = document.createElement("a");
        link.href = source.url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = source.label + " ↗";
        sourceList.appendChild(link);
      });
      item.appendChild(sourceList);
    }
    if (role !== "user") {
      var fit = document.createElement("button");
      fit.type = "button";
      fit.className = "ra-fit-cta";
      fit.textContent = "Sounds like a fit? Share the role →";
      fit.addEventListener("click", function () { setTab("ra-tab-contact"); });
      item.appendChild(fit);
    }
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }

  function setSuggestions(items) {
    suggestions.replaceChildren();
    (items && items.length ? items : defaultQuestions).slice(0, 4).forEach(function (question) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "ra-suggestion";
      button.textContent = question;
      button.addEventListener("click", function () { questionInput.value = question; chatForm.requestSubmit(); });
      suggestions.appendChild(button);
    });
  }

  async function postJson(path, data) {
    var response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    var payload = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      var error = new Error(payload.error && payload.error.message || "Request failed");
      error.code = payload.error && payload.error.code;
      throw error;
    }
    return payload;
  }

  chatForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    var question = questionInput.value.trim();
    if (!question || busy) return;
    busy = true;
    sendButton.disabled = true;
    questionInput.value = "";
    addMessage("user", question);
    try {
      var payload = await postJson("/api/recruiter-chat", { session_id: currentSessionId, question: question, history: history.slice(-6) });
      currentSessionId = payload.session_id;
      addMessage("assistant", payload.answer, payload.citations || []);
      history.push({ role: "user", content: question }, { role: "assistant", content: payload.answer });
      history = history.slice(-6);
      setSuggestions(payload.suggested_questions);
    } catch (error) {
      addMessage("assistant", error.code === "RATE_LIMITED" ? "You've reached the short-term question limit. Please wait a few minutes or use the contact form." : "The assistant is temporarily unavailable. You can still use the contact form or email hello@nitishprasad.com.");
    } finally {
      busy = false;
      sendButton.disabled = false;
      questionInput.focus();
    }
  });

  questionInput.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    chatForm.requestSubmit();
  });

  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    var submit = root.querySelector(".ra-submit");
    submit.disabled = true;
    contactStatus.className = "ra-status";
    contactStatus.textContent = "Sending…";
    var form = new FormData(contactForm);
    try {
      await postJson("/api/recruiter-contact", {
        session_id: currentSessionId,
        name: form.get("name"), email: form.get("email"), company: form.get("company"), role: form.get("role"),
        job_url: form.get("job_url"), message: form.get("message"), consent: form.get("consent") === "on"
      });
      contactForm.reset();
      contactStatus.textContent = "Received. The opportunity was saved and Nitish has been notified.";
    } catch (error) {
      contactStatus.className = "ra-status is-error";
      contactStatus.textContent = error.message || "Could not send your details. Please email hello@nitishprasad.com.";
    } finally {
      submit.disabled = false;
    }
  });

  launcher.addEventListener("click", function () { setOpen(true); });
  closeButton.addEventListener("click", function () { setOpen(false); });
  backdrop.addEventListener("click", function () { setOpen(false); });
  tabs.forEach(function (tab) { tab.addEventListener("click", function () { setTab(tab.id); }); });
  document.addEventListener("keydown", function (event) {
    if (!open) return;
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
    if (event.key !== "Tab") return;
    var focusable = Array.prototype.slice.call(panel.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled])')).filter(function (item) { return !item.closest("[hidden]"); });
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  setSuggestions(defaultQuestions);
}());
