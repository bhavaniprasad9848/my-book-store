const OWNER_EMAIL = "bhavaniprasad9848@gmail.com";

const STORAGE_KEYS = {
  user: "mbs_user",
  cart: "mbs_cart",
  preferred: "mbs_preferred_category",
  lastOrder: "mbs_last_order",
  customBooks: "mbs_custom_books",
};

const state = {
  view: "login",
  user: null,
  cart: [],
  preferredCategory: "all",
  activeCategory: "all",
  lastOrder: null,
  customBooks: [],
  emailStatus: "",
};

const app = document.getElementById("app");
const topbar = document.getElementById("topbar");
const welcomeText = document.getElementById("welcome-text");
const cartCountEl = document.getElementById("cart-count");

function loadState() {
  try {
    state.user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || "null");
    state.cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || "[]");
    state.preferredCategory = localStorage.getItem(STORAGE_KEYS.preferred) || "all";
    state.lastOrder = JSON.parse(localStorage.getItem(STORAGE_KEYS.lastOrder) || "null");
    state.customBooks = JSON.parse(localStorage.getItem(STORAGE_KEYS.customBooks) || "[]");
  } catch {
    state.user = null;
    state.cart = [];
    state.preferredCategory = "all";
    state.lastOrder = null;
    state.customBooks = [];
  }
}

function saveUser() {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
}

function saveCart() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cart));
  updateCartCount();
}

function savePreferred(categoryId) {
  state.preferredCategory = categoryId;
  localStorage.setItem(STORAGE_KEYS.preferred, categoryId);
}

function saveLastOrder(order) {
  state.lastOrder = order;
  localStorage.setItem(STORAGE_KEYS.lastOrder, JSON.stringify(order));
}

function saveCustomBooks() {
  localStorage.setItem(STORAGE_KEYS.customBooks, JSON.stringify(state.customBooks));
}

function getCatalog() {
  return [...BOOKS, ...state.customBooks];
}

function getBookById(id) {
  return getCatalog().find((book) => book.id === id);
}

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function cartCount() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartSubtotal() {
  return state.cart.reduce((sum, item) => {
    const book = getBookById(item.id);
    return sum + (book ? book.price * item.qty : 0);
  }, 0);
}

function updateCartCount() {
  cartCountEl.textContent = String(cartCount());
}

function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setView(view, options = {}) {
  state.view = view;
  if (options.category) {
    state.activeCategory = options.category;
  }
  render();
}

function requireAuth(nextView = "categories") {
  if (!state.user) {
    setView("login");
    return false;
  }
  setView(nextView);
  return true;
}

function addToCart(bookId) {
  const existing = state.cart.find((item) => item.id === bookId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: bookId, qty: 1 });
  }
  saveCart();
}

function updateQty(bookId, delta) {
  const item = state.cart.find((entry) => entry.id === bookId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== bookId);
  }
  saveCart();
  render();
}

function removeFromCart(bookId) {
  state.cart = state.cart.filter((entry) => entry.id !== bookId);
  saveCart();
  render();
}

function addCustomBook(book) {
  state.customBooks.push(book);
  saveCustomBooks();
}

function logout() {
  state.user = null;
  state.cart = [];
  state.preferredCategory = "all";
  state.activeCategory = "all";
  state.lastOrder = null;
  state.emailStatus = "";
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.cart);
  localStorage.removeItem(STORAGE_KEYS.preferred);
  localStorage.removeItem(STORAGE_KEYS.lastOrder);
  setView("login");
}

