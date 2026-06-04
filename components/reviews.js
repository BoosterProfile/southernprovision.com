/* Shared Reviews section — edit this file to update the Reviews section on every page.
   Mount it on a page with:  <div id="site-reviews"></div>  then  <script src="/components/reviews.js"></script>
   The page must already include the .reviews-wrap / .reviews-head / .review-google-cta / .reviews-widget-wrapper styles. */
(function () {
  var html = `<section class="reviews-wrap" aria-label="Customer reviews">
  <div class="reviews-content">
    <div class="container">
      <div class="reviews-eyebrow"><span class="eyebrow">DISCOVER WHAT OUR CLIENTS HAVE TO SAY ABOUT US</span></div>
      <div class="reviews-head">
        <h2>REVIEWS</h2>
        <div class="divider"></div>
        <a class="contact-now" href="/contact">contact us now <svg class="fa-solid fa-arrow-right" style="width:1em;height:1em;vertical-align:-0.125em;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg></a>
      </div>

      <!-- GoHighLevel / ReputationHub review carousel -->
      <div class="reviews-widget-wrapper">
        <iframe class="lc_reviews_widget" title="Customer reviews" loading="lazy" src="https://reputationhub.site/reputation/widgets/review_widget/z5ozcPKfsOi6MJB94NYI?widgetId=6a1db34e9501e8cad5b7590f" frameborder="0" scrolling="no" style="min-width: 100%; width: 100%;"></iframe>
      </div>

      <div class="review-google-cta">
        <h3>Review Us on Google</h3>
        <div class="stars">★★★★★</div>
        <a href="https://maps.app.goo.gl/2ZQp1rPAzU8yKpai8" target="_blank" rel="noopener noreferrer">leave us a review</a>
      </div>
    </div>
  </div>
</section>`;

  var el = document.getElementById('site-reviews');
  if (!el) return;
  el.outerHTML = html;

  // Lazy-load the GoHighLevel / ReputationHub widget script only when the reviews
  // section nears the viewport, so the heavy third-party chain (incl. leadconnector
  // main.js) does not block initial page load. The iframe itself is loading="lazy".
  function loadWidget() {
    if (document.querySelector('script[data-spv-reviews]')) return;
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://reputationhub.site/reputation/assets/review-widget.js';
    s.setAttribute('data-spv-reviews', '');
    document.body.appendChild(s);
  }
  var section = document.querySelector('.reviews-wrap');
  if (section && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        loadWidget();
        io.disconnect();
      }
    }, { rootMargin: '400px 0px' });
    io.observe(section);
  } else {
    loadWidget();
  }
})();
