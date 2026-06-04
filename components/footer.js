/* Shared footer component — edit this file to update the footer on every page */
(function () {
  var html = `<footer>
  <div class="container">
    <div class="footer-main">

      <!-- Col 1: Logo + License -->
      <div>
        <img src="/brand_assets/logo.webp" alt="Southern Pro-Vision Landscape &amp; Construction" class="footer-brand-logo" decoding="async" loading="lazy">
        <span class="footer-license-label">Licensed &amp; Insured</span>
        <strong class="footer-license-num">(469) 363-5551</strong>
      </div>

      <!-- Col 2: Services -->
      <div>
        <h3 class="footer-col-heading">Services</h3>
        <ul class="footer-col-links">
          <li><a href="/services/landscape-design">Landscape Design</a></li>
          <li><a href="/services/landscape-construction">Landscape Construction</a></li>
          <li><a href="/services/outdoor-living">Outdoor Living</a></li>
          <li><a href="/services/irrigation-systems">Irrigation</a></li>
          <li><a href="/services/landscape-lighting">Landscape Lighting</a></li>
          <li><a href="/services/hardscape">Hardscape</a></li>
          <li><a href="/services">View All Services</a></li>
        </ul>
      </div>

      <!-- Col 3: Service Areas -->
      <div>
        <h3 class="footer-col-heading">Service Areas</h3>
        <ul class="footer-col-links">
          <li><a href="/service-areas/dallas-tx">Dallas, TX</a></li>
          <li><a href="/service-areas/fort-worth-tx">Fort Worth, TX</a></li>
          <li><a href="/service-areas/plano-tx">Plano, TX</a></li>
          <li><a href="/service-areas/frisco-tx">Frisco, TX</a></li>
          <li><a href="/service-areas/mckinney-tx">McKinney, TX</a></li>
          <li><a href="/service-areas">View All Areas</a></li>
        </ul>
      </div>

      <!-- Col 4: Google Map -->
      <div>
        <iframe class="footer-map-frame" title="Service area map"
          src="https://maps.google.com/maps?q=Dallas+Fort+Worth+TX&t=m&z=10&ie=UTF8&iwloc=&output=embed"
          allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>

    </div>

    <hr class="footer-hr">

    <!-- Google Rating Row -->
    <div class="footer-rating">
      <svg class="footer-g-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
        <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.000 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
        <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
        <path d="M43.611 20.083H42V20H24v8h11.303a11.946 11.946 0 01-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
      </svg>
      <div class="footer-stars">
        <svg class="fa-solid fa-star" style="width:1em;height:1em;vertical-align:-0.125em;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-67.5 128.3 67.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L433.6 329 537.8 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L376.4 150.3 316.9 18z"/></svg>
        <svg class="fa-solid fa-star" style="width:1em;height:1em;vertical-align:-0.125em;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-67.5 128.3 67.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L433.6 329 537.8 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L376.4 150.3 316.9 18z"/></svg>
        <svg class="fa-solid fa-star" style="width:1em;height:1em;vertical-align:-0.125em;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-67.5 128.3 67.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L433.6 329 537.8 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L376.4 150.3 316.9 18z"/></svg>
        <svg class="fa-solid fa-star" style="width:1em;height:1em;vertical-align:-0.125em;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-67.5 128.3 67.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L433.6 329 537.8 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L376.4 150.3 316.9 18z"/></svg>
        <svg class="fa-solid fa-star" style="width:1em;height:1em;vertical-align:-0.125em;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-67.5 128.3 67.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L433.6 329 537.8 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L376.4 150.3 316.9 18z"/></svg>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="footer-bottom-bar">
      <div class="footer-bottom-left">
        <span>&copy; 2025 Southern Pro-Vision Landscape &amp; Construction. All rights reserved.</span>
        <a href="#">Privacy Policy</a>
      </div>
      <div class="footer-social-icons">
        <a href="https://maps.app.goo.gl/2ZQp1rPAzU8yKpai8" target="_blank" rel="noopener noreferrer" aria-label="Google Business Profile">
          <img src="/brand_assets/gbp-icon.svg" alt="Google Business Profile" decoding="async" loading="lazy">
        </a>
        <a href="https://www.instagram.com/sopro4landscape?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <img src="/brand_assets/instagram-icon.svg" alt="Instagram" decoding="async" loading="lazy">
        </a>
        <a href="https://www.facebook.com/SouthernProvisionLLC/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <img src="/brand_assets/facebook-green-icon.svg" alt="Facebook" decoding="async" loading="lazy">
        </a>
      </div>
    </div>
  </div>
</footer>`;

  var el = document.getElementById('site-footer');
  if (el) el.outerHTML = html;
})();
