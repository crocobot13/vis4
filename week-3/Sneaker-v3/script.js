let cushionValue = 64;
let archValue = 72;
let battery = 46;
let isCharging = false;
let chargingTimer = null;

const cushionSlider = document.getElementById("cushionSlider");
const archSlider = document.getElementById("archSlider");

const cushionBig = document.getElementById("cushionBig");
const archBig = document.getElementById("archBig");

const cushionValueMain = document.getElementById("cushionValueMain");
const archValueMain = document.getElementById("archValueMain");
const supportPercent = document.getElementById("supportPercent");

const cushionFeedback = document.getElementById("cushionFeedback");
const archFeedback = document.getElementById("archFeedback");

const batteryText = document.getElementById("batteryText");
const chargingStatus = document.getElementById("chargingStatus");
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");

const carousel = document.getElementById("carousel");
const cards = document.querySelectorAll(".card");
const dots = document.querySelectorAll(".dot");

function calculateSupportState() {
  return Math.round((cushionValue + archValue) / 2);
}

function updateSupportCard() {
  cushionValueMain.innerHTML = cushionValue;
  archValueMain.innerHTML = archValue;
  supportPercent.innerHTML = calculateSupportState() + "%";
}

function updateCushion() {
  cushionBig.innerHTML = cushionValue;

  if (cushionValue < 30) {
    cushionFeedback.innerHTML = "Soft setting for a more relaxed feel.";
  } else if (cushionValue < 70) {
    cushionFeedback.innerHTML = "Balanced comfort setting.";
  } else {
    cushionFeedback.innerHTML = "Firm setting for stronger support.";
  }
}

function updateArch() {
  archBig.innerHTML = archValue;

  if (archValue < 30) {
    archFeedback.innerHTML = "Lower arch support for a flatter profile.";
  } else if (archValue < 70) {
    archFeedback.innerHTML = "Medium arch support for everyday use.";
  } else {
    archFeedback.innerHTML = "Supportive for a higher arch.";
  }
}

function updateChargingUI() {
  batteryText.innerHTML = battery + "%";

  if (isCharging && battery < 100) {
    chargingStatus.innerHTML = "Charging";
  } else if (battery >= 100) {
    chargingStatus.innerHTML = "Fully Charged";
  } else {
    chargingStatus.innerHTML = "Not Charging";
  }
}

function startCharging() {
  if (isCharging) return;

  isCharging = true;
  updateChargingUI();

  chargingTimer = setInterval(function () {
    if (battery < 100) {
      battery = battery + 1;
      updateChargingUI();
    } else {
      stopCharging();
      chargingStatus.innerHTML = "Fully Charged";
    }
  }, 1500);
}

function stopCharging() {
  isCharging = false;
  clearInterval(chargingTimer);
  chargingTimer = null;
  updateChargingUI();
}

cushionSlider.addEventListener("input", function () {
  cushionValue = Number(cushionSlider.value);
  updateCushion();
  updateSupportCard();
});

archSlider.addEventListener("input", function () {
  archValue = Number(archSlider.value);
  updateArch();
  updateSupportCard();
});

connectBtn.addEventListener("click", function () {
  startCharging();
});

disconnectBtn.addEventListener("click", function () {
  stopCharging();
});

function updateActiveCard() {
  let closestIndex = 0;
  let closestDistance = Infinity;

  cards.forEach(function (card, index) {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const viewportCenter = carousel.scrollLeft + carousel.offsetWidth / 2;
    const distance = Math.abs(cardCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  cards.forEach(function (card) {
    card.classList.remove("active-card");
  });

  dots.forEach(function (dot) {
    dot.classList.remove("active-dot");
  });

  cards[closestIndex].classList.add("active-card");
  dots[closestIndex].classList.add("active-dot");
}

carousel.addEventListener("scroll", function () {
  updateActiveCard();
});

updateCushion();
updateArch();
updateSupportCard();
updateChargingUI();
updateActiveCard();
