import { Users, Brain, FileSpreadsheet, Menu, X } from "lucide-react";

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  filteredCandidatesCount: number;
  totalCandidatesCount: number;
  pickedTeamCount: number;
  onExportExcel: () => void;
}

export function Header({
  isSidebarOpen,
  setIsSidebarOpen,
  filteredCandidatesCount,
  totalCandidatesCount,
  pickedTeamCount,
  onExportExcel
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-blue-200 shadow-lg">
      <div className="w-full px-2 sm:px-4 py-3 lg:py-4 flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-blue-200 mr-2"
        >
          {isSidebarOpen ? <X className="w-5 h-5 text-blue-600" /> : <Menu className="w-5 h-5 text-blue-600" />}
        </button>
        
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
          <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
        </div>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          RecruitAI
        </h1>
        <span className="ml-auto sm:ml-0 text-sm text-blue-600 font-medium flex items-center justify-center gap-2 bg-blue-50 px-2 py-1 rounded-full">
          <Users className="w-4 h-4 flex-shrink-0" /> {filteredCandidatesCount}/{totalCandidatesCount}
        </span>
        
        {pickedTeamCount > 0 && (
          <button
            onClick={onExportExcel}
            className="ml-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            title="Export picked candidates to Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        )}
      </div>
    </header>
  );
}
