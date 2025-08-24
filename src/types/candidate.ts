export type Degree = {
    degree: string;
    subject: string;
    school: string;
    gpa: string;
    startDate?: string;
    endDate?: string;
    originalSchool?: string;
    isTop50?: boolean;
    isTop25?: boolean;
  };
  
  export type Candidate = {
    name: string;
    email: string;
    phone: string | null;
    location: string;
    submitted_at: string;
    work_availability: ("full-time" | "part-time")[];
    annual_salary_expectation: Record<string, string>;
    work_experiences: { company: string; roleName: string }[];
    education: { highest_level: string; degrees: Degree[] };
    skills: string[];
  };
  
  export type Weights = {
    skillMatch: number;
    roleRelevance: number;
    education: number;
    salaryEfficiency: number;
    recency: number;
  };
  
  export type Constraints = {
    teamSize: number;
    maxPerLocation: number;
    minLocations: number;
    budget: number | null;
  };