import { useMemo, memo, useState } from "react";
import { Code, Filter, X, ChevronDown, ChevronRight } from "lucide-react";
import { Checkbox } from "antd";
import type { Candidate } from "@/types/candidate";

interface SkillsFilterProps {
    candidates: Candidate[];
    selectedSkills: Set<string>;
    onSkillToggle: (skill: string) => void;
    onClearAll: () => void;
    onSelectAll: () => void;
}

function SkillsFilterComponent({
    candidates,
    selectedSkills,
    onSkillToggle,
    onClearAll,
    onSelectAll
}: SkillsFilterProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set()); // All collapsed by default

    const allSkills = useMemo(() => {
        const skillsSet = new Set<string>();
        candidates.forEach(candidate => {
            if (candidate.skills) {
                candidate.skills.forEach(skill => skillsSet.add(skill));
            }
        });
        return Array.from(skillsSet).sort();
    }, [candidates]);

    const skillCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        allSkills.forEach(skill => {
            counts[skill] = candidates.filter(candidate =>
                candidate.skills?.includes(skill)
            ).length;
        });
        return counts;
    }, [allSkills, candidates]);

    const skillCategories = useMemo(() => {
        const categories: Record<string, string[]> = {
            'Frontend': ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap'],
            'Backend': ['Node.js', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Django', 'Express', 'Spring'],
            'Database': ['SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB'],
            'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'GitLab', 'Terraform'],
            'Mobile': ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin'],
            'Other': []
        };

        const categorized: Record<string, string[]> = {
            'Frontend': [],
            'Backend': [],
            'Database': [],
            'DevOps': [],
            'Mobile': [],
            'Other': []
        };

        allSkills.forEach(skill => {
            let isCategorized = false;
            for (const [category, skills] of Object.entries(categories)) {
                if (skills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) {
                    categorized[category].push(skill);
                    isCategorized = true;
                    break;
                }
            }
            if (!isCategorized) {
                categorized['Other'].push(skill);
            }
        });

        return categorized;
    }, [allSkills]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    const expandAll = () => {
        const allCategories = new Set(Object.keys(skillCategories));
        setExpandedCategories(allCategories);
    };

    const collapseAll = () => {
        setExpandedCategories(new Set());
    };

    if (allSkills.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                <Code className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No skills found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-medium text-gray-700">Skills Filter</h3>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={onSelectAll}
                        className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-colors duration-200"
                    >
                        All
                    </button>
                    <button
                        onClick={onClearAll}
                        className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={expandAll}
                    className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-colors duration-200"
                >
                    Expand All
                </button>
                <button
                    onClick={collapseAll}
                    className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-200"
                >
                    Collapse All
                </button>
            </div>

            {selectedSkills.size > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-indigo-700">
                            {selectedSkills.size} skill{selectedSkills.size !== 1 ? 's' : ''} selected
                        </span>
                        <button
                            onClick={onClearAll}
                            className="text-xs text-indigo-600 hover:text-indigo-700"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {Array.from(selectedSkills).slice(0, 5).map(skill => (
                            <span
                                key={skill}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full border border-indigo-200"
                            >
                                {skill}
                                <button
                                    onClick={() => onSkillToggle(skill)}
                                    className="hover:bg-indigo-200 rounded-full p-0.5"
                                >
                                    <X className="w-2 h-2" />
                                </button>
                            </span>
                        ))}
                        {selectedSkills.size > 5 && (
                            <span className="text-xs text-indigo-600 px-2 py-1">
                                +{selectedSkills.size - 5} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {Object.entries(skillCategories).map(([category, skills]) => {
                    if (skills.length === 0) return null;

                    const isExpanded = expandedCategories.has(category);
                    const selectedCount = skills.filter(skill => selectedSkills.has(skill)).length;

                    return (
                        <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Category Header - Clickable */}
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-left"
                            >
                                <div className="flex items-center gap-2">
                                    {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-600" />
                                    )}
                                    <span className="text-sm font-medium text-gray-700">{category}</span>
                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                        {skills.length}
                                    </span>
                                    {selectedCount > 0 && (
                                        <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                                            {selectedCount} selected
                                        </span>
                                    )}
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="p-3 bg-white border-t border-gray-200 space-y-1">
                                    {skills.map(skill => {
                                        const isSelected = selectedSkills.has(skill);
                                        const candidateCount = skillCounts[skill];

                                        return (
                                            <label
                                                key={skill}
                                                className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 p-1 rounded transition-colors duration-200"
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => onSkillToggle(skill)}
                                                />
                                                <span className="text-xs text-gray-700 group-hover:text-gray-900 flex-1">
                                                    {skill}
                                                </span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                                    {candidateCount}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                    Click category headers to expand/collapse skills
                </div>
            </div>
        </div>
    );
}

export const SkillsFilter = memo(SkillsFilterComponent);
