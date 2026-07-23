/* ==========================================================================
   Igdrsil — main.js
   Vanilla JS, no dependencies. Handles:
   theme toggle, language toggle + i18n swap, mobile nav, scroll reveal,
   FAQ accordion. Runs on every page.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORE_THEME = "igdrsil-theme";
  var STORE_LANG = "igdrsil-lang";

  /* ----------------------------------------------------------------------
     THEME
     Stored value is "light" | "dark". If nothing stored, we follow the OS
     (no data-theme attribute set) so prefers-color-scheme rules apply.
     ---------------------------------------------------------------------- */
  function storedTheme() {
    try { return localStorage.getItem(STORE_THEME); } catch (e) { return null; }
  }
  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }
  function currentEffectiveTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
  }
  function toggleTheme() {
    var next = currentEffectiveTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(STORE_THEME, next); } catch (e) {}
  }

  /* ----------------------------------------------------------------------
     I18N
     ---------------------------------------------------------------------- */
  function storedLang() {
    try { return localStorage.getItem(STORE_LANG); } catch (e) { return null; }
  }
  function pickInitialLang() {
    var s = storedLang();
    if (s === "de" || s === "en") return s;
    var nav = (navigator.language || "de").toLowerCase();
    return nav.indexOf("en") === 0 ? "en" : "de";
  }
  function applyLang(lang) {
    var dict = (window.I18N && window.I18N[lang]) || (window.I18N && window.I18N.de) || {};

    // text nodes
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      if (dict[key] != null) nodes[i].textContent = dict[key];
    }
    // attribute translations: data-i18n-attr="aria-label:key;title:key2"
    var attrNodes = document.querySelectorAll("[data-i18n-attr]");
    for (var a = 0; a < attrNodes.length; a++) {
      var spec = attrNodes[a].getAttribute("data-i18n-attr");
      var pairs = spec.split(";");
      for (var p = 0; p < pairs.length; p++) {
        var kv = pairs[p].split(":");
        if (kv.length === 2 && dict[kv[1]] != null) {
          attrNodes[a].setAttribute(kv[0].trim(), dict[kv[1].trim()]);
        }
      }
    }
    // <title> via data-i18n-title on <html> or body
    var titleKey = document.body.getAttribute("data-i18n-title");
    if (titleKey && dict[titleKey] != null) document.title = dict[titleKey];

    root.setAttribute("lang", lang);

    // reflect active state on lang buttons
    var btns = document.querySelectorAll(".lang__btn");
    for (var b = 0; b < btns.length; b++) {
      var on = btns[b].getAttribute("data-lang") === lang;
      btns[b].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }
  function setLang(lang) {
    applyLang(lang);
    try { localStorage.setItem(STORE_LANG, lang); } catch (e) {}
  }

  /* ----------------------------------------------------------------------
     MOBILE NAV
     ---------------------------------------------------------------------- */
  function initNav() {
    var burger = document.querySelector(".nav__burger");
    var links = document.querySelector(".nav__links");
    if (!burger || !links) return;

    function close() {
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // close on link click
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    // close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    // close when resizing back to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) close();
    });
  }

  /* ----------------------------------------------------------------------
     SCROLL REVEAL
     ---------------------------------------------------------------------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add("is-visible");
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    for (var j = 0; j < els.length; j++) obs.observe(els[j]);
  }

  /* ----------------------------------------------------------------------
     FAQ ACCORDION
     ---------------------------------------------------------------------- */
  function initFaq() {
    var buttons = document.querySelectorAll(".faq-item__q");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var btn = this;
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        var expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        if (panel) {
          panel.style.maxHeight = expanded ? "0px" : (panel.scrollHeight + "px");
        }
      });
    }
    // recompute open panel heights on resize (content reflow)
    window.addEventListener("resize", function () {
      var open = document.querySelectorAll('.faq-item__q[aria-expanded="true"]');
      for (var i = 0; i < open.length; i++) {
        var panel = document.getElementById(open[i].getAttribute("aria-controls"));
        if (panel) { panel.style.maxHeight = "none"; panel.style.maxHeight = panel.scrollHeight + "px"; }
      }
    });
  }

  /* ----------------------------------------------------------------------
     WIRE UP CONTROLS
     ---------------------------------------------------------------------- */
  function initControls() {
    var themeBtn = document.querySelector("[data-theme-toggle]");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    var langBtns = document.querySelectorAll(".lang__btn");
    for (var i = 0; i < langBtns.length; i++) {
      langBtns[i].addEventListener("click", function () {
        setLang(this.getAttribute("data-lang"));
      });
    }
  }

  /* ----------------------------------------------------------------------
     INIT
     ---------------------------------------------------------------------- */
  function init() {
    applyLang(pickInitialLang());
    initControls();
    initNav();
    initReveal();
    initFaq();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
