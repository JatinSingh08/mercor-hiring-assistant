import * as XLSX from 'xlsx';
import { parseUSD } from './utils';
import { computeCandidateScore } from './scoring';
import type { Candidate, Weights } from '@/types/candidate';

export const exportReport = (
  constraints: { teamSize: number },
  pickedTeam: { summary: { locations: string[]; cost: number }; team: Candidate[] }
) => {
  const lines: string[] = [];
  lines.push(`# Hiring Decision – ${new Date().toLocaleString()}
`);
  lines.push(`**Team Size:** ${constraints.teamSize}`);
  lines.push(`**Locations Covered:** ${pickedTeam.summary.locations.join(", ")}`);
  lines.push(`**Total Cost:** $${pickedTeam.summary.cost.toLocaleString()}`);
  lines.push("## Selected Candidates");
  
  for (const c of pickedTeam.team) {
    lines.push(`### ${c.name}`);
    lines.push(`- Email: ${c.email}`);
    lines.push(`- Location: ${c.location}`);
    const sal = parseUSD(c.annual_salary_expectation?.["full-time"]) ?? 0;
    lines.push(`- Expected Salary: $${sal.toLocaleString()}`);
  }
  
  const blob = new Blob([lines.join("")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hiring-report.md";
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToExcel = (
  pickedTeam: { team: Candidate[]; summary: { skills: string[]; locations: string[] } },
  debouncedWeights: Weights,
  filteredCandidates: Candidate[]
) => {
  if (pickedTeam.team.length === 0) {
    alert('No candidates selected for export');
    return;
  }

  const excelData = pickedTeam.team.map(candidate => {
    const salary = parseUSD(candidate.annual_salary_expectation?.["full-time"]) ?? 0;
    const { score } = computeCandidateScore(candidate, { weights: debouncedWeights, all: filteredCandidates });
    
    return {
      'Name': candidate.name,
      'Email': candidate.email,
      'Location': candidate.location,
      'Phone': candidate.phone || 'N/A',
      'Score (%)': Math.round(score * 100),
      'Expected Salary': `$${salary.toLocaleString()}`,
      'Skills': candidate.skills?.join(', ') || 'None',
      'Work Experience': candidate.work_experiences?.length || 0,
      'Education': candidate.education.degrees?.map(edu => `${edu.degree} from ${edu.school}`).join('; ') || 'None',
      'Years of Experience': candidate.work_experiences?.length || 0,
      'Companies Worked At': candidate.work_experiences?.map(exp => exp.company).join(', ') || 'None',
      'Roles': candidate.work_experiences?.map(exp => exp.roleName).join(', ') || 'None'
    };
  });

  const totalSalary = pickedTeam.team.reduce((total, candidate) => {
    return total + (parseUSD(candidate.annual_salary_expectation?.["full-time"]) ?? 0);
  }, 0);

  const summaryRow = {
    'Name': 'TEAM SUMMARY',
    'Email': '',
    'Location': '',
    'Phone': '',
    'Score (%)': 0,
    'Expected Salary': `$${totalSalary.toLocaleString()}`,
    'Skills': `${pickedTeam.summary.skills.length} unique skills`,
    'Work Experience': 0,
    'Education': '',
    'Years of Experience': 0,
    'Companies Worked At': `${pickedTeam.summary.locations.length} locations`,
    'Roles': ''
  };

  excelData.push(summaryRow);

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Picked Candidates');

  const colWidths = [
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 40 },
    { wch: 15 },
    { wch: 40 },
    { wch: 20 },
    { wch: 40 },
    { wch: 40 }
  ];
  ws['!cols'] = colWidths;

  const fileName = `hiring-team-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
