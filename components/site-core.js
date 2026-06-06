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
    "align-items:center;justify-content:center;background:rgba(0,0,0,0.62);" +
    "padding:24px 16px;overflow-y:auto;-webkit-overflow-scrolling:touch;" +
    "opacity:0;visibility:hidden;pointer-events:none;transition:opacity .18s ease;}" +
    ".spv-popup-overlay.open{opacity:1;visibility:visible;pointer-events:auto;}" +
    /* × anchored to the OVERLAY corner (position:fixed relative to the viewport, NOT to
       the form content) so it always stays top-right and can never float to a random
       spot mid-resize. */
    ".spv-popup-close{position:fixed;top:16px;right:16px;z-index:5;width:38px;height:38px;" +
    "border:none;border-radius:50%;background:#fff;color:#1a1a1a;font-size:24px;" +
    "box-shadow:0 2px 10px rgba(0,0,0,0.28);line-height:1;cursor:pointer;" +
    "display:flex;align-items:center;justify-content:center;}" +
    ".spv-popup-close:hover{background:#f1f1f1;}" +
    ".spv-popup-close:focus-visible{outline:2px solid #008037;outline-offset:2px;}" +
    /* content box: FIXED height for the plain iframe to fill; min(92vw,660px) fits the
       625px two-column form (heading on one line). The GHL form scrolls inside the iframe
       if it's taller (one clean scroll). */
    ".spv-popup-box{position:relative;width:min(92vw,660px);max-width:660px;" +
    "margin:auto;background:transparent;border:none;box-shadow:none;padding:0;" +
    "height:min(760px,90vh);max-height:90vh;}" +
    /* popup iframe = PLAIN iframe (no GHL data-attrs, no form_embed), fills the box. */
    "#popup-form-iframe{display:block;width:100%;height:100%;border:none;border-radius:10px;background:#fff;}" +
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

  /* 3) Popup markup, injected once. The iframe is a PLAIN iframe — NO loading="lazy" and
        NO GHL data-* attrs — so form_embed.js never touches it; its real src is set on
        first open (see openPopup). This decouples the popup from form_embed entirely. */
  var overlay = document.createElement("div");
  overlay.className = "spv-popup-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML =
    /* × is a direct child of the overlay (NOT the box) so it anchors to the overlay
       corner and never moves when the form content resizes/collapses. */
    '<button class="spv-popup-close" type="button" aria-label="Close form">&times;</button>' +
    '<div class="spv-popup-box" role="dialog" aria-modal="true" aria-label="Get a free estimate">' +
      '<iframe title="Website Form" id="popup-form-iframe" style="display:block;width:100%;height:100%;border:none;border-radius:10px;background:#fff"></iframe>' +
    "</div>";
  function mountPopup() { document.body.appendChild(overlay); }
  if (document.body) mountPopup(); else document.addEventListener("DOMContentLoaded", mountPopup);

  var popupFrame = overlay.querySelector("#popup-form-iframe");
  var popupLoaded = false;

  function openPopup() {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("spv-popup-open");
    if (!popupLoaded) {
      popupFrame.src = SRC;      // loads the GHL form directly; form_embed NOT needed
      popupLoaded = true;
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
