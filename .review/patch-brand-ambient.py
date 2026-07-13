from pathlib import Path

p = Path(r"D:\quickpickapp\app\globals.css")
text = p.read_text(encoding="utf-8")
start = text.index("/* Soft ambient behind phone")
end = text.index(".experience-headline {")

new = r'''/* ——— Q Pick brand ambient (right field, behind phone) ——— */
.experience-ambient {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(62%, 820px);
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  color: #2563eb;
}

.experience-ambient-glow {
  position: absolute;
  left: 42%;
  top: 46%;
  width: 120%;
  height: 95%;
  transform: translate(-40%, -50%);
  background: radial-gradient(
    ellipse at center,
    rgb(10 132 255 / 0.38) 0%,
    rgb(37 99 235 / 0.22) 34%,
    rgb(37 99 235 / 0.08) 58%,
    transparent 74%
  );
  filter: blur(36px);
  animation: experience-glow-breathe 10s ease-in-out infinite;
}

.experience-ambient-glow-soft {
  position: absolute;
  left: 55%;
  top: 58%;
  width: 70%;
  height: 55%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle,
    rgb(10 132 255 / 0.2) 0%,
    transparent 70%
  );
  filter: blur(48px);
  animation: experience-glow-breathe 12s ease-in-out infinite reverse;
}

.experience-ambient-streak {
  position: absolute;
  height: 1.5px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    transparent,
    rgb(10 132 255 / 0.55),
    rgb(37 99 235 / 0.15),
    transparent
  );
  filter: blur(0.4px);
  opacity: 0.55;
  transform-origin: left center;
}

.experience-ambient-streak--a {
  top: 28%;
  left: 8%;
  width: 58%;
  transform: rotate(-18deg);
  animation: experience-streak-drift 9s ease-in-out infinite;
}

.experience-ambient-streak--b {
  top: 52%;
  left: 18%;
  width: 48%;
  transform: rotate(12deg);
  animation: experience-streak-drift 11s ease-in-out infinite reverse;
  animation-delay: -2s;
}

.experience-ambient-streak--c {
  top: 72%;
  left: 4%;
  width: 42%;
  transform: rotate(-8deg);
  animation: experience-streak-drift 10s ease-in-out infinite;
  animation-delay: -4s;
}

.experience-ambient-glass {
  position: absolute;
  border-radius: 999px;
  border: 1px solid rgb(37 99 235 / 0.14);
  background: linear-gradient(
    145deg,
    rgb(255 255 255 / 0.35),
    rgb(10 132 255 / 0.08)
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.45);
}

.experience-ambient-glass--lg {
  width: 180px;
  height: 180px;
  top: 12%;
  right: 8%;
  opacity: 0.45;
  animation: experience-glass-float 14s ease-in-out infinite;
}

.experience-ambient-glass--md {
  width: 110px;
  height: 110px;
  bottom: 18%;
  left: 12%;
  opacity: 0.4;
  animation: experience-glass-float 11s ease-in-out infinite reverse;
}

.experience-ambient-glass--sm {
  width: 64px;
  height: 64px;
  top: 42%;
  right: 28%;
  opacity: 0.5;
  animation: experience-glass-float 9s ease-in-out infinite;
  animation-delay: -3s;
}

.experience-ambient-blob {
  position: absolute;
  border-radius: 40% 60% 55% 45%;
  filter: blur(28px);
  opacity: 0.35;
}

.experience-ambient-blob--a {
  width: 220px;
  height: 160px;
  top: 18%;
  left: 20%;
  background: rgb(10 132 255 / 0.28);
  animation: experience-blob-morph 16s ease-in-out infinite;
}

.experience-ambient-blob--b {
  width: 180px;
  height: 140px;
  bottom: 14%;
  right: 10%;
  background: rgb(37 99 235 / 0.22);
  animation: experience-blob-morph 13s ease-in-out infinite reverse;
}

.experience-ambient-links {
  position: absolute;
  inset: 4% 2% 6% 4%;
  width: 96%;
  height: 92%;
  opacity: 0.28;
}

.experience-ambient-link {
  stroke: #0a84ff;
  stroke-width: 1.25;
  stroke-linecap: round;
  stroke-dasharray: 6 10;
  animation: experience-link-flow 8s linear infinite;
}

.experience-ambient-link--b {
  stroke: #2563eb;
  animation-duration: 10s;
  animation-direction: reverse;
}

.experience-ambient-link--c {
  opacity: 0.7;
  animation-duration: 12s;
}

.experience-ambient-fleet {
  position: absolute;
  inset: 0;
}

.experience-ambient-vehicle {
  position: absolute;
  color: #2563eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: 0.55;
  filter: drop-shadow(0 6px 14px rgb(37 99 235 / 0.18));
}

.experience-ambient-car {
  width: 52px;
  height: auto;
}

.experience-ambient-pulse {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #0a84ff;
  box-shadow: 0 0 0 0 rgb(10 132 255 / 0.45);
  animation: experience-gps-pulse 2.4s ease-out infinite;
  order: 2;
}

.experience-ambient-vehicle--a {
  top: 22%;
  left: 18%;
  animation: experience-drive-a 22s ease-in-out infinite;
}

.experience-ambient-vehicle--b {
  top: 58%;
  left: 10%;
  animation: experience-drive-b 26s ease-in-out infinite;
}

.experience-ambient-vehicle--c {
  top: 36%;
  right: 14%;
  animation: experience-drive-c 24s ease-in-out infinite;
}

.experience-ambient-vehicle--d {
  bottom: 20%;
  left: 28%;
  animation: experience-drive-d 20s ease-in-out infinite;
}

.experience-ambient-vehicle--e {
  top: 14%;
  right: 22%;
  animation: experience-drive-e 28s ease-in-out infinite;
  opacity: 0.42;
}

.experience-ambient-vehicle--e .experience-ambient-car {
  width: 44px;
}

.experience-ambient-card {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 148px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgb(37 99 235 / 0.16);
  background: linear-gradient(
    160deg,
    rgb(255 255 255 / 0.42),
    rgb(10 132 255 / 0.1)
  );
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    0 10px 30px rgb(37 99 235 / 0.08),
    inset 0 1px 0 rgb(255 255 255 / 0.5);
  color: #0f172a;
  font-family: var(--font-inter), system-ui, sans-serif;
}

.experience-ambient-card--arrive {
  top: 18%;
  left: 6%;
  opacity: 0.1;
  animation: experience-card-float 8s ease-in-out infinite;
}

.experience-ambient-card--confirmed {
  bottom: 16%;
  right: 8%;
  opacity: 0.09;
  animation: experience-card-float 9.5s ease-in-out infinite reverse;
}

.experience-ambient-card-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #0a84ff;
  margin-bottom: 4px;
  box-shadow: 0 0 0 3px rgb(10 132 255 / 0.15);
}

.experience-ambient-card-dot--ok {
  background: #2563eb;
}

.experience-ambient-card-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #0f172a;
}

.experience-ambient-card-meta {
  font-size: 10px;
  font-weight: 500;
  color: #475569;
}

@keyframes experience-glow-breathe {
  0%,
  100% {
    opacity: 0.85;
    transform: translate(-40%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-40%, -50%) scale(1.06);
  }
}

@keyframes experience-streak-drift {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes experience-glass-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -12px, 0);
  }
}

@keyframes experience-blob-morph {
  0%,
  100% {
    border-radius: 40% 60% 55% 45%;
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    border-radius: 55% 45% 40% 60%;
    transform: translate3d(8px, -10px, 0) scale(1.08);
  }
}

@keyframes experience-link-flow {
  to {
    stroke-dashoffset: -80;
  }
}

@keyframes experience-gps-pulse {
  0% {
    box-shadow: 0 0 0 0 rgb(10 132 255 / 0.45);
    opacity: 1;
  }
  70% {
    box-shadow: 0 0 0 10px rgb(10 132 255 / 0);
    opacity: 0.35;
  }
  100% {
    box-shadow: 0 0 0 0 rgb(10 132 255 / 0);
    opacity: 0.2;
  }
}

@keyframes experience-card-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -8px, 0);
  }
}

@keyframes experience-drive-a {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(48px, 28px, 0);
  }
}

@keyframes experience-drive-b {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(56px, -36px, 0);
  }
}

@keyframes experience-drive-c {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-40px, 44px, 0);
  }
}

@keyframes experience-drive-d {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(36px, -24px, 0);
  }
}

@keyframes experience-drive-e {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-52px, 20px, 0);
  }
}

@media (max-width: 1023px) {
  .experience-ambient {
    width: 100%;
    opacity: 0.65;
  }

  .experience-ambient-card {
    display: none;
  }
}

'''

p.write_text(text[:start] + new + text[end:], encoding="utf-8")
print("ambient css replaced")
