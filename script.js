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

let activeSticker = null;

let activeItem = null;

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
   BOX COLOR
========================================= */

window.changeSelectedColor =
  function(color) {

    const colors = {

      Pink: "#ffd4e5",

      Blue: "#cfe7ff",

      Purple: "#e6d5ff",

      Brown: "#c99662"
    };

    if (
      canvas &&
      colors[color]
    ) {

      canvas.style.background =
        colors[color];
    }
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

    x: 70,

    y: 70,

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

    card.onclick =
      () => {

        addItem(product);
      };

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

      div.onclick =
        () => addItem(product);

      suggestionList.appendChild(div);
    });
}

/* =========================================
   CART UI
========================================= */

function renderCart() {

  if (!cartList) return;

  cartList.innerHTML = "";

  emptyText.style.display =

    cart.length === 0
      ? "block"
      : "none";

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
    ).onclick =
      () => removeItem(item.id);

    li.querySelector(
      ".plus-btn"
    ).onclick =
      () => {

        const product =
          products.find(
            p => p.id === item.id
          );

        if (product) {

          addItem(product);
        }
      };

    cartList.appendChild(li);
  });

  totalEl.innerText =
    total.toLocaleString();

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

function closeVariantPanel() {

  if (!variantPanel) return;

  variantPanel.classList.remove(
    "show"
  );

  variantPanel.innerHTML = "";

  activeSticker = null;

  activeItem = null;
}

function openVariantPanel(
  sticker,
  item
) {

  if (!variantPanel) return;

  activeSticker =
    sticker;

  activeItem =
    item;

  variantPanel.innerHTML = "";

  /* TITLE */

  const title =
    document.createElement("p");

  title.className =
    "variant-title";

  title.innerText =
    "Choose Style";

  variantPanel.appendChild(
    title
  );

  /* OPTIONS */

  const options =
    document.createElement("div");

  options.className =
    "variant-options";

  variantPanel.appendChild(
    options
  );

  for (
    let i = 1;
    i <= 20;
    i++
  ) {

    const btn =
      document.createElement("button");

    btn.className =
      "variant-btn";

    const img =
      document.createElement("img");

    img.src =
      `assets/products/${item.folder}/icon/${i}.png`;

    img.onerror =
      () => {

        btn.remove();
      };

    btn.appendChild(img);

    btn.onclick =
      () => {

        sticker.mainVariant =
          i;

        saveCart();

        renderBox();

        closeVariantPanel();
      };

    options.appendChild(btn);
  }

  variantPanel.classList.add(
    "show"
  );
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

      /* CLICK */

      wrap.addEventListener(
        "click",
        (e) => {

          e.stopPropagation();

          openVariantPanel(
            sticker,
            item
          );
        }
      );

      /* MAIN IMAGE */

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

      /* SUB IMAGE */

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

      dragging = false;

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

      el.setPointerCapture(
        e.pointerId
      );
    }
  );

  el.addEventListener(

    "pointermove",

    (e) => {

      const dx =
        e.clientX - startX;

      const dy =
        e.clientY - startY;

      if (
        Math.abs(dx) > 5 ||
        Math.abs(dy) > 5
      ) {

        dragging = true;
      }

      if (!dragging) return;

      el.classList.add(
        "dragging"
      );

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

    const canvasRect =
      canvas.getBoundingClientRect();

    const rect =
      el.getBoundingClientRect();

    const binRect =
      bin.getBoundingClientRect();

    /* BIN */

    const droppedOnBin =

      rect.right >
        binRect.left &&

      rect.left <
        binRect.right &&

      rect.bottom >
        binRect.top &&

      rect.top <
        binRect.bottom;

    if (droppedOnBin) {

      item.stickers =
        item.stickers.filter(
          s => s !== sticker
        );

      item.quantity =
        item.stickers.length;

      if (
        item.quantity <= 0
      ) {

        cart =
          cart.filter(
            c =>
              c.id !== item.id
          );
      }

      saveCart();

      renderCart();

      renderBox();

      bin.classList.remove(
        "bin-active"
      );

      return;
    }

    /* KEEP INSIDE */

    const overlapX =

      Math.max(
        0,

        Math.min(
          rect.right,
          canvasRect.right
        ) -

        Math.max(
          rect.left,
          canvasRect.left
        )
      );

    const overlapY =

      Math.max(
        0,

        Math.min(
          rect.bottom,
          canvasRect.bottom
        ) -

        Math.max(
          rect.top,
          canvasRect.top
        )
      );

    const overlapArea =
      overlapX * overlapY;

    const stickerArea =
      rect.width * rect.height;

    const overlapRatio =
      overlapArea /
      stickerArea;

    if (overlapRatio >= 0.33) {

      sticker.x =
        currentX;

      sticker.y =
        currentY;

      saveCart();

    } else {

      el.style.left =
        sticker.x + "px";

      el.style.top =
        sticker.y + "px";
    }

    bin.classList.remove(
      "bin-active"
    );

    el.style.zIndex =
      "1";
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
      !variantPanel.contains(e.target) &&
      !e.target.closest(".sticker")
    ) {

      closeVariantPanel();
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
