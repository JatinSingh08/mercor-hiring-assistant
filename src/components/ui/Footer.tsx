import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full px-4 pb-6 lg:pb-10 text-center text-sm text-gray-500">
      <div className="inline-flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-gray-200">
        <Sparkles className="w-4 h-4 text-blue-500" />
        <span>Made with ❤️ by the RecruitAI Team</span>
      </div>
    </footer>
  );
}
