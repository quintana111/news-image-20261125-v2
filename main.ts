// news-image-20261125-v2-entry — main.ts
// One-page newspaper-style world-news image for Wednesday 25 November 2026.
// 36 stories, all verified against live sources on 25 Nov 2026.
// Builds an SVG in code and renders it to entry.png (1024x1024) with sharp.
// Run: node main.ts   (from any cwd; output lands next to this file)
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "entry.png");
const W = 1024, H = 1024;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Greedy word wrap by approximate character count.
function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) { lines.push(cur); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}
function textBlock(x: number, y: number, lines: string[], size: number, fill: string, lh: number, weight = 400, family = "Georgia, 'Times New Roman', serif"): string {
  return lines.map((ln, i) =>
    `<text x="${x}" y="${y + i * lh}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(ln)}</text>`).join("\n");
}

// ---------------------------------------------------------------- stories
type Story = { n: number; tag: string; place: string; head: string; body: string };
const LEADS: Story[] = [
  { n: 1, tag: "LEAD  •  GULF", place: "Strait of Hormuz", head: "Tankers ablaze in the Strait of Hormuz", body: "Iran's Revolutionary Guard says two oil tankers struck naval mines and caught fire on an unauthorised route." },
  { n: 2, tag: "LEAD  •  TRADE", place: "Washington", head: "US proposes tariffs on 14 trading partners", body: "The US proposes 20–40% duties on China, the EU, India and 11 others. Markets tumble; a hearing is set for 25 January." },
  { n: 3, tag: "LEAD  •  SPACE", place: "Jiuquan, China", head: "Pakistan's first astronaut reaches orbit", body: "Shenzhou-24 lifts off at 08:18 Beijing time and docks with Tiangong. Zeeshan Ali is the first Pakistani in orbit." },
];
const MIDS: Story[] = [
  { n: 4, tag: "MIDDLE EAST", place: "Saudi Arabia", head: "Houthis strike Ras Tanura refinery", body: "Houthis claim a hit on Saudi Arabia's largest refinery; a Riyadh tower strike injured 11." },
  { n: 5, tag: "WAR IN UKRAINE", place: "Samara, Russia", head: "Ukraine drones set two refineries ablaze", body: "Syzran and Kuibyshev refineries burn; Russia hits Odesa and Kyiv, killing two." },
  { n: 6, tag: "MARKETS", place: "Global", head: "Stocks slide as AI rally unravels", body: "S&P 500 falls 2.2%, Nasdaq 3.2%; Seoul's KOSPI plunges 6.2% and Tokyo's Nikkei 2.8%." },
  { n: 7, tag: "TECH / LAW", place: "New York", head: "Huawei convicted in US fraud trial", body: "A Brooklyn jury finds Huawei guilty on 10 of 12 counts, including bank fraud." },
  { n: 8, tag: "PACIFIC", place: "Canberra", head: "Australia–Solomons sign security treaty", body: "The pact bars any foreign military base on Solomon Islands." },
  { n: 9, tag: "EUROPE", place: "Madrid", head: "Spain heads to snap election on Sunday", body: "Polls put the People's Party ahead, short of a majority; Vox could enter government." },
  { n: 10, tag: "EUROPE", place: "Warsaw", head: "Poland plans no-fly zone on Ukraine border", body: "After Russian drones entered its airspace, Warsaw plans a zone to shoot down intruders." },
  { n: 11, tag: "SUDAN", place: "Blue Nile", head: "RSF drone strikes kill 19 civilians", body: "Emergency Lawyers says paramilitary drones hit two cities, killing 19 and wounding 20." },
  { n: 12, tag: "LATIN AMERICA", place: "Cartagena", head: "All hostages freed in supermarket siege", body: "Colombian forces storm an Éxito store after a 17-hour siege; all hostages freed." },
  { n: 13, tag: "CLIMATE", place: "Vatican / Antalya", head: "Pope laments collapse of COP31 talks", body: "Pope Leo XIV voices dismay as the Antalya summit ends with no climate deal." },
  { n: 14, tag: "CHINA", place: "Beijing", head: "Shanghai party chief probed for graft", body: "Chen Jining is the fourth Politburo member probed since 2025 as Xi's crackdown spreads." },
  { n: 15, tag: "US / IRAN", place: "Washington", head: "US weighs strikes on Iranian leaders", body: "Washington is reported to weigh strikes on senior Iranian figures as the crisis deepens." },
];
const ALSO: string[] = [
  "GAZA — Israel kills Hamas security chief Abuelouf in a strike.",
  "UKRAINE — Leaked figures put Russian war dead at 490,334.",
  "NIGER — Suspected IS militants kidnap a Saudi national.",
  "INDIA — Delhi tells 'cockroach' leader Das not to use his passport.",
  "WASHINGTON — Senator Booker questions Nvidia over Huang's return.",
  "AUSTIN — Dell posts record Q3 revenue of $54.9bn on AI servers.",
  "BOGOR — Toll rises to six in a flooded illegal gold mine.",
  "BENGHAZI — Two Libyan officers die of wounds from a sea-drone hit.",
  "LONDON — Poundland collapses; about 11,000 jobs at risk.",
  "LONDON — UK energy price cap to rise 26% in January.",
  "BUENOS AIRES — Argentina slips into technical recession.",
  "PRETORIA — Ramaphosa wins court battle over impeachment threat.",
  "BERLIN — Merz warns Russia wants more than Ukraine.",
  "PYONGYANG — North Korea expels a Swiss diplomat.",
  "JERUSALEM — Knesset advances inquiry into 7 October attacks.",
  "WASHINGTON — US reports three bird-flu cases, one death.",
  "REDMOND — Microsoft declares 'Code Red' after a 24-hour outage.",
  "WASHINGTON — Trump to award Giuliani the Medal of Freedom.",
  "SAN JUAN — Jennifer Barreto of Puerto Rico wins Miss Universe.",
  "BRUSSELS — EU unveils a €50bn quantum and tech fund.",
  "KYIV — Ukraine says five Russian jets hit in an airfield strike.",
];

