export interface Point2D {
  x: number;
  y: number;
}

export interface WallSegment {
  id: string;
  storyIndex: number;
  start: Point2D;
  end: Point2D;
  thickness: number;
  height: number;
  materialType: 'clt' | 'timber-frame';
  openings: Opening[];
}

export interface Opening {
  id: string;
  wallId: string;
  type: 'door' | 'window';
  offsetFromStart: number;
  width: number;
  height: number;
  sillHeight: number;
}

export interface Story {
  index: number;
  height: number;
  label: string;
  floorThickness: number;
  walls: string[];
}

export interface RoofConfig {
  type: 'flat' | 'mono-pitch' | 'gable';
  pitch: number;
  overhang: number;
}

export interface BuildingGeometry {
  stories: Story[];
  roof: RoofConfig;
  walls: WallSegment[];
  footprintArea: number;
  totalHeight: number;
  grossFloorArea: number;
}
