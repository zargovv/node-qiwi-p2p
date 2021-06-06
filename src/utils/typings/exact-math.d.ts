declare module 'exact-math' {
  export function add(...args: (string | number)[]): string | number;
  export function sub(...args: (string | number)[]): string | number;
  export function mul(...args: (string | number)[]): string | number;
  export function div(...args: (string | number)[]): string | number;
  export function formula(f: string): string | number;
  export function round(
    n: string | number,
    r: number | string
  ): string | number;
  export function ceil(n: string | number, r: number | string): string | number;
  export function floor(
    n: string | number,
    r: number | string
  ): string | number;
  export function pow(n: string | number, p: number | string): string | number;
}
