import html2pdf from "html2pdf.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuestionFeedback = {
  question: string;
  answer?: string;
  score: number;
  comment: string;
};

export type EvaluationResult = {
  overallScore: number;
  dimensions: {
    technical: number;
    problemSolving: number;
    communication: number;
    depth: number;
    clarity: number;
  };
  feedback: QuestionFeedback[];
  mistakes: string[];
  strengths: string[];
};

export interface EvalPDFOptions {
  fileName?: string;
  candidateName?: string;
  role?: string;
  interviewDate?: string;
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const T = {
  font:     "'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono:     "'Menlo', 'Courier New', monospace",

  ink:      "#18181B",
  inkLight: "#52525B",
  inkFaint: "#A1A1AA",

  pageBg:   "#F9FAFB",
  white:    "#FFFFFF",
  border:   "#E4E4E7",

  // Score band colors
  excellent: { text: "#166534", bg: "#F0FDF4", border: "#BBF7D0" },
  good:      { text: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE" },
  average:   { text: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
  poor:      { text: "#991B1B", bg: "#FEF2F2", border: "#FECACA" },

  // Dimension accent colors (one per dimension)
  dimColors: ["#6366F1", "#0EA5E9", "#10B981", "#F59E0B", "#EC4899"],

  headerBg: "#18181B",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreBand(score: number) {
  if (score >= 85) return T.excellent;
  if (score >= 65) return T.good;
  if (score >= 45) return T.average;
  return T.poor;
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 45) return "Needs Improvement";
  return "Poor";
}

function verdict(score: number): { label: string; color: string; bg: string } {
  if (score >= 85) return { label: "Strong Hire",    color: "#166534", bg: "#DCFCE7" };
  if (score >= 65) return { label: "Hire",           color: "#1E40AF", bg: "#DBEAFE" };
  if (score >= 45) return { label: "Consider",       color: "#92400E", bg: "#FEF3C7" };
  return               { label: "No Hire",           color: "#991B1B", bg: "#FEE2E2" };
}

/** Circular-style score ring rendered as a plain box (PDF-safe) */
function scoreBigBadge(score: number): string {
  const band = scoreBand(score);
  return `
    <div style="
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: ${band.bg};
      border: 3px solid ${band.border};
    ">
      <span style="
        font-family: ${T.font};
        font-size: 28px;
        font-weight: 800;
        color: ${band.text};
        line-height: 1;
      ">${score}</span>
      <span style="
        font-family: ${T.font};
        font-size: 9px;
        font-weight: 600;
        color: ${band.text};
        letter-spacing: 0.05em;
        margin-top: 3px;
      ">/ 100</span>
    </div>`;
}

/** Horizontal bar for dimension scores */
function dimensionBar(label: string, score: number, color: string): string {
  const band = scoreBand(score);
  const pct  = Math.min(100, Math.max(0, score));
  return `
    <div style="margin-bottom: 10px;">
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      ">
        <span style="
          font-family: ${T.font};
          font-size: 11px;
          font-weight: 600;
          color: ${T.inkLight};
          text-transform: capitalize;
        ">${label.replace(/([A-Z])/g, " $1").trim()}</span>
        <span style="
          font-family: ${T.mono};
          font-size: 10px;
          font-weight: 700;
          color: ${band.text};
          background: ${band.bg};
          border: 1px solid ${band.border};
          border-radius: 3px;
          padding: 1px 6px;
        ">${score}</span>
      </div>
      <!-- Track -->
      <div style="
        background: ${T.border};
        border-radius: 99px;
        height: 7px;
        width: 100%;
        overflow: hidden;
      ">
        <div style="
          background: ${color};
          width: ${pct}%;
          height: 100%;
          border-radius: 99px;
        "></div>
      </div>
    </div>`;
}

function sectionTitle(text: string, icon?: string): string {
  return `
    <div style="
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid ${T.border};
    ">
      ${icon ? `<span style="font-size:14px;">${icon}</span>` : ""}
      <span style="
        font-family: ${T.font};
        font-size: 13px;
        font-weight: 700;
        color: ${T.ink};
        letter-spacing: -0.01em;
      ">${text}</span>
    </div>`;
}

function bulletList(items: string[], color: string, dotColor: string): string {
  if (!items.length) return `<p style="color:${T.inkFaint}; font-size:11px; font-style:italic;">None noted.</p>`;
  return items.map(item => `
    <div style="
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 7px;
    ">
      <span style="
        flex-shrink: 0;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${dotColor};
        margin-top: 5px;
      "></span>
      <span style="
        font-family: ${T.font};
        font-size: 11px;
        line-height: 1.6;
        color: ${color};
      ">${item}</span>
    </div>`).join("");
}

function questionCard(fb: QuestionFeedback, index: number): string {
  const band = scoreBand(fb.score);
  return `
    <div style="
      background: ${T.white};
      border: 1px solid ${T.border};
      border-left: 3px solid ${band.border};
      border-radius: 6px;
      padding: 14px 16px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    ">
      <!-- Q header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div style="flex: 1; margin-right: 12px;">
          <span style="
            font-family: ${T.mono};
            font-size: 9px;
            font-weight: 700;
            color: ${T.inkFaint};
            letter-spacing: 0.07em;
            text-transform: uppercase;
            display: block;
            margin-bottom: 3px;
          ">Q${index + 1}</span>
          <span style="
            font-family: ${T.font};
            font-size: 12px;
            font-weight: 600;
            color: ${T.ink};
            line-height: 1.4;
          ">${fb.question}</span>
        </div>
        <div style="
          flex-shrink: 0;
          background: ${band.bg};
          border: 1px solid ${band.border};
          border-radius: 20px;
          padding: 3px 10px;
          font-family: ${T.mono};
          font-size: 11px;
          font-weight: 700;
          color: ${band.text};
          white-space: nowrap;
        ">${fb.score}/100 · ${scoreLabel(fb.score)}</div>
      </div>

      ${fb.answer ? `
      <!-- Answer snippet -->
      <div style="
        background: #F4F4F5;
        border-radius: 4px;
        padding: 8px 12px;
        margin-bottom: 8px;
      ">
        <span style="
          font-family: ${T.mono};
          font-size: 9px;
          font-weight: 700;
          color: ${T.inkFaint};
          letter-spacing: 0.07em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 4px;
        ">Candidate's Answer</span>
        <span style="
          font-family: ${T.font};
          font-size: 11px;
          color: ${T.inkLight};
          line-height: 1.6;
        ">${fb.answer}</span>
      </div>` : ""}

      <!-- Evaluator comment -->
      <div style="
        font-family: ${T.font};
        font-size: 11px;
        color: ${T.inkLight};
        line-height: 1.6;
        font-style: italic;
        border-left: 2px solid ${band.border};
        padding-left: 10px;
      ">${fb.comment}</div>
    </div>`;
}

// ─── Full Document ────────────────────────────────────────────────────────────

function buildDocument(
  result: EvaluationResult,
  candidateName: string,
  role: string,
  interviewDate: string,
): string {
  const v    = verdict(result.overallScore);
  const dims = Object.entries(result.dimensions);

  return `
  <div style="
    font-family: ${T.font};
    background: ${T.pageBg};
    color: ${T.ink};
  ">

    <!-- ── Header ── -->
    <div style="background: ${T.headerBg}; padding: 28px 32px 22px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="
            font-family: ${T.mono};
            font-size: 9px;
            font-weight: 700;
            color: #71717A;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 6px;
          ">Interview Evaluation Report</div>
          <div style="
            font-size: 22px;
            font-weight: 800;
            color: #FFFFFF;
            letter-spacing: -0.03em;
            line-height: 1.2;
            margin-bottom: 4px;
          ">${candidateName}</div>
          <div style="font-size: 12px; color: #A1A1AA; font-weight: 400;">
            ${role} &nbsp;·&nbsp; ${interviewDate}
          </div>
        </div>

        <!-- Verdict badge -->
        <div style="
          background: ${v.bg};
          border-radius: 6px;
          padding: 8px 18px;
          text-align: center;
          flex-shrink: 0;
        ">
          <div style="
            font-family: ${T.mono};
            font-size: 9px;
            font-weight: 700;
            color: ${v.color};
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 2px;
          ">Verdict</div>
          <div style="
            font-size: 16px;
            font-weight: 800;
            color: ${v.color};
          ">${v.label}</div>
        </div>
      </div>
    </div>

    <!-- ── Score + Dimensions ── -->
    <div style="
      background: ${T.white};
      border-bottom: 1px solid ${T.border};
      padding: 24px 32px;
      display: flex;
      gap: 32px;
      align-items: flex-start;
    ">
      <!-- Big score -->
      <div style="flex-shrink: 0; text-align: center;">
        ${scoreBigBadge(result.overallScore)}
        <div style="
          font-family: ${T.font};
          font-size: 10px;
          font-weight: 600;
          color: ${T.inkFaint};
          margin-top: 6px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        ">Overall</div>
      </div>

      <!-- Vertical divider -->
      <div style="width: 1px; background: ${T.border}; align-self: stretch; flex-shrink: 0;"></div>

      <!-- Dimension bars -->
      <div style="flex: 1;">
        ${dims.map(([key, val], i) =>
          dimensionBar(key, val, T.dimColors[i % T.dimColors.length])
        ).join("")}
      </div>
    </div>

    <!-- ── Strengths & Mistakes ── -->
    <div style="
      padding: 24px 32px;
      display: flex;
      gap: 20px;
    ">
      <!-- Strengths -->
      <div style="
        flex: 1;
        background: ${T.white};
        border: 1px solid ${T.border};
        border-radius: 8px;
        padding: 16px 18px;
      ">
        ${sectionTitle("Strengths", "✦")}
        ${bulletList(result.strengths, "#166534", "#22C55E")}
      </div>

      <!-- Mistakes -->
      <div style="
        flex: 1;
        background: ${T.white};
        border: 1px solid ${T.border};
        border-radius: 8px;
        padding: 16px 18px;
      ">
        ${sectionTitle("Areas to Improve", "✦")}
        ${bulletList(result.mistakes, "#991B1B", "#EF4444")}
      </div>
    </div>

    <!-- ── Per-Question Feedback ── -->
    <div style="padding: 0 32px 24px;">
      ${sectionTitle(`Question-by-Question Feedback &nbsp;<span style="font-size:11px; font-weight:400; color:${T.inkFaint};">${result.feedback.length} question${result.feedback.length !== 1 ? "s" : ""}</span>`)}
      ${result.feedback.map((fb, i) => questionCard(fb, i)).join("")}
    </div>

    <!-- ── Footer ── -->
    <div style="
      border-top: 1px solid ${T.border};
      margin: 0 32px;
      padding: 12px 0;
      display: flex;
      justify-content: space-between;
    ">
      <span style="font-family:${T.mono}; font-size:9px; color:${T.inkFaint}; text-transform:uppercase; letter-spacing:0.05em;">
        Confidential · For internal use only
      </span>
      <span style="font-family:${T.mono}; font-size:9px; color:${T.inkFaint}; text-transform:uppercase; letter-spacing:0.05em;">
        Generated ${new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}
      </span>
    </div>

  </div>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Downloads an interview evaluation report as a styled PDF.
 *
 * @example
 * downloadEvaluationPDF(result, {
 *   candidateName: "Jane Doe",
 *   role: "Senior Frontend Engineer",
 *   fileName: "jane-doe-evaluation.pdf",
 * });
 */
export function downloadEvaluationPDF(
  result: EvaluationResult,
  options: EvalPDFOptions = {}
): void {
  const {
    fileName      = "evaluation-report.pdf",
    candidateName = "Candidate",
    role          = "Software Engineer",
    interviewDate = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    }),
  } = options;

  const html    = buildDocument(result, candidateName, role, interviewDate);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  html2pdf()
    .set({
      margin:      0,
      filename:    fileName,
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF:       { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(wrapper)
    .save();
}