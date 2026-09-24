/* ============================================================
   HOUSE OF DAVID — script.js (Main Page)
   Struktur: Variables → Functions → Cart → Events → Init
   ============================================================ */

/* ---------- 1. VARIABLES ---------- */
let activeFilter = "all";
let currentPage = 1;
const productsPerPage = 12;
let cart = JSON.parse(localStorage.getItem("hod_cart_v2") || "[]");

/* ---------- 2. BASIC FUNCTIONS ---------- */
function formatRp(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const pagination = document.getElementById("pagination");
  if (!grid) return;

  grid.innerHTML = "";

  const filtered = products.filter(
    (p) => activeFilter === "all" || p.folder === activeFilter,
  );

  // Update active tab
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("is-active");
    if (tab.dataset.cat === activeFilter) {
      tab.classList.add("is-active");
    }
  });

  const totalPages = Math.ceil(filtered.length / productsPerPage);
  if (currentPage > totalPages) currentPage = 1;

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToShow = filtered.slice(startIndex, endIndex);

  productsToShow.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    const imgPath = `img/shop/${p.folder}/${p.id}/1.jpg`;

    card.innerHTML = `
      <a href="pages/product.html?id=${p.id}" class="product-img-link">
        <div class="product-img">
          <img src="${imgPath}" alt="${p.name}" loading="lazy"
               onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #e8d5b7 0%, #d4c4a8 100%)'"/>
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

  renderPagination(totalPages, pagination);
}

function renderPagination(totalPages, container) {
  if (!container) return;

  if (totalPages <= 1) {
    container.classList.add("hidden");
    container.innerHTML = "";
    return;
  }

  container.classList.remove("hidden");
  container.innerHTML = "";

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.className = "pagination-btn prev";
  prevBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`;
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts();
      scrollToProducts();
    }
  };
  container.appendChild(prevBtn);

  // Page numbers
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

  if (startPage > 1) {
    const firstBtn = document.createElement("button");
    firstBtn.className = "pagination-btn";
    firstBtn.textContent = "1";
    firstBtn.onclick = () => {
      currentPage = 1;
      renderProducts();
      scrollToProducts();
    };
    container.appendChild(firstBtn);

    if (startPage > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.style.padding = "0 8px";
      ellipsis.style.color = "var(--text-soft)";
      container.appendChild(ellipsis);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = `pagination-btn${i === currentPage ? " is-active" : ""}`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => {
      currentPage = i;
      renderProducts();
      scrollToProducts();
    };
    container.appendChild(pageBtn);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.style.padding = "0 8px";
      ellipsis.style.color = "var(--text-soft)";
      container.appendChild(ellipsis);
    }

    const lastBtn = document.createElement("button");
    lastBtn.className = "pagination-btn";
    lastBtn.textContent = totalPages;
    lastBtn.onclick = () => {
      currentPage = totalPages;
      renderProducts();
      scrollToProducts();
    };
    container.appendChild(lastBtn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.className = "pagination-btn next";
  nextBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`;
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts();
      scrollToProducts();
    }
  };
  container.appendChild(nextBtn);
}

function scrollToProducts() {
  const shopSection = document.getElementById("shop");
  if (shopSection) {
    shopSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/* ---------- 3. CART FUNCTIONALITY ---------- */
function saveCart() {
  localStorage.setItem("hod_cart_v2", JSON.stringify(cart));
}

function updateCartUI() {
  const badge = document.getElementById("cartBadge");
  if (badge) {
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    badge.textContent = totalQty;
    badge.classList.toggle("active", totalQty > 0);

    // Animasi bounce pada badge
    badge.classList.remove("bounce");
    void badge.offsetWidth; // Trigger reflow
    badge.classList.add("bounce");
  }

  const cartList = document.getElementById("cartList");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartFoot = document.getElementById("cartFoot");

  if (cart.length === 0) {
    if (cartList) cartList.innerHTML = "";
    if (cartEmpty) cartEmpty.hidden = false;
    if (cartFoot) cartFoot.hidden = true;
    return;
  }

  if (cartEmpty) cartEmpty.hidden = true;
  if (cartFoot) cartFoot.hidden = false;

  if (cartList) {
    cartList.innerHTML = cart
      .map((item) => {
        const p = products.find((x) => x.id === item.id);
        if (!p) return "";
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
              <strong>${formatRp(p.price * item.qty)}</strong>
              <button class="cart-remove" data-id="${item.id}">✕</button>
            </div>
          </li>
        `;
      })
      .join("");
  }

  const total = cart.reduce((s, i) => {
    const p = products.find((x) => x.id === i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);

  const cartSubtotal = document.getElementById("cartSubtotal");
  if (cartSubtotal) cartSubtotal.textContent = formatRp(total);
}

function addToCart(id, qty = 1) {
  const existing = cart.find((i) => i.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, qty });
  }
  saveCart();
  updateCartUI();
  showToast("Produk ditambahkan ke keranjang");
}
// ===== TOAST NOTIFICATION =====
function showToast(message) {
  // Hapus toast lama jika ada
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

  // Auto remove setelah 2 detik
  setTimeout(() => {
    toast.classList.add("toast-hide");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function updateQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  updateCartUI();
}

function openCart() {
  const cartDrawer = document.getElementById("cartDrawer");
  if (cartDrawer) {
    cartDrawer.classList.add("open");
    document.body.classList.add("locked");
  }
}

function closeCart() {
  const cartDrawer = document.getElementById("cartDrawer");
  if (cartDrawer) {
    cartDrawer.classList.remove("open");
    document.body.classList.remove("locked");
  }
}

/* ---------- 4. EVENT LISTENERS ---------- */
document.addEventListener("DOMContentLoaded", function () {
  // ===== 4a. AUTO-FILTER DARI URL PARAMETER =====
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get("category");

  if (categoryFromUrl) {
    activeFilter = categoryFromUrl;
    currentPage = 1;

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.remove("is-active");
      if (tab.dataset.cat === categoryFromUrl) {
        tab.classList.add("is-active");
      }
    });

    setTimeout(() => {
      const shopSection = document.getElementById("shop");
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }

  // ===== 4b. FILTER TABS =====
  const filterTabs = document.getElementById("filterTabs");
  if (filterTabs) {
    filterTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;

      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      activeFilter = tab.dataset.cat;
      currentPage = 1;
      renderProducts();

      // Update URL tanpa reload
      const newUrl =
        activeFilter === "all"
          ? window.location.pathname
          : `?category=${activeFilter}`;
      window.history.replaceState({}, "", newUrl);
    });
  }

  // ===== 4c. CART BUTTONS =====
  const cartBtn = document.getElementById("cartBtn");
  const cartClose = document.getElementById("cartClose");
  const cartOverlay = document.getElementById("cartOverlay");

  if (cartBtn) cartBtn.addEventListener("click", openCart);
  if (cartClose) cartClose.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  // Cart items events
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

  // Checkout button
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

  // ===== 4d. ADD TO CART DELEGATION =====
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest(
      ".btn-add-cart, .btn-add-to-cart, .btn-add-quick",
    );
    if (addBtn) {
      e.preventDefault();
      addToCart(addBtn.dataset.id, 1);
    }
  });

  // ===== 4e. MOBILE MENU =====
  const mobileToggle = document.getElementById("mobileToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
      mobileToggle.classList.toggle("active");
    });

    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        mobileToggle.classList.remove("active");
      });
    });
  }

  // ===== 4f. HERO SLIDESHOW =====
  const heroTrack = document.getElementById("heroTrack");
  const heroDotsContainer = document.getElementById("heroDots");
  const heroPrev = document.getElementById("heroPrev");
  const heroNext = document.getElementById("heroNext");
  const heroSlides = document.querySelectorAll(".hero-slide");

  if (heroTrack && heroSlides.length > 0) {
    let currentSlide = 0;
    const totalSlides = heroSlides.length;
    const SLIDE_INTERVAL = 5000;
    let slideTimer;

    // Create dots
    heroDotsContainer.innerHTML = "";
    heroSlides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "hero-dot" + (i === 0 ? " is-active" : "");
      dot.dataset.index = i;
      heroDotsContainer.appendChild(dot);
    });

    const heroDots = document.querySelectorAll(".hero-dot");

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentSlide = index;
      heroTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
      heroDots.forEach((dot, i) =>
        dot.classList.toggle("is-active", i === currentSlide),
      );
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1);
    }

    function startAutoSlide() {
      slideTimer = setInterval(nextSlide, SLIDE_INTERVAL);
    }

    function resetAutoSlide() {
      clearInterval(slideTimer);
      startAutoSlide();
    }

    if (heroNext) {
      heroNext.addEventListener("click", () => {
        nextSlide();
        resetAutoSlide();
      });
    }

    if (heroPrev) {
      heroPrev.addEventListener("click", () => {
        prevSlide();
        resetAutoSlide();
      });
    }

    heroDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goToSlide(parseInt(dot.dataset.index));
        resetAutoSlide();
      });
    });

    const heroSlider = document.querySelector(".hero-slider");
    if (heroSlider) {
      heroSlider.addEventListener("mouseenter", () =>
        clearInterval(slideTimer),
      );
      heroSlider.addEventListener("mouseleave", startAutoSlide);
    }

    startAutoSlide();
  }

  // ===== 4g. CONCERN HORIZONTAL SCROLL =====
  const concernGrid = document.getElementById("concernGrid");
  const concernPrevBtn = document.getElementById("concernPrev");
  const concernNextBtn = document.getElementById("concernNext");
  const progressBar = document.getElementById("concernProgressBar");

  if (concernGrid && concernPrevBtn && concernNextBtn) {
    concernPrevBtn.addEventListener("click", () => {
      const cardWidth = concernGrid.querySelector(".concern-card").offsetWidth;
      const gap = 16;
      const scrollAmount = (cardWidth + gap) * 2;
      concernGrid.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });

    concernNextBtn.addEventListener("click", () => {
      const cardWidth = concernGrid.querySelector(".concern-card").offsetWidth;
      const gap = 16;
      const scrollAmount = (cardWidth + gap) * 2;
      concernGrid.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });

    function updateScrollState() {
      const scrollLeft = concernGrid.scrollLeft;
      const maxScroll = concernGrid.scrollWidth - concernGrid.clientWidth;

      concernPrevBtn.disabled = scrollLeft <= 0;
      concernNextBtn.disabled = scrollLeft >= maxScroll - 1;

      if (progressBar && maxScroll > 0) {
        const scrollPercent = scrollLeft / maxScroll;
        const barWidth = 20;
        const maxLeft = 100 - barWidth;
        const newLeft = scrollPercent * maxLeft;
        const parentWidth = progressBar.parentElement.offsetWidth;
        const translateX = (newLeft / 100) * parentWidth;
        progressBar.style.transform = `translateX(${translateX}px)`;
      }
    }

    concernGrid.addEventListener("scroll", updateScrollState);
    updateScrollState();

    // Touch swipe
    let touchStartX = 0;
    let touchEndX = 0;

    concernGrid.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true },
    );

    concernGrid.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        const swipeThreshold = 50;

        if (Math.abs(diff) > swipeThreshold) {
          const cardWidth =
            concernGrid.querySelector(".concern-card").offsetWidth;
          const gap = 16;
          const scrollAmount = (cardWidth + gap) * 2;

          if (diff > 0) {
            concernGrid.scrollBy({ left: scrollAmount, behavior: "smooth" });
          } else {
            concernGrid.scrollBy({ left: -scrollAmount, behavior: "smooth" });
          }
        }
      },
      { passive: true },
    );
  }

  // ===== 4h. INIT =====
  renderProducts();
  updateCartUI();
});
