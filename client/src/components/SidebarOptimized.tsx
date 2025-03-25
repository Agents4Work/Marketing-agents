import React, { useState, useCallback, useMemo, memo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Search as SearchIcon, 
  Mail as MailIcon, 
  FileText as FileTextIcon, 
  Layout as LayoutIcon, 
  BarChart2 as BarChart2Icon, 
  File as FileIcon, 
  User as UserIcon,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  Image as ImageIcon,
  Headphones as AudioIcon,
  Video as VideoIcon,
  Settings as SettingsIcon,
  Globe as GlobeIcon,
  HardDrive as HardDriveIcon,
  Info
} from "lucide-react";
// Import custom icons
import { 
  WorkflowIcon,
  BrainIcon as AIIcon,
  BotIcon,
  SparklesIcon,
  LightbulbIcon as AnalyzerIcon,
  PlannerIcon,
  PuzzleIcon,
  KnowledgeIcon,
  SubtitlesIcon as TranscriptionIcon
} from "./icons/CustomIcons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDirectText } from "@/lib/direct-text.tsx";
import { SIDEBAR_STYLES, SHADOWS, BORDERS, ANIMATIONS, BUTTON_3D_STYLES } from "@/styles/modern-3d-design-system";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

// Memoized link component for better performance
const NavLink = memo(({ 
  href, 
  label, 
  icon, 
  isActive, 
  isCollapsed 
}: { 
  href: string; 
  label: string; 
  icon: React.ReactNode; 
  isActive: boolean; 
  isCollapsed: boolean;
}) => (
  <Link href={href}>
    <div
      className={cn(
        SIDEBAR_STYLES.item.default,
        isActive && SIDEBAR_STYLES.item.active,
        "flex items-center cursor-pointer py-2 px-3 transition-all w-full",
        isCollapsed ? "justify-center" : ""
      )}
      title={isCollapsed ? label : undefined}
    >
      <span className={cn(
        "flex-shrink-0",
        isCollapsed ? "" : "mr-3",
        isActive 
          ? "text-blue-600 dark:text-blue-400" 
          : "text-gray-600 dark:text-gray-400"
      )}>
        {icon}
      </span>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </div>
  </Link>
));
NavLink.displayName = 'NavLink';

// Memoized section header component
const SectionHeader = memo(({ 
  label, 
  icon, 
  isExpanded, 
  isActive,
  isCollapsed,
  onClick 
}: { 
  label: string; 
  icon: React.ReactNode; 
  isExpanded: boolean; 
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}) => (
  <button
    className={cn(
      SIDEBAR_STYLES.item.default,
      isActive && SIDEBAR_STYLES.item.active,
      "flex items-center w-full py-2 px-3 transition-all",
      isCollapsed ? "justify-center" : ""
    )}
    onClick={onClick}
    title={isCollapsed ? label : undefined}
  >
    <span className={cn(
      "flex-shrink-0",
      isCollapsed ? "" : "mr-3",
      isActive 
        ? "text-blue-600 dark:text-blue-400" 
        : "text-gray-600 dark:text-gray-400"
    )}>
      {icon}
    </span>
    {!isCollapsed && (
      <>
        <span className="flex-1 text-left truncate">{label}</span>
        <ChevronDown 
          size={16} 
          className={cn(
            "transition-transform duration-200",
            isExpanded ? "transform rotate-180" : ""
          )} 
        />
      </>
    )}
  </button>
));
SectionHeader.displayName = 'SectionHeader';

// User profile component
const UserProfile = memo(({ 
  user, 
  isCollapsed, 
  onLogout 
}: { 
  user: any; 
  isCollapsed: boolean; 
  onLogout: () => void 
}) => (
  <div className={cn(
    "border-t mt-auto p-3 bg-white dark:bg-gray-900",
    "w-full transition-all duration-200"
  )}>
    <div className={cn(
      "flex w-full items-center", 
      isCollapsed ? "justify-center" : "justify-between"
    )}>
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || "User"} 
              className="h-full w-full object-cover"
            />
          ) : (
            <UserIcon className="h-full w-full p-1" />
          )}
        </div>
        
        {!isCollapsed && (
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[130px]">
              {user?.displayName || user?.email || "User"}
            </p>
            <button 
              onClick={onLogout}
              className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      
      {!isCollapsed && (
        <Link href="/settings">
          <div
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="Settings"
          >
            <SettingsIcon size={18} />
          </div>
        </Link>
      )}
    </div>
  </div>
));
UserProfile.displayName = 'UserProfile';

