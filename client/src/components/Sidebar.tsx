import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { navigateTo } from "@/lib/router";
import { 
  Search as SearchIcon, 
  PieChart as PieChartIcon, 
  Mail as MailIcon, 
  FileText as FileTextIcon, 
  Layout as LayoutIcon, 
  BarChart2 as BarChart2Icon, 
  FileIcon, 
  Clock as ClockIcon, 
  User as UserIcon,
  Users as UsersIcon,
  Image as ImageIcon,
  Headphones as AudioIcon,
  Video as VideoIcon,
  Subtitles as TranscriptionIcon,
  Workflow as WorkflowIcon,
  Brain as AIIcon,
  Bot as BotIcon,
  Sparkles as SparklesIcon,
  Lightbulb as AnalyzerIcon,
  Calendar as PlannerIcon,
  BookOpen as KnowledgeIcon,
  Palette as PaletteIcon,
  Type as TypeIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDirectText } from "@/lib/direct-text";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useDirectText();
  
  // Removed excessive logging that was causing performance issues

  return (
    <aside className={cn(`
      w-64 bg-white h-full flex-shrink-0 flex flex-col
      border-r-3 border-black 
      shadow-[6px_0px_0px_0px_rgba(0,0,0,0.9)]
    `, className)}>
      <div className="p-4 border-b-3 border-black">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-blue-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            AI Marketing
          </h1>
        </div>
      </div>
      
      <nav className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2 py-1">{t('ai_platform')}</h2>
          <div className="mt-2 space-y-1">
            <Link href="/team">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/team" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/team" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <UsersIcon className="h-4 w-4" />
                </div>
                {t('ai_team')}
              </a>
            </Link>
            
            <Link href="/content-hub">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/content-hub" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/content-hub" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <SparklesIcon className="h-4 w-4" />
                </div>
                {t('content_hub')}
              </a>
            </Link>
            
            <Link href="/tools">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/tools" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/tools" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <AIIcon className="h-4 w-4" />
                </div>
                {t('ai_tools')}
              </a>
            </Link>
            
            <Link href="/workflows">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/workflows" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/workflows" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <WorkflowIcon className="h-4 w-4" />
                </div>
                {t('ai_workflows')}
              </a>
            </Link>
            
            <Link href="/analyzer">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/analyzer" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/analyzer" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <AnalyzerIcon className="h-4 w-4" />
                </div>
                {t('ai_analyzer')}
              </a>
            </Link>
            
            <Link href="/planner">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/planner" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/planner" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <PlannerIcon className="h-4 w-4" />
                </div>
                {t('ai_planner')}
              </a>
            </Link>
            
            <Link href="/knowledge-base">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/knowledge-base" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/knowledge-base" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <KnowledgeIcon className="h-4 w-4" />
                </div>
                {t('knowledge_base')}
              </a>
            </Link>
          </div>
        </div>
        
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2 py-1">{t('ai_tool_section')}</h2>
          <div className="mt-2 space-y-1">
            <Link href="/tools/image">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/tools/image" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/tools/image" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <ImageIcon className="h-4 w-4" />
                </div>
                {t('ai_image_creator')}
              </a>
            </Link>
            
            <Link href="/tools/audio">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/tools/audio" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/tools/audio" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <AudioIcon className="h-4 w-4" />
                </div>
                {t('ai_voice_audio')}
              </a>
            </Link>
            
            <Link href="/tools/transcription">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/tools/transcription" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/tools/transcription" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <TranscriptionIcon className="h-4 w-4" />
                </div>
                {t('transcription_subtitles')}
              </a>
            </Link>
            
            <Link href="/tools/video">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/tools/video" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/tools/video" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <VideoIcon className="h-4 w-4" />
                </div>
                {t('ai_video_editor')}
              </a>
            </Link>
            
            <Link href="/content-tone-wizard">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/content-tone-wizard" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/content-tone-wizard" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <TypeIcon className="h-4 w-4" />
                </div>
                Content Tone Wizard
              </a>
            </Link>
            
            {/* Direct navigation to Saved Drafts */}
            <div 
              onClick={() => navigateTo("/drafts")}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer",
                location === "/drafts" || location.startsWith("/drafts/")
                  ? "border-2 border-black bg-blue-50 text-blue-600 font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                  : "border-2 border-blue-500 bg-blue-50 text-blue-600 font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
                "hover:bg-blue-100 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] active:translate-y-0.5 active:translate-x-0.5"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center border border-black",
                  location === "/drafts" || location.startsWith("/drafts/")
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                )}>
                  <FileTextIcon className="h-4 w-4" />
                </div>
                <span className="flex items-center gap-1">
                  <span className={cn(
                    "inline-block",
                    location !== "/drafts" && !location.startsWith("/drafts/") && "animate-pulse"
                  )}>📝</span> 
                  <span>Saved Drafts</span>
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 border border-blue-300 rounded-full">New</span>
                </span>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2 py-1">{t('workflows')}</h2>
          <div className="mt-2 space-y-1">
            <Link href="/workflow/custom">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/workflow/custom" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/workflow/custom" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <LayoutIcon className="h-4 w-4" />
                </div>
                {t('build_your_own_ai_team')}
              </a>
            </Link>
            
            <Link href="/workflow/premade">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/workflow/premade" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/workflow/premade" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <BotIcon className="h-4 w-4" />
                </div>
                {t('premade_ai_workflows')}
              </a>
            </Link>
            
            <Link href="/workflow/saved">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100",
                location === "/workflow/saved" 
                  ? "text-blue-600 bg-blue-50 font-semibold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]" 
                  : "text-gray-700"
              )}>
                <div className={cn(
                  "mr-3 h-6 w-6 rounded-md flex items-center justify-center",
                  location === "/workflow/saved" 
                    ? "bg-blue-500 text-white border border-black" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  <FileIcon className="h-4 w-4" />
                </div>
                {t('my_ai_workflows')}
              </a>
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="p-4 border-t-3 border-black mt-1">
        <div className="flex justify-center mb-3">
          <LanguageSwitcher variant="standard" className="w-full" />
        </div>
        
        {user && (
          <div className="pt-3 border-t-2 border-gray-200">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-gray-800">
                  {user.displayName || user.email || "User"}
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Logout button clicked");
                    
                    // First set the flag to prevent auto-login
                    sessionStorage.setItem('user_logged_out', 'true');
                    
                    // Then perform the logout
                    try {
                      logout();
                      console.log("Logout function called successfully");
                    } catch (error) {
                      console.error("Error during logout:", error);
                    }
                    
                    // Force hard reload to the home page
                    window.location.href = "/";
                  }}
                  className={`
                    text-xs px-2.5 py-1 rounded-md
                    bg-white text-gray-800
                    border-2 border-black 
                    shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]
                    hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]
                    active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]
                    transform hover:-translate-y-0.5 hover:-translate-x-0.5
                    active:translate-y-0.5 active:translate-x-0.5
                    transition-all duration-200
                    font-medium mt-1
                  `}
                >
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
