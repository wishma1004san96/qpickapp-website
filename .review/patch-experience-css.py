from pathlib import Path

p = Path(r"D:\quickpickapp\app\globals.css")
text = p.read_text(encoding="utf-8")
start = text.index("/* ——— Experience Q Pick")
end = text.index("@keyframes ken-burns")

new = """/* ——— Experience Q Pick · Apple product page ——— */
.experience-stage {
  background: #ffffff;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "SF Pro Display",
    "SF Pro Text",
    "Segoe UI",
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
}

.experience-headline {
  margin: 0;
  font-family: inherit;
  font-size: clamp(2.75rem, 5.5vw, 84px);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.06em;
  font-kerning: normal;
  font-synthesis: none;
  color: #1d1d1f;
}

.experience-body {
  margin: 0;
  font-family: inherit;
  font-weight: 500;
  font-size: clamp(1.25rem, 2vw, 30px);
  line-height: 1.22;
  letter-spacing: -0.01em;
  color: #1d1d1f;
  max-width: 22ch;
}

@media (min-width: 1024px) {
  .experience-headline {
    font-size: 84px;
  }

  .experience-body {
    font-size: 30px;
  }
}

.experience-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.experience-copy .experience-body {
  margin-top: 24px;
}

.experience-copy .experience-store-row--desktop {
  margin-top: 48px;
}

@media (min-width: 1024px) {
  .experience-copy {
    align-items: flex-start;
    text-align: left;
  }
}

.experience-store-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.875rem;
}

.experience-store-row--desktop {
  display: none;
}

.experience-store-row--mobile {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

@media (min-width: 1024px) {
  .experience-store-row--desktop {
    display: flex;
  }

  .experience-store-row--mobile {
    display: none;
  }
}

.experience-store-badge {
  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 280ms ease;
  cursor: default;
}

.experience-store-badge:hover {
  transform: translateY(-2px);
  opacity: 0.92;
}

.experience-phone-stage {
  padding: 0.25rem 0.5rem 1rem;
}

.experience-phone-static {
  transform: rotate(-2deg);
}

.experience-phone-float {
  transform-origin: 50% 60%;
  animation: experience-phone-float 8s ease-in-out infinite;
  will-change: transform;
}

.experience-phone-shell {
  border-radius: 3.1rem;
  padding: 3px;
  background: linear-gradient(
    145deg,
    #d8d8da 0%,
    #8a8a8c 22%,
    #2a2a2c 48%,
    #1a1a1c 62%,
    #6a6a6c 88%,
    #c4c4c6 100%
  );
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.22) inset,
    0 -1px 0 rgb(0 0 0 / 0.35) inset,
    0 28px 56px rgb(0 0 0 / 0.14),
    0 12px 24px rgb(0 0 0 / 0.08),
    0 4px 10px rgb(0 0 0 / 0.05),
    0 0 0 1px rgb(0 0 0 / 0.2);
}

.experience-phone-metal {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 4;
  box-shadow:
    inset 1px 0 0 rgb(255 255 255 / 0.28),
    inset -1px 0 0 rgb(255 255 255 / 0.08),
    inset 0 1px 0 rgb(255 255 255 / 0.18),
    inset 0 -1px 0 rgb(0 0 0 / 0.35);
}

.experience-phone-side-buttons {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}

.experience-phone-side-buttons::before,
.experience-phone-side-buttons::after {
  content: "";
  position: absolute;
  background: linear-gradient(180deg, #9a9a9c, #2a2a2c 45%, #151517);
  border-radius: 2px;
  box-shadow:
    0 0 0 0.5px rgb(255 255 255 / 0.1),
    1px 0 2px rgb(0 0 0 / 0.2);
}

.experience-phone-side-buttons::before {
  left: -2.5px;
  top: 17%;
  width: 3px;
  height: 14%;
}

.experience-phone-side-buttons::after {
  right: -2.5px;
  top: 27%;
  width: 3px;
  height: 9%;
}

.experience-phone-bezel {
  border-radius: 2.9rem;
  background: #000;
  padding: 7px;
  height: 100%;
}

.experience-phone-display {
  border-radius: 2.5rem;
  background: #000;
  isolation: isolate;
}

.experience-dynamic-island {
  position: absolute;
  top: 12px;
  left: 50%;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 33%;
  max-width: 128px;
  height: 30px;
  padding-right: 11px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #000;
}

.experience-dynamic-island-camera {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: radial-gradient(
    circle at 35% 35%,
    #2a3d5c 0%,
    #0c1528 55%,
    #000 100%
  );
}

@media (min-width: 640px) {
  .experience-phone-shell {
    border-radius: 3.35rem;
  }

  .experience-phone-bezel {
    border-radius: 3.15rem;
    padding: 8px;
  }

  .experience-phone-display {
    border-radius: 2.75rem;
  }

  .experience-dynamic-island {
    top: 13px;
    height: 32px;
    max-width: 138px;
  }
}

@media (min-width: 1024px) {
  .experience-phone-shell {
    border-radius: 3.55rem;
  }

  .experience-phone-bezel {
    border-radius: 3.35rem;
    padding: 9px;
  }

  .experience-phone-display {
    border-radius: 2.95rem;
  }

  .experience-dynamic-island {
    top: 14px;
    height: 33px;
    max-width: 142px;
  }
}

"""

p.write_text(text[:start] + new + text[end:], encoding="utf-8")
print("ok")
