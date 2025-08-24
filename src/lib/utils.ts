export function parseUSD(maybe?: string): number | null {
    if (!maybe) return null;
    const n = Number(String(maybe).replace(/[^\d.]/g, ""));
    return Number.isNaN(n) ? null : n;
  }
  
  export function normalize(v: number, min: number, max: number): number {
    if (max === min) return 0.5;
    return (v - min) / (max - min);
  }
  
  export function unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  }
  
  export function roleRelevance(role: string): number {
    const r = role.toLowerCase();
    if (r.includes("frontend")) return 1.0;
    if (r.includes("software")) return 0.8;
    if (r.includes("full stack")) return 0.7;
    if (r.includes("developer")) return 0.6;
    if (r.includes("engineer")) return 0.6;
    if (r.includes("product")) return 0.3;
    return 0;
  }