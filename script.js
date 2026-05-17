import { db } from "./firebase-config.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* =========================================
   DATA
========================================= */

let products = [];

let cart =
  JSON.parse(localStorage.getItem("cart")) || [];

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
   SAVE CART
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

  if (savedTheme) {

    applyTheme(
      savedTheme.main,
      savedTheme.sub
    );
  }
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
      i => i.id === product.id
    );

  const sticker = {

    x: 40 + Math.random() * 110,

    y: 40 + Math.random() * 110,

    /* DEFAULT STICKER */

    mainVariant: null,

    subVariant: null,

    /* DEFAULT IMAGE */

    image:
      `assets/products/${product.folder}/emoji.png`
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
        `assets/products/${product.folder}/cover.png`,

      emojiImage:
        `assets/products/${product.folder}/emoji.png`,

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
          alt="${product.name}"
        >

        <p>
          ${product.name}
        </p>
      `;

      div.onclick = () =>
        addItem(product);

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
    ).onclick = () =>
      removeItem(item.id);

    li.querySelector(
      ".plus-btn"
    ).onclick = () => {

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

      /* STICKER CONTAINER */

      const stickerWrap =
        document.createElement("div");

      stickerWrap.className =
        "sticker";

      stickerWrap.style.left =
        sticker.x + "px";

      stickerWrap.style.top =
        sticker.y + "px";

      /* MAIN IMAGE */

      const mainImg =
        document.createElement("img");

      mainImg.className =
        "sticker-main";

      /* DEFAULT */

      let imagePath =
        sticker.image ||
        item.emojiImage;

      /* MAIN VARIANT */

      if (
        sticker.mainVariant
      ) {

        imagePath =
          `assets/products/${item.folder}/icon/${sticker.mainVariant}.png`;
      }

      mainImg.src =
        imagePath;

      stickerWrap.appendChild(
        mainImg
      );

      /* SUB OVERLAY */

      if (
        sticker.subVariant
      ) {

        const subImg =
          document.createElement("img");

        subImg.className =
          "sticker-sub";

        subImg.src =
          `assets/products/${item.folder}/icon/sub/${sticker.subVariant}.png`;

        stickerWrap.appendChild(
          subImg
        );
      }

      /* DRAGGING */

      enableDragging(
        stickerWrap,
        sticker
      );

      canvas.appendChild(
        stickerWrap
      );
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

      el.style.zIndex =
        "999";

      el.style.cursor =
        "grabbing";

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

      el.style.zIndex =
        "1";

      el.style.cursor =
        "grab";

      const canvasRect =
        canvas.getBoundingClientRect();

      const binRect =
        bin.getBoundingClientRect();

      const stickerRect =
        el.getBoundingClientRect();

      /* DROP ON BIN */

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

      /* OUTSIDE BOX */

      const insideBox =

        stickerRect.left >=
          canvasRect.left &&

        stickerRect.right <=
          canvasRect.right &&

        stickerRect.top >=
          canvasRect.top &&

        stickerRect.bottom <=
          canvasRect.bottom;

      if (!insideBox) {

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

      } else {

        /* SAVE POSITION */

        sticker.x =
          latestX;

        sticker.y =
          latestY;

        saveCart();
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

/* =========================================
   INIT
========================================= */

loadSavedTheme();

renderCart();

renderSuggestions();

renderBox();
