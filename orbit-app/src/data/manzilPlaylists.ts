export interface Chapter {
  id: string;
  subject: 'Physics' | 'Mathematics' | 'Physical Chemistry' | 'Organic Chemistry' | 'Inorganic Chemistry';
  chapter: string;
  classLevel: 11 | 12;
  estDuration: string;
  weightage: 'High' | 'Medium' | 'Core';
}

export const PLAYLIST_LINKS: Record<string, string> = {
  Physics: "https://youtube.com/playlist?list=PLxyGaR3hEy3gYPGsrnKx-XAi3yV6rocEx",
  Mathematics: "https://youtube.com/playlist?list=PLxyGaR3hEy3hJnlzYRfM6-sFuIEj0WRoC",
  "Physical Chemistry": "https://youtube.com/playlist?list=PLxyGaR3hEy3hVmPjmool3j3U78cTYxYq-",
  "Organic Chemistry": "https://youtube.com/playlist?list=PLxyGaR3hEy3jWivnsFTb5uvzpHZK3qvDj",
  "Inorganic Chemistry": "https://youtube.com/playlist?list=PLxyGaR3hEy3hUTwPWVhqBOR0l_1o3vyCs"
};

export const BACKLOG_CHAPTERS: Chapter[] = [
  // ================= PHYSICS (11th & 12th) =================
  { id: "phy-1", subject: "Physics", classLevel: 11, chapter: "Units, Dimensions & Errors", estDuration: "03h 30m", weightage: "Core" },
  { id: "phy-2", subject: "Physics", classLevel: 11, chapter: "Kinematics 1D & 2D", estDuration: "06h 45m", weightage: "High" },
  { id: "phy-3", subject: "Physics", classLevel: 11, chapter: "Newton's Laws of Motion & Friction", estDuration: "06h 15m", weightage: "High" },
  { id: "phy-4", subject: "Physics", classLevel: 11, chapter: "Work, Energy & Power", estDuration: "05h 30m", weightage: "High" },
  { id: "phy-5", subject: "Physics", classLevel: 11, chapter: "Center of Mass & Collisions", estDuration: "05h 00m", weightage: "High" },
  { id: "phy-6", subject: "Physics", classLevel: 11, chapter: "Rotational Motion", estDuration: "07h 30m", weightage: "High" },
  { id: "phy-7", subject: "Physics", classLevel: 11, chapter: "Gravitation", estDuration: "04h 15m", weightage: "High" },
  { id: "phy-8", subject: "Physics", classLevel: 11, chapter: "Mechanical Properties of Solids & Fluids", estDuration: "06h 00m", weightage: "Medium" },
  { id: "phy-9", subject: "Physics", classLevel: 11, chapter: "Thermal Properties & Thermodynamics", estDuration: "06h 30m", weightage: "High" },
  { id: "phy-10", subject: "Physics", classLevel: 11, chapter: "Kinetic Theory of Gases (KTG)", estDuration: "03h 00m", weightage: "Core" },
  { id: "phy-11", subject: "Physics", classLevel: 11, chapter: "Simple Harmonic Motion (SHM)", estDuration: "05h 00m", weightage: "High" },
  { id: "phy-12", subject: "Physics", classLevel: 11, chapter: "Waves & Sound", estDuration: "05h 45m", weightage: "Medium" },
  { id: "phy-13", subject: "Physics", classLevel: 12, chapter: "Electrostatics & Gauss Law", estDuration: "07h 00m", weightage: "High" },
  { id: "phy-14", subject: "Physics", classLevel: 12, chapter: "Capacitance", estDuration: "04h 30m", weightage: "High" },
  { id: "phy-15", subject: "Physics", classLevel: 12, chapter: "Current Electricity", estDuration: "07h 15m", weightage: "High" },
  { id: "phy-16", subject: "Physics", classLevel: 12, chapter: "Moving Charges & Magnetism", estDuration: "06h 30m", weightage: "High" },
  { id: "phy-17", subject: "Physics", classLevel: 12, chapter: "Magnetism and Matter", estDuration: "02h 30m", weightage: "Core" },
  { id: "phy-18", subject: "Physics", classLevel: 12, chapter: "Electromagnetic Induction (EMI)", estDuration: "05h 30m", weightage: "High" },
  { id: "phy-19", subject: "Physics", classLevel: 12, chapter: "Alternating Current (AC)", estDuration: "04h 45m", weightage: "High" },
  { id: "phy-20", subject: "Physics", classLevel: 12, chapter: "Electromagnetic Waves", estDuration: "02h 15m", weightage: "Core" },
  { id: "phy-21", subject: "Physics", classLevel: 12, chapter: "Ray Optics & Optical Instruments", estDuration: "07h 45m", weightage: "High" },
  { id: "phy-22", subject: "Physics", classLevel: 12, chapter: "Wave Optics", estDuration: "04h 30m", weightage: "Medium" },
  { id: "phy-23", subject: "Physics", classLevel: 12, chapter: "Dual Nature of Matter & Radiation", estDuration: "03h 30m", weightage: "High" },
  { id: "phy-24", subject: "Physics", classLevel: 12, chapter: "Atoms & Nuclei", estDuration: "05h 00m", weightage: "High" },
  { id: "phy-25", subject: "Physics", classLevel: 12, chapter: "Semiconductors", estDuration: "04h 00m", weightage: "High" },

  // ================= MATHEMATICS =================
  { id: "math-1", subject: "Mathematics", classLevel: 11, chapter: "Sets, Relations & Functions", estDuration: "05h 30m", weightage: "High" },
  { id: "math-2", subject: "Mathematics", classLevel: 11, chapter: "Trigonometric Ratios & Identities", estDuration: "06h 15m", weightage: "Core" },
  { id: "math-3", subject: "Mathematics", classLevel: 11, chapter: "Inverse Trigonometric Functions", estDuration: "04h 00m", weightage: "Medium" },
  { id: "math-4", subject: "Mathematics", classLevel: 11, chapter: "Quadratic Equations", estDuration: "05h 00m", weightage: "High" },
  { id: "math-5", subject: "Mathematics", classLevel: 11, chapter: "Complex Numbers", estDuration: "06h 30m", weightage: "High" },
  { id: "math-6", subject: "Mathematics", classLevel: 11, chapter: "Binomial Theorem", estDuration: "05h 15m", weightage: "High" },
  { id: "math-7", subject: "Mathematics", classLevel: 11, chapter: "Sequences & Series", estDuration: "05h 30m", weightage: "High" },
  { id: "math-8", subject: "Mathematics", classLevel: 11, chapter: "Straight Lines", estDuration: "05h 00m", weightage: "High" },
  { id: "math-9", subject: "Mathematics", classLevel: 11, chapter: "Circles", estDuration: "06h 00m", weightage: "High" },
  { id: "math-10", subject: "Mathematics", classLevel: 11, chapter: "Conic Sections (Parabola, Ellipse, Hyperbola)", estDuration: "08h 00m", weightage: "High" },
  { id: "math-11", subject: "Mathematics", classLevel: 11, chapter: "Permutations & Combinations (P&C)", estDuration: "06h 00m", weightage: "High" },
  { id: "math-12", subject: "Mathematics", classLevel: 12, chapter: "Matrices & Determinants", estDuration: "06h 30m", weightage: "High" },
  { id: "math-13", subject: "Mathematics", classLevel: 12, chapter: "Limits, Continuity & Differentiability", estDuration: "07h 00m", weightage: "High" },
  { id: "math-14", subject: "Mathematics", classLevel: 12, chapter: "Application of Derivatives (AOD)", estDuration: "06h 45m", weightage: "High" },
  { id: "math-15", subject: "Mathematics", classLevel: 12, chapter: "Indefinite Integration", estDuration: "06h 00m", weightage: "Medium" },
  { id: "math-16", subject: "Mathematics", classLevel: 12, chapter: "Definite Integration", estDuration: "06h 30m", weightage: "High" },
  { id: "math-17", subject: "Mathematics", classLevel: 12, chapter: "Differential Equations", estDuration: "05h 00m", weightage: "High" },
  { id: "math-18", subject: "Mathematics", classLevel: 12, chapter: "Vector Algebra", estDuration: "05h 30m", weightage: "High" },
  { id: "math-19", subject: "Mathematics", classLevel: 12, chapter: "Three Dimensional Geometry (3D)", estDuration: "06h 00m", weightage: "High" },
  { id: "math-20", subject: "Mathematics", classLevel: 12, chapter: "Probability", estDuration: "06h 30m", weightage: "High" },
  { id: "math-21", subject: "Mathematics", classLevel: 12, chapter: "Statistics", estDuration: "03h 00m", weightage: "High" },

  // ================= PHYSICAL CHEMISTRY =================
  { id: "pc-1", subject: "Physical Chemistry", classLevel: 11, chapter: "Mole Concept & Stoichiometry", estDuration: "04h 30m", weightage: "Core" },
  { id: "pc-2", subject: "Physical Chemistry", classLevel: 11, chapter: "Atomic Structure", estDuration: "05h 30m", weightage: "High" },
  { id: "pc-3", subject: "Physical Chemistry", classLevel: 11, chapter: "Chemical Thermodynamics", estDuration: "06h 30m", weightage: "High" },
  { id: "pc-4", subject: "Physical Chemistry", classLevel: 11, chapter: "Chemical & Ionic Equilibrium", estDuration: "07h 00m", weightage: "High" },
  { id: "pc-5", subject: "Physical Chemistry", classLevel: 11, chapter: "Redox Reactions", estDuration: "03h 00m", weightage: "Core" },
  { id: "pc-6", subject: "Physical Chemistry", classLevel: 12, chapter: "Solutions & Colligative Properties", estDuration: "05h 00m", weightage: "High" },
  { id: "pc-7", subject: "Physical Chemistry", classLevel: 12, chapter: "Electrochemistry", estDuration: "06h 00m", weightage: "High" },
  { id: "pc-8", subject: "Physical Chemistry", classLevel: 12, chapter: "Chemical Kinetics", estDuration: "05h 00m", weightage: "High" },

  // ================= ORGANIC CHEMISTRY =================
  { id: "oc-1", subject: "Organic Chemistry", classLevel: 11, chapter: "IUPAC Nomenclature & Isomerism", estDuration: "04h 30m", weightage: "Core" },
  { id: "oc-2", subject: "Organic Chemistry", classLevel: 11, chapter: "General Organic Chemistry (GOC)", estDuration: "07h 30m", weightage: "High" },
  { id: "oc-3", subject: "Organic Chemistry", classLevel: 11, chapter: "Hydrocarbons", estDuration: "06h 15m", weightage: "High" },
  { id: "oc-4", subject: "Organic Chemistry", classLevel: 12, chapter: "Haloalkanes & Haloarenes", estDuration: "05h 00m", weightage: "High" },
  { id: "oc-5", subject: "Organic Chemistry", classLevel: 12, chapter: "Alcohols, Phenols & Ethers", estDuration: "05h 30m", weightage: "High" },
  { id: "oc-6", subject: "Organic Chemistry", classLevel: 12, chapter: "Aldehydes, Ketones & Carboxylic Acids", estDuration: "07h 00m", weightage: "High" },
  { id: "oc-7", subject: "Organic Chemistry", classLevel: 12, chapter: "Amines & Diazonium Salts", estDuration: "04h 30m", weightage: "High" },
  { id: "oc-8", subject: "Organic Chemistry", classLevel: 12, chapter: "Biomolecules", estDuration: "03h 30m", weightage: "High" },

  // ================= INORGANIC CHEMISTRY =================
  { id: "ioc-1", subject: "Inorganic Chemistry", classLevel: 11, chapter: "Periodic Classification", estDuration: "04h 30m", weightage: "High" },
  { id: "ioc-2", subject: "Inorganic Chemistry", classLevel: 11, chapter: "Chemical Bonding & Molecular Structure", estDuration: "07h 00m", weightage: "High" },
  { id: "ioc-3", subject: "Inorganic Chemistry", classLevel: 12, chapter: "Coordination Compounds", estDuration: "06h 30m", weightage: "High" },
  { id: "ioc-4", subject: "Inorganic Chemistry", classLevel: 12, chapter: "d- and f-Block Elements", estDuration: "04h 00m", weightage: "High" },
  { id: "ioc-5", subject: "Inorganic Chemistry", classLevel: 12, chapter: "p-Block Elements", estDuration: "05h 00m", weightage: "Medium" }
];
