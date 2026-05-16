import { useCallback } from 'react';
import { SYMBOL_NAMES } from '../types';

/** 将文本中的符号替换为中文词语，确保语音引擎正确朗读 */
export function symbolsToSpeech(text: string): string {
  let result = text;
  // 图形符号 → 中文名称
  for (const [sym, name] of Object.entries(SYMBOL_NAMES)) {
    result = result.replaceAll(sym, name);
  }
  // 运算符 → 中文
  result = result.replaceAll('-', '减');
  result = result.replaceAll('+', '加');
  result = result.replaceAll('=', '等于');
  // 避免"几"被读成第一声 jī，改用"多少"
  result = result.replaceAll('几', '多少');
  return result;
}

export function useTTS() {
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const spoken = symbolsToSpeech(text);
    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak };
}
