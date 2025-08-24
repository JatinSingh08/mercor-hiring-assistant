export const FRONTEND_SKILLS = [
    "React",
    "Next JS",
    "TypeScript",
    "Redux",
    "Angular",
    "React Native",
    "JavaScript",
    "CSS",
    "Tailwind",
    "Testing",
    "Node",
  ];
  
  export const DEFAULT_WEIGHTS = {
    skillMatch: 0.4,
    roleRelevance: 0.25,
    education: 0.1,
    salaryEfficiency: 0.15,
    recency: 0.1,
  } as const;
  
  export const DEFAULT_CONSTRAINTS = {
    teamSize: 5,
    maxPerLocation: 2,
    minLocations: 3,
    budget: null,
  } as const;