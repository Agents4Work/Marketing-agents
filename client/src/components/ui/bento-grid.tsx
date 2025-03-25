import { ReactNode } from "react";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  title,
  description,
  icon,
  className,
  onClick,
  href,
  cta = "Learn more",
}: {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  cta?: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group relative flex h-[240px] flex-col justify-between overflow-hidden rounded-xl p-6 transition-all duration-300 animate-fadeIn",
        // light styles
        "bg-white shadow-md hover:shadow-xl hover:scale-[1.02]",
        // dark styles
        "dark:bg-gray-900 dark:shadow-none dark:hover:bg-gray-800/80 dark:border dark:border-gray-800",
        className,
      )}
      onClick={onClick}
    >
      {/* Agent profile badge - positioned in top right */}
      <div className="absolute top-3 right-3 z-20 text-xs font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary opacity-0 transform translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
        AI Agent
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 transition-all duration-300 group-hover:from-white/10 dark:from-white/5 dark:to-white/0 dark:group-hover:from-white/10"></div>
      
      <div className="z-10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transform transition-all duration-300 group-hover:scale-110">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-all duration-300 group-hover:text-primary">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-300">
          {description}
        </p>
      </div>
      
      {href && (
        <div className="z-10 pt-4">
          {typeof cta === 'string' ? (
            <Button 
              variant="default" 
              size="sm" 
              className="opacity-0 transform translate-y-5 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
              asChild
            >
              <a href={href}>
                {cta}
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <div className="opacity-0 transform translate-y-5 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              {cta}
            </div>
          )}
        </div>
      )}
    </div>
  );
};