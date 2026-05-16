import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.stars}>
        {['★', '▲', '●', '◆', '■', '⬟'].map((s, i) => (
          <span key={i} className={styles.floating} style={{ animationDelay: `${i * 0.3}s`, left: `${15 + i * 12}%` }}>
            {s}
          </span>
        ))}
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>图形算式大冒险</h1>
        <p className={styles.subtitle}>一年级数学闯关游戏</p>

        <div className={styles.mascot}>
          <span className={styles.mascotIcon}>🦊</span>
          <p>小朋友，你能解开图形算式的秘密吗？</p>
        </div>

        <button className={styles.startBtn} onClick={() => navigate('/map')}>
          开始冒险
        </button>
      </div>
    </div>
  );
}
