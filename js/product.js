/* ============================================================
   PRODUCT DETAIL PAGE — product.js (FINAL FIX)
   Path: js/product.js
   ============================================================ */

/* ---------- 1. VARIABLES ---------- */
let currentProduct = null;
let currentQty = 1;
let cart = JSON.parse(localStorage.getItem("hod_cart_v2") || "[]");

/* ---------- 2. HELPER FUNCTIONS ---------- */
function formatRp(n) {
  if (n === null || n === undefined || isNaN(n)) return "Rp 0";
  return "Rp " + n.toLocaleString("id-ID");
}

function getProductById(id) {
  return products.find((p) => p.id === id);
}

function getRelatedProducts(concern, currentId, limit = 4) {
  return products
    .filter((p) => p.concern === concern && p.id !== currentId)
    .slice(0, limit);
}

/* ---------- 3. PHOTO DETECTION ---------- */
async function detectPhotos(productId, folder) {
  const photos = [];
  let i = 1;

  while (i <= 10) {
    // Path sudah benar: ../img/ karena file ada di folder js/
    const src = `../img/shop/${folder}/${productId}/${i}.jpg`;

    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
      photos.push(src);
      i++;
    } catch {
      break;
    }
  }

  if (photos.length === 0) {
    photos.push(`../img/shop/${folder}/${productId}/1.jpg`);
  }

  return photos;
}

/* ---------- 4. PAGE RENDERING ---------- */
async function renderProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    window.location.href = "../index.html";
    return;
  }

  const product = getProductById(productId);
  if (!product) {
    document.getElementById("productTitle").textContent =
      "Produk Tidak Ditemukan";
    document.getElementById("productPrice").textContent = "—";
    return;
  }

  currentProduct = product;
  document.title = `${product.name} — House Of David Salon`;

  document.getElementById("productTitle").textContent = product.name;
  document.getElementById("productSize").textContent = product.size;
  document.getElementById("productConcern").textContent =
    product.concern.toUpperCase();
  document.getElementById("productPrice").textContent = formatRp(product.price);
  document.getElementById("productDesc").textContent = product.desc;

  const benefitsEl = document.getElementById("productBenefits");
  if (benefitsEl && product.benefits) {
    benefitsEl.innerHTML = product.benefits
      .map((item) => {
        const parts = item.split(":");
        if (parts.length > 1) {
          return `<li><strong>${parts[0].trim()}:</strong> ${parts.slice(1).join(":").trim()}</li>`;
        }
        return `<li>${item}</li>`;
      })
      .join("");
  }

  const howToUseEl = document.getElementById("productHowToUse");
  if (howToUseEl && product.howToUse) {
    howToUseEl.innerHTML = product.howToUse
      .map((item) => `<li>${item}</li>`)
      .join("");
  }

  const photos = await detectPhotos(product.id, product.folder);
  const galleryTrack = document.getElementById("productGalleryTrack");
  galleryTrack.innerHTML = "";

  photos.forEach((photo) => {
    const img = document.createElement("img");
    img.src = photo;
    img.alt = product.name;
    img.loading = "lazy";
    galleryTrack.appendChild(img);
  });

  renderRelatedProducts(product);
  updateCartBadge();
}

