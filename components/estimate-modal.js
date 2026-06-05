/* Shared GoHighLevel estimate form: powers the popup modal + wires every
   "Get A Free Estimate" / "free quote" button across the site. Loaded once per
   page. The inline form iframes live in the page markup; this file loads GHL's
   form_embed.js (which auto-resizes BOTH the inline and modal iframes). */
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
    ".estimate-modal-overlay{position:fixed;inset:0;z-index:100000;display:none;" +
    "align-items:flex-start;justify-content:center;background:rgba(0,0,0,0.62);" +
    "padding:24px 16px;overflow-y:auto;-webkit-overflow-scrolling:touch;}" +
    ".estimate-modal-overlay.open{display:flex;}" +
    "body.estimate-modal-open{overflow:hidden;}" +
    /* modal = NO box: just the GHL iframe (its own white card) on the dark backdrop */
    ".estimate-modal{position:relative;width:100%;max-width:520px;margin:auto;" +
    "background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important;}" +
    ".estimate-modal-close{position:absolute;top:-2px;right:-2px;z-index:3;width:36px;height:36px;" +
    "border:none;border-radius:50%;background:#fff;color:#1a1a1a;font-size:24px;" +
    "box-shadow:0 2px 10px rgba(0,0,0,0.28);" +
    "line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}" +
    ".estimate-modal-close:hover{background:#f1f1f1;}" +
    ".estimate-modal-close:focus-visible{outline:2px solid #008037;outline-offset:2px;}" +
    /* fixed height covers the whole form even if form_embed.js never runs; form_embed
       can still resize it. (popup form variant renders ~789px; mobile wraps taller) */
    ".estimate-modal>iframe{display:block;width:100%;height:820px;min-height:760px;max-height:none;" +
    "overflow:visible;border:none!important;border-radius:10px;background:transparent;}" +
    "@media (max-width:560px){.estimate-modal>iframe{min-height:760px;}}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* 2) Modal markup (hidden). The iframe is INLINE-layout so GHL never auto-pops
        it — only our show()/hide() controls visibility. src is set lazily on first open. */
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

  function mount() { document.body.appendChild(overlay); }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  var frame = overlay.querySelector("iframe");
  var loaded = false;

  function closeMobileMenu() {
    ["mob-menu", "mob-overlay", "hamburger"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("open");
    });
  }

  function show() {
    if (!loaded) { frame.src = SRC; loaded = true; }
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

  /* 5) Load GHL form_embed.js once (auto-resizes inline + modal iframes). */
  if (!document.querySelector('script[src*="form_embed.js"]')) {
    var s = document.createElement("script");
    s.src = "https://link.msgsndr.com/js/form_embed.js";
    s.setAttribute("data-spv-ghl", "");
    document.body.appendChild(s);
  }
})();
