
// ===================================
// ADAPTIVE SHOE - WEEK 3 PROJECT
// ===================================

// DEVICE STATE
let cushion = 64;
let arch = 72;
let battery = 46;

let isCharging = false;
let chargingTimer = null;

// CURRENT DIAL MODE
let dialMode = "cushion";

// CURRENT PAGE
let currentPage = 0;

// DOM ELEMENTS
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

// ===================================
// FAKE DEVICE
// All simulated hardware changes
// ===================================

function fakeDevice(action, value) {

  if (action === "cushion") {
    cushion = Math.max(0, Math.min(100, value));
  }

  if (action === "arch") {
    arch = Math.max(0, Math.min(100, value));
  }

  if (action === "connect") {
    isCharging = battery < 100;
  }

  if (action === "disconnect") {
    isCharging = false;
  }

  updateUI();
}

// ===================================
// UPDATE UI
// ===================================

function updateUI() {

  // Main card
  document.getElementById("mainCushion").textContent =
    cushion;

  document.getElementById("mainArch").textContent =
    arch;

  // Adjustment cards
  document.getElementById("cushionNumber").textContent =
    cushion;

  document.getElementById("archNumber").textContent =
    arch;

  cushionSlider.value = cushion;
  archSlider.value = arch;

  // Cushioning feedback
  let cushionMessage = "";

  if (cushion < 30) {
    cushionMessage = "SOFT CUSHIONING";
  } else if (cushion < 70) {
    cushionMessage = "BALANCED COMFORT";
  } else {
    cushionMessage = "FIRM CUSHIONING";
  }

  document.getElementById("cushionFeedback").textContent =
    cushionMessage;

  // Arch feedback
  let archMessage = "";

  if (arch < 30) {
    archMessage = "LOW ARCH SUPPORT";
  } else if (arch < 70) {
    archMessage = "MEDIUM ARCH SUPPORT";
  } else {
    archMessage = "HIGH ARCH SUPPORT";
  }

  document.getElementById("archFeedback").textContent =
    archMessage;

  // Arch shape animation
  const archDepth = 105 - arch * 1.05;

  document.getElementById("archShape")
    .setAttribute(
      "d",
      `M 10 110 Q 150 ${archDepth} 290 110`
    );

  // Cushioning bars
  const bars = document.querySelectorAll(
    "#cushionBars div"
  );

  bars.forEach(function(bar, index) {
    const height = 15 +
      (cushion / 100) * (25 + index * 5);

    bar.style.height = height + "%";
  });

  updateDial();
  updateChargingUI();
}

// ===================================
// INTERACTIVE CIRCULAR DIAL
// ===================================

const dialRadius = 116;
const circumference = 2 * Math.PI * dialRadius;

dialProgress.style.strokeDasharray = circumference;

function updateDial() {

  const value =
    dialMode === "cushion" ? cushion : arch;

  document.getElementById("dialType").textContent =
    dialMode === "cushion"
      ? "CUSHIONING"
      : "ARCH SUPPORT";

  document.getElementById("dialValue").textContent =
    value;

  let description = "BALANCED";

  if (value < 30) {
    description = "LOW";
  } else if (value >= 70) {
    description = "HIGH";
  }

  document.getElementById("dialDescription").textContent =
    description;

  // Circular progress
  const offset =
    circumference * (1 - value / 100);

  dialProgress.style.strokeDashoffset = offset;

  // Handle position
  const angle = (value / 100) * Math.PI * 2;

  const x = 150 + dialRadius * Math.sin(angle);
  const y = 150 - dialRadius * Math.cos(angle);

  dialHandle.setAttribute("cx", x);
  dialHandle.setAttribute("cy", y);
}

// Calculate dial value from pointer position
function getDialValue(event) {

  const rect = mainDial.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;

  let angle = Math.atan2(dx, -dy);

  if (angle < 0) {
    angle += Math.PI * 2;
  }

  return Math.round(angle / (Math.PI * 2) * 100);
}

let isDialDragging = false;

mainDial.addEventListener("pointerdown", function(event) {
  if (event.button !== 0 &&
      event.pointerType === "mouse") return;

  isDialDragging = true;

  mainDial.setPointerCapture(event.pointerId);
  event.stopPropagation();

  const value = getDialValue(event);

  fakeDevice(dialMode, value);
});

mainDial.addEventListener("pointermove", function(event) {

  if (!isDialDragging) return;

  event.stopPropagation();

  const value = getDialValue(event);

  fakeDevice(dialMode, value);
});

function stopDialDragging(event) {
  isDialDragging = false;
  event.stopPropagation();
}

mainDial.addEventListener(
  "pointerup", stopDialDragging
);

mainDial.addEventListener(
  "pointercancel", stopDialDragging
);

// ===================================
// SWITCH DIAL MODE
// ===================================

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

// ===================================
// SLIDERS
// ===================================

cushionSlider.addEventListener("input", function() {

  fakeDevice(
    "cushion",
    Number(cushionSlider.value)
  );
});

archSlider.addEventListener("input", function() {

  fakeDevice(
    "arch",
    Number(archSlider.value)
  );
});