function renderRelatedProducts(product) {
  const related = getRelatedProducts(product.concern, product.id);
  const grid = document.getElementById("relatedGrid");

  if (related.length === 0) {
    document.getElementById("relatedProducts").style.display = "none";
    return;
  }

  grid.innerHTML = "";
  related.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    const imgPath = `../img/shop/${p.folder}/${p.id}/1.jpg`;

    card.innerHTML = `
      <a href="product.html?id=${p.id}" class="product-img-link">
        <div class="product-img">
          <img src="${imgPath}" alt="${p.name}" loading="lazy" />
        </div>
      </a>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-size">${p.size}</p>
        <div class="product-foot">
          <strong class="product-price">${formatRp(p.price)}</strong>
          <button class="btn-add-cart" data-id="${p.id}" aria-label="Add to cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ---------- 5. CART & TOAST FUNCTIONS ---------- */
function saveCart() {
  localStorage.setItem("hod_cart_v2", JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (badge) {
    const totalQty = cart.reduce((s, i) => s + (i.qty || 1), 0);
    badge.textContent = totalQty;
    badge.classList.toggle("active", totalQty > 0);
  }
}

function addToCart(product, qty = 1) {
  const existing = cart.find((i) => i.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: product.id, qty: qty });
  }
  saveCart();
  updateCartBadge();
  showToast("Produk ditambahkan ke keranjang");
}

function updateQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart();
  updateCartBadge();
  renderCartItems();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  updateCartBadge();
  renderCartItems();
}

// 🔥 FUNGSI INI DIPERBAIKI: Otomatis hapus data cart yang rusak/undefined
function renderCartItems() {
  const cartList = document.getElementById("cartList");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartFoot = document.getElementById("cartFoot");
  const cartSubtotal = document.getElementById("cartSubtotal");

  // SELF-HEALING: Filter hanya item yang produknya ada di data.js
  const validCart = cart.filter((item) =>
    products.find((p) => p.id === item.id),
  );

  // Jika ada data rusak, hapus dari localStorage otomatis
  if (validCart.length !== cart.length) {
    cart = validCart;
    saveCart();
    updateCartBadge();
  }

  if (cart.length === 0) {
    if (cartList) cartList.innerHTML = "";
    if (cartEmpty) cartEmpty.hidden = false;
    if (cartFoot) cartFoot.hidden = true;
    if (cartSubtotal) cartSubtotal.textContent = "Rp 0";
    return;
  }

  if (cartEmpty) cartEmpty.hidden = true;
  if (cartFoot) cartFoot.hidden = false;

  if (cartList) {
    cartList.innerHTML = cart
      .map((item) => {
        const p = products.find((x) => x.id === item.id);
        if (!p) return ""; // Skip jika tidak ketemu (seharusnya tidak terjadi karena filter di atas)

        const priceTotal = p.price * (item.qty || 1);

        return `
          <li class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
              <h4>${p.name}</h4>
              <p class="cart-item-size">${p.size}</p>
              <div class="cart-item-qty">
                <button class="qty-btn" data-act="minus" data-id="${item.id}">−</button>
                <span>${item.qty}</span>
                <button class="qty-btn" data-act="plus" data-id="${item.id}">+</button>
              </div>
            </div>
            <div class="cart-item-right">
              <strong>${formatRp(priceTotal)}</strong>
              <button class="cart-remove" data-id="${item.id}">✕</button>
            </div>
          </li>
        `;
      })
      .join("");
  }

  const total = cart.reduce((s, i) => {
    const p = products.find((x) => x.id === i.id);
    return s + (p ? p.price * (i.qty || 1) : 0);
  }, 0);

  if (cartSubtotal) cartSubtotal.textContent = formatRp(total);
}

function openCart() {
  const cartDrawer = document.getElementById("cartDrawer");
  if (cartDrawer) {
    cartDrawer.classList.add("open");
    document.body.classList.add("locked");
    renderCartItems(); // Render ulang saat dibuka
  }
}

function closeCart() {
  const cartDrawer = document.getElementById("cartDrawer");
  if (cartDrawer) {
    cartDrawer.classList.remove("open");
    document.body.classList.remove("locked");
  }
}

function showToast(message) {
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hide");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/* ---------- 6. EVENT LISTENERS ---------- */
document.addEventListener("DOMContentLoaded", function () {
  renderProductPage();

  const qtyInput = document.getElementById("qtyInput");
  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");

  if (qtyMinus) {
    qtyMinus.addEventListener("click", () => {
      if (currentQty > 1) {
        currentQty--;
        if (qtyInput) qtyInput.value = currentQty;
      }
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener("click", () => {
      if (currentQty < 99) {
        currentQty++;
        if (qtyInput) qtyInput.value = currentQty;
      }
    });
  }

  const addToCartBtn = document.getElementById("addToCartBtn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      if (currentProduct) {
        addToCart(currentProduct, currentQty);
      }
    });
  }

  const cartBtn = document.getElementById("cartBtn");
  const cartClose = document.getElementById("cartClose");
  const cartOverlay = document.getElementById("cartOverlay");

  if (cartBtn) cartBtn.addEventListener("click", openCart);
  if (cartClose) cartClose.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  const cartListEl = document.getElementById("cartList");
  if (cartListEl) {
    cartListEl.addEventListener("click", (e) => {
      const qtyBtn = e.target.closest(".qty-btn");
      if (qtyBtn) {
        updateQty(qtyBtn.dataset.id, qtyBtn.dataset.act === "plus" ? 1 : -1);
        return;
      }
      const rm = e.target.closest(".cart-remove");
      if (rm) removeFromCart(rm.dataset.id);
    });
  }

  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".btn-add-cart");
    if (addBtn) {
      e.preventDefault();
      const product = getProductById(addBtn.dataset.id);
      if (product) addToCart(product, 1);
    }
  });

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) return;
      let msg = "Halo House Of David, saya ingin order:%0A%0A";
      let total = 0;
      cart.forEach((item) => {
        const p = products.find((x) => x.id === item.id);
        if (!p) return;
        total += p.price * item.qty;
        msg += `• ${p.name} (${p.size}) x${item.qty} = ${formatRp(p.price * item.qty)}%0A`;
      });
      msg += `%0A*Total: ${formatRp(total)}*`;
      window.open(`https://wa.me/628113250929?text=${msg}`, "_blank");
    });
  }
});
