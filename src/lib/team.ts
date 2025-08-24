import type { Candidate, Constraints, Weights } from "@/types/candidate";
import { parseUSD, unique } from "@/lib/utils";
import { computeCandidateScore } from "@/lib/scoring";

export function buildTeamSummary(team: Candidate[]) {
  const skills = unique(team.flatMap((c) => c.skills.map((s) => s.toLowerCase())));
  const locations = unique(team.map((c) => c.location));
  const cost = team.reduce((acc, c) => acc + (parseUSD(c.annual_salary_expectation?.["full-time"]) ?? 0), 0);
  return { skills, locations, cost } as const;
}

export function pickTeam(cands: Candidate[], weights: Weights, constraints: Constraints) {
  const scored = cands.map((c) => ({ c, ...computeCandidateScore(c, { weights, all: cands }) }));
  const byScore = [...scored].sort((a, b) => b.score - a.score);
  const team: typeof scored = [];
  const locCount: Record<string, number> = {};
  let totalCost = 0;

  for (const item of byScore) {
    if (team.length >= constraints.teamSize) break;
    const loc = item.c.location || "Unknown";
    const locOk = (locCount[loc] || 0) < constraints.maxPerLocation;
    const cost = parseUSD(item.c.annual_salary_expectation?.["full-time"]) ?? 0;
    const budgetOk = constraints.budget == null ? true : totalCost + cost <= constraints.budget;

    const currentSkills = new Set(team.flatMap((t) => t.c.skills.map((s) => s.toLowerCase())));
    const newSkillsCount = item.c.skills.filter((s) => !currentSkills.has(s.toLowerCase())).length;
    const diversityBoost = newSkillsCount > 0 ? newSkillsCount * 0.005 : 0;

    const adjustedScore = item.score + diversityBoost;
    if (locOk && budgetOk) {
      team.push({ ...item, score: adjustedScore });
      locCount[loc] = (locCount[loc] || 0) + 1;
      totalCost += cost;
    }
  }

  const distinctLocs = unique(team.map((t) => t.c.location)).length;
  if (distinctLocs < constraints.minLocations) {
    const existingLocs = new Set(team.map((t) => t.c.location));
    const pool = byScore.filter((x) => !existingLocs.has(x.c.location));
    for (const p of pool) {
      if (unique(team.map((t) => t.c.location)).length >= constraints.minLocations) break;
      const overLoc = team
        .map((t, i) => ({ i, loc: t.c.location, count: locCount[t.c.location], score: t.score }))
        .filter((x) => x.count && x.count > 1)
        .sort((a, b) => a.score - b.score)[0];
      if (!overLoc) break;

      const out = team.splice(overLoc.i, 1)[0];
      locCount[out.c.location] -= 1;
      const cost = parseUSD(p.c.annual_salary_expectation?.["full-time"]) ?? 0;
      const budgetOk = constraints.budget == null ? true : totalCost - (parseUSD(out.c.annual_salary_expectation?.["full-time"]) ?? 0) + cost <= constraints.budget;
      if (!budgetOk) {
        team.splice(overLoc.i, 0, out);
        locCount[out.c.location] += 1;
        continue;
      }
      team.push(p);
      locCount[p.c.location] = (locCount[p.c.location] || 0) + 1;
    }
  }

  const summary = buildTeamSummary(team.map((t) => t.c));
  return { team: team.map((t) => t.c), scored, totalCost, summary } as const;
}