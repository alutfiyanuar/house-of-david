/* ============================================================
   HAIRCUT PAGE — Data & Logic (dengan Cart Drawer)
   ============================================================ */

/* ---------- 1. DATA HAIRDRESSER ---------- */
const hairdressers = [
  {
    id: "mr-david",
    name: "Mr. David",
    role: "Owner",
    photo: "../img/hairdresser/mr-david.jpg",
    prices: {
      female: 1250000,
      male: 1000000,
      bangs: 300000,
      student: null,
    },
  },
  {
    id: "mr-daniel",
    name: "Mr. Daniel",
    role: "Owner",
    photo: "../img/hairdresser/mr-daniel.jpg",
    prices: {
      female: 600000,
      male: 500000,
      bangs: 175000,
      student: null,
    },
  },
  {
    id: "top-hairdresser",
    name: "Top Hairdresser",
    role: "Assistant",
    photo: null,
    prices: {
      female: 400000,
      male: 150000,
      bangs: 70000,
      student: null,
    },
  },
  {
    id: "hairdresser-1",
    name: "Hairdresser 1",
    role: "Assistant",
    photo: null,
    prices: {
      female: 350000,
      male: 150000,
      bangs: 70000,
      student: 250000,
    },
  },
  {
    id: "hairdresser-2",
    name: "Hairdresser 2",
    role: "Assistant",
    photo: null,
    prices: {
      female: 300000,
      male: 125000,
      bangs: 70000,
      student: 200000,
    },
  },
  {
    id: "hairdresser-3",
    name: "Hairdresser 3",
    role: "Assistant",
    photo: null,
    prices: {
      female: 250000,
      male: 125000,
      bangs: 70000,
      student: 175000,
    },
  },
];

/* ---------- 2. VARIABEL ---------- */
let currentGender = "female";
let cart = JSON.parse(localStorage.getItem("hod_cart_v2") || "[]");

/* ---------- 3. FUNGSI HAIRDRESSER ---------- */
function formatRp(n) {
  if (n === null || n === undefined || n === "-") return "-";
  return "Rp " + n.toLocaleString("id-ID");
}

function renderHairdressers() {
  const grid = document.getElementById("hairdresserGrid");
  if (!grid) return;
  grid.innerHTML = "";

  hairdressers.forEach((hd) => {
    // Filter untuk student: hanya tampilkan HD 1, 2, 3
    if (currentGender === "student") {
      if (
        !["hairdresser-1", "hairdresser-2", "hairdresser-3"].includes(hd.id)
      ) {
        return;
      }
    }

    const item = document.createElement("div");
    item.className = "hairdresser-item";

    let photoHTML;
    if (hd.photo) {
      photoHTML = `
        <div class="hairdresser-photo-minimal">
          <img src="${hd.photo}" alt="${hd.name}" loading="lazy"
               onerror="this.style.display='none'; this.parentElement.className='hairdresser-placeholder-minimal'; this.parentElement.innerHTML='<div class=\\'hairdresser-placeholder-minimal-text\\'>${hd.name}</div>';" />
        </div>
      `;
    } else {
      photoHTML = `
        <div class="hairdresser-placeholder-minimal">
          <div class="hairdresser-placeholder-minimal-text">${hd.name}</div>
        </div>
      `;
    }

    const price = hd.prices[currentGender];

    item.innerHTML = `
      ${photoHTML}
      <h3 class="hairdresser-name-minimal">${hd.name}</h3>
      <p class="hairdresser-role-minimal">${hd.role}</p>
      <div class="hairdresser-price-minimal" data-id="${hd.id}">
        ${price !== null && price !== undefined && price !== "-" ? formatRp(price) : "-"}
      </div>
    `;
    grid.appendChild(item);
  });
}

function updatePrices(newGender) {
  currentGender = newGender;
  renderHairdressers();
}

