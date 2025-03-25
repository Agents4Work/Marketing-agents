import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { HEADER_STYLES, UI_COMPONENTS, SHADOWS, BORDERS, ANIMATIONS, COLORS } from "@/styles/modern-3d-design-system";

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      <p className={`
        cursor-pointer 
        font-medium 
        ${ANIMATIONS.transition.default} 
        text-black 
        hover:text-blue-600
        transform hover:-translate-y-0.5
        dark:text-white 
        dark:hover:text-blue-400
        px-2 
        py-1 
        rounded-md
        ${active === item ? 'font-bold text-blue-600 dark:text-blue-400' : ''}
      `}>
        {item}
      </p>
      {active !== null && active === item && (
        <div className="dropdown-container absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4 z-50">
          <div className={`
            dropdown-content 
            bg-white 
            dark:bg-gray-800 
            rounded-xl 
            border-3 
            border-black 
            shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]
            ${ANIMATIONS.fadeInDown} 
            backdrop-blur-sm 
            overflow-hidden
          `}>
            <div className="w-max h-full p-4">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className={`
        relative 
        rounded-full
        border-3 
        border-black
        dark:bg-gray-900
        bg-white 
        shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]
        flex 
        justify-center 
        space-x-8 
        px-8 
        py-4
        transition-all duration-200
        hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]
      `}
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className={`
      flex 
      space-x-2 
      p-3 
      rounded-lg 
      transform 
      hover:-translate-y-1 
      hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)] 
      transition-all 
      duration-200
      border-2
      border-transparent
      hover:border-black
    `}>
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] object-cover"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({ children, href, ...rest }: any) => {
  return (
    <Link 
      href={href} 
      className={`
        text-neutral-700 
        dark:text-neutral-200 
        hover:text-blue-600 
        dark:hover:text-blue-400
        font-medium
        transform
        hover:-translate-y-0.5
        hover:font-bold
        transition-all
        duration-200
        block 
        py-2
        px-3
        rounded-md
        hover:bg-blue-50
        dark:hover:bg-blue-900/20
        border-l-2
        border-transparent
        hover:border-blue-500
      `}
    >
      {children}
    </Link>
  );
};

const NavigationMenu = () => {
  const [active, setActive] = useState<string | null>(null);
  const { user, login } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="
      relative 
      w-full 
      mx-auto 
      px-4 
      py-3 
      flex 
      items-center 
      justify-between 
      z-50 
      bg-white 
      dark:bg-gray-900 
      border-b-3 
      border-black 
      shadow-[0px_4px_0px_0px_rgba(0,0,0,0.9)]
    ">
      {/* Logo */}
      <div className="flex items-center mr-8">
        <Link href="/">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-blue-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text ml-2">AI Marketing</span>
          </div>
        </Link>
      </div>

      {/* Menu */}
      <div className="flex-1 flex justify-center">
        <Menu setActive={setActive}>
          <MenuItem setActive={setActive} active={active} item="Features">
            <div className="grid grid-cols-2 gap-4 p-2">
              <ProductItem
                title="AI Agents"
                description="Smart AI agents that automate your marketing tasks"
                href="/sign-in"
                src="/assets/features-agents.svg"
              />
              <ProductItem
                title="Workflow Builder"
                description="Create custom automated marketing workflows"
                href="/sign-in"
                src="/assets/features-workflow.svg"
              />
              <ProductItem
                title="Analytics"
                description="Detailed insights and performance metrics"
                href="/sign-in"
                src="/assets/features-analytics.svg"
              />
              <ProductItem
                title="Integrations"
                description="Connect with your favorite marketing tools"
                href="/sign-in"
                src="/assets/features-integrations.svg"
              />
            </div>
          </MenuItem>
          <MenuItem setActive={setActive} active={active} item="Solutions">
            <div className="grid grid-cols-1 gap-4 p-2">
              <HoveredLink href="/sign-in">Small Business</HoveredLink>
              <HoveredLink href="/sign-in">Enterprise</HoveredLink>
              <HoveredLink href="/sign-in">Marketing Agencies</HoveredLink>
              <HoveredLink href="/sign-in">E-Commerce</HoveredLink>
            </div>
          </MenuItem>
          <MenuItem setActive={setActive} active={active} item="Resources">
            <div className="grid grid-cols-1 gap-4 p-2">
              <HoveredLink href="/sign-in">Blog</HoveredLink>
              <HoveredLink href="/sign-in">Guides</HoveredLink>
              <HoveredLink href="/sign-in">Case Studies</HoveredLink>
              <HoveredLink href="/sign-in">Support</HoveredLink>
              <HoveredLink href="/sign-in" className="text-blue-500 font-semibold">i18n Demo</HoveredLink>
            </div>
          </MenuItem>
          <MenuItem setActive={setActive} active={active} item="Pricing">
            <div className="grid grid-cols-1 gap-4 p-2">
              <HoveredLink href="/sign-in">Plans</HoveredLink>
              <HoveredLink href="/sign-in">Compare Features</HoveredLink>
              <HoveredLink href="/sign-in">Enterprise Pricing</HoveredLink>
            </div>
          </MenuItem>
        </Menu>
      </div>

      {/* Login/Sign-up Buttons */}
      <div className="flex items-center space-x-4">
        {user ? (
          <Button 
            onClick={() => setLocation("/dashboard")}
            className="
              bg-white 
              text-blue-600 
              font-bold 
              border-2 
              border-black 
              shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] 
              hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] 
              active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]
              transform 
              hover:-translate-y-0.5 
              hover:-translate-x-0.5 
              active:translate-y-0.5 
              active:translate-x-0.5
              transition-all 
              duration-200
            "
          >
            Dashboard
          </Button>
        ) : (
          <>
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/sign-in")}
              className="
                text-gray-700
                dark:text-gray-200
                font-medium
                hover:text-blue-600
                dark:hover:text-blue-400
                transform 
                hover:-translate-y-0.5 
                active:translate-y-0.5 
                transition-all 
                duration-200
              "
            >
              Login
            </Button>
            <Button 
              onClick={() => setLocation("/sign-in?tab=register")}
              className="
                bg-blue-500 
                text-white 
                font-bold 
                border-2 
                border-black 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] 
                hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] 
                active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]
                transform 
                hover:-translate-y-0.5 
                hover:-translate-x-0.5 
                active:translate-y-0.5 
                active:translate-x-0.5
                transition-all 
                duration-200
              "
            >
              Sign Up
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

// Add CSS for animations
const BORDERS_RADIUS = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

// Extra 3D styles for buttons
const BUTTON_3D_STYLES = {
  primary: "bg-blue-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  interaction: {
    moveOnHover: "transform hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5",
    grow: "transform hover:scale-[1.02] active:scale-[0.98]",
  },
};

export default NavigationMenu;