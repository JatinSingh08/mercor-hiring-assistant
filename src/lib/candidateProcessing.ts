import { computeCandidateScore } from './scoring';
import type { Candidate, Weights } from '@/types/candidate';

export const processCandidatesInChunks = (
  candidates: Candidate[],
  weights: Weights,
  chunkSize: number = 50
): Array<{ c: Candidate; score: number; breakdown: any }> => {
  if (candidates.length === 0) return [];
  
  const scored: Array<{ c: Candidate; score: number; breakdown: any }> = [];
  
  for (let i = 0; i < candidates.length; i += chunkSize) {
    const chunk = candidates.slice(i, i + chunkSize);
    const chunkScored = chunk.map((c) => ({ 
      c, 
      ...computeCandidateScore(c, { weights, all: candidates }) 
    }));
    scored.push(...chunkScored);
  }
  
  return scored.sort((a, b) => b.score - a.score);
};

export const buildPickedTeam = (
  filteredCandidates: Candidate[],
  filteredSelected: Record<string, boolean>,
  weights: Weights,
  constraints: { teamSize: number },
  pickTeam: (candidates: Candidate[], weights: Weights, constraints: any) => any,
  buildTeamSummary: (team: Candidate[]) => any
) => {
  if (filteredCandidates.length === 0) {
    return { team: [], summary: { skills: [], locations: [], cost: 0 }, totalCost: 0 };
  }
  
  const manual = Object.entries(filteredSelected)
    .filter(([, v]) => v)
    .map(([k]) => filteredCandidates.find((c) => c.email === k))
    .filter(Boolean) as Candidate[];
  
  if (manual.length === constraints.teamSize) {
    return { 
      team: manual, 
      summary: buildTeamSummary(manual), 
      totalCost: manual.reduce((a, c) => a + (c.annual_salary_expectation?.["full-time"] ? parseFloat(c.annual_salary_expectation["full-time"].replace('$', '')) : 0), 0) 
    };
  }
  
  return pickTeam(filteredCandidates, weights, constraints);
};
