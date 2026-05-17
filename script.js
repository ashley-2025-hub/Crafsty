import { db } from "./firebase-config.js";

import {
  collection,
  onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================================
   DATA
========================================= */

let products = [];

let cart =
  JSON.parse(
    localStorage.getItem("cart")
  ) || [];

/* =========================================
   ELEMENTS
========================================= */

const catalog =
  document.querySelector(".catalog");

const cartList =
  document.getElementById("cart");

const totalEl =
  document.getElementById("total");

const suggestionList =
  document.getElementById("suggestionList");

const emptyText =
  document.getElementById("empty");

const orderData =
  document.getElementById("orderData");

const totalData =
  document.getElementById("totalData");

const canvas =
  document.getElementById("canvas");

const variantPanel =
  document.getElementById("variantPanel");

/* =========================================
   SAFE CHECK
========================================= */

if (variantPanel) {

  variantPanel.style.display = "none";
}

/* =========================================
   HELPERS
========================================= */

function getProductPath(folder) {

  return `assets/products/${folder}`;
}

function getCover(folder) {

  return `${getProductPath(folder)}/cover.png`;
}

function getEmoji(folder) {

  return `${getProductPath(folder)}/emoji.png`;
}

/* =========================================
   SAVE
========================================= */

function saveCart() {

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );
}

/* =========================================
   THEME
========================================= */

function saveTheme(main, sub) {

  localStorage.setItem(
    "theme",
    JSON.stringify({
      main,
      sub
    })
  );
}

function applyTheme(main, sub) {

  const root =
    document.documentElement;

  root.style.setProperty(
    "--main-bg",
    main
  );

  root.style.setProperty(
    "--card-bg",
    sub
  );

  document.body.style.background =
    main;
}

function loadSavedTheme() {

  const savedTheme =
    JSON.parse(
      localStorage.getItem("theme")
    );

  if (!savedTheme) return;

  applyTheme(
    savedTheme.main,
    savedTheme.sub
  );
}

/* =========================================
   NAVIGATION
========================================= */

window.showSection =
  function(section) {

    const shop =
      document.getElementById(
        "shopSection"
      );

    const catalogSection =
      document.getElementById(
        "catalogSection"
      );

    if (
      !shop ||
      !catalogSection
    ) return;

    if (section === "shop") {

      shop.style.display =
        "block";

      catalogSection.style.display =
        "none";

    } else {

      shop.style.display =
        "none";

      catalogSection.style.display =
        "block";
    }
  };

window.changeTheme =
  function(main, sub) {

    applyTheme(main, sub);

    saveTheme(main, sub);
  };

/* =========================================
   FIREBASE
========================================= */

onSnapshot(

  collection(db, "products"),

  (snapshot) => {

    products =
      snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()
      }));

    renderCatalog();

    renderSuggestions();

    renderCart();

    renderBox();
  },

  (error) => {

    console.error(
      "Firebase Error:",
      error
    );
  }
);

/* =========================================
   CART
========================================= */

function addItem(product) {

  const existing =
    cart.find(
      item =>
        item.id === product.id
    );

  const sticker = {

    x: 40 + Math.random() * 120,

    y: 40 + Math.random() * 120,

    mainVariant: null,

    subVariant: null,

    image:
      getEmoji(product.folder)
  };

  if (existing) {

    existing.quantity++;

    existing.stickers.push(
      sticker
    );

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      folder: product.folder,

      price:
        Number(product.price),

      coverImage:
        getCover(product.folder),

      emojiImage:
        getEmoji(product.folder),

      quantity: 1,

      stickers: [sticker]
    });
  }

  saveCart();

  renderCart();

  renderSuggestions();

  renderBox();
}

function removeItem(id) {

  const item =
    cart.find(
      i => i.id === id
    );

  if (!item) return;

  item.quantity--;

  item.stickers.pop();

  if (item.quantity <= 0) {

    cart =
      cart.filter(
        i => i.id !== id
      );
  }

  saveCart();

  renderCart();

  renderSuggestions();

  renderBox();
}

