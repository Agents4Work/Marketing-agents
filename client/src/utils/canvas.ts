
// Canvas animation for background effect
export const renderCanvas = () => {
  try {
    const canvas = document.querySelector('canvas');
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) {
      console.error('Canvas element or context not available');
      return () => {};
    }
    
    // Set canvas size to match window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Define particles - increased for better visual density
    const particlesArray: Particle[] = [];
    const particleCount = 75; // Fixed number for consistent density
    
    // Track mouse position for dynamic connections
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Listen for mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    for (let i = 0; i < particleCount; i++) {
      particlesArray.push(new Particle(canvas));
    }
    
    console.log("Canvas initialized with simplified network effect");
    
    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw(ctx);
      }
      
      // Draw connections between particles
      connectParticles(ctx, particlesArray);
      
      // Draw additional dynamic connections
      // This ensures the background doesn't appear semi-white during inactivity
      for (let i = 0; i < particlesArray.length; i++) {
        if (i % 3 === 0) { // Only do this for every third particle to avoid too many lines
          const particle = particlesArray[i];
          const artificialTargetX = (mouseX + particle.x) / 2 + Math.cos(Date.now() * 0.001 + i) * 50;
          const artificialTargetY = (mouseY + particle.y) / 2 + Math.sin(Date.now() * 0.001 + i) * 50;
          
          ctx.beginPath();
          ctx.strokeStyle = `rgba(150, 150, 255, 0.3)`;
          ctx.lineWidth = 1;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(artificialTargetX, artificialTargetY);
          ctx.stroke();
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  } catch (error) {
    console.error("Error setting up canvas:", error);
    return () => {};
  }
};

// Helper function to connect particles with lines
function connectParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  const maxDistance = 150;
  
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < maxDistance) {
        // Calculate opacity based on distance
        const opacity = 1 - (distance / maxDistance);
        ctx.strokeStyle = `rgba(75, 85, 255, ${opacity * 0.2})`;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

// Particle class
class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  canvas: HTMLCanvasElement;
  color: string;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.color = `rgba(150, 150, 255, ${Math.random() * 0.5 + 0.2})`;
  }
  
  update() {
    // Update position
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Bounce off edges
    if (this.x > this.canvas.width || this.x < 0) {
      this.speedX = -this.speedX;
    }
    
    if (this.y > this.canvas.height || this.y < 0) {
      this.speedY = -this.speedY;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
