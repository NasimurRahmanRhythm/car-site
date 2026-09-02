import type { Database } from "./database";

export type TourScene = Database["public"]["Tables"]["tour_scenes"]["Row"];
export type TourHotspot = Database["public"]["Tables"]["tour_hotspots"]["Row"];

export interface TourSceneWithHotspots extends TourScene {
  hotspots: TourHotspot[];
}
