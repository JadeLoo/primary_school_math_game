import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import styles from './ResultPage.module.css';

const ENCOURAGEMENTS: Record<number, string> = {
  3: '太棒了！你是数学小天才！🌟',
  2: '真厉害！继续加油哦！👍',
  1: '不错！再试一次会更好！💪',
  0: '别灰心，多多练习就好！🤗',
};

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const levelId = Number(id);
  const navigate = useNavigate();
  const { save, session, finishLevel } = useGame();

  const [stars, setStars] = useState<0 | 1 | 2 | 3>(0);
  const [animated, setAnimated] = useState(false);
  const didSaveRef = useRef(false);
  const [savedStats] = useState(() => ({
    correctCount: session?.correctCount ?? 0,
    maxCombo: session?.maxCombo ?? 0,
  }));

  useEffect(() => {
    if (!id || isNaN(levelId) || levelId < 1 || levelId > 18) {
      navigate('/map');
      return;
    }

    if (didSaveRef.current) return;

    if (session && session.levelId === levelId) {
      const correct = session.correctCount;
      let s: 0 | 1 | 2 | 3 = 0;
      if (correct >= 3) s = 3;
      else if (correct >= 2) s = 2;
      else if (correct >= 1) s = 1;
      else s = 0;
      setStars(s);
      if (s > 0) {
        didSaveRef.current = true;
        finishLevel(s);
      }
    } else {
      const ls = save.levels[levelId];
      if (ls) {
        setStars(ls.stars);
      }
    }

    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, [levelId, session, save, finishLevel, navigate]);

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>第 {levelId} 关 完成！</h2>

      {/* 星星展示 */}
      <div className={styles.starsRow}>
        {[1, 2, 3].map(i => (
          <span
            key={i}
            className={`${styles.star} ${animated && i <= stars ? styles.starEarned : styles.starEmpty}`}
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            {i <= stars ? '★' : '☆'}
          </span>
        ))}
      </div>

      {/* 统计数据 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{savedStats.correctCount}</span>
          <span className={styles.statLabel}>答对</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>{savedStats.maxCombo}</span>
          <span className={styles.statLabel}>最高连击</span>
        </div>
      </div>

      {/* 鼓励语 */}
      <p className={styles.encouragement}>{ENCOURAGEMENTS[stars]}</p>

      {/* 按钮组 */}
      <div className={styles.buttons}>
        {stars === 0 ? (
          <button className={styles.btnRetry} onClick={() => navigate(`/game/${levelId}`)}>
            再试一次
          </button>
        ) : (
          <>
            <button className={styles.btnRetry} onClick={() => navigate(`/game/${levelId}`)}>
              再玩一次
            </button>
            {levelId < 18 && (
              <button className={styles.btnNext} onClick={() => navigate(`/game/${levelId + 1}`)}>
                下一关 →
              </button>
            )}
          </>
        )}
        <button className={styles.btnMap} onClick={() => navigate('/map')}>
          返回地图
        </button>
      </div>
    </div>
  );
}
