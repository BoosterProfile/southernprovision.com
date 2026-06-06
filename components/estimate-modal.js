/* Shared GoHighLevel estimate form: powers the popup modal + wires every
   "Get A Free Estimate" / "free quote" button across the site. Loaded once per page.
   PERF (mobile): all heavy cross-origin GHL loading is LAZY — the popup form loads on
   first open, the inline page form loads when it nears the viewport, and form_embed.js
   (which auto-resizes both iframes) loads once, on demand. Nothing GHL initializes on
   page load. Also hardens the mobile-menu scroll-lock so the page can't feel frozen. */
(function () {
  var FORM = "0CfLTJY2IWOAtWOqb0XY";
  var SRC = "https://api.leadconnectorhq.com/widget/form/" + FORM;

  /* 1) Styles: strip the old green card chrome off inline embeds + the modal. */
  var css =
    ".quote-form.is-ghl{background:none!important;background-color:transparent!important;" +
    "box-shadow:none!important;padding:0!important;border:none!important;border-top:none!important;}" +
    ".quote-form.is-ghl>iframe{display:block;width:100%;height:auto;min-height:620px;max-height:none;" +
    "overflow:visible;border:none!important;border-radius:10px;background:transparent;}" +
    ".quote-form.is-ghl .ep-wrapper,.quote-form.is-ghl .ep-iFrameContainer{background:transparent!important;padding:0!important;border:none!important;box-shadow:none!important;max-height:none!important;overflow:visible!important;}" +
    /* homepage hero on mobile: the old card needed 78px top margin for its overhanging
       badge; the GHL embed has none, so tighten the gap (hero form only). */
    "@media (max-width:768px){.hero .quote-form.is-ghl{margin-top:22px!important;}}" +
    /* Overlay is ALWAYS in the layout (display:flex) and merely hidden via opacity +
       pointer-events when closed — NOT display:none. That keeps the preloaded GHL iframe
       fully rendered/sized in the background, so opening just fades it in at full size:
       no late render, no resize/collapse, no slide/squish flicker. Simple opacity fade
       only — no transform. */
    ".estimate-modal-overlay{position:fixed;inset:0;z-index:100000;display:flex;" +
    "align-items:flex-start;justify-content:center;background:rgba(0,0,0,0.62);" +
    "padding:24px 16px;overflow-y:auto;-webkit-overflow-scrolling:touch;" +
    "opacity:0;pointer-events:none;transition:opacity .18s ease;}" +
    ".estimate-modal-overlay.open{opacity:1;pointer-events:auto;}" +
    "body.estimate-modal-open{overflow:hidden;}" +
    /* modal = NO box: wrapper is fully transparent (no bg / border / radius / shadow /
       padding) so only the GHL form's own white card shows on the dark backdrop. */
    /* wide enough that GHL's 625px two-column form renders at full width (no squash):
       ~92vw on phones (clean single-column stack), capped at 660px on desktop. */
    ".estimate-modal{position:relative;width:min(92vw,660px);max-width:660px;min-width:0;margin:auto;" +
    "background:transparent!important;background-color:transparent!important;border:none!important;" +
    "border-radius:0!important;box-shadow:none!important;padding:0!important;}" +
    ".estimate-modal-close{position:absolute;top:-2px;right:-2px;z-index:3;width:36px;height:36px;" +
    "border:none;border-radius:50%;background:#fff;color:#1a1a1a;font-size:24px;" +
    "box-shadow:0 2px 10px rgba(0,0,0,0.28);" +
    "line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}" +
    ".estimate-modal-close:hover{background:#f1f1f1;}" +
    ".estimate-modal-close:focus-visible{outline:2px solid #008037;outline-offset:2px;}" +
    /* form_embed.js wraps our iframe in .ep-wrapper / .ep-iFrameContainer, so a
       direct-child (>) selector misses it and the iframe collapses to its ~304px
       default. Force the wrapper chain to full width + transparent (mirrors the inline
       embed rules above) so the iframe fills the 660px modal. */
    ".estimate-modal .ep-wrapper,.estimate-modal .ep-iFrameContainer{width:100%!important;" +
    "max-width:100%!important;background:transparent!important;padding:0!important;" +
    "border:none!important;box-shadow:none!important;max-height:none!important;overflow:visible!important;}" +
    /* LOCK the iframe to a fixed full size with !important (descendant selector, matches
       even inside .ep-wrapper) so form_embed.js's load-time resize sequence (0 -> grow,
       narrow -> wide) can't collapse/squish it: the box stays full-size while the form
       paints into it. 820px clears the whole form (logo -> fields -> textarea -> SEND) at
       both the 625px two-column desktop layout and the narrower single-column mobile
       stack; the overlay's overflow-y:auto handles short viewports. */
    ".estimate-modal iframe{display:block;width:100%!important;height:820px!important;" +
    "min-height:760px!important;max-height:none!important;" +
    "overflow:visible;border:none!important;border-radius:10px;background:transparent;}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* 2) Modal markup (hidden). The iframe is INLINE-layout so GHL never auto-pops it —
        only our show()/hide() controls visibility. PERF: src is loaded LAZILY on the
        first open (see show()), never on page load, so the heavy cross-origin GHL form
        does not init alongside the inline form + reviews widget on mobile. The iframe
        size is locked in CSS, so it can't squish/flicker as form_embed.js sizes it. */
  var overlay = document.createElement("div");
  overlay.className = "estimate-modal-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML =
    '<div class="estimate-modal" role="dialog" aria-modal="true" aria-label="Get a free estimate">' +
      '<button class="estimate-modal-close" type="button" aria-label="Close form">&times;</button>' +
      '<iframe title="Website Form" loading="lazy" ' +
        'id="popup-' + FORM + '" ' +
        'data-form-id="' + FORM + '" ' +
        "data-layout=\"{'id':'INLINE'}\" " +
        'data-trigger-type="alwaysShow" data-trigger-value="" ' +
        'data-activation-type="alwaysActivated" data-activation-value="" ' +
        'data-deactivation-type="neverDeactivate" data-deactivation-value="" ' +
        'data-form-name="Website Form" data-height="678" ' +
        'data-layout-iframe-id="popup-' + FORM + '"></iframe>' +
    "</div>";

  var frame = overlay.querySelector("iframe");

  function mount() { document.body.appendChild(overlay); }   // markup only; NO form load here
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  /* Load GHL's form_embed.js exactly ONCE per page, on demand. It auto-resizes every
     GHL iframe (inline + popup). Deduped so the inline embed and the modal never load
     it twice. Called lazily (modal open OR inline form near viewport), never on load. */
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

  function show() {
    if (!frame.src) frame.src = SRC;   // lazy load on FIRST open only (never on page load)
    loadFormEmbed();
    closeMobileMenu();
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("estimate-modal-open");
  }
  function hide() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("estimate-modal-open");
  }
  window.openEstimateModal = show;
  window.closeEstimateModal = hide;

  /* 3) Close: × button, backdrop click, Escape. */
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay || (e.target.closest && e.target.closest(".estimate-modal-close"))) hide();
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Escape" || e.keyCode === 27) && overlay.classList.contains("open")) hide();
  });

  /* 4) Open on any "Get [a] Free Estimate" / "free quote" button or link. */
  var RE = /(get\s*a?\s*free\s+estimate|free\s+quote)/i;
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("a, button");
    if (!el) return;
    if (el.closest(".estimate-modal-overlay")) return;     // ignore clicks inside the modal
    if (!RE.test((el.textContent || "").replace(/\s+/g, " ").trim())) return;
    e.preventDefault();
    show();
  });

  /* 5) Inline hero/page form: lazy-load it only when it nears the viewport, so it does
        NOT init on page load alongside the popup + reviews widget (mobile main-thread
        overload). The iframe ships with data-src (no src) so the browser never fetches
        it during parse; we swap data-src->src + load form_embed.js when it's close. */
  function loadInlineForm() {
    var ifr = document.querySelector('iframe[id^="inline-"][data-src]');
    if (!ifr) return false;
    ifr.src = ifr.getAttribute("data-src");
    ifr.removeAttribute("data-src");
    loadFormEmbed();
    return true;
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

  /* 6) Mobile-menu safety net (every page). The per-page menu script can leave
        document.body.style.overflow='hidden' stuck if open/close desync or the user
        navigates away with the menu open — which makes the page feel frozen, especially
        after iOS back/bfcache restore. Guarantee the scroll-lock is always released:
        - tapping any link inside the mobile menu closes it + clears overflow;
        - on pageshow (incl. bfcache restore) with the menu closed, clear overflow. */
  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest(".mob-menu a[href]");
    if (!link) return;
    closeMobileMenu();
  });
  window.addEventListener("pageshow", function () {
    var menu = document.getElementById("mob-menu");
    if (!menu || !menu.classList.contains("open")) document.body.style.overflow = "";
  });
})();
