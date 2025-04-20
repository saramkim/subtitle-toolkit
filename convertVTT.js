const fs = require("fs");
const path = require("path");

const RAW_DIR = path.join(__dirname, "scripts", "raw");
const EXT_INPUT = ".vtt";
const EXT_OUTPUT = ".txt";

function convertVTTtoTXT(filename) {
  const inputPath = path.join(RAW_DIR, filename + EXT_INPUT);
  const outputPath = path.join(RAW_DIR, filename + EXT_OUTPUT);

  if (!fs.existsSync(inputPath)) {
    console.error(`[ERROR] Input VTT file not found: ${inputPath}`);
    process.exit(1);
  }

  const lines = fs
    .readFileSync(inputPath, "utf-8")
    .split("\n")
    .filter((line) => {
      return (
        line.trim() !== "" && // 빈 줄 제거
        !/^\d+$/.test(line.trim()) && // 숫자만 있는 줄 제거 (인덱스)
        !/-->/.test(line) && // 시간 태그 제거
        !/^WEBVTT/.test(line) // 헤더 제거
      );
    });

  fs.writeFileSync(outputPath, lines.join("\n"), "utf-8");
  console.log(`✅ Converted: ${outputPath}`);
}

const [, , filename] = process.argv;
if (!filename) {
  console.error("Usage: node convertVTT.js <filename-without-extension>");
  process.exit(1);
}

convertVTTtoTXT(filename);
