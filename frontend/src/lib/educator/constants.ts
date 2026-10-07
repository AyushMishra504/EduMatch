export const STEPS = [
  { n: 1, slug: "1", key: "basics", label: "About you", required: true },
  { n: 2, slug: "2", key: "academics", label: "Academic background", required: true },
  { n: 3, slug: "3", key: "experience", label: "Teaching & experience", required: true },
  { n: 4, slug: "4", key: "research", label: "Research", required: false },
  { n: 5, slug: "5", key: "preferences", label: "What you're looking for", required: true },
  { n: 6, slug: "6", key: "review", label: "Review profile", required: true },
] as const;

export const TOTAL_STEPS = STEPS.length;

export const DEGREE_LABELS: Record<string, string> = {
  BACHELORS: "Bachelor's",
  MASTERS: "Master's",
  MPHIL: "M.Phil.",
  PHD: "PhD",
  POSTDOC: "Postdoctoral",
};

export const PHD_STATUS_LABELS: Record<string, string> = {
  NONE: "Not pursuing",
  PURSUING: "Pursuing",
  SUBMITTED: "Thesis submitted",
  AWARDED: "Awarded",
};

export const DISCIPLINE_LABELS: Record<string, string> = {
  COMPUTER_SCIENCE: "Computer Science",
  INFORMATION_TECHNOLOGY: "Information Technology",
  ELECTRONICS: "Electronics",
  ELECTRICAL: "Electrical Engineering",
  MECHANICAL: "Mechanical Engineering",
  CIVIL: "Civil Engineering",
  CHEMICAL: "Chemical Engineering",
  BIOTECHNOLOGY: "Biotechnology",
  MATHEMATICS: "Mathematics",
  PHYSICS: "Physics",
  CHEMISTRY: "Chemistry",
  BOTANY: "Botany",
  ZOOLOGY: "Zoology",
  ECONOMICS: "Economics",
  COMMERCE: "Commerce",
  MANAGEMENT: "Management",
  ENGLISH: "English",
  HINDI: "Hindi",
  HISTORY: "History",
  POLITICAL_SCIENCE: "Political Science",
  SOCIOLOGY: "Sociology",
  PSYCHOLOGY: "Psychology",
  EDUCATION: "Education",
  LAW: "Law",
};

export const ELIGIBILITY_LABELS: Record<string, string> = {
  UGC_NET: "UGC-NET",
  CSIR_NET: "CSIR-NET",
  SET_SLET: "SET/SLET",
  JRF: "JRF",
  GATE: "GATE",
  NONE: "None",
};

export const LEVEL_LABELS: Record<string, string> = {
  GUEST: "Guest faculty",
  VISITING: "Visiting faculty",
  ASSISTANT_PROFESSOR: "Assistant Professor",
  ASSOCIATE_PROFESSOR: "Associate Professor",
  PROFESSOR: "Professor",
  HOD: "Head of Department",
};

export const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  CONTRACT: "Contract",
  VISITING: "Visiting",
  PART_TIME: "Part-time",
};

export const PAY_LEVEL_LABELS: Record<string, string> = {
  LEVEL_10: "UGC Level 10",
  LEVEL_11: "UGC Level 11",
  LEVEL_12: "UGC Level 12",
  LEVEL_13A: "UGC Level 13A",
  LEVEL_14: "UGC Level 14",
  CONSOLIDATED: "Consolidated",
  NEGOTIABLE: "Negotiable",
};

/** Back-compat combined map used by older partial code. Prefer the specific maps above. */
export const LABELS: Record<string, string> = {
  ...DEGREE_LABELS,
  ...PHD_STATUS_LABELS,
  ...DISCIPLINE_LABELS,
  ...ELIGIBILITY_LABELS,
  ...LEVEL_LABELS,
  ...EMPLOYMENT_LABELS,
  ...PAY_LEVEL_LABELS,
};

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;
