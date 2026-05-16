import {
  QuestionType, SYMBOLS,
} from '../types';
import type {
  Question, SymbolChar,
  SingleSymbolQuestion, MultiSymbolQuestion, ChainReasoningQuestion,
  SubstituteQuestion, VerticalQuestion, LevelConfig,
} from '../types';

// ===== 工具函数 =====
const rand = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const pickN = <T>(arr: readonly T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

// ===== 题型1：单一图形求值 =====
function genSingleSymbol(maxNumber: number): SingleSymbolQuestion {
  const symbol = pick(SYMBOLS);
  const count = rand(2, 3); // 2个或3个图形
  const value = rand(1, Math.floor(maxNumber / count));
  const op = pick(['+', '-'] as const);

  let result: number;
  let expression: string;

  if (op === '+') {
    result = value * count;
    expression = Array(count).fill(symbol).join(' + ');
  } else {
    // 减法：第一个数 = result + value, 然后是 - symbol - symbol ...
    // 比如 ▲ - ★ - ★ = ?   即 v1 - (count-1)*value = value
    // v1 = value * count
    const v1 = value * count;
    result = value;
    expression = `${v1} - ${Array(count - 1).fill(symbol).join(' - ')}`;
  }

  const displayText = `${expression} = ${result}，求 ${symbol} 等于几？`;

  return {
    type: QuestionType.SINGLE_SYMBOL,
    symbols: [symbol],
    answers: [{ symbol, answer: value }],
    displayText,
    expression,
    result,
  };
}

// ===== 题型2：多图形联立 =====
function genMultiSymbol(maxNumber: number): MultiSymbolQuestion {
  const [s1, s2] = pickN(SYMBOLS, 2);
  const v1 = rand(3, Math.floor(maxNumber * 0.6));
  const v2 = rand(1, v1 - 1); // v1 > v2，保证差值 > 0

  const sum = v1 + v2;
  const diff = v1 - v2;

  const equations = [
    `${s1} + ${s2} = ${sum}`,
    `${s1} - ${s2} = ${diff}`,
  ];

  const displayText = `${s1}加${s2}等于${sum}，${s1}减${s2}等于${diff}，求${s1}和${s2}各等于几？`;

  return {
    type: QuestionType.MULTI_SYMBOL,
    symbols: [s1, s2],
    answers: [
      { symbol: s1, answer: v1 },
      { symbol: s2, answer: v2 },
    ],
    displayText,
    equations,
  };
}

// ===== 题型3：链式推理 =====
function genChainReasoning(maxNumber: number): ChainReasoningQuestion {
  const [s1, s2] = pickN(SYMBOLS, 2);
  // 反向构造：s1 + s1 = s2,  s2 + s1 = result
  // 即 2*v + v = 3v = result
  const v = rand(2, Math.floor(maxNumber / 3));
  const result = 3 * v;

  const equations = [
    `${s1} + ${s1} = ${s2}`,
    `${s2} + ${s1} = ${result}`,
  ];

  const displayText = `已知${s1}加${s1}等于${s2}，${s2}加${s1}等于${result}，求${s1}和${s2}各等于几？`;

  return {
    type: QuestionType.CHAIN_REASONING,
    symbols: [s1, s2],
    answers: [
      { symbol: s1, answer: v },
      { symbol: s2, answer: 2 * v },
    ],
    displayText,
    equations,
  };
}

// ===== 题型4：图形替代数字 =====
function genSubstitute(maxNumber: number): SubstituteQuestion {
  const count = rand(2, 3);
  const syms = pickN(SYMBOLS, count);
  const values: number[] = syms.map(() => rand(1, maxNumber));

  // 构建一个包含这些图形的算式
  let expression = '';
  let answer = values[0];

  expression += syms[0];
  for (let i = 1; i < count; i++) {
    // 只有减法后结果仍 ≥1 才允许用减号，避免负数
    const canSubtract = answer - values[i] >= 1;
    const op: '+' | '-' = canSubtract && Math.random() < 0.5 ? '-' : '+';
    expression += ` ${op} ${syms[i]}`;
    if (op === '+') {
      answer += values[i];
    } else {
      answer -= values[i];
    }
  }

  const givenValues = syms.map((s, i) => ({ symbol: s, answer: values[i] }));
  const givenText = givenValues.map(g => `${g.symbol}=${g.answer}`).join('，');
  const displayText = `已知${givenText}，求${expression}等于几？`;

  return {
    type: QuestionType.SYMBOL_SUBSTITUTE,
    symbols: ['?'],
    answers: [{ symbol: '?', answer }],
    displayText,
    givenValues,
    expression: `${expression} = ?`,
  };
}

// ===== 题型5：竖式进位加法 =====
function genVerticalAdd(): VerticalQuestion {
  // 生成两个两位数，确保个位之和 >= 10
  const tens1 = rand(1, 5);
  const tens2 = rand(1, 8 - tens1);
  const ones1 = rand(1, 9);
  let ones2 = rand(1, 9);
  // 确保进位
  while (ones1 + ones2 < 10) {
    ones2 = rand(1, 9);
  }

  const a = tens1 * 10 + ones1;
  const b = tens2 * 10 + ones2;
  const result = a + b;

  const resultTens = Math.floor(result / 10);
  const resultOnes = result % 10;

  // 随机选择1-2个数位替换为图形
  const positions: { row: 'top' | 'bottom'; col: 'tens' | 'ones' }[] = [
    { row: 'top', col: 'tens' },
    { row: 'top', col: 'ones' },
    { row: 'bottom', col: 'tens' },
    { row: 'bottom', col: 'ones' },
  ];
  const replaceCount = rand(1, 2);
  const replaced = pickN(positions, replaceCount);
  const usedSymbols = pickN(SYMBOLS, replaceCount);

  const topRow = [String(tens1), String(ones1)];
  const bottomRow = [String(tens2), String(ones2)];
  const resultRow = [String(resultTens), String(resultOnes)];

  const answers: { symbol: SymbolChar; answer: number }[] = [];

  replaced.forEach((pos, i) => {
    const sym = usedSymbols[i];
    let originalValue: number;
    if (pos.row === 'top') {
      originalValue = pos.col === 'tens' ? tens1 : ones1;
      topRow[pos.col === 'tens' ? 0 : 1] = sym;
    } else {
      originalValue = pos.col === 'tens' ? tens2 : ones2;
      bottomRow[pos.col === 'tens' ? 0 : 1] = sym;
    }
    answers.push({ symbol: sym, answer: originalValue });
  });

  const displayText = `竖式计算：${topRow.join('')}加${bottomRow.join('')}等于${resultRow.join('')}，求图形代表几？`;

  return {
    type: QuestionType.VERTICAL_ADD,
    symbols: usedSymbols,
    answers,
    displayText,
    topRow,
    bottomRow,
    resultRow,
    operator: '+',
  };
}

// ===== 题型6：竖式退位减法 =====
function genVerticalSub(): VerticalQuestion {
  // 生成两个两位数，确保个位需要退位
  let a = rand(30, 99);
  let b = rand(10, a - 1);

  // 确保个位需要退位：a的个位 < b的个位
  let tries = 0;
  while ((a % 10) >= (b % 10) && tries < 50) {
    a = rand(30, 99);
    b = rand(10, a - 1);
    tries++;
  }

  const result = a - b;
  const aTens = Math.floor(a / 10);
  const aOnes = a % 10;
  const bTens = Math.floor(b / 10);
  const bOnes = b % 10;
  const resultTens = Math.floor(result / 10);
  const resultOnes = result % 10;

  const positions: { row: 'top' | 'bottom'; col: 'tens' | 'ones' }[] = [
    { row: 'top', col: 'tens' },
    { row: 'top', col: 'ones' },
    { row: 'bottom', col: 'tens' },
    { row: 'bottom', col: 'ones' },
  ];
  const replaceCount = rand(1, 2);
  const replaced = pickN(positions, replaceCount);
  const usedSymbols = pickN(SYMBOLS, replaceCount);

  const topRow = [String(aTens), String(aOnes)];
  const bottomRow = [String(bTens), String(bOnes)];
  const resultRow = [String(resultTens), String(resultOnes)];

  const answers: { symbol: SymbolChar; answer: number }[] = [];

  replaced.forEach((pos, i) => {
    const sym = usedSymbols[i];
    let originalValue: number;
    if (pos.row === 'top') {
      originalValue = pos.col === 'tens' ? aTens : aOnes;
      topRow[pos.col === 'tens' ? 0 : 1] = sym;
    } else {
      originalValue = pos.col === 'tens' ? bTens : bOnes;
      bottomRow[pos.col === 'tens' ? 0 : 1] = sym;
    }
    answers.push({ symbol: sym, answer: originalValue });
  });

  const displayText = `竖式计算：${topRow.join('')}减${bottomRow.join('')}等于${resultRow.join('')}，求图形代表几？`;

  return {
    type: QuestionType.VERTICAL_SUB,
    symbols: usedSymbols,
    answers,
    displayText,
    topRow,
    bottomRow,
    resultRow,
    operator: '-',
  };
}

// ===== 关卡配置 =====
export const LEVEL_CONFIGS: LevelConfig[] = [
  // Zone 1: 数字草原 — 题型1、4
  { id: 1, zone: 1, questionTypes: [QuestionType.SINGLE_SYMBOL, QuestionType.SYMBOL_SUBSTITUTE], maxNumber: 10, isBoss: false },
  { id: 2, zone: 1, questionTypes: [QuestionType.SINGLE_SYMBOL, QuestionType.SYMBOL_SUBSTITUTE], maxNumber: 10, isBoss: false },
  { id: 3, zone: 1, questionTypes: [QuestionType.SINGLE_SYMBOL, QuestionType.SYMBOL_SUBSTITUTE], maxNumber: 15, isBoss: true },
  // Zone 2: 图形森林 — 题型2
  { id: 4, zone: 2, questionTypes: [QuestionType.MULTI_SYMBOL], maxNumber: 15, isBoss: false },
  { id: 5, zone: 2, questionTypes: [QuestionType.MULTI_SYMBOL], maxNumber: 20, isBoss: false },
  { id: 6, zone: 2, questionTypes: [QuestionType.MULTI_SYMBOL], maxNumber: 20, isBoss: true },
  // Zone 3: 推理山丘 — 题型3
  { id: 7, zone: 3, questionTypes: [QuestionType.CHAIN_REASONING], maxNumber: 15, isBoss: false },
  { id: 8, zone: 3, questionTypes: [QuestionType.CHAIN_REASONING], maxNumber: 20, isBoss: false },
  { id: 9, zone: 3, questionTypes: [QuestionType.CHAIN_REASONING], maxNumber: 24, isBoss: true },
  // Zone 4: 加法河流 — 题型5
  { id: 10, zone: 4, questionTypes: [QuestionType.VERTICAL_ADD], maxNumber: 99, isBoss: false },
  { id: 11, zone: 4, questionTypes: [QuestionType.VERTICAL_ADD], maxNumber: 99, isBoss: false },
  { id: 12, zone: 4, questionTypes: [QuestionType.VERTICAL_ADD], maxNumber: 99, isBoss: true },
  // Zone 5: 减法城堡 — 题型6
  { id: 13, zone: 5, questionTypes: [QuestionType.VERTICAL_SUB], maxNumber: 99, isBoss: false },
  { id: 14, zone: 5, questionTypes: [QuestionType.VERTICAL_SUB], maxNumber: 99, isBoss: false },
  { id: 15, zone: 5, questionTypes: [QuestionType.VERTICAL_SUB], maxNumber: 99, isBoss: true },
  // Zone 6: 综合星空 — 全部题型
  { id: 16, zone: 6, questionTypes: [QuestionType.SINGLE_SYMBOL, QuestionType.MULTI_SYMBOL, QuestionType.CHAIN_REASONING, QuestionType.SYMBOL_SUBSTITUTE, QuestionType.VERTICAL_ADD, QuestionType.VERTICAL_SUB], maxNumber: 50, isBoss: false },
  { id: 17, zone: 6, questionTypes: [QuestionType.SINGLE_SYMBOL, QuestionType.MULTI_SYMBOL, QuestionType.CHAIN_REASONING, QuestionType.SYMBOL_SUBSTITUTE, QuestionType.VERTICAL_ADD, QuestionType.VERTICAL_SUB], maxNumber: 80, isBoss: false },
  { id: 18, zone: 6, questionTypes: [QuestionType.SINGLE_SYMBOL, QuestionType.MULTI_SYMBOL, QuestionType.CHAIN_REASONING, QuestionType.SYMBOL_SUBSTITUTE, QuestionType.VERTICAL_ADD, QuestionType.VERTICAL_SUB], maxNumber: 100, isBoss: true },
];

// ===== 题目生成器工厂 =====
const GENERATORS: Record<QuestionType, (maxNumber: number) => Question> = {
  [QuestionType.SINGLE_SYMBOL]: genSingleSymbol,
  [QuestionType.MULTI_SYMBOL]: genMultiSymbol,
  [QuestionType.CHAIN_REASONING]: genChainReasoning,
  [QuestionType.SYMBOL_SUBSTITUTE]: genSubstitute,
  [QuestionType.VERTICAL_ADD]: genVerticalAdd,
  [QuestionType.VERTICAL_SUB]: genVerticalSub,
};

/** 为一关生成8道题 */
export function generateQuestions(config: LevelConfig): Question[] {
  const questions: Question[] = [];
  for (let i = 0; i < 3; i++) {
    const qType = pick(config.questionTypes);
    const q = GENERATORS[qType](config.maxNumber);
    questions.push(q);
  }
  return questions;
}
