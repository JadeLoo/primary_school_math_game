import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { useTTS } from '../hooks/useTTS';
import ComboEffect from '../components/ComboEffect';
import { QuestionType } from '../types';
import type { Question, SingleSymbolQuestion, MultiSymbolQuestion, ChainReasoningQuestion, SubstituteQuestion, VerticalQuestion } from '../types';
import styles from './GamePage.module.css';

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const levelId = Number(id);
  const navigate = useNavigate();
  const { session, save, startLevel, answerQuestion, nextQuestion } = useGame();
  const { speak } = useTTS();

  const [inputs, setInputs] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showCombo, setShowCombo] = useState(false);

  // 初始化关卡
  useEffect(() => {
    if (!id || isNaN(levelId) || levelId < 1 || levelId > 18) {
      navigate('/map');
      return;
    }
    const levelState = save.levels[levelId];
    if (!levelState?.unlocked) {
      navigate('/map');
      return;
    }
    if (!session || session.levelId !== levelId) {
      startLevel(levelId);
    }
  }, [levelId]);

  // 加载新题目时初始化输入框并朗读
  useEffect(() => {
    if (!session) return;
    const q = session.questions[session.currentIndex];
    if (q) {
      setInputs(new Array(q.symbols.length).fill(''));
      setFocusedIndex(0);
      setFeedback(null);
      setSubmitted(false);
      speak(q.displayText);
    }
  }, [session?.currentIndex, session?.questions]);

  const currentQuestion: Question | null = session?.questions[session.currentIndex] ?? null;

  const handleInput = (idx: number, value: string) => {
    if (submitted) return;
    const newInputs = [...inputs];
    newInputs[idx] = value;
    setInputs(newInputs);
  };

  const handleKeypad = (digit: string) => {
    if (submitted) return;
    const cur = inputs[focusedIndex];
    if (cur.length < 2) {
      handleInput(focusedIndex, cur + digit);
    }
  };

  const handleDelete = () => {
    if (submitted) return;
    const cur = inputs[focusedIndex];
    if (cur.length > 0) {
      handleInput(focusedIndex, cur.slice(0, -1));
    }
  };

  const handleSubmit = useCallback(() => {
    if (submitted || !session) return;
    // 检查是否全部填写
    if (inputs.some(v => v === '')) return;

    const answerValues = inputs.map(Number);
    const isCorrect = answerQuestion(answerValues);
    setSubmitted(true);

    if (isCorrect) {
      setFeedback('correct');
      // 连击动画
      const newCombo = session.combo + 1;
      if (newCombo >= 3) {
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 1500);
      }
    } else {
      setFeedback('wrong');
    }
  }, [submitted, session, inputs, answerQuestion]);

  const handleNext = () => {
    if (!session) return;
    if (session.currentIndex >= 2) {
      navigate(`/result/${levelId}`);
    } else {
      nextQuestion();
    }
  };

  if (!session || !currentQuestion) {
    return <div className={styles.page}><p>加载中...</p></div>;
  }

  const progress = session.currentIndex + 1;
  const isLastQuestion = session.currentIndex >= 2;

  return (
    <div className={styles.page}>
      {/* 顶部栏 */}
      <div className={styles.topBar}>
        <button className={styles.exitBtn} onClick={() => navigate('/map')}>✕</button>
        <div className={styles.progress}>
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} className={`${styles.dot} ${i < progress ? styles.dotDone : ''} ${i === session.currentIndex ? styles.dotCurrent : ''}`} />
          ))}
        </div>
        <span className={styles.progressText}>{progress}/3</span>
      </div>

      {/* 连击动画 */}
      {showCombo && (
        <ComboEffect combo={session.combo + 1} onComplete={() => setShowCombo(false)} />
      )}

      {/* 题目卡片 */}
      <div className={styles.card}>
        <QuestionDisplay question={currentQuestion} />
      </div>

      {/* 答案输入区 */}
      <div className={styles.answerSection}>
        {currentQuestion.symbols.map((sym, idx) => (
          <div key={idx} className={styles.inputRow} onClick={() => { if (!submitted) setFocusedIndex(idx); }}>
            <span className={styles.symbolLabel}>{sym} =</span>
            <input
              className={`${styles.answerInput} ${idx === focusedIndex && !submitted ? styles.inputFocused : ''} ${submitted ? (feedback === 'correct' ? styles.inputCorrect : styles.inputWrong) : ''}`}
              type="text"
              value={inputs[idx]}
              readOnly
              maxLength={2}
            />
          </div>
        ))}
      </div>

      {/* 反馈 */}
      {submitted && (
        <div className={`${styles.feedback} ${feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong}`}>
          {feedback === 'correct' ? '✓ 答对了！' : `✗ 正确答案：${currentQuestion.answers.map(a => `${a.symbol}=${a.answer}`).join('，')}`}
        </div>
      )}

      {/* 数字键盘 */}
      <div className={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <button key={d} className={styles.key} onClick={() => handleKeypad(String(d))} disabled={submitted}>
            {d}
          </button>
        ))}
        <button className={styles.key} onClick={handleDelete} disabled={submitted}>⌫</button>
        <button key={0} className={styles.key} onClick={() => handleKeypad('0')} disabled={submitted}>0</button>
        {!submitted ? (
          <button className={`${styles.key} ${styles.keySubmit}`} onClick={handleSubmit}>确认</button>
        ) : (
          <button className={`${styles.key} ${styles.keyNext}`} onClick={handleNext}>
            {isLastQuestion ? '看结果' : '下一题'}
          </button>
        )}
      </div>

      {/* 语音重播按钮 */}
      <button className={styles.voiceBtn} onClick={() => speak(currentQuestion.displayText)}>
        🔊 再读一遍
      </button>
    </div>
  );
}

