import { QuestionType } from '../types';
import type { Question, VerticalQuestion } from '../types';

/** 验证竖式题：算式成立 + 不同图形不同数字 + 每位是0-9 */
function validateVertical(q: VerticalQuestion, answers: number[]): boolean {
  // 每位必须是 0-9
  if (answers.some(v => v < 0 || v > 9)) return false;

  // 不同图形必须代表不同数字
  if (new Set(answers).size !== answers.length) return false;

  // 构建符号 → 数字映射
  const map: Record<string, number> = {};
  for (let i = 0; i < q.symbols.length; i++) {
    map[q.symbols[i]] = answers[i];
  }

  // 用映射还原数字行
  const parseRow = (row: string[]): number => {
    const digits = row.map(cell => (map[cell] ?? parseInt(cell, 10)));
    return digits[0] * 10 + digits[1];
  };

  const top = parseRow(q.topRow);
  const bottom = parseRow(q.bottomRow);
  const result = parseRow(q.resultRow);

  if (q.operator === '+') {
    return top + bottom === result;
  } else {
    return top - bottom === result;
  }
}

/** 判断用户答案是否正确 */
export function checkAnswer(q: Question, answerValues: number[]): boolean {
  if (q.type === QuestionType.VERTICAL_ADD || q.type === QuestionType.VERTICAL_SUB) {
    return validateVertical(q as VerticalQuestion, answerValues);
  }
  // 其他题型：精确匹配生成的答案
  return q.answers.every((a, i) => a.answer === answerValues[i]);
}
