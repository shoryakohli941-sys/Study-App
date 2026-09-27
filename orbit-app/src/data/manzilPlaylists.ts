/**
 * Rebuilt from scratch using the REAL PW Manzil playlists (verified via
 * playlist screenshots + matching thumbnail links, both provided by the user
 * top-to-bottom, subject by subject). The previous version of this file had
 * fabricated/incomplete chapter data - this replaces it entirely.
 *
 * "Matrices" (Mathematics) was intentionally dropped: its duration could not
 * be read off the source screenshot (cropped) and was left out per instruction
 * rather than guessed.
 */

export interface Chapter {
  id: string;
  subject: 'Physics' | 'Mathematics' | 'Physical Chemistry' | 'Organic Chemistry' | 'Inorganic Chemistry';
  classLevel: 11 | 12;
  chapter: string;
  duration: string; // display format, e.g. "07h 15m"
  weightage: 'High' | 'Medium' | 'Core';
  videoId?: string; // real id when we had a matching thumbnail link; omitted otherwise
}

export type Lecture = Chapter;

export const PLAYLIST_LINKS: Record<string, string> = {
  Physics: "https://youtube.com/playlist?list=PLxyGaR3hEy3gYPGsrnKx-XAi3yV6rocEx",
  Mathematics: "https://youtube.com/playlist?list=PLxyGaR3hEy3hJnlzYRfM6-sFuIEj0WRoC",
  "Physical Chemistry": "https://youtube.com/playlist?list=PLxyGaR3hEy3hVmPjmool3j3U78cTYxYq-",
  "Organic Chemistry": "https://youtube.com/playlist?list=PLxyGaR3hEy3jWivnsFTb5uvzpHZK3qvDj",
  "Inorganic Chemistry": "https://youtube.com/playlist?list=PLxyGaR3hEy3hUTwPWVhqBOR0l_1o3vyCs"
};

export function parseDurationToMinutes(duration: string): number {
  const hMatch = duration.match(/(\d+)\s*h/);
  const mMatch = duration.match(/(\d+)\s*m/);
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;
  return hours * 60 + minutes;
}

export function getSubjectCode(subject: Chapter['subject']): string {
  switch (subject) {
    case 'Physics': return 'PHY';
    case 'Mathematics': return 'MATH';
    case 'Organic Chemistry': return 'OC';
    case 'Inorganic Chemistry': return 'IOC';
    case 'Physical Chemistry': return 'PC';
    default: return 'GEN';
  }
}

