// Simplified canvas effect for better performance and compatibility
interface Point {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
}

let ctx: CanvasRenderingContext2D | null = null;
let points: Point[] = [];
let mousePosition = { x: 0, y: 0 };
let animationFrame: number;

function createPoints(count: number): Point[] {
  const newPoints: Point[] = [];
  for (let i = 0; i < count; i++) {
    newPoints.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      dx: (Math.random() - 0.5) * 1.5,
      dy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 3 + 1,
      color: `rgba(${Math.floor(Math.random() * 100) + 130}, ${Math.floor(Math.random() * 100) + 130}, ${Math.floor(Math.random() * 55) + 200}, 0.7)`
    });
  }
  return newPoints;
}

function drawLine(p1: Point, p2: Point) {
  if (!ctx) return;
  
  // Distance is pre-checked in the caller function with a faster calculation
  // Calculate final opacity
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const distanceSquared = dx * dx + dy * dy;
  
  // Only draw if points are close enough - using square of distance to avoid square root calculation
  if (distanceSquared < 22500) { // 150² = 22500
    // Opacity based on distance (using approximate method to avoid expensive square root)
    // We divide by 22500 and then take the sqrt of the result, which is much faster
    // than calculating the exact distance
    const opacity = 1 - Math.sqrt(distanceSquared) / 150;
    
    // Only draw if opacity is significant enough to be visible
    if (opacity > 0.1) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(130, 170, 255, ${opacity * 0.5})`;
      ctx.lineWidth = 1;
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }
}

// Track frame count to skip operations on some frames
let frameCount = 0;

function updatePoints() {
  try {
    if (!ctx) return;
    
    // Update canvas size if needed, but only check every 30 frames to reduce overhead
    if (frameCount % 30 === 0) {
      if (ctx.canvas.width !== window.innerWidth || ctx.canvas.height !== window.innerHeight) {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
      }
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Increment frame count
    frameCount = (frameCount + 1) % 120;
    
    // Update and draw points - use GPU-friendly operations
    const len = points.length;
    for (let i = 0; i < len; i++) {
      const point = points[i];
      
      // Move the point
      point.x += point.dx;
      point.y += point.dy;
      
      // Bounce off edges - simplified boundary check
      if ((point.x < 0 && point.dx < 0) || (point.x > ctx.canvas.width && point.dx > 0)) {
        point.dx = -point.dx;
      }
      if ((point.y < 0 && point.dy < 0) || (point.y > ctx.canvas.height && point.dy > 0)) {
        point.dy = -point.dy;
      }
      
      // Draw point
      ctx.beginPath();
      ctx.fillStyle = point.color;
      ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Only draw connections every other frame to dramatically improve performance
      if (frameCount % 2 === 0) {
        // Connect every 3rd point with nearby points - further reducing calculations
        if (i % 3 === 0) {
          // Draw lines between points, using fast stride to skip points
          for (let j = i + 3; j < len; j += 3) {
            const dx = point.x - points[j].x;
            const dy = point.y - points[j].y;
            // Quick distance check (squared distance)
            const distSq = dx*dx + dy*dy;
            if (distSq < 22500) { // 150^2
              drawLine(point, points[j]);
            }
          }
          
          // Only draw artificial lines on certain frames to reduce overdraw
          if (frameCount % 6 === 0) {
            // Calculate once per frame to avoid multiple expensive calls
            const now = Date.now() * 0.0005; // Slowed down for better performance
            const artificialTarget = {
              x: (mousePosition.x + point.x) / 2 + Math.cos(now + i * 0.1) * 50,
              y: (mousePosition.y + point.y) / 2 + Math.sin(now + i * 0.1) * 50
            };
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(150, 150, 255, 0.2)`;
            ctx.lineWidth = 1;
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(artificialTarget.x, artificialTarget.y);
            ctx.stroke();
          }
        }
      }
      
      // Draw line to mouse only for some points to reduce overdraw
      if (i % 4 === 0) {
        const dx = point.x - mousePosition.x;
        const dy = point.y - mousePosition.y;
        const distanceSquared = dx * dx + dy * dy;
        
        // Use faster range check
        if (distanceSquared < 40000) { // 200^2
          // Use fast approximation for distance calculation
          const approxDistance = Math.abs(dx) + Math.abs(dy); // Manhattan distance
          if (approxDistance < 250) { // Slightly higher than actual radius for safety
            // Only calculate actual distance if we're close enough
            const distance = Math.sqrt(distanceSquared);
            if (distance < 200) {
              const opacity = (1 - distance / 200) * 0.6; // Reduced opacity for performance
              ctx.beginPath();
              ctx.strokeStyle = `rgba(150, 150, 255, ${opacity})`;
              ctx.lineWidth = 1;
              ctx.moveTo(point.x, point.y);
              ctx.lineTo(mousePosition.x, mousePosition.y);
              ctx.stroke();
            }
          }
        }
      }
    }
    
    // Continue animation
    animationFrame = requestAnimationFrame(updatePoints);
  } catch (err) {
    console.warn("Error in canvas animation:", err);
    // Attempt to recover by requesting next frame
    animationFrame = requestAnimationFrame(updatePoints);
  }
}

