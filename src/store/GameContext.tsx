import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { GameSave, GameSession, Question } from '../types';
import { LEVEL_CONFIGS, generateQuestions } from '../engine/generator';
import { checkAnswer } from '../engine/validator';

const SAVE_KEY = 'math_game_save';

// ===== 初始化存档 =====
function loadSave(): GameSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { levels: {}, prizes: [] };
}

function persistSave(save: GameSave): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

function buildInitialState(): State {
  const save = loadSave();
  if (!save.levels[1]) {
    save.levels[1] = { unlocked: true, stars: 0, bestCombo: 0 };
  }
  if (!save.prizes) {
    save.prizes = [];
  }
  persistSave(save);
  return { save, session: null };
}

// ===== Actions =====
type Action =
  | { type: 'START_LEVEL'; levelId: number; questions: Question[] }
  | { type: 'ANSWER_QUESTION'; answerValues: number[]; isCorrect: boolean }
  | { type: 'NEXT_QUESTION' }
  | { type: 'FINISH_LEVEL'; stars: 0 | 1 | 2 | 3 }
  | { type: 'RESET' };

interface State {
  save: GameSave;
  session: GameSession | null;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_LEVEL': {
      return {
        ...state,
        session: {
          levelId: action.levelId,
          questions: action.questions,
          currentIndex: 0,
          correctCount: 0,
          combo: 0,
          maxCombo: 0,
          answers: [],
        },
      };
    }
    case 'ANSWER_QUESTION': {
      if (!state.session) return state;
      const combo = action.isCorrect ? state.session.combo + 1 : 0;
      return {
        ...state,
        session: {
          ...state.session,
          correctCount: state.session.correctCount + (action.isCorrect ? 1 : 0),
          combo,
          maxCombo: Math.max(state.session.maxCombo, combo),
          answers: [...state.session.answers, action.answerValues],
        },
      };
    }
    case 'NEXT_QUESTION': {
      if (!state.session) return state;
      return {
        ...state,
        session: {
          ...state.session,
          currentIndex: state.session.currentIndex + 1,
        },
      };
    }
    case 'FINISH_LEVEL': {
      if (!state.session) return state;
      const levelId = state.session.levelId;
      const oldLevel = state.save.levels[levelId] || { unlocked: true, stars: 0, bestCombo: 0 };
      const newStars = Math.max(oldLevel.stars, action.stars) as 0 | 1 | 2 | 3;
      const newBestCombo = Math.max(oldLevel.bestCombo, state.session.maxCombo);

      const newLevels = { ...state.save.levels };
      newLevels[levelId] = { unlocked: true, stars: newStars, bestCombo: newBestCombo };

      // 通关（stars >= 1）则解锁下一关 + 收集奖品
      if (action.stars >= 1 && levelId < 18) {
        if (!newLevels[levelId + 1]) {
          newLevels[levelId + 1] = { unlocked: true, stars: 0, bestCombo: 0 };
        } else {
          newLevels[levelId + 1] = { ...newLevels[levelId + 1], unlocked: true };
        }
      }

      const prizes = state.save.prizes || [];
      const newPrizes = action.stars >= 1 && !prizes.includes(levelId)
        ? [...prizes, levelId]
        : prizes;

      const newSave: GameSave = { levels: newLevels, prizes: newPrizes };
      persistSave(newSave);

      return { ...state, save: newSave, session: null };
    }
    case 'RESET': {
      const resetSave: GameSave = {
        levels: { 1: { unlocked: true, stars: 0, bestCombo: 0 } },
        prizes: [],
      };
      persistSave(resetSave);
      return { save: resetSave, session: null };
    }
    default:
      return state;
  }
}

// ===== Context =====
interface GameContextValue {
  save: GameSave;
  session: GameSession | null;
  startLevel: (levelId: number) => void;
  answerQuestion: (answerValues: number[]) => boolean;
  nextQuestion: () => void;
  finishLevel: (stars: 0 | 1 | 2 | 3) => void;
  resetProgress: () => void;
  getLevelConfig: (id: number) => typeof LEVEL_CONFIGS[0];
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, buildInitialState);

  const startLevel = useCallback((levelId: number) => {
    const config = LEVEL_CONFIGS.find(c => c.id === levelId);
    if (!config) return;
    const questions = generateQuestions(config);
    dispatch({ type: 'START_LEVEL', levelId, questions });
  }, []);

  const answerQuestion = useCallback((answerValues: number[]): boolean => {
    if (!state.session) return false;
    const q = state.session.questions[state.session.currentIndex];
    const isCorrect = checkAnswer(q, answerValues);
    dispatch({ type: 'ANSWER_QUESTION', answerValues, isCorrect });
    return isCorrect;
  }, [state.session]);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const finishLevel = useCallback((stars: 0 | 1 | 2 | 3) => {
    dispatch({ type: 'FINISH_LEVEL', stars });
  }, []);

  const resetProgress = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const getLevelConfig = useCallback((id: number) => {
    return LEVEL_CONFIGS.find(c => c.id === id) || LEVEL_CONFIGS[0];
  }, []);

  return (
    <GameContext.Provider value={{
      save: state.save,
      session: state.session,
      startLevel,
      answerQuestion,
      nextQuestion,
      finishLevel,
      resetProgress,
      getLevelConfig,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
