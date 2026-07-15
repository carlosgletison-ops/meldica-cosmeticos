// ==========================================================================
// SHARED CART STATE MANAGER - MÉLDICA COSMÉTICOS
// ==========================================================================

(function() {
  const CART_KEY = 'meldica_cart';

  // Get current cart items
  function getCart() {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("Error reading cart from localStorage", e);
      return {};
    }
  }

  // Save cart and update UI
  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      updateCartBadge();
      // Dispatch global event for other listeners (e.g. cart page)
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    } catch (e) {
      console.error("Error saving cart to localStorage", e);
    }
  }

  // Add item to cart
  function addToCart(id, qty = 1) {
    const cart = getCart();
    if (cart[id]) {
      cart[id] += qty;
    } else {
      cart[id] = qty;
    }
    saveCart(cart);
  }

  // Remove item from cart
  function removeFromCart(id) {
    const cart = getCart();
    if (cart[id]) {
      delete cart[id];
    }
    saveCart(cart);
  }

  // Update item quantity
  function updateQuantity(id, qty) {
    const cart = getCart();
    if (qty <= 0) {
      delete cart[id];
    } else {
      cart[id] = qty;
    }
    saveCart(cart);
  }

  // Get total items count
  function getCartCount() {
    const cart = getCart();
    let count = 0;
    for (const id in cart) {
      if (cart.hasOwnProperty(id)) {
        count += cart[id];
      }
    }
    return count;
  }

  // Clear cart
  function clearCart() {
    saveCart({});
  }

  // Update header count badge DOM element
  function updateCartBadge() {
    const badge = document.querySelector('.cart-count');
    const button = document.querySelector('.cart-button');
    if (badge) {
      const count = getCartCount();
      const prevCount = parseInt(badge.textContent) || 0;
      badge.textContent = count;

      // Animate if count increased
      if (count > prevCount && button) {
        badge.style.transform = 'scale(1.4)';
        button.style.transform = 'scale(1.15)';
        setTimeout(() => {
          badge.style.transform = 'scale(1)';
          button.style.transform = 'scale(1)';
        }, 300);
      }
    }
  }

  // Expose cart actions globally
  window.MeldicaCart = {
    getCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartCount,
    clearCart,
    updateCartBadge
  };

  // Run initial badge update on load
  document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
  });
})();
