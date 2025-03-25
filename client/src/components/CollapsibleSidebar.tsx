import React, { useState, useCallback, useRef, useMemo, memo } from "react";
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
  Subtitles as TranscriptionIcon,
  Workflow as WorkflowIcon,
  Brain as AIIcon,
  Bot as BotIcon,
  Sparkles as SparklesIcon,
  Lightbulb as AnalyzerIcon,
  Calendar as PlannerIcon,
  Puzzle as PuzzleIcon,
  BookOpen as KnowledgeIcon,
  Settings,
  Info as InfoIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  SIDEBAR_STYLES, 
  SHADOWS, 
  BORDERS, 
  ANIMATIONS, 
  BUTTON_3D_STYLES 
} from "@/styles/modern-3d-design-system";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDirectText } from "@/lib/direct-text";

interface CollapsibleSidebarProps {
  className?: string;
}

// Interface for navigation items
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const CollapsibleSidebar = ({ className }: CollapsibleSidebarProps) => {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useDirectText();
  
  // Removed excessive logging that was causing performance issues
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'ai-agents': false,
    'content-hub': false,
    'workflows': false,
    'tools': false,
    'analyzer': false,
    'planner': false,
    'knowledge-base': false,
    'academy': false,
    'settings': false
  });

  // Define navigation items with subcategories
  const navItems: NavItem[] = [
    {
      label: t('ai_team'),
      href: "#ai-agents",
      icon: <UsersIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />,
      children: [
        {
          label: t('ai_team'),
          href: "/team",
          icon: <UsersIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: t('ai_copywriter'),
          href: "/team/copywriting",
          icon: <FileTextIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: t('ai_seo_strategist'),
          href: "/team/seo",
          icon: <SearchIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: t('ai_ad_manager'),
          href: "/team/ads",
          icon: <BarChart2Icon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "Social Media Management",
          href: "/team/social",
          icon: <SparklesIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "Email & Outreach",
          href: "/team/email",
          icon: <MailIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "Analytics & Optimization",
          href: "/team/analytics",
          icon: <BarChart2Icon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "Agent Profiles",
          href: "/team/profiles",
          icon: <UserIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        }
      ]
    },
    {
      label: "AI-Powered Content Hub",
      href: "#content-hub",
      icon: <SparklesIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />,
      children: [
        {
          label: "AI-Generated Content",
          href: "/content-hub",
          icon: <SparklesIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "Templates",
          href: "/content-hub/templates",
          icon: <FileTextIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "Saved Drafts",
          href: "/drafts",
          icon: <FileIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        }
      ]
    },
    {
      label: "AI Workflows",
      href: "#workflows",
      icon: <WorkflowIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />,
      children: [
        {
          label: "Pre-Made AI Workflows",
          href: "/ai-workflows",
          icon: <BotIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "Build Your Own AI Team",
          href: "/ai-workflows",
          icon: <LayoutIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "LEGO Workflow Builder",
          href: "/lego-workflow",
          icon: <PuzzleIcon className="flex-shrink-0 h-5 w-5 text-blue-500" />
        },
        {
          label: "My AI Workflows",
          href: "/ai-workflows",
          icon: <FileIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        }
      ]
    },
    {
      label: "AI-Powered Marketing Tools",
      href: "/ai-tools",
      icon: <AIIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />,
      children: [
        {
          label: "AI Image & Logo Creator",
          href: "/ai-tools/image",
          icon: <ImageIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "AI Voice & Audio Generator",
          href: "/ai-tools/audio",
          icon: <AudioIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "AI Transcription & Subtitles",
          href: "/ai-tools/transcription",
          icon: <TranscriptionIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "AI Video Editor",
          href: "/ai-tools/video",
          icon: <VideoIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        }
      ]
    },
    {
      label: "AI Analyzer",
      href: "/analyzer",
      icon: <AnalyzerIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />,
      children: [
        {
          label: "AI Analyzer Dashboard",
          href: "/analyzer",
          icon: <AnalyzerIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "Ad Data Integrations",
          href: "/analyzer/data",
          icon: <BarChart2Icon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        }
      ]
    },
    {
      label: "AI Task Manager & Planner",
      href: "/planner",
      icon: <PlannerIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
    },
    {
      label: "AI Knowledge Base",
      href: "#knowledge-base",
      icon: <KnowledgeIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />,
      children: [
        {
          label: "Brand Memory",
          href: "/knowledge-base",
          icon: <KnowledgeIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "AI Training Docs",
          href: "/knowledge-base/training",
          icon: <FileTextIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "Style & Voice Settings",
          href: "/knowledge-base/style",
          icon: <SparklesIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        }
      ]
    },
    {
      label: "Academy",
      href: "#academy",
      icon: <KnowledgeIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />,
      children: [
        {
          label: "AI Training Courses",
          href: "/academy/courses",
          icon: <KnowledgeIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "Best Practices & Guides",
          href: "/academy/guides",
          icon: <FileTextIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        }
      ]
    },
    {
      label: "Personal & Settings",
      href: "#settings",
      icon: <UserIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />,
      children: [
        {
          label: "User Profile",
          href: "/settings",
          icon: <UserIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "App Settings",
          href: "/settings?tab=app-settings",
          icon: <LayoutIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        },
        {
          label: "Subscription",
          href: "/settings?tab=subscription",
          icon: <BarChart2Icon className="flex-shrink-0 h-5 w-5 text-gray-500" />
        }
      ]
    }
  ];

  // Check if any subitem in a section is active
  const isSectionActive = (items: NavItem[]) => {
    return items.some(item => location === item.href || location.startsWith(`${item.href}/`));
  };

  // Handle section expansion toggle with debounce to prevent multiple rapid clicks
  const lastClickRef = useRef<number>(0);
  const toggleSection = useCallback((sectionId: string) => {
    if (collapsed) return; // Don't toggle if sidebar is collapsed
    
    // Debounce clicks to prevent double-clicks/rapid clicks
    const now = Date.now();
    if (now - lastClickRef.current < 300) return;
    lastClickRef.current = now;
    
    // Toggle the expanded state first to make UI feel responsive
    setExpandedSections(prev => {
      const newExpandedState = !prev[sectionId];
      
      // Find the first child item in the section only if we're expanding
      if (newExpandedState) {
        const section = navItems.find(item => item.href.substring(1) === sectionId);
        
        // If the section has children, navigate to the first child
        if (section && section.children && section.children.length > 0) {
          // Use setTimeout to avoid navigation and state update conflicts
          const firstChild = section.children[0];
          if (firstChild && firstChild.href) {
            setTimeout(() => {
              setLocation(firstChild.href);
            }, 0);
          }
        }
      }
      
      return {
        ...prev,
        [sectionId]: newExpandedState
      };
    });
  }, [collapsed, navItems, setLocation]);

  // Auto-expand section if it contains the active route
  React.useEffect(() => {
    navItems.forEach(section => {
      if (section.children && isSectionActive(section.children)) {
        setExpandedSections(prev => ({
          ...prev,
          [section.href.substring(1)]: true
        }));
      }
    });
  }, [location]);

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    console.log(`Sidebar toggled to ${newCollapsedState ? 'collapsed' : 'expanded'} state`);
    setCollapsed(newCollapsedState);
  };

  // Only log sidebar state in development, not on every render
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Sidebar state changed to: ${collapsed ? 'collapsed' : 'expanded'}`);
    }
  }, [collapsed]);

  return (
    <aside 
      className={cn(
        SIDEBAR_STYLES.container,
        "relative h-full flex-shrink-0 flex flex-col justify-between transition-all duration-300 sidebar",
        collapsed ? "w-16" : "w-64",
        className
      )}
      data-testid="sidebar"
      data-collapsed={collapsed}
    >
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
          <svg className="w-8 h-8 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          {!collapsed && <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI Marketing</h1>}
        </div>
      </div>
      
      {/* Dashboard Button */}
      <div className="px-3 py-3 border-b border-black/10">
        <div className={cn("w-full")}>
          <Link href="/dashboard">
            <button
              className={cn(
                "w-full rounded-xl py-2.5 flex items-center justify-center",
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
                <span className="font-semibold">{t('dashboard')}</span>
              )}
            </button>
          </Link>
        </div>
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
        {/* Render collapsible navigation categories */}
        {navItems.map((section, idx) => {
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
                        "flex items-center justify-center px-2 cursor-pointer",
                        isActive ? SIDEBAR_STYLES.item.active : SIDEBAR_STYLES.item.default
                      )}
                      title={section.label}
                      data-testid={`sidebar-section-collapsed-${sectionId}`}
                    >
                      <span className={cn(
                        "flex-shrink-0",
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                      )}>{section.icon}</span>
                    </div>
                  </Link>
                ) : (
                  // When expanded and has children, make it toggleable
                  <button
                    onClick={() => toggleSection(sectionId)}
                    className={cn(
                      "flex items-center",
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
                // When it's a direct link (no children), always make it a link
                <Link href={section.href}>
                  <div
                    className={cn(
                      "flex items-center",
                      collapsed ? "justify-center px-2" : "",
                      location === section.href || location.startsWith(`${section.href}/`)
                        ? SIDEBAR_STYLES.item.active 
                        : SIDEBAR_STYLES.item.default,
                      "cursor-pointer"
                    )}
                    title={collapsed ? section.label : undefined}
                    data-testid={`sidebar-link-${section.href.replace(/\//g, '-')}`}
                  >
                    <span className={cn(
                      "flex-shrink-0",
                      collapsed ? "" : "mr-3",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                    )}>{section.icon}</span>
                    
                    {!collapsed && (
                      <span className="flex-1 text-left">{section.label}</span>
                    )}
                  </div>
                </Link>
              )}

              {/* Collapsible Subitems */}
              {!collapsed ? (
                <div>
                  {isExpanded && section.children && (
                    <div
                      className={cn(
                        SIDEBAR_STYLES.collapsible,
                        "max-h-0 transition-all duration-300 ease-in-out overflow-hidden",
                        isExpanded && "max-h-[500px]" // Adjust based on max expected height
                      )}
                    >
                      <div className="space-y-1 pt-1">
                        {section.children.map((item, itemIdx) => (
                          <SidebarLink
                            key={itemIdx}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            currentPath={location}
                            collapsed={collapsed}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* When collapsed, show subitems on hover only for sections with children */
                section.children ? (
                  <div className="relative group">
                    <div 
                      className={cn(
                        "hidden absolute left-12 top-0 bg-white rounded-md py-2 min-w-[200px] z-50",
                        "group-hover:block",
                        SHADOWS.md,
                        BORDERS.sm
                      )}
                    >
                      {section.children.map((item, itemIdx) => (
                        <Link key={itemIdx} href={item.href}>
                          <div
                            className={cn(
                              "flex items-center px-4 py-2 text-sm font-medium transition-all cursor-pointer",
                              location === item.href 
                                ? "text-blue-600 bg-blue-50" 
                                : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                            )}
                          >
                            <span className="flex-shrink-0 mr-3">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          );
        })}
      </ScrollArea>
      
      {/* User Profile Section - Fixed to eliminate white space and ensure consistent display */}
      {user ? (
        <div className={cn(
          "border-t mt-auto w-full bg-white", 
          BORDERS.light.sm,
          collapsed ? "p-2" : "p-4"
        )}
        data-testid="user-profile-section"
        >
          <div className={cn("flex w-full", collapsed ? "justify-center" : "items-center justify-between")}>
            <div className="flex items-center">
              <div className={cn(
                "h-8 w-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0",
                BORDERS.sm,
                SHADOWS.sm
              )}>
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-full w-full p-1" />
                )}
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[130px]">
                    {user.displayName || user.email || "User"}
                  </p>
                  <button 
                    onClick={logout}
                    className={cn(
                      "text-xs font-medium text-gray-500",
                      ANIMATIONS.transition.fast,
                      "hover:text-blue-600"
                    )}
                  >
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Fallback when no user is logged in - empty section to maintain layout
        <div className="mt-auto border-t bg-white p-2" data-testid="user-profile-section-empty"></div>
      )}
    </aside>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  currentPath: string;
  collapsed: boolean;
}

const SidebarLink = ({ href, icon, label, currentPath, collapsed }: SidebarLinkProps) => {
  const isActive = currentPath === href || currentPath.startsWith(`${href}/`);
  const { t } = useDirectText();
  
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center", // Add flex and items-center by default
          collapsed ? "justify-center px-2" : "",
          isActive 
            ? cn(
                SIDEBAR_STYLES.item.active, 
                SHADOWS.sm,
                ANIMATIONS.hover.scale,
                ANIMATIONS.active.press
              ) 
            : cn(
                SIDEBAR_STYLES.item.default,
                "hover:border-2 hover:border-black/50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]",
                ANIMATIONS.transition.default
              ),
          "cursor-pointer" // Ensure cursor shows this is clickable
        )}
        title={collapsed ? label : undefined}
        data-testid={`sidebar-link-${href.replace(/\//g, '-')}`}
      >
        <span className={cn(
          "flex-shrink-0",
          collapsed ? "" : "mr-3", // Only add margin when not collapsed
          isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
        )}>{icon}</span>
        {!collapsed && <span className={cn(
          "truncate",
          isActive ? "font-medium" : ""
        )}>{label}</span>}
        
        {/* 3D effects */}
        {!collapsed && isActive && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-blue-50/20 to-transparent transition-opacity rounded-lg"></div>
        )}
      </div>
    </Link>
  );
};

export default CollapsibleSidebar;