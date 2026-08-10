const fs = require("fs");
const path = require("path");

const targetPath = path.join(
  process.cwd(),
  "node_modules",
  "expo-modules-jsi",
  "apple",
  "Sources",
  "ExpoModulesJSI",
  "Coding",
  "JavaScriptCodable+Date.swift"
);

const oldLine = "  guard milliseconds.isFinite, abs(milliseconds) <= maxJavaScriptDateMilliseconds else {";
const newBlock = [
  "  let absoluteMilliseconds: Double = Swift.abs(milliseconds)",
  "  guard milliseconds.isFinite, absoluteMilliseconds <= maxJavaScriptDateMilliseconds else {"
].join("\n");

try {
  if (!fs.existsSync(targetPath)) {
    console.log("[postinstall] expo-modules-jsi Swift file not found, skipping patch.");
    process.exit(0);
  }

  const original = fs.readFileSync(targetPath, "utf8");

  if (original.includes("absoluteMilliseconds <= maxJavaScriptDateMilliseconds")) {
    console.log("[postinstall] expo-modules-jsi Swift patch already applied.");
    process.exit(0);
  }

  if (!original.includes(oldLine)) {
    console.log("[postinstall] target line not found, skipping patch.");
    process.exit(0);
  }

  const patched = original.replace(oldLine, newBlock);
  fs.writeFileSync(targetPath, patched, "utf8");
  console.log("[postinstall] Applied expo-modules-jsi Swift patch.");
} catch (error) {
  console.error("[postinstall] Failed to patch expo-modules-jsi:", error.message);
  process.exit(1);
}
