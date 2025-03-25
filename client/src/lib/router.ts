// Simple utility to allow navigation from outside React components
let navigate: (to: string) => void;

export const initializeRouter = (setLocation: (to: string) => void) => {
  navigate = setLocation;
};

export const navigateTo = (to: string) => {
  if (navigate) {
    navigate(to);
  } else {
    console.warn('Router not initialized, falling back to window.location');
    window.location.href = to;
  }
};