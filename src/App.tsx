import { useEffect, useMemo, useState, useCallback } from "react";
import type { Candidate, Constraints, Weights } from "@/types/candidate";
import { DEFAULT_CONSTRAINTS, DEFAULT_WEIGHTS } from "@/lib/constant";
import { pickTeam, buildTeamSummary } from "@/lib/team";
import { Header } from "@/components/ui/Header";
import { Sidebar } from "@/components/ui/Sidebar";
import { MainContent } from "@/components/ui/MainContent";
import { Footer } from "@/components/ui/Footer";
import { SEED_APPLICANTS, APP_CONSTANTS } from "@/data/seed";
import { useDebounce } from "@/hooks/useDebounce";
import { exportReport, exportToExcel } from "@/lib/exportUtils";
import { processJsonData, filterCandidatesBySkills, getAllSkillsFromCandidates, getFilteredSelectedCandidates } from "@/lib/dataProcessing";
import { processCandidatesInChunks, buildPickedTeam } from "@/lib/candidateProcessing";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import "antd/dist/reset.css";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [rawJson, setRawJson] = useState<string>(JSON.stringify(SEED_APPLICANTS, null, 2));
  const [candidates, setCandidates] = useState<Candidate[]>(SEED_APPLICANTS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [constraints, setConstraints] = useState<Constraints>(DEFAULT_CONSTRAINTS);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const debouncedWeights = useDebounce(weights, APP_CONSTANTS.DEBOUNCE_DELAYS.WEIGHTS);
  const debouncedRawJson = useDebounce(rawJson, APP_CONSTANTS.DEBOUNCE_DELAYS.JSON_INPUT);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsProcessing(true);
    
    const processData = () => {
      const { candidates: newCandidates, error } = processJsonData(debouncedRawJson);
      setCandidates(newCandidates);
      setJsonError(error);
      if (!error) {
        setSelectedSkills(new Set());
        setSelected({});
      }
      setIsProcessing(false);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(processData, { timeout: APP_CONSTANTS.PROCESSING_TIMEOUT });
    } else {
      setTimeout(processData, 0);
    }
  }, [debouncedRawJson]);

  const filteredCandidates = useMemo(() => 
    filterCandidatesBySkills(candidates, selectedSkills), 
    [candidates, selectedSkills]
  );

  const { ordered } = useMemo(() => ({
    ordered: processCandidatesInChunks(filteredCandidates, debouncedWeights, APP_CONSTANTS.CHUNK_SIZE)
  }), [filteredCandidates, debouncedWeights]);

  const filteredSelected = useMemo(() => 
    getFilteredSelectedCandidates(selected, filteredCandidates), 
    [selected, filteredCandidates]
  );

  const pickedTeam = useMemo(() => 
    buildPickedTeam(filteredCandidates, filteredSelected, debouncedWeights, constraints, pickTeam, buildTeamSummary), 
    [filteredSelected, filteredCandidates, debouncedWeights, constraints]
  );

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
    setSelectedSkills(getAllSkillsFromCandidates(candidates));
  }, [candidates]);

  const handleExportReport = useCallback(() => {
    exportReport(constraints, pickedTeam);
  }, [constraints, pickedTeam]);

  const handleExportToExcel = useCallback(() => {
    exportToExcel(pickedTeam, debouncedWeights, filteredCandidates);
  }, [pickedTeam, debouncedWeights, filteredCandidates]);

  // Show loading spinner while app is initializing
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900">
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        filteredCandidatesCount={filteredCandidates.length}
        totalCandidatesCount={candidates.length}
        pickedTeamCount={pickedTeam.team.length}
        onExportExcel={handleExportToExcel}
      />

      <main className="w-full flex">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          rawJson={rawJson}
          setRawJson={setRawJson}
          isProcessing={isProcessing}
          jsonError={jsonError}
          candidates={candidates}
          selectedSkills={selectedSkills}
          weights={weights}
          constraints={constraints}
          onSkillToggle={handleSkillToggle}
          onClearAllSkills={handleClearAllSkills}
          onSelectAllSkills={handleSelectAllSkills}
          onWeightChange={handleWeightChange}
          onConstraintChange={handleConstraintChange}
          onExportReport={handleExportReport}
        />

        <MainContent
          filteredCandidates={filteredCandidates}
          candidates={candidates}
          ordered={ordered}
          pickedTeam={pickedTeam}
          filteredSelected={filteredSelected}
          selectedSkills={selectedSkills}
          debouncedWeights={debouncedWeights}
          constraints={constraints}
          onTogglePick={togglePick}
          onClearAllSkills={handleClearAllSkills}
        />
      </main>
      <Footer />
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <ScrollToTop />
    </div>
  );
}
