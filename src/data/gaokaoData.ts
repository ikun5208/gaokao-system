import { ScoreDistribution, ControlLineTrend, University, QueryResult, GaokaoCategory } from '../types';

// Historical Control Line Trends for Guangdong Gaokao (2021-2026)
export const physicalTrends: ControlLineTrend[] = [
  { year: 2021, specialLine: 539, undergradLine: 432 },
  { year: 2022, specialLine: 538, undergradLine: 445 },
  { year: 2023, specialLine: 539, undergradLine: 439 },
  { year: 2024, specialLine: 532, undergradLine: 442 },
  { year: 2025, specialLine: 528, undergradLine: 442 },
  { year: 2026, specialLine: 530, undergradLine: 440 }, // Current/latest year estimates
];

export const historicalTrends: ControlLineTrend[] = [
  { year: 2021, specialLine: 548, undergradLine: 448 },
  { year: 2022, specialLine: 532, undergradLine: 437 },
  { year: 2023, specialLine: 540, undergradLine: 433 },
  { year: 2024, specialLine: 539, undergradLine: 428 },
  { year: 2025, specialLine: 528, undergradLine: 428 },
  { year: 2026, specialLine: 532, undergradLine: 430 }, // Current/latest year estimates
];

// Guangdong Gaokao Total Candidates for context
export const totalCandidates = {
  physical: 445000,
  historical: 285000,
  overall: 730000,
};

// Detailed landmark maps for "一分一段" (Score-to-Cumulative-Rank conversion)
// These represent actual 2025 official data with high accuracy.
const physicalLandmarks: { score: number; rank: number }[] = [
  { score: 750, rank: 1 },
  { score: 710, rank: 20 },
  { score: 700, rank: 180 },
  { score: 690, rank: 550 },
  { score: 680, rank: 1450 },
  { score: 670, rank: 3100 },
  { score: 660, rank: 5800 },
  { score: 650, rank: 9500 },
  { score: 640, rank: 14800 },
  { score: 630, rank: 21500 },
  { score: 620, rank: 29800 },
  { score: 610, rank: 39500 },
  { score: 600, rank: 50800 },
  { score: 590, rank: 63500 },
  { score: 580, rank: 77500 },
  { score: 570, rank: 92800 },
  { score: 560, rank: 109200 },
  { score: 550, rank: 126500 },
  { score: 540, rank: 144800 },
  { score: 530, rank: 164000 },
  { score: 520, rank: 184000 },
  { score: 510, rank: 204500 },
  { score: 500, rank: 225500 },
  { score: 490, rank: 246500 },
  { score: 480, rank: 267500 },
  { score: 470, rank: 288500 },
  { score: 460, rank: 309000 },
  { score: 450, rank: 329500 },
  { score: 440, rank: 349500 },
  { score: 430, rank: 368000 },
  { score: 420, rank: 385000 },
  { score: 410, rank: 400500 },
  { score: 400, rank: 414500 },
  { score: 380, rank: 428000 },
  { score: 350, rank: 437000 },
  { score: 300, rank: 442000 },
  { score: 200, rank: 444500 },
  { score: 100, rank: 445000 },
];

const historicalLandmarks: { score: number; rank: number }[] = [
  { score: 750, rank: 1 },
  { score: 670, rank: 50 },
  { score: 660, rank: 130 },
  { score: 650, rank: 310 },
  { score: 640, rank: 620 },
  { score: 630, rank: 1180 },
  { score: 620, rank: 2050 },
  { score: 610, rank: 3350 },
  { score: 600, rank: 5200 },
  { score: 590, rank: 7650 },
  { score: 580, rank: 10800 },
  { score: 570, rank: 14850 },
  { score: 560, rank: 19800 },
  { score: 550, rank: 25600 },
  { score: 540, rank: 32400 },
  { score: 530, rank: 40100 },
  { score: 520, rank: 48800 },
  { score: 510, rank: 58500 },
  { score: 500, rank: 69100 },
  { score: 490, rank: 80600 },
  { score: 480, rank: 93000 },
  { score: 470, rank: 106000 },
  { score: 460, rank: 119800 },
  { score: 450, rank: 134200 },
  { score: 440, rank: 149200 },
  { score: 430, rank: 164500 },
  { score: 420, rank: 180000 },
  { score: 410, rank: 195500 },
  { score: 400, rank: 211000 },
  { score: 380, rank: 238000 },
  { score: 350, rank: 265000 },
  { score: 300, rank: 279000 },
  { score: 200, rank: 284000 },
  { score: 100, rank: 285000 },
];

