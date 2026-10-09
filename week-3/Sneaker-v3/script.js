
// ========================================
// ADAPTIVE SHOE - WEEK 3
// INTERACTIVE MOBILE PROTOTYPE
// ========================================

// STATE

let cushion = 64;
let arch = 72;
let battery = 46;

let dialMode = "cushion";
let currentPage = 0;

let isCharging = false;
let chargingTimer = null;

// ELEMENTS

const carouselWindow =
  document.getElementById("carouselWindow");

const carouselTrack =
  document.getElementById("carouselTrack");

const cards = Array.from(
  document.querySelectorAll(".card")
);

const tabs = document.querySelectorAll(".tab");
const dots = document.querySelectorAll(".dot");

const mainDial = document.getElementById("mainDial");
const dialProgress = document.getElementById("dialProgress");
const dialHandle = document.getElementById("dialHandle");

const cushionSlider =
  document.getElementById("cushionSlider");

const archSlider =
  document.getElementById("archSlider");

const parameterButtons =
  document.querySelectorAll(".parameter");

const chargeButton =
  document.getElementById("chargeButton");

// ========================================
// SIMULATED DEVICE
// ========================================

function fakeDevice(action, value) {

  if (action === "cushion") {
    cushion = Math.max(
      0,
      Math.min(100, Math.round(value))
    );
  }

  if (action === "arch") {
    arch = Math.max(
      0,
      Math.min(100, Math.round(value))
    );
  }

  if (action === "connect") {
    isCharging = battery < 100;
  }

  if (action === "disconnect") {
    isCharging = false;
  }

  updateUI();
}

// ========================================
// UPDATE ALL INTERFACE ELEMENTS
// ========================================

function updateUI() {

  // Main support card

  document.getElementById("mainCushion")
    .textContent = cushion;

  document.getElementById("mainArch")
    .textContent = arch;

  // Adjustment values

  document.getElementById("cushionNumber")
    .textContent = cushion;

  document.getElementById("archNumber")
    .textContent = arch;

  cushionSlider.value = cushion;
  archSlider.value = arch;

  // Cushion feedback

  let cushionMessage;

  if (cushion < 30) {
    cushionMessage = "SOFT CUSHIONING";
  } else if (cushion < 70) {
    cushionMessage = "BALANCED COMFORT";
  } else {
    cushionMessage = "FIRM CUSHIONING";
  }

  document.getElementById("cushionFeedback")
    .textContent = cushionMessage;

  // Arch feedback

  let archMessage;

  if (arch < 30) {
    archMessage = "LOW ARCH SUPPORT";
  } else if (arch < 70) {
    archMessage = "MEDIUM ARCH SUPPORT";
  } else {
    archMessage = "HIGH ARCH SUPPORT";
  }

  document.getElementById("archFeedback")
    .textContent = archMessage;

  // Arch curve graphic
  // Larger arch value = taller curve

  const archDepth = 105 - arch * 1.05;

  document.getElementById("archShape")
    .setAttribute(
      "d",
      `M 10 110 Q 150 ${archDepth} 290 110`
    );

  // Cushion bar visualization

  const bars = document.querySelectorAll(
    "#cushionBars div"
  );

  bars.forEach(function(bar, index) {

    const height =
      15 + (cushion / 100) * (25 + index * 5);

    bar.style.height = height + "%";
  });

  updateDial();
  updateChargingUI();
}

// ========================================
// INTERACTIVE SUPPORT DIAL
// ========================================

// The circular dial has a radius of 116
// inside a 300 x 300 SVG.

const dialRadius = 116;
const circumference = 2 * Math.PI * dialRadius;

function updateDial() {

  const value =
    dialMode === "cushion" ? cushion : arch;

  document.getElementById("dialType")
    .textContent =
      dialMode === "cushion"
        ? "CUSHIONING"
        : "ARCH SUPPORT";

  document.getElementById("dialValue")
    .textContent = value;

  let description = "BALANCED";

  if (value < 30) {
    description = "LOW";
  } else if (value >= 70) {
    description = "HIGH";
  }

  document.getElementById("dialDescription")
    .textContent = description;

  // Circular progress

  const offset =
    circumference * (1 - value / 100);

  dialProgress.style.strokeDasharray =
    circumference;

  dialProgress.style.strokeDashoffset =
    offset;

  // White handle position
  //
  // SVG is rotated -90 degrees in CSS.
  // Native SVG coordinates start at the right.
  // After rotation, value 0 appears at top.

  const angle =
    (value / 100) * Math.PI * 2;

  const x =
    150 + dialRadius * Math.cos(angle);

  const y =
    150 + dialRadius * Math.sin(angle);

  dialHandle.setAttribute("cx", x);
  dialHandle.setAttribute("cy", y);
}