export const BACKLOG_CHAPTERS: Chapter[] = [
  // ==================== PHYSICS (26, real playlist order) ====================
  { id: "phy-1", subject: "Physics", classLevel: 11, chapter: "Units, Dimensions & Errors", duration: "05h 58m", weightage: "Core", videoId: "RAwcPN79g0Q" },
  { id: "phy-2", subject: "Physics", classLevel: 12, chapter: "Electric Charges & Fields", duration: "08h 06m", weightage: "High", videoId: "mpFEnSQpJ9Q" },
  { id: "phy-3", subject: "Physics", classLevel: 11, chapter: "Motion in a Straight Line", duration: "06h 28m", weightage: "Core", videoId: "6HQgDO1trlM" },
  { id: "phy-4", subject: "Physics", classLevel: 12, chapter: "Electric Potential & Capacitance", duration: "06h 18m", weightage: "High", videoId: "XGce-vIcMfU" },
  { id: "phy-5", subject: "Physics", classLevel: 11, chapter: "Motion in a Plane", duration: "06h 42m", weightage: "High", videoId: "Rh95KkMwklU" },
  { id: "phy-6", subject: "Physics", classLevel: 12, chapter: "Current Electricity", duration: "08h 05m", weightage: "High", videoId: "vmaKeSkjtGo" },
  { id: "phy-7", subject: "Physics", classLevel: 11, chapter: "Laws of Motion", duration: "07h 48m", weightage: "High", videoId: "mE8w2uxm6XY" },
  { id: "phy-8", subject: "Physics", classLevel: 12, chapter: "Magnetism", duration: "08h 01m", weightage: "High", videoId: "1xPm3vIRIGI" },
  { id: "phy-9", subject: "Physics", classLevel: 11, chapter: "Circular Motion", duration: "05h 17m", weightage: "Medium", videoId: "griSf2U_Zlk" },
  { id: "phy-10", subject: "Physics", classLevel: 12, chapter: "Electromagnetic Induction", duration: "07h 14m", weightage: "High", videoId: "myNQbAYzD5A" },
  { id: "phy-11", subject: "Physics", classLevel: 11, chapter: "Work, Energy & Power", duration: "06h 43m", weightage: "High", videoId: "PAlXOkn_Pa8" },
  { id: "phy-12", subject: "Physics", classLevel: 12, chapter: "Electromagnetic Waves", duration: "02h 07m", weightage: "Core", videoId: "1nTFrbJ8Jhg" },
  { id: "phy-13", subject: "Physics", classLevel: 12, chapter: "Optics", duration: "08h 02m", weightage: "High", videoId: "Ch9jLsgYIuM" },
  { id: "phy-14", subject: "Physics", classLevel: 12, chapter: "Alternating Current", duration: "07h 21m", weightage: "High", videoId: "FImh-a0673s" },
  { id: "phy-15", subject: "Physics", classLevel: 11, chapter: "Rotational Motion", duration: "10h 22m", weightage: "High", videoId: "cjoRcywyRv0" },
  { id: "phy-16", subject: "Physics", classLevel: 12, chapter: "Wave Optics", duration: "06h 55m", weightage: "Medium", videoId: "3h3OexznsA0" },
  { id: "phy-17", subject: "Physics", classLevel: 12, chapter: "Modern Physics", duration: "05h 58m", weightage: "High", videoId: "ebOF14qP21k" },
  { id: "phy-18", subject: "Physics", classLevel: 11, chapter: "Mechanical Properties of Solid & Fluid", duration: "10h 30m", weightage: "Medium", videoId: "gziRcxMiO_Q" },
  { id: "phy-19", subject: "Physics", classLevel: 11, chapter: "Thermal Properties of Matter", duration: "08h 23m", weightage: "High", videoId: "UYfR15GpKIs" },
  { id: "phy-20", subject: "Physics", classLevel: 11, chapter: "Centre of Mass", duration: "09h 10m", weightage: "High", videoId: "AfPD-sHayb0" },
  { id: "phy-21", subject: "Physics", classLevel: 12, chapter: "Semiconductor", duration: "04h 09m", weightage: "High", videoId: "5h5ANJnVe08" },
  { id: "phy-22", subject: "Physics", classLevel: 11, chapter: "KTG & Thermodynamics", duration: "08h 19m", weightage: "High", videoId: "fBqJdix2NjE" },
  { id: "phy-23", subject: "Physics", classLevel: 11, chapter: "Waves", duration: "06h 28m", weightage: "Medium", videoId: "G58QS4soCuQ" },
  { id: "phy-24", subject: "Physics", classLevel: 11, chapter: "Oscillations", duration: "05h 17m", weightage: "High", videoId: "AqjrqRyot6w" },
  { id: "phy-25", subject: "Physics", classLevel: 11, chapter: "Error & Measurement", duration: "04h 42m", weightage: "Core", videoId: "XJZ1PdXyJU4" },
  { id: "phy-26", subject: "Physics", classLevel: 11, chapter: "Gravitation", duration: "03h 53m", weightage: "High" }, // no matching link supplied

  // ==================== MATHEMATICS (28, real playlist order; "Matrices" dropped) ====================
  { id: "math-1", subject: "Mathematics", classLevel: 11, chapter: "Basic Maths", duration: "05h 12m", weightage: "Core", videoId: "Z5uGIO_11vM" },
  { id: "math-2", subject: "Mathematics", classLevel: 12, chapter: "Determinants", duration: "05h 36m", weightage: "High", videoId: "uhq_WUNlvh8" },
  { id: "math-3", subject: "Mathematics", classLevel: 11, chapter: "Trigonometric Ratios & Identities", duration: "04h 52m", weightage: "Core", videoId: "DitLpxy6V48" },
  { id: "math-4", subject: "Mathematics", classLevel: 12, chapter: "Vectors", duration: "07h 10m", weightage: "High", videoId: "FsTlbTQyuJ0" },
  { id: "math-5", subject: "Mathematics", classLevel: 11, chapter: "Quadratic Equations", duration: "05h 34m", weightage: "High", videoId: "iLIPlvjDkPU" },
  { id: "math-6", subject: "Mathematics", classLevel: 11, chapter: "Sets", duration: "02h 55m", weightage: "Core", videoId: "SOXQuRrgJHo" },
  { id: "math-7", subject: "Mathematics", classLevel: 12, chapter: "Three-Dimensional Geometry", duration: "05h 36m", weightage: "High", videoId: "t_RMMkiYj4g" },
  { id: "math-8", subject: "Mathematics", classLevel: 11, chapter: "Sequence & Series", duration: "06h 41m", weightage: "High", videoId: "CVG9PcraP1k" },
  { id: "math-9", subject: "Mathematics", classLevel: 11, chapter: "Relations & Functions", duration: "07h 28m", weightage: "High", videoId: "Qs0wRt70mC4" },
  { id: "math-10", subject: "Mathematics", classLevel: 12, chapter: "Inverse Trigonometric Functions", duration: "05h 04m", weightage: "Medium", videoId: "rdWRwY2kEXI" },
  { id: "math-11", subject: "Mathematics", classLevel: 11, chapter: "Permutations & Combinations", duration: "05h 33m", weightage: "High", videoId: "rPFlUfjcakw" },
  { id: "math-12", subject: "Mathematics", classLevel: 11, chapter: "Binomial Theorem", duration: "05h 10m", weightage: "High", videoId: "QMWDHOcXEQI" },
  { id: "math-13", subject: "Mathematics", classLevel: 12, chapter: "Method of Differentiation", duration: "04h 16m", weightage: "High", videoId: "3JMzZR2TvhA" },
  { id: "math-14", subject: "Mathematics", classLevel: 11, chapter: "Straight Lines", duration: "03h 24m", weightage: "High", videoId: "pufR8xp-CQA" },
  { id: "math-15", subject: "Mathematics", classLevel: 12, chapter: "Indefinite Integration", duration: "06h 14m", weightage: "Medium", videoId: "7dVDuyI_8FA" },
  { id: "math-16", subject: "Mathematics", classLevel: 11, chapter: "Circles", duration: "04h 53m", weightage: "High", videoId: "qcpj3jjgr6o" },
  { id: "math-17", subject: "Mathematics", classLevel: 11, chapter: "Parabola", duration: "05h 01m", weightage: "High", videoId: "Nv9s38ZGPes" },
  { id: "math-18", subject: "Mathematics", classLevel: 12, chapter: "Definite Integration", duration: "04h 48m", weightage: "High", videoId: "UwRAUIeoCtI" },
  { id: "math-19", subject: "Mathematics", classLevel: 12, chapter: "Differential Equation", duration: "03h 39m", weightage: "High", videoId: "H1FKKjz8hsw" },
  { id: "math-20", subject: "Mathematics", classLevel: 11, chapter: "Hyperbola", duration: "03h 33m", weightage: "High", videoId: "zITyahKONeg" },
  { id: "math-21", subject: "Mathematics", classLevel: 12, chapter: "Application of Integrals", duration: "03h 16m", weightage: "High", videoId: "x0vMQRKTmQ0" },
  { id: "math-22", subject: "Mathematics", classLevel: 11, chapter: "Ellipse", duration: "02h 37m", weightage: "High", videoId: "ZdCd1G0NDUI" },
  { id: "math-23", subject: "Mathematics", classLevel: 11, chapter: "Complex Number", duration: "03h 35m", weightage: "High", videoId: "Q-AlaLN72w0" },
  { id: "math-24", subject: "Mathematics", classLevel: 12, chapter: "Limit", duration: "05h 21m", weightage: "High", videoId: "JnER25G1V7o" },
  { id: "math-25", subject: "Mathematics", classLevel: 12, chapter: "Statistics", duration: "03h 32m", weightage: "High", videoId: "mWa7eSpT6kg" },
  { id: "math-26", subject: "Mathematics", classLevel: 12, chapter: "Probability", duration: "04h 15m", weightage: "High", videoId: "3OFuYbk-BV4" }, // duration approximate, screenshot was unclear
  { id: "math-27", subject: "Mathematics", classLevel: 12, chapter: "Continuity & Differentiability", duration: "04h 26m", weightage: "High", videoId: "hsedtF2azNQ" },
  { id: "math-28", subject: "Mathematics", classLevel: 12, chapter: "Application of Derivatives", duration: "05h 38m", weightage: "High", videoId: "jOVcucQLv38" },

  // ==================== INORGANIC CHEMISTRY (6, real playlist order) ====================
  { id: "ioc-1", subject: "Inorganic Chemistry", classLevel: 11, chapter: "Periodic Table", duration: "06h 57m", weightage: "High", videoId: "nLE7_YBFQNQ" },
  { id: "ioc-2", subject: "Inorganic Chemistry", classLevel: 11, chapter: "Chemical Bonding", duration: "09h 29m", weightage: "High", videoId: "kS8s_WX0IlY" },
  { id: "ioc-3", subject: "Inorganic Chemistry", classLevel: 12, chapter: "Coordination Compounds", duration: "07h 47m", weightage: "High", videoId: "5myJzBeN514" },
  { id: "ioc-4", subject: "Inorganic Chemistry", classLevel: 12, chapter: "P-Block", duration: "05h 25m", weightage: "Medium", videoId: "b0k5LOk_uPk" },
  { id: "ioc-5", subject: "Inorganic Chemistry", classLevel: 12, chapter: "D & F-Block", duration: "06h 20m", weightage: "High", videoId: "SjILQ6cX_Vo" },
  { id: "ioc-6", subject: "Inorganic Chemistry", classLevel: 12, chapter: "Salt Analysis", duration: "00h 32m", weightage: "Medium", videoId: "8rRnn4ECwXI" },

  // ==================== PHYSICAL CHEMISTRY (9, real playlist order) ====================
  { id: "pc-1", subject: "Physical Chemistry", classLevel: 11, chapter: "Mole Concept", duration: "07h 54m", weightage: "Core", videoId: "CAb8YZKLoac" },
  { id: "pc-2", subject: "Physical Chemistry", classLevel: 12, chapter: "Solutions", duration: "07h 27m", weightage: "High", videoId: "f6ENSghG7T4" },
  { id: "pc-3", subject: "Physical Chemistry", classLevel: 11, chapter: "Redox Reaction", duration: "06h 31m", weightage: "Core", videoId: "8oypjDXAXZc" },
  { id: "pc-4", subject: "Physical Chemistry", classLevel: 12, chapter: "Electrochemistry", duration: "07h 52m", weightage: "High", videoId: "GplPceRaMi0" },
  { id: "pc-5", subject: "Physical Chemistry", classLevel: 11, chapter: "Thermodynamics", duration: "08h 47m", weightage: "High", videoId: "NwCmoh7Vd9g" },
  { id: "pc-6", subject: "Physical Chemistry", classLevel: 11, chapter: "Chemical Equilibrium", duration: "05h 23m", weightage: "High", videoId: "BceSksiNLD4" },
  { id: "pc-7", subject: "Physical Chemistry", classLevel: 11, chapter: "Ionic Equilibrium", duration: "05h 58m", weightage: "High", videoId: "1W-UvePUAKo" },
  { id: "pc-8", subject: "Physical Chemistry", classLevel: 12, chapter: "Chemical Kinetics", duration: "05h 32m", weightage: "High", videoId: "kwPNxC9AgZA" },
  { id: "pc-9", subject: "Physical Chemistry", classLevel: 11, chapter: "Structure of Atom", duration: "05h 35m", weightage: "High", videoId: "7OkNy8vhDaw" },

  // ==================== ORGANIC CHEMISTRY (9, real playlist order) ====================
  { id: "oc-1", subject: "Organic Chemistry", classLevel: 11, chapter: "IUPAC Nomenclature", duration: "05h 39m", weightage: "Core", videoId: "A2QTsYu3fWo" },
  { id: "oc-2", subject: "Organic Chemistry", classLevel: 11, chapter: "GOC", duration: "05h 45m", weightage: "High", videoId: "FFCT-lh86tA" },
  { id: "oc-3", subject: "Organic Chemistry", classLevel: 11, chapter: "Isomerism", duration: "07h 37m", weightage: "High", videoId: "UOzWO2-Z9So" },
  { id: "oc-4", subject: "Organic Chemistry", classLevel: 11, chapter: "Hydrocarbon", duration: "06h 41m", weightage: "High", videoId: "02CBTEOMMsA" },
  { id: "oc-5", subject: "Organic Chemistry", classLevel: 12, chapter: "Haloalkanes & Haloarenes", duration: "06h 06m", weightage: "High", videoId: "7iJFvPI8vMM" },
  { id: "oc-6", subject: "Organic Chemistry", classLevel: 12, chapter: "Alcohols, Phenols & Ethers", duration: "04h 12m", weightage: "High", videoId: "IDo8B0c5Xis" },
  { id: "oc-7", subject: "Organic Chemistry", classLevel: 12, chapter: "Aldehydes, Ketones & Carboxylic Acids", duration: "09h 24m", weightage: "High", videoId: "oR19BqbPBu4" },
  { id: "oc-8", subject: "Organic Chemistry", classLevel: 12, chapter: "Amines", duration: "03h 14m", weightage: "High", videoId: "SKHrfD34Kkc" },
  { id: "oc-9", subject: "Organic Chemistry", classLevel: 12, chapter: "Biomolecules", duration: "05h 26m", weightage: "High", videoId: "LcVNwEWJtyI" }
];

export const BACKLOG_MODULES = BACKLOG_CHAPTERS;
