import type { Candidate } from '@/types/candidate';

export const processJsonData = (jsonString: string): { candidates: Candidate[]; error: string | null } => {
  if (!jsonString.trim()) {
    return { candidates: [], error: null };
  }

  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object' && 'name' in parsed[0]) {
        return { candidates: parsed as Candidate[], error: null };
      } else {
        return { candidates: [], error: "Invalid data format. Expected an array of candidate objects." };
      }
    } else {
      return { candidates: [], error: "Invalid JSON format. Expected an array." };
    }
  } catch (error) {
    return { 
      candidates: [], 
      error: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

export const filterCandidatesBySkills = (
  candidates: Candidate[], 
  selectedSkills: Set<string>
): Candidate[] => {
  if (selectedSkills.size === 0) {
    return candidates;
  }
  
  return candidates.filter(candidate => {
    if (!candidate.skills || candidate.skills.length === 0) {
      return false;
    }
    
    return candidate.skills.some(skill => selectedSkills.has(skill));
  });
};

export const getAllSkillsFromCandidates = (candidates: Candidate[]): Set<string> => {
  const skillsSet = new Set<string>();
  candidates.forEach(candidate => {
    if (candidate.skills) {
      candidate.skills.forEach(skill => skillsSet.add(skill));
    }
  });
  return skillsSet;
};

export const getFilteredSelectedCandidates = (
  selected: Record<string, boolean>,
  filteredCandidates: Candidate[]
): Record<string, boolean> => {
  const filteredEmails = new Set(filteredCandidates.map(c => c.email));
  const newSelected: Record<string, boolean> = {};
  
  Object.entries(selected).forEach(([email, isSelected]) => {
    if (filteredEmails.has(email) && isSelected) {
      newSelected[email] = true;
    }
  });
  
  return newSelected;
};
