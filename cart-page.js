// ==========================================================================
// CART PAGE CONTROLLER - MÉLDICA COSMÉTICOS
// ==========================================================================

const productMeta = {
  "serum-mix-01": {
    name: "Sérum Facial Hidratante Mix 01",
    category: "Rosto",
    price: 89.90,
    img: "assets/serum_rosto.png"
  },
  "creme-nutri-02": {
    name: "Creme Facial Nutritivo Nutri 02",
    category: "Rosto",
    price: 74.90,
    img: "assets/creme_rosto.png"
  },
  "oleo-body-03": {
    name: "Óleo Corporal Regenerador Body 03",
    category: "Corpo",
    price: 98.00,
    img: "assets/oleo_corpo.png"
  }
};

const SHIPPING_THRESHOLD = 199.00;
const DEFAULT_SHIPPING = 15.00;

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  
  // Setup Checkout Submit
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Open success modal
      const overlay = document.getElementById('success-overlay');
      if (overlay) {
        overlay.classList.add('active');
      }

      // Clear Cart Data
      if (window.MeldicaCart) {
        window.MeldicaCart.clearCart();
      }
    });
  }

  // Setup Success Close button
  const successCloseBtn = document.getElementById('btn-success-close');
  if (successCloseBtn) {
    successCloseBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Re-render when cart state updates
  window.addEventListener('cartUpdated', () => {
    renderCart();
  });
});

// Render Cart Items
function renderCart() {
  const wrapper = document.getElementById('cart-items-wrapper');
  const summaryBox = document.getElementById('cart-summary-box');
  
  if (!wrapper) return;

  const cart = window.MeldicaCart ? window.MeldicaCart.getCart() : {};
  const productIds = Object.keys(cart);

  // If Cart is Empty
  if (productIds.length === 0) {
    wrapper.innerHTML = `
      <div class="cart-empty-state">
        <div class="success-icon" style="background-color: #F3F1ED; color: var(--color-muted);">🛒</div>
        <h3>Sua sacola está vazia</h3>
        <p>Você ainda não adicionou nenhum produto natural de alta performance ao seu ritual.</p>
        <a href="produtos.html" class="btn btn-primary">Ir para o Catálogo</a>
      </div>
    `;
    if (summaryBox) {
      summaryBox.style.display = 'none';
    }
    updateSummary(0);
    return;
  }

  // Cart has items, display Summary Box
  if (summaryBox) {
    summaryBox.style.display = 'flex';
  }

  let htmlContent = '';
  let subtotal = 0;

  productIds.forEach(id => {
    const qty = cart[id];
    const meta = productMeta[id];
    
    if (meta) {
      const itemSubtotal = meta.price * qty;
      subtotal += itemSubtotal;

      htmlContent += `
        <div class="cart-item-row" data-id="${id}">
          <div class="cart-item-img-container">
            <img src="${meta.img}" alt="${meta.name}" class="cart-item-img">
          </div>
          <div class="cart-item-details">
            <span class="cart-item-meta">${meta.category}</span>
            <h4 class="cart-item-title">${meta.name}</h4>
            <span class="cart-item-price-unit mono">R$ ${meta.price.toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="cart-item-quantity-controls">
            <button class="qty-btn" onclick="adjustQty('${id}', -1)" aria-label="Diminuir quantidade">-</button>
            <span class="qty-val mono">${qty}</span>
            <button class="qty-btn" onclick="adjustQty('${id}', 1)" aria-label="Aumentar quantidade">+</button>
          </div>
          <span class="cart-item-subtotal mono">R$ ${itemSubtotal.toFixed(2).replace('.', ',')}</span>
          <button class="btn-remove-item" onclick="removeItem('${id}')" aria-label="Remover produto da sacola">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      `;
    }
  });

  wrapper.innerHTML = htmlContent;
  updateSummary(subtotal);
}

// Adjust Item Quantity
window.adjustQty = function(id, offset) {
  if (window.MeldicaCart) {
    const cart = window.MeldicaCart.getCart();
    const currentQty = cart[id] || 0;
    const newQty = currentQty + offset;
    window.MeldicaCart.updateQuantity(id, newQty);
  }
};

// Remove Item completely
window.removeItem = function(id) {
  if (window.MeldicaCart) {
    window.MeldicaCart.removeFromCart(id);
  }
};

// Update summary pricing cards
function updateSummary(subtotal) {
  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping-text');
  const totalEl = document.getElementById('cart-total');
  const progressText = document.getElementById('shipping-progress-text');
  const progressFill = document.getElementById('shipping-progress-fill');

  if (!subtotalEl) return;

  // Format subtotal
  subtotalEl.textContent = subtotal.toFixed(2).replace('.', ',');

  // Update Free Shipping Progress Bar
  if (subtotal === 0) {
    if (progressText) progressText.textContent = `Faltam R$ ${SHIPPING_THRESHOLD.toFixed(2)} para Frete Grátis`;
    if (progressFill) progressFill.style.width = '0%';
    if (shippingEl) shippingEl.textContent = 'Calculado no checkout';
    if (totalEl) totalEl.textContent = '0,00';
    return;
  }

  const difference = SHIPPING_THRESHOLD - subtotal;
  let shipping = DEFAULT_SHIPPING;

  if (subtotal >= SHIPPING_THRESHOLD) {
    shipping = 0;
    if (progressText) progressText.textContent = "Parabéns! Você ganhou Frete Grátis ✨";
    if (progressFill) progressFill.style.width = '100%';
    if (shippingEl) {
      shippingEl.textContent = 'Grátis';
      shippingEl.style.color = 'var(--color-accent)';
      shippingEl.style.fontWeight = '600';
    }
  } else {
    const percentage = (subtotal / SHIPPING_THRESHOLD) * 100;
    if (progressText) progressText.textContent = `Faltam R$ ${difference.toFixed(2).replace('.', ',')} para Frete Grátis`;
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (shippingEl) {
      shippingEl.textContent = `R$ ${DEFAULT_SHIPPING.toFixed(2).replace('.', ',')}`;
      shippingEl.style.color = '';
      shippingEl.style.fontWeight = '';
    }
  }

  // Calculate and format Total
  const total = subtotal + shipping;
  if (totalEl) {
    totalEl.textContent = total.toFixed(2).replace('.', ',');
  }
}