/* ---------- 4. CART FUNCTIONALITY ---------- */
function saveCart() {
  localStorage.setItem("hod_cart_v2", JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (badge) {
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    badge.textContent = totalQty;
    badge.classList.toggle("active", totalQty > 0);
  }
}

function openCart() {
  const cartDrawer = document.getElementById("cartDrawer");
  if (cartDrawer) {
    cartDrawer.classList.add("open");
    document.body.classList.add("locked");
    renderCartItems();
  }
}

function closeCart() {
  const cartDrawer = document.getElementById("cartDrawer");
  if (cartDrawer) {
    cartDrawer.classList.remove("open");
    document.body.classList.remove("locked");
  }
}

function renderCartItems() {
  const cartList = document.getElementById("cartList");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartFoot = document.getElementById("cartFoot");
  const cartSubtotal = document.getElementById("cartSubtotal");

  if (!cart || cart.length === 0) {
    if (cartList) cartList.innerHTML = "";
    if (cartEmpty) cartEmpty.hidden = false;
    if (cartFoot) cartFoot.hidden = true;
    if (cartSubtotal) cartSubtotal.textContent = "Rp 0";
    return;
  }

  if (cartEmpty) cartEmpty.hidden = true;
  if (cartFoot) cartFoot.hidden = false;

  let needsCleanup = false;
  let total = 0;

  if (cartList) {
    cartList.innerHTML = cart
      .map((item) => {
        // Cari produk dari array global `products` (dari data.js)
        const p = products.find((x) => x.id.trim() === item.id.trim());

        // Jika produk tidak ditemukan, tandai untuk dihapus
        if (!p) {
          needsCleanup = true;
          return "";
        }

        const itemTotal = p.price * item.qty;
        total += itemTotal;

        return `
          <li class="cart-item" data-id="${p.id.trim()}">
            <div class="cart-item-info">
              <h4>${p.name.trim()}</h4>
              <p class="cart-item-size">${p.size.trim()}</p>
              <div class="cart-item-qty">
                <button class="qty-btn" data-act="minus" data-id="${p.id.trim()}">−</button>
                <span>${item.qty}</span>
                <button class="qty-btn" data-act="plus" data-id="${p.id.trim()}">+</button>
              </div>
            </div>
            <div class="cart-item-right">
              <strong>${formatRp(itemTotal)}</strong>
              <button class="cart-remove" data-id="${p.id.trim()}">✕</button>
            </div>
          </li>
        `;
      })
      .join("");
  }

  // Auto-cleanup: hapus item yang tidak ditemukan dari localStorage
  if (needsCleanup) {
    cart = cart.filter((item) =>
      products.find((x) => x.id.trim() === item.id.trim()),
    );
    saveCart();
    updateCartBadge();
  }

  if (cartSubtotal) cartSubtotal.textContent = formatRp(total);
}

function updateQty(id, delta) {
  const item = cart.find((i) => i.id.trim() === id.trim());
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id.trim() !== id.trim());
  saveCart();
  updateCartBadge();
  renderCartItems();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id.trim() !== id.trim());
  saveCart();
  updateCartBadge();
  renderCartItems();
}

/* ---------- 5. EVENT LISTENERS ---------- */
document.addEventListener("DOMContentLoaded", function () {
  renderHairdressers();
  updateCartBadge();

  // Toggle Gender
  const genderTabs = document.getElementById("genderTabs");
  if (genderTabs) {
    genderTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".toggle-tab-minimal");
      if (!tab) return;

      document.querySelectorAll(".toggle-tab-minimal").forEach((t) => {
        t.classList.remove("is-active");
      });
      tab.classList.add("is-active");

      currentGender = tab.dataset.gender;
      renderHairdressers();
    });
  }

  // Cart Drawer Toggle
  const cartBtn = document.getElementById("cartBtn");
  const cartClose = document.getElementById("cartClose");
  const cartOverlay = document.getElementById("cartOverlay");

  if (cartBtn) cartBtn.addEventListener("click", openCart);
  if (cartClose) cartClose.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  // Cart Items Events (Delegation)
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

  // Checkout Button
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) return;

      let msg = "Halo House Of David, saya ingin order:%0A%0A";
      let total = 0;

      cart.forEach((item) => {
        const p = products.find((x) => x.id.trim() === item.id.trim());
        if (!p) return;
        total += p.price * item.qty;
        msg += `• ${p.name.trim()} (${p.size.trim()}) x${item.qty} = ${formatRp(p.price * item.qty)}%0A`;
      });

      msg += `%0A*Total: ${formatRp(total)}*`;
      window.open(`https://wa.me/628113250929?text=${msg}`, "_blank");
    });
  }

  // Mobile Menu
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
});
