import type { Discipline } from "@prisma/client";

/**
 * Discipline-specific suggestions for specializations and taught subjects.
 * These are starting points the user can accept, edit, or ignore — free
 * text is always allowed. Kept deliberately short (recognize, don't recall).
 */
export const SPECIALIZATION_SUGGESTIONS: Record<Discipline, string[]> = {
  COMPUTER_SCIENCE: [
    "Machine Learning",
    "Data Structures",
    "Operating Systems",
    "Databases",
    "Computer Networks",
    "Software Engineering",
    "Artificial Intelligence",
    "Cloud Computing",
  ],
  INFORMATION_TECHNOLOGY: [
    "Web Technologies",
    "Cloud Computing",
    "Cybersecurity",
    "Databases",
    "Software Engineering",
    "Data Analytics",
  ],
  ELECTRONICS: [
    "Digital Electronics",
    "Embedded Systems",
    "VLSI Design",
    "Communication Systems",
    "Signal Processing",
  ],
  ELECTRICAL: [
    "Power Systems",
    "Control Systems",
    "Electrical Machines",
    "Power Electronics",
    "Renewable Energy",
  ],
  MECHANICAL: [
    "Thermodynamics",
    "Fluid Mechanics",
    "Machine Design",
    "Manufacturing",
    "Robotics",
  ],
  CIVIL: [
    "Structural Engineering",
    "Geotechnical Engineering",
    "Transportation",
    "Environmental Engineering",
    "Construction Management",
  ],
  CHEMICAL: [
    "Process Engineering",
    "Thermodynamics",
    "Reaction Engineering",
    "Process Control",
  ],
  BIOTECHNOLOGY: [
    "Genetics",
    "Microbiology",
    "Bioinformatics",
    "Bioprocess Engineering",
  ],
  MATHEMATICS: [
    "Calculus",
    "Linear Algebra",
    "Statistics",
    "Discrete Mathematics",
    "Operations Research",
  ],
  PHYSICS: ["Quantum Mechanics", "Electromagnetism", "Thermodynamics", "Optics"],
  CHEMISTRY: [
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Physical Chemistry",
    "Analytical Chemistry",
  ],
  BOTANY: [
    "Plant Physiology",
    "Genetics",
    "Ecology",
    "Plant Biotechnology",
  ],
  ZOOLOGY: [
    "Animal Physiology",
    "Genetics",
    "Ecology",
    "Wildlife Biology",
  ],
  ECONOMICS: [
    "Microeconomics",
    "Macroeconomics",
    "Econometrics",
    "Development Economics",
  ],
  COMMERCE: ["Accounting", "Finance", "Business Law", "Taxation"],
  MANAGEMENT: [
    "Marketing",
    "Finance",
    "Human Resources",
    "Operations",
    "Strategy",
  ],
  ENGLISH: [
    "British Literature",
    "Linguistics",
    "Communication Skills",
    "Literary Criticism",
  ],
  HINDI: ["Hindi Literature", "Linguistics", "Translation Studies"],
  HISTORY: ["Ancient History", "Medieval History", "Modern India"],
  POLITICAL_SCIENCE: [
    "Political Theory",
    "Indian Politics",
    "International Relations",
    "Public Administration",
  ],
  SOCIOLOGY: ["Social Theory", "Research Methods", "Rural Sociology"],
  PSYCHOLOGY: [
    "Cognitive Psychology",
    "Clinical Psychology",
    "Organizational Behaviour",
  ],
  EDUCATION: ["Pedagogy", "Curriculum Studies", "Educational Psychology"],
  LAW: [
    "Constitutional Law",
    "Criminal Law",
    "Contract Law",
    "Administrative Law",
  ],
};

const GENERIC_SUBJECTS = [
  "Data Structures",
  "Databases",
  "Computer Networks",
  "Python",
  "Communication Skills",
  "Research Methodology",
];

/** Subject suggestions for the experience step, biased by discipline. */
export function subjectSuggestions(discipline: Discipline | null | undefined): string[] {
  if (discipline && SPECIALIZATION_SUGGESTIONS[discipline]) {
    return [...SPECIALIZATION_SUGGESTIONS[discipline].slice(0, 5), "Python"].slice(0, 6);
  }
  return GENERIC_SUBJECTS;
}