// Convert pointer position to dial value

function getDialValue(event) {

  const rect = mainDial.getBoundingClientRect();

  const centerX =
    rect.left + rect.width / 2;

  const centerY =
    rect.top + rect.height / 2;

  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;

  // Clockwise from the 12 o'clock position

  let angle = Math.atan2(dx, -dy);

  if (angle < 0) {
    angle += Math.PI * 2;
  }

  return Math.round(
    angle / (2 * Math.PI) * 100
  );
}

let isDialDragging = false;
let dialPointerId = null;

mainDial.addEventListener(
  "pointerdown",
  function(event) {

    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    isDialDragging = true;
    dialPointerId = event.pointerId;

    mainDial.setPointerCapture(event.pointerId);

    event.stopPropagation();

    fakeDevice(
      dialMode,
      getDialValue(event)
    );
  }
);

mainDial.addEventListener(
  "pointermove",
  function(event) {

    if (
      !isDialDragging ||
      event.pointerId !== dialPointerId
    ) {
      return;
    }

    event.stopPropagation();

    fakeDevice(
      dialMode,
      getDialValue(event)
    );
  }
);

function stopDialDragging(event) {

  if (event.pointerId !== dialPointerId) {
    return;
  }

  isDialDragging = false;
  dialPointerId = null;

  event.stopPropagation();
}

mainDial.addEventListener(
  "pointerup",
  stopDialDragging
);

mainDial.addEventListener(
  "pointercancel",
  stopDialDragging
);

// ========================================
// SWITCH DIAL BETWEEN CUSHION AND ARCH
// ========================================

