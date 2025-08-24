import type { Candidate, Weights } from "@/types/candidate";
import { FRONTEND_SKILLS } from "@/lib/constant";
import { normalize, parseUSD, roleRelevance } from "@/lib/utils";

export function computeCandidateScore(c: Candidate, context: { weights: Weights; all: Candidate[] }) {
  const { weights, all } = context;

  const skillsLower = c.skills.map((s) => s.toLowerCase());
  const matches = FRONTEND_SKILLS.filter((s) => skillsLower.includes(s.toLowerCase()));
  const skillScore = matches.length / Math.max(1, FRONTEND_SKILLS.length);

  const roleScores = c.work_experiences.map((w) => roleRelevance(w.roleName));
  const roleScore = roleScores.length ? Math.max(...roleScores) : 0;

  const degs = c.education?.degrees ?? [];
  const hasCS = degs.some((d) => (d.subject || "").toLowerCase().includes("computer"));
  const top50 = degs.some((d) => d.isTop50);
  const top25 = degs.some((d) => d.isTop25);
  const educationScore = (hasCS ? 0.6 : 0) + (top50 ? 0.25 : 0) + (top25 ? 0.15 : 0);

  const salaries = all.map((a) => parseUSD(a.annual_salary_expectation?.["full-time"]) ?? undefined).filter((n): n is number => n != null);
  const minS = Math.min(...(salaries.length ? salaries : [0]));
  const maxS = Math.max(...(salaries.length ? salaries : [1]));
  const salary = parseUSD(c.annual_salary_expectation?.["full-time"]) ?? maxS;
  const salaryEff = 1 - normalize(salary, minS, maxS);

  const times = all.map((a) => new Date(a.submitted_at).getTime());
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const t = new Date(c.submitted_at).getTime();
  const recency = normalize(t, minT, maxT);

  const final =
    skillsLower.length === 0 && roleScore === 0
      ? 0
      : weights.skillMatch * skillScore +
        weights.roleRelevance * roleScore +
        weights.education * educationScore +
        weights.salaryEfficiency * salaryEff +
        weights.recency * recency;

  return {
    score: Number(final.toFixed(4)),
    breakdown: { matches, skillScore, roleScore, educationScore, salaryEff, recency },
  } as const;
}

export function explainChoice(c: Candidate, context: { all: Candidate[]; weights: Weights }) {
  const { score, breakdown } = computeCandidateScore(c, { weights: context.weights, all: context.all });
  const salary = parseUSD(c.annual_salary_expectation?.["full-time"] || undefined);
  const reasons: string[] = [];
  if (breakdown.matches.length) reasons.push(`Strong stack fit: ${breakdown.matches.join(", ")}.`);
  if (breakdown.roleScore >= 0.7) reasons.push("Relevant prior roles for frontend/software engineering.");
  if (breakdown.educationScore > 0) reasons.push("Educational background supports engineering capability.");
  if ((breakdown.salaryEff ?? 0) > 0.5 && salary != null) reasons.push(`Cost-efficient at $${salary.toLocaleString()}.`);
  reasons.push(`Overall fit score: ${(score * 100).toFixed(1)}%.`);
  return reasons;
}