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
  private isMobile: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.isMobile = window.innerWidth < 768;

    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Initialize basket
    this.basket = {
      x: this.canvas.width / 2 - 40,
      y: this.canvas.height - 80,
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

    // Setup controls
    this.setupControls();
  }

  private resizeCanvas() {
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = Math.min(container.clientWidth, 800);
      this.canvas.height = Math.min(window.innerHeight * 0.7, 600);
    }
  }

  private setupControls() {
    // Mouse control
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      this.basket.x = Math.max(0, Math.min(x - this.basket.width / 2, this.canvas.width - this.basket.width));
    });

    // Touch control
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      this.basket.x = Math.max(0, Math.min(x - this.basket.width / 2, this.canvas.width - this.basket.width));
    });
  }

  public start() {
    this.state.isPlaying = true;
    this.state.gameOver = false;
    this.startTime = Date.now();
    this.gameLoop();
  }

  public pause() {
    this.state.isPaused = !this.state.isPaused;
  }

  public stop() {
    this.state.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
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
    // Clear canvas
    this.ctx.fillStyle = '#F9FAFB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw basket
    this.ctx.fillStyle = '#3B82F6';
    this.ctx.fillRect(this.basket.x, this.basket.y, this.basket.width, this.basket.height);
    this.ctx.strokeStyle = '#1E40AF';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(this.basket.x, this.basket.y, this.basket.width, this.basket.height);

    // Draw items
    this.items.forEach((item) => {
      this.ctx.fillStyle = item.color;
      this.ctx.beginPath();
      this.ctx.arc(item.x + item.width / 2, item.y + item.height / 2, item.width / 2, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw HUD
    this.ctx.fillStyle = '#1F2937';
    this.ctx.font = 'bold 20px sans-serif';
    this.ctx.fillText(`Score: ${this.state.score}`, 10, 30);
    this.ctx.fillText(`Lives: ${this.state.lives}`, 10, 60);
    this.ctx.fillText(`Level: ${this.state.level}`, 10, 90);

    // Draw pause overlay
    if (this.state.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 40px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.textAlign = 'left';
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
