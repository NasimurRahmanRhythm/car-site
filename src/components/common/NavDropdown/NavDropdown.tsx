import Link from "next/link";
import type { CarCategory } from "@/types/car";
import styles from "./NavDropdown.module.css";

interface NavDropdownProps {
  items: readonly { value: CarCategory; label: string }[];
  className?: string;
}

export function NavDropdown({ items, className }: NavDropdownProps) {
  return (
    <div className={`${styles.dropdown} ${className ?? ""}`}>
      {items.map((item) => (
        <Link key={item.value} href={`/categories/${item.value}`} className={styles.item}>
          {item.label}
        </Link>
      ))}
    </div>
  );
}
