export type JourneyStage = {
  id: number;
  title: string;
  subtitle: string;
  anchorX: number;
  anchorY: number;
  cardOffsetX: number;
  cardOffsetY: number;
  objectOffsetX: number;
  objectOffsetY: number;
  objectSrc: string;
};

export const JOURNEY_STAGE_DATA: JourneyStage[] = [
  { id: 1, title: "از کوهستان", subtitle: "آغاز راهی پاک", anchorX: 56.5, anchorY: 83, cardOffsetX: -11.5, cardOffsetY: -1.5, objectOffsetX: 7, objectOffsetY: -2.5, objectSrc: "/brand/our-way-01-climb.png" },
  { id: 2, title: "کنار مرتع", subtitle: "دام سالم، زمین سبز", anchorX: 79, anchorY: 56, cardOffsetX: -10.5, cardOffsetY: -.5, objectOffsetX: 7, objectOffsetY: -1, objectSrc: "/brand/our-way-02-nature.png" },
  { id: 3, title: "با دقت", subtitle: "انتخاب درست، دست هنرمند", anchorX: 33, anchorY: 39.5, cardOffsetX: -10, cardOffsetY: -.8, objectOffsetX: 7, objectOffsetY: -.5, objectSrc: "/brand/our-way-03-quality.png" },
  { id: 4, title: "سفره خانه", subtitle: "گرم، ساده، دورهم", anchorX: 51.5, anchorY: 21.5, cardOffsetX: -10.5, cardOffsetY: 0, objectOffsetX: 8.5, objectOffsetY: -.5, objectSrc: "/brand/our-way-04-balance.png" },
  { id: 5, title: "یک قدم بعد", subtitle: "راه سبز ادامه دارد", anchorX: 45.5, anchorY: 9.8, cardOffsetX: 3.5, cardOffsetY: -.2, objectOffsetX: -8.5, objectOffsetY: -.2, objectSrc: "/brand/our-way-05-ahead.png" },
];
