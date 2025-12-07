import styles from './NFTCard.module.css';

export default function NFTCard({ title, price, image }) {
    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                {/* Using a placeholder div or img tag. In real app, use next/image */}
                <img src={image || "https://placehold.co/400x400/121212/7C3AED?text=NFT"} alt={title} className={styles.image} />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.details}>
                    <div>
                        <span className={styles.priceLabel}>Price</span>
                        <span className={styles.priceValue}>{price} ETH</span>
                    </div>
                    <div>
                        <span className={styles.priceLabel}>Items</span>
                        <span className={styles.priceValue}>10k</span>
                    </div>
                </div>
                <button className={styles.buyBtn}>Buy Collection</button>
            </div>
        </div>
    );
}
