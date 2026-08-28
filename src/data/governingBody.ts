// Placeholder profiles — replace with the real ownership / leadership team.
// `image` is left unset until real portraits are supplied; MemberGrid renders
// a text placeholder in the meantime.
export interface GoverningMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
}

export const GOVERNING_BODY: GoverningMember[] = [
  {
    name: "Rhythm Ahmed",
    role: "Founder & Chairman",
    bio: "Oversees acquisitions and long-term brand direction, with a personal focus on sourcing limited-production and collector-grade vehicles.",
  },
  {
    name: "Name Surname",
    role: "Managing Director",
    bio: "Responsible for day-to-day showroom operations, client relationships, and the dealership's regional expansion.",
  },
  {
    name: "Name Surname",
    role: "Head of Acquisitions",
    bio: "Leads sourcing and inspection for every vehicle entering the collection, from private sales to international auctions.",
  },
];
