import styles from './Footer.module.css';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.brand}>
                        <h3 className="text-gradient">NEXUS</h3>
                        <p>The premier marketplace for exclusive, pre-made NFT collections. Start your journey today.</p>
                    </div>

                    <div className={styles.column}>
                        <h4>Marketplace</h4>
                        <div className={styles.links}>
                            <Link href="#" className={styles.link}>All Collections</Link>
                            <Link href="#" className={styles.link}>New Arrivals</Link>
                            <Link href="#" className={styles.link}>Featured</Link>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h4>Resources</h4>
                        <div className={styles.links}>
                            <Link href="#" className={styles.link}>Help Center</Link>
                            <Link href="#" className={styles.link}>Partners</Link>
                            <Link href="#" className={styles.link}>Blog</Link>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h4>Company</h4>
                        <div className={styles.links}>
                            <Link href="#" className={styles.link}>About Us</Link>
                            <Link href="#" className={styles.link}>Careers</Link>
                            <Link href="#" className={styles.link}>Privacy</Link>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>© 2024 Nexus Marketplace. All rights reserved.</p>
                    <div className={styles.links} style={{ flexDirection: 'row', gap: '24px' }}>
                        <Link href="#" className={styles.link}>Terms</Link>
                        <Link href="#" className={styles.link}>Privacy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
