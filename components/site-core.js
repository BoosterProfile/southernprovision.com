/* Site core (shared, loaded once on every page). Three responsibilities:
     1) lazy-load the inline GHL form when it nears the viewport,
     2) smooth-scroll the "Get A Free Estimate" / "free quote" CTAs to that inline form,
     3) keep the mobile-menu scroll-lock from ever sticking.
   NOTE: the old popup "Get A Free Estimate" modal was REMOVED — it caused an iOS
   freeze/glitch on open/close. There is no popup, no modal iframe, no overlay; the CTAs
   now scroll to the single inline GHL form (whose dimensions are final, see HTML). */
(function () {
  /* 1) Inline-form chrome only: strip GHL's default card so the inline embed sits flush
        in the page. (No modal styles anymore.) */
  var css =
    ".quote-form.is-ghl{background:none!important;background-color:transparent!important;" +
    "box-shadow:none!important;padding:0!important;border:none!important;border-top:none!important;}" +
    ".quote-form.is-ghl>iframe{display:block;width:100%;height:auto;min-height:620px;max-height:none;" +
    "overflow:visible;border:none!important;border-radius:10px;background:transparent;}" +
    ".quote-form.is-ghl .ep-wrapper,.quote-form.is-ghl .ep-iFrameContainer{background:transparent!important;padding:0!important;border:none!important;box-shadow:none!important;max-height:none!important;overflow:visible!important;}" +
    /* homepage hero on mobile: the old card needed 78px top margin for its overhanging
       badge; the GHL embed has none, so tighten the gap (hero form only). */
    "@media (max-width:768px){.hero .quote-form.is-ghl{margin-top:22px!important;}}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* Load GHL's form_embed.js exactly ONCE per page, on demand (when the inline form
     nears the viewport, or when a CTA targets it). It auto-resizes the inline iframe. */
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

  /* 2) Inline hero/page form: lazy-load only when it nears the viewport, so the heavy
        cross-origin GHL form does not init on page load. Ships with data-src (no src);
        we swap data-src->src + load form_embed.js when it's close. */
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

  /* 3) Estimate CTAs -> smooth-scroll to the inline GHL form (popup removed). Any
        "Get [a] Free Estimate" / "free quote" button or link scrolls to the inline form
        on this page; if the page has none, navigate to /contact. The inline-form id
        varies per page (quote-form / svc-form / contact-form), so we locate it by the
        robust .quote-form.is-ghl class (falling back to the inline iframe). */
  var RE = /(get\s*a?\s*free\s+estimate|free\s+quote)/i;
  function findInlineForm() {
    return document.querySelector(".quote-form.is-ghl") ||
           document.querySelector('iframe[id^="inline-"]');
  }
  function scrollToForm(target) {
    loadInlineForm();   // ensure it starts loading even if still below the IO margin
    var header = document.querySelector("header");
    var offset = (header && header.offsetHeight ? header.offsetHeight : 80) + 12;
    try {
      var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y < 0 ? 0 : y, behavior: "smooth" });
    } catch (err) {
      try { target.scrollIntoView({ behavior: "smooth", block: "start" }); }
      catch (e2) { target.scrollIntoView(); }
    }
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("a, button");
    if (!el) return;
    if (!RE.test((el.textContent || "").replace(/\s+/g, " ").trim())) return;
    e.preventDefault();
    // a CTA inside the mobile menu must close it (+ clear the scroll-lock) first
    if (el.closest && el.closest(".mob-menu")) closeMobileMenu();
    var target = findInlineForm();
    if (!target) { window.location.href = "/contact"; return; }
    scrollToForm(target);
  });

  /* 4) Mobile-menu safety net (every page): the per-page menu script can leave
        document.body.style.overflow='hidden' stuck (open/close desync, or navigating
        away with the menu open), which makes the page feel frozen, esp. after iOS
        back/bfcache restore. Always release the lock:
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
