import Header from '@/components/Header';
import Hero from '@/components/Hero';
import NFTCard from '@/components/NFTCard';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const MOCK_COLLECTIONS = [
  {
    id: 1,
    title: "Cyber Punks 2077",
    price: "0.5",
    image: "https://placehold.co/400x400/121212/7C3AED?text=Cyber+Punks"
  },
  {
    id: 2,
    title: "Neon Genesis",
    price: "1.2",
    image: "https://placehold.co/400x400/121212/EC4899?text=Neon+Genesis"
  },
  {
    id: 3,
    title: "Digital Dreams",
    price: "0.8",
    image: "https://placehold.co/400x400/121212/00E5FF?text=Digital+Dreams"
  },
  {
    id: 4,
    title: "Abstract Minds",
    price: "2.5",
    image: "https://placehold.co/400x400/121212/FFD700?text=Abstract"
  },
  {
    id: 5,
    title: "Meta Verse",
    price: "0.3",
    image: "https://placehold.co/400x400/121212/FF4500?text=Meta"
  },
  {
    id: 6,
    title: "Crypto Kitties",
    price: "0.1",
    image: "https://placehold.co/400x400/121212/32CD32?text=Kitties"
  },
  {
    id: 7,
    title: "Space Cadets",
    price: "1.5",
    image: "https://placehold.co/400x400/121212/9400D3?text=Space"
  },
  {
    id: 8,
    title: "Pixel Art",
    price: "0.05",
    image: "https://placehold.co/400x400/121212/FF1493?text=Pixel"
  }
];

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />

      <section className={`${styles.section} container`}>
        <h2 className={`${styles.sectionTitle} text-gradient`}>Featured Collections</h2>
        <div className={styles.grid}>
          {MOCK_COLLECTIONS.map((collection) => (
            <NFTCard
              key={collection.id}
              title={collection.title}
              price={collection.price}
              image={collection.image}
            />
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.features}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Choose Nexus?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Premium Quality</h3>
              <p className={styles.featureText}>Every collection is hand-picked and verified for quality and authenticity.</p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Instant Ownership</h3>
              <p className={styles.featureText}>Buy pre-made collections and get full ownership rights instantly.</p>
            </div>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Secure Platform</h3>
              <p className={styles.featureText}>Built on the most secure blockchain infrastructure for your peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
