import { useEffect, useRef, useState } from "react";
import "./index.css";

const PRESETS = {
  Walk: { arch: 40, softness: 75 },
  Run: { arch: 60, softness: 50 },
  Court: { arch: 75, softness: 20 },
};

const clamp = (value) =>
  Math.max(0, Math.min(100, Math.round(value)));

const sideName = (side) => (side === "L" ? "Left" : "Right");

function Letter({ side, softness }) {
  const soft = softness / 100;
  const radius = 2 + soft * 25;
  const corner = 3 + soft * 17;

  const path =
    side === "L"
      ? `M24 18 V${130 - radius}
         Q24 130 ${24 + radius} 130 H82`
      : `M23 132 V18 H57
         Q82 18 82 ${18 + corner}
         V${76 - corner}
         Q82 76 57 76 H23
         M53 76 L84 132`;

  return (
    <svg className="glyph" viewBox="0 0 100 150" aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={8 + soft * 4}
        strokeLinecap={soft > 0.3 ? "round" : "butt"}
        strokeLinejoin={soft > 0.3 ? "round" : "miter"}
      />
    </svg>
  );
}

function Ruler({ value }) {
  const position = 2 + value * 2;

  return (
    <div className="ruler" aria-hidden="true">
      <span className="ruler-line" />

      {Array.from({ length: 21 }, (_, index) => {
        const tickValue = index * 5;
        const major = tickValue % 25 === 0;

        return (
          <span
            key={tickValue}
            className={`tick ${major ? "major" : ""}`}
            style={{ bottom: 2 + tickValue * 2 }}
          >
            {major && <span>{tickValue}</span>}
          </span>
        );
      })}

      <span
        className="ruler-marker"
        style={{ bottom: position }}
      />

      <span
        className="ruler-value"
        style={{ bottom: position }}
      >
        {value}
      </span>
    </div>
  );
}

function NavIcon({ type }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === "control" && (
        <>
          <path d="M8 4v16M5 7l3-3 3 3M5 17l3 3 3-3" />
          <path d="M16 4v16M13 7l3-3 3 3M13 17l3 3 3-3" />
        </>
      )}

      {type === "mode" && (
        <>
          <path d="M8 6h12M8 12h12M8 18h12" />
          <circle cx="4" cy="6" r="0.8" />
          <circle cx="4" cy="12" r="0.8" />
          <circle cx="4" cy="18" r="0.8" />
        </>
      )}

      {type === "tune" && (
        <>
          <path d="M5 4v5M5 13v7M12 4v10M12 18v2M19 4v2M19 10v10" />
          <circle cx="5" cy="11" r="2" />
          <circle cx="12" cy="16" r="2" />
          <circle cx="19" cy="8" r="2" />
        </>
      )}
    </svg>
  );
}

