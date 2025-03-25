/**
 * Simplified Language Display Component
 * 
 * This is a simplified version that shows English as the default language
 * without any language switching functionality.
 */
import React from 'react';
import { Globe } from 'lucide-react';
import { useDirectText } from '@/lib/direct-text';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Display variants
export type LanguageSwitcherVariant = 
  | 'minimal'    // Icon only
  | 'compact'    // Icon with current flag
  | 'standard'   // Flag with language name
  | 'full'       // "Language" text + flag + language name
  | 'custom';    // Custom by user

interface LanguageSwitcherProps {
  variant?: LanguageSwitcherVariant;
  className?: string;
  buttonClassName?: string;
  showLabel?: boolean;
  iconSize?: number;
  customLabel?: string;
  // The following props are kept for backward compatibility but not used
  dropdownClassName?: string;
  showOnlyAvailable?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onLanguageChange?: (lang: string) => void;
}

export function LanguageSwitcher({
  variant = 'standard',
  className = '',
  buttonClassName = '',
  showLabel = true,
  iconSize = 18,
  customLabel,
}: LanguageSwitcherProps) {
  
  const { t } = useDirectText();
  console.log("[LanguageSwitcher] Current language: en");
  
  // Fixed values for English
  const currentFlag = '🇺🇸';
  const currentLabel = 'English';
  
  // Render the button based on variant
  const renderButton = () => {
    switch (variant) {
      case 'minimal':
        return (
          <Button 
            variant="ghost" 
            size="icon" 
            className={buttonClassName}
          >
            <Globe size={iconSize} />
          </Button>
        );
        
      case 'compact':
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className={buttonClassName}
          >
            <span className="mr-1">{currentFlag}</span>
          </Button>
        );
        
      case 'standard':
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("flex items-center space-x-1", buttonClassName)}
          >
            <span>{currentFlag}</span>
            {showLabel && <span>{currentLabel}</span>}
          </Button>
        );
        
      case 'full':
        return (
          <Button 
            variant="ghost" 
            size="default" 
            className={cn("flex items-center space-x-2", buttonClassName)}
          >
            <Globe size={iconSize} />
            <span>{t('settings.language_settings')}</span>
            <span className="flex items-center">
              <span className="mr-1">{currentFlag}</span>
              {showLabel && <span>{currentLabel}</span>}
            </span>
          </Button>
        );
        
      case 'custom':
        return (
          <Button 
            variant="ghost" 
            size="default" 
            className={buttonClassName}
          >
            {customLabel || `${currentFlag} ${currentLabel}`}
          </Button>
        );
        
      default:
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className={buttonClassName}
          >
            <Globe size={iconSize} />
          </Button>
        );
    }
  };
  
  // Simplified component just shows the current language
  return (
    <div className={cn("inline-block", className)}>
      {renderButton()}
    </div>
  );
}