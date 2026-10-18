const productGrid = document.getElementById('product-grid');
const productCount = document.getElementById('product-count');
const cartCount = document.getElementById('cart-count');
const cartPanel = document.getElementById('cart-panel');
const cartItems = document.getElementById('cart-items');
const subtotalEl = document.getElementById('subtotal');
const totalPriceEl = document.getElementById('total-price');
const checkoutTotalEl = document.getElementById('checkout-total');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutForm = document.getElementById('checkout-form');
const productDetailModal = document.getElementById('product-detail-modal');
const productDetailContent = document.getElementById('product-detail-content');

const storageKey = 'fake-store-cart';
const cartState = JSON.parse(localStorage.getItem(storageKey)) || [];

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function createStars(rating) {
  const filled = Math.round(rating);
  return `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}`;
}

function saveCart() {
  localStorage.setItem(storageKey, JSON.stringify(cartState));
}

function getCartCount() {
  return cartState.reduce((count, item) => count + item.quantity, 0);
}

function getCartSubtotal() {
  return cartState.reduce((total, item) => total + item.price * item.quantity, 0);
}

function renderCart() {
  cartItems.innerHTML = '';

  if (cartState.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">Your cart is empty. Add a few products to get started.</div>';
    cartCount.textContent = '0';
    subtotalEl.textContent = '$0.00';
    totalPriceEl.textContent = '$0.00';
    checkoutTotalEl.textContent = '$0.00';
    return;
  }

  cartState.forEach((item) => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img class="cart-item-image" src="${item.image}" alt="${item.title}" />
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-meta">
          <span>${formatPrice(item.price)}</span>
          <span>${formatPrice(item.price * item.quantity)}</span>
        </div>
        <div class="quantity-controls">
          <button class="quantity-btn decrease" type="button" data-id="${item.id}" aria-label="Decrease quantity">−</button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn increase" type="button" data-id="${item.id}" aria-label="Increase quantity">+</button>
        </div>
        <button class="view-details-btn" type="button" data-id="${item.id}">View details</button>
        <button class="remove-btn" type="button" data-id="${item.id}">Remove</button>
      </div>
    `;
    cartItems.appendChild(cartItem);
  });

  const subtotal = getCartSubtotal();
  const total = subtotal;
  cartCount.textContent = String(getCartCount());
  subtotalEl.textContent = formatPrice(subtotal);
  totalPriceEl.textContent = formatPrice(total);
  checkoutTotalEl.textContent = formatPrice(total);
}

function addToCart(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;

  const existingItem = cartState.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartState.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  saveCart();
  renderCart();
  cartPanel.classList.add('open');
}

function updateQuantity(productId, change) {
  const item = cartState.find((entry) => entry.id === productId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    const itemIndex = cartState.findIndex((entry) => entry.id === productId);
    cartState.splice(itemIndex, 1);
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  const itemIndex = cartState.findIndex((item) => item.id === productId);

  if (itemIndex >= 0) {
    cartState.splice(itemIndex, 1);
  }

  saveCart();
  renderCart();
}

function renderProducts(products) {
  productGrid.innerHTML = '';

  products.forEach((product, index) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 80}ms`;

    card.innerHTML = `
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.title}" />
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h4 class="product-title">${product.title}</h4>
        <div class="product-rating">
          <span class="rating-stars">${createStars(product.rating.rate)}</span>
          <span>${product.rating.count} reviews</span>
        </div>
        <div class="product-footer">
          <span class="product-price">${formatPrice(product.price)}</span>
          <button class="product-button" type="button" data-id="${product.id}">Add</button>
        </div>
      </div>
    `;

    productGrid.appendChild(card);
  });
}

function showLoadingState() {
  productGrid.innerHTML = '<div class="loading-card">Fetching products...</div>';
}

function showErrorState() {
  productGrid.innerHTML = '<div class="error-card">Something went wrong while loading products. Please try again.</div>';
}

async function fetchProducts() {
  showLoadingState();

  try {
    const response = await fetch('https://fakestoreapi.com/products');

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    state.products = await response.json();
    productCount.textContent = `${state.products.length} items`;
    renderProducts(state.products);
    renderCart();
  } catch (error) {
    productCount.textContent = '0 items';
    showErrorState();
    console.error('Failed to fetch products:', error);
  }
}

function openCart() {
  cartPanel.classList.add('open');
}

function closeCart() {
  cartPanel.classList.remove('open');
}