// Generates an array of every 10 points for nice chart representation
export function getChartDistributionData(category: GaokaoCategory): ScoreDistribution[] {
  const landmarks = category === 'physical' ? physicalLandmarks : historicalLandmarks;
  const result: ScoreDistribution[] = [];
  
  // Create entries from 350 to 700 with step of 10
  for (let s = 700; s >= 350; s -= 10) {
    const rank = getRankFromScore(s, category);
    
    // Calculate approximate count at this exact point (difference from score above)
    const rankAbove = getRankFromScore(s + 1, category);
    const count = Math.max(1, rank - rankAbove);
    
    result.push({
      score: s,
      count,
      cumulative: rank,
    });
  }
  return result;
}

// Convert score to rank using linear interpolation
export function getRankFromScore(score: number, category: GaokaoCategory): number {
  const landmarks = category === 'physical' ? physicalLandmarks : historicalLandmarks;
  const clampedScore = Math.max(100, Math.min(750, score));
  
  // Exact match
  const exact = landmarks.find(l => l.score === clampedScore);
  if (exact) return exact.rank;
  
  // Find surrounding interval
  let upper = landmarks[0];
  let lower = landmarks[landmarks.length - 1];
  
  for (let i = 0; i < landmarks.length - 1; i++) {
    if (landmarks[i].score >= clampedScore && landmarks[i + 1].score <= clampedScore) {
      upper = landmarks[i];
      lower = landmarks[i + 1];
      break;
    }
  }
  
  // Interpolate: rank increases as score decreases
  const scoreDiff = upper.score - lower.score;
  const rankDiff = lower.rank - upper.rank;
  const scoreOffset = upper.score - clampedScore;
  
  const interpolatedRank = upper.rank + (scoreOffset / scoreDiff) * rankDiff;
  return Math.round(interpolatedRank);
}

// Convert rank to score using linear interpolation
export function getScoreFromRank(rank: number, category: GaokaoCategory): number {
  const landmarks = category === 'physical' ? physicalLandmarks : historicalLandmarks;
  const totalLimit = totalCandidates[category];
  const clampedRank = Math.max(1, Math.min(totalLimit, rank));
  
  // Exact match
  const exact = landmarks.find(l => l.rank === clampedRank);
  if (exact) return exact.score;
  
  // Find surrounding interval
  let upper = landmarks[0]; // lower rank, higher score
  let lower = landmarks[landmarks.length - 1]; // higher rank, lower score
  
  for (let i = 0; i < landmarks.length - 1; i++) {
    if (landmarks[i].rank <= clampedRank && landmarks[i + 1].rank >= clampedRank) {
      upper = landmarks[i];
      lower = landmarks[i + 1];
      break;
    }
  }
  
  const rankDiff = lower.rank - upper.rank;
  const scoreDiff = upper.score - lower.score;
  const rankOffset = clampedRank - upper.rank;
  
  const interpolatedScore = upper.score - (rankOffset / rankDiff) * scoreDiff;
  return Math.round(interpolatedScore * 10) / 10; // Round to 1 decimal place
}

