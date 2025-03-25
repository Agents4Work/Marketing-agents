/**
 * Premium 3D Design System
 * 
 * A comprehensive design system providing a consistent, high-end 3D visual style 
 * throughout the application. Emphasizes neumorphic elements with bold geometry,
 * crisp shadows, and dynamic effects.
 */

export const COLORS = {
  primary: {
    light: 'bg-blue-500',
    dark: 'bg-blue-600',
    gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
    hover: 'hover:bg-blue-600',
    text: 'text-blue-500',
  },
  secondary: {
    light: 'bg-purple-500',
    dark: 'bg-purple-600',
    gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
    hover: 'hover:bg-purple-600',
    text: 'text-purple-500',
  },
  success: {
    light: 'bg-green-500',
    dark: 'bg-green-600',
    gradient: 'bg-gradient-to-r from-green-500 to-green-600',
    hover: 'hover:bg-green-600',
    text: 'text-green-500',
  },
  warning: {
    light: 'bg-amber-500',
    dark: 'bg-amber-600',
    gradient: 'bg-gradient-to-r from-amber-500 to-amber-600',
    hover: 'hover:bg-amber-600',
    text: 'text-amber-500',
  },
  danger: {
    light: 'bg-red-500',
    dark: 'bg-red-600',
    gradient: 'bg-gradient-to-r from-red-500 to-red-600',
    hover: 'hover:bg-red-600',
    text: 'text-red-500',
  },
  info: {
    light: 'bg-cyan-500',
    dark: 'bg-cyan-600',
    gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
    hover: 'hover:bg-cyan-600',
    text: 'text-cyan-500',
  },
  neutral: {
    light: 'bg-gray-500',
    dark: 'bg-gray-600',
    gradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
    hover: 'hover:bg-gray-600',
    text: 'text-gray-500',
  },
  background: {
    light: 'bg-gradient-to-b from-white to-gray-100',
    dark: 'bg-gradient-to-b from-gray-900 to-gray-800',
  }
};

export const SHADOWS = {
  sm: 'shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]',
  md: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]',
  lg: 'shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]',
  xl: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]',
  xxl: 'shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)]',
  soft: 'shadow-[0px_10px_20px_rgba(0,0,0,0.15)]',
  glow: 'shadow-[0px_0px_20px_rgba(0,120,255,0.35)]',
  inner: 'shadow-inner',
  none: 'shadow-none',
  // Special effects
  pronounced: 'shadow-[0px_4px_8px_rgba(0,0,0,0.15),_0px_8px_16px_rgba(0,0,0,0.1)]',
  layered: 'shadow-[0px_2px_0px_rgba(0,0,0,1),_0px_4px_6px_rgba(0,0,0,0.1)]',
  // Hover shadows
  hover: {
    sm: 'hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]',
    md: 'hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)]',
    lg: 'hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,0.9)]',
    xl: 'hover:shadow-[9px_9px_0px_0px_rgba(0,0,0,0.9)]',
  },
  // Active shadows (when clicked)
  active: {
    sm: 'active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]',
    md: 'active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]',
    lg: 'active:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]',
  }
};

export const BORDERS = {
  none: 'border-0',
  sm: 'border border-black',
  md: 'border-2 border-black',
  lg: 'border-3 border-black',
  xl: 'border-4 border-black',
  prominent: 'border-b-3 border-black',
  light: {
    sm: 'border border-black/20',
    md: 'border-2 border-black/20',
    lg: 'border-3 border-black/20',
  }
};

export const BORDERS_RADIUS = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const ANIMATIONS = {
  // CSS animation class names
  fadeIn: 'animate-fadeIn',
  fadeInUp: 'animate-fadeInUp',
  fadeInDown: 'animate-fadeInDown',
  fadeInLeft: 'animate-fadeInLeft',
  fadeInRight: 'animate-fadeInRight',
  scaleIn: 'animate-scaleIn',
  floatSlow: 'animate-floatSlow',
  floatMedium: 'animate-floatMedium',
  floatFast: 'animate-floatFast',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  
  // Hover transitions
  hover: {
    scale: 'hover:scale-105 transition-transform duration-200',
    lift: 'hover:-translate-y-1 transition-transform duration-200',
    tilt: 'hover:rotate-1 transition-transform duration-200',
    glow: 'hover:shadow-[0px_0px_20px_rgba(0,120,255,0.5)] transition-shadow duration-200',
  },
  
  // Active animations
  active: {
    press: 'active:scale-95 transition-transform duration-100',
    push: 'active:translate-y-1 transition-transform duration-100',
  },
  
  // Transition timings
  transition: {
    fast: 'transition-all duration-100',
    default: 'transition-all duration-200',
    slow: 'transition-all duration-300',
    bounce: 'transition-all duration-300 ease-in-out',
  }
};

