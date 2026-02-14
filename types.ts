
export type ObjectType = 'bed' | 'path' | 'tree' | 'deck' | 'pond' | 'kklTable' | 'fence';

export interface GardenObject {
  id: string;
  type: ObjectType;
  x: number; // in meters
  y: number; // in meters
  width: number; // in meters
  height: number; // in meters
  color: string;
  label: string;
}

export interface GardenDimensions {
  northWall: number;
  eastWall: number;
  southWall: number;
  westWall: number;
  recessWidth: number; // parallel to north
  recessHeight: number; // parallel to east
}

export interface Point {
  x: number;
  y: number;
}
