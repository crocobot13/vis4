"use strict";

// 模式预设：仅用于界面演示
// cushion 数值越高，代表越硬
const presets = {
  Walk: {
    arch: 40,
    cushion: 25
  },

  Run: {
    arch: 60,
    cushion: 50
  },

  Court: {
    arch: 75,
    cushion: 80
  }
};

// 左右鞋独立保存数值
const state = {
  L: {
    arch: 50,
    cushion: 50,
    mode: null
  },

  R: {
    arch: 50,
    cushion: 50,
    mode: null
  }
};

let selected = "L";
let charging = false;
let popupTimer;

const arch = document.getElementById("arch");
const cushion = document.getElementById("cushion");

const shoeButtons = [
  ...document.querySelectorAll(".shoe")
];

const modeButtons = [
  ...document.querySelectorAll("[data-mode]")
];

// 更新整个界面
function render() {
  const current = state[selected];

  document.getElementById("controlTitle").textContent =
    selected === "L" ? "Left shoe" : "Right shoe";

  // 更新滑条、数值和进度条
  for (const input of [arch, cushion]) {
    input.value = current[input.id];

    input.style.setProperty(
      "--fill",
      current[input.id] + "%"
    );

    document.getElementById(
      input.id + "Value"
    ).textContent = current[input.id] + "%";
  }

  // 更新左右鞋状态
  shoeButtons.forEach((button) => {
    const side = button.dataset.side;
    const active = side === selected;

    button.classList.toggle("selected", active);

    button.setAttribute(
      "aria-pressed",
      String(active)
    );

    const value = state[side];

    document.getElementById(
      "summary" + side
    ).textContent =
      "Arch " + value.arch +
      " · Firmness " + value.cushion;
  });

  // 更新模式按钮
  modeButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.mode === current.mode)
    );
  });
}

// 选择某一只鞋
function selectShoe(side) {
  selected = side;

  document.getElementById("status").textContent =
    state[side].mode || "Ready";

  render();
}

// 点击或向上滑动选择左右鞋
shoeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectShoe(button.dataset.side);
  });

  let start = null;

  button.addEventListener("pointerdown", (event) => {
    start = {
      x: event.clientX,
      y: event.clientY
    };

    button.setPointerCapture(event.pointerId);
  });

  button.addEventListener("pointerup", (event) => {
    if (
      start &&
      start.y - event.clientY > 35 &&
      Math.abs(start.x - event.clientX) < 80
    ) {
      selectShoe(button.dataset.side);
    }

    start = null;
  });

  button.addEventListener("pointercancel", () => {
    start = null;
  });
});

// 足弓和碳板调节
for (const input of [arch, cushion]) {
  input.addEventListener("input", () => {
    state[selected][input.id] = Number(input.value);

    // 手动调节后进入自定义状态
    state[selected].mode = null;

    document.getElementById("status").textContent =
      "Custom";

    render();
  });
}

// 模式只作用于当前选中的鞋
modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.mode;

    Object.assign(
      state[selected],
      presets[mode],
      { mode: mode }
    );

    document.getElementById("status").textContent =
      mode;

    render();
  });
});

// 点击电池，模拟连接或断开充电器
document.getElementById("battery").addEventListener(
  "click",
  () => {
    charging = !charging;

    const batteryButton =
      document.getElementById("battery");

    const popup =
      document.getElementById("chargingPopup");

    clearTimeout(popupTimer);

    batteryButton.classList.toggle(
      "charging",
      charging
    );

    batteryButton.setAttribute(
      "aria-label",
      charging
        ? "Charging. Click to simulate disconnection"
        : "82 percent battery. Click to simulate charging"
    );

    document.getElementById("bolt").hidden =
      !charging;

    popup.hidden = !charging;

    // 提示显示 2.2 秒，之后只保留小电池状态
    if (charging) {
      popupTimer = setTimeout(() => {
        popup.hidden = true;
      }, 2200);
    }
  }
);

// 页面初始化
render();