function isOwner() {
  return Boolean(state.user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase());
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatExpiry(value) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function luhnCheck(number) {
  const digits = onlyDigits(number);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function buildReceiptEmail(order) {
  const lines = [
    `MY BOOK STORE — Order Receipt`,
    `Order ID: ${order.id}`,
    `Customer: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    `Date: ${order.paidAt}`,
    ``,
    `Items:`,
    ...order.items.map(
      (item) =>
        `- ${item.title} x${item.qty} @ ${money(item.price)} = ${money(item.price * item.qty)}`
    ),
    ``,
    `Subtotal: ${money(order.subtotal)}`,
    `Shipping: ${money(order.shipping)}`,
    `Total paid: ${money(order.total)}`,
    `Paid with card ending in ${order.cardLast4}`,
    ``,
    `Thank you buying in MY BOOK STORE.`,
    `If you like please visit again.`,
  ];
  return lines.join("\n");
}

async function sendReceiptEmail(order) {
  const message = buildReceiptEmail(order);
  const subject = `MY BOOK STORE Receipt — ${order.id}`;

  try {
    const response = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(order.customerEmail)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: order.customerName,
          email: order.customerEmail,
          _subject: subject,
          _template: "box",
          _captcha: "false",
          _honey: "",
          message,
          order_id: order.id,
          total_paid: money(order.total),
          paid_at: order.paidAt,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return {
        ok: true,
        status:
          "Receipt emailed to your Gmail. If this is your first order, also check spam and confirm the FormSubmit activation email, then tap Resend.",
      };
    }

    return {
      ok: false,
      status:
        data.message ||
        "Could not send email automatically. Use Resend, or check spam for an activation mail.",
    };
  } catch {
    return {
      ok: false,
      status: "Network error while sending receipt. Please tap Resend to try again.",
    };
  }
}

function bookCardHtml(book) {
  const cat = categoryById(book.category);
  return `
    <article class="book-card">
      <div class="book-spine" style="--spine:${cat?.accent || "#245c45"}">
        <span>${escapeHtml(cat?.name || "Book")}${book.custom ? " · New" : ""}</span>
        <strong>${escapeHtml(book.title)}</strong>
      </div>
      <div class="book-body">
        <h3>${escapeHtml(book.title)}</h3>
        <p class="meta">by ${escapeHtml(book.author)} · ${book.pages} pages · ${escapeHtml(book.condition)}</p>
        <p class="meta">${escapeHtml(book.description)}</p>
        <p class="price">${money(book.price)}</p>
        <div class="book-actions">
          <button class="primary-btn" type="button" data-add="${book.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `;
}

function addBookFormHtml(categoryId) {
  if (!isOwner()) return "";
  const cat = categoryById(categoryId);
  if (!cat) return "";
  return `
    <section class="panel add-book-panel" data-add-category="${categoryId}">
      <h3>Add a new ${escapeHtml(cat.name.replace(/ Books$/, ""))} book</h3>
      <p class="meta">List another title from your house shelf in this section.</p>
      <form class="add-book-form" data-add-form="${categoryId}">
        <label>
          Book title
          <input name="title" type="text" placeholder="Book title" required />
        </label>
        <label>
          Author
          <input name="author" type="text" placeholder="Author name" required />
        </label>
        <label>
          Price ($)
          <input name="price" type="number" min="0.5" step="0.01" placeholder="9.99" required />
        </label>
        <label>
          Pages
          <input name="pages" type="number" min="1" step="1" placeholder="120" required />
        </label>
        <label>
          Condition
          <select name="condition" required>
            <option value="Like New">Like New</option>
            <option value="Very Good" selected>Very Good</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </label>
        <label class="full-width">
          Short description
          <input name="description" type="text" placeholder="What this book is about" required />
        </label>
        <p class="form-error" data-add-error hidden></p>
        <button class="primary-btn" type="submit">Add book to ${escapeHtml(cat.name)}</button>
      </form>
    </section>
  `;
}

function bindAddBookForms() {
  app.querySelectorAll("[data-add-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!isOwner()) return;
      const categoryId = form.getAttribute("data-add-form");
      const errorEl = form.querySelector("[data-add-error]");
      const data = new FormData(form);

      const title = String(data.get("title") || "").trim();
      const author = String(data.get("author") || "").trim();
      const description = String(data.get("description") || "").trim();
      const condition = String(data.get("condition") || "Good").trim();
      const price = Number(data.get("price"));
      const pages = Number(data.get("pages"));

      if (title.length < 2 || author.length < 2 || description.length < 5) {
        errorEl.hidden = false;
        errorEl.textContent = "Please fill title, author, and a short description.";
        return;
      }
      if (!Number.isFinite(price) || price <= 0) {
        errorEl.hidden = false;
        errorEl.textContent = "Enter a valid price.";
        return;
      }
      if (!Number.isFinite(pages) || pages < 1) {
        errorEl.hidden = false;
        errorEl.textContent = "Enter a valid page count.";
        return;
      }

      addCustomBook({
        id: `c${Date.now()}`,
        category: categoryId,
        title,
        author,
        price,
        pages,
        condition,
        description,
        custom: true,
      });

      setView("shop", { category: state.activeCategory || categoryId });
    });
  });
}

