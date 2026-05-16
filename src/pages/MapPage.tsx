import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import styles from './MapPage.module.css';

const ZONES = [
  { id: 1, name: '数字草原', icon: '🌱', color: '#7ECB76' },
  { id: 2, name: '图形森林', icon: '🌲', color: '#5BA0B9' },
  { id: 3, name: '推理山丘', icon: '🏔️', color: '#E8A87C' },
  { id: 4, name: '加法河流', icon: '🌊', color: '#6CB4EE' },
  { id: 5, name: '减法城堡', icon: '🏰', color: '#B088C8' },
  { id: 6, name: '综合星空', icon: '⭐', color: '#4A4A7A' },
];

export default function MapPage() {
  const game = useGame();
  const navigate = useNavigate();

  const totalStars = Object.values(game.save.levels).reduce((sum, l) => sum + l.stars, 0);

  const getStars = (unlocked: boolean, stars: number) => {
    if (!unlocked) return '🔒';
    if (stars === 0) return '◌';
    return '★'.repeat(stars) + '☆'.repeat(3 - stars);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← 返回</button>
        <div className={styles.starBadge}>⭐ {totalStars} / 54</div>
      </div>

      <div className={styles.titleRow}>
        <h2 className={styles.mapTitle}>冒险地图</h2>
        <button className={styles.collectionBtn} onClick={() => navigate('/collection')}>
          🎁 奖品册
        </button>
      </div>

      <div className={styles.map}>
        {ZONES.map((zone, zi) => {
          const levels = [1, 2, 3].map(i => {
            const id = (zi) * 3 + i;
            const ls = game.save.levels[id] || { unlocked: false, stars: 0 as 0|1|2|3, bestCombo: 0 };
            return { id, ...ls };
          });

          return (
            <div key={zone.id} className={styles.zone}>
              <div className={styles.zoneLabel} style={{ color: zone.color }}>
                <span className={styles.zoneIcon}>{zone.icon}</span>
                <span>{zone.name}</span>
              </div>
              <div className={styles.levelRow}>
                {levels.map((lv, li) => {
                  const isBoss = li === 2;
                  return (
                    <div key={lv.id} className={styles.levelWrap}>
                      {li > 0 && <div className={`${styles.connector} ${lv.unlocked ? styles.active : ''}`} />}
                      <button
                        className={`${styles.levelNode} ${isBoss ? styles.boss : ''} ${lv.unlocked ? styles.unlocked : styles.locked}`}
                        style={{ borderColor: lv.unlocked ? zone.color : '#ccc' }}
                        disabled={!lv.unlocked}
                        onClick={() => navigate(`/game/${lv.id}`)}
                      >
                        <span className={styles.levelNum}>{lv.id}</span>
                        <span className={styles.levelStars}>{getStars(lv.unlocked, lv.stars)}</span>
                        {isBoss && <span className={styles.bossCrown}>👑</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
