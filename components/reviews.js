/* Shared Reviews section — edit this file to update the Reviews section on every page.
   Mount it on a page with:  <div id="site-reviews"></div>  then  <script src="/components/reviews.js"></script>
   The page must already include the .reviews-wrap / .reviews-head / .review-google-cta / .reviews-widget-wrapper styles. */
(function () {
  var html = `<section class="reviews-wrap">
  <div class="reviews-content">
    <div class="container">
      <div class="reviews-eyebrow"><span class="eyebrow">DISCOVER WHAT OUR CLIENTS HAVE TO SAY ABOUT US</span></div>
      <div class="reviews-head">
        <h2>REVIEWS</h2>
        <div class="divider"></div>
        <a class="contact-now" href="/contact">contact us now <i class="fa-solid fa-arrow-right"></i></a>
      </div>

      <!-- GoHighLevel / ReputationHub review carousel -->
      <div class="reviews-widget-wrapper">
        <iframe class="lc_reviews_widget" src="https://reputationhub.site/reputation/widgets/review_widget/z5ozcPKfsOi6MJB94NYI?widgetId=6a1db34e9501e8cad5b7590f" frameborder="0" scrolling="no" style="min-width: 100%; width: 100%;"></iframe>
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

  // Load the GoHighLevel / ReputationHub widget script once, after the iframe exists,
  // so dynamically-injected markup still initializes. (Scripts inside innerHTML don't run.)
  if (!document.querySelector('script[data-spv-reviews]')) {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://reputationhub.site/reputation/assets/review-widget.js';
    s.setAttribute('data-spv-reviews', '');
    document.body.appendChild(s);
  }
})();
