import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { LEVEL_PRIZES } from '../types';
import styles from './CollectionPage.module.css';

const ZONE_NAMES = ['数字草原', '图形森林', '推理山丘', '加法河流', '减法城堡', '综合星空'];

export default function CollectionPage() {
  const navigate = useNavigate();
  const { save } = useGame();
  const collected = save.prizes || [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/map')}>← 返回地图</button>
        <span className={styles.count}>{collected.length} / 18</span>
      </div>

      <h2 className={styles.title}>奖品收集册</h2>

      <div className={styles.grid}>
        {Array.from({ length: 18 }, (_, i) => {
          const levelId = i + 1;
          const zoneIdx = Math.floor(i / 3);
          const earned = collected.includes(levelId);
          return (
            <div
              key={levelId}
              className={`${styles.prizeCard} ${earned ? styles.earned : styles.locked}`}
            >
              <span className={styles.prizeIcon}>
                {earned ? LEVEL_PRIZES[levelId] : '🔒'}
              </span>
              <span className={styles.prizeLevel}>
                第{levelId}关
              </span>
              <span className={styles.prizeZone}>
                {ZONE_NAMES[zoneIdx]}
              </span>
              {earned && <span className={styles.earnedBadge}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
