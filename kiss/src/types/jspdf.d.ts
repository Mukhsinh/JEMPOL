declare module 'jspdf' {
  export default class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string | number[]);
    
    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
    };
    
    setFillColor(r: number, g: number, b: number): void;
    setDrawColor(r: number, g: number, b: number): void;
    setTextColor(r: number, g: number, b: number): void;
    setFontSize(size: number): void;
    setFont(font: string, style: string): void;
    
    rect(x: number, y: number, w: number, h: number, style?: string): void;
    roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style?: string): void;
    circle(x: number, y: number, r: number, style?: string): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    
    text(text: string | string[], x: number, y: number, options?: any): void;
    splitTextToSize(text: string, maxWidth: number): string[];
    
    addPage(): void;
    save(filename: string): void;
  }
}

declare module 'html2canvas' {
  export default function html2canvas(element: HTMLElement, options?: any): Promise<HTMLCanvasElement>;
}