// Prevent sliders from triggering carousel
[cushionSlider, archSlider].forEach(function(slider) {

  slider.addEventListener("pointerdown", function(event) {
    event.stopPropagation();
  });

  slider.addEventListener("pointermove", function(event) {
    event.stopPropagation();
  });
});

// ===================================
// CHARGING
// ===================================

const chargeButton =
  document.getElementById("chargeButton");

function updateChargingUI() {

  document.getElementById("batteryValue").textContent =
    battery + "%";

  const batteryCircle =
    document.getElementById("batteryCircle");

  batteryCircle.style.background =
    `conic-gradient(
      var(--red) 0% ${battery}%,
      #ccc ${battery}% 100%
    )`;

  batteryCircle.classList.toggle(
    "charging", isCharging
  );

  let status = "NOT CHARGING";

  if (battery === 100) {
    status = "FULLY CHARGED";
  } else if (isCharging) {
    status = "CHARGING";
  }

  document.getElementById("batteryStatus").textContent =
    status;

  document.getElementById("powerIndicator").textContent =
    isCharging ? "● CHARGING" : "● IDLE";

  chargeButton.textContent =
    isCharging
      ? "DISCONNECT CHARGER"
      : battery === 100
        ? "FULLY CHARGED"
        : "CONNECT CHARGER ↗";

  chargeButton.disabled = battery === 100 && !isCharging;
}

chargeButton.addEventListener("click", function() {

  if (isCharging) {

    fakeDevice("disconnect");

    clearInterval(chargingTimer);
    chargingTimer = null;

  } else {

    if (battery >= 100) return;

    fakeDevice("connect");

    clearInterval(chargingTimer);

    chargingTimer = setInterval(function() {

      if (!isCharging) return;

      if (battery < 100) {
        battery++;
      }

      if (battery >= 100) {
        battery = 100;
        fakeDevice("disconnect");
        clearInterval(chargingTimer);
        chargingTimer = null;
      }

      updateChargingUI();

    }, 1500);
  }
});

// ===================================
// CAROUSEL DRAG / SWIPE
// ===================================

let startX = 0;
let dragX = 0;
let isDragging = false;
let dragPointerId = null;

// Each card occupies its full horizontal slot
function getCardWidth() {
  return carouselWindow.clientWidth;
}

function getPageOffset(page) {
  return -page * getCardWidth();
}

// Update positions and sizes
function positionCards(offset, animate = true) {

  carouselTrack.style.transition =
    animate
      ? "transform 350ms cubic-bezier(.2,.8,.2,1)"
      : "none";

  carouselTrack.style.transform =
    `translate3d(${offset}px, 0, 0)`;

  cards.forEach(function(card, index) {

    const distance = Math.abs(
      index + offset / getCardWidth()
    );

    const scale = Math.max(.84, 1 - distance * .16);
    const opacity = Math.max(.55, 1 - distance * .45);

    card.style.transition = animate
      ? "transform 350ms ease, opacity 350ms ease"
      : "none";

    card.style.transform = `scale(${scale})`;
    card.style.opacity = opacity;
  });
}

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
      "active", index === currentPage
    );
  });

  dots.forEach(function(dot, index) {
    dot.classList.toggle(
      "active", index === currentPage
    );
  });

  document.getElementById("pageCounter").textContent =
    String(currentPage + 1).padStart(2, "0") +
    " / 04";
}

// Mouse and touch pointer events
carouselWindow.addEventListener(
  "pointerdown",
  function(event) {

    if (event.target.closest(
      "button, input, .dial"
    )) return;

    if (event.button !== 0 &&
        event.pointerType === "mouse") return;

    isDragging = true;
    startX = event.clientX;
    dragX = 0;
    dragPointerId = event.pointerId;

    carouselWindow.classList.add("dragging");

    carouselWindow.setPointerCapture(event.pointerId);
  }
);

carouselWindow.addEventListener(
  "pointermove",
  function(event) {

    if (!isDragging ||
        event.pointerId !== dragPointerId) return;

    dragX = event.clientX - startX;

    let offset = getPageOffset(currentPage) + dragX;

    // Resistance at first and last card
    if ((currentPage === 0 && dragX > 0) ||
        (currentPage === cards.length - 1 && dragX < 0)) {
      offset = getPageOffset(currentPage) + dragX * .25;
    }

    positionCards(offset, false);
  }
);

function finishDragging(event) {

  if (!isDragging ||
      event.pointerId !== dragPointerId) return;

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
  "pointerup", finishDragging
);

carouselWindow.addEventListener(
  "pointercancel", finishDragging
);

// ===================================
// TABS + DOT NAVIGATION
// ===================================

tabs.forEach(function(tab) {

  tab.addEventListener("click", function() {

    goToPage(Number(tab.dataset.page));
  });
});

dots.forEach(function(dot) {

  dot.addEventListener("click", function() {

    goToPage(Number(dot.dataset.page));
  });
});

// Arrow keyboard navigation
document.addEventListener("keydown", function(event) {

  if (event.key === "ArrowRight") {
    goToPage(currentPage + 1);
  }

  if (event.key === "ArrowLeft") {
    goToPage(currentPage - 1);
  }
});

// Keep correct sizing on window resize
window.addEventListener("resize", function() {
  goToPage(currentPage);
});

// ===================================
// INITIALIZE
// ===================================

updateUI();
goToPage(0);