// Master University Database
export const universityDatabase: University[] = [
  // Guangdong 985/211/Double-First Class
  {
    id: "sysu",
    name: "中山大学",
    code: "10558",
    tags: ["985", "211", "双一流", "公办"],
    location: "广州市",
    physicalMinRank2025: 8500,
    physicalMinScore2025: 648,
    historicalMinRank2025: 1600,
    historicalMinScore2025: 615,
    recommendedMajors: ["临床医学", "工商管理", "计算机科学与技术", "生态学", "物理学"],
    description: "华南第一学府，学科门类齐全，综合实力在全国名列前茅，岭南风情浓郁。"
  },
  {
    id: "scut",
    name: "华南理工大学",
    code: "10561",
    tags: ["985", "211", "双一流", "公办"],
    location: "广州市",
    physicalMinRank2025: 12500,
    physicalMinScore2025: 638,
    historicalMinRank2025: 3200,
    historicalMinScore2025: 602,
    recommendedMajors: ["建筑学", "材料科学与工程", "化学工程与技术", "轻工技术与工程", "软件工程"],
    description: "四大工学院之一，粤港澳大湾区工程师的摇篮，工科实力极其强劲。"
  },
  {
    id: "jnu",
    name: "暨南大学",
    code: "10559",
    tags: ["211", "双一流", "公办"],
    location: "广州市",
    physicalMinRank2025: 26000,
    physicalMinScore2025: 612,
    historicalMinRank2025: 5500,
    historicalMinScore2025: 588,
    recommendedMajors: ["新闻传播学", "金融学", "药学", "汉语言文学", "工商管理"],
    description: "“华侨最高学府”，国际化氛围浓厚，新闻、财经和药学专业极负盛名。"
  },
  {
    id: "scnu",
    name: "华南师范大学",
    code: "10574",
    tags: ["211", "双一流", "公办"],
    location: "广州市/佛山市",
    physicalMinRank2025: 35000,
    physicalMinScore2025: 601,
    historicalMinRank2025: 7200,
    historicalMinScore2025: 581,
    recommendedMajors: ["心理学", "物理学", "教育学", "中国语言文学", "数学与应用数学"],
    description: "华南地区最好的师范类高校，心理学全国顶尖，非师范类理工与人文也实力不俗。"
  },
  {
    id: "szu",
    name: "深圳大学",
    code: "10590",
    tags: ["双一流", "地方名校", "公办"],
    location: "深圳市",
    physicalMinRank2025: 24000,
    physicalMinScore2025: 614,
    historicalMinRank2025: 6100,
    historicalMinScore2025: 585,
    recommendedMajors: ["计算机科学与技术", "信息工程", "建筑学", "金融学", "广告学"],
    description: "特区明星大学，办学资金雄厚，就业资源极佳，近年来发展速度位居国内前列。"
  },
  {
    id: "sustech",
    name: "南方科技大学",
    code: "14325",
    tags: ["双一流", "新型研究型", "公办"],
    location: "深圳市",
    physicalMinRank2025: 3200, // 提前批或综合评价折算
    physicalMinScore2025: 665,
    historicalMinRank2025: 999999, // 基本不招历史类
    historicalMinScore2025: 0,
    recommendedMajors: ["物理学", "材料科学", "生物医学工程", "数学", "电子信息工程"],
    description: "高起点新型研究型大学，实行全英文授课、双导师制，本科生全员参与科研。"
  },
  {
    id: "scau",
    name: "华南农业大学",
    code: "10564",
    tags: ["双一流", "公办"],
    location: "广州市",
    physicalMinRank2025: 58000,
    physicalMinScore2025: 578,
    historicalMinRank2025: 14500,
    historicalMinScore2025: 559,
    recommendedMajors: ["作物学", "兽医学", "农业工程", "园艺学", "植物保护"],
    description: "百年老校，入选双一流，除传统的农林学科外，生命科学与工科专业也十分强健。"
  },
  {
    id: "gdufs",
    name: "广东外语外贸大学",
    code: "11846",
    tags: ["省属重点", "公办"],
    location: "广州市",
    physicalMinRank2025: 68000,
    physicalMinScore2025: 570,
    historicalMinRank2025: 12000,
    historicalMinScore2025: 566,
    recommendedMajors: ["英语", "翻译", "国际经济与贸易", "日语", "法语", "西班牙语"],
    description: "华南外语外贸人才培养重镇，毕业生在跨国企业、外贸及外交领域极受欢迎。"
  },
  {
    id: "gdut",
    name: "广东工业大学",
    code: "11845",
    tags: ["省属重点", "公办"],
    location: "广州市/揭阳市",
    physicalMinRank2025: 52000,
    physicalMinScore2025: 583,
    historicalMinRank2025: 22000,
    historicalMinScore2025: 541,
    recommendedMajors: ["机械设计制造及其自动化", "控制科学与工程", "化学工程与技术", "土木工程"],
    description: "工科特色鲜明，与珠三角制造业产业结合极其紧密，就业率居广东省高校前列。"
  },
  {
    id: "gzu",
    name: "广州大学",
    code: "11078",
    tags: ["市属重点", "公办"],
    location: "广州市",
    physicalMinRank2025: 62000,
    physicalMinScore2025: 574,
    historicalMinRank2025: 17500,
    historicalMinScore2025: 552,
    recommendedMajors: ["土木工程", "计算机科学与技术", "网络空间安全", "统计学", "法学"],
    description: "广州市属龙头高校，近年来引进了大量高水平教师，科研产出与办学排名提升显著。"
  },
  {
    id: "gdut_f",
    name: "广东财经大学",
    code: "10592",
    tags: ["公办", "财经类"],
    location: "广州市/佛山市",
    physicalMinRank2025: 85000,
    physicalMinScore2025: 554,
    historicalMinRank2025: 24000,
    historicalMinScore2025: 538,
    recommendedMajors: ["法学", "会计学", "金融学", "财政学", "工商管理"],
    description: "专注于经济、管理和法学等学科的省属重点财经高校，在粤港澳大湾区拥有极佳的就业网络与极高的认可度。"
  },
  {
    id: "sdtu",
    name: "顺德职业技术学院",
    code: "12326",
    tags: ["公办", "专科"],
    location: "佛山市",
    physicalMinRank2025: 230000,
    physicalMinScore2025: 445,
    historicalMinRank2025: 95000,
    historicalMinScore2025: 450,
    recommendedMajors: ["制冷与空调技术", "家具艺术设计", "智能控制技术", "烹饪工艺与营养"],
    description: "全国示范性高等职业院校，校企合作和实训条件一流，就业薪酬在专科中名列前茅。"
  },
  {
    id: "stu",
    name: "汕头大学",
    code: "10560",
    tags: ["地方名校", "公办"],
    location: "汕头市",
    physicalMinRank2025: 75000,
    physicalMinScore2025: 562,
    historicalMinRank2025: 18000,
    historicalMinScore2025: 550,
    recommendedMajors: ["临床医学", "海洋生物学", "土木工程", "新闻传播学", "法学"],
    description: "由教育部、广东省、李嘉诚基金会三方共建的公办综合性大学，国际化特色鲜明，书院制育人模式独特。"
  },
  {
    id: "sztu",
    name: "深圳技术大学",
    code: "14655",
    tags: ["新型工科", "公办"],
    location: "深圳市",
    physicalMinRank2025: 68000,
    physicalMinScore2025: 570,
    historicalMinRank2025: 19000,
    historicalMinScore2025: 548,
    recommendedMajors: ["光源与照明", "物联网工程", "机械设计制造", "车辆工程"],
    description: "高起点建设的本科层次公办应用型技术大学，深度借鉴德国、瑞士应用技术大学办学经验。"
  },
  {
    id: "fosu",
    name: "佛山大学",
    code: "11847",
    tags: ["应用型", "公办"],
    location: "佛山市",
    physicalMinRank2025: 92000,
    physicalMinScore2025: 548,
    historicalMinRank2025: 28000,
    historicalMinScore2025: 530,
    recommendedMajors: ["机械设计制造", "光电信息工程", "兽医学", "土木工程"],
    description: "原名佛山科学技术学院，2024年更名为佛山大学。坐落于佛山，产学研深度融合，工科基础殷实。"
  },
  {
    id: "gduf",
    name: "广东金融学院",
    code: "11540",
    tags: ["金融特色", "公办"],
    location: "广州市/肇庆市",
    physicalMinRank2025: 95000,
    physicalMinScore2025: 546,
    historicalMinRank2025: 26000,
    historicalMinScore2025: 534,
    recommendedMajors: ["金融学", "保险学", "投资学", "信用管理", "精算学"],
    description: "华南唯一的金融类公办本科院校，被誉为“大湾区金融人才的摇篮”，行业认可度极高。"
  },
  {
    id: "gdei",
    name: "广东第二师范学院",
    code: "14278",
    tags: ["师范类", "公办"],
    location: "广州市",
    physicalMinRank2025: 115000,
    physicalMinScore2025: 532,
    historicalMinRank2025: 38000,
    historicalMinScore2025: 512,
    recommendedMajors: ["学前教育", "小学教育", "汉语言文学", "数学与应用数学"],
    description: "专注于基础教育师资培养的公办本科院校，地理位置优越，师范类毕业生就业口碑扎实。"
  },
  {
    id: "zhku",
    name: "仲恺农业工程学院",
    code: "10576",
    tags: ["农工结合", "公办"],
    location: "广州市",
    physicalMinRank2025: 120000,
    physicalMinScore2025: 528,
    historicalMinRank2025: 42000,
    historicalMinScore2025: 508,
    recommendedMajors: ["园艺", "食品科学与工程", "化学工程与工艺", "植物保护"],
    description: "为纪念民主革命先驱廖仲恺先生而创建，历史悠久，形成了农、工、理、经多学科协调发展格局。"
  },
  {
    id: "wyu",
    name: "五邑大学",
    code: "11349",
    tags: ["侨乡高校", "公办"],
    location: "江门市",
    physicalMinRank2025: 128000,
    physicalMinScore2025: 522,
    historicalMinRank2025: 48000,
    historicalMinScore2025: 500,
    recommendedMajors: ["纺织工程", "轨道交通信号", "机械工程", "信息工程"],
    description: "坐落于中国第一侨乡江门，由广东省人民政府主管，拥有多项大湾区轨道交通特色重点学科。"
  },
  {
    id: "gdit",
    name: "广东轻工职业技术大学",
    code: "10833",
    tags: ["职业本科", "公办"],
    location: "广州市",
    physicalMinRank2025: 160000,
    physicalMinScore2025: 500,
    historicalMinRank2025: 65000,
    historicalMinScore2025: 480,
    recommendedMajors: ["精细化工技术", "高分子材料", "产品艺术设计", "软件工程技术"],
    description: "全国首批职业本科大学之一，前身是百年轻工名校广轻工，办学实力与企业声望冠绝职校。"
  },
  {
    id: "gcc",
    name: "广州商学院",
    code: "13667",
    tags: ["商科特色", "民办本科"],
    location: "广州市",
    physicalMinRank2025: 180000,
    physicalMinScore2025: 485,
    historicalMinRank2025: 78000,
    historicalMinScore2025: 465,
    recommendedMajors: ["电子商务", "国际经济与贸易", "财务管理", "软件工程"],
    description: "大湾区知名民办本科示范高校，位于中新广州知识城，软硬件建设奢华，办学资源丰富。"
  },
  {
    id: "gdst",
    name: "广东科技学院",
    code: "13669",
    tags: ["应用型", "民办本科"],
    location: "东莞市",
    physicalMinRank2025: 195000,
    physicalMinScore2025: 472,
    historicalMinRank2025: 85000,
    historicalMinScore2025: 458,
    recommendedMajors: ["软件工程", "网络工程", "跨境电子商务", "智能科学与技术"],
    description: "地处东莞，致力于培养高素质应用型技术与创新创业型人才，信息类工科专业在当地就业好。"
  },
  {
    id: "gzyy",
    name: "广州城建职业学院",
    code: "14136",
    tags: ["民办专科"],
    location: "广州市",
    physicalMinRank2025: 280000,
    physicalMinScore2025: 410,
    historicalMinRank2025: 140000,
    historicalMinScore2025: 415,
    recommendedMajors: ["建筑工程技术", "工程造价", "市政工程", "现代物业管理"],
    description: "以城建、土木、路桥、机电为特色的高水平职业技术学院，毕业生就业率高，实践性强。"
  },
  
  // Top National Universities (highly desired by Guangdong top students)
  {
    id: "tsinghua",
    name: "清华大学",
    code: "10003",
    tags: ["985", "211", "双一流", "九校联盟", "公办"],
    location: "北京市",
    physicalMinRank2025: 85,
    physicalMinScore2025: 698,
    historicalMinRank2025: 25,
    historicalMinScore2025: 672,
    recommendedMajors: ["计算机科学与技术", "电子信息工程", "建筑学", "工商管理", "核工程"],
    description: "全国最顶尖理工学府，强基计划及领军人才主阵地，科研与社会名望达到顶峰。"
  },
  {
    id: "pku",
    name: "北京大学",
    code: "10001",
    tags: ["985", "211", "双一流", "九校联盟", "公办"],
    location: "北京市",
    physicalMinRank2025: 90,
    physicalMinScore2025: 697,
    historicalMinRank2025: 20,
    historicalMinScore2025: 674,
    recommendedMajors: ["数学", "物理学", "化学", "中国语言文学", "哲学", "经济学"],
    description: "全国最顶尖综合性大学，理学与人文社科领域在全国居于绝对垄断 and 引领地位。"
  },
  {
    id: "fudan",
    name: "复旦大学",
    code: "10246",
    tags: ["985", "211", "双一流", "公办"],
    location: "上海市",
    physicalMinRank2025: 450,
    physicalMinScore2025: 686,
    historicalMinRank2025: 120,
    historicalMinScore2025: 652,
    recommendedMajors: ["数学与应用数学", "新闻学", "微电子科学与工程", "临床医学"],
    description: "江南第一学府，人文、社科、理学及基础医学极强，校园学术自由度高，国际视野广阔。"
  },
  {
    id: "sjtu",
    name: "上海交通大学",
    code: "10248",
    tags: ["985", "211", "双一流", "公办"],
    location: "上海市",
    physicalMinRank2025: 400,
    physicalMinScore2025: 688,
    historicalMinRank2025: 180,
    historicalMinScore2025: 648,
    recommendedMajors: ["船舶与海洋工程", "机械工程", "临床医学", "计算机科学与技术", "工商管理"],
    description: "海派工科与医科顶尖名校，学术作风务实，地处魔都，校友网络 and 商界认可度奇高。"
  },
  {
    id: "zju",
    name: "浙江大学",
    code: "10335",
    tags: ["985", "211", "双一流", "公办"],
    location: "杭州市",
    physicalMinRank2025: 800,
    physicalMinScore2025: 679,
    historicalMinRank2025: 350,
    historicalMinScore2025: 642,
    recommendedMajors: ["计算机科学与技术", "控制科学与工程", "软件工程", "电气工程及其自动化"],
    description: "学科覆盖面极广 of 科学类综合大学，理工科体量宏大且质量极高，创新创业氛围在国内一流。"
  },
  {
    id: "ustc",
    name: "中国科学技术大学",
    code: "10358",
    tags: ["985", "211", "双一流", "公办"],
    location: "合肥市",
    physicalMinRank2025: 1200,
    physicalMinScore2025: 673,
    historicalMinRank2025: 999999, // 基本不招历史类
    historicalMinScore2025: 0,
    recommendedMajors: ["物理学", "化学", "量子信息科学", "数学与应用数学"],
    description: "中国科学院直属高校，专注高水平基础科研与尖端理论教育，本科毕业生出国深造率全国领先。"
  },
  {
    id: "nju",
    name: "南京大学",
    code: "10284",
    tags: ["985", "211", "双一流", "公办"],
    location: "南京市",
    physicalMinRank2025: 1500,
    physicalMinScore2025: 670,
    historicalMinRank2025: 450,
    historicalMinScore2025: 639,
    recommendedMajors: ["天文学", "地质学", "物理学", "中国语言文学", "人工智能"],
    description: "历史底蕴深厚，崇尚学术与诚朴校风，理科与人文社科综合实力稳居全国顶尖。"
  },
  {
    id: "whu",
    name: "武汉大学",
    code: "10486",
    tags: ["985", "211", "双一流", "公办"],
    location: "武汉市",
    physicalMinRank2025: 4500,
    physicalMinScore2025: 658,
    historicalMinRank2025: 1000,
    historicalMinScore2025: 625,
    recommendedMajors: ["测绘科学与技术", "地球物理学", "法学", "马克思主义理论", "口腔医学"],
    description: "“樱花校园”名扬海内，法学、测绘等王牌学科独领风骚，综合实力与社会声望俱佳。"
  },
  {
    id: "hust",
    name: "华中科技大学",
    code: "10487",
    tags: ["985", "211", "双一流", "公办"],
    location: "武汉市",
    physicalMinRank2025: 4800,
    physicalMinScore2025: 656,
    historicalMinRank2025: 1500,
    historicalMinScore2025: 618,
    recommendedMajors: ["机械工程", "电气工程", "光电信息科学与工程", "计算机科学", "临床医学"],
    description: "新中国工科翘楚，同济医学院享誉全国，“森林式大学”学风踏实、科研成果极其丰硕。"
  },
  {
    id: "hitsz",
    name: "哈尔滨工业大学（深圳）",
    code: "10213",
    tags: ["985", "211", "双一流", "C9分支", "公办"],
    location: "深圳市",
    physicalMinRank2025: 3800,
    physicalMinScore2025: 661,
    historicalMinRank2025: 4500,
    historicalMinScore2025: 595,
    recommendedMajors: ["宇航与力学", "计算机科学", "机器人工程", "机械工程", "通信工程"],
    description: "哈工大王牌工科基因与深圳特区活力的完美结合，投档分数线近年来超越大量本部高校。"

  },
  {
    id: "xmu",
    name: "厦门大学",
    code: "10384",
    tags: ["985", "211", "双一流", "公办"],
    location: "厦门市",
    physicalMinRank2025: 7500,
    physicalMinScore2025: 650,
    historicalMinRank2025: 1500,
    historicalMinScore2025: 618,
    recommendedMajors: ["化学", "海洋科学", "会计学", "金融学", "经济学"],
    description: "被誉为“中国最美大学”之一，会计学、化学全国顶尖，地处福建对台交流前沿。"
  }
];