// Track if we're already processing a mouse move to avoid too frequent updates
let isProcessingMove = false;

function handleMouseMove(e: MouseEvent) {
  if (isProcessingMove) return;
  
  isProcessingMove = true;
  requestAnimationFrame(() => {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
    isProcessingMove = false;
  });
}

function handleTouchMove(e: TouchEvent) {
  if (isProcessingMove) return;
  
  isProcessingMove = true;
  requestAnimationFrame(() => {
    if (e.touches.length > 0) {
      mousePosition.x = e.touches[0].clientX;
      mousePosition.y = e.touches[0].clientY;
    }
    isProcessingMove = false;
  });
}

function resizeCanvas() {
  if (ctx && ctx.canvas) {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
  }
}

export const renderCanvas = function(): (() => void) {
  // Safety check - ensure we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn("Canvas effect not initialized: browser environment not detected");
    return () => {}; // Return empty cleanup function
  }
  
  try {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) {
      console.warn("Canvas element not found, skipping network effect initialization");
      // Return empty cleanup function when canvas isn't found
      return () => {};
    }
    
    try {
      ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
      if (!ctx) {
        console.warn("Could not get 2D context from canvas");
        return () => {};
      }
      
      // Set canvas dimensions with error handling
      try {
        resizeCanvas();
      } catch (err) {
        console.warn("Error during canvas resize:", err);
      }
      
      // Create initial points - reduced for better performance
      // Only create 40 points instead of 50 for even better performance
      points = createPoints(40);
      
      // Set initial mouse position to center
      mousePosition = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      };
      
      // Add event listeners with error handling
      try {
        document.addEventListener("mousemove", handleMouseMove, { passive: true });
        document.addEventListener("touchmove", handleTouchMove, { passive: true });
        window.addEventListener("resize", resizeCanvas);
      } catch (err) {
        console.warn("Error attaching event listeners:", err);
      }
      
      // Start animation
      try {
        updatePoints();
      } catch (err) {
        console.warn("Error starting animation:", err);
      }
      
      console.log("Canvas initialized with optimized network effect");
      
      // Return cleanup function with comprehensive error handling
      return function cleanup() {
        try {
          if (typeof animationFrame === 'number') {
            cancelAnimationFrame(animationFrame);
          }
          
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("touchmove", handleTouchMove);
          window.removeEventListener("resize", resizeCanvas);
        } catch (err) {
          console.warn("Error during canvas cleanup:", err);
        }
      };
    } catch (err) {
      console.warn("Error initializing canvas context:", err);
      return () => {};
    }
  } catch (err) {
    console.warn("Error in canvas initialization:", err);
    return () => {};
  }
};