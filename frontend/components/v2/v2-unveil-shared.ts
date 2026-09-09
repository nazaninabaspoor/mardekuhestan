export const UNVEIL_SLOT_X = [-3.12, -1.56, 0, 1.56, 3.12] as const;

export type UnveilManState = {
  x: number;
  facing: number;
  walking: boolean;
  stride: number;
  slot: number;
  hold: number;
  dir: 1 | -1;
  profile: number;
  accel: number;
  windup: number;
};
