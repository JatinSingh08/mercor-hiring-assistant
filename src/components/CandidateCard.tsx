import { useMemo, memo, useState } from "react";
import { Users, Plus, Trash2, Briefcase, Building2, ChevronDown, ChevronUp, Clock, Code, ChevronsDown } from "lucide-react";
import type { Candidate, Weights } from "@/types/candidate";
import { parseUSD } from "@/lib/utils";
import { computeCandidateScore, explainChoice } from "@/lib/scoring";
import { Badge } from "@/components/ui/Badge";

interface CandidateCardProps {
  candidate: Candidate;
  picked?: boolean;
  onToggle?: (c: Candidate) => void;
  all: Candidate[];
  weights: Weights;
  selectedSkills: Set<string>;
}

function CandidateCardComponent({ 
  candidate, 
  picked, 
  onToggle, 
  all, 
  weights, 
  selectedSkills 
}: CandidateCardProps) {
  const { score } = useMemo(() => computeCandidateScore(candidate, { weights, all }), [candidate, all, weights]);
  const salary = parseUSD(candidate.annual_salary_expectation?.["full-time"]) ?? 0;
  const [showAllExperience, setShowAllExperience] = useState(false);

  // Extract work experiences and skills
  const workExperiences = candidate.work_experiences || [];
  const skills = candidate.skills || [];

  // Calculate work experience summary
  const experienceSummary = useMemo(() => {
    if (workExperiences.length === 0) return null;
    
    const uniqueCompanies = new Set(workExperiences.map(exp => exp.company)).size;
    const roles = workExperiences.length;
    
    return { uniqueCompanies, roles };
  }, [workExperiences]);

  return (
    <div className={`group relative h-96 w-full rounded-2xl border-2 transition-all duration-200 hover:shadow-lg flex flex-col ${
      picked 
        ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-100 shadow-emerald-200" 
        : "border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-blue-300"
    } shadow-sm`}>
      {/* Fixed Header Section */}
      <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-100 flex-shrink-0">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
          picked 
            ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg" 
            : "bg-gradient-to-r from-blue-500 to-purple-600 shadow-md"
        }`}>
          <Users className={`w-4 h-4 sm:w-6 sm:h-6 ${picked ? "text-white" : "text-white"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h3 className="font-bold leading-tight text-gray-800 text-sm sm:text-base truncate">{candidate.name}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium w-fit">{candidate.location}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 truncate">{candidate.email}</div>
        </div>
        {onToggle && (
          <button 
            onClick={() => onToggle(candidate)} 
            className={`inline-flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 touch-manipulation flex-shrink-0 ${
              picked 
                ? "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200" 
                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg"
            }`}
          >
            {picked ? <><Trash2 className="w-3 h-3" /> <span className="hidden sm:inline">Unpick</span></> : <><Plus className="w-3 h-3" /> <span className="hidden sm:inline">Pick</span></>}
          </button>
        )}
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {/* Fixed Badges Section */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
          <Badge label="Score" value={`${(score * 100).toFixed(0)}%`} className="col-span-1" />
          <Badge label="Salary" value={`$${salary.toLocaleString()}`} className="col-span-1" />
          
          {/* Work Experience Summary Badge */}
          {experienceSummary && (
            <div className="col-span-2">
              <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-purple-600" />
                    <span className="text-[10px] uppercase tracking-wide text-purple-600 font-bold">Experience</span>
                  </div>
                  <div className="text-xs font-semibold text-purple-800">
                    {experienceSummary.roles} roles at {experienceSummary.uniqueCompanies} companies
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skills Section */}
        {skills.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Code className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
              <span className="text-xs font-medium text-gray-700">Skills</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{skills.length} skills</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, index) => {
                const isSelected = selectedSkills.has(skill);
                return (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md border border-green-400'
                        : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200 hover:from-indigo-200 hover:to-purple-200'
                    }`}
                    title={isSelected ? `Selected skill: ${skill}` : skill}
                  >
                    {skill}
                    {isSelected && (
                      <span className="ml-1 text-[10px]">✓</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Work Experience Section */}
        {workExperiences.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                <span className="text-xs font-medium text-gray-700">Work Experience</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{workExperiences.length} roles</span>
              </div>
              
              {workExperiences.length > 3 && (
                <button
                  onClick={() => setShowAllExperience(!showAllExperience)}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 transition-colors duration-200 hover:bg-purple-50 px-2 py-1 rounded-lg"
                >
                  {showAllExperience ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      <span>Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      <span>Show All</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {(showAllExperience ? workExperiences : workExperiences.slice(0, 3)).map((exp, index) => (
                <div key={index} className="bg-white/60 rounded-lg p-2 border border-gray-100 hover:border-purple-200 transition-all duration-200 group">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0 group-hover:bg-purple-500 transition-colors duration-200"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-800 truncate group-hover:text-purple-800 transition-colors duration-200">{exp.roleName}</div>
                      <div className="text-xs text-gray-500 truncate flex items-center gap-1 group-hover:text-purple-600 transition-colors duration-200">
                        <Building2 className="w-3 h-3" />
                        {exp.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {!showAllExperience && workExperiences.length > 3 && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                    <span>+{workExperiences.length - 3} more roles</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Why They Fit Section */}
        <div className="text-sm">
          <div className="text-gray-700 font-medium flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="text-xs sm:text-sm">Why they fit</span>
          </div>
          <ul className="list-disc pl-4 sm:pl-5 mb-2 sm:mb-3 text-gray-600 space-y-1">
            {explainChoice(candidate, { all, weights }).map((r, i) => (
              <li key={i} className="text-xs sm:text-sm">{r}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Scrollable Indicator - Fixed at bottom of card */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex flex-col items-center text-gray-400 animate-pulse">
          <ChevronsDown className="w-4 h-4" />
          <span className="text-xs text-gray-400 mt-1">Scroll for more</span>
        </div>
      </div>
    </div>
  );
}

export const CandidateCard = memo(CandidateCardComponent);