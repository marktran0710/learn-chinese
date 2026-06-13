// Video listening lessons — 我們這一家 & 小丸子
// Each episode has a YouTube video ID, timed transcript (Chinese + pinyin + English),
// key vocabulary, and comprehension questions.
//
// HOW TO ADD A REAL VIDEO:
//   1. Find the episode on YouTube.
//   2. Copy the video ID from the URL (e.g. https://youtube.com/watch?v=XXXXXXXXXXX → "XXXXXXXXXXX")
//   3. Replace the youtubeId field below.

export type TranscriptLine = {
  start: number;  // seconds into the video
  end: number;
  chinese: string;
  pinyin: string;
  english: string;
};

export type EpisodeVocab = {
  chinese: string;
  pinyin: string;
  meaning: string;
};

export type EpisodeQuestion = {
  question: string;
  options: string[];
  answer: number;
};

export type VideoEpisode = {
  id: string;
  show: "womenzheyijia" | "xiaomaruzi";
  showName: string;
  showNameZh: string;
  episode: string;
  title: string;
  titleZh: string;
  youtubeId: string;        // Replace with real YouTube video ID
  description: string;
  level: string;
  transcript: TranscriptLine[];
  vocab: EpisodeVocab[];
  questions: EpisodeQuestion[];
};

