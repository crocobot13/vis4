const slider = document.getElementById("cushionSlider");
const liveValue = document.getElementById("liveCushionValue");
const cushionValue = document.getElementById("cushionValue");
const cushionFill = document.getElementById("cushionFill");
const platePosition = document.getElementById("platePosition");
const comfortValue = document.getElementById("comfortValue");
const responseValue = document.getElementById("responseValue");

const archValue = document.getElementById("archValue");
const archFill = document.getElementById("archFill");
const fitTitle = document.getElementById("fitTitle");
const fitDescription = document.getElementById("fitDescription");
const modeNumber = document.getElementById("modeNumber");
const activityLabel = document.getElementById("activityLabel");

const modeButtons = document.querySelectorAll(".mode");

/* charging */
const openChargingBtn = document.getElementById("openChargingBtn");
const closeChargingBtn = document.getElementById("closeChargingBtn");
const chargingModal = document.getElementById("chargingModal");
const toggleChargingBtn = document.getElementById("toggleChargingBtn");

const batteryMainValue = document.getElementById("batteryMainValue");
const batteryFillBar = document.getElementById("batteryFillBar");
const leftBatteryLabel = document.getElementById("leftBatteryLabel");
const rightBatteryLabel = document.getElementById("rightBatteryLabel");

const chargePercent = document.getElementById("chargePercent");
const remainingTime = document.getElementById("remainingTime");
const rangeValue = document.getElementById("rangeValue");
const leftChargeValue = document.getElementById("leftChargeValue");
const rightChargeValue = document.getElementById("rightChargeValue");
const leftMiniFill = document.getElementById("leftMiniFill");
const rightMiniFill = document.getElementById("rightMiniFill");
const chargingStatusChip = document.getElementById("chargingStatusChip");


const presets = {
    walk: {
        title: "Everyday Comfort",
        description: "Softer cushioning for comfortable everyday movement.",
        cushion: 45,
        arch: 60,
        modeNumber: "01"
    },

    run: {
        title: "Responsive Run",
        description: "Balanced cushioning for smoother transitions and energy return.",
        cushion: 62,
        arch: 70,
        modeNumber: "02"
    },

    basketball: {
        title: "Court Response",
        description: "Firmer cushioning for faster response, stability and court movement.",
        cushion: 82,
        arch: 78,
        modeNumber: "03"
    }
};

function updateCushion(value) {
    value = Number(value);

    liveValue.textContent = value;
    cushionValue.textContent = value;
    cushionFill.style.width = value + "%";
    platePosition.style.left = value + "%";

    const comfort = Math.round(100 - value * 0.62);
    const response = Math.round(25 + value * 0.75);

    comfortValue.textContent = comfort;
    responseValue.textContent = response;

    slider.style.background = `
        linear-gradient(
            to right,
            var(--shoe-pink) 0%,
            var(--shoe-pink) ${value}%,
            rgba(255,255,255,.14) ${value}%,
            rgba(255,255,255,.14) 100%
        )
    `;
}

slider.addEventListener("input", function () {
    updateCushion(slider.value);
});

modeButtons.forEach(button => {
    button.addEventListener("click", function () {
        modeButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const mode = button.dataset.mode;
        const preset = presets[mode];

        fitTitle.textContent = preset.title;
        fitDescription.textContent = preset.description;
        modeNumber.textContent = preset.modeNumber;
        activityLabel.textContent = mode.toUpperCase();

        archValue.textContent = preset.arch;
        archFill.style.width = preset.arch + "%";

        slider.value = preset.cushion;
        updateCushion(preset.cushion);
    });
});


/* -----------------------------
   Charging Screen
----------------------------- */

let isCharging = true;
let leftBattery = 82;
let rightBattery = 78;

function averageBattery() {
    return Math.round((leftBattery + rightBattery) / 2);
}

function updateChargingUI() {
    const avg = averageBattery();

    batteryMainValue.textContent = avg + "%";
    batteryFillBar.style.width = avg + "%";

    leftBatteryLabel.textContent = "LEFT " + leftBattery + "%";
    rightBatteryLabel.textContent = "RIGHT " + rightBattery + "%";

    chargePercent.textContent = avg;
    leftChargeValue.textContent = leftBattery + "%";
    rightChargeValue.textContent = rightBattery + "%";

    leftMiniFill.style.width = leftBattery + "%";
    rightMiniFill.style.width = rightBattery + "%";

    const remaining = Math.max(0, Math.round((100 - avg) * 1.0));
    remainingTime.textContent = remaining + " min";

    const range = (avg * 0.15).toFixed(1);
    rangeValue.textContent = range + " mi";

    if (isCharging) {
        chargingStatusChip.textContent = "CHARGING";
        toggleChargingBtn.textContent = "Remove from charging pad";
    } else {
        chargingStatusChip.textContent = "NOT CHARGING";
        toggleChargingBtn.textContent = "Place on charging pad";
    }
}

openChargingBtn.addEventListener("click", function () {
    chargingModal.classList.add("show");
});

closeChargingBtn.addEventListener("click", function () {
    chargingModal.classList.remove("show");
});

toggleChargingBtn.addEventListener("click", function () {
    isCharging = !isCharging;
    updateChargingUI();
});

setInterval(function () {
    if (isCharging) {
        if (leftBattery < 100) {
            leftBattery += 1;
        }

        if (rightBattery < 100) {
            rightBattery += 1;
        }

        updateChargingUI();
    }
}, 2500);


/* initial */
updateCushion(slider.value);
updateChargingUI();
