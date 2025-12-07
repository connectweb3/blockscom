"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
            <Link href="/" className={`${styles.logo} text-gradient`}>
                NEXUS
            </Link>

            <nav className={styles.nav}>
                <Link href="/" className={styles.navLink}>Collections</Link>
                <Link href="#" className={styles.navLink}>Creators</Link>
                <Link href="#" className={styles.navLink}>About</Link>
            </nav>

            <button className={styles.connectBtn}>
                Connect Wallet
            </button>
        </header>
    );
}
