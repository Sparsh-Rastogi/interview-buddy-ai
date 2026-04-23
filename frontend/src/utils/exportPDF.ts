import html2pdf from "html2pdf.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WeekEntry {
  week: number;
  focus: string;
  topics: string[];
  problems: string[];
}

export interface RoadmapData {
  roadmap: WeekEntry[];
}

export interface RoadmapPDFOptions {
  fileName?: string;
  title?: string;
  subtitle?: string;
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const T = {
  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontMono: "'Menlo', 'Courier New', monospace",

  ink: "#1C1917",
  inkLight: "#57534E",
  inkFaint: "#A8A29E",

  accent: "#2563EB",
  accentBg: "#EFF6FF",

  green: "#16A34A",
  greenBg: "#F0FDF4",

  amber: "#B45309",
  amberBg: "#FFFBEB",

  border: "#E7E5E4",
  headerBg: "#1C1917",
  pageBg: "#FAFAF9",
  white: "#FFFFFF",
} as const;

// ─── Chips (Centered & Clean) ─────────────────────────────────────────────────

function chips(items: string[], color: string, bg: string): string {
  if (!items.length) return "";

  return items
    .map(
      (item) => `
      <span style="
        display: inline-flex;
        align-items: center;
        justify-content: center;

        background: ${bg};
        color: ${color};
        border: 1px solid ${color}30;

        border-radius: 999px;
        padding: 4px 10px;

        font-size: 11px;
        font-family: ${T.font};
        font-weight: 500;

        margin: 0 6px 6px 0;
        white-space: nowrap;
      ">
        ${item}
      </span>`
    )
    .join("");
}

// ─── Section Label ────────────────────────────────────────────────────────────

function sectionLabel(text: string): string {
  return `
    <div style="
      font-family: ${T.fontMono};
      font-size: 9px;
      font-weight: 700;
      color: ${T.inkFaint};
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 6px;
    ">${text}</div>`;
}

// ─── Week Card ────────────────────────────────────────────────────────────────

function weekCard(entry: WeekEntry): string {
  return `
    <div style="
      background: ${T.white};
      border: 1px solid ${T.border};
      border-radius: 10px;
      padding: 18px 20px 16px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    ">

      <!-- Header -->
      <div style="
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      ">

        <!-- Week Badge -->
        <div style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          

          background: ${T.accent};
          color: ${T.white};

          font-family: ${T.fontMono};
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;

          border-radius: 999px;
          height: 28px;
          padding-left: 10px;
          padding-right: 10px;
          padding-bottom: 12px;
        ">
          Week ${entry.week}
        </div>

        <!-- Title -->
        <div style="
          font-family: ${T.font};
          font-size: 16px;
          font-weight: 700;
          color: ${T.ink};
          line-height: 1.25;
        ">
          ${entry.focus}
        </div>
      </div>

      <!-- Divider -->
      <div style="
        height: 1px;
        background: ${T.border};
        margin: 12px 0 14px;
      "></div>

      <!-- Content -->
      <div style="display: flex; gap: 24px;">

        <!-- Topics -->
        <div style="flex: 1;">
          ${sectionLabel("Topics")}
          <div style="line-height: 1.8;">
            ${chips(entry.topics, T.green, T.greenBg)}
          </div>
        </div>

        <!-- Divider -->
        <div style="width: 1px; background: ${T.border};"></div>

        <!-- Problems -->
        <div style="flex: 1;">
          ${sectionLabel("Practice Problems")}
          <div style="line-height: 1.8;">
            ${chips(entry.problems, T.amber, T.amberBg)}
          </div>
        </div>

      </div>
    </div>`;
}

// ─── Full Document ────────────────────────────────────────────────────────────

function buildDocument(
  data: RoadmapData,
  title: string,
  subtitle: string
): string {
  const totalWeeks = data.roadmap.length;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cards = data.roadmap.map(weekCard).join("");

  return `
    <div style="
      font-family: ${T.font};
      background: ${T.pageBg};
      color: ${T.ink};
    ">

      <!-- Header -->
      <div style="
        background: ${T.headerBg};
        padding: 28px 32px 22px;
      ">
        <div style="
          font-size: 24px;
          font-weight: 800;
          color: ${T.white};
          margin-bottom: 6px;
        ">
          ${title}
        </div>
        <div style="
          font-size: 12px;
          color: #D6D3D1;
        ">
          ${subtitle}
        </div>
      </div>

      <!-- Meta -->
      <div style="
        background: #292524;
        padding: 8px 32px;
        display: flex;
        justify-content: space-between;
        margin-bottom: 22px;
      ">
        <span style="
          font-family: ${T.fontMono};
          font-size: 9px;
          color: #78716C;
          text-transform: uppercase;
        ">
          Generated ${today}
        </span>
        <span style="
          font-family: ${T.fontMono};
          font-size: 9px;
          color: #78716C;
          text-transform: uppercase;
        ">
          ${totalWeeks} week${totalWeeks !== 1 ? "s" : ""}
        </span>
      </div>

      <!-- Cards -->
      <div style="padding: 0 28px;">
        ${cards}
      </div>

      <!-- Footer -->
      <div style="
        border-top: 1px solid ${T.border};
        margin: 14px 28px 0;
        padding: 10px 0;
        display: flex;
        justify-content: space-between;
      ">
        <span style="
          font-family: ${T.fontMono};
          font-size: 9px;
          color: ${T.inkFaint};
          text-transform: uppercase;
        ">
          Auto-generated roadmap
        </span>
        <span style="
          font-family: ${T.fontMono};
          font-size: 9px;
          color: ${T.inkFaint};
          text-transform: uppercase;
        ">
          Page 1
        </span>
      </div>

    </div>`;
}

// ─── Export Function ──────────────────────────────────────────────────────────

export function downloadRoadmapPDF(
  data: RoadmapData,
  options: RoadmapPDFOptions = {}
): void {
  const {
    fileName = "roadmap.pdf",
    title = "Learning Roadmap",
    subtitle = `${data.roadmap.length}-week structured learning plan`,
  } = options;

  const html = buildDocument(data, title, subtitle);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  html2pdf()
    .set({
      margin: 0,
      filename: fileName,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(wrapper)
    .save();
}