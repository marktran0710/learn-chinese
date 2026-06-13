// Reading comprehension passages — one or more per TOCFL level and per book unit
// Each passage has a short Traditional Chinese text followed by MCQ questions.

import type { HSKLevel } from "@/data/vocabulary";

export type ReadingQuestion = {
  question: string;
  options: string[];
  answer: number; // index into options[]
};

export type ReadingPassage = {
  id: string;
  title: string;
  text: string;         // Traditional Chinese paragraph(s)
  pinyin?: string;      // optional reading aid
  vocabulary?: { word: string; meaning: string }[];
  questions: ReadingQuestion[];
  level?: HSKLevel;     // for TOCFL mode
  unit?: number;        // for 時代華語 Book 1 mode
};

// ── TOCFL Level Passages ─────────────────────────────────────────────────────

export const TOCFL_PASSAGES: ReadingPassage[] = [
  {
    id: "tocfl-a1-1",
    level: "A1",
    title: "我的朋友",
    text:
      "我叫小明。我有一個好朋友，她叫美美。她是日本人，很可愛，也很漂亮。我們是同學。她知道我喜歡吃水果，她也喜歡吃水果。",
    vocabulary: [
      { word: "同學", meaning: "classmate" },
      { word: "可愛", meaning: "cute" },
      { word: "水果", meaning: "fruit" },
    ],
    questions: [
      {
        question: "小明的朋友叫什麼名字？",
        options: ["小美", "美美", "小明", "小日"],
        answer: 1,
      },
      {
        question: "美美是哪國人？",
        options: ["台灣人", "中國人", "美國人", "日本人"],
        answer: 3,
      },
      {
        question: "小明和美美都喜歡什麼？",
        options: ["看書", "吃水果", "喝咖啡", "打網球"],
        answer: 1,
      },
    ],
  },
  {
    id: "tocfl-a2-1",
    level: "A2",
    title: "我的一天",
    text:
      "我今天早上七點半起床，八點去學校上課。中午十二點下課，我回家吃飯。下午兩點我去圖書館看書。我媽媽說今天下午四點要去買禮物，我們要一起去。晚上我有空，可以聽音樂。",
    vocabulary: [
      { word: "起床", meaning: "wake up / get out of bed" },
      { word: "圖書館", meaning: "library" },
      { word: "禮物", meaning: "gift" },
    ],
    questions: [
      {
        question: "他幾點去學校？",
        options: ["七點半", "八點", "九點", "十二點"],
        answer: 1,
      },
      {
        question: "下午他去哪裡？",
        options: ["咖啡廳", "餐廳", "圖書館", "學校"],
        answer: 2,
      },
      {
        question: "他下午四點要做什麼？",
        options: ["聽音樂", "看書", "吃飯", "買禮物"],
        answer: 3,
      },
    ],
  },
  {
    id: "tocfl-b1-1",
    level: "B1",
    title: "週末計畫",
    text:
      "這個週末天氣很好，不太熱也不太冷。我打算先去海邊游泳，下午跟朋友打網球比賽。我朋友平常喜歡踢足球，不太會打網球，不過他說他很高興可以試試看。比賽以後，我們要去一家不錯的餐廳吃飯，那家餐廳的食物很好吃，飲料也很好喝。",
    vocabulary: [
      { word: "打算", meaning: "plan to" },
      { word: "試試看", meaning: "give it a try" },
      { word: "不過", meaning: "however" },
    ],
    questions: [
      {
        question: "這個週末的天氣怎麼樣？",
        options: ["很熱", "很冷", "不太熱也不太冷", "下雨"],
        answer: 2,
      },
      {
        question: "他朋友平常喜歡什麼運動？",
        options: ["游泳", "網球", "棒球", "足球"],
        answer: 3,
      },
      {
        question: "比賽以後他們要做什麼？",
        options: ["去海邊", "去圖書館", "去餐廳吃飯", "回家睡覺"],
        answer: 2,
      },
    ],
  },
  {
    id: "tocfl-b2-1",
    level: "B2",
    title: "找工作",
    text:
      "王宜文大學畢業以後，開始找工作。她希望可以在一家大公司上班，工作準時，薪水不錯。她用電腦和手機上網找工作，也許可以找到記者或銀行的工作。她媽媽說，工作重要，但是家人更重要，希望她以後能在台灣工作，不要去太遠的地方。",
    vocabulary: [
      { word: "薪水", meaning: "salary" },
      { word: "也許", meaning: "perhaps" },
      { word: "更", meaning: "even more" },
    ],
    questions: [
      {
        question: "王宜文畢業以後在做什麼？",
        options: ["在工廠工作", "在找工作", "在學校讀書", "在咖啡廳打工"],
        answer: 1,
      },
      {
        question: "她用什麼方式找工作？",
        options: ["打電話", "去餐廳問", "上網找", "問朋友"],
        answer: 2,
      },
      {
        question: "她媽媽希望她在哪裡工作？",
        options: ["美國", "日本", "英國", "台灣"],
        answer: 3,
      },
    ],
  },
  {
    id: "tocfl-c1-1",
    level: "C1",
    title: "城市生活的改變",
    text:
      "近年來，台灣許多年輕人選擇在城市生活，原因是城市提供更多工作機會和生活便利。捷運系統讓通勤變得方便，各種餐廳和咖啡廳讓生活更豐富。不過，城市生活也有壓力大、房價高的問題。有些人認為，找到工作與生活的平衡，才是現代人最重要的課題。",
    vocabulary: [
      { word: "通勤", meaning: "commute" },
      { word: "房價", meaning: "housing prices" },
      { word: "課題", meaning: "issue / challenge" },
    ],
    questions: [
      {
        question: "為什麼年輕人選擇在城市生活？",
        options: [
          "城市比較冷",
          "城市有更多工作機會和便利",
          "城市的學校比較好",
          "城市的食物比較便宜",
        ],
        answer: 1,
      },
      {
        question: "城市生活有什麼問題？",
        options: [
          "沒有捷運",
          "沒有餐廳",
          "壓力大、房價高",
          "工作機會太少",
        ],
        answer: 2,
      },
      {
        question: "文章認為現代人最重要的是什麼？",
        options: [
          "買大房子",
          "住在鄉下",
          "找到工作與生活的平衡",
          "學習新語言",
        ],
        answer: 2,
      },
    ],
  },
  {
    id: "tocfl-c2-1",
    level: "C2",
    title: "語言與文化認同",
    text:
      "語言不僅僅是溝通的工具，更是一個民族文化認同的核心。在台灣，傳統漢字書寫系統保留了豐富的歷史與文化意涵，每一個字都蘊含了幾千年的智慧。學習傳統中文不只是學習語言，更是理解一個民族如何透過文字來記錄生活、傳承文化。對於外籍學習者而言，掌握中文的語感與文化背景，往往比單純記憶詞彙更為重要。",
    vocabulary: [
      { word: "認同", meaning: "identity / recognition" },
      { word: "意涵", meaning: "implication / connotation" },
      { word: "傳承", meaning: "pass down / inherit" },
    ],
    questions: [
      {
        question: "根據文章，語言除了溝通工具以外，還是什麼？",
        options: [
          "一種娛樂方式",
          "文化認同的核心",
          "學習的負擔",
          "經濟發展的基礎",
        ],
        answer: 1,
      },
      {
        question: "文章提到傳統漢字保留了什麼？",
        options: [
          "現代科技",
          "西方文化",
          "幾千年的智慧",
          "英語語法",
        ],
        answer: 2,
      },
      {
        question: "對外籍學習者而言，什麼比記憶詞彙更重要？",
        options: [
          "學習日文",
          "掌握語感與文化背景",
          "記住所有漢字",
          "去中國旅遊",
        ],
        answer: 1,
      },
    ],
  },
];

