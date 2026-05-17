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

    x: 40 + Math.random() * 180,

    y: 40 + Math.random() * 180,

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

        window.location.href =
          `product.html?id=${product.id}`;
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

      /* MAIN */

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

      /* SUB */

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
  sticker
) {

  const bin =
    document.getElementById("bin");

  let dragging = false;

  let startX = 0;

  let startY = 0;

  let initialX = 0;

  let initialY = 0;

  let latestX = 0;

  let latestY = 0;

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

      latestX =
        sticker.x;

      latestY =
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

      latestX =
        initialX + dx;

      latestY =
        initialY + dy;

      el.style.left =
        latestX + "px";

      el.style.top =
        latestY + "px";

      /* BIN DETECTION */

      if (bin) {

        const binRect =
          bin.getBoundingClientRect();

        const stickerRect =
          el.getBoundingClientRect();

        const touchingBin =

          !(
            stickerRect.right <
              binRect.left ||

            stickerRect.left >
              binRect.right ||

            stickerRect.bottom <
              binRect.top ||

            stickerRect.top >
              binRect.bottom
          );

        if (touchingBin) {

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

  const stopDragging =
    () => {

      if (!dragging) return;

      dragging = false;

      el.classList.remove(
        "dragging"
      );

      const canvasRect =
        canvas.getBoundingClientRect();

      const binRect =
        bin.getBoundingClientRect();

      const stickerRect =
        el.getBoundingClientRect();

      /* =========================
         DROP ON BIN
      ========================= */

      const droppedOnBin =

        !(
          stickerRect.right <
            binRect.left ||

          stickerRect.left >
            binRect.right ||

          stickerRect.bottom <
            binRect.top ||

          stickerRect.top >
            binRect.bottom
        );

      if (droppedOnBin) {

        cart.forEach(item => {

          item.stickers =
            item.stickers.filter(
              s => s !== sticker
            );

          item.quantity =
            item.stickers.length;
        });

        cart =
          cart.filter(
            item =>
              item.quantity > 0
          );

        saveCart();

        renderCart();

        renderBox();

        bin.classList.remove(
          "bin-active"
        );

        return;
      }

      /* =========================
         ALLOW 1/3 INSIDE BOX
      ========================= */

      const overlapX =

        Math.max(
          0,

          Math.min(
            stickerRect.right,
            canvasRect.right
          ) -

          Math.max(
            stickerRect.left,
            canvasRect.left
          )
        );

      const overlapY =

        Math.max(
          0,

          Math.min(
            stickerRect.bottom,
            canvasRect.bottom
          ) -

          Math.max(
            stickerRect.top,
            canvasRect.top
          )
        );

      const overlapArea =
        overlapX * overlapY;

      const stickerArea =
        stickerRect.width *
        stickerRect.height;

      const overlapRatio =
        overlapArea /
        stickerArea;

      /* =========================
         ACCEPT DROP
      ========================= */

      if (overlapRatio >= 0.33) {

        const relativeX =

          latestX;

        const relativeY =

          latestY;

        sticker.x =
          relativeX;

        sticker.y =
          relativeY;

        saveCart();

      } else {

        /* SNAP BACK */

        el.style.transition =
          "0.25s ease";

        el.style.left =
          sticker.x + "px";

        el.style.top =
          sticker.y + "px";

        setTimeout(() => {

          el.style.transition =
            "";

        }, 250);
      }

      bin.classList.remove(
        "bin-active"
      );
    };

  el.addEventListener(
    "pointerup",
    stopDragging
  );

  el.addEventListener(
    "pointercancel",
    stopDragging
  );
}

      /* BIN */

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

    const canvasRect =
      canvas.getBoundingClientRect();

    const rect =
      el.getBoundingClientRect();

    const binRect =
      bin.getBoundingClientRect();

    /* DELETE */

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

    /* INSIDE */

    const inside =

      rect.left >=
        canvasRect.left &&

      rect.right <=
        canvasRect.right &&

      rect.top >=
        canvasRect.top &&

      rect.bottom <=
        canvasRect.bottom;

    if (inside) {

      sticker.x =
        currentX;

      sticker.y =
        currentY;

      saveCart();

    } else {

      /* SNAP BACK */

      el.style.transition =
        "0.25s";

      el.style.left =
        sticker.x + "px";

      el.style.top =
        sticker.y + "px";

      setTimeout(() => {

        el.style.transition =
          "";

      }, 250);
    }

    bin.classList.remove(
      "bin-active"
    );

    el.style.cursor =
      "grab";

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
   INIT
========================================= */

loadSavedTheme();

renderCart();

renderSuggestions();

renderBox();
