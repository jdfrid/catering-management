/**
 * יוצר public/guide/madrich-meshutaf.pdf מקובץ madrich-print.html
 * הרצה: npm run guide:pdf
 */
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "public", "guide", "madrich-print.html");
const outPath = path.join(root, "public", "guide", "madrich-meshutaf.pdf");

if (!fs.existsSync(htmlPath)) {
  console.error("Missing:", htmlPath);
  process.exit(1);
}

const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 60000 });
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "12mm", bottom: "14mm", left: "12mm", right: "12mm" },
  });
  console.log("PDF created:", outPath);
} finally {
  await browser.close();
}