// ── 時代華語 Book 1 Unit Passages ─────────────────────────────────────────────

export const BOOK_PASSAGES: ReadingPassage[] = [
  {
    id: "book-1",
    unit: 1,
    title: "新同學",
    text:
      "我叫林大明，是台灣人。我有一個新同學，她叫田中美子，是日本人。她很可愛，也很漂亮。我問她：「妳是哪國人？」她說：「我是日本人。妳知道嗎？」我說：「我知道，妳很可愛！」大家都很喜歡她。",
    questions: [
      {
        question: "林大明是哪國人？",
        options: ["日本人", "美國人", "台灣人", "英國人"],
        answer: 2,
      },
      {
        question: "田中美子是什麼樣的人？",
        options: ["很大", "很可愛，也很漂亮", "很高", "很不好"],
        answer: 1,
      },
      {
        question: "大家對田中美子的態度是什麼？",
        options: ["不喜歡她", "都很喜歡她", "不知道她", "怕她"],
        answer: 1,
      },
    ],
  },
  {
    id: "book-2",
    unit: 2,
    title: "每天上課",
    text:
      "我今天早上八點上課，中午十二點下課。我媽媽今天有空，她中午回家吃飯。我下午兩點去圖書館看書，沒有課。今天是星期三，五月十七號。我喜歡今天，因為下午沒有課，可以去圖書館。",
    questions: [
      {
        question: "他幾點上課？",
        options: ["七點", "七點半", "八點", "九點"],
        answer: 2,
      },
      {
        question: "今天下午他要做什麼？",
        options: ["上課", "吃飯", "去圖書館", "回家"],
        answer: 2,
      },
      {
        question: "今天是幾月幾號？",
        options: ["三月十七號", "四月十七號", "五月十七號", "六月十七號"],
        answer: 2,
      },
    ],
  },
  {
    id: "book-3",
    unit: 3,
    title: "買禮物",
    text:
      "明天是我媽媽的生日，我想送她禮物。我想買兩本中文書和一些花。我弟弟說他想買一個大蛋糕。我們一起去買，他買蛋糕，我買書和花。我媽媽很愛吃蛋糕，也喜歡看書，她一定很高興。",
    questions: [
      {
        question: "明天是誰的生日？",
        options: ["爸爸", "媽媽", "弟弟", "朋友"],
        answer: 1,
      },
      {
        question: "他想買什麼送媽媽？",
        options: ["蛋糕", "咖啡", "兩本書和花", "飲料"],
        answer: 2,
      },
      {
        question: "弟弟想買什麼？",
        options: ["書", "花", "大蛋糕", "飲料"],
        answer: 2,
      },
    ],
  },
  {
    id: "book-4",
    unit: 4,
    title: "在餐廳",
    text:
      "今天天氣好熱，我很渴，也有一點餓。我和朋友去一家餐廳吃飯。服務員問：「你們要喝什麼？咖啡還是茶？」我要茶，我朋友要咖啡。餐廳的食物很好吃，飲料也好喝，可是有一點太甜了。我朋友說：「這家餐廳不錯！」",
    questions: [
      {
        question: "他去餐廳的原因是什麼？",
        options: ["天氣冷", "很渴也有點餓", "想買咖啡", "想買禮物"],
        answer: 1,
      },
      {
        question: "他要喝什麼？",
        options: ["咖啡", "水", "茶", "飲料"],
        answer: 2,
      },
      {
        question: "他們覺得飲料怎麼樣？",
        options: ["很好喝，但有點太甜", "不好喝", "太冷了", "沒有味道"],
        answer: 0,
      },
    ],
  },
  {
    id: "book-5",
    unit: 5,
    title: "找錢包",
    text:
      "我的錢包不見了！我找了很久。我問媽媽：「你知道我的錢包在哪裡嗎？」媽媽說：「在桌子旁邊吧？」我去看，不在那裡。後來我找到了，在書包裡面。我今天下午兩點半有空，要去一家咖啡廳跟朋友喝下午茶，幸好找到了！",
    questions: [
      {
        question: "他的錢包最後在哪裡？",
        options: ["桌子上", "媽媽那裡", "書包裡面", "圖書館"],
        answer: 2,
      },
      {
        question: "他下午要去哪裡？",
        options: ["餐廳", "學校", "圖書館", "咖啡廳"],
        answer: 3,
      },
      {
        question: "他幾點有空？",
        options: ["一點", "兩點", "兩點半", "三點"],
        answer: 2,
      },
    ],
  },
  {
    id: "book-6",
    unit: 6,
    title: "週末運動",
    text:
      "我週末喜歡做運動。我平常打網球，有時候去海邊游泳。我弟弟喜歡踢足球，他常常去學校打棒球比賽。這個週末天氣不錯，我和弟弟一起去海邊。我游泳，弟弟踢足球。我們都很高興，因為週末可以運動，真的很好！",
    questions: [
      {
        question: "他平常喜歡做什麼運動？",
        options: ["踢足球", "游泳", "打網球", "打棒球"],
        answer: 2,
      },
      {
        question: "這個週末他們去哪裡？",
        options: ["學校", "圖書館", "餐廳", "海邊"],
        answer: 3,
      },
      {
        question: "弟弟在海邊做什麼？",
        options: ["游泳", "踢足球", "打網球", "看書"],
        answer: 1,
      },
    ],
  },
  {
    id: "book-7",
    unit: 7,
    title: "去飯店",
    text:
      "我的朋友從美國來台灣，住在市中心的飯店。我要去看他，問他：「飯店在哪裡？」他說：「坐捷運藍線，在市政府站下車，飯店就在捷運站旁邊，很方便。」我說：「好，我坐電梯上去找你，幾樓？」他說：「十二樓，沒關係，電梯很快！」",
    questions: [
      {
        question: "朋友住在哪裡？",
        options: ["學校宿舍", "機場附近", "市中心的飯店", "咖啡廳"],
        answer: 2,
      },
      {
        question: "怎麼去飯店？",
        options: ["開車", "坐飛機", "坐捷運藍線", "走路"],
        answer: 2,
      },
      {
        question: "朋友住在幾樓？",
        options: ["二樓", "五樓", "十樓", "十二樓"],
        answer: 3,
      },
    ],
  },
  {
    id: "book-8",
    unit: 8,
    title: "買衣服",
    text:
      "今天我跟媽媽去百貨公司買衣服。媽媽說她想買一條裙子。她看到一條白色的長裙子，很好看。我說：「這條裙子真漂亮！」她又看到一雙黑色的鞋子，在二樓。她說：「我想一起買。」店員說鞋子在樓下一樓，我們坐電梯下去，找到了那雙黑色的鞋子。",
    questions: [
      {
        question: "她們去哪裡買衣服？",
        options: ["學校", "咖啡廳", "百貨公司", "超市"],
        answer: 2,
      },
      {
        question: "媽媽看到什麼裙子？",
        options: ["黑色短裙", "白色長裙", "紅色裙子", "藍色裙子"],
        answer: 1,
      },
      {
        question: "黑色的鞋子在哪一樓？",
        options: ["二樓", "三樓", "四樓", "一樓"],
        answer: 3,
      },
    ],
  },
  {
    id: "book-9",
    unit: 9,
    title: "語言班",
    text:
      "我在一個語言中心學中文。我們班有十五個同學，來自很多不同的國家。教室在圖書館對面，學校和咖啡廳中間。我比較喜歡說中文，也許以後我可以去台灣工作。我希望能學別的語言，也許日文或英文。老師說，能說多種語言的人很厲害！",
    questions: [
      {
        question: "教室在哪裡？",
        options: ["咖啡廳旁邊", "圖書館對面", "學校樓上", "飯店附近"],
        answer: 1,
      },
      {
        question: "他希望以後做什麼？",
        options: ["在美國讀書", "去台灣工作", "在學校教書", "開咖啡廳"],
        answer: 1,
      },
      {
        question: "老師說什麼樣的人很厲害？",
        options: ["會踢足球的人", "能說多種語言的人", "很有錢的人", "去過很多國家的人"],
        answer: 1,
      },
    ],
  },
  {
    id: "book-10",
    unit: 10,
    title: "感冒了",
    text:
      "最近天氣不好，很多人感冒。我頭很痛，鼻子也不舒服，還有一點咳嗽。媽媽說我需要去看醫生。醫生說要多喝水，保持乾淨，記得吃藥。他給我三天的藥，叫我多休息。如果明天好一點，我就去上課；如果還是不好，就再來看醫生。",
    questions: [
      {
        question: "他有哪些症狀？",
        options: [
          "頭痛、鼻子不舒服、咳嗽",
          "眼睛痛、肚子痛",
          "發燒、頭暈",
          "手痛、腳痛",
        ],
        answer: 0,
      },
      {
        question: "醫生說要做什麼？",
        options: [
          "多睡覺、不要上課",
          "多喝水、保持乾淨、記得吃藥",
          "多吃水果、多運動",
          "去海邊游泳",
        ],
        answer: 1,
      },
      {
        question: "如果明天好一點，他要做什麼？",
        options: ["再去看醫生", "在家休息", "去上課", "去買藥"],
        answer: 2,
      },
    ],
  },
  {
    id: "book-11",
    unit: 11,
    title: "怎麼認識的",
    text:
      "我朋友大明和他的女朋友小芳是透過網路認識的。大明說一開始很緊張，沒有這樣的經驗，不知道怎麼辦。他們先用電子郵件聯絡，後來在咖啡廳見面。小芳打算去銀行工作，大明以後想當記者。他們希望以後可以一起去日本旅行。",
    questions: [
      {
        question: "大明和小芳怎麼認識的？",
        options: ["在學校認識", "透過網路認識", "在餐廳認識", "朋友介紹"],
        answer: 1,
      },
      {
        question: "小芳以後打算做什麼工作？",
        options: ["記者", "護理師", "老師", "在銀行工作"],
        answer: 3,
      },
      {
        question: "他們希望以後一起做什麼？",
        options: ["去美國讀書", "開咖啡廳", "去日本旅行", "在台灣工作"],
        answer: 2,
      },
    ],
  },
  {
    id: "book-12",
    unit: 12,
    title: "找工作",
    text:
      "我大學畢業以後，開始找工作。我希望在一家大公司工作，準時上班、下班。我用手機上網找工作，也問朋友。媽媽說工作很重要，但是也要注意休息。我以前在工廠做過工人，覺得很辛苦。現在我想做記者或是老師，用中文幫助別人，這對我來說很重要。",
    questions: [
      {
        question: "他以前在哪裡工作？",
        options: ["銀行", "學校", "工廠", "餐廳"],
        answer: 2,
      },
      {
        question: "他現在想做什麼工作？",
        options: ["護理師或銀行員", "工人或司機", "記者或老師", "廚師或工人"],
        answer: 2,
      },
      {
        question: "媽媽說什麼很重要？",
        options: [
          "賺很多錢",
          "工作重要，也要注意休息",
          "住在大城市",
          "每天運動",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "book-13",
    unit: 13,
    title: "用手機上網",
    text:
      "我朋友打電話給我說：「喂！我剛剛在學校附近看到一個很棒的博物館，你知道他們的網址嗎？」我說：「我不知道，你可以用手機上網找找看。」他說：「對，我用手機找到網站了，網址是這個，你也可以看看。」他說博物館在第二個路口旁邊，地址我有，我可以帶他去參觀。",
    questions: [
      {
        question: "朋友在哪裡看到博物館？",
        options: ["圖書館旁邊", "學校附近", "飯店對面", "捷運站旁"],
        answer: 1,
      },
      {
        question: "他們怎麼找到博物館的資料？",
        options: ["問路人", "看地圖", "用手機上網", "問老師"],
        answer: 2,
      },
      {
        question: "博物館在哪裡？",
        options: ["第一個路口", "第二個路口旁邊", "捷運站裡面", "百貨公司樓上"],
        answer: 1,
      },
    ],
  },
  {
    id: "book-14",
    unit: 14,
    title: "跨年",
    text:
      "每年跨年，台北 101 都有很多人來參加活動，看煙火、聽演唱會。我去年第一次來台灣過跨年，覺得世界上沒有比這更熱鬧的地方了。今年我打算再來，但是路口人太多，我忘了帶手機，找不到朋友。幸好我的中文還可以，可以問路。我覺得在台灣的生活真的很好！",
    questions: [
      {
        question: "跨年時台北 101 有什麼活動？",
        options: [
          "運動比賽",
          "看煙火、聽演唱會",
          "語言課程",
          "看電影",
        ],
        answer: 1,
      },
      {
        question: "他忘了帶什麼？",
        options: ["錢包", "書包", "手機", "鞋子"],
        answer: 2,
      },
      {
        question: "他怎麼找到路？",
        options: ["用手機查", "問朋友", "用中文問路", "看地圖"],
        answer: 2,
      },
    ],
  },
];

export function getPassageByLevel(level: HSKLevel): ReadingPassage | undefined {
  return TOCFL_PASSAGES.find((p) => p.level === level);
}

export function getPassageByUnit(unit: number): ReadingPassage | undefined {
  return BOOK_PASSAGES.find((p) => p.unit === unit);
}
