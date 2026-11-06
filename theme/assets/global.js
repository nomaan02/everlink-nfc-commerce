/*
 * Everlink Theme - Global JavaScript
 * Core functionality and utilities
 */

class ThemeUtility {
  constructor() {
    this.init();
  }

  init() {
    // Initialize all functionality
    this.initMobileNav();
    this.initCartDrawer();
    this.initSearch();
    this.initProductForm();
  }

  // Mobile Navigation
  initMobileNav() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('[data-mobile-nav]');
    const closeBtn = mobileNav?.querySelector('.mobile-nav__close');

    menuToggle?.addEventListener('click', () => {
      mobileNav?.classList.add('active');
    });

    closeBtn?.addEventListener('click', () => {
      mobileNav?.classList.remove('active');
    });

    // Close on overlay click
    document.addEventListener('click', (e) => {
      if (mobileNav?.classList.contains('active') &&
          !mobileNav.contains(e.target) &&
          !menuToggle?.contains(e.target)) {
        mobileNav.classList.remove('active');
      }
    });
  }

  // Cart Drawer
  initCartDrawer() {
    const cartIcon = document.querySelector('[data-cart-icon]');
    const cartDrawer = document.querySelector('[data-cart-drawer]');
    const closeButtons = cartDrawer?.querySelectorAll('[data-cart-drawer-close]');

    cartIcon?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openCartDrawer();
    });

    closeButtons?.forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeCartDrawer();
      });
    });

    // Initialize cart quantity controls
    this.initCartQuantityControls();
  }

  openCartDrawer() {
    const cartDrawer = document.querySelector('[data-cart-drawer]');
    cartDrawer?.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeCartDrawer() {
    const cartDrawer = document.querySelector('[data-cart-drawer]');
    cartDrawer?.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  initCartQuantityControls() {
    // Quantity increase
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-quantity-increase]')) {
        const input = e.target.parentElement.querySelector('[data-quantity-input]');
        if (input) {
          const newValue = parseInt(input.value) + 1;
          this.updateCartQuantity(input.dataset.line, newValue);
        }
      }
    });

    // Quantity decrease
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-quantity-decrease]')) {
        const input = e.target.parentElement.querySelector('[data-quantity-input]');
        if (input && parseInt(input.value) > 1) {
          const newValue = parseInt(input.value) - 1;
          this.updateCartQuantity(input.dataset.line, newValue);
        }
      }
    });

    // Remove item
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-cart-remove]') || e.target.closest('[data-cart-remove]')) {
        const button = e.target.matches('[data-cart-remove]') ? e.target : e.target.closest('[data-cart-remove]');
        this.updateCartQuantity(button.dataset.line, 0);
      }
    });
  }

  async updateCartQuantity(line, quantity) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line: parseInt(line),
          quantity: parseInt(quantity)
        })
      });

      if (response.ok) {
        const cart = await response.json();
        this.updateCartUI(cart);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  updateCartUI(cart) {
    // Update cart count
    const cartCount = document.querySelector('[data-cart-count]');
    if (cartCount) {
      cartCount.textContent = cart.item_count;
      if (cart.item_count === 0) {
        cartCount.classList.add('hidden');
      } else {
        cartCount.classList.remove('hidden');
      }
    }

    // Update cart subtotal
    const cartSubtotal = document.querySelector('[data-cart-subtotal]');
    if (cartSubtotal) {
      cartSubtotal.textContent = this.formatMoney(cart.total_price);
    }

    // Show/hide empty state
    const cartEmpty = document.querySelector('[data-cart-empty]');
    const cartItems = document.querySelector('[data-cart-items]');
    const cartFooter = document.querySelector('[data-cart-footer]');

    if (cart.item_count === 0) {
      cartEmpty?.removeAttribute('hidden');
      cartItems?.setAttribute('hidden', '');
      cartFooter?.setAttribute('hidden', '');
    } else {
      cartEmpty?.setAttribute('hidden', '');
      cartItems?.removeAttribute('hidden');
      cartFooter?.removeAttribute('hidden');
    }

    // Reload cart items
    this.reloadCartItems();
  }

  async reloadCartItems() {
    try {
      const response = await fetch('/cart?view=drawer');
      if (response.ok) {
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newItems = doc.querySelector('[data-cart-items]');
        const currentItems = document.querySelector('[data-cart-items]');
        if (newItems && currentItems) {
          currentItems.innerHTML = newItems.innerHTML;
        }
      }
    } catch (error) {
      console.error('Error reloading cart items:', error);
    }
  }

  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  // Search
  initSearch() {
    const searchIcon = document.querySelector('.header__icon--search');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchClose = searchOverlay?.querySelector('.search-overlay__close');

    searchIcon?.addEventListener('click', () => {
      searchOverlay?.classList.add('active');
      searchOverlay?.querySelector('.search-overlay__input')?.focus();
    });

    searchClose?.addEventListener('click', () => {
      searchOverlay?.classList.remove('active');
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchOverlay?.classList.contains('active')) {
        searchOverlay.classList.remove('active');
      }
    });
  }

  // Product Form
  initProductForm() {
    const productForm = document.getElementById('product-form');
    if (!productForm) return;

    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(productForm);
      const addButton = productForm.querySelector('[name="add"]');

      try {
        addButton.disabled = true;
        addButton.textContent = 'Adding...';

        const response = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const item = await response.json();

          // Get updated cart
          const cartResponse = await fetch('/cart.js');
          const cart = await cartResponse.json();

          this.updateCartUI(cart);
          this.openCartDrawer();

          addButton.textContent = 'Added!';
          setTimeout(() => {
            addButton.textContent = 'Add to cart';
            addButton.disabled = false;
          }, 2000);
        } else {
          throw new Error('Failed to add to cart');
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        addButton.textContent = 'Error - Try again';
        addButton.disabled = false;
      }
    });

    // Variant selection
    this.initVariantSelection();
  }

  initVariantSelection() {
    const variantInputs = document.querySelectorAll('[name^="option"]');
    if (!variantInputs.length) return;

    variantInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.updateVariant();
      });
    });
  }

  updateVariant() {
    // Get selected options
    const options = Array.from(document.querySelectorAll('[name^="option"]:checked'))
      .map(input => input.value);

    // Find matching variant (simplified - in production you'd use Shopify's variant selection logic)
    console.log('Selected options:', options);
  }
}

// Smooth scroll for anchor links
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (anchor && anchor.getAttribute('href') !== '#') {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

// Initialize theme
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeUtility();
  });
} else {
  new ThemeUtility();
}