export default function SidebarOptimized({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useDirectText();
  
  // Sidebar state
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'ai-agents': false,
    'content-hub': false,
    'workflows': false,
    'tools': false,
    'analyzer': false,
    'planner': false,
    'knowledge-base': false,
    'google-integration': false,
    'academy': false,
    'settings': false
  });
  
  // Last click timestamp for debouncing
  const lastClickTimestamp = React.useRef<number>(0);
  
  // Navigation items (memoized to prevent recreation) - EXACTLY matching original menu structure
  const navItems = useMemo(() => [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={18} className="text-blue-600" />,
    },
    {
      label: "Agent Marketplace",
      href: "#ai-agents",
      icon: <UsersIcon size={18} className="text-blue-500" />,
      children: [
        {
          label: "All Agents",
          href: "/agent-marketplace",
          icon: <UsersIcon size={18} className="text-gray-500" />
        },
        {
          label: "Content Creation",
          href: "/agent-marketplace/category/content", 
          icon: <FileTextIcon size={18} className="text-gray-500" />
        },
        {
          label: "SEO Optimization",
          href: "/agent-marketplace/category/seo",
          icon: <SearchIcon size={18} className="text-gray-500" />
        },
        {
          label: "Advertising",
          href: "/agent-marketplace/category/advertising",
          icon: <BarChart2Icon size={18} className="text-gray-500" />
        },
        {
          label: "Social Media",
          href: "/agent-marketplace/category/social",
          icon: <SparklesIcon size={18} className="text-gray-500" />
        },
        {
          label: "Email Marketing",
          href: "/agent-marketplace/category/email",
          icon: <MailIcon size={18} className="text-gray-500" />
        }
      ]
    },
    {
      label: "AI-Powered Content Hub",
      href: "#content-hub",
      icon: <SparklesIcon size={18} className="text-blue-500" />,
      children: [
        {
          label: "AI-Generated Content",
          href: "/content-hub",
          icon: <SparklesIcon size={18} className="text-gray-500" />
        },
        {
          label: "Templates",
          href: "/content-hub/templates",
          icon: <FileTextIcon size={18} className="text-gray-500" />
        },
        {
          label: "Saved Drafts", 
          href: "/drafts",
          icon: <FileIcon size={18} className="text-gray-500" />
        }
      ]
    },
    {
      label: "AI Workflows",
      href: "#workflows",
      icon: <WorkflowIcon size={18} className="text-blue-500" />,
      children: [
        {
          label: "Pre-Made AI Workflows",
          href: "/ai-workflows",
          icon: <BotIcon size={18} className="text-gray-500" />
        },
        {
          label: "Agent Workflows",
          href: "/ai-workflows",
          icon: <LayoutIcon size={18} className="text-gray-500" />
        },
        {
          label: "LEGO Workflow Builder",
          href: "/lego-workflow",
          icon: <PuzzleIcon size={18} className="text-blue-500" />
        },
        {
          label: "My AI Workflows",
          href: "/workflows",
          icon: <FileIcon size={18} className="text-gray-500" />
        }
      ]
    },
    {
      label: "AI-Powered Marketing Tools",
      href: "#tools",
      icon: <AIIcon size={18} className="text-blue-500" />,
      children: [
        {
          label: "AI Image & Logo Creator",
          href: "/ai-tools/image",
          icon: <ImageIcon size={18} className="text-gray-500" />
        },
        {
          label: "AI Voice & Audio Generator",
          href: "/ai-tools/audio",
          icon: <AudioIcon size={18} className="text-gray-500" />
        },
        {
          label: "AI Transcription & Subtitles",
          href: "/ai-tools/transcription",
          icon: <TranscriptionIcon size={18} className="text-gray-500" />
        },
        {
          label: "AI Video Editor",
          href: "/ai-tools/video",
          icon: <VideoIcon size={18} className="text-gray-500" />
        }
      ]
    },
    {
      label: "AI Analyzer",
      href: "#analyzer",
      icon: <AnalyzerIcon size={18} className="text-blue-500" />,
      children: [
        {
          label: "AI Analyzer Dashboard",
          href: "/analyzer",
          icon: <AnalyzerIcon size={18} className="text-gray-500" />
        },
        {
          label: "Ad Data Integrations",
          href: "/analyzer/data",
          icon: <BarChart2Icon size={18} className="text-gray-500" />
        }
      ]
    },
    {
      label: "AI Task Manager & Planner",
      href: "/planner",
      icon: <PlannerIcon size={18} className="text-blue-500" />,
    },
    {
      label: "AI Knowledge Base",
      href: "#knowledge-base",
      icon: <KnowledgeIcon size={18} className="text-blue-500" />,
      children: [
        {
          label: "Brand Memory",
          href: "/knowledge-base",
          icon: <KnowledgeIcon size={18} className="text-gray-500" />
        },
        {
          label: "AI Training Docs",
          href: "/knowledge-base/training",
          icon: <FileTextIcon size={18} className="text-gray-500" />
        },
        {
          label: "Style & Voice Settings",
          href: "/knowledge-base/style",
          icon: <SparklesIcon size={18} className="text-gray-500" />
        }
      ]
    },
    {
      label: "Google Workspace",
      href: "#google-integration",
      icon: <HardDriveIcon size={18} className="text-blue-500" />,
      children: [
        {
          label: "Google Drive",
          href: "/google-drive",
          icon: <HardDriveIcon size={18} className="text-gray-500" />
        },
        {
          label: "Google Docs",
          href: "/google-docs",
          icon: <FileTextIcon size={18} className="text-gray-500" />
        }
      ]
    },
    {
      label: "Academy",
      href: "#academy",
      icon: <KnowledgeIcon size={18} className="text-blue-500" />,
      children: [
        {
          label: "AI Training Courses",
          href: "/academy/courses",
          icon: <KnowledgeIcon size={18} className="text-gray-500" />
        },
        {
          label: "Best Practices & Guides",
          href: "/academy/guides",
          icon: <FileTextIcon size={18} className="text-gray-500" />
        }
      ]
    },
    {
      label: "Personal & Settings",
      href: "#settings",
      icon: <UserIcon size={18} className="text-blue-500" />,
      children: [
        {
          label: "User Profile",
          href: "/settings",
          icon: <UserIcon size={18} className="text-gray-500" />
        },
        {
          label: "App Settings",
          href: "/settings?tab=app-settings",
          icon: <LayoutIcon size={18} className="text-gray-500" />
        },
        {
          label: "Subscription",
          href: "/settings?tab=subscription",
          icon: <BarChart2Icon size={18} className="text-gray-500" />
        }
      ]
    }
  ], [t]);
  
  // Check if a section is active based on current location
  const isSectionActive = useCallback((items?: NavItem[]) => {
    if (!items) return false;
    return items.some(item => 
      location === item.href || 
      location.startsWith(`${item.href}/`)
    );
  }, [location]);
  
  // Toggle section expanded state with debounce
  const toggleSection = useCallback((sectionId: string) => {
    // Simple debounce to prevent double-clicks
    const now = Date.now();
    if (now - lastClickTimestamp.current < 300) return;
    lastClickTimestamp.current = now;
    
    // Toggle expansion state
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);
  
  // Toggle sidebar collapsed state
  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => !prev);
    // Log state change in development mode only
    if (process.env.NODE_ENV === 'development') {
      console.log(`Sidebar state changed to: ${!collapsed ? 'collapsed' : 'expanded'}`);
    }
  }, [collapsed]);

  // Auto-expand sections that contain the active page
  React.useEffect(() => {
    navItems.forEach(section => {
      if (section.children && isSectionActive(section.children)) {
        setExpandedSections(prev => ({
          ...prev,
          [section.href.substring(1)]: true
        }));
      }
    });
  }, [location, navItems, isSectionActive]);

  return (
    <aside 
      className={cn(
        SIDEBAR_STYLES.container,
        "relative h-full flex-shrink-0 flex flex-col justify-between transition-all duration-300 sidebar",
        collapsed ? "w-16" : "w-64",
        className
      )}
      data-collapsed={collapsed}
      data-testid="sidebar"
    >
      {/* Toggle button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "absolute -right-3 top-20 z-10 h-6 w-6 rounded-full bg-white p-0",
          BORDERS.sm,
          SHADOWS.sm
        )}
        onClick={toggleSidebar}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>

      {/* Logo/Brand Area */}
      <div className={cn("p-4", BORDERS.light.sm, "border-b")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "space-x-2")}>
          <GlobeIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
          {!collapsed && <h1 className="text-xl font-bold text-blue-600">AI Marketing</h1>}
        </div>
      </div>
      
      {/* Dashboard Button */}
      <div className="px-3 py-3 border-b border-black/10">
        <Link href="/dashboard">
          <div
            className={cn(
              "w-full rounded-xl py-2.5 flex items-center justify-center cursor-pointer",
              BUTTON_3D_STYLES.primary, 
              BUTTON_3D_STYLES.interaction.moveOnHover,
              ANIMATIONS.transition.default,
              collapsed ? "px-2" : "px-4"
            )}
          >
            <LayoutDashboard 
              size={collapsed ? 20 : 18} 
              className={cn("stroke-[2.5]", collapsed ? "" : "mr-2")} 
            />
            {!collapsed && (
              <span className="font-semibold text-white lowercase">dashboard</span>
            )}
          </div>
        </Link>
      </div>
      
      {/* Navigation Items */}
      <ScrollArea
        className={cn(
          "p-2 space-y-2 flex-1",
          "max-h-[calc(100vh-240px)]", // Extra space to ensure user profile visibility
          collapsed ? "px-2" : "px-4"
        )}
        data-testid="sidebar-navigation"
      >
        {/* Render all navigation categories */}
        {navItems.slice(1).map((section, idx) => {
          const sectionId = section.href.substring(1);
          const isActive = section.children && isSectionActive(section.children);
          const isExpanded = expandedSections[sectionId];

          return (
            <div key={idx} className="space-y-1">
              {/* Section Header (Clickable to expand/collapse or navigate) */}
              {section.children ? (
                collapsed ? (
                  // When collapsed and has children, make it a link to the first child
                  <Link href={section.children[0].href}>
                    <div
                      className={cn(
                        "flex items-center justify-center px-2 cursor-pointer h-10",
                        isActive ? SIDEBAR_STYLES.item.active : SIDEBAR_STYLES.item.default
                      )}
                      title={section.label}
                      data-testid={`sidebar-section-collapsed-${sectionId}`}
                    >
                      <span className={cn(
                        "flex-shrink-0",
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-blue-500 dark:text-blue-400"
                      )}>{section.icon}</span>
                    </div>
                  </Link>
                ) : (
                  // When expanded and has children, make it toggleable
                  <button
                    onClick={() => toggleSection(sectionId)}
                    className={cn(
                      "flex items-center w-full",
                      isActive ? SIDEBAR_STYLES.item.active : SIDEBAR_STYLES.item.default
                    )}
                    data-testid={`sidebar-section-${sectionId}`}
                  >
                    <span className="flex-shrink-0 mr-3">{section.icon}</span>
                    <span className="flex-1 text-left">{section.label}</span>
                    <ChevronDown 
                      size={16} 
                      className={cn(
                        "transition-transform duration-200",
                        isExpanded ? "transform rotate-180" : ""
                      )} 
                    />
                  </button>
                )
              ) : (
                // When it's a direct link (no children)
                <Link href={section.href}>
                  <div
                    className={cn(
                      "flex items-center",
                      collapsed ? "justify-center h-10" : "",
                      location === section.href ? SIDEBAR_STYLES.item.active : SIDEBAR_STYLES.item.default
                    )}
                    data-testid={`sidebar-link-${section.href.replace(/\//g, '-')}`}
                  >
                    <span className={cn(
                      "flex-shrink-0", 
                      collapsed ? "" : "mr-3",
                      "text-blue-500"
                    )}>{section.icon}</span>
                    {!collapsed && <span>{section.label}</span>}
                  </div>
                </Link>
              )}

              {/* Show expanded section items */}
              {!collapsed && section.children && isExpanded && (
                <div className="ml-5 pl-2 border-l border-gray-200 space-y-1">
                  {section.children.map((child, childIdx) => (
                    <Link key={childIdx} href={child.href}>
                      <div
                        className={cn(
                          "flex items-center w-full",
                          location === child.href ? SIDEBAR_STYLES.item.active : SIDEBAR_STYLES.item.default,
                          "text-sm"
                        )}
                        data-testid={`sidebar-child-link-${child.href.replace(/\//g, '-')}`}
                      >
                        <span className="flex-shrink-0 mr-3 text-gray-500">{child.icon}</span>
                        <span>{child.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </ScrollArea>
      
      {/* User Profile */}
      {user ? (
        <UserProfile 
          user={user} 
          isCollapsed={collapsed} 
          onLogout={logout} 
        />
      ) : (
        <div className="border-t p-3 flex justify-center items-center">
          <Link href="/login">
            <Button variant="outline" size="sm" className="cursor-pointer">
              {collapsed ? <UserIcon size={16} /> : "Sign In"}
            </Button>
          </Link>
        </div>
      )}
    </aside>
  );
}