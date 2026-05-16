// ===== 题型枚举 =====
export const QuestionType = {
  SINGLE_SYMBOL: 1,    // ★ + ★ = 8
  MULTI_SYMBOL: 2,     // ▲ + ■ = 9, ▲ - ■ = 3
  CHAIN_REASONING: 3,  // ● + ● = ▲, ▲ + ● = 9
  SYMBOL_SUBSTITUTE: 4,// ●=3, ▲=5 → ●+▲=?
  VERTICAL_ADD: 5,     // 竖式进位加法
  VERTICAL_SUB: 6,     // 竖式退位减法
} as const;

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

// ===== 图形符号 =====
export const SYMBOLS = ['★', '▲', '■', '●', '◆', '⬟'] as const;
export type SymbolChar = (typeof SYMBOLS)[number];

// 语音朗读时用的中文名称
export const SYMBOL_NAMES: Record<string, string> = {
  '★': '五角星',
  '▲': '三角形',
  '■': '正方形',
  '●': '圆形',
  '◆': '菱形',
  '⬟': '五边形',
  '?': '问号',
};

// ===== 题目数据结构 =====
export interface SymbolAnswer {
  symbol: string;
  answer: number;
}

export interface BaseQuestion {
  type: QuestionType;
  symbols: string[];
  answers: SymbolAnswer[];
  displayText: string;
}

// 题型1：单一图形求值
export interface SingleSymbolQuestion extends BaseQuestion {
  type: typeof QuestionType.SINGLE_SYMBOL;
  expression: string;
  result: number;
}

// 题型2：多图形联立
export interface MultiSymbolQuestion extends BaseQuestion {
  type: typeof QuestionType.MULTI_SYMBOL;
  equations: string[];
}

// 题型3：链式推理
export interface ChainReasoningQuestion extends BaseQuestion {
  type: typeof QuestionType.CHAIN_REASONING;
  equations: string[];
}

// 题型4：图形替代数字
export interface SubstituteQuestion extends BaseQuestion {
  type: typeof QuestionType.SYMBOL_SUBSTITUTE;
  givenValues: SymbolAnswer[];
  expression: string;
}

// 题型5/6：竖式
export interface VerticalQuestion extends BaseQuestion {
  type: typeof QuestionType.VERTICAL_ADD | typeof QuestionType.VERTICAL_SUB;
  topRow: string[];
  bottomRow: string[];
  resultRow: string[];
  operator: '+' | '-';
}

export type Question =
  | SingleSymbolQuestion
  | MultiSymbolQuestion
  | ChainReasoningQuestion
  | SubstituteQuestion
  | VerticalQuestion;

// ===== 关卡配置 =====
export interface LevelConfig {
  id: number;
  zone: number;
  questionTypes: QuestionType[];
  maxNumber: number;
  isBoss: boolean;
}

// ===== 游戏状态 =====
export interface LevelState {
  unlocked: boolean;
  stars: 0 | 1 | 2 | 3;
  bestCombo: number;
}

export interface GameSave {
  levels: Record<number, LevelState>;
  prizes: number[];  // 已收集奖品的关卡 ID 列表
}

// ===== 奖品定义 =====
export const LEVEL_PRIZES: Record<number, string> = {
  1: '🌱', 2: '🌿', 3: '🌳',
  4: '🐿️', 5: '🦊', 6: '🦉',
  7: '⛰️', 8: '🏔️', 9: '🗻',
  10: '🐟', 11: '🐬', 12: '🐳',
  13: '🏰', 14: '🛡️', 15: '👑',
  16: '⭐', 17: '🌟', 18: '🏆',
};

// ===== 游戏会话 =====
export interface GameSession {
  levelId: number;
  questions: Question[];
  currentIndex: number;
  correctCount: number;
  combo: number;
  maxCombo: number;
  answers: (number | null)[][];
}