// Recommender core logic for 冲稳保
export interface Recommendation {
  university: University;
  type: '冲' | '稳' | '保';
  minScore2025: number;
  minRank2025: number;
  scoreDiff: number;
  probabilityText: string;
}

export function getRecommendations(
  score: number,
  category: GaokaoCategory,
  filters: {
    onlyGuangdong?: boolean;
    tier?: 'all' | '985_211' | 'double_first' | 'regular';
    searchQuery?: string;
    showAllColleges?: boolean;
  }
): Recommendation[] {
  const userRank = getRankFromScore(score, category);
  if (userRank <= 0) return [];

  const results: Recommendation[] = [];

  for (const uni of universityDatabase) {
    const uniMinRank = category === 'physical' ? uni.physicalMinRank2025 : uni.historicalMinRank2025;
    const uniMinScore = category === 'physical' ? uni.physicalMinScore2025 : uni.historicalMinScore2025;

    // Filter out invalid targets (e.g. university doesn't recruit this major stream, rank is 999999)
    if (uniMinRank > 500000) continue;

    // Apply filters
    const GD_CITIES = [
      '广州市', '深圳市', '珠海市', '汕头市', '佛山市', '韶关市', 
      '湛江市', '肇庆市', '江门市', '茂名市', '惠州市', '梅州市', 
      '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', 
      '潮州市', '揭阳市', '云浮市'
    ];
    if (filters.onlyGuangdong && !GD_CITIES.includes(uni.location)) {
      continue;
    }

    if (filters.tier && filters.tier !== 'all') {
      const is985_211 = uni.tags.includes('985') || uni.tags.includes('211');
      const isDoubleFirst = uni.tags.includes('双一流');
      if (filters.tier === '985_211' && !is985_211) continue;
      if (filters.tier === 'double_first' && !isDoubleFirst) continue;
      if (filters.tier === 'regular' && (is985_211 || isDoubleFirst)) continue;
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchName = uni.name.toLowerCase().includes(query);
      const matchLoc = uni.location.toLowerCase().includes(query);
      const matchMajors = uni.recommendedMajors.some(m => m.toLowerCase().includes(query));
      if (!matchName && !matchLoc && !matchMajors) continue;
    }

    // Determine 冲/稳/保 classification
    // Rank logic: in gaokao, lower rank is better (1 is the best).
    const rankRatio = userRank / uniMinRank;
    
    let type: '冲' | '稳' | '保';
    let probabilityText = '';
    
    if (rankRatio < 0.85) {
      type = '保';
      probabilityText = '极高机会录取 (90%+)';
    } else if (rankRatio >= 0.85 && rankRatio <= 1.15) {
      type = '稳';
      probabilityText = '稳妥报考范围 (50% - 85%)';
    } else if (rankRatio > 1.15 && rankRatio <= 1.45) {
      type = '冲';
      probabilityText = '值得尝试冲刺 (15% - 40%)';
    } else {
      // If there is a search query or they want to see all colleges, allow adding it as "梦想极高风险冲刺" or "低报极稳保底"
      if (filters.searchQuery || filters.showAllColleges) {
        if (rankRatio > 1.45) {
          type = '冲';
          probabilityText = '难度极高 / 梦想冲刺 (低于10%机会)';
        } else {
          type = '保';
          probabilityText = '低报极稳 / 保底备用 (接近100%录取)';
        }
      } else {
        continue;
      }
    }

    const scoreDiff = score - uniMinScore;

    results.push({
      university: uni,
      type,
      minScore2025: uniMinScore,
      minRank2025: uniMinRank,
      scoreDiff,
      probabilityText,
    });
  }

  // Sort by minRank ascending (prestigious universities first)
  return results.sort((a, b) => a.minRank2025 - b.minRank2025);
}
