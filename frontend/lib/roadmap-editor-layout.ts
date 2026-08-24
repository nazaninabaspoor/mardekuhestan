export type EditorObject = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  visible: boolean;
};

export type EditorStep = {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  card: EditorObject & { width: number; height: number; radius: number; blur: number };
  imageObject: EditorObject;
};

export type MovementPoint = { x: number; y: number };

export type EditorStage = {
  id: number;
  position: MovementPoint;
  title: string;
  description: string;
  image: string;
  characterPosition: string;
  waypointIndex: number;
  progress: number;
};

export type BackgroundExtend = { left: number; right: number; top: number; bottom: number };

export type RoadmapEditorLayout = {
  version: 1;
  canvas: { width: number; height: number; locked: boolean };
  background: EditorObject & { src: string; brightness: number; blur: number; extend: BackgroundExtend; scaleX: number; scaleY: number };
  character: EditorObject & { src: string };
  trail: { points: number[]; width: number; dash: number; gap: number; color: string };
  movementPath: MovementPoint[];
  stages: EditorStage[];
  steps: EditorStep[];
};

const object = (x: number, y: number, scale = 1): EditorObject => ({ x, y, scale, rotation: 0, opacity: 1, visible: true });

export const DEFAULT_ROADMAP_LAYOUT: RoadmapEditorLayout = {
  version: 1,
  canvas: { width: 1024, height: 1536, locked: true },
  background: { ...object(521.7850587221023, 791.4345975843672), src: "/brand/misho-roadmap-outpaint-v2.png", brightness: 1, blur: 0, extend: { left: 0, right: 0, top: 0, bottom: 0 }, scaleX: 1, scaleY: 1 },
  character: { ...object(522.5936524190312, 1379.5, .17), rotation: 1, src: "/brand/mountain-man.png" },
  trail: {
    points: [555, 1536, 535, 1325, 525.0432241933989, 1327.2363853202105, 579.7694709685393, 1122.3189634126745, 596.1211080675557, 1021.8348438150716, 557.193148389887, 932.3507242174685, 306.3775314520364, 837.8856611027418, 537.4639798388343, 772.9555348732885, 701.0432241933989, 729.8856611027419, 607.2334508073735, 693.3697807003449, 365.0144080644662, 672.4333023099329, 321.07209021873194, 649.1742190753581, 380.8991934451361, 634.1932755582349, 455.68307247814164, 616.7155081215906],
    width: 6,
    dash: 3,
    gap: 17,
    color: "#07836b",
  },
  movementPath: [
    { x: 555, y: 1536 }, { x: 535, y: 1325 }, { x: 525.0432241933989, y: 1327.2363853202105 }, { x: 579.7694709685393, y: 1122.3189634126745 }, { x: 596.1211080675557, y: 1021.8348438150716 }, { x: 557.193148389887, y: 932.3507242174685 }, { x: 306.3775314520364, y: 837.8856611027418 }, { x: 537.4639798388343, y: 772.9555348732885 }, { x: 701.0432241933989, y: 729.8856611027419 }, { x: 607.2334508073735, y: 693.3697807003449 }, { x: 365.0144080644662, y: 672.4333023099329 }, { x: 321.07209021873194, y: 649.1742190753581 }, { x: 380.8991934451361, y: 634.1932755582349 }, { x: 455.68307247814164, y: 616.7155081215906 },
  ],
  stages: [
    { id: 1, position: { x: 535, y: 1325 }, title: "از کوهستان", description: "آغاز راهی پاک", image: "/brand/our-way-01-climb.png", characterPosition: "center", waypointIndex: 1, progress: .08 },
    { id: 2, position: { x: 596.1211080675557, y: 1021.8348438150716 }, title: "کنار مرتع", description: "دام سالم، زمین سبز", image: "/brand/our-way-02-nature.png", characterPosition: "center", waypointIndex: 4, progress: .28 },
    { id: 3, position: { x: 537.4639798388343, y: 772.9555348732885 }, title: "با دقت", description: "انتخاب درست، دست هنرمند", image: "/brand/our-way-03-quality.png", characterPosition: "center", waypointIndex: 7, progress: .48 },
    { id: 4, position: { x: 607.2334508073735, y: 693.3697807003449 }, title: "سفره‌خانه", description: "کیفیت به خانه می‌رسد", image: "/brand/our-way-04-balance.png", characterPosition: "center", waypointIndex: 9, progress: .68 },
    { id: 5, position: { x: 455.68307247814164, y: 616.7155081215906 }, title: "یک قدم بعد", description: "راه سبز ادامه دارد", image: "/brand/our-way-05-ahead.png", characterPosition: "center", waypointIndex: 13, progress: .9 },
  ],
  steps: [
    { id: 1, title: "از کوهستان", subtitle: "آغاز راهی پاک", image: "/brand/our-way-01-climb.png", card: { ...object(769.8792259019502, 1149.318895178354, .6215028599746898), width: 240, height: 112, radius: 28, blur: 16 }, imageObject: object(909.7406548396066, 1225.1206910582175, .18) },
    { id: 2, title: "کنار مرتع", subtitle: "دام سالم، زمین سبز", image: "/brand/our-way-02-nature.png", card: { ...object(377.32070241515993, 1000.8925394047101, .575947680616165), width: 240, height: 112, radius: 28, blur: 16 }, imageObject: object(212.42075564543526, 1050.031760804794, .2) },
    { id: 3, title: "با دقت", subtitle: "انتخاب درست، دست هنرمند", image: "/brand/our-way-03-quality.png", card: { ...object(826.4882982746974, 784.8052406012533, .5537043245268362), width: 240, height: 112, radius: 28, blur: 16 }, imageObject: object(700.3457935471914, 827.5031760804794, .09) },
    { id: 4, title: "سفره‌خانه", subtitle: "کیفیت به خانه می‌رسد", image: "/brand/our-way-04-balance.png", card: { ...object(319.84513931122666, 742.6143014587772, .5129754182310657), width: 240, height: 112, radius: 28, blur: 16 }, imageObject: { ...object(150.10085645126412, 759.7967308493191, .15), rotation: -1 } },
    { id: 5, title: "یک قدم بعد", subtitle: "راه سبز ادامه دارد", image: "/brand/our-way-05-ahead.png", card: { ...object(552.9875277697588, 582.9851057263315, .5183422915836963), width: 240, height: 112, radius: 28, blur: 16 }, imageObject: object(453.5589927382733, 569.7459135616489, .08) },
  ],
};

export function normalizeRoadmapLayout(input: Partial<RoadmapEditorLayout>): RoadmapEditorLayout {
  const trail = input.trail ?? DEFAULT_ROADMAP_LAYOUT.trail;
  const movementPath = input.movementPath?.length
    ? input.movementPath
    : Array.from({ length: trail.points.length / 2 }, (_, index) => ({ x: trail.points[index * 2], y: trail.points[index * 2 + 1] }));
  return {
    ...DEFAULT_ROADMAP_LAYOUT,
    ...input,
    canvas: { ...DEFAULT_ROADMAP_LAYOUT.canvas, ...input.canvas },
    background: {
      ...DEFAULT_ROADMAP_LAYOUT.background,
      ...input.background,
      extend: { ...DEFAULT_ROADMAP_LAYOUT.background.extend, ...input.background?.extend },
    },
    trail: { ...trail, points: movementPath.flatMap((point) => [point.x, point.y]) },
    movementPath,
    stages: input.stages?.length ? input.stages : DEFAULT_ROADMAP_LAYOUT.stages,
    steps: input.steps ?? DEFAULT_ROADMAP_LAYOUT.steps,
  };
}