export default function App() {
  const [shoes, setShoes] = useState({
    L: { arch: 50, softness: 50, mode: null },
    R: { arch: 50, softness: 50, mode: null },
  });

  const [selected, setSelected] = useState("L");
  const [panel, setPanel] = useState(null);
  const [batteryOpen, setBatteryOpen] = useState(false);
  const [charging, setCharging] = useState(false);
  const [chargingPopup, setChargingPopup] = useState(false);

  const [battery, setBattery] = useState({
    L: 82,
    R: 78,
  });

  const [softVisible, setSoftVisible] = useState({
    L: false,
    R: false,
  });

  const [rulerVisible, setRulerVisible] = useState({
    L: false,
    R: false,
  });

  const [dragging, setDragging] = useState(null);
  const [feedback, setFeedback] = useState("Left shoe selected");
  const [toast, setToast] = useState("");

  const shoesRef = useRef(shoes);
  const gesture = useRef(null);
  const holdTimer = useRef(null);
  const animationFrame = useRef(null);
  const toastTimer = useRef(null);
  const popupTimer = useRef(null);

  const softTimers = useRef({});
  const rulerTimers = useRef({});
  const hardenRefs = useRef({});

  const homeRef = useRef(null);
  const sheetRef = useRef(null);
  const returnFocus = useRef(null);
  const batteryButtonRef = useRef(null);
  const closeBatteryRef = useRef(null);

  const averageBattery = Math.round(
    (battery.L + battery.R) / 2
  );

  const fullyCharged =
    battery.L === 100 && battery.R === 100;

  function updateShoes(next) {
    shoesRef.current = next;
    setShoes(next);
  }

  function announce(message, showToast = true) {
    setFeedback(message);

    if (!showToast || panel) return;

    clearTimeout(toastTimer.current);
    setToast(message);

    toastTimer.current = setTimeout(() => {
      setToast("");
    }, 1000);
  }

  function selectSide(side) {
    setSelected(side);
    setFeedback(`${sideName(side)} shoe selected`);
  }

  function showSoftness(side, keepVisible = false) {
    clearTimeout(softTimers.current[side]);

    setSoftVisible((previous) => ({
      ...previous,
      [side]: true,
    }));

    if (!keepVisible) {
      softTimers.current[side] = setTimeout(() => {
        if (document.activeElement === hardenRefs.current[side]) {
          return;
        }

        setSoftVisible((previous) => ({
          ...previous,
          [side]: false,
        }));
      }, 2800);
    }
  }

  function showRuler(side, keepVisible = false) {
    clearTimeout(rulerTimers.current[side]);

    setRulerVisible((previous) => ({
      ...previous,
      [side]: true,
    }));

    if (!keepVisible) {
      rulerTimers.current[side] = setTimeout(() => {
        setRulerVisible((previous) => ({
          ...previous,
          [side]: false,
        }));
      }, 900);
    }
  }

  function adjust(side, metric, value, quiet = false) {
    const nextValue = clamp(value);
    const current = shoesRef.current;

    if (current[side][metric] === nextValue) return;

    updateShoes({
      ...current,
      [side]: {
        ...current[side],
        [metric]: nextValue,
        mode: null,
      },
    });

    if (!quiet) {
      announce(
        `${sideName(side)} ${
          metric === "arch" ? "arch" : "softness"
        } · ${nextValue}%`
      );
    }
  }

  function startHold(direction) {
    const current = gesture.current;
    if (!current || current.kind !== "pending") return;

    current.kind = "hold";

    const side = current.side;
    const initial = shoesRef.current[side].softness;
    const started = performance.now();

    showSoftness(side, true);

    setRulerVisible((previous) => ({
      ...previous,
      [side]: false,
    }));

    function frame(now) {
      if (gesture.current !== current) return;

      const elapsed = (now - started) / 1000;

      adjust(
        side,
        "softness",
        initial + direction * elapsed * 15,
        true
      );

      animationFrame.current = requestAnimationFrame(frame);
    }

    animationFrame.current = requestAnimationFrame(frame);
  }

  function stopInteraction() {
    clearTimeout(holdTimer.current);
    cancelAnimationFrame(animationFrame.current);

    holdTimer.current = null;
    animationFrame.current = null;

    const previous = gesture.current;
    gesture.current = null;

    if (!previous) return;

    setDragging(null);

    if (previous.element.hasPointerCapture(previous.id)) {
      previous.element.releasePointerCapture(previous.id);
    }

    if (previous.kind === "hold") {
      showSoftness(previous.side);

      setFeedback(
        `${sideName(previous.side)} softness · ${
          shoesRef.current[previous.side].softness
        }%`
      );
    }

    if (previous.kind === "arch") {
      showRuler(previous.side);
    }

    if (previous.harden) {
      showSoftness(previous.side);
    }
  }

  function beginPointer(event, side, harden = false) {
    if (gesture.current || !event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.stopPropagation();
    selectSide(side);

    const element = event.currentTarget;

    gesture.current = {
      id: event.pointerId,
      side,
      element,
      x: event.clientX,
      y: event.clientY,
      initialArch: shoesRef.current[side].arch,
      height: element.clientHeight,
      kind: "pending",
      harden,
    };

    element.setPointerCapture(event.pointerId);

    if (harden) showSoftness(side, true);

    holdTimer.current = setTimeout(
      () => startHold(harden ? -1 : 1),
      harden ? 300 : 420
    );
  }

  function movePointer(event) {
    const current = gesture.current;

    if (!current || current.id !== event.pointerId) return;
    if (current.harden || current.kind === "hold") return;

    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;

    if (
      current.kind === "pending" &&
      Math.hypot(dx, dy) > 8
    ) {
      clearTimeout(holdTimer.current);

      if (Math.abs(dy) > Math.abs(dx) * 1.2) {
        current.kind = "arch";
        setDragging(current.side);

        setSoftVisible((previous) => ({
          ...previous,
          [current.side]: false,
        }));
      } else if (Math.abs(dx) > Math.abs(dy) * 1.2) {
        current.kind = "cancelled";
      }
    }

    if (current.kind === "arch") {
      showRuler(current.side, true);

      adjust(
        current.side,
        "arch",
        current.initialArch -
          (dy / current.height) * 100
      );
    }
  }

  function finishPointer(event) {
    if (gesture.current?.id === event.pointerId) {
      stopInteraction();
    }
  }

  function lostPointer(event) {
    if (gesture.current?.element === event.currentTarget) {
      stopInteraction();
    }
  }

  function keyboardControl(event, side) {
    if (event.target !== event.currentTarget) return;

    const actions = {
      ArrowUp: ["arch", 5],
      ArrowDown: ["arch", -5],
      ArrowRight: ["softness", 5],
      ArrowLeft: ["softness", -5],
    };

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectSide(side);
      showSoftness(side);
      return;
    }

    const action = actions[event.key];
    if (!action) return;

    event.preventDefault();
    selectSide(side);

    const [metric, step] = action;

    adjust(
      side,
      metric,
      shoesRef.current[side][metric] + step
    );

    if (metric === "arch") {
      showRuler(side);
    } else {
      showSoftness(side);
    }
  }

  function openPanel(type) {
    stopInteraction();
    returnFocus.current = document.activeElement;
    setToast("");
    setFeedback(`${sideName(selected)} shoe selected`);
    setPanel(type);
  }

  function applyMode(mode) {
    updateShoes({
      ...shoesRef.current,
      [selected]: {
        ...PRESETS[mode],
        mode,
      },
    });

    announce(`${sideName(selected)} shoe · ${mode}`, false);
  }

  function resetSelected() {
    updateShoes({
      ...shoesRef.current,
      [selected]: {
        arch: 50,
        softness: 50,
        mode: null,
      },
    });

    announce(`${sideName(selected)} shoe reset`, false);
  }

  function openBattery() {
    stopInteraction();
    setToast("");
    setBatteryOpen(true);
  }

  function toggleCharging() {
    const next = !charging;

    setCharging(next);
    clearTimeout(popupTimer.current);
    setChargingPopup(next);

    if (next) {
      popupTimer.current = setTimeout(() => {
        setChargingPopup(false);
      }, 2200);
    }
  }

  // 演示充电：每两秒增加 1%。
  useEffect(() => {
    if (!charging || fullyCharged) return;

    const timer = window.setInterval(() => {
      setBattery((previous) => ({
        L: Math.min(100, previous.L + 1),
        R: Math.min(100, previous.R + 1),
      }));
    }, 2000);

    return () => window.clearInterval(timer);
  }, [charging, fullyCharged]);

  // 面板焦点管理。
  useEffect(() => {
    if (!panel) return;

    const home = homeRef.current;
    const sheet = sheetRef.current;

    home.inert = true;
    sheet.querySelector(".close")?.focus();

    function handleKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setPanel(null);
        return;
      }

      if (event.key !== "Tab") return;

      const buttons = [
        ...sheet.querySelectorAll("button"),
      ].filter((button) => button.getClientRects().length);

      const first = buttons[0];
      const last = buttons[buttons.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      home.inert = false;
      document.removeEventListener("keydown", handleKey);
      returnFocus.current?.focus();
    };
  }, [panel]);

  // 电量页面焦点管理。
  useEffect(() => {
    if (!batteryOpen) return;

    closeBatteryRef.current?.focus();

    function handleKey(event) {
      if (event.key === "Escape") {
        setBatteryOpen(false);
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);

      // 等主页恢复显示后再还原焦点。
      queueMicrotask(() => {
        const button = batteryButtonRef.current;
        if (button?.getClientRects().length) {
          button.focus();
        }
      });
    };
  }, [batteryOpen]);

  // 切走窗口时停止长按，组件卸载时清理计时器。
  useEffect(() => {
    function cancelActive() {
      clearTimeout(holdTimer.current);
      cancelAnimationFrame(animationFrame.current);

      const current = gesture.current;
      gesture.current = null;

      if (current?.element.hasPointerCapture(current.id)) {
        current.element.releasePointerCapture(current.id);
      }

      Object.values(softTimers.current).forEach(clearTimeout);
      Object.values(rulerTimers.current).forEach(clearTimeout);

      setDragging(null);
      setSoftVisible({ L: false, R: false });
      setRulerVisible({ L: false, R: false });
    }

    function handleVisibility() {
      if (document.hidden) cancelActive();
    }

    window.addEventListener("blur", cancelActive);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("blur", cancelActive);
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      clearTimeout(holdTimer.current);
      cancelAnimationFrame(animationFrame.current);
      clearTimeout(toastTimer.current);
      clearTimeout(popupTimer.current);

      Object.values(softTimers.current).forEach(clearTimeout);
      Object.values(rulerTimers.current).forEach(clearTimeout);

      gesture.current = null;
    };
  }, []);

  return (
    <main className="app">
      <div className="statusbar">
        <span>9:41</span>
        <span className="notch" aria-hidden="true" />

        <span className="signal" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>

      <section
        ref={homeRef}
        className="home"
        aria-label="Shoe control"
        hidden={batteryOpen}
      >
        <div className="zones">
          {["L", "R"].map((side) => {
            const shoe = shoes[side];
            const radius = 52 + shoe.softness * 0.6;

            const className = [
              "zone",
              side === "L" ? "zone-left" : "zone-right",
              selected === side ? "selected" : "",
              dragging === side ? "dragging" : "",
              softVisible[side] ? "show-softness" : "",
              rulerVisible[side] ? "show-ruler" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <article
                key={side}
                className={className}
                tabIndex={0}
                aria-label={`${sideName(side)} shoe. Arch ${
                  shoe.arch
                } percent. Softness ${
                  shoe.softness
                } percent. Hold to soften. Swipe vertically for arch.
                Use up and down arrows for arch, left and right for softness.`}
                onContextMenu={(event) => event.preventDefault()}
                onPointerDown={(event) => {
                  if (event.target.closest("button")) return;
                  beginPointer(event, side);
                }}
                onPointerMove={movePointer}
                onPointerUp={finishPointer}
                onPointerCancel={finishPointer}
                onLostPointerCapture={lostPointer}
                onKeyDown={(event) =>
                  keyboardControl(event, side)
                }
              >
                <div
                  className="letter-stage"
                  style={{
                    "--offset": `${(50 - shoe.arch) * 1.44}px`,
                  }}
                >
                  <div
                    className="softness-visual"
                    aria-hidden="true"
                  >
                    <svg
                      className="rings"
                      viewBox="0 0 240 240"
                      fill="none"
                    >
                      {[52, 72, 92, 112].map((value) => (
                        <circle
                          key={value}
                          className="reference-ring"
                          cx="120"
                          cy="120"
                          r={value}
                        />
                      ))}

                      <circle
                        className="active-ring"
                        cx="120"
                        cy="120"
                        r={radius}
                      />
                    </svg>

                    <div
                      className="softness-number"
                      style={{ top: 120 - radius - 5 }}
                    >
                      <small>SOFTNESS</small>
                      <output>{shoe.softness}</output>
                    </div>
                  </div>

                  <Letter
                    side={side}
                    softness={shoe.softness}
                  />
                </div>

                <Ruler value={shoe.arch} />

                <button
                  ref={(element) => {
                    hardenRefs.current[side] = element;
                  }}
                  className="harden"
                  aria-label={`Hold to decrease ${sideName(
                    side
                  ).toLowerCase()} shoe softness`}
                  onContextMenu={(event) =>
                    event.preventDefault()
                  }
                  onPointerDown={(event) =>
                    beginPointer(event, side, true)
                  }
                  onPointerUp={finishPointer}
                  onPointerCancel={finishPointer}
                  onLostPointerCapture={lostPointer}
                  onFocus={() => showSoftness(side, true)}
                  onBlur={() => showSoftness(side)}
                  onClick={(event) => {
                    // 键盘或辅助技术激活时减少 5%。
                    if (event.detail !== 0) return;

                    selectSide(side);
                    adjust(
                      side,
                      "softness",
                      shoesRef.current[side].softness - 5
                    );
                    showSoftness(side);
                  }}
                >
                  ×
                </button>
              </article>
            );
          })}
        </div>

        <div className="toast" role="status" hidden={!toast}>
          {toast}
        </div>

        <nav className="bottom-bar" aria-label="Shoe controls">
          <button
            className="nav-button active"
            onClick={() => showSoftness(selected)}
          >
            <span className="nav-icon">
              <NavIcon type="control" />
            </span>
            <span>CONTROL</span>
          </button>

          <button
            className="nav-button"
            onClick={() => openPanel("mode")}
          >
            <span className="nav-icon">
              <NavIcon type="mode" />
            </span>
            <span>MODE</span>
          </button>

          <button
            className="nav-button"
            onClick={() => openPanel("adjust")}
          >
            <span className="nav-icon">
              <NavIcon type="tune" />
            </span>
            <span>TUNE</span>
          </button>
        </nav>

        <div className="battery-row">
          <button
            ref={batteryButtonRef}
            className="battery-button"
            aria-label={`Open battery screen. Average battery ${averageBattery} percent`}
            onClick={openBattery}
          >
            <span className="small-battery" aria-hidden="true">
              <span style={{ width: `${averageBattery}%` }} />
            </span>

            <span>{averageBattery}%</span>

            {charging && !fullyCharged && (
              <span className="battery-bolt" aria-hidden="true">
                ϟ
              </span>
            )}
          </button>
        </div>
      </section>

      {batteryOpen && (
        <section
          className="battery-screen"
          aria-labelledby="batteryTitle"
        >
          <h1 id="batteryTitle">
            {fullyCharged
              ? "Fully charged"
              : charging
                ? "Battery charging"
                : "Battery status"}
          </h1>

          <p className="caption">
            {fullyCharged
              ? "Your shoes are fully charged."
              : charging
                ? "Your shoes are connected to power."
                : "Your shoes are ready to move."}
          </p>

          <div className="battery-pair">
            {["L", "R"].map((side) => {
              const value = battery[side];
              const isCharging = charging && value < 100;

              return (
                <div className="battery-column" key={side}>
                  <span className="shoe-label">{side}</span>

                  <div
                    className="large-battery"
                    aria-hidden="true"
                  >
                    <div
                      className={`battery-fill ${
                        isCharging ? "is-charging" : ""
                      }`}
                      style={{ height: `${value}%` }}
                    >
                      {isCharging && (
                        <span className="fill-bolt">ϟ</span>
                      )}
                    </div>
                  </div>

                  <output
                    className="battery-percent"
                    aria-label={`${sideName(side)} shoe battery ${value} percent`}
                  >
                    {value}%
                  </output>

                  <span className="battery-state">
                    {value === 100
                      ? "FULLY CHARGED"
                      : isCharging
                        ? "CHARGING"
                        : "READY"}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            className="charge-button"
            onClick={toggleCharging}
          >
            {charging
              ? "DISCONNECT CHARGER"
              : "SIMULATE CHARGING"}
          </button>

          <p className="demo-note">
            DEMO · +1% EVERY 2 SECONDS
          </p>

          <button
            ref={closeBatteryRef}
            className="close-battery"
            aria-label="Close battery screen"
            onClick={() => setBatteryOpen(false)}
          >
            ×
          </button>
        </section>
      )}

      {panel && (
        <div className="sheet-layer">
          <button
            className="scrim"
            tabIndex={-1}
            aria-label="Close panel"
            onClick={() => setPanel(null)}
          />

          <section
            ref={sheetRef}
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheetTitle"
          >
            <div className="handle" aria-hidden="true" />

            <div className="sheet-header">
              <h2 id="sheetTitle">
                {panel === "mode" ? "Your modes" : "Fine tune"}
              </h2>

              <button
                className="close"
                aria-label="Close"
                onClick={() => setPanel(null)}
              >
                ×
              </button>
            </div>

            <p className="sheet-caption">
              {panel === "mode"
                ? "Choose a preset for the selected shoe."
                : "Adjust arch height and cushion softness."}
            </p>

            <div
              className="side-tabs"
              role="group"
              aria-label="Select shoe"
            >
              {["L", "R"].map((side) => (
                <button
                  key={side}
                  aria-pressed={selected === side}
                  onClick={() => selectSide(side)}
                >
                  {sideName(side).toUpperCase()} SHOE
                </button>
              ))}
            </div>

            {panel === "mode" ? (
              <div className="mode-list">
                {Object.entries(PRESETS).map(([mode, values]) => (
                  <button
                    key={mode}
                    className="mode-option"
                    aria-pressed={shoes[selected].mode === mode}
                    onClick={() => applyMode(mode)}
                  >
                    <strong>{mode.toUpperCase()}</strong>
                    <span>
                      ARCH {values.arch} · SOFTNESS {values.softness}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                {[
                  ["arch", "Arch height", "LOW / HIGH"],
                  ["softness", "Softness", "LESS / MORE SOFT"],
                ].map(([metric, label, hint]) => (
                  <div className="adjust-row" key={metric}>
                    <div className="adjust-heading">
                      <span>{label}</span>
                      <output>{shoes[selected][metric]}%</output>
                    </div>

                    <div className="stepper">
                      <button
                        aria-label={`Decrease ${label.toLowerCase()}`}
                        onClick={() =>
                          adjust(
                            selected,
                            metric,
                            shoesRef.current[selected][metric] - 5
                          )
                        }
                      >
                        −
                      </button>

                      <span>{hint}</span>

                      <button
                        aria-label={`Increase ${label.toLowerCase()}`}
                        onClick={() =>
                          adjust(
                            selected,
                            metric,
                            shoesRef.current[selected][metric] + 5
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  className="reset"
                  onClick={resetSelected}
                >
                  RESET SELECTED SHOE
                </button>
              </div>
            )}

            <p className="sheet-feedback" role="status">
              {feedback}
            </p>
          </section>
        </div>
      )}

      {chargingPopup && (
        <aside className="charging-popup" role="status">
          <span className="symbol">ϟ</span>
          <h2>Charging connected</h2>
          <p>LEFT + RIGHT</p>
        </aside>
      )}

      <div className="home-indicator" aria-hidden="true" />
    </main>
  );
}