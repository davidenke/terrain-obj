declare module 'node-hgt' {
  export type Coords = [number, number];
  export type Bounds = [Coords, Coords];

  export class Hgt {
    constructor(source: string, coords: Coords);
    getElevation(coords: Coords): number;
  }
}
