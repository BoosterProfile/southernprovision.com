/* Site core (shared, loaded once on every page). Responsibilities:
     1) lazy-load the inline GHL form when it nears the viewport,
     2) the "Get A Free Estimate" / "free quote" popup (re-added, built anti-freeze),
     3) open those CTAs into the popup,
     4) keep the mobile-menu scroll-lock from ever sticking.

   ANTI-FREEZE NOTES (why the popup no longer glitches/freezes on iOS):
     - The popup iframe uses GHL's stable INLINE config (NOT the POPUP layout, which
       was the mechanism that glitched).
     - Its src is set ONCE, on the first open, while the overlay is already VISIBLE, so
       form_embed.js measures/sizes the form correctly a single time.
     - After that the iframe stays alive in the DOM forever. Open/close toggles ONLY the
       overlay via opacity + visibility + pointer-events — NEVER display:none and never a
       second src — so GHL never re-lays-out the form. No re-measure = no freeze.
     - At most a short opacity fade on the overlay; no slide/transform anywhere. */
(function () {
  var FORM = "0CfLTJY2IWOAtWOqb0XY";
  var SRC = "https://api.leadconnectorhq.com/widget/form/" + FORM;

  /* 1) Styles: inline-form chrome (unchanged) + the popup. */
  var css =
    /* --- inline form chrome (do not change; matches the inline embed dimensions) --- */
    ".quote-form.is-ghl{background:none!important;background-color:transparent!important;" +
    "box-shadow:none!important;padding:0!important;border:none!important;border-top:none!important;}" +
    ".quote-form.is-ghl>iframe{display:block;width:100%;height:auto;min-height:620px;max-height:none;" +
    "overflow:visible;border:none!important;border-radius:10px;background:transparent;}" +
    ".quote-form.is-ghl .ep-wrapper,.quote-form.is-ghl .ep-iFrameContainer{background:transparent!important;padding:0!important;border:none!important;box-shadow:none!important;max-height:none!important;overflow:visible!important;}" +
    /* homepage hero on mobile: tighten the gap left by the old card's badge margin. */
    "@media (max-width:768px){.hero .quote-form.is-ghl{margin-top:22px!important;}}" +
    /* --- popup --- overlay ALWAYS in layout; hidden via opacity+visibility+pointer-
       events (NEVER display:none), so the iframe is never re-laid-out on reopen. */
    ".spv-popup-overlay{position:fixed;inset:0;z-index:100000;display:flex;" +
    "align-items:flex-start;justify-content:center;background:rgba(0,0,0,0.62);" +
    "padding:24px 16px;overflow-y:auto;-webkit-overflow-scrolling:touch;" +
    "opacity:0;visibility:hidden;pointer-events:none;transition:opacity .18s ease;}" +
    ".spv-popup-overlay.open{opacity:1;visibility:visible;pointer-events:auto;}" +
    /* content box: TRANSPARENT (no white box/border/shadow/padding) so only the GHL
       card shows. min(92vw,660px) fits the 625px two-column form (heading on one line);
       scrolls vertically if the form is taller than the viewport. */
    ".spv-popup-box{position:relative;width:min(92vw,660px);max-width:660px;min-width:0;" +
    "margin:auto;background:transparent;border:none;border-radius:0;box-shadow:none;padding:0;}" +
    ".spv-popup-close{position:absolute;top:-2px;right:-2px;z-index:3;width:36px;height:36px;" +
    "border:none;border-radius:50%;background:#fff;color:#1a1a1a;font-size:24px;" +
    "box-shadow:0 2px 10px rgba(0,0,0,0.28);line-height:1;cursor:pointer;" +
    "display:flex;align-items:center;justify-content:center;}" +
    ".spv-popup-close:hover{background:#f1f1f1;}" +
    ".spv-popup-close:focus-visible{outline:2px solid #008037;outline-offset:2px;}" +
    /* force the GHL wrapper chain + iframe to fill the box (form_embed wraps the iframe
       in .ep-wrapper; without this it can collapse to ~304px). Width only — height is
       left to form_embed (min-height floor), exactly like the stable inline form, so
       there is no fixed-height-vs-resize fight. */
    ".spv-popup-box .ep-wrapper,.spv-popup-box .ep-iFrameContainer{width:100%!important;" +
    "max-width:100%!important;background:transparent!important;padding:0!important;" +
    "border:none!important;box-shadow:none!important;max-height:none!important;overflow:visible!important;}" +
    ".spv-popup-box iframe{display:block;width:100%!important;min-height:760px;max-height:none;" +
    "overflow:visible;border:none!important;border-radius:10px;background:transparent;}" +
    "body.spv-popup-open{overflow:hidden;}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* Load GHL's form_embed.js exactly ONCE per page, on demand. Auto-resizes every GHL
     iframe (inline + popup). Deduped so it never loads twice. */
  function loadFormEmbed() {
    if (document.querySelector('script[src*="form_embed.js"]')) return;
    var s = document.createElement("script");
    s.src = "https://link.msgsndr.com/js/form_embed.js";
    s.setAttribute("data-spv-ghl", "");
    document.body.appendChild(s);
  }

  function closeMobileMenu() {
    ["mob-menu", "mob-overlay", "hamburger"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("open");
    });
    document.body.style.overflow = "";        // never leave the menu's scroll-lock stuck
  }

  /* 2) Inline hero/page form: lazy-load only when it nears the viewport (data-src->src).
        Unchanged — the inline forms and their dimensions are final. */
  function loadInlineForm() {
    var ifr = document.querySelector('iframe[id^="inline-"][data-src]');
    if (!ifr) return;
    ifr.src = ifr.getAttribute("data-src");
    ifr.removeAttribute("data-src");
    loadFormEmbed();
  }
  function watchInlineForm() {
    var ifr = document.querySelector('iframe[id^="inline-"][data-src]');
    if (!ifr) return;
    if (!("IntersectionObserver" in window)) { loadInlineForm(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        loadInlineForm();
        io.disconnect();
      }
    }, { rootMargin: "400px 0px" });
    io.observe(ifr);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", watchInlineForm);
  else watchInlineForm();

  /* 3) Popup markup, injected once. The iframe uses the STABLE INLINE config and ships
        with data-src (no src) so nothing loads until the first open. */
  var overlay = document.createElement("div");
  overlay.className = "spv-popup-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML =
    '<div class="spv-popup-box" role="dialog" aria-modal="true" aria-label="Get a free estimate">' +
      '<button class="spv-popup-close" type="button" aria-label="Close form">&times;</button>' +
      '<iframe title="Website Form" loading="lazy" id="popup-form-iframe" ' +
        'data-form-id="' + FORM + '" ' +
        "data-layout=\"{'id':'INLINE'}\" " +
        'data-src="' + SRC + '" ' +
        'style="width:100%;border:none;border-radius:10px;min-height:760px"></iframe>' +
    "</div>";
  function mountPopup() { document.body.appendChild(overlay); }
  if (document.body) mountPopup(); else document.addEventListener("DOMContentLoaded", mountPopup);

  var popupFrame = overlay.querySelector("#popup-form-iframe");
  var popupLoaded = false;

  function openPopup() {
    // Make the overlay VISIBLE first, THEN load the form on the first open only — so
    // form_embed.js measures/sizes the iframe while it's visible (one correct layout).
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("spv-popup-open");
    if (!popupLoaded) {
      popupFrame.src = popupFrame.getAttribute("data-src");
      popupFrame.removeAttribute("data-src");
      popupLoaded = true;
      loadFormEmbed();
    }
  }
  function closePopup() {
    // Hide the overlay ONLY. Never touch the iframe (no display:none, no src reload),
    // so reopening is instant and GHL never re-lays-out the form.
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("spv-popup-open");
  }
  window.openEstimateModal = openPopup;
  window.closeEstimateModal = closePopup;

  /* Close on × button, backdrop click, Escape. */
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay || (e.target.closest && e.target.closest(".spv-popup-close"))) closePopup();
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Escape" || e.keyCode === 27) && overlay.classList.contains("open")) closePopup();
  });

  /* CTA wiring: any "Get [a] Free Estimate" / "free quote" button or link opens the
     popup. A CTA inside the mobile menu closes the menu (+ clears the scroll-lock) first. */
  var RE = /(get\s*a?\s*free\s+estimate|free\s+quote)/i;
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("a, button");
    if (!el) return;
    if (el.closest(".spv-popup-overlay")) return;          // ignore clicks inside the popup
    if (!RE.test((el.textContent || "").replace(/\s+/g, " ").trim())) return;
    e.preventDefault();
    if (el.closest && el.closest(".mob-menu")) closeMobileMenu();
    openPopup();
  });

  /* 4) Mobile-menu safety net (every page): never let the scroll-lock stick.
        - tapping any link inside the mobile menu closes it + clears overflow;
        - on pageshow (incl. iOS bfcache restore) with neither menu nor popup open,
          clear any stranded overflow lock. */
  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest(".mob-menu a[href]");
    if (!link) return;
    closeMobileMenu();
  });
  window.addEventListener("pageshow", function () {
    var menu = document.getElementById("mob-menu");
    var menuOpen = menu && menu.classList.contains("open");
    var popupOpen = overlay.classList.contains("open");
    if (!menuOpen && !popupOpen) document.body.style.overflow = "";
  });
})();
