export const MOUNTAIN_STAGES = [
  {
    id: 1,
    title: "از کوهستان",
    subtitle: "آغاز راهی پاک",
    description: "سفر مرد کوهستان از دامنه‌های میشو آغاز می‌شود.",
    character: { x: 48.5, y: 78, scale: .94 },
    card: { x: 20, y: 72 },
    camera: { x: 0, y: 0, zoom: 1.018, originX: 49, originY: 74 },
  },
  {
    id: 2,
    title: "کنار مرتع",
    subtitle: "دام سالم، زمین سبز",
    description: "در دامنه میشو، سلامت مرتع آغاز کیفیتی است که به سفره می‌رسد.",
    character: { x: 58, y: 65, scale: .84 },
    card: { x: 68, y: 50 },
    camera: { x: -120, y: -80, zoom: 1.15, originX: 58, originY: 65 },
    floating: { src: "/brand/stage-02.png", x: 58, y: 63 },
  },
] as const;
