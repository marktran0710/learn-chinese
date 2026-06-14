export interface B1Lesson {
  id: string;
  unit: number;
  lesson: number;
  topic: string;
  startPage: number; // book page number (not 0-indexed)
  pages: number;     // how many pages in this lesson
  audioFile: string | null; // e.g. "01-1" → /audio/b1/01-1.mp3
}

export interface B1Unit {
  unit: number;
  title: string;
  lessons: B1Lesson[];
}

export const B1_UNITS: B1Unit[] = [
  {
    unit: 1,
    title: "個人資料",
    lessons: [
      { id: "1-1", unit: 1, lesson: 1, topic: "姓名、國籍、出生、年齡、性別、婚姻", startPage: 10, pages: 6, audioFile: "01-1" },
      { id: "1-2", unit: 1, lesson: 2, topic: "職業、宗教、信仰、家人、喜惡、外貌", startPage: 16, pages: 6, audioFile: "01-2" },
      { id: "1-3", unit: 1, lesson: 3, topic: "居住型態、房間設備、費用", startPage: 22, pages: 6, audioFile: "01-3" },
    ],
  },
  {
    unit: 2,
    title: "房屋與家庭、環境",
    lessons: [
      { id: "2-1", unit: 2, lesson: 1, topic: "地理環境", startPage: 28, pages: 6, audioFile: "02-1" },
      { id: "2-2", unit: 2, lesson: 2, topic: "氣候與出產", startPage: 34, pages: 6, audioFile: "02-2" },
      { id: "2-3", unit: 2, lesson: 3, topic: "自然變遷、環保", startPage: 40, pages: 6, audioFile: "02-3" },
    ],
  },
  {
    unit: 3,
    title: "日常生活",
    lessons: [
      { id: "3-1", unit: 3, lesson: 1, topic: "家居生活", startPage: 46, pages: 6, audioFile: "03-1" },
      { id: "3-2", unit: 3, lesson: 2, topic: "工作場所、收入", startPage: 52, pages: 6, audioFile: null },
      { id: "3-3", unit: 3, lesson: 3, topic: "學校生活", startPage: 58, pages: 6, audioFile: null },
      { id: "3-4", unit: 3, lesson: 4, topic: "未來規畫、公共服務", startPage: 64, pages: 6, audioFile: null },
    ],
  },
  {
    unit: 4,
    title: "休閒娛樂",
    lessons: [
      { id: "4-1", unit: 4, lesson: 1, topic: "空閒時光、嗜好及興趣、運動", startPage: 70, pages: 6, audioFile: null },
      { id: "4-2", unit: 4, lesson: 2, topic: "藝文活動、娛樂媒體", startPage: 76, pages: 8, audioFile: null },
      { id: "4-3", unit: 4, lesson: 3, topic: "智識及藝術追求", startPage: 84, pages: 6, audioFile: null },
    ],
  },
  {
    unit: 5,
    title: "飲食",
    lessons: [
      { id: "5-1", unit: 5, lesson: 1, topic: "飲食種類、型態、作法", startPage: 90, pages: 6, audioFile: "05-1" },
      { id: "5-2", unit: 5, lesson: 2, topic: "外食、餐廳服務", startPage: 96, pages: 6, audioFile: "05-2" },
    ],
  },
  {
    unit: 6,
    title: "與他人關係",
    lessons: [
      { id: "6-1", unit: 6, lesson: 1, topic: "人際關係、邀約、信件往來", startPage: 102, pages: 8, audioFile: "06-1" },
      { id: "6-2", unit: 6, lesson: 2, topic: "組織成員", startPage: 110, pages: 6, audioFile: "06-2" },
      { id: "6-3", unit: 6, lesson: 3, topic: "社會文化", startPage: 116, pages: 6, audioFile: "06-3" },
    ],
  },
  {
    unit: 7,
    title: "健康及身體照顧",
    lessons: [
      { id: "7-1", unit: 7, lesson: 1, topic: "身體部位、身體狀況", startPage: 122, pages: 6, audioFile: "07-1" },
      { id: "7-2", unit: 7, lesson: 2, topic: "衛生、個人習慣", startPage: 128, pages: 6, audioFile: "07-2" },
      { id: "7-3", unit: 7, lesson: 3, topic: "疾病與意外、醫藥服務、保險", startPage: 134, pages: 6, audioFile: "07-3" },
    ],
  },
  {
    unit: 8,
    title: "旅行",
    lessons: [
      { id: "8-1", unit: 8, lesson: 1, topic: "國內旅行", startPage: 140, pages: 8, audioFile: "08-1" },
      { id: "8-2", unit: 8, lesson: 2, topic: "離島旅行", startPage: 148, pages: 6, audioFile: "08-2" },
      { id: "8-3", unit: 8, lesson: 3, topic: "國際旅行", startPage: 154, pages: 6, audioFile: "08-3" },
    ],
  },
  {
    unit: 9,
    title: "購物",
    lessons: [
      { id: "9-1", unit: 9, lesson: 1, topic: "網路購物", startPage: 160, pages: 6, audioFile: "09-1" },
      { id: "9-2", unit: 9, lesson: 2, topic: "夜市購物", startPage: 166, pages: 6, audioFile: "09-2" },
      { id: "9-3", unit: 9, lesson: 3, topic: "百貨公司購物", startPage: 172, pages: 6, audioFile: "09-3" },
    ],
  },
  {
    unit: 10,
    title: "教育",
    lessons: [
      { id: "10-1", unit: 10, lesson: 1, topic: "選系", startPage: 178, pages: 6, audioFile: "10-1" },
      { id: "10-2", unit: 10, lesson: 2, topic: "教育制度和系統", startPage: 184, pages: 6, audioFile: "10-2" },
      { id: "10-3", unit: 10, lesson: 3, topic: "語言、電腦、溝通等能力", startPage: 190, pages: 6, audioFile: "10-3" },
    ],
  },
];

export function getAllLessons(): B1Lesson[] {
  return B1_UNITS.flatMap((u) => u.lessons);
}
