import html2pdf from "html2pdf.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EvaluationResult = {
  overallScore: number;
  dimensions: {
    technical: number;
    problemSolving: number;
    communication: number;
    depth: number;
    clarity: number;
  };
  feedback: string;
  mistakes: string[];
  strengths: string[];
};

export interface EvalPDFOptions {
  fileName?: string;
  candidateName?: string;
  role?: string;
  interviewDate?: string;
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

const F      = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const FM     = "'Menlo','Courier New',monospace";
const BORDER = "#E4E4E7";
const FAINT  = "#A1A1AA";
const LIGHT  = "#52525B";

const BAND = (s: number) =>
  s >= 85 ? { t:"#166534", b:"#F0FDF4", br:"#BBF7D0" } :
  s >= 65 ? { t:"#1E40AF", b:"#EFF6FF", br:"#BFDBFE" } :
  s >= 45 ? { t:"#92400E", b:"#FFFBEB", br:"#FDE68A" } :
            { t:"#991B1B", b:"#FEF2F2", br:"#FECACA" };

const VERDICT = (s: number) =>
  s >= 85 ? { l:"Strong Hire", c:"#166534", b:"#DCFCE7" } :
  s >= 65 ? { l:"Hire",        c:"#1E40AF", b:"#DBEAFE" } :
  s >= 45 ? { l:"Consider",    c:"#92400E", b:"#FEF3C7" } :
            { l:"No Hire",     c:"#991B1B", b:"#FEE2E2" };

const SCORE_LABEL = (s: number) =>
  s >= 85 ? "Excellent" : s >= 65 ? "Good" : s >= 45 ? "Needs Improvement" : "Poor";

const DIM_COLORS = ["#6366F1","#0EA5E9","#10B981","#F59E0B","#EC4899"];

// ─── Partials ─────────────────────────────────────────────────────────────────

const scoreBadge = (s: number) => {
  const { t, b, br } = BAND(s);
  return `<div style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:88px;height:88px;border-radius:50%;background:${b};border:3px solid ${br};">
    <span style="font-size:28px;font-weight:800;color:${t};line-height:1;">${s}</span>
    <span style="font-size:9px;font-weight:600;color:${t};margin-top:3px;">/ 100</span>
  </div>`;
};

const dimBar = (label: string, score: number, color: string) => {
  const { t, b, br } = BAND(score);
  const name = label.replace(/([A-Z])/g, " $1").trim();
  return `<div style="margin-bottom:11px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
      <span style="font-size:11px;font-weight:600;color:${LIGHT};text-transform:capitalize;">${name}</span>
      <span style="font-family:${FM};font-size:10px;font-weight:700;color:${t};background:${b};border:1px solid ${br};border-radius:3px;padding:1px 7px;">${score}</span>
    </div>
    <div style="background:${BORDER};border-radius:99px;height:7px;overflow:hidden;">
      <div style="background:${color};width:${Math.min(100,score)}%;height:100%;border-radius:99px;"></div>
    </div>
  </div>`;
};

const secHead = (text: string) =>
  `<div style="font-size:13px;font-weight:700;color:#18181B;padding-bottom:8px;margin-bottom:12px;border-bottom:1.5px solid ${BORDER};">${text}</div>`;

const bullets = (items: string[], dot: string, color: string) =>
  !items.length
    ? `<p style="color:${FAINT};font-size:11px;font-style:italic;margin:0;">None noted.</p>`
    : items.map(item => `
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;">
        <span style="flex-shrink:0;width:6px;height:6px;border-radius:50%;background:${dot};margin-top:5px;"></span>
        <span style="font-size:11px;line-height:1.65;color:${color};">${item}</span>
      </div>`).join("");

// ─── Document ─────────────────────────────────────────────────────────────────

function buildDocument(r: EvaluationResult, name: string, role: string, date: string): string {
  const v    = VERDICT(r.overallScore);
  console.log(r.dimensions);
  const dims = Object.entries(r.dimensions);

  return `<div style="font-family:${F};background:#F9FAFB;color:#18181B;">

    <!-- Header -->
    <div style="background:#18181B;padding:28px 32px 22px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-family:${FM};font-size:9px;font-weight:700;color:#71717A;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:7px;">Interview Evaluation Report</div>
          <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.03em;line-height:1.2;margin-bottom:5px;">${name}</div>
          <div style="font-size:12px;color:#A1A1AA;">${role} &nbsp;·&nbsp; ${date}</div>
        </div>
        <div style="background:${v.b};border-radius:8px;padding:10px 22px;text-align:center;">
          <div style="font-family:${FM};font-size:9px;font-weight:700;color:${v.c};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:3px;">Verdict</div>
          <div style="font-size:16px;font-weight:800;color:${v.c};">${v.l}</div>
        </div>
      </div>
    </div>

    <!-- Score + Dimensions -->
    <div style="background:#fff;border-bottom:1px solid ${BORDER};padding:22px 32px;display:flex;gap:28px;align-items:center;">
      <div style="flex-shrink:0;text-align:center;">
        ${scoreBadge(r.overallScore)}
        <div style="font-size:9px;font-weight:600;color:${FAINT};margin-top:6px;text-transform:uppercase;letter-spacing:0.06em;">Overall Score</div>
        <div style="font-size:10px;font-weight:700;color:${BAND(r.overallScore).t};margin-top:2px;">${SCORE_LABEL(r.overallScore)}</div>
      </div>
      <div style="width:1px;background:${BORDER};align-self:stretch;flex-shrink:0;"></div>
      <div style="flex:1;">
        ${dims.map(([k, val], i) => dimBar(k, val, DIM_COLORS[i % DIM_COLORS.length])).join("")}
      </div>
    </div>

    <!-- Strengths & Mistakes -->
    <div style="padding:22px 32px 10px;display:flex;gap:18px;">
      <div style="flex:1;background:#fff;border:1px solid ${BORDER};border-radius:8px;padding:16px 18px;">
        ${secHead("Strengths")}
        ${bullets(r.strengths, "#22C55E", "#166534")}
      </div>
      <div style="flex:1;background:#fff;border:1px solid ${BORDER};border-radius:8px;padding:16px 18px;">
        ${secHead("Areas to Improve")}
        ${bullets(r.mistakes, "#EF4444", "#991B1B")}
      </div>
    </div>

    <!-- Feedback -->
    <div style="padding:18px 32px 24px;">
      ${secHead("Evaluator Feedback")}
      <div style="background:#fff;border:1px solid ${BORDER};border-radius:7px;padding:16px 18px;line-height:1.75;font-size:11.5px;color:${LIGHT};">
        ${r.feedback || `<span style="color:${FAINT};font-style:italic;">No feedback provided.</span>`}
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid ${BORDER};margin:0 32px;padding:12px 0;display:flex;justify-content:space-between;">
      <span style="font-family:${FM};font-size:9px;color:${FAINT};text-transform:uppercase;letter-spacing:0.05em;">Confidential · Internal use only</span>
      <span style="font-family:${FM};font-size:9px;color:${FAINT};text-transform:uppercase;letter-spacing:0.05em;">${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</span>
    </div>

  </div>`;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function downloadEvaluationPDF(result: EvaluationResult, options: EvalPDFOptions = {}): void {
  const {
    fileName      = "evaluation-report.pdf",
    candidateName = "Candidate",
    role          = "Software Engineer",
    interviewDate = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }),
  } = options;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = buildDocument(result, candidateName, role, interviewDate);

  html2pdf()
    .set({ margin:0, filename:fileName, html2canvas:{ scale:2, useCORS:true, logging:false }, jsPDF:{ unit:"mm", format:"a4", orientation:"portrait" } })
    .from(wrapper)
    .save();
}