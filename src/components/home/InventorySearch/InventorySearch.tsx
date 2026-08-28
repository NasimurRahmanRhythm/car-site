"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/common/Button";
import styles from "./InventorySearch.module.css";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, index) => CURRENT_YEAR - index);

export function InventorySearch({ makes }: { makes: string[] }) {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (year) params.set("year", year);
    router.push(`/inventory${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className={styles.panel}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="search-make">
            Make
          </label>
          <select
            id="search-make"
            className={styles.input}
            value={make}
            onChange={(event) => setMake(event.target.value)}
          >
            <option value="">Any Make</option>
            {makes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="search-model">
            Model
          </label>
          <input
            id="search-model"
            type="text"
            className={styles.input}
            placeholder="Any Model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="search-year">
            Year
          </label>
          <select
            id="search-year"
            className={styles.input}
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            <option value="">Any Year</option>
            {YEARS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit">Search Inventory</Button>
      </form>
    </div>
  );
}
