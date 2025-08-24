import { Upload, Filter, SlidersHorizontal, Download } from "lucide-react";
import { Card } from "./Card";
import { Slider } from "./Slider";
import { NumberField } from "./NumberField";
import { CurrencyField } from "./CurrencyField";
import { SkillsFilter } from "../SkillsFilter";
import type { Candidate, Constraints, Weights } from "@/types/candidate";

interface SidebarProps {
  isSidebarOpen: boolean;
  rawJson: string;
  setRawJson: (json: string) => void;
  isProcessing: boolean;
  jsonError: string | null;
  candidates: Candidate[];
  selectedSkills: Set<string>;
  weights: Weights;
  constraints: Constraints;
  onSkillToggle: (skill: string) => void;
  onClearAllSkills: () => void;
  onSelectAllSkills: () => void;
  onWeightChange: (key: keyof Weights, value: number) => void;
  onConstraintChange: (key: keyof Constraints, value: number | null) => void;
  onExportReport: () => void;
}

export function Sidebar({
  isSidebarOpen,
  rawJson,
  setRawJson,
  isProcessing,
  jsonError,
  candidates,
  selectedSkills,
  weights,
  constraints,
  onSkillToggle,
  onClearAllSkills,
  onSelectAllSkills,
  onWeightChange,
  onConstraintChange,
  onExportReport
}: SidebarProps) {
  return (
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
              onSkillToggle={onSkillToggle}
              onClearAll={onClearAllSkills}
              onSelectAll={onSelectAllSkills}
            />
            
            {selectedSkills.size > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Filter Active</span>
                </div>
                <p className="text-xs text-blue-600">
                  {candidates.length - selectedSkills.size} candidates filtered out
                </p>
              </div>
            )}
          </Card>
        )}

        <Card title="Scoring Weights" icon={<SlidersHorizontal className="w-4 h-4" />} className="border-purple-200 bg-gradient-to-br from-white to-purple-50">
          <Slider label="Skill Match" value={weights.skillMatch} onChange={(v) => onWeightChange('skillMatch', v)} />
          <Slider label="Role Relevance" value={weights.roleRelevance} onChange={(v) => onWeightChange('roleRelevance', v)} />
          <Slider label="Education" value={weights.education} onChange={(v) => onWeightChange('education', v)} />
          <Slider label="Salary Efficiency" value={weights.salaryEfficiency} onChange={(v) => onWeightChange('salaryEfficiency', v)} />
          <Slider label="Recency" value={weights.recency} onChange={(v) => onWeightChange('recency', v)} />
        </Card>

        <Card title="Constraints" icon={<Filter className="w-4 h-4" />} className="border-green-200 bg-gradient-to-br from-white to-green-50">
          <NumberField label="Team Size" min={1} max={10} value={constraints.teamSize} onChange={(v) => onConstraintChange('teamSize', v)} />
          <NumberField label="Max per Location" min={1} max={5} value={constraints.maxPerLocation} onChange={(v) => onConstraintChange('maxPerLocation', v)} />
          <NumberField label="Min Distinct Locations" min={1} max={5} value={constraints.minLocations} onChange={(v) => onConstraintChange('minLocations', v)} />
          <CurrencyField label="Total Budget (optional)" value={constraints.budget} onChange={(v) => onConstraintChange('budget', v)} />
        </Card>

        <div className="flex gap-3">
          <button onClick={onExportReport} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>
    </div>
  );
}
