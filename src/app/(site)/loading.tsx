import { Spinner } from "@/components/common/Spinner";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.wrapper}>
      <Spinner />
    </div>
  );
}