function bindAddToCartButtons() {
  app.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-add");
      addToCart(id);
      updateCartCount();
      button.textContent = "Added ✓";
      setTimeout(() => {
        button.textContent = "Add to cart";
      }, 900);
    });
  });
}

function renderLogin() {
  topbar.hidden = true;
  app.innerHTML = `
    <section class="hero-login">
      <div class="hero-copy">
        <p class="eyebrow">House collection · Online shop</p>
        <h1>MY BOOK STORE</h1>
        <p>Sell the books on your shelf — kids, school, history, nature, adventure, and mixed favorites — to readers who need them.</p>
      </div>
      <form class="panel login-card" id="login-form">
        <h2>Customer login</h2>
        <p class="lede">Enter your name and Gmail to open the store and choose the books you need.</p>
        <div class="form-stack">
          <label>
            Full name
            <input id="login-name" name="name" type="text" placeholder="Ada Lovelace" required autocomplete="name" />
          </label>
          <label>
            Gmail
            <input id="login-email" name="email" type="email" placeholder="you@gmail.com" required autocomplete="email" />
          </label>
          <p class="form-error" id="login-error" hidden></p>
          <button class="primary-btn" type="submit">Enter the bookstore</button>
        </div>
      </form>
    </section>
  `;

  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("login-name").value.trim();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const errorEl = document.getElementById("login-error");

    if (name.length < 2) {
      errorEl.hidden = false;
      errorEl.textContent = "Please enter your full name.";
      return;
    }
    if (!isValidEmail(email)) {
      errorEl.hidden = false;
      errorEl.textContent = "Please enter a valid Gmail / email address.";
      return;
    }

    state.user = { name, email };
    saveUser();
    setView("categories");
  });
}

function renderCategories() {
  topbar.hidden = false;
  welcomeText.textContent = `Hello, ${state.user.name}`;
  updateCartCount();

  app.innerHTML = `
    <div class="section-head">
      <div>
        <h2 class="section-title">What type of books do you need?</h2>
        <p>Pick a category to browse, or open the full shelf with all six types from the house collection.</p>
      </div>
      <button class="secondary-btn" id="browse-all" type="button">Show all 6 types</button>
    </div>
    <div class="category-grid">
      ${CATEGORIES.map(
        (cat) => `
        <button class="category-card" type="button" data-category="${cat.id}">
          <div class="cat-dot" style="background:${cat.accent}"></div>
          <h3>${escapeHtml(cat.name)}</h3>
          <p>${escapeHtml(cat.blurb)}</p>
        </button>
      `
      ).join("")}
    </div>
  `;

  document.getElementById("browse-all").addEventListener("click", () => {
    savePreferred("all");
    setView("shop", { category: "all" });
  });

  app.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.getAttribute("data-category");
      savePreferred(category);
      setView("shop", { category });
    });
  });
}

function renderShop() {
  topbar.hidden = false;
  welcomeText.textContent = `Shopping as ${state.user.name}`;
  updateCartCount();

  const active = state.activeCategory || state.preferredCategory || "all";
  const catalog = getCatalog();
  const activeLabel =
    active === "all" ? "All 6 types" : categoryById(active)?.name || "Books";

  let catalogHtml = "";

  if (active === "all") {
    catalogHtml = CATEGORIES.map((cat) => {
      const books = catalog.filter((book) => book.category === cat.id);
      return `
        <section class="category-section">
          <div class="section-head compact">
            <h3 class="section-subtitle">${escapeHtml(cat.name)}</h3>
          </div>
          <div class="book-grid">
            ${books.map((book) => bookCardHtml(book)).join("")}
          </div>
          ${addBookFormHtml(cat.id)}
        </section>
      `;
    }).join("");
  } else {
    const books = catalog.filter((book) => book.category === active);
    catalogHtml = `
      <div class="book-grid">
        ${books.map((book) => bookCardHtml(book)).join("")}
      </div>
      ${addBookFormHtml(active)}
    `;
  }

  app.innerHTML = `
    <div class="section-head">
      <div>
        <h2 class="section-title">${escapeHtml(activeLabel)}</h2>
        <p>${
          isOwner()
            ? "Select books for your cart, or add a new title from your house collection at the end of each section."
            : "Select books for your cart. Every title is from the house collection."
        }</p>
      </div>
      <button class="secondary-btn" id="back-categories" type="button">Change type</button>
    </div>
    <div class="toolbar">
      <div class="chip-row" id="category-chips">
        <button class="chip ${active === "all" ? "active" : ""}" type="button" data-filter="all">All types</button>
        ${CATEGORIES.map(
          (cat) => `
          <button class="chip ${active === cat.id ? "active" : ""}" type="button" data-filter="${cat.id}">
            ${escapeHtml(cat.name)}
          </button>
        `
        ).join("")}
      </div>
    </div>
    ${catalogHtml}
  `;

  document.getElementById("back-categories").addEventListener("click", () => {
    setView("categories");
  });

  app.querySelectorAll("[data-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.getAttribute("data-filter");
      savePreferred(filter);
      setView("shop", { category: filter });
    });
  });

  bindAddToCartButtons();
  bindAddBookForms();
}

