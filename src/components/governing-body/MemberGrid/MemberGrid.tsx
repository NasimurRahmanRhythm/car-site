import Image from "next/image";
import { RevealBlock } from "@/components/common/RevealBlock";
import type { GoverningMember } from "@/data/governingBody";
import styles from "./MemberGrid.module.css";

export function MemberGrid({ members }: { members: GoverningMember[] }) {
  return (
    <div className={styles.grid}>
      {members.map((member) => (
        <RevealBlock key={member.name}>
          <div className={styles.card}>
            <div className={styles.imageWrap}>
              {member.image ? (
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.image}
                />
              ) : (
                <span className={styles.placeholderLabel}>Portrait Coming Soon</span>
              )}
            </div>
            <div>
              <h3 className={styles.name}>{member.name}</h3>
              <p className={styles.role}>{member.role}</p>
              <p className={styles.bio}>{member.bio}</p>
            </div>
          </div>
        </RevealBlock>
      ))}
    </div>
  );
}