// 3D Card Styles
export const CARD_3D_STYLES = {
  wrapper: "group relative rounded-xl overflow-hidden",
  base: "rounded-xl bg-white dark:bg-gray-800 p-6 border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-200",
  interactive: "transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]",
  floating: "relative rounded-xl bg-white dark:bg-gray-800 p-6 border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] animate-floatSlow",
  accentBar: "absolute top-0 left-0 w-full h-2 bg-gradient-to-r",
  accentCorner: "absolute -top-1 -left-1 w-20 h-20 rotate-45 transform-origin-top-left bg-gradient-to-r",
  content: "relative",
  // Different variants
  variants: {
    default: "bg-white dark:bg-gray-800 border-3 border-black",
    solid: "bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 border-3 border-black",
    glass: "bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-2 border-white/20 dark:border-black/20",
    modern: "bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 border-3 border-black overflow-hidden",
  }
};

// 3D Button Styles
export const BUTTON_3D_STYLES = {
  base: "font-bold border-2 border-black transition-all",
  default: "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  primary: "bg-blue-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  secondary: "bg-purple-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  success: "bg-green-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  danger: "bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  warning: "bg-amber-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  info: "bg-cyan-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  dark: "bg-gray-800 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  light: "bg-gray-100 text-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  ghost: "bg-transparent hover:bg-gray-50 active:bg-gray-100 shadow-none",
  outline: "bg-transparent border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  // Interaction effects
  interaction: {
    moveOnHover: "transform hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5",
    grow: "transform hover:scale-[1.02] active:scale-[0.98]",
  },
  // Sizes
  sizes: {
    xs: "px-2 py-1 text-xs rounded",
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-5 py-2.5 text-base rounded-xl",
    xl: "px-7 py-3.5 text-lg rounded-xl",
  },
};

// SIDEBAR Specific Styles
export const SIDEBAR_STYLES = {
  container: "h-screen bg-white dark:bg-gray-900 border-r-3 border-black shadow-[6px_0px_0px_0px_rgba(0,0,0,0.9)]",
  item: {
    default: "flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors", 
    active: "flex items-center gap-3 px-3 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 font-medium rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]",
  },
  heading: "font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 py-2 mt-4",
  divider: "h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-2",
  collapsible: "border-l-3 border-black/40 ml-3 pl-2 space-y-1",
};

// HEADER Specific Styles
export const HEADER_STYLES = {
  container: "bg-white dark:bg-gray-900 border-b-3 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.9)]",
  logo: "font-black text-xl tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text",
  navLink: "font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
  navLinkActive: "font-bold text-blue-600 dark:text-blue-400",
  avatar: "rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  dropdown: "bg-white dark:bg-gray-800 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]",
};

// UI Component Styles
export const UI_COMPONENTS = {
  card: "bg-white dark:bg-gray-800 rounded-xl border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]",
  input: "bg-white dark:bg-gray-800 rounded-lg border-2 border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
  select: "bg-white dark:bg-gray-800 rounded-lg border-2 border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
  checkbox: "rounded border-2 border-black",
  radio: "rounded-full border-2 border-black",
  switch: "bg-gray-300 dark:bg-gray-700 rounded-full",
  switchHandle: "bg-white rounded-full border-2 border-black transform shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  badge: "rounded-full border-2 border-black px-2 py-0.5 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
  toast: "bg-white dark:bg-gray-800 rounded-xl border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]",
  tooltip: "bg-black text-white rounded-lg px-2 py-1 text-sm",
  tabs: {
    list: "flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 border-2 border-black",
    tab: "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-gray-700 dark:text-gray-300",
    tabSelected: "bg-white dark:bg-gray-900 shadow text-blue-600 dark:text-blue-400 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]",
  },
  modal: {
    backdrop: "fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm",
    panel: "bg-white dark:bg-gray-800 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]",
  },
  popover: "bg-white dark:bg-gray-800 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]",
};

// Space between elements
export const SPACING = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  xxl: 'gap-12',
  container: {
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  }
};

// Typography
export const TYPOGRAPHY = {
  headings: {
    brand: 'font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600',
    h1: 'text-4xl sm:text-5xl lg:text-6xl font-black',
    h2: 'text-3xl sm:text-4xl font-bold',
    h3: 'text-2xl sm:text-3xl font-bold',
    h4: 'text-xl font-bold',
    h5: 'text-lg font-semibold',
    h6: 'text-base font-semibold',
  },
  body: {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  },
  weights: {
    thin: 'font-thin',
    extralight: 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
  },
  utility: {
    label: 'text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400',
    code: 'font-mono text-sm bg-gray-100 dark:bg-gray-800 rounded border border-black px-1',
    caption: 'text-sm text-gray-500 dark:text-gray-400',
  }
};

export default {
  COLORS,
  SHADOWS,
  BORDERS,
  BORDERS_RADIUS,
  ANIMATIONS,
  CARD_3D_STYLES,
  BUTTON_3D_STYLES,
  SIDEBAR_STYLES,
  HEADER_STYLES,
  UI_COMPONENTS,
  SPACING,
  TYPOGRAPHY,
};