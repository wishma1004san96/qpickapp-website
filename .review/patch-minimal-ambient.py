from pathlib import Path

p = Path(r"D:\quickpickapp\app\globals.css")
text = p.read_text(encoding="utf-8")
start = text.index("/* ——— Q Pick brand ambient")
end = text.index(".experience-headline {")

new = r'''/* Minimal ambient — soft blue glow + tiny particles behind phone only */
.experience-ambient {
  position: absolute;
  inset: -18% -32% -14% -28%;
  z-index: 0;
  pointer-events: none;
  overflow: visible;
}

.experience-ambient-glow {
  position: absolute;
  left: 50%;
  top: 48%;
  width: 115%;
  height: 88%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    ellipse at center,
    rgb(10 132 255 / 0.22) 0%,
    rgb(37 99 235 / 0.1) 42%,
    transparent 72%
  );
  filter: blur(42px);
  opacity: 0.55;
  animation: experience-glow-breathe 11s ease-in-out infinite;
}

.experience-ambient-volume {
  position: absolute;
  left: 52%;
  top: 52%;
  width: 70%;
  height: 58%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle,
    rgb(10 132 255 / 0.12) 0%,
    transparent 68%
  );
  filter: blur(56px);
  opacity: 0.45;
}

.experience-ambient-particle {
  position: absolute;
  left: var(--px);
  top: var(--py);
  width: calc(2.5px * var(--ps));
  height: calc(2.5px * var(--ps));
  border-radius: 999px;
  background: #0a84ff;
  opacity: 0.28;
  animation: experience-particle-drift 8s ease-in-out infinite;
  animation-delay: var(--pd);
}

@keyframes experience-glow-breathe {
  0%,
  100% {
    opacity: 0.45;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.62;
    transform: translate(-50%, -50%) scale(1.04);
  }
}

@keyframes experience-particle-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 0.18;
  }
  50% {
    transform: translate3d(0, -8px, 0);
    opacity: 0.35;
  }
}

'''

# Also patch reduced-motion block later
p.write_text(text[:start] + new + text[end:], encoding="utf-8")
print("minimal ambient css applied")
