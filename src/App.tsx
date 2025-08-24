import { useEffect, useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Filter, Users, SlidersHorizontal, Upload, BrainCircuit, Sparkles, Menu, X, FileSpreadsheet, Brain } from "lucide-react";
import type { Candidate, Constraints, Weights } from "@/types/candidate";
import { DEFAULT_CONSTRAINTS, DEFAULT_WEIGHTS } from "@/lib/constant";
import { parseUSD } from "@/lib/utils";
import { computeCandidateScore } from "@/lib/scoring";
import { pickTeam, buildTeamSummary } from "@/lib/team";
import { Card } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { NumberField } from "@/components/ui/NumberField";
import { CurrencyField } from "@/components/ui/CurrencyField";
import { CandidateCard } from "@/components/CandidateCard";
import { TeamSummary } from "@/components/TeamSummary";
import { SkillsFilter } from "@/components/SkillsFilter";
import { SEED_APPLICANTS } from "@/data/seed";
import "antd/dist/reset.css";
import * as XLSX from 'xlsx';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function App() {
  const [rawJson, setRawJson] = useState<string>(JSON.stringify(SEED_APPLICANTS, null, 2));
  const [candidates, setCandidates] = useState<Candidate[]>(SEED_APPLICANTS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [constraints, setConstraints] = useState<Constraints>(DEFAULT_CONSTRAINTS);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const debouncedWeights = useDebounce(weights, 150);
  const debouncedRawJson = useDebounce(rawJson, 500);

  useEffect(() => {
    if (!debouncedRawJson.trim()) {
      setCandidates([]);
      setJsonError(null);
      return;
    }

    setIsProcessing(true);
    
    const processData = () => {
      try {
        const parsed = JSON.parse(debouncedRawJson);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'object' && 'name' in parsed[0]) {
            setCandidates(parsed as Candidate[]);
            setJsonError(null);
            setSelectedSkills(new Set());
            setSelected({});
          } else {
            setJsonError("Invalid data format. Expected an array of candidate objects.");
            setCandidates([]);
          }
        } else {
          setJsonError("Invalid JSON format. Expected an array.");
          setCandidates([]);
        }
      } catch (error) {
        setJsonError(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setCandidates([]);
      } finally {
        setIsProcessing(false);
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(processData, { timeout: 1000 });
    } else {
      setTimeout(processData, 0);
    }
  }, [debouncedRawJson]);

  const filteredCandidates = useMemo(() => {
    if (selectedSkills.size === 0) {
      return candidates;
    }
    
    return candidates.filter(candidate => {
      if (!candidate.skills || candidate.skills.length === 0) {
        return false;
      }
      
      return candidate.skills.some(skill => selectedSkills.has(skill));
    });
  }, [candidates, selectedSkills]);

  const { ordered } = useMemo(() => {
    if (filteredCandidates.length === 0) return { ordered: [] };
    
    const chunkSize = 50;
    const scored: Array<{ c: Candidate; score: number; breakdown: any }> = [];
    
    for (let i = 0; i < filteredCandidates.length; i += chunkSize) {
      const chunk = filteredCandidates.slice(i, i + chunkSize);
      const chunkScored = chunk.map((c) => ({ 
        c, 
        ...computeCandidateScore(c, { weights: debouncedWeights, all: filteredCandidates }) 
      }));
      scored.push(...chunkScored);
    }
    
    const ordered = [...scored].sort((a, b) => b.score - a.score);
    return { ordered };
  }, [filteredCandidates, debouncedWeights]);

  const filteredSelected = useMemo(() => {
    const filteredEmails = new Set(filteredCandidates.map(c => c.email));
    const newSelected: Record<string, boolean> = {};
    
    Object.entries(selected).forEach(([email, isSelected]) => {
      if (filteredEmails.has(email) && isSelected) {
        newSelected[email] = true;
      }
    });
    
    return newSelected;
  }, [selected, filteredCandidates]);

  const pickedTeam = useMemo(() => {
    if (filteredCandidates.length === 0) {
      return { team: [], summary: { skills: [], locations: [], cost: 0 }, totalCost: 0 };
    }
    
    const manual = Object.entries(filteredSelected)
      .filter(([, v]) => v)
      .map(([k]) => filteredCandidates.find((c) => c.email === k))
      .filter(Boolean) as Candidate[];
    
    if (manual.length === constraints.teamSize) {
      return { team: manual, summary: buildTeamSummary(manual), totalCost: manual.reduce((a, c) => a + (parseUSD(c.annual_salary_expectation?.["full-time"]) ?? 0), 0) };
    }
    
    return pickTeam(filteredCandidates, debouncedWeights, constraints);
  }, [filteredSelected, filteredCandidates, debouncedWeights, constraints]);

  const togglePick = useCallback((c: Candidate) => {
    setSelected((prev) => ({ ...prev, [c.email]: !prev[c.email] }));
  }, []);

  const handleWeightChange = useCallback((key: keyof Weights, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleConstraintChange = useCallback((key: keyof Constraints, value: number | null) => {
    setConstraints((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSkillToggle = useCallback((skill: string) => {
    setSelectedSkills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(skill)) {
        newSet.delete(skill);
      } else {
        newSet.add(skill);
      }
      return newSet;
    });
  }, []);

  const handleClearAllSkills = useCallback(() => {
    setSelectedSkills(new Set());
  }, []);

  const handleSelectAllSkills = useCallback(() => {
    const allSkills = new Set<string>();
    candidates.forEach(candidate => {
      if (candidate.skills) {
        candidate.skills.forEach(skill => allSkills.add(skill));
      }
    });
    setSelectedSkills(allSkills);
  }, [candidates]);

  const exportReport = useCallback(() => {
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
  }, [constraints.teamSize, pickedTeam.summary, pickedTeam.team]);

  const exportToExcel = useCallback(() => {
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
  }, [pickedTeam.team, pickedTeam.summary, debouncedWeights, filteredCandidates]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-blue-200"
        >
          {isSidebarOpen ? <X className="w-5 h-5 text-blue-600" /> : <Menu className="w-5 h-5 text-blue-600" />}
        </button>
      </div>

      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-blue-200 shadow-lg">
        <div className="w-full px-4 py-3 lg:py-4 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            RecruitAI
          </h1>
          <span className="ml-auto sm:ml-0 text-sm text-blue-600 font-medium flex items-center justify-center gap-2 bg-blue-50 px-2 py-1 rounded-full">
            <Users className="w-4 h-4 flex-shrink-0" /> {filteredCandidates.length}/{candidates.length}
          </span>
          
          {pickedTeam.team.length > 0 && (
            <button
              onClick={exportToExcel}
              className="ml-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              title="Export picked candidates to Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          )}
        </div>
      </header>

      <main className="w-full flex">
        <div className={`
          fixed inset-y-0 left-0 bottom-0 z-30 w-80 backdrop-blur border-r border-blue-200 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full overflow-y-auto p-4 lg:p-6 space-y-6">
            <Card title="Dataset" icon={<Upload className="w-4 h-4" />} className="border-blue-200 bg-gradient-to-br from-white to-blue-50">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Paste or edit the raw JSON of applicants. The UI updates automatically after you stop typing.</p>
                
                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Processing data...</span>
                  </div>
                )}
                
                {jsonError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{jsonError}</p>
                  </div>
                )}
                
                {!jsonError && candidates.length > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">✓ {candidates.length} candidates loaded successfully</p>
                  </div>
                )}
                
                <textarea 
                  className={`w-full h-40 lg:h-56 p-3 font-mono text-xs outline-none rounded-xl border transition-all duration-200 ${
                    jsonError 
                      ? 'border-red-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-red-50/50' 
                      : 'border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80'
                  }`}
                  value={rawJson} 
                  onChange={(e) => setRawJson(e.target.value)}
                  placeholder="Paste your JSON data here..."
                  disabled={isProcessing}
                />
                
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                  💡 <strong>Performance Tip:</strong> Large datasets (&gt;1000 candidates) may take a moment to process. The app will remain responsive during processing.
                </div>
              </div>
            </Card>

            {candidates.length > 0 && (
              <Card title="Skills Filter" icon={<Filter className="w-4 h-4" />} className="border-indigo-200 bg-gradient-to-br from-white to-indigo-50">
                <SkillsFilter
                  candidates={candidates}
                  selectedSkills={selectedSkills}
                  onSkillToggle={handleSkillToggle}
                  onClearAll={handleClearAllSkills}
                  onSelectAll={handleSelectAllSkills}
                />
                
                {selectedSkills.size > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Filter Active</span>
                    </div>
                    <p className="text-xs text-blue-600">
                      Showing {filteredCandidates.length} of {candidates.length} candidates with selected skills
                    </p>
                    {filteredCandidates.length < candidates.length && (
                      <p className="text-xs text-blue-500 mt-1">
                        {candidates.length - filteredCandidates.length} candidates filtered out
                      </p>
                    )}
                  </div>
                )}
              </Card>
            )}

            <Card title="Scoring Weights" icon={<SlidersHorizontal className="w-4 h-4" />} className="border-purple-200 bg-gradient-to-br from-white to-purple-50">
              <Slider label="Skill Match" value={weights.skillMatch} onChange={(v) => handleWeightChange('skillMatch', v)} />
              <Slider label="Role Relevance" value={weights.roleRelevance} onChange={(v) => handleWeightChange('roleRelevance', v)} />
              <Slider label="Education" value={weights.education} onChange={(v) => handleWeightChange('education', v)} />
              <Slider label="Salary Efficiency" value={weights.salaryEfficiency} onChange={(v) => handleWeightChange('salaryEfficiency', v)} />
              <Slider label="Recency" value={weights.recency} onChange={(v) => handleWeightChange('recency', v)} />
            </Card>

            <Card title="Constraints" icon={<Filter className="w-4 h-4" />} className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <NumberField label="Team Size" min={1} max={10} value={constraints.teamSize} onChange={(v) => handleConstraintChange('teamSize', v)} />
              <NumberField label="Max per Location" min={1} max={5} value={constraints.maxPerLocation} onChange={(v) => handleConstraintChange('maxPerLocation', v)} />
              <NumberField label="Min Distinct Locations" min={1} max={5} value={constraints.minLocations} onChange={(v) => handleConstraintChange('minLocations', v)} />
              <CurrencyField label="Total Budget (optional)" value={constraints.budget} onChange={(v) => handleConstraintChange('budget', v)} />
            </Card>

            <div className="flex gap-3">
              <button onClick={exportReport} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium">
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full lg:w-auto">
          <div className="p-4 lg:p-6 lg:p-8 space-y-6">
            <Card title="Recommended Team" icon={<BrainCircuit className="w-4 h-4" />} className="border-indigo-200 bg-gradient-to-br from-white to-indigo-50">
              <TeamSummary summary={pickedTeam.summary} size={constraints.teamSize} />
              
              {selectedSkills.size > 0 && filteredCandidates.length < candidates.length && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">Filter Notice</span>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">
                    Team recommendations are based on {filteredCandidates.length} filtered candidates with selected skills
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
                <AnimatePresence>
                  {pickedTeam.team.map((c) => (
                    <motion.div key={c.email} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <CandidateCard 
                        candidate={c} 
                        all={filteredCandidates} 
                        weights={debouncedWeights} 
                        picked={!!filteredSelected[c.email]} 
                        onToggle={togglePick}
                        selectedSkills={selectedSkills}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>

            <Card title="All Applicants" className="border-orange-200 bg-gradient-to-br from-white to-orange-50">
              {candidates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No candidates loaded</p>
                  <p className="text-sm">Paste your JSON data in the Dataset section to get started</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-12 text-amber-500">
                  <Filter className="w-12 h-12 mx-auto mb-4 text-amber-300" />
                  <p className="text-lg font-medium">No candidates match selected skills</p>
                  <p className="text-sm">Try adjusting your skill filter or clear all selections</p>
                  <button
                    onClick={handleClearAllSkills}
                    className="mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors duration-200"
                  >
                    Clear Skill Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {ordered.map(({ c }) => (
                    <CandidateCard 
                      key={c.email} 
                      candidate={c} 
                      all={filteredCandidates} 
                      weights={debouncedWeights} 
                      picked={!!filteredSelected[c.email]} 
                      onToggle={togglePick}
                      selectedSkills={selectedSkills}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <footer className="w-full px-4 pb-6 lg:pb-10 text-center text-sm text-gray-500">
        <div className="inline-flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-gray-200">
          <Sparkles className="w-4 h-4 text-blue-500" />
          Built with React + TypeScript + Tailwind
        </div>
      </footer>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
