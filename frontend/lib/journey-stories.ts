export const JOURNEY_STORIES = [
  {
    id: 1,
    title: "آغاز از کوهستان",
    text: "هر مسیر بزرگ از یک قدم کوچک شروع می‌شود؛ جایی میان خاک، باد و طبیعت.",
    moment: "از دل کوهستان",
    image: "/brand/our-way-01-climb.png",
  },
  {
    id: 2,
    title: "همراه طبیعت",
    text: "رابطه ما با زمین، پایه کیفیتی است که به سفره شما می‌رسد.",
    moment: "همراه طبیعت",
    image: "/brand/our-way-02-nature.png",
  },
  {
    id: 3,
    title: "با دقت و وسواس",
    text: "هر انتخاب و هر جزئیات با دقت انجام می‌شود تا کیفیت اتفاقی نباشد.",
    moment: "با دقت ساخته می‌شود",
    image: "/brand/our-way-03-quality.png",
  },
  {
    id: 4,
    title: "برای کنار هم بودن",
    text: "تمام این مسیر برای لحظه‌هایی است که خانواده کنار یک سفره جمع می‌شوند.",
    moment: "برای سفره خانواده",
    image: "/brand/our-way-04-balance.png",
  },
  {
    id: 5,
    title: "راه ادامه دارد",
    text: "مرد کوهستان همیشه یک قدم جلوتر، مسیر سبز را ادامه می‌دهد.",
    moment: "یک قدم سبزتر",
    image: "/brand/our-way-05-ahead.png",
  },
] as const;

export type JourneyStory = (typeof JOURNEY_STORIES)[number];