// ===== 题目渲染组件 =====
function QuestionDisplay({ question }: { question: Question }) {
  switch (question.type) {
    case QuestionType.SINGLE_SYMBOL:
      return <SingleSymbolView q={question} />;
    case QuestionType.MULTI_SYMBOL:
      return <MultiSymbolView q={question} />;
    case QuestionType.CHAIN_REASONING:
      return <ChainReasoningView q={question} />;
    case QuestionType.SYMBOL_SUBSTITUTE:
      return <SubstituteView q={question} />;
    case QuestionType.VERTICAL_ADD:
    case QuestionType.VERTICAL_SUB:
      return <VerticalView q={question} />;
    default:
      return <p>未知题型</p>;
  }
}

function SingleSymbolView({ q }: { q: SingleSymbolQuestion }) {
  return (
    <div className={styles.question}>
      <div className={styles.expressionLarge}>{q.expression} = {q.result}</div>
      <p className={styles.askText}>（{q.symbols[0]} 等于几？）</p>
    </div>
  );
}

function MultiSymbolView({ q }: { q: MultiSymbolQuestion }) {
  return (
    <div className={styles.question}>
      {q.equations.map((eq, i) => (
        <div key={i} className={styles.expressionLarge}>{eq}</div>
      ))}
      <p className={styles.askText}>（求 {q.symbols.join(' 和 ')} 的值）</p>
    </div>
  );
}

function ChainReasoningView({ q }: { q: ChainReasoningQuestion }) {
  return (
    <div className={styles.question}>
      {q.equations.map((eq, i) => (
        <div key={i} className={styles.expressionLarge}>{eq}</div>
      ))}
      <p className={styles.askText}>（求 {q.symbols.join(' 和 ')} 的值）</p>
    </div>
  );
}

function SubstituteView({ q }: { q: SubstituteQuestion }) {
  return (
    <div className={styles.question}>
      <div className={styles.givenValues}>
        {q.givenValues.map((g, i) => (
          <span key={i} className={styles.givenItem}>{g.symbol} = {g.answer}</span>
        ))}
      </div>
      <div className={styles.expressionLarge}>{q.expression}</div>
    </div>
  );
}

function VerticalView({ q }: { q: VerticalQuestion }) {
  const op = q.operator;
  return (
    <div className={styles.question}>
      <div className={styles.vertical}>
        <div className={styles.verticalRow}>
          <span className={styles.verticalPad}>&nbsp;&nbsp;</span>
          {q.topRow.map((cell, i) => (
            <span key={i} className={styles.verticalCell}>{cell}</span>
          ))}
        </div>
        <div className={styles.verticalRow}>
          <span className={styles.verticalOp}>{op}</span>
          {q.bottomRow.map((cell, i) => (
            <span key={i} className={styles.verticalCell}>{cell}</span>
          ))}
        </div>
        <div className={styles.verticalLine} />
        <div className={styles.verticalRow}>
          <span className={styles.verticalPad}>&nbsp;&nbsp;</span>
          {q.resultRow.map((cell, i) => (
            <span key={i} className={styles.verticalCell}>{cell}</span>
          ))}
        </div>
      </div>
      <p className={styles.askText}>（求图形代表几？）</p>
    </div>
  );
}
