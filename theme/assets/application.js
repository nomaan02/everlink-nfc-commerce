/*
 * Everlink Theme - Application JavaScript
 * Additional theme functionality
 */

// Quick Add to Cart functionality
document.addEventListener('click', async (e) => {
  if (e.target.matches('.product-card__quick-add') || e.target.closest('.product-card__quick-add')) {
    e.preventDefault();
    const button = e.target.matches('.product-card__quick-add') ? e.target : e.target.closest('.product-card__quick-add');
    const productId = button.dataset.productId;

    if (!productId) return;

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Adding...';

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          quantity: 1
        })
      });

      if (response.ok) {
        // Get updated cart
        const cartResponse = await fetch('/cart.js');
        const cart = await cartResponse.json();

        // Update cart UI
        const event = new CustomEvent('cart:updated', { detail: cart });
        document.dispatchEvent(event);

        button.textContent = 'Added!';
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2000);

        // Open cart drawer
        const cartDrawer = document.querySelector('[data-cart-drawer]');
        if (cartDrawer) {
          cartDrawer.removeAttribute('hidden');
        }
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error:', error);
      button.textContent = 'Error';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }
  }
});

// Collection sorting
const sortBySelect = document.getElementById('SortBy');
if (sortBySelect) {
  sortBySelect.addEventListener('change', (e) => {
    const url = new URL(window.location.href);
    url.searchParams.set('sort_by', e.target.value);
    window.location.href = url.toString();
  });

  // Set current value
  const urlParams = new URLSearchParams(window.location.search);
  const currentSort = urlParams.get('sort_by');
  if (currentSort) {
    sortBySelect.value = currentSort;
  }
}

// Image zoom on product page
if (document.querySelector('.product-template')) {
  const productImages = document.querySelectorAll('.product__image');

  productImages.forEach(img => {
    img.addEventListener('click', () => {
      // Simple click to zoom - in production you'd use a lightbox library
      if (img.requestFullscreen) {
        img.requestFullscreen();
      }
    });
  });
}

// Newsletter form submission
document.addEventListener('submit', async (e) => {
  if (e.target.classList.contains('newsletter__form')) {
    e.preventDefault();

    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const button = form.querySelector('button[type="submit"]');
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = 'Subscribing...';

    // In production, this would submit to your newsletter service
    setTimeout(() => {
      button.textContent = 'Subscribed!';
      form.querySelector('input[type="email"]').value = '';

      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 3000);
    }, 1000);
  }
});

// Lazy loading images
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Add animation on scroll
const animateOnScroll = () => {
  const elements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  elements.forEach(el => observer.observe(el));
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', animateOnScroll);
} else {
  animateOnScroll();
}