// World-map markers (schematic; staggered so the Europe / Gulf cluster stays legible).
const MARKERS: { x: number; y: number; n: number }[] = [
  { x: 150, y: 52, n: 2 }, { x: 205, y: 96, n: 12 }, { x: 185, y: 42, n: 7 },
  { x: 448, y: 36, n: 9 }, { x: 492, y: 24, n: 10 }, { x: 530, y: 48, n: 13 },
  { x: 582, y: 58, n: 1 }, { x: 556, y: 86, n: 4 }, { x: 536, y: 70, n: 15 },
  { x: 504, y: 102, n: 11 }, { x: 640, y: 30, n: 5 }, { x: 700, y: 44, n: 14 },
  { x: 734, y: 62, n: 3 }, { x: 772, y: 52, n: 6 }, { x: 838, y: 96, n: 8 },
];

// ---------------------------------------------------------------- SVG pieces
const SANS = "Arial, Helvetica, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

function heroHormuz(x: number, y: number, w: number, h: number): string {
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1d3a52"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h * 0.52}" fill="#f4a259"/>
  <circle cx="${x + w * 0.82}" cy="${y + 30}" r="20" fill="#ffe9b0"/>
  <rect x="${x}" y="${y + h * 0.52}" width="${w}" height="${h * 0.48}" fill="#16324a"/>
  ${[0, 1, 2, 3].map(i => `<path d="M ${x + 20 + i * 110} ${y + h * 0.64} q 25 -8 50 0 q 25 8 50 0" stroke="#3d6b8e" stroke-width="3" fill="none"/>`).join("")}
  <g fill="#0d1f2d"><rect x="${x + 60}" y="${y + h * 0.46}" width="300" height="24" rx="4"/><rect x="${x + 120}" y="${y + h * 0.32}" width="14" height="40"/><rect x="${x + 260}" y="${y + h * 0.36}" width="12" height="36"/></g>
  <g><path d="M ${x + 150} ${y + h * 0.46} q -18 -48 6 -72 q 4 24 22 28 q -6 -32 16 -48 q 2 28 20 36 q 10 20 -6 56 z" fill="#ff7b1c"/><path d="M ${x + 168} ${y + h * 0.46} q -10 -30 8 -46 q 2 16 14 20 q -2 -20 12 -28 q 0 20 12 24 q 6 14 -4 30 z" fill="#ffd23f"/></g>
  <circle cx="${x + w - 70}" cy="${y + h * 0.74}" r="9" fill="#22303c"/><circle cx="${x + w - 70}" cy="${y + h * 0.74}" r="3" fill="#f4a259"/>
  <circle cx="${x + 60}" cy="${y + h * 0.80}" r="7" fill="#22303c"/><circle cx="${x + 60}" cy="${y + h * 0.80}" r="2.5" fill="#f4a259"/>
  <path d="M ${x + 330} ${y + 24} q 8 -8 16 0 q 8 -8 16 0" stroke="#3a2a1a" stroke-width="2" fill="none"/>
  <rect x="${x}" y="${y + h - 26}" width="${w}" height="26" fill="#0d1f2d" opacity="0.85"/>
  <text x="${x + 12}" y="${y + h - 8}" font-family="${SANS}" font-size="11" font-weight="700" fill="#ffe9b0">HERO  •  THE STRAIT OF HORMUZ — TANKERS ABLAZE AT DUSK</text>
  </g>`;
}
function heroSpace(x: number, y: number, w: number, h: number): string {
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0b1026"/>
  ${[[40, 30], [120, 18], [200, 44], [300, 22], [380, 38], [440, 16], [90, 70], [250, 64], [420, 70]].map(([sx, sy]) => `<circle cx="${x + sx}" cy="${y + sy}" r="2.2" fill="#ffffff"/>`).join("")}
  <circle cx="${x + w - 52}" cy="${y + 40}" r="20" fill="#e8ecf5"/><circle cx="${x + w - 60}" cy="${y + 34}" r="5" fill="#c6cede"/><circle cx="${x + w - 44}" cy="${y + 48}" r="3.5" fill="#c6cede"/>
  <g><rect x="${x + w * 0.52}" y="${y + h * 0.28}" width="12" height="80" rx="5" fill="#f2f4f8"/><path d="M ${x + w * 0.52 + 6} ${y + h * 0.28} l -8 -24 l 8 -6 l 8 6 z" fill="#c8102e"/><rect x="${x + w * 0.52 - 10}" y="${y + h * 0.50}" width="10" height="24" rx="3" fill="#c8102e"/><rect x="${x + w * 0.52 + 12}" y="${y + h * 0.50}" width="10" height="24" rx="3" fill="#c8102e"/><path d="M ${x + w * 0.52 + 6} ${y + h * 0.60} q -16 32 0 48 q 16 -16 0 -48 z" fill="#ff9f1c"/><path d="M ${x + w * 0.52 + 6} ${y + h * 0.60} q -8 20 0 30 q 8 -10 0 -30 z" fill="#ffd23f"/></g>
  <g stroke="#9fb4d8" stroke-width="2" fill="#22355e"><rect x="${x + 40}" y="${y + h * 0.42}" width="86" height="16" rx="3"/><rect x="${x + 150}" y="${y + h * 0.42}" width="86" height="16" rx="3"/><circle cx="${x + 138}" cy="${y + h * 0.46}" r="12" fill="#2c4a7c"/></g>
  <path d="M ${x + 60} ${y + h * 0.82} q 60 -14 120 0 q 60 14 120 0" stroke="#3d5a86" stroke-width="2" fill="none"/>
  <rect x="${x}" y="${y + h - 26}" width="${w}" height="26" fill="#05081a" opacity="0.85"/>
  <text x="${x + 12}" y="${y + h - 8}" font-family="${SANS}" font-size="11" font-weight="700" fill="#bcd2ff">HERO  •  SHENZHOU-24 — PAKISTAN'S FIRST ASTRONAUT LIFTS OFF</text>
  </g>`;
}
function worldMap(x: number, y: number, w: number, h: number): string {
  const land = "#d9c9a3";
  // Schematic continents spread across the full panel width.
  const blobs = [
    "M 70 20 q 60 -14 100 6 q 28 18 -6 34 q -44 20 -80 4 q -26 -18 -14 -44 z",
    "M 130 76 q 36 -4 46 20 q 6 26 -22 34 q -30 4 -34 -22 q -2 -24 10 -32 z",
    "M 430 16 q 50 -10 80 10 q 18 22 -12 36 q -46 16 -78 -6 q -16 -22 10 -40 z",
    "M 440 66 q 46 -8 64 14 q 10 30 -22 42 q -42 10 -54 -16 q -6 -28 12 -40 z",
    "M 580 12 q 80 -12 122 12 q 24 30 -18 48 q -58 22 -106 -2 q -24 -30 2 -58 z",
    "M 660 76 q 34 -4 44 16 q 4 24 -24 28 q -30 2 -32 -20 q 0 -18 12 -24 z",
    "M 800 88 q 46 -8 68 10 q 10 22 -18 30 q -38 8 -54 -10 q -8 -20 4 -30 z",
  ];
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#dcebf2"/>
  ${blobs.map(d => `<path d="${d}" transform="translate(${x}, ${y + 4})" fill="${land}" stroke="#b3a06e" stroke-width="1.5"/>`).join("")}
  <text x="${x + 12}" y="${y + 16}" font-family="${SANS}" font-size="10" font-weight="700" fill="#4a6b7c" letter-spacing="2">THE WORLD TODAY — WHERE THE NEWS HAPPENED</text>
  ${MARKERS.map(m => `<g><circle cx="${x + m.x}" cy="${y + m.y}" r="8.5" fill="#c8102e" stroke="#fff" stroke-width="1.5"/><text x="${x + m.x}" y="${y + m.y + 3.5}" font-family="${SANS}" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">${m.n}</text></g>`).join("")}
  <text x="${x + w - 12}" y="${y + h - 8}" font-family="${SANS}" font-size="9" fill="#4a6b7c" text-anchor="end">Numbers match the story numbers below  •  Schematic map, not to scale</text>
  </g>`;
}

// ---------------------------------------------------------------- build SVG
const M = 28;
const CW = W - 2 * M;
let s = "";
s += `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
s += `<rect width="${W}" height="${H}" fill="#f7f2e4"/>`;
s += `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" stroke="#111" stroke-width="2"/>`;

// Masthead
s += `<text x="${W / 2}" y="50" font-family="${SERIF}" font-size="42" font-weight="700" fill="#111" text-anchor="middle" letter-spacing="2">THE WORLD IN ONE PAGE</text>`;
s += `<text x="${W / 2}" y="74" font-family="${SANS}" font-size="13" font-weight="700" fill="#c8102e" text-anchor="middle" letter-spacing="4">WEDNESDAY  •  25 NOVEMBER 2026  •  36 STORIES  •  ONE DAY ON EARTH</text>`;
s += `<line x1="${M}" y1="86" x2="${W - M}" y2="86" stroke="#111" stroke-width="2"/>`;
s += `<line x1="${M}" y1="90" x2="${W - M}" y2="90" stroke="#111" stroke-width="0.75"/>`;
s += textBlock(M, 108, ["Gulf tankers burn  •  US tariffs hit 14 partners  •  Pakistan reaches orbit — plus markets, courts, climate and sport, all dated 25 November 2026."], 12, "#333", 15, 400, SANS);

// Hero scenes (172 tall)
s += heroHormuz(M, 118, 472, 172);
s += heroSpace(M + 496, 118, 472, 172);

// Lead stories: 3 panels, 150 tall
const leadY = 300, leadH = 150, leadW = (CW - 24) / 3;
LEADS.forEach((st, i) => {
  const x = M + i * (leadW + 12);
  s += `<rect x="${x}" y="${leadY}" width="${leadW}" height="${leadH}" fill="#fffdf6" stroke="#111" stroke-width="1.5"/>`;
  s += `<rect x="${x}" y="${leadY}" width="${leadW}" height="22" fill="#111"/>`;
  s += `<text x="${x + 10}" y="${leadY + 15}" font-family="${SANS}" font-size="10" font-weight="700" fill="#ffd23f">${esc(st.n + "  •  " + st.tag)}</text>`;
  s += `<text x="${x + leadW - 10}" y="${leadY + 15}" font-family="${SANS}" font-size="10" fill="#fff" text-anchor="end">${esc(st.place.toUpperCase())}</text>`;
  const headLines = wrap(st.head, 30);
  s += textBlock(x + 10, leadY + 48, headLines, 19, "#111", 22, 700);
  s += textBlock(x + 10, leadY + 52 + headLines.length * 22, wrap(st.body, 44).slice(0, 3), 11.5, "#333", 15, 400, SANS);
});

// World map (128 tall)
const mapY = 460, mapH = 128;
s += `<rect x="${M}" y="${mapY}" width="${CW}" height="${mapH}" fill="#dcebf2" stroke="#111" stroke-width="1.5"/>`;
s += worldMap(M, mapY, CW, mapH);

// Mid stories: 3 cols x 4 rows, 54px rows
s += `<text x="${M}" y="614" font-family="${SANS}" font-size="12" font-weight="700" fill="#111" letter-spacing="2">THE DAY IN DEPTH — 12 MORE STORIES</text>`;
s += `<line x1="${M}" y1="620" x2="${W - M}" y2="620" stroke="#111" stroke-width="1.5"/>`;
const midY0 = 630, midRowH = 52, midW = (CW - 24) / 3;
MIDS.forEach((st, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = M + col * (midW + 12), y = midY0 + row * midRowH;
  s += `<text x="${x}" y="${y + 11}" font-family="${SANS}" font-size="11" font-weight="700" fill="#c8102e">${st.n}</text>`;
  const headLines = wrap(st.head, 34).slice(0, 2);
  s += textBlock(x + 22, y + 11, headLines, 12.5, "#111", 14, 700);
  s += textBlock(x + 22, y + 13 + headLines.length * 14, wrap(st.body, 46).slice(0, 2), 10, "#444", 12.5, 400, SANS);
});

// Also stories: 3 cols x 7 rows
const alsoY0 = 866;
s += `<text x="${M}" y="${alsoY0 - 6}" font-family="${SANS}" font-size="12" font-weight="700" fill="#111" letter-spacing="2">ALSO TODAY — 21 IN BRIEF</text>`;
s += `<line x1="${M}" y1="${alsoY0}" x2="${W - M}" y2="${alsoY0}" stroke="#111" stroke-width="1.5"/>`;
ALSO.forEach((line, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = M + col * (midW + 12), y = alsoY0 + 16 + row * 15;
  s += `<text x="${x}" y="${y}" font-family="${SANS}" font-size="9" fill="#333">${esc("•  " + line)}</text>`;
});

// Footer
s += `<line x1="${M}" y1="992" x2="${W - M}" y2="992" stroke="#111" stroke-width="1"/>`;
s += `<text x="${M}" y="1006" font-family="${SANS}" font-size="8.5" fill="#555">All 36 stories dated and checked against live reporting for 25 Nov 2026 — Reuters, BBC, Just Security, AP via One Turn, Euronews. Tanker figures are as claimed by Iran's IRGC.</text>`;
s += `</svg>`;

writeFileSync(join(HERE, "entry.svg"), s);
await sharp(Buffer.from(s, "utf-8")).png().toFile(OUT);
console.log("wrote", OUT);
