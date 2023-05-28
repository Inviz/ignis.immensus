import dynamic from "next/dynamic";
import styles from "./page.module.css";

const Slider = dynamic(() => import("./slider"), { ssr: false });
export default function Home() {
  return (
    <main className={styles.main}>
      <Slider />
    </main>
  );
}