function openCheckout() {
  if (cartState.length === 0) {
    alert('Your cart is empty. Add a product before checkout.');
    return;
  }

  checkoutModal.classList.remove('hidden');
  checkoutModal.setAttribute('aria-hidden', 'false');
}

function closeCheckout() {
  checkoutModal.classList.add('hidden');
  checkoutModal.setAttribute('aria-hidden', 'true');
}

function openProductDetails(productId) {
  fetch(`https://fakestoreapi.com/products/${productId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Product details could not be loaded.');
      }
      return response.json();
    })
    .then((product) => {
      productDetailContent.innerHTML = `
        <img class="product-detail-image" src="${product.image}" alt="${product.title}" />
        <div class="product-detail-body">
          <span class="product-detail-category">${product.category}</span>
          <h4 class="product-detail-title">${product.title}</h4>
          <p class="product-detail-description">${product.description}</p>
          <div class="product-detail-meta">
            <span class="product-detail-price">${formatPrice(product.price)}</span>
            <span class="product-detail-rating">${createStars(product.rating.rate)} ${product.rating.rate}</span>
          </div>
          <div class="product-detail-footer">
            <button class="product-button" type="button" data-id="${product.id}">Add to cart</button>
          </div>
        </div>
      `;

      productDetailModal.classList.remove('hidden');
      productDetailModal.setAttribute('aria-hidden', 'false');
    })
    .catch((error) => {
      productDetailContent.innerHTML = `
        <div class="error-card">${error.message}</div>
      `;
      productDetailModal.classList.remove('hidden');
      productDetailModal.setAttribute('aria-hidden', 'false');
      console.error('Failed to fetch product details:', error);
    });
}

function closeProductDetails() { 
  productDetailModal.classList.add('hidden');
  productDetailModal.setAttribute('aria-hidden', 'true');
  productDetailContent.innerHTML = '';
}

function handleCheckoutSubmit(event) { 
  event.preventDefault();

  const formData = new FormData(checkoutForm);
  const fullName = formData.get('fullName')?.trim();
  const email = formData.get('email')?.trim();
  const address = formData.get('address')?.trim();
  const payment = formData.get('payment')?.trim();

  if (!fullName || !email || !address || !payment) {
    alert('Please complete all checkout fields before placing your order.');
    return;
  }

  const orderSummary = {
    customer: fullName,
    email,
    address,
    payment,
    total: getCartSubtotal(),
    items: [...cartState],
    purchasedAt: new Date().toISOString(),
  };

  console.log('Order placed:', orderSummary);

  cartState.length = 0;
  saveCart();
  renderCart();
  checkoutForm.reset();
  closeCheckout();
  alert(`Thank you, ${fullName}! Your order was placed successfully.`);
}

const state = { products: [] };

document.addEventListener('click', (event) => {
  const productButton = event.target.closest('.product-button');
  if (productButton) {
    addToCart(Number(productButton.dataset.id));
    return;
  }

  const quantityButton = event.target.closest('.quantity-btn');
  if (quantityButton) {
    const productId = Number(quantityButton.dataset.id);
    const change = quantityButton.classList.contains('increase') ? 1 : -1;
    updateQuantity(productId, change);
    return;
  }

  const removeButton = event.target.closest('.remove-btn');
  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.id));
    return;
  }

  const detailsButton = event.target.closest('.view-details-btn');
  if (detailsButton) {
    openProductDetails(Number(detailsButton.dataset.id));
    return;
  }

  const detailAddButton = event.target.closest('#product-detail-content .product-button');
  if (detailAddButton) {
    addToCart(Number(detailAddButton.dataset.id));
    closeProductDetails();
    openCart();
    return;
  }

  if (event.target.closest('.cart-trigger')) {
    openCart();
    return;
  }

  if (event.target.closest('#close-cart')) {
    closeCart();
    return;
  }

  if (event.target.closest('#checkout-btn')) {
    openCheckout();
    return;
  }

  if (event.target.closest('#close-checkout')) {
    closeCheckout();
    return;
  }

  if (event.target.closest('#close-product-details')) {
    closeProductDetails();
    return;
  }

  if (event.target.closest('.shop-btn')) {
    document.querySelector('.catalog').scrollIntoView({ behavior: 'smooth' });
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeCart();
    closeCheckout();
    closeProductDetails();
  }
});

checkoutForm.addEventListener('submit', handleCheckoutSubmit);

renderCart();
fetchProducts();
