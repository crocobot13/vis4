"use strict";

// Interface prototype only.
// Percentages represent adjustment targets, not measured shoe values.

const state = {
  L: {
    arch: 50,
    firmness: 50,
    mode: null
  },

  R: {
    arch: 50,
    firmness: 50,
    mode: null
  }
};

const presets = {
  Walk: {
    arch: 40,
    firmness: 25
  },

  Run: {
    arch: 60,
    firmness: 50
  },

  Court: {
    arch: 75,
    firmness: 80
  }
};

let selectedSide = "L";
let charging = false;
let chargingTimer;

const zones = [
  ...document.querySelectorAll(".shoe-zone")
];

const modeButtons = [
  ...document.querySelectorAll("[data-mode]")
];

const feedback = document.getElementById("feedback");

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function sideName(side) {
  return side === "L" ? "Left" : "Right";
}

function render() {
  for (const side of ["L", "R"]) {
    const shoe = state[side];

    document.getElementById("arch" + side).textContent =
      shoe.arch;

    document.getElementById("firmness" + side).textContent =
      shoe.firmness + "%";

    document.getElementById("heightFill" + side).style.height =
      shoe.arch + "%";

    document.getElementById("heightMarker" + side).style.bottom =
      shoe.arch + "%";

    document.getElementById("firmnessFill" + side).style.width =
      shoe.firmness + "%";

    document.getElementById("firmnessMarker" + side).style.left =
      shoe.firmness + "%";

    // Wireframe representation of the arch support.
    const archPad = document.getElementById("archPad" + side);

    archPad.style.height =
      12 + shoe.arch * 0.26 + "px";

    archPad.style.backgroundColor =
      "rgb(" +
      (170 - shoe.arch) + "," +
      (170 - shoe.arch) + "," +
      (160 - shoe.arch) + ")";

    document.getElementById("mode" + side).textContent =
      shoe.mode || "Custom";
  }

  zones.forEach((zone) => {
    zone.classList.toggle(
      "selected",
      zone.dataset.side === selectedSide
    );
  });

  document.getElementById("modeTarget").textContent =
    sideName(selectedSide).toUpperCase() + " SHOE";

  modeButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(
        state[selectedSide].mode === button.dataset.mode
      )
    );
  });
}

function selectSide(side) {
  selectedSide = side;
  feedback.textContent = sideName(side) + " shoe selected";
  render();
}

function setValue(side, metric, value) {
  const nextValue = clamp(value);

  if (state[side][metric] === nextValue) {
    return;
  }

  state[side][metric] = nextValue;
  state[side].mode = null;

  render();

  if (metric === "arch") {
    feedback.textContent =
      sideName(side) + " arch height: " + nextValue + "%";
  } else {
    feedback.textContent =
      sideName(side) + " cushion firmness: " + nextValue + "%";
  }
}

// Gesture handling:
// Vertical drag adjusts arch height.
// Horizontal drag adjusts cushioning.
// The first clear direction locks the gesture to one axis.

zones.forEach((zone) => {
  let gesture = null;

  zone.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (gesture) return;

    selectSide(zone.dataset.side);

    gesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      initialArch: state[zone.dataset.side].arch,
      initialFirmness: state[zone.dataset.side].firmness,
      axis: null,

      // A full vertical zone drag spans approximately 100%.
      verticalSpan: zone.clientHeight,

      // A full horizontal zone drag spans approximately 100%.
      horizontalSpan: zone.clientWidth
    };

    zone.setPointerCapture(event.pointerId);
    zone.classList.add("dragging");
  });

  zone.addEventListener("pointermove", (event) => {
    if (!gesture || event.pointerId !== gesture.pointerId) {
      return;
    }

    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;

    if (!gesture.axis) {
      const distance = Math.hypot(dx, dy);

      if (distance < 8) return;

      // Wait for a clear direction instead of guessing on diagonals.
      if (Math.abs(dy) > Math.abs(dx) * 1.2) {
        gesture.axis = "vertical";
      } else if (Math.abs(dx) > Math.abs(dy) * 1.2) {
        gesture.axis = "horizontal";
      } else {
        return;
      }
    }

    const side = zone.dataset.side;

    if (gesture.axis === "vertical") {
      const change = (-dy / gesture.verticalSpan) * 100;

      setValue(
        side,
        "arch",
        gesture.initialArch + change
      );
    } else {
      const change = (dx / gesture.horizontalSpan) * 100;

      setValue(
        side,
        "firmness",
        gesture.initialFirmness + change
      );
    }
  });

  function finishGesture(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) {
      return;
    }

    const side = zone.dataset.side;
    const axis = gesture.axis;

    gesture = null;
    zone.classList.remove("dragging");

    if (zone.hasPointerCapture(event.pointerId)) {
      zone.releasePointerCapture(event.pointerId);
    }

    if (axis) {
      feedback.textContent =
        sideName(side) +
        (axis === "vertical"
          ? " arch setting saved"
          : " cushioning setting saved");
    }
  }

  zone.addEventListener("pointerup", finishGesture);
  zone.addEventListener("pointercancel", finishGesture);

  zone.addEventListener("lostpointercapture", () => {
    gesture = null;
    zone.classList.remove("dragging");
  });

  // Keyboard alternatives:
  // Up / Down = arch height.
  // Left / Right = cushion firmness.
  zone.addEventListener("keydown", (event) => {
    if (event.target !== zone) return;

    const side = zone.dataset.side;

    const keyActions = {
      ArrowUp: ["arch", 5],
      ArrowDown: ["arch", -5],
      ArrowRight: ["firmness", 5],
      ArrowLeft: ["firmness", -5]
    };

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectSide(side);
      return;
    }

    const action = keyActions[event.key];

    if (!action) return;

    event.preventDefault();
    selectSide(side);

    const [metric, step] = action;

    setValue(
      side,
      metric,
      state[side][metric] + step
    );
  });
});

// Minus / plus controls.
document.querySelectorAll("[data-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const side = button.dataset.side;
    const metric = button.dataset.metric;
    const step = Number(button.dataset.step);

    selectSide(side);

    setValue(
      side,
      metric,
      state[side][metric] + step
    );
  });
});

// Mode presets affect only the selected shoe.
modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.mode;

    Object.assign(
      state[selectedSide],
      presets[mode],
      { mode }
    );

    render();

    feedback.textContent =
      sideName(selectedSide) + " shoe: " + mode + " mode";
  });
});

// Reset only the selected shoe.
document.getElementById("resetButton").addEventListener(
  "click",
  () => {
    Object.assign(state[selectedSide], {
      arch: 50,
      firmness: 50,
      mode: null
    });

    render();

    feedback.textContent =
      sideName(selectedSide) + " shoe reset";
  }
);

// Tap the battery to simulate charger connection.
// The charging popup disappears after 2.2 seconds.
document.getElementById("batteryButton").addEventListener(
  "click",
  () => {
    charging = !charging;

    const batteryButton =
      document.getElementById("batteryButton");

    const chargingPopup =
      document.getElementById("chargingPopup");

    clearTimeout(chargingTimer);

    batteryButton.classList.toggle(
      "is-charging",
      charging
    );

    batteryButton.setAttribute(
      "aria-label",
      charging
        ? "Charging. Tap to simulate disconnection"
        : "82 percent battery. Tap to simulate charging"
    );

    document.getElementById("chargingBolt").hidden =
      !charging;

    chargingPopup.hidden = !charging;

    if (charging) {
      chargingTimer = setTimeout(() => {
        chargingPopup.hidden = true;
      }, 2200);
    }
  }
);

render();