window.clearCart =
  function() {

    cart = [];

    saveCart();

    renderCart();

    renderSuggestions();

    renderBox();
  };

/* =========================================
   CATALOG
========================================= */

function renderCatalog() {

  if (!catalog) return;

  catalog.innerHTML = "";

  products.forEach(product => {

    const card =
      document.createElement("div");

    card.className =
      "catalog-card";

    card.innerHTML = `

      <img
        src="${getCover(product.folder)}"
        alt="${product.name}"
      >

      <div class="catalog-info">

        <h3>
          ${product.name}
        </h3>

        <p>
          ${Number(product.price)
            .toLocaleString()}
          VND
        </p>

      </div>
    `;

    card.addEventListener(
      "click",
      () => {

        window.location.href =
          `product.html?id=${product.id}`;
      }
    );

    catalog.appendChild(card);
  });
}

/* =========================================
   SUGGESTIONS
========================================= */

function renderSuggestions() {

  if (!suggestionList) return;

  suggestionList.innerHTML = "";

  products

    .filter(product =>

      !cart.some(
        c => c.id === product.id
      )
    )

    .slice(0, 4)

    .forEach(product => {

      const div =
        document.createElement("div");

      div.className =
        "suggest-card";

      div.innerHTML = `

        <img
          src="${getCover(product.folder)}"
        >

        <p>
          ${product.name}
        </p>
      `;

      div.addEventListener(
        "click",
        () => addItem(product)
      );

      suggestionList.appendChild(div);
    });
}

/* =========================================
   CART UI
========================================= */

function renderCart() {

  if (!cartList) return;

  cartList.innerHTML = "";

  if (emptyText) {

    emptyText.style.display =

      cart.length === 0
        ? "block"
        : "none";
  }

  let total = 0;

  cart.forEach(item => {

    total +=
      item.price *
      item.quantity;

    const li =
      document.createElement("li");

    li.innerHTML = `

      <div class="cart-left">

        <img
          class="cart-img"
          src="${getCover(item.folder)}"
        >

        <span>
          ${item.name}
        </span>

      </div>

      <div class="cart-controls">

        <button class="minus-btn">
          −
        </button>

        <span>
          ${item.quantity}
        </span>

        <button class="plus-btn">
          +
        </button>

      </div>
    `;

    li.querySelector(
      ".minus-btn"
    ).addEventListener(
      "click",
      () => removeItem(item.id)
    );

    li.querySelector(
      ".plus-btn"
    ).addEventListener(
      "click",
      () => {

        const product =
          products.find(
            p => p.id === item.id
          );

        if (product) {

          addItem(product);
        }
      }
    );

    cartList.appendChild(li);
  });

  if (totalEl) {

    totalEl.innerText =
      total.toLocaleString();
  }

  if (orderData) {

    orderData.value =
      cart.map(item =>

        `${item.name} x${item.quantity}`

      ).join(" | ");
  }

  if (totalData) {

    totalData.value =
      total.toLocaleString() +
      " VND";
  }
}

/* =========================================
   VARIANT PANEL
========================================= */

function openVariantPanel(
  sticker,
  item,
  x,
  y
) {

  if (!variantPanel) return;

  variantPanel.innerHTML = "";

  variantPanel.style.display =
    "flex";

  variantPanel.style.position =
    "fixed";

  variantPanel.style.left =
    x + "px";

  variantPanel.style.top =
    y + "px";

  variantPanel.style.zIndex =
    "999999";

  for (
    let i = 1;
    i <= 20;
    i++
  ) {

    const img =
      document.createElement("img");

    img.src =
      `assets/products/${item.folder}/icon/${i}.png`;

    img.style.width =
      "45px";

    img.style.height =
      "45px";

    img.style.cursor =
      "pointer";

    img.onerror =
      () => {

        img.remove();
      };

    img.addEventListener(
      "click",
      () => {

        sticker.mainVariant =
          i;

        saveCart();

        renderBox();

        variantPanel.style.display =
          "none";
      }
    );

    variantPanel.appendChild(img);
  }
}