function renderCart() {
  topbar.hidden = false;
  welcomeText.textContent = `Cart for ${state.user.name}`;
  updateCartCount();

  if (state.cart.length === 0) {
    app.innerHTML = `
      <div class="panel empty">
        <h2 class="section-title">Your cart is empty</h2>
        <p>Choose a book type and add titles from the house shelf.</p>
        <button class="primary-btn" id="go-shop" type="button" style="margin-top:1rem">Browse books</button>
      </div>
    `;
    document.getElementById("go-shop").addEventListener("click", () => {
      setView("categories");
    });
    return;
  }

  const subtotal = cartSubtotal();
  const shipping = subtotal >= 40 ? 0 : 3.5;
  const total = subtotal + shipping;

  app.innerHTML = `
    <div class="section-head">
      <div>
        <h2 class="section-title">Your cart</h2>
        <p>Review selected books, then continue to secure card payment.</p>
      </div>
      <button class="secondary-btn" id="keep-shopping" type="button">Keep shopping</button>
    </div>
    <div class="cart-layout">
      <div class="panel cart-list">
        ${state.cart
          .map((item) => {
            const book = getBookById(item.id);
            if (!book) return "";
            const cat = categoryById(book.category);
            return `
              <div class="cart-item">
                <div>
                  <h3 style="margin:0;font-family:var(--font-display)">${escapeHtml(book.title)}</h3>
                  <p class="meta">${escapeHtml(cat?.name || "")} · ${escapeHtml(book.author)}</p>
                  <p class="price">${money(book.price)}</p>
                  <div class="qty" style="margin-top:0.55rem">
                    <button type="button" data-dec="${book.id}" aria-label="Decrease quantity">−</button>
                    <span>${item.qty}</span>
                    <button type="button" data-inc="${book.id}" aria-label="Increase quantity">+</button>
                  </div>
                </div>
                <div style="text-align:right">
                  <p class="price">${money(book.price * item.qty)}</p>
                  <button class="ghost-btn" type="button" data-remove="${book.id}">Remove</button>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
      <aside class="panel summary-card">
        <h3 style="margin-top:0;font-family:var(--font-display)">Order summary</h3>
        <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? "Free" : money(shipping)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${money(total)}</span></div>
        <p class="hint">Free shipping on orders $40+.</p>
        <button class="primary-btn" id="to-payment" type="button" style="width:100%;margin-top:1rem">Proceed to payment</button>
      </aside>
    </div>
  `;

  document.getElementById("keep-shopping").addEventListener("click", () => {
    setView("shop", { category: state.preferredCategory || "all" });
  });
  document.getElementById("to-payment").addEventListener("click", () => {
    setView("payment");
  });
  app.querySelectorAll("[data-inc]").forEach((btn) => {
    btn.addEventListener("click", () => updateQty(btn.getAttribute("data-inc"), 1));
  });
  app.querySelectorAll("[data-dec]").forEach((btn) => {
    btn.addEventListener("click", () => updateQty(btn.getAttribute("data-dec"), -1));
  });
  app.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.getAttribute("data-remove")));
  });
}

function renderPayment() {
  topbar.hidden = false;
  welcomeText.textContent = `Checkout · ${state.user.email}`;
  updateCartCount();

  if (state.cart.length === 0) {
    setView("cart");
    return;
  }

  const subtotal = cartSubtotal();
  const shipping = subtotal >= 40 ? 0 : 3.5;
  const total = subtotal + shipping;

  app.innerHTML = `
    <div class="section-head">
      <div>
        <h2 class="section-title">Payment</h2>
        <p>Enter card details to complete your purchase. A receipt will be emailed to your Gmail.</p>
      </div>
      <button class="secondary-btn" id="back-cart" type="button">Back to cart</button>
    </div>
    <div class="pay-layout">
      <form class="panel pay-card" id="pay-form">
        <div class="form-stack">
          <label>
            Name on card
            <input id="card-name" type="text" placeholder="${escapeHtml(state.user.name)}" required autocomplete="cc-name" />
          </label>
          <label>
            Card number
            <input id="card-number" type="text" inputmode="numeric" placeholder="4242 4242 4242 4242" required autocomplete="cc-number" />
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
            <label>
              Expiry (MM/YY)
              <input id="card-expiry" type="text" inputmode="numeric" placeholder="12/28" required autocomplete="cc-exp" />
            </label>
            <label>
              CVV
              <input id="card-cvv" type="password" inputmode="numeric" placeholder="123" maxlength="4" required autocomplete="cc-csc" />
            </label>
          </div>
          <label>
            Billing ZIP / postal code
            <input id="card-zip" type="text" placeholder="94105" required autocomplete="postal-code" />
          </label>
          <p class="form-error" id="pay-error" hidden></p>
          <button class="primary-btn" id="pay-submit" type="submit">Pay ${money(total)}</button>
          <p class="hint">Demo checkout: use any valid-format card number (for example 4242 4242 4242 4242). No real charge is made.</p>
        </div>
      </form>
      <aside class="panel summary-card">
        <h3 style="margin-top:0;font-family:var(--font-display)">Paying as</h3>
        <p class="meta">${escapeHtml(state.user.name)}<br>${escapeHtml(state.user.email)}</p>
        <div class="summary-row"><span>Items</span><span>${cartCount()}</span></div>
        <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? "Free" : money(shipping)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${money(total)}</span></div>
      </aside>
    </div>
  `;

  document.getElementById("back-cart").addEventListener("click", () => setView("cart"));

  const cardNumber = document.getElementById("card-number");
  const cardExpiry = document.getElementById("card-expiry");
  cardNumber.addEventListener("input", () => {
    cardNumber.value = formatCardNumber(cardNumber.value);
  });
  cardExpiry.addEventListener("input", () => {
    cardExpiry.value = formatExpiry(cardExpiry.value);
  });

  document.getElementById("pay-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const errorEl = document.getElementById("pay-error");
    const payBtn = document.getElementById("pay-submit");
    const nameOnCard = document.getElementById("card-name").value.trim();
    const number = document.getElementById("card-number").value;
    const expiry = document.getElementById("card-expiry").value.trim();
    const cvv = onlyDigits(document.getElementById("card-cvv").value);
    const zip = document.getElementById("card-zip").value.trim();

    if (nameOnCard.length < 2) {
      errorEl.hidden = false;
      errorEl.textContent = "Enter the name printed on the card.";
      return;
    }
    if (!luhnCheck(number)) {
      errorEl.hidden = false;
      errorEl.textContent = "Enter a valid card number.";
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      errorEl.hidden = false;
      errorEl.textContent = "Use expiry format MM/YY.";
      return;
    }
    const [mm, yy] = expiry.split("/").map(Number);
    if (mm < 1 || mm > 12) {
      errorEl.hidden = false;
      errorEl.textContent = "Expiry month must be between 01 and 12.";
      return;
    }
    const expDate = new Date(2000 + yy, mm);
    if (expDate <= new Date()) {
      errorEl.hidden = false;
      errorEl.textContent = "This card looks expired.";
      return;
    }
    if (cvv.length < 3) {
      errorEl.hidden = false;
      errorEl.textContent = "Enter a valid CVV.";
      return;
    }
    if (zip.length < 3) {
      errorEl.hidden = false;
      errorEl.textContent = "Enter a billing ZIP / postal code.";
      return;
    }

    const items = state.cart.map((item) => {
      const book = getBookById(item.id);
      return {
        id: book.id,
        title: book.title,
        price: book.price,
        qty: item.qty,
        category: book.category,
      };
    });

    const order = {
      id: `MBS-${Date.now().toString().slice(-8)}`,
      customerName: state.user.name,
      customerEmail: state.user.email,
      items,
      subtotal,
      shipping,
      total,
      cardLast4: onlyDigits(number).slice(-4),
      paidAt: new Date().toLocaleString(),
    };

    payBtn.disabled = true;
    payBtn.textContent = "Processing & emailing receipt...";

    const emailResult = await sendReceiptEmail(order);
    order.emailStatus = emailResult.status;
    order.emailOk = emailResult.ok;
    state.emailStatus = emailResult.status;

    saveLastOrder(order);
    state.cart = [];
    saveCart();
    setView("success");
  });
}

function renderSuccess() {
  topbar.hidden = false;
  welcomeText.textContent = `Order complete`;
  updateCartCount();

  const order = state.lastOrder;
  if (!order) {
    setView("categories");
    return;
  }

  const emailNote =
    order.emailStatus ||
    state.emailStatus ||
    "Receipt send status unavailable. Use Resend below.";

  app.innerHTML = `
    <section class="panel success-wrap">
      <div class="success-badge">✓</div>
      <h2 class="section-title">Payment successful</h2>
      <p>Thank you, ${escapeHtml(order.customerName)}. Receipt destination: <strong>${escapeHtml(order.customerEmail)}</strong>.</p>
      <p class="email-status ${order.emailOk ? "ok" : "warn"}">${escapeHtml(emailNote)}</p>
      <div class="receipt-box">
        <div class="receipt-row"><span>Order ID</span><span>${escapeHtml(order.id)}</span></div>
        <div class="receipt-row"><span>Paid at</span><span>${escapeHtml(order.paidAt)}</span></div>
        ${order.items
          .map(
            (item) => `
          <div class="receipt-row">
            <span>${escapeHtml(item.title)} × ${item.qty}</span>
            <span>${money(item.price * item.qty)}</span>
          </div>
        `
          )
          .join("")}
        <div class="receipt-row"><span>Shipping</span><span>${order.shipping === 0 ? "Free" : money(order.shipping)}</span></div>
        <div class="receipt-row total"><span>Total paid</span><span>${money(order.total)}</span></div>
        <div class="receipt-row"><span>Card</span><span>•••• ${escapeHtml(order.cardLast4)}</span></div>
      </div>
      <div style="display:flex;gap:0.6rem;justify-content:center;flex-wrap:wrap;margin-top:1.2rem">
        <button class="primary-btn" id="resend-receipt" type="button">Resend receipt to Gmail</button>
        <button class="secondary-btn" id="shop-again" type="button">Shop again</button>
      </div>
      <p class="hint" id="resend-status"></p>
    </section>
  `;

  document.getElementById("resend-receipt").addEventListener("click", async () => {
    const btn = document.getElementById("resend-receipt");
    const statusEl = document.getElementById("resend-status");
    btn.disabled = true;
    btn.textContent = "Sending...";
    const result = await sendReceiptEmail(order);
    order.emailOk = result.ok;
    order.emailStatus = result.status;
    saveLastOrder(order);
    statusEl.textContent = result.status;
    statusEl.className = `hint ${result.ok ? "ok" : "warn"}`;
    btn.disabled = false;
    btn.textContent = "Resend receipt to Gmail";
  });
  document.getElementById("shop-again").addEventListener("click", () => {
    setView("categories");
  });
}

function render() {
  if (!state.user && state.view !== "login") {
    state.view = "login";
  }

  switch (state.view) {
    case "categories":
      renderCategories();
      break;
    case "shop":
      renderShop();
      break;
    case "cart":
      renderCart();
      break;
    case "payment":
      renderPayment();
      break;
    case "success":
      renderSuccess();
      break;
    case "login":
    default:
      renderLogin();
      break;
  }
}

document.getElementById("nav-shop").addEventListener("click", () => {
  requireAuth("categories");
});
document.getElementById("nav-cart").addEventListener("click", () => {
  requireAuth("cart");
});
document.getElementById("nav-logout").addEventListener("click", logout);

loadState();
if (state.user) {
  state.view = "categories";
}
render();
