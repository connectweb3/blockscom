import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.background}>
                <div className={`${styles.floating} ${styles.float1}`} />
                <div className={`${styles.floating} ${styles.float2}`} />
            </div>

            <div className={styles.content}>
                <div className={styles.badge}>New Collection Drop</div>
                <h1 className={styles.title}>
                    Discover Premium <br />
                    <span className="text-gradient">Digital Art Collections</span>
                </h1>
                <p className={styles.description}>
                    The world's first marketplace for exclusive, pre-made NFT collections.
                    Launch your next project with high-quality assets.
                </p>
                <div className={styles.actions}>
                    <button className="btn-primary">Explore Collections</button>
                    <button className={styles.secondaryBtn}>How it Works</button>
                </div>
            </div>
        </section>
    );
}
