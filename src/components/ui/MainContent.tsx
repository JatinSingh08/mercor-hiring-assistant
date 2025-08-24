import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Filter, Upload } from "lucide-react";
import { Card } from "./Card";
import { CandidateCard } from "../CandidateCard";
import { TeamSummary } from "../TeamSummary";
import type { Candidate, Weights } from "@/types/candidate";

interface MainContentProps {
  filteredCandidates: Candidate[];
  candidates: Candidate[];
  ordered: Array<{ c: Candidate; score: number; breakdown: any }>;
  pickedTeam: { team: Candidate[]; summary: { skills: string[]; locations: string[]; cost: number }; totalCost: number };
  filteredSelected: Record<string, boolean>;
  selectedSkills: Set<string>;
  debouncedWeights: Weights;
  constraints: { teamSize: number };
  onTogglePick: (candidate: Candidate) => void;
  onClearAllSkills: () => void;
}

export function MainContent({
  filteredCandidates,
  candidates,
  ordered,
  pickedTeam,
  filteredSelected,
  selectedSkills,
  debouncedWeights,
  constraints,
  onTogglePick,
  onClearAllSkills
}: MainContentProps) {
  return (
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
                    onToggle={onTogglePick}
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
                onClick={onClearAllSkills}
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
                  onToggle={onTogglePick}
                  selectedSkills={selectedSkills}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
