import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Save, 
  Zap,
  ChevronDown
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  HEADER_STYLES, 
  SHADOWS, 
  BORDERS, 
  ANIMATIONS, 
  BUTTON_3D_STYLES, 
  UI_COMPONENTS,
  TYPOGRAPHY
} from "@/styles/modern-3d-design-system";
import Modern3DButton from "@/components/ui/modern-3d-button";

interface HeaderProps {
  title: string;
  campaignName: string;
  onCampaignNameChange: (name: string) => void;
  onSaveWorkflow: () => void;
  onRunCampaign: () => void;
  lastSaved?: string;
  mode: "autonomous" | "semiautonomous";
  onModeChange: (mode: "autonomous" | "semiautonomous") => void;
}

const Header = ({
  title,
  campaignName,
  onCampaignNameChange,
  onSaveWorkflow,
  onRunCampaign,
  lastSaved,
  mode,
  onModeChange
}: HeaderProps) => {
  const [name, setName] = useState(campaignName);
  const { toast } = useToast();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleNameBlur = () => {
    onCampaignNameChange(name);
  };

  const handleSave = () => {
    onSaveWorkflow();
    toast({
      title: "Workflow saved",
      description: "Your workflow has been saved successfully.",
    });
  };

  const handleRun = () => {
    if (!campaignName.trim()) {
      toast({
        title: "Campaign name required",
        description: "Please enter a name for your campaign before running it.",
        variant: "destructive"
      });
      return;
    }
    
    onRunCampaign();
    toast({
      title: "Campaign started",
      description: "Your campaign is now running with AI agents.",
    });
  };

  return (
    <header className={cn(
      HEADER_STYLES.container,
      "z-10",
    )}>
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <h1 className={cn(
            TYPOGRAPHY.headings.h4,
            "text-gray-800 dark:text-gray-100"
          )}>{title}</h1>
          <div className="flex items-center space-x-2">
            <span className={cn(
              TYPOGRAPHY.utility.label,
              "mr-1"
            )}>Mode:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className={cn(
                  BUTTON_3D_STYLES.base,
                  BUTTON_3D_STYLES.sizes.sm,
                  mode === "autonomous" ? BUTTON_3D_STYLES.primary : BUTTON_3D_STYLES.outline,
                  BUTTON_3D_STYLES.interaction.moveOnHover, 
                  "flex items-center font-medium cursor-pointer will-change-transform"
                )}
                style={{
                  backfaceVisibility: "hidden",
                  perspective: "1000px",
                  transformStyle: "preserve-3d"
                }}>
                  {mode === "autonomous" ? "Autonomous" : "Semi-autonomous"}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={cn(
                HEADER_STYLES.dropdown,
                "p-1 mt-1"
              )}>
                <DropdownMenuItem onClick={() => onModeChange("autonomous")}
                  className={cn(
                    "rounded-md px-3 py-2 cursor-pointer",
                    mode === "autonomous" ? "bg-blue-50 text-blue-600 font-medium" : ""
                  )}>
                  Autonomous
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onModeChange("semiautonomous")}
                  className={cn(
                    "rounded-md px-3 py-2 cursor-pointer",
                    mode === "semiautonomous" ? "bg-blue-50 text-blue-600 font-medium" : ""
                  )}>
                  Semi-autonomous
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Modern3DButton 
            onClick={handleSave}
            className={cn(BUTTON_3D_STYLES.sizes.md)}
            accentColor="bg-blue-500"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Workflow
          </Modern3DButton>
          
          <Modern3DButton 
            onClick={handleRun}
            className={cn(BUTTON_3D_STYLES.sizes.md)}
            accentColor="bg-orange-500"
          >
            <Zap className="mr-2 h-4 w-4" />
            Run Campaign
          </Modern3DButton>
        </div>
      </div>
      
      <div className={cn(
        "px-6 py-3",
        "bg-gray-50 dark:bg-gray-800",
        BORDERS.prominent
      )}>
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center">
              <span className={cn(
                TYPOGRAPHY.utility.label,
                "mr-2"
              )}>Campaign Name:</span>
              <Input
                className={cn(
                  UI_COMPONENTS.input,
                  "w-64 sm:w-80 h-9",
                  "transition-all duration-200 will-change-transform",
                  "focus:shadow-[2px_2px_0px_0px_rgba(59,130,246,0.9)]",
                )}
                style={{
                  backfaceVisibility: "hidden",
                  willChange: "transform, box-shadow"
                }}
                placeholder="Summer Sales Campaign"
                value={name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
              />
            </div>
          </div>
          
          {lastSaved && (
            <div 
              className={cn(
                "flex items-center space-x-2 bg-white dark:bg-gray-900 rounded-lg px-3 py-1 will-change-transform",
                BORDERS.sm,
                SHADOWS.sm
              )}
              style={{
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d",
                willChange: "transform, opacity"
              }}
            >
              <span className={TYPOGRAPHY.utility.label}>Last saved:</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{lastSaved}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
