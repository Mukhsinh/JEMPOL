export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'good' | 'bad' | 'bonus';
  color: string;
}

export interface GameState {
  score: number;
  lives: number;
  level: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
}

export class InnovationCatcherGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private basket: { x: number; y: number; width: number; height: number };
  private items: GameObject[] = [];
  private state: GameState;
  private animationId: number | null = null;
  private lastSpawnTime: number = 0;
  private spawnInterval: number = 1000;
  private startTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    try {
      this.canvas = canvas;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get 2D context from canvas');
      }
      this.ctx = context;

      // Initialize basket with default values first
      this.basket = {
        x: 0,
        y: 0,
        width: 80,
        height: 60,
      };

      // Initialize state
      this.state = {
        score: 0,
        lives: 3,
        level: 1,
        isPlaying: false,
        isPaused: false,
        gameOver: false,
      };

      // Set canvas size and update basket position
      this.resizeCanvas();
      
      // Add resize listener with debounce
      let resizeTimeout: number;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => this.resizeCanvas(), 100);
      });

      // Setup controls
      this.setupControls();
      
      console.log('Game initialized successfully:', {
        canvasWidth: this.canvas.width,
        canvasHeight: this.canvas.height,
        basketPosition: this.basket
      });
    } catch (error) {
      console.error('Error initializing game:', error);
      throw error;
    }
  }

  private resizeCanvas() {
    const container = this.canvas.parentElement;
    let width: number;
    let height: number;
    
    if (!container) {
      // Fallback dimensions
      width = Math.min(window.innerWidth - 32, 800);
      height = Math.min(window.innerHeight * 0.6, 600);
    } else {
      width = Math.min(container.clientWidth - 32, 800);
      height = Math.min(window.innerHeight * 0.6, 600);
    }
    
    // Ensure minimum canvas size for mobile
    width = Math.max(width, 300);
    height = Math.max(height, 400);
    
    // For mobile devices, use more screen space
    if (window.innerWidth < 768) {
      width = Math.min(window.innerWidth - 32, 600);
      height = Math.min(window.innerHeight * 0.65, 500);
    }
    
    // Only resize if dimensions changed significantly
    if (Math.abs(this.canvas.width - width) > 10 || Math.abs(this.canvas.height - height) > 10) {
      this.canvas.width = width;
      this.canvas.height = height;
      console.log('Canvas resized:', { width, height });
    }
    
    // Always update basket position after resize
    this.basket.y = this.canvas.height - 80;
    this.basket.x = Math.max(0, Math.min(this.basket.x, this.canvas.width - this.basket.width));
  }

  private setupControls() {
    // Mouse control
    const handleMouseMove = (e: MouseEvent) => {
      if (!this.state.isPaused && this.state.isPlaying) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const x = (e.clientX - rect.left) * scaleX;
        this.basket.x = Math.max(0, Math.min(x - this.basket.width / 2, this.canvas.width - this.basket.width));
      }
    };

    this.canvas.addEventListener('mousemove', handleMouseMove);

    // Touch start - initialize position
    const handleTouchStart = (e: TouchEvent) => {
      if (!this.state.isPaused && this.state.isPlaying) {
        e.preventDefault();
        e.stopPropagation();
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * scaleX;
        this.basket.x = Math.max(0, Math.min(x - this.basket.width / 2, this.canvas.width - this.basket.width));
        console.log('Touch start:', { x, basketX: this.basket.x, canvasWidth: this.canvas.width });
      }
    };

    this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });

    // Touch move control
    const handleTouchMove = (e: TouchEvent) => {
      if (!this.state.isPaused && this.state.isPlaying) {
        e.preventDefault();
        e.stopPropagation();
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * scaleX;
        this.basket.x = Math.max(0, Math.min(x - this.basket.width / 2, this.canvas.width - this.basket.width));
      }
    };

    this.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Prevent default touch behavior on canvas
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    this.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Prevent context menu on long press
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Click to unpause
    this.canvas.addEventListener('click', () => {
      if (this.state.isPaused && this.state.isPlaying) {
        this.pause();
      }
    });
  }

  public start() {
    try {
      this.state.isPlaying = true;
      this.state.gameOver = false;
      this.state.isPaused = false;
      this.state.score = 0;
      this.state.lives = 3;
      this.state.level = 1;
      this.items = [];
      this.startTime = Date.now();
      this.lastSpawnTime = Date.now();
      this.spawnInterval = 1000;
      console.log('Game started successfully');
      this.gameLoop();
    } catch (error) {
      console.error('Error starting game:', error);
      this.state.isPlaying = false;
      this.state.gameOver = true;
    }
  }

  public pause() {
    this.state.isPaused = !this.state.isPaused;
  }

  public stop() {
    try {
      this.state.isPlaying = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      console.log('Game stopped');
    } catch (error) {
      console.error('Error stopping game:', error);
    }
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public getDuration(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  private spawnItem() {
    const now = Date.now();
    if (now - this.lastSpawnTime < this.spawnInterval) return;

    this.lastSpawnTime = now;

    const random = Math.random();
    let type: 'good' | 'bad' | 'bonus';
    let color: string;

    if (random < 0.1) {
      type = 'bonus';
      color = '#FFD700'; // Gold
    } else if (random < 0.3) {
      type = 'bad';
      color = '#EF4444'; // Red
    } else {
      type = 'good';
      color = '#10B981'; // Green
    }

    const item: GameObject = {
      x: Math.random() * (this.canvas.width - 30),
      y: -30,
      width: 30,
      height: 30,
      speed: 2 + this.state.level * 0.5,
      type,
      color,
    };

    this.items.push(item);
  }

  private updateItems() {
    this.items = this.items.filter((item) => {
      item.y += item.speed;

      // Check collision with basket
      if (
        item.y + item.height >= this.basket.y &&
        item.y <= this.basket.y + this.basket.height &&
        item.x + item.width >= this.basket.x &&
        item.x <= this.basket.x + this.basket.width
      ) {
        // Caught item
        if (item.type === 'good') {
          this.state.score += 10;
        } else if (item.type === 'bonus') {
          this.state.score += 50;
        } else if (item.type === 'bad') {
          this.state.score = Math.max(0, this.state.score - 5);
          this.state.lives--;
        }

        // Level up every 100 points
        const newLevel = Math.floor(this.state.score / 100) + 1;
        if (newLevel > this.state.level) {
          this.state.level = newLevel;
          this.spawnInterval = Math.max(400, 1000 - this.state.level * 50);
        }

        return false; // Remove item
      }

      // Remove if off screen
      if (item.y > this.canvas.height) {
        if (item.type === 'good') {
          this.state.lives--;
        }
        return false;
      }

      return true;
    });

    // Check game over
    if (this.state.lives <= 0) {
      this.state.gameOver = true;
      this.state.isPlaying = false;
    }
  }

  private draw() {
    // Clear canvas with futuristic gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0F172A'); // Dark blue
    gradient.addColorStop(0.5, '#1E293B'); // Slate
    gradient.addColorStop(1, '#0C4A6E'); // Deep blue
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw futuristic grid pattern
    this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // Draw animated particles/stars
    const time = Date.now() * 0.001;
    this.ctx.fillStyle = 'rgba(147, 197, 253, 0.6)';
    for (let i = 0; i < 20; i++) {
      const x = (i * 50 + time * 20) % this.canvas.width;
      const y = (i * 30) % this.canvas.height;
      const size = Math.sin(time + i) * 1 + 1.5;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw futuristic basket with neon glow effect
    const basketGradient = this.ctx.createLinearGradient(
      this.basket.x, 
      this.basket.y, 
      this.basket.x, 
      this.basket.y + this.basket.height
    );
    basketGradient.addColorStop(0, '#3B82F6');
    basketGradient.addColorStop(0.5, '#8B5CF6');
    basketGradient.addColorStop(1, '#6366F1');
    
    // Glow effect
    this.ctx.shadowColor = '#3B82F6';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // Basket body - futuristic trapezoid
    this.ctx.fillStyle = basketGradient;
    this.ctx.beginPath();
    this.ctx.moveTo(this.basket.x + 15, this.basket.y);
    this.ctx.lineTo(this.basket.x + this.basket.width - 15, this.basket.y);
    this.ctx.lineTo(this.basket.x + this.basket.width - 5, this.basket.y + this.basket.height);
    this.ctx.lineTo(this.basket.x + 5, this.basket.y + this.basket.height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Neon border
    this.ctx.strokeStyle = '#60A5FA';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
    
    // Tech lines on basket
    this.ctx.strokeStyle = 'rgba(147, 197, 253, 0.5)';
    this.ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = this.basket.y + (this.basket.height / 4) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(this.basket.x + 10, y);
      this.ctx.lineTo(this.basket.x + this.basket.width - 10, y);
      this.ctx.stroke();
    }

    // Draw items with futuristic neon graphics
    this.items.forEach((item) => {
      const centerX = item.x + item.width / 2;
      const centerY = item.y + item.height / 2;
      const radius = item.width / 2;

      // Neon glow effect
      let glowColor = '';
      if (item.type === 'good') {
        glowColor = '#10B981';
      } else if (item.type === 'bonus') {
        glowColor = '#F59E0B';
      } else {
        glowColor = '#EF4444';
      }

      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 15;

      // Item gradient with neon colors
      const itemGradient = this.ctx.createRadialGradient(
        centerX - radius / 3,
        centerY - radius / 3,
        0,
        centerX,
        centerY,
        radius
      );
      
      if (item.type === 'good') {
        itemGradient.addColorStop(0, '#6EE7B7');
        itemGradient.addColorStop(0.5, '#10B981');
        itemGradient.addColorStop(1, '#059669');
      } else if (item.type === 'bonus') {
        itemGradient.addColorStop(0, '#FCD34D');
        itemGradient.addColorStop(0.5, '#F59E0B');
        itemGradient.addColorStop(1, '#D97706');
      } else {
        itemGradient.addColorStop(0, '#FCA5A5');
        itemGradient.addColorStop(0.5, '#EF4444');
        itemGradient.addColorStop(1, '#DC2626');
      }

      // Draw hexagon shape for futuristic look
      this.ctx.fillStyle = itemGradient;
      this.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.fill();

      // Neon border
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Reset shadow
      this.ctx.shadowBlur = 0;

      // Item icon/symbol with glow
      this.ctx.shadowColor = '#FFFFFF';
      this.ctx.shadowBlur = 5;
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 18px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      if (item.type === 'good') {
        this.ctx.fillText('✓', centerX, centerY);
      } else if (item.type === 'bonus') {
        this.ctx.fillText('★', centerX, centerY);
      } else {
        this.ctx.fillText('✗', centerX, centerY);
      }
      this.ctx.shadowBlur = 0;
    });

    // Draw futuristic HUD with neon styling
    const hudBg = this.ctx.createLinearGradient(0, 0, 220, 0);
    hudBg.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
    hudBg.addColorStop(1, 'rgba(30, 41, 59, 0.8)');
    this.ctx.fillStyle = hudBg;
    this.ctx.fillRect(5, 5, 220, 110);
    
    // Neon border
    this.ctx.strokeStyle = '#3B82F6';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = '#3B82F6';
    this.ctx.shadowBlur = 10;
    this.ctx.strokeRect(5, 5, 220, 110);
    this.ctx.shadowBlur = 0;

    // HUD text with neon glow
    this.ctx.font = 'bold 18px "Courier New", monospace';
    this.ctx.textAlign = 'left';
    
    // Score
    this.ctx.fillStyle = '#60A5FA';
    this.ctx.shadowColor = '#60A5FA';
    this.ctx.shadowBlur = 5;
    this.ctx.fillText(`SCORE`, 15, 30);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`${this.state.score}`, 120, 30);
    
    // Lives
    this.ctx.fillStyle = '#F87171';
    this.ctx.shadowColor = '#F87171';
    this.ctx.fillText(`LIVES`, 15, 55);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`${'❤️'.repeat(this.state.lives)}`, 120, 55);
    
    // Level
    this.ctx.fillStyle = '#FCD34D';
    this.ctx.shadowColor = '#FCD34D';
    this.ctx.fillText(`LEVEL`, 15, 80);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`${this.state.level}`, 120, 80);
    
    this.ctx.shadowBlur = 0;

    // Draw futuristic pause overlay
    if (this.state.isPaused) {
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Neon text effect
      this.ctx.shadowColor = '#3B82F6';
      this.ctx.shadowBlur = 20;
      this.ctx.fillStyle = '#60A5FA';
      this.ctx.font = 'bold 48px "Courier New", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('⏸️ PAUSED', this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.shadowBlur = 10;
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '20px "Courier New", monospace';
      this.ctx.fillText('Klik untuk melanjutkan', this.canvas.width / 2, this.canvas.height / 2 + 50);
      this.ctx.textAlign = 'left';
      this.ctx.shadowBlur = 0;
    }
  }

  private gameLoop = () => {
    if (!this.state.isPlaying) return;

    if (!this.state.isPaused) {
      this.spawnItem();
      this.updateItems();
    }

    this.draw();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };
}