/* =========================================
   BOX
========================================= */

function renderBox() {

  if (!canvas) return;

  canvas.innerHTML = "";

  cart.forEach(item => {

    item.stickers.forEach(sticker => {

      const wrap =
        document.createElement("div");

      wrap.className =
        "sticker";

      wrap.style.left =
        sticker.x + "px";

      wrap.style.top =
        sticker.y + "px";

      wrap.addEventListener(
        "dblclick",
        (e) => {

          e.stopPropagation();

          openVariantPanel(
            sticker,
            item,
            e.clientX,
            e.clientY
          );
        }
      );

      const mainImg =
        document.createElement("img");

      mainImg.className =
        "sticker-main";

      let imagePath =
        sticker.image ||
        item.emojiImage;

      if (
        sticker.mainVariant
      ) {

        imagePath =
          `assets/products/${item.folder}/icon/${sticker.mainVariant}.png`;
      }

      mainImg.src =
        imagePath;

      wrap.appendChild(mainImg);

      if (
        sticker.subVariant
      ) {

        const subImg =
          document.createElement("img");

        subImg.className =
          "sticker-sub";

        subImg.src =
          `assets/products/${item.folder}/icon/sub/${sticker.subVariant}.png`;

        wrap.appendChild(subImg);
      }

      enableDragging(
        wrap,
        sticker,
        item
      );

      canvas.appendChild(wrap);
    });
  });
}

/* =========================================
   DRAGGING
========================================= */

function enableDragging(
  el,
  sticker,
  item
) {

  const bin =
    document.getElementById("bin");

  let dragging = false;

  let startX = 0;

  let startY = 0;

  let initialX = 0;

  let initialY = 0;

  let currentX = 0;

  let currentY = 0;

  el.addEventListener(
    "pointerdown",
    (e) => {

      dragging = true;

      startX =
        e.clientX;

      startY =
        e.clientY;

      initialX =
        sticker.x;

      initialY =
        sticker.y;

      currentX =
        sticker.x;

      currentY =
        sticker.y;

      el.classList.add(
        "dragging"
      );

      el.setPointerCapture(
        e.pointerId
      );
    }
  );

  el.addEventListener(
    "pointermove",
    (e) => {

      if (!dragging) return;

      const dx =
        e.clientX - startX;

      const dy =
        e.clientY - startY;

      currentX =
        initialX + dx;

      currentY =
        initialY + dy;

      el.style.left =
        currentX + "px";

      el.style.top =
        currentY + "px";

      if (bin) {

        const binRect =
          bin.getBoundingClientRect();

        const rect =
          el.getBoundingClientRect();

        const touching =

          rect.right >
            binRect.left &&

          rect.left <
            binRect.right &&

          rect.bottom >
            binRect.top &&

          rect.top <
            binRect.bottom;

        if (touching) {

          bin.classList.add(
            "bin-active"
          );

        } else {

          bin.classList.remove(
            "bin-active"
          );
        }
      }
    }
  );

  function stopDragging() {

    if (!dragging) return;

    dragging = false;

    el.classList.remove(
      "dragging"
    );

    sticker.x =
      currentX;

    sticker.y =
      currentY;

    saveCart();

    if (bin) {

      bin.classList.remove(
        "bin-active"
      );
    }
  }

  el.addEventListener(
    "pointerup",
    stopDragging
  );

  el.addEventListener(
    "pointercancel",
    stopDragging
  );
}

/* =========================================
   CLOSE PANEL
========================================= */

document.addEventListener(
  "click",
  (e) => {

    if (
      variantPanel &&
      !e.target.closest("#variantPanel") &&
      !e.target.closest(".sticker")
    ) {

      variantPanel.style.display =
        "none";
    }
  }
);

/* =========================================
   INIT
========================================= */

loadSavedTheme();

renderCart();

renderSuggestions();

renderBox();