parameterButtons.forEach(function(button) {

  button.addEventListener("click", function() {

    dialMode = button.dataset.mode;

    parameterButtons.forEach(function(item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    updateDial();
  });
});

// ========================================
// CUSHION SLIDER
// ========================================

cushionSlider.addEventListener(
  "input",
  function() {

    fakeDevice(
      "cushion",
      Number(cushionSlider.value)
    );
  }
);

// ========================================
// ARCH SUPPORT SLIDER
// ========================================

archSlider.addEventListener(
  "input",
  function() {

    fakeDevice(
      "arch",
      Number(archSlider.value)
    );
  }
);

// Stop sliders from dragging the carousel

[cushionSlider, archSlider].forEach(function(slider) {

  slider.addEventListener(
    "pointerdown",
    function(event) {
      event.stopPropagation();
    }
  );

  slider.addEventListener(
    "pointermove",
    function(event) {
      event.stopPropagation();
    }
  );
});

// ========================================
// CHARGING SIMULATION
// ========================================

function updateChargingUI() {

  document.getElementById("batteryValue")
    .textContent = battery + "%";

  const batteryCircle =
    document.getElementById("batteryCircle");

  batteryCircle.style.background =
    `conic-gradient(
      var(--red) 0% ${battery}%,
      #ccc ${battery}% 100%
    )`;

  batteryCircle.classList.toggle(
    "charging",
    isCharging
  );

  let status = "NOT CHARGING";

  if (battery === 100) {
    status = "FULLY CHARGED";
  } else if (isCharging) {
    status = "CHARGING";
  }

  document.getElementById("batteryStatus")
    .textContent = status;

  document.getElementById("powerIndicator")
    .textContent =
      isCharging
        ? "● CHARGING"
        : battery === 100
          ? "● FULL"
          : "● IDLE";

  chargeButton.textContent =
    isCharging
      ? "DISCONNECT CHARGER"
      : battery === 100
        ? "FULLY CHARGED"
        : "CONNECT CHARGER ↗";

  chargeButton.disabled =
    battery === 100 && !isCharging;
}

chargeButton.addEventListener(
  "click",
  function() {

    if (isCharging) {

      clearInterval(chargingTimer);
      chargingTimer = null;

      fakeDevice("disconnect");

    } else {

      if (battery >= 100) {
        return;
      }

      fakeDevice("connect");

      clearInterval(chargingTimer);

      chargingTimer = setInterval(function() {

        if (!isCharging) return;

        if (battery < 100) {
          battery++;
        }

        if (battery >= 100) {

          battery = 100;

          clearInterval(chargingTimer);
          chargingTimer = null;

          isCharging = false;
        }

        updateChargingUI();

      }, 1500);
    }
  }
);

// ========================================
// CAROUSEL / SWIPE / CARD SCALING
// ========================================

let startX = 0;
let dragX = 0;

let isDragging = false;
let dragPointerId = null;

function getCardWidth() {
  return carouselWindow.clientWidth;
}

function getPageOffset(page) {
  return -page * getCardWidth();
}

// Position cards and calculate
// continuous scaling while dragging.

function positionCards(offset, animate = true) {

  const width = getCardWidth();

  if (width === 0) return;

  carouselTrack.style.transition =
    animate
      ? "transform 350ms cubic-bezier(.2,.8,.2,1)"
      : "none";

  carouselTrack.style.transform =
    `translate3d(${offset}px, 0, 0)`;

  cards.forEach(function(card, index) {

    const distance = Math.abs(
      index + offset / width
    );

    const scale = Math.max(
      .84,
      1 - distance * .16
    );

    const opacity = Math.max(
      .55,
      1 - distance * .45
    );

    card.style.transition =
      animate
        ? "transform 350ms ease, opacity 350ms ease"
        : "none";

    card.style.transform =
      `scale(${scale})`;

    card.style.opacity = opacity;
  });
}

// Change to a page

function goToPage(page) {

  currentPage = Math.max(
    0,
    Math.min(cards.length - 1, page)
  );

  positionCards(
    getPageOffset(currentPage),
    true
  );

  tabs.forEach(function(tab, index) {
    tab.classList.toggle(
      "active",
      index === currentPage
    );
  });

  dots.forEach(function(dot, index) {
    dot.classList.toggle(
      "active",
      index === currentPage
    );
  });

  document.getElementById("pageCounter")
    .textContent =
      String(currentPage + 1).padStart(2, "0") +
      " / " +
      String(cards.length).padStart(2, "0");
}

// DRAG START

carouselWindow.addEventListener(
  "pointerdown",
  function(event) {

    // Buttons, sliders, and dial have
    // independent interaction.

    if (
      event.target.closest(
        "button, input, .dial"
      )
    ) {
      return;
    }

    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    isDragging = true;
    dragPointerId = event.pointerId;

    startX = event.clientX;
    dragX = 0;

    carouselWindow.classList.add("dragging");

    carouselWindow.setPointerCapture(
      event.pointerId
    );
  }
);

// DRAG MOVE

carouselWindow.addEventListener(
  "pointermove",
  function(event) {

    if (
      !isDragging ||
      event.pointerId !== dragPointerId
    ) {
      return;
    }

    dragX = event.clientX - startX;

    let offset =
      getPageOffset(currentPage) + dragX;

    // Resistance at both ends

    if (
      (currentPage === 0 && dragX > 0) ||
      (
        currentPage === cards.length - 1 &&
        dragX < 0
      )
    ) {
      offset =
        getPageOffset(currentPage) +
        dragX * .25;
    }

    positionCards(offset, false);
  }
);

// DRAG FINISH

function finishDragging(event) {

  if (
    !isDragging ||
    event.pointerId !== dragPointerId
  ) {
    return;
  }

  isDragging = false;
  dragPointerId = null;

  carouselWindow.classList.remove("dragging");

  const threshold = 55;

  if (dragX < -threshold) {

    goToPage(currentPage + 1);

  } else if (dragX > threshold) {

    goToPage(currentPage - 1);

  } else {

    goToPage(currentPage);
  }

  dragX = 0;
}

carouselWindow.addEventListener(
  "pointerup",
  finishDragging
);

carouselWindow.addEventListener(
  "pointercancel",
  finishDragging
);

// ========================================
// TOP TABS
// ========================================

tabs.forEach(function(tab) {

  tab.addEventListener("click", function() {

    goToPage(
      Number(tab.dataset.page)
    );
  });
});

// ========================================
// BOTTOM DOTS
// ========================================

dots.forEach(function(dot) {

  dot.addEventListener("click", function() {

    goToPage(
      Number(dot.dataset.page)
    );
  });
});

// ========================================
// KEYBOARD NAVIGATION
// ========================================

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.target.matches('input[type="range"]')
    ) {
      return;
    }

    if (event.key === "ArrowRight") {
      goToPage(currentPage + 1);
    }

    if (event.key === "ArrowLeft") {
      goToPage(currentPage - 1);
    }
  }
);

// ========================================
// RESPONSIVE WINDOW
// ========================================

window.addEventListener(
  "resize",
  function() {

    goToPage(currentPage);
  }
);

// ========================================
// INITIALIZE
// ========================================

updateUI();
goToPage(0);

