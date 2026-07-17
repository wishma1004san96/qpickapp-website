/**
 * Codemod: never animate opacity from undefined.
 * Replaces `initial={reduceMotion ? false : { opacity: 0, ... }}`
 * and undefined exits with explicit numeric opacity.
 */
const fs = require("fs");
const path = require("path");

const roots = [
  path.join("components", "marketing"),
  path.join("components", "pages"),
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

const files = roots.flatMap((r) => walk(r));
let changedFiles = 0;

for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  const before = src;

  // initial={reduceMotion ? false : { opacity: 0, y: N }}
  src = src.replace(
    /initial=\{reduceMotion \? false : \{ opacity: 0, y: (-?[\d.]+) \}\}/g,
    "initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : $1 }}",
  );

  // initial={reduceMotion ? false : { opacity: 0, x: N }}
  src = src.replace(
    /initial=\{reduceMotion \? false : \{ opacity: 0, x: (-?[\d.]+) \}\}/g,
    "initial={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : $1 }}",
  );

  // initial={reduceMotion ? false : { opacity: 0, scale: N }}
  src = src.replace(
    /initial=\{reduceMotion \? false : \{ opacity: 0, scale: (-?[\d.]+) \}\}/g,
    "initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : $1 }}",
  );

  // initial={reduceMotion ? false : { opacity: 0, y: N, scale: M }}
  src = src.replace(
    /initial=\{reduceMotion \? false : \{ opacity: 0, y: (-?[\d.]+), scale: (-?[\d.]+) \}\}/g,
    "initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : $1, scale: reduceMotion ? 1 : $2 }}",
  );

  // initial={reduceMotion ? false : { opacity: 0, scale: N }} already done
  // initial={reduceMotion ? false : { opacity: 0 }}
  src = src.replace(
    /initial=\{reduceMotion \? false : \{ opacity: 0 \}\}/g,
    "initial={{ opacity: reduceMotion ? 1 : 0 }}",
  );

  // initial={reduceMotion ? false : { opacity: 0.4 }}
  src = src.replace(
    /initial=\{reduceMotion \? false : \{ opacity: (0\.[\d]+) \}\}/g,
    "initial={{ opacity: reduceMotion ? 1 : $1 }}",
  );

  // initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
  src = src.replace(
    /initial=\{reduceMotion \? false : \{ pathLength: 0, opacity: 0 \}\}/g,
    "initial={{ pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }}",
  );

  // initial={reduceMotion ? false : { y: N, opacity: 0 }}
  src = src.replace(
    /initial=\{reduceMotion \? false : \{ y: (-?[\d.]+), opacity: 0 \}\}/g,
    "initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : $1 }}",
  );

  // initial={reduceMotion ? false : { scale: N, opacity: 0 }}
  src = src.replace(
    /initial=\{reduceMotion \? false : \{ scale: (-?[\d.]+), opacity: 0 \}\}/g,
    "initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : $1 }}",
  );

  // initial={reduceMotion ? false : { scaleX: 0 }} — no opacity, leave but make resting safe
  src = src.replace(
    /initial=\{reduceMotion \? false : \{ scaleX: 0 \}\}/g,
    "initial={{ scaleX: reduceMotion ? 1 : 0 }}",
  );

  // Multiline: reduceMotion ? false : { opacity: 0, scale: 1.02 }
  src = src.replace(
    /reduceMotion \? false : \{ opacity: 0, scale: ([\d.]+) \}/g,
    "reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: $1 }",
  );

  // Multiline blur filter
  src = src.replace(
    /reduceMotion \? false : \{ opacity: 0, y: ([\d.]+), filter: "blur\(([\d.]+)px\)" \}/g,
    'reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: $1, filter: "blur($2px)" }',
  );

  // exit={reduceMotion ? undefined : { opacity: 0 }}
  src = src.replace(
    /exit=\{reduceMotion \? undefined : \{ opacity: 0 \}\}/g,
    "exit={{ opacity: reduceMotion ? 1 : 0 }}",
  );

  // exit={reduceMotion ? undefined : { opacity: 0, y: N }}
  src = src.replace(
    /exit=\{reduceMotion \? undefined : \{ opacity: 0, y: (-?[\d.]+) \}\}/g,
    "exit={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : $1 }}",
  );

  // exit multiline with filter
  src = src.replace(
    /reduceMotion\s*\?\s*undefined\s*:\s*\{\s*opacity:\s*0,\s*y:\s*(-?[\d.]+),\s*filter:\s*"blur\(([\d.]+)px\)"\s*\}/g,
    'reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: $1, filter: "blur($2px)" }',
  );

  if (src !== before) {
    fs.writeFileSync(file, src);
    changedFiles += 1;
    console.log("updated", file);
  }
}

console.log("changed", changedFiles, "files");
