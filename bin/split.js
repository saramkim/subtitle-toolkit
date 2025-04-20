#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const CONFIG = {
  baseDir: "scripts",
  inputSubdir: "raw",
  chunkSubdir: "chunks",
  translatedSubdir: "translated",
  encoding: "utf-8",
  chunkSize: 50000,
  extension: ".txt",
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function initTranslationFiles(baseName) {
  const translatedDir = path.join(
    CONFIG.baseDir,
    CONFIG.translatedSubdir,
    baseName
  );
  ensureDir(translatedDir);

  const translationPath = path.join(translatedDir, `${baseName}.ko.txt`);
  const summaryPath = path.join(translatedDir, `${baseName}.summary.md`);

  if (!fs.existsSync(translationPath)) {
    const translationTemplate = [
      `# Translation for ${baseName}\n`,
      `# Paste translated lines here (one per original line).\n`,
    ].join("\n");
    fs.writeFileSync(translationPath, translationTemplate, CONFIG.encoding);
    console.log(`📝 Created: ${translationPath}`);
  }

  if (!fs.existsSync(summaryPath)) {
    const summaryTemplate = `# Summary for ${baseName}`;
    fs.writeFileSync(summaryPath, summaryTemplate, CONFIG.encoding);
    console.log(`📝 Created: ${summaryPath}`);
  }
}

function splitFile(baseName) {
  const inputFile = path.join(
    CONFIG.baseDir,
    CONFIG.inputSubdir,
    baseName + CONFIG.extension
  );
  const outputDir = path.join(CONFIG.baseDir, CONFIG.chunkSubdir, baseName);

  if (!fs.existsSync(inputFile)) {
    console.error(`[ERROR] Input file not found: ${inputFile}`);
    process.exit(1);
  }

  ensureDir(outputDir);

  console.log(`Reading: ${inputFile}`);
  const content = fs.readFileSync(inputFile, CONFIG.encoding);
  const totalLength = content.length;

  console.log(`Found ${totalLength.toLocaleString()} characters`);
  console.log(
    `Splitting into ${CONFIG.chunkSize.toLocaleString()} char chunks...`
  );

  let part = 1;
  let processed = 0;

  for (let i = 0; i < totalLength; i += CONFIG.chunkSize) {
    const chunk = content.slice(i, i + CONFIG.chunkSize);
    const outputPath = path.join(outputDir, `part${part}${CONFIG.extension}`);
    fs.writeFileSync(outputPath, chunk, CONFIG.encoding);

    processed += chunk.length;
    const progress = ((processed / totalLength) * 100).toFixed(1);
    console.log(`[${progress}%] Saved: ${outputPath}`);

    part++;
  }

  initTranslationFiles(baseName);
  console.log(`\n✅ Done. ${part - 1} chunks saved in: ${outputDir}`);
}

const [, , baseName] = process.argv;
if (!baseName) {
  console.error("Usage: node split.js <filename-without-extension>");
  process.exit(1);
}

splitFile(baseName);
