/* Site core (shared, loaded once on every page) — the SINGLE controller for all mobile
   interactivity, so an edit here propagates everywhere and one page can't break another.
   Responsibilities:
     1) lazy-load the inline GHL form (deferred to first interaction/idle — see armInlineFormLoad),
     2) the "Get A Free Estimate" / "free quote" popup (anti-freeze, plain iframe),
     3) open those CTAs into the popup via the explicit [data-open-estimate] hook,
     4) the mobile menu: open/close/services-toggle + scroll-lock (no per-page inline JS).

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
    ".quote-form.is-ghl{position:relative;background:none!important;background-color:transparent!important;" +
    "box-shadow:none!important;padding:0!important;border:none!important;border-top:none!important;}" +
    ".quote-form.is-ghl>iframe{display:block;width:100%;height:auto;min-height:620px;max-height:none;" +
    "overflow:visible;border:none!important;border-radius:10px;background:transparent;}" +
    ".quote-form.is-ghl .ep-wrapper,.quote-form.is-ghl .ep-iFrameContainer{background:transparent!important;padding:0!important;border:none!important;box-shadow:none!important;max-height:none!important;overflow:visible!important;}" +
    /* Branded loading skeleton over the inline form so the area is never a blank white box
       while the GHL widget fetches/renders. Sits absolutely over the (height-reserved)
       iframe; fades out + is removed once the form reports/loads (see site-core JS). */
    ".spv-form-skel{position:absolute;inset:0;z-index:2;display:flex;align-items:center;" +
    "justify-content:center;background:#fff;border-radius:10px;transition:opacity .35s ease;}" +
    ".spv-form-skel.hide{opacity:0;pointer-events:none;}" +
    ".spv-form-skel-card{display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px;text-align:center;}" +
    ".spv-form-skel-logo{width:64px;height:64px;object-fit:contain;opacity:.92;}" +
    ".spv-form-skel-spin{width:34px;height:34px;border-radius:50%;border:3px solid #e8f4ec;" +
    "border-top-color:#008037;animation:spv-spin .8s linear infinite;}" +
    ".spv-form-skel-txt{font:600 14px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;" +
    "color:#004E05;letter-spacing:.01em;margin:0;}" +
    "@keyframes spv-spin{to{transform:rotate(360deg);}}" +
    "@media (prefers-reduced-motion:reduce){.spv-form-skel-spin{animation-duration:2s;}}" +
    /* homepage hero on mobile: tighten the gap left by the old card's badge margin. */
    "@media (max-width:768px){.hero .quote-form.is-ghl{margin-top:22px!important;}}" +
    /* --- popup --- overlay ALWAYS in layout; hidden via opacity+visibility+pointer-
       events (NEVER display:none), so the iframe is never re-laid-out on reopen. */
    ".spv-popup-overlay{position:fixed;inset:0;z-index:100000;display:flex;" +
    "align-items:center;justify-content:center;background:rgba(0,0,0,0.62);" +
    "padding:24px 16px;overflow-y:auto;-webkit-overflow-scrolling:touch;" +
    "opacity:0;visibility:hidden;pointer-events:none;transition:opacity .18s ease;}" +
    ".spv-popup-overlay.open{opacity:1;visibility:visible;pointer-events:auto;}" +
    /* CLOSED-STATE INERT — the core fix. GHL's form_embed.js matches the popup iframe BY
       ITS src and force-sets INLINE visibility:visible / pointer-events:auto on it. That
       inline style overrides the hidden overlay, leaving an invisible (opacity:0) but
       still HIT-TESTABLE iframe (~358x790) over screen-center that swallows every tap
       ("I can scroll but can't click anything"). A stylesheet !important beats an inline
       non-important style, so these rules force the closed popup + its iframe to intercept
       ZERO pointer events and be untestable by elementFromPoint. The .open state above is
       unaffected (these only apply while NOT open). */
    ".spv-popup-overlay:not(.open){pointer-events:none!important;}" +
    ".spv-popup-overlay:not(.open) #popup-form-iframe{pointer-events:none!important;visibility:hidden!important;}" +
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
    /* popup iframe fills the box. NOTE: form_embed.js DOES manage this iframe (it matches
       by src, not by data-attrs) — the closed-state rules above neutralize that. */
    "#popup-form-iframe{display:block;width:100%;height:100%;border:none;border-radius:10px;background:#fff;}" +
    "body.spv-popup-open{overflow:hidden;}" +
    /* ---- Canonical MOBILE HEADER (single source of truth) ----
       The header markup is identical on all 43 pages but only index.html carried the mobile
       nav recipe; the other 42 kept the 160px logo visible + the Get-Free-Estimate button
       hidden, so the bar read [logo]…[phone][hamburger] with the hamburger sometimes pushed
       off-screen (blog/service-areas). These rules reproduce index.html's mobile header
       EXACTLY on every page, scoped to .nav and !important to beat each page's inline rules
       + one-off breakpoints. Desktop (>768px / >1024px) is untouched. */
    "@media (max-width:1024px){" +
      ".nav .hamburger{display:flex!important;}" +
      ".nav .nav-links{display:none!important;}" +
      ".nav .nav-cta .btn-primary{display:none;}" +    /* matches index @1024 (overridden at <=768 below) */
    "}" +
    "@media (max-width:768px){" +
      ".nav .logo-wrapper{display:none!important;}" +
      ".nav .nav-inner{gap:10px!important;padding:0 14px!important;justify-content:space-between!important;}" +
      ".nav .nav-cta{gap:8px!important;}" +
      ".nav .nav-cta .btn-primary{display:inline-flex!important;}" +
      ".nav .nav-cta .btn{padding:10px 11px!important;font-size:12px!important;letter-spacing:0!important;}" +
      ".nav .hamburger{z-index:101!important;}" +      /* match homepage stacking so it's never hidden */
    "}";
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

  /* ---- Mobile menu: the ONE controller (single source of truth) ----
     All open/close/services-toggle + body scroll-lock lives here and NOWHERE else.
     The duplicated per-page inline _spvMenuInit <script> has been removed from every
     page, so there is exactly one owner of the menu state. open/close are idempotent. */
  function closeMobileMenu() {
    ["mob-menu", "mob-overlay", "hamburger"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("open");
    });
    var ham = document.getElementById("hamburger");
    if (ham) ham.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";        // never leave the menu's scroll-lock stuck
  }
  function openMobileMenu() {
    var menu = document.getElementById("mob-menu");
    if (!menu) return;                          // page has no mobile menu — nothing to do
    ["mob-menu", "mob-overlay", "hamburger"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add("open");
    });
    var ham = document.getElementById("hamburger");
    if (ham) ham.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function menuIsOpen() {
    var menu = document.getElementById("mob-menu");
    return !!(menu && menu.classList.contains("open"));
  }

  /* 2) Inline hero/page form: branded skeleton + lazy load (data-src->src).
        The inline forms and their dimensions are final — we only add a loading skeleton
        and start the load earlier so the area is never a blank white box. */

  /* Inject a branded loading skeleton into every inline-form wrapper up front (at parse),
     so the height-reserved area shows a logo + spinner instead of blank white during load. */
  function setupFormSkeletons() {
    var wraps = document.querySelectorAll(".quote-form.is-ghl");
    for (var i = 0; i < wraps.length; i++) {
      var w = wraps[i];
      if (w.querySelector(".spv-form-skel")) continue;
      var sk = document.createElement("div");
      sk.className = "spv-form-skel";
      sk.setAttribute("aria-hidden", "true");
      sk.innerHTML =
        '<div class="spv-form-skel-card">' +
          '<img class="spv-form-skel-logo" src="/brand_assets/logo-circular.webp" alt="" ' +
            'width="64" height="64" decoding="async">' +
          '<div class="spv-form-skel-spin"></div>' +
          '<p class="spv-form-skel-txt">Loading your free quote form…</p>' +
        "</div>";
      w.appendChild(sk);
    }
  }
  function hideFormSkeletons() {
    var sks = document.querySelectorAll(".quote-form.is-ghl .spv-form-skel");
    for (var i = 0; i < sks.length; i++) {
      (function (sk) {
        if (sk.classList.contains("hide")) return;
        sk.classList.add("hide");
        setTimeout(function () { if (sk.parentNode) sk.parentNode.removeChild(sk); }, 450);
      })(sks[i]);
    }
  }
  /* The GHL form posts messages (form_embed resize) from its leadconnectorhq/msgsndr origin
     once it's live — that's our most accurate "form has rendered" signal; hide the skeleton
     then. (Plus iframe onload+delay and a hard fallback below, whichever fires first.) */
  window.addEventListener("message", function (e) {
    if (e.origin && /leadconnectorhq\.com|msgsndr\.com/.test(e.origin)) hideFormSkeletons();
  });

  function loadInlineForm() {
    var ifr = document.querySelector('iframe[id^="inline-"][data-src]');
    if (!ifr) return;
    if (isPopupOpen()) {                    // don't load a 2nd GHL form over the open popup
      setTimeout(loadInlineForm, 800);
      return;
    }
    ifr.addEventListener("load", function () { setTimeout(hideFormSkeletons, 600); });
    ifr.src = ifr.getAttribute("data-src");
    ifr.removeAttribute("data-src");
    loadFormEmbed();
    /* Consistent reveal: the GHL form is reliably rendered ~1.5-1.8s after src across
       devices. Hide then so the ready form is never trapped behind the skeleton (on
       desktop the iframe load/message signals can lag). The message listener + onload
       above hide it sooner when those fire; this is the floor + backstop. */
    setTimeout(hideFormSkeletons, 1800);
  }
  /* Observe the inline form from init. The IntersectionObserver itself is the gate:
     - a far-down form is NOT within rootMargin at load, so it does NOT load during the
       initial render (preserves first-tap/menu responsiveness, no form_embed at render);
       it loads the moment the user scrolls within ~1200px of it (native, reliable).
     - a form already near the viewport (contact / home hero) would intersect at init, so
       we DEFER its load past the initial-paint window (~1200ms) instead of loading
       synchronously at render. No scroll/idle/tap arming needed — the IO is always live. */
  function watchInlineForm() {
    var ifr = document.querySelector('iframe[id^="inline-"][data-src]');
    if (!ifr) return;
    if (!("IntersectionObserver" in window)) { setTimeout(loadInlineForm, 1200); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        io.disconnect();
        var now = (window.performance && performance.now) ? performance.now() : 9999;
        setTimeout(loadInlineForm, Math.max(0, 1200 - now));   // defer only within initial paint
      }
    }, { rootMargin: "1200px 0px" });
    io.observe(ifr);
  }
  function isPopupOpen() {
    var ov = document.querySelector(".spv-popup-overlay");
    return !!(ov && ov.classList.contains("open"));
  }
  function initInlineForm() { setupFormSkeletons(); watchInlineForm(); }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initInlineForm);
  else initInlineForm();

  /* 3) Popup markup, injected once. The iframe's real src is set on first open. NOTE:
        form_embed.js DOES manage this iframe (it matches GHL forms by src and stamps
        inline visibility:visible/pointer-events:auto on them) — so when closed it must be
        forced inert via the CSS !important rules above AND defensively in closePopup(),
        or the invisible iframe keeps swallowing taps over screen-center. */
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
    // re-enable interactivity (clear the defensive inline inert set on close)
    popupFrame.style.removeProperty("pointer-events");
    popupFrame.style.removeProperty("visibility");
    if (!popupLoaded) {
      popupFrame.src = SRC;      // loads the GHL form directly
      popupLoaded = true;
    }
  }
  function closePopup() {
    // Hide the overlay ONLY (no display:none, no src reload) so reopen is instant and GHL
    // never re-lays-out the form. Belt & suspenders: besides the CSS !important closed
    // rules, defensively stamp the iframe inert with inline !important so it can never sit
    // hit-testable over the page after form_embed re-asserts visibility:visible.
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("spv-popup-open");
    popupFrame.style.setProperty("pointer-events", "none", "important");
    popupFrame.style.setProperty("visibility", "hidden", "important");
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

  /* CTA wiring: PRIMARY = the explicit [data-open-estimate] hook present on every CTA
     (works on the first tap, at the top of the page, regardless of script load order and
     regardless of the button's visible label). BACKSTOP = the old visible-text regex, so
     any CTA that somehow lacks the hook still works. A CTA inside the mobile menu closes
     the menu (+ clears the scroll-lock) first, then opens the popup. */
  var RE = /(get\s*a?\s*free\s+estimate|free\s+quote)/i;
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    if (e.target.closest(".spv-popup-overlay")) return;     // ignore clicks inside the popup
    var hook = e.target.closest("[data-open-estimate]");
    var el = hook || e.target.closest("a, button");
    if (!el) return;
    if (!hook && !RE.test((el.textContent || "").replace(/\s+/g, " ").trim())) return;
    e.preventDefault();
    if (el.closest(".mob-menu")) closeMobileMenu();
    openPopup();
  });

  /* Mobile-menu controls — delegated on document so they fire no matter when the menu
     HTML or this script loads (the single controller; no per-page inline JS). */
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    if (e.target.closest("#hamburger")) {
      e.preventDefault();
      menuIsOpen() ? closeMobileMenu() : openMobileMenu();
    } else if (e.target.closest("#mob-close") || e.target.closest("#mob-overlay")) {
      closeMobileMenu();
    } else if (e.target.closest("#mob-services-toggle")) {
      var li = document.getElementById("mob-services-li");
      if (li) li.classList.toggle("open");
    }
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
