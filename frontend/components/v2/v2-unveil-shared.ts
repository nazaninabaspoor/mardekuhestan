export const UNVEIL_SLOT_X = [-3.12, -1.56, 0, 1.56, 3.12] as const;
export const UNVEIL_CAM_Z = 6.7;
export const UNVEIL_MAN_Z = -0.88;
export const UNVEIL_PEDESTAL_Z = 0.92;

/** World X so a man farther from the camera lines up with a pedestal in screen space. */
export function manSlotX(slot: number) {
  const pedX = UNVEIL_SLOT_X[slot];
  return pedX * (UNVEIL_CAM_Z - UNVEIL_MAN_Z) / (UNVEIL_CAM_Z - UNVEIL_PEDESTAL_Z);
}

export const UNVEIL_FUTURE_PRODUCTS = [
  {
    id: "eggs",
    name: "تخم‌مرغ مرتع",
    src: "/brand/v2/unveil-product-eggs.png",
    invite: "از مرتع می‌آید…",
  },
  {
    id: "ghee",
    name: "عسل گون کوهستان",
    src: "/brand/v2/unveil-product-ghee.png",
    invite: "عسل گون هنوز توی کوه است…",
  },
  {
    id: "spring",
    name: "آب چشمهٔ کوهستان",
    src: "/brand/v2/unveil-product-spring.png",
    invite: "آب چشمه در راه است…",
  },
  {
    id: "rosejam",
    name: "مربای گل محمدی",
    src: "/brand/v2/unveil-product-rosejam.png",
    invite: "برای صبحانهٔ خانه…",
  },
  {
    id: "thyme",
    name: "دمنوش آویشن کوهی",
    src: "/brand/v2/unveil-product-thyme.png",
    invite: "آویشن کوهی، با حوصله…",
  },
] as const;

export type UnveilManState = {
  x: number;
  originX: number;
  facing: number;
  walking: boolean;
  stride: number;
  slot: number;
  hold: number;
  dir: 1 | -1;
  profile: number;
  accel: number;
  windup: number;
  gait: 0 | 1;
  foot: 0 | 1;
};