export const VIDEO_EPISODES: VideoEpisode[] = [
  // ── 我們這一家 ───────────────────────────────────────────────────────────────
  {
    id: "wzy-01",
    show: "womenzheyijia",
    showName: "Our Family",
    showNameZh: "我們這一家",
    episode: "EP01",
    title: "Dinner Together",
    titleZh: "一起吃晚飯",
    youtubeId: "",   // ← paste YouTube ID here
    description: "The whole family gathers for dinner. Mom talks about what she cooked, Dad comes home late, and the kids argue over food.",
    level: "A2",
    transcript: [
      { start: 0,   end: 5,   chinese: "媽媽，今天晚飯吃什麼？", pinyin: "Māma, jīntiān wǎnfàn chī shénme?", english: "Mom, what are we having for dinner today?" },
      { start: 5,   end: 11,  chinese: "今天媽媽做了紅燒肉、炒青菜，還有蛋花湯。", pinyin: "Jīntiān māma zuò le hóngshāo ròu, chǎo qīngcài, hái yǒu dànhuā tāng.", english: "Today Mom made braised pork, stir-fried vegetables, and egg drop soup." },
      { start: 11,  end: 16,  chinese: "哇，好香喔！我最喜歡紅燒肉了！", pinyin: "Wā, hǎo xiāng ō! Wǒ zuì xǐhuān hóngshāo ròu le!", english: "Wow, it smells so good! I love braised pork the most!" },
      { start: 16,  end: 22,  chinese: "小花，你不能只吃肉，青菜也要吃。", pinyin: "Xiǎo Huā, nǐ bù néng zhǐ chī ròu, qīngcài yě yào chī.", english: "Xiaohua, you can't only eat meat; you have to eat vegetables too." },
      { start: 22,  end: 27,  chinese: "可是我不喜歡吃青菜，青菜不好吃。", pinyin: "Kěshì wǒ bù xǐhuān chī qīngcài, qīngcài bù hǎochī.", english: "But I don't like eating vegetables; they don't taste good." },
      { start: 27,  end: 34,  chinese: "吃青菜身體才會好！媽媽說的對，你要多吃一點。", pinyin: "Chī qīngcài shēntǐ cái huì hǎo! Māma shuō de duì, nǐ yào duō chī yīdiǎn.", english: "Eating vegetables is good for your health! Mom is right; you should eat more." },
      { start: 34,  end: 40,  chinese: "爸爸還沒回來嗎？都幾點了？", pinyin: "Bàba hái méi huí lái ma? Dōu jǐ diǎn le?", english: "Hasn't Dad come home yet? What time is it already?" },
      { start: 40,  end: 46,  chinese: "他說今天公司有事，可能要晚一點才能回來。", pinyin: "Tā shuō jīntiān gōngsī yǒu shì, kěnéng yào wǎn yīdiǎn cái néng huí lái.", english: "He said there's something at the company today; he might come home a bit late." },
      { start: 46,  end: 52,  chinese: "唉，每次都這樣，我們先吃吧。", pinyin: "Āi, měi cì dōu zhèyàng, wǒmen xiān chī ba.", english: "Aish, it's always like this. Let's eat first." },
      { start: 52,  end: 58,  chinese: "對，爸爸回來我們再把菜熱一下給他。", pinyin: "Duì, bàba huí lái wǒmen zài bǎ cài rè yīxià gěi tā.", english: "Right, when Dad gets back we'll reheat the dishes for him." },
      { start: 58,  end: 65,  chinese: "大家慢慢吃！這碗湯很燙，小心一點。", pinyin: "Dàjiā màn màn chī! Zhè wǎn tāng hěn tàng, xiǎo xīn yīdiǎn.", english: "Everyone eat slowly! This bowl of soup is very hot; be careful." },
      { start: 65,  end: 72,  chinese: "好，謝謝媽媽做這麼好吃的晚飯！", pinyin: "Hǎo, xièxie māma zuò zhème hǎochī de wǎnfàn!", english: "OK, thank you Mom for making such a delicious dinner!" },
      { start: 72,  end: 79,  chinese: "媽媽最棒了！你做的東西都超好吃的。", pinyin: "Māma zuì bàng le! Nǐ zuò de dōngxi dōu chāo hǎochī de.", english: "Mom is the best! Everything you make tastes amazing." },
      { start: 79,  end: 85,  chinese: "好了好了，快吃飯吧，不然菜都涼了。", pinyin: "Hǎo le hǎo le, kuài chīfàn ba, bùrán cài dōu liáng le.", english: "Alright alright, eat quickly, otherwise the food will all get cold." },
    ],
    vocab: [
      { chinese: "晚飯", pinyin: "wǎnfàn", meaning: "dinner" },
      { chinese: "紅燒肉", pinyin: "hóngshāo ròu", meaning: "braised pork" },
      { chinese: "炒青菜", pinyin: "chǎo qīngcài", meaning: "stir-fried vegetables" },
      { chinese: "蛋花湯", pinyin: "dànhuā tāng", meaning: "egg drop soup" },
      { chinese: "香", pinyin: "xiāng", meaning: "fragrant; smells good" },
      { chinese: "燙", pinyin: "tàng", meaning: "scalding hot" },
      { chinese: "慢慢吃", pinyin: "màn màn chī", meaning: "eat slowly; bon appétit" },
      { chinese: "涼", pinyin: "liáng", meaning: "cold (temperature)" },
    ],
    questions: [
      {
        question: "媽媽今天做了哪些菜？",
        options: [
          "紅燒肉、炒青菜、蛋花湯",
          "炒飯、青菜、魚湯",
          "麵、蛋花湯、水果",
          "炸雞、薯條、可樂",
        ],
        answer: 0,
      },
      {
        question: "小花為什麼不想吃青菜？",
        options: [
          "她對青菜過敏",
          "她覺得青菜不好吃",
          "她已經吃飽了",
          "青菜太燙了",
        ],
        answer: 1,
      },
      {
        question: "爸爸為什麼晚回家？",
        options: [
          "他在打網球",
          "他去買東西",
          "公司有事",
          "他忘記回家",
        ],
        answer: 2,
      },
    ],
  },
  {
    id: "wzy-02",
    show: "womenzheyijia",
    showName: "Our Family",
    showNameZh: "我們這一家",
    episode: "EP02",
    title: "Weekend Morning",
    titleZh: "週末早上",
    youtubeId: "",   // ← paste YouTube ID here
    description: "It's the weekend. The kids want to sleep in but Mom has other plans — cleaning the house and going to the market.",
    level: "A2",
    transcript: [
      { start: 0,   end: 6,   chinese: "起床了！都九點了，還在睡！", pinyin: "Qǐchuáng le! Dōu jiǔ diǎn le, hái zài shuì!", english: "Get up! It's already nine o'clock and you're still sleeping!" },
      { start: 6,   end: 12,  chinese: "媽媽，今天是週末嘛，可以多睡一下啦。", pinyin: "Māma, jīntiān shì zhōumò ma, kěyǐ duō shuì yīxià la.", english: "Mom, today is the weekend; let us sleep a little longer." },
      { start: 12,  end: 18,  chinese: "週末也要早起！今天要打掃房間，還要去市場買東西。", pinyin: "Zhōumò yě yào zǎo qǐ! Jīntiān yào dǎsǎo fángjiān, hái yào qù shìchǎng mǎi dōngxi.", english: "You have to get up early on weekends too! Today we need to clean the room and go to the market." },
      { start: 18,  end: 24,  chinese: "我不想打掃，打掃好無聊喔。", pinyin: "Wǒ bù xiǎng dǎsǎo, dǎsǎo hǎo wúliáo ō.", english: "I don't want to clean. Cleaning is so boring." },
      { start: 24,  end: 31,  chinese: "無聊？你的房間亂成這樣，你好意思說無聊？", pinyin: "Wúliáo? Nǐ de fángjiān luàn chéng zhèyàng, nǐ hǎoyìsi shuō wúliáo?", english: "Boring? Your room is this messy and you have the nerve to say it's boring?" },
      { start: 31,  end: 37,  chinese: "好啦好啦，我現在起來。你先下去，我五分鐘後就下來。", pinyin: "Hǎo la hǎo la, wǒ xiànzài qǐlái. Nǐ xiān xià qù, wǒ wǔ fēnzhōng hòu jiù xià lái.", english: "OK OK, I'll get up now. You go down first; I'll be down in five minutes." },
      { start: 37,  end: 43,  chinese: "五分鐘！我在下面等你。對了，早餐我做好了。", pinyin: "Wǔ fēnzhōng! Wǒ zài xiàmiàn děng nǐ. Duì le, zǎocān wǒ zuò hǎo le.", english: "Five minutes! I'm waiting for you downstairs. By the way, I've already made breakfast." },
      { start: 43,  end: 49,  chinese: "哦！今天早餐吃什麼？", pinyin: "Ó! Jīntiān zǎocān chī shénme?", english: "Oh! What's for breakfast today?" },
      { start: 49,  end: 55,  chinese: "土司夾蛋，還有熱牛奶。快下來趁熱吃。", pinyin: "Tǔsī jiā dàn, hái yǒu rè niúnǎi. Kuài xià lái chèn rè chī.", english: "Toast with egg, and hot milk. Come down quickly and eat while it's hot." },
      { start: 55,  end: 62,  chinese: "好！那我先去刷牙洗臉，馬上就來！", pinyin: "Hǎo! Nà wǒ xiān qù shuā yá xǐ liǎn, mǎshàng jiù lái!", english: "OK! Then I'll go brush my teeth and wash my face — I'll be right there!" },
      { start: 62,  end: 69,  chinese: "記得把床鋪整理好再下來。", pinyin: "Jìde bǎ chuángpù zhěnglǐ hǎo zài xià lái.", english: "Remember to tidy up your bed before coming down." },
      { start: 69,  end: 75,  chinese: "知道了！媽媽你最囉嗦了！", pinyin: "Zhīdào le! Māma nǐ zuì luōsuo le!", english: "I know! Mom, you're so naggy!" },
    ],
    vocab: [
      { chinese: "起床", pinyin: "qǐchuáng", meaning: "get out of bed; wake up" },
      { chinese: "週末", pinyin: "zhōumò", meaning: "weekend" },
      { chinese: "打掃", pinyin: "dǎsǎo", meaning: "to clean; to sweep" },
      { chinese: "市場", pinyin: "shìchǎng", meaning: "market" },
      { chinese: "無聊", pinyin: "wúliáo", meaning: "boring" },
      { chinese: "亂", pinyin: "luàn", meaning: "messy; chaotic" },
      { chinese: "刷牙", pinyin: "shuā yá", meaning: "brush teeth" },
      { chinese: "囉嗦", pinyin: "luōsuo", meaning: "naggy; long-winded" },
    ],
    questions: [
      {
        question: "媽媽為什麼叫孩子起床？",
        options: [
          "要去上學",
          "要打掃和去市場",
          "有客人要來",
          "要去海邊玩",
        ],
        answer: 1,
      },
      {
        question: "孩子說幾分鐘後下去？",
        options: ["三分鐘", "五分鐘", "十分鐘", "一分鐘"],
        answer: 1,
      },
      {
        question: "今天的早餐是什麼？",
        options: [
          "稀飯和醬菜",
          "麵條和果汁",
          "土司夾蛋和熱牛奶",
          "炒飯和湯",
        ],
        answer: 2,
      },
    ],
  },

  // ── 小丸子 ────────────────────────────────────────────────────────────────────
  {
    id: "xmz-01",
    show: "xiaomaruzi",
    showName: "Chibi Maruko-chan",
    showNameZh: "小丸子",
    episode: "EP01",
    title: "Going to School",
    titleZh: "去上學",
    youtubeId: "",   // ← paste YouTube ID here
    description: "Maruko doesn't want to go to school. Grandpa encourages her with a story and walks her to the school gate.",
    level: "A1",
    transcript: [
      { start: 0,   end: 6,   chinese: "爺爺，我不想去上學。", pinyin: "Yéye, wǒ bù xiǎng qù shàngxué.", english: "Grandpa, I don't want to go to school." },
      { start: 6,   end: 12,  chinese: "為什麼不想去啊？今天有什麼事嗎？", pinyin: "Wèishéme bù xiǎng qù a? Jīntiān yǒu shénme shì ma?", english: "Why don't you want to go? Is something happening today?" },
      { start: 12,  end: 18,  chinese: "今天有考試，我還沒複習完。", pinyin: "Jīntiān yǒu kǎoshì, wǒ hái méi fùxí wán.", english: "There's a test today and I haven't finished studying." },
      { start: 18,  end: 25,  chinese: "哎呀，所以昨天晚上要好好念書嘛！", pinyin: "Āiyā, suǒyǐ zuótiān wǎnshàng yào hǎohǎo niànshū ma!", english: "Oh my, that's why you should have studied hard last night!" },
      { start: 25,  end: 31,  chinese: "可是昨天我看電視看太晚了。", pinyin: "Kěshì zuótiān wǒ kàn diànshì kàn tài wǎn le.", english: "But yesterday I watched TV until too late." },
      { start: 31,  end: 38,  chinese: "小丸子，不去學校不行的。快去洗臉換衣服。", pinyin: "Xiǎo Wánzi, bù qù xuéxiào bù xíng de. Kuài qù xǐ liǎn huàn yīfu.", english: "Maruko, you can't skip school. Go quickly and wash your face and change clothes." },
      { start: 38,  end: 45,  chinese: "好啦……爺爺，你可以陪我走去學校嗎？", pinyin: "Hǎo la…… Yéye, nǐ kěyǐ péi wǒ zǒu qù xuéxiào ma?", english: "Fine… Grandpa, can you walk me to school?" },
      { start: 45,  end: 51,  chinese: "可以啊！爺爺陪你去。我們邊走邊說故事。", pinyin: "Kěyǐ a! Yéye péi nǐ qù. Wǒmen biān zǒu biān shuō gùshi.", english: "Of course! Grandpa will go with you. We'll tell stories as we walk." },
      { start: 51,  end: 57,  chinese: "真的？好！那我們快去吧！", pinyin: "Zhēn de? Hǎo! Nà wǒmen kuài qù ba!", english: "Really? Great! Then let's go quickly!" },
      { start: 57,  end: 64,  chinese: "小丸子，記得考試要認真，不會的題目先跳過，回來再做。", pinyin: "Xiǎo Wánzi, jìde kǎoshì yào rènzhēn, bù huì de tímù xiān tiào guò, huí lái zài zuò.", english: "Maruko, remember to be focused on the test. Skip questions you don't know and come back to them." },
      { start: 64,  end: 70,  chinese: "嗯！我知道了，爺爺。謝謝你陪我來。", pinyin: "Ń! Wǒ zhīdào le, yéye. Xièxie nǐ péi wǒ lái.", english: "Mm! I understand, Grandpa. Thank you for walking with me." },
      { start: 70,  end: 76,  chinese: "好好考，放學我在門口等你！", pinyin: "Hǎohǎo kǎo, fàngxué wǒ zài ménkǒu děng nǐ!", english: "Do your best on the test. I'll wait at the gate when school's out!" },
    ],
    vocab: [
      { chinese: "上學", pinyin: "shàngxué", meaning: "go to school" },
      { chinese: "考試", pinyin: "kǎoshì", meaning: "test; exam" },
      { chinese: "複習", pinyin: "fùxí", meaning: "review; study" },
      { chinese: "念書", pinyin: "niànshū", meaning: "study; read books" },
      { chinese: "陪", pinyin: "péi", meaning: "accompany; keep company" },
      { chinese: "故事", pinyin: "gùshi", meaning: "story" },
      { chinese: "認真", pinyin: "rènzhēn", meaning: "seriously; earnest" },
      { chinese: "放學", pinyin: "fàngxué", meaning: "school's out; end of school day" },
    ],
    questions: [
      {
        question: "小丸子為什麼不想去上學？",
        options: [
          "她生病了",
          "今天有考試，她還沒複習完",
          "天氣不好",
          "她跟同學吵架",
        ],
        answer: 1,
      },
      {
        question: "爺爺答應小丸子什麼？",
        options: [
          "幫她做作業",
          "買她喜歡的東西",
          "陪她走去學校，還要說故事",
          "讓她今天不用去上學",
        ],
        answer: 2,
      },
      {
        question: "爺爺叫小丸子考試遇到不會的題目要怎麼做？",
        options: [
          "不用寫",
          "先跳過，回來再做",
          "問旁邊的同學",
          "馬上告訴老師",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "xmz-02",
    show: "xiaomaruzi",
    showName: "Chibi Maruko-chan",
    showNameZh: "小丸子",
    episode: "EP02",
    title: "Helping at Home",
    titleZh: "幫忙做家事",
    youtubeId: "",   // ← paste YouTube ID here
    description: "Maruko tries to help Mom with housework but causes more trouble than help. Mom teaches her how to properly do chores.",
    level: "A1",
    transcript: [
      { start: 0,   end: 6,   chinese: "媽媽，我今天要幫你做家事！", pinyin: "Māma, wǒ jīntiān yào bāng nǐ zuò jiāshì!", english: "Mom, today I'm going to help you with housework!" },
      { start: 6,   end: 12,  chinese: "哦？小丸子今天怎麼這麼乖？", pinyin: "Ó? Xiǎo Wánzi jīntiān zěnme zhème guāi?", english: "Oh? Maruko, why are you so well-behaved today?" },
      { start: 12,  end: 18,  chinese: "因為上次媽媽說，會幫忙做家事的小孩是好孩子！", pinyin: "Yīnwèi shàng cì māma shuō, huì bāngmáng zuò jiāshì de xiǎohái shì hǎo háizi!", english: "Because last time Mom said children who help with housework are good kids!" },
      { start: 18,  end: 24,  chinese: "好，那你來掃地好了，掃把在門邊。", pinyin: "Hǎo, nà nǐ lái sǎo dì hǎo le, sǎobǎ zài mén biān.", english: "OK, then you can sweep the floor. The broom is by the door." },
      { start: 24,  end: 31,  chinese: "好！交給我吧！（掃地聲……）媽媽你看！我掃好了！", pinyin: "Hǎo! Jiāo gěi wǒ ba! (sǎo dì shēng……) Māma nǐ kàn! Wǒ sǎo hǎo le!", english: "OK! Leave it to me! (sweeping sounds…) Mom, look! I'm done sweeping!" },
      { start: 31,  end: 38,  chinese: "小丸子……你只是把灰塵掃到角落，那樣不算掃乾淨。", pinyin: "Xiǎo Wánzi…… nǐ zhǐ shì bǎ huīchén sǎo dào jiǎoluò, nàyàng bù suàn sǎo gānjìng.", english: "Maruko… you only swept the dust into the corner; that doesn't count as clean." },
      { start: 38,  end: 45,  chinese: "咦？那要怎麼掃才對？", pinyin: "Yí? Nà yào zěnme sǎo cái duì?", english: "Huh? Then how do you sweep properly?" },
      { start: 45,  end: 52,  chinese: "要從裡面往外掃，最後把灰塵掃到畚斗裡，然後倒掉。", pinyin: "Yào cóng lǐmiàn wǎng wài sǎo, zuìhòu bǎ huīchén sǎo dào běndǒu lǐ, ránhòu dào diào.", english: "You sweep from inside to outside, and finally sweep the dust into the dustpan, then throw it away." },
      { start: 52,  end: 58,  chinese: "喔！原來如此！我再掃一次！", pinyin: "Ō! Yuánlái rúcǐ! Wǒ zài sǎo yī cì!", english: "Oh! I see! Let me sweep again!" },
      { start: 58,  end: 65,  chinese: "這次掃得很好！小丸子真棒！", pinyin: "Zhè cì sǎo de hěn hǎo! Xiǎo Wánzi zhēn bàng!", english: "This time you swept very well! Maruko is great!" },
      { start: 65,  end: 71,  chinese: "嘻嘻，媽媽，接下來我還可以幫你做什麼？", pinyin: "Xīxī, māma, jiē xià lái wǒ hái kěyǐ bāng nǐ zuò shénme?", english: "Hehe, Mom, what else can I help you with next?" },
      { start: 71,  end: 78,  chinese: "你去擦桌子吧，抹布在水槽旁邊。記得要先把抹布洗一下。", pinyin: "Nǐ qù cā zhuōzi ba, mābù zài shuǐcáo pángbiān. Jìde yào xiān bǎ mābù xǐ yīxià.", english: "Go wipe the table then. The cloth is beside the sink. Remember to rinse the cloth first." },
    ],
    vocab: [
      { chinese: "家事", pinyin: "jiāshì", meaning: "housework; household chores" },
      { chinese: "掃地", pinyin: "sǎo dì", meaning: "sweep the floor" },
      { chinese: "掃把", pinyin: "sǎobǎ", meaning: "broom" },
      { chinese: "灰塵", pinyin: "huīchén", meaning: "dust" },
      { chinese: "角落", pinyin: "jiǎoluò", meaning: "corner" },
      { chinese: "畚斗", pinyin: "běndǒu", meaning: "dustpan" },
      { chinese: "擦桌子", pinyin: "cā zhuōzi", meaning: "wipe the table" },
      { chinese: "抹布", pinyin: "mābù", meaning: "cleaning cloth; rag" },
    ],
    questions: [
      {
        question: "小丸子為什麼想幫媽媽做家事？",
        options: [
          "她想要獎品",
          "媽媽說幫忙做家事的小孩是好孩子",
          "她想學做飯",
          "爺爺叫她做的",
        ],
        answer: 1,
      },
      {
        question: "小丸子第一次掃地錯在哪裡？",
        options: [
          "她用錯掃把",
          "她只是把灰塵掃到角落",
          "她把地掃壞了",
          "她不知道怎麼拿掃把",
        ],
        answer: 1,
      },
      {
        question: "正確的掃地方法是什麼？",
        options: [
          "從外往裡掃",
          "只掃中間",
          "從裡往外掃，最後倒進畚斗",
          "用抹布掃",
        ],
        answer: 2,
      },
    ],
  },
];

export function getEpisodesByShow(show: VideoEpisode["show"]): VideoEpisode[] {
  return VIDEO_EPISODES.filter((e) => e.show === show);
}

export function getEpisodeById(id: string): VideoEpisode | undefined {
  return VIDEO_EPISODES.find((e) => e.id === id);
}

export const SHOWS = [
  {
    id: "womenzheyijia" as const,
    nameZh: "我們這一家",
    nameEn: "Our Family",
    level: "A2–B1",
    description: "Taiwanese animated family comedy. Great for everyday dialogue, family vocabulary, and natural conversational Chinese.",
    color: "from-orange-400 to-red-500",
    icon: "🏠",
  },
  {
    id: "xiaomaruzi" as const,
    nameZh: "小丸子",
    nameEn: "Chibi Maruko-chan",
    level: "A1–A2",
    description: "Beloved animated series about a young girl's daily life. Simple vocabulary, slow clear speech, perfect for beginners.",
    color: "from-pink-400 to-rose-500",
    icon: "🎀",
  },
];
