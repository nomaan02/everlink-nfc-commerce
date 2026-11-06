/*
 * Everlink Theme - Custom JavaScript
 * Theme-specific customizations
 */

// NFC Technology Information Toggle
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-nfc-toggle]')) {
    const content = document.querySelector('[data-nfc-content]');
    if (content) {
      content.classList.toggle('hidden');
    }
  }
});

// Product tabs on product page
const initProductTabs = () => {
  const tabs = document.querySelectorAll('[data-product-tab]');
  const contents = document.querySelectorAll('[data-product-tab-content]');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.productTab;

      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      document.querySelector(`[data-product-tab-content="${targetId}"]`)?.classList.add('active');
    });
  });
};

if (document.querySelector('[data-product-tab]')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductTabs);
  } else {
    initProductTabs();
  }
}

// Sticky header on scroll
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll <= 0) {
    header?.classList.remove('scroll-up');
    return;
  }

  if (currentScroll > lastScroll && !header?.classList.contains('scroll-down')) {
    // Scrolling down
    header?.classList.remove('scroll-up');
    header?.classList.add('scroll-down');
  } else if (currentScroll < lastScroll && header?.classList.contains('scroll-down')) {
    // Scrolling up
    header?.classList.remove('scroll-down');
    header?.classList.add('scroll-up');
  }

  lastScroll = currentScroll;
});

// Product image gallery
const initProductGallery = () => {
  const thumbnails = document.querySelectorAll('[data-thumbnail]');
  const mainImage = document.querySelector('[data-main-image]');

  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const imageSrc = thumb.dataset.thumbnail;
      if (mainImage && imageSrc) {
        mainImage.src = imageSrc;

        // Update active thumbnail
        thumbnails.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      }
    });
  });
};

if (document.querySelector('[data-thumbnail]')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductGallery);
  } else {
    initProductGallery();
  }
}

// Countdown timer (for sales/promotions)
const initCountdown = () => {
  const countdownElements = document.querySelectorAll('[data-countdown]');

  countdownElements.forEach(element => {
    const endDate = new Date(element.dataset.countdown).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = endDate - now;

      if (distance < 0) {
        element.innerHTML = 'EXPIRED';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      element.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  });
};

if (document.querySelector('[data-countdown]')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountdown);
  } else {
    initCountdown();
  }
}

// Console message
console.log('%cEverlink Theme', 'font-size: 20px; font-weight: bold; color: #6BA4CE;');
console.log('%cA new era of personalisation', 'font-size: 14px; color: #666;');
