"use strict";

const presets = {
  Walk: { arch: 40, firmness: 25 },
  Run: { arch: 60, firmness: 50 },
  Court: { arch: 75, firmness: 80 }
};

const shoeState = {
  L: { arch: 50, firmness: 50, mode: null },
  R: { arch: 50, firmness: 50, mode: null }
};

let selectedSide = "L";
let charging = false;
let chargingTimer;
let feedbackTimer;

const homeScreen = document.getElementById("homeScreen");
const controlScreen = document.getElementById("controlScreen");

const archSlider = document.getElementById("archSlider");
const firmnessSlider = document.getElementById("firmnessSlider");

const feedback = document.getElementById("feedback");

const modeButtons = [
  ...document.querySelectorAll("[data-mode]")
];

function animateScreen(screen) {
  screen.classList.remove("entering");

  // Restart the screen transition.
  void screen.offsetWidth;

  screen.classList.add("entering");
}

function updateHome() {
  document.getElementById("leftArch").textContent =
    shoeState.L.arch;

  document.getElementById("leftFirmness").textContent =
    shoeState.L.firmness;

  document.getElementById("rightArch").textContent =
    shoeState.R.arch;

  document.getElementById("rightFirmness").textContent =
    shoeState.R.firmness;
}

function updateControls() {
  const state = shoeState[selectedSide];
  const isLeft = selectedSide === "L";

  document.getElementById("shoeTitle").textContent =
    isLeft ? "Left shoe" : "Right shoe";

  document.getElementById("selectedLetter").textContent =
    selectedSide;

  document.getElementById("currentMode").textContent =
    state.mode ? state.mode.toUpperCase() : "CUSTOM";

  const switchButton = document.getElementById("switchButton");

  switchButton.textContent = isLeft ? "R ⇄" : "L ⇄";

  switchButton.setAttribute(
    "aria-label",
    isLeft ? "Switch to right shoe" : "Switch to left shoe"
  );

  archSlider.value = state.arch;
  firmnessSlider.value = state.firmness;

  archSlider.style.setProperty("--fill", state.arch + "%");
  firmnessSlider.style.setProperty("--fill", state.firmness + "%");

  document.getElementById("archOutput").textContent =
    state.arch + "%";

  document.getElementById("firmnessOutput").textContent =
    state.firmness + "%";

  modeButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.mode === state.mode)
    );
  });

  updateHome();
}

function openShoe(side) {
  selectedSide = side;

  clearTimeout(feedbackTimer);
  feedback.textContent = "Adjust your support";

  updateControls();

  homeScreen.hidden = true;
  controlScreen.hidden = false;

  animateScreen(controlScreen);

  document.getElementById("backButton").focus({
    preventScroll: true
  });
}

function goHome() {
  updateHome();

  controlScreen.hidden = true;
  homeScreen.hidden = false;

  animateScreen(homeScreen);

  document.querySelector(
    '.shoe-card[data-side="' + selectedSide + '"]'
  ).focus({ preventScroll: true });
}

// Swipe up or tap a shoe to open its control screen.
document.querySelectorAll(".shoe-card").forEach((card) => {
  let startPoint = null;
  let suppressClick = false;

  card.addEventListener("pointerdown", (event) => {
    startPoint = {
      x: event.clientX,
      y: event.clientY
    };

    suppressClick = false;
    card.setPointerCapture(event.pointerId);
  });

  card.addEventListener("pointermove", (event) => {
    if (!startPoint) return;

    const distance = Math.max(
      0,
      Math.min(45, startPoint.y - event.clientY)
    );

    card.style.transform =
      "translateY(" + -distance * 0.35 + "px)";
  });

  card.addEventListener("pointerup", (event) => {
    card.style.transform = "";

    if (!startPoint) return;

    const upwardDistance = startPoint.y - event.clientY;
    const horizontalDistance = Math.abs(
      startPoint.x - event.clientX
    );

    if (upwardDistance > 35 && horizontalDistance < 80) {
      suppressClick = true;
      openShoe(card.dataset.side);
    }

    startPoint = null;
  });

  card.addEventListener("pointercancel", () => {
    startPoint = null;
    card.style.transform = "";
  });

  card.addEventListener("click", () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }

    openShoe(card.dataset.side);
  });
});

document.getElementById("backButton").addEventListener(
  "click",
  goHome
);

document.getElementById("switchButton").addEventListener(
  "click",
  () => {
    openShoe(selectedSide === "L" ? "R" : "L");
  }
);

function showFeedback(message) {
  clearTimeout(feedbackTimer);
  feedback.textContent = message;

  feedbackTimer = setTimeout(() => {
    feedback.textContent = "Adjust your support";
  }, 1600);
}

// Arch support adjustment.
archSlider.addEventListener("input", () => {
  shoeState[selectedSide].arch = Number(archSlider.value);
  shoeState[selectedSide].mode = null;

  updateControls();
  showFeedback("Arch setting updated");
});

// Carbon plate firmness adjustment.
firmnessSlider.addEventListener("input", () => {
  shoeState[selectedSide].firmness =
    Number(firmnessSlider.value);

  shoeState[selectedSide].mode = null;

  updateControls();
  showFeedback("Cushioning setting updated");
});

// Mode presets apply only to the selected shoe.
modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.mode;

    Object.assign(
      shoeState[selectedSide],
      presets[mode],
      { mode }
    );

    updateControls();
    showFeedback(mode + " settings selected");
  });
});

// Simulate charger connection by tapping the battery.
document.getElementById("batteryButton").addEventListener(
  "click",
  () => {
    charging = !charging;

    const button = document.getElementById("batteryButton");
    const overlay = document.getElementById("chargingOverlay");

    clearTimeout(chargingTimer);

    button.classList.toggle("is-charging", charging);

    button.setAttribute(
      "aria-label",
      charging
        ? "Charging. Tap to simulate disconnection"
        : "82 percent battery. Tap to simulate charging"
    );

    document.getElementById("chargingBolt").hidden =
      !charging;

    overlay.hidden = !charging;

    if (charging) {
      chargingTimer = setTimeout(() => {
        overlay.hidden = true;
      }, 2200);
    }
  }
);

// Escape returns to the shoe selection screen.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !controlScreen.hidden) {
    goHome();
  }
});

updateHome();
updateControls();
