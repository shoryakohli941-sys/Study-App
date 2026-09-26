export interface Chapter {
  id: string;
  subject: 'Physics' | 'Mathematics' | 'Physical Chemistry' | 'Organic Chemistry' | 'Inorganic Chemistry';
  classLevel: 11 | 12;
  chapter: string;
  videoId?: string;
  duration: string;
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
  // ==========================================
  // PHYSICS (CLASS 11 & 12)
  // ==========================================
  {
    id: "phy-1",
    subject: "Physics",
    classLevel: 11,
    chapter: "Units, Dimensions & Errors",
    duration: "03h 45m",
    weightage: "Core"
  },
  {
    id: "phy-2",
    subject: "Physics",
    classLevel: 11,
    chapter: "Motion in a Straight Line & Plane (Kinematics)",
    duration: "07h 15m",
    weightage: "High"
  },
  {
    id: "phy-3",
    subject: "Physics",
    classLevel: 11,
    chapter: "Newton's Laws of Motion & Friction",
    duration: "06h 30m",
    weightage: "High"
  },
  {
    id: "phy-4",
    subject: "Physics",
    classLevel: 11,
    chapter: "Work, Energy & Power",
    duration: "05h 45m",
    weightage: "High"
  },
  {
    id: "phy-5",
    subject: "Physics",
    classLevel: 11,
    chapter: "Center of Mass, Momentum & Collisions",
    duration: "05h 15m",
    weightage: "High"
  },
  {
    id: "phy-6",
    subject: "Physics",
    classLevel: 11,
    chapter: "Rotational Dynamics & Moment of Inertia",
    duration: "08h 10m",
    weightage: "High"
  },
  {
    id: "phy-7",
    subject: "Physics",
    classLevel: 11,
    chapter: "Gravitation",
    duration: "04h 30m",
    weightage: "High"
  },
  {
    id: "phy-8",
    subject: "Physics",
    classLevel: 11,
    chapter: "Mechanical Properties of Solids (Elasticity)",
    duration: "03h 15m",
    weightage: "Medium"
  },
  {
    id: "phy-9",
    subject: "Physics",
    classLevel: 11,
    chapter: "Fluid Mechanics & Hydrodynamics",
    duration: "06h 40m",
    weightage: "High"
  },
  {
    id: "phy-10",
    subject: "Physics",
    classLevel: 11,
    chapter: "Thermal Properties & Thermodynamics",
    duration: "07h 00m",
    weightage: "High"
  },
  {
    id: "phy-11",
    subject: "Physics",
    classLevel: 11,
    chapter: "Kinetic Theory of Gases (KTG)",
    duration: "03h 00m",
    weightage: "Core"
  },
  {
    id: "phy-12",
    subject: "Physics",
    classLevel: 11,
    chapter: "Oscillations & Simple Harmonic Motion (SHM)",
    duration: "05h 30m",
    weightage: "High"
  },
  {
    id: "phy-13",
    subject: "Physics",
    classLevel: 11,
    chapter: "Waves, Sound & Doppler Effect",
    duration: "06h 15m",
    weightage: "Medium"
  },
  {
    id: "phy-14",
    subject: "Physics",
    classLevel: 12,
    chapter: "Electric Charges & Fields",
    videoId: "mpFEnSQpJ9Q",
    duration: "06h 45m",
    weightage: "High"
  },
  {
    id: "phy-15",
    subject: "Physics",
    classLevel: 12,
    chapter: "Electrostatic Potential & Capacitance",
    videoId: "GLEZZdGwuXU",
    duration: "07h 12m",
    weightage: "High"
  },
  {
    id: "phy-16",
    subject: "Physics",
    classLevel: 12,
    chapter: "Current Electricity",
    duration: "07h 30m",
    weightage: "High"
  },
  {
    id: "phy-17",
    subject: "Physics",
    classLevel: 12,
    chapter: "Moving Charges & Magnetism",
    duration: "06h 50m",
    weightage: "High"
  },
  {
    id: "phy-18",
    subject: "Physics",
    classLevel: 12,
    chapter: "Magnetism & Matter",
    duration: "02h 45m",
    weightage: "Core"
  },
  {
    id: "phy-19",
    subject: "Physics",
    classLevel: 12,
    chapter: "Electromagnetic Induction (EMI)",
    duration: "05h 30m",
    weightage: "High"
  },
  {
    id: "phy-20",
    subject: "Physics",
    classLevel: 12,
    chapter: "Alternating Current (AC)",
    duration: "04h 45m",
    weightage: "High"
  },
  {
    id: "phy-21",
    subject: "Physics",
    classLevel: 12,
    chapter: "Electromagnetic Waves (EM Waves)",
    duration: "02h 15m",
    weightage: "Core"
  },
  {
    id: "phy-22",
    subject: "Physics",
    classLevel: 12,
    chapter: "Ray Optics & Optical Instruments",
    duration: "08h 20m",
    weightage: "High"
  },
  {
    id: "phy-23",
    subject: "Physics",
    classLevel: 12,
    chapter: "Wave Optics (Interference & Diffraction)",
    duration: "04h 50m",
    weightage: "Medium"
  },
  {
    id: "phy-24",
    subject: "Physics",
    classLevel: 12,
    chapter: "Dual Nature of Radiation & Matter",
    duration: "03h 40m",
    weightage: "High"
  },
  {
    id: "phy-25",
    subject: "Physics",
    classLevel: 12,
    chapter: "Atoms & Nuclei",
    duration: "05h 10m",
    weightage: "High"
  },
  {
    id: "phy-26",
    subject: "Physics",
    classLevel: 12,
    chapter: "Semiconductors & Logic Gates",
    duration: "04h 30m",
    weightage: "High"
  },

  // ==========================================
  // MATHEMATICS (CLASS 11 & 12)
  // ==========================================
  {
    id: "math-1",
    subject: "Mathematics",
    classLevel: 11,
    chapter: "Sets, Relations & Functions",
    duration: "05h 45m",
    weightage: "High"
  },
  {
    id: "math-2",
    subject: "Mathematics",
    classLevel: 11,
    chapter: "Trigonometric Ratios & Identities",
    videoId: "DitLpxy6V48",
    duration: "06h 15m",
    weightage: "Core"
  },
  {
    id: "math-3",
    subject: "Mathematics",
    classLevel: 11,
    chapter: "Quadratic Equations & Inequalities",
    duration: "05h 10m",
    weightage: "High"
  },
  {
    id: "math-4",
    subject: "Mathematics",
    classLevel: 11,
    chapter: "Complex Numbers",
    duration: "06h 50m",
    weightage: "High"
  },
  {
    id: "math-5",
    subject: "Mathematics",
    classLevel: 11,
    chapter: "Binomial Theorem",
    videoId: "QMWDHOcXEQI",
    duration: "05h 10m",
    weightage: "High"
  },
  {
    id: "math-6",
    subject: "Mathematics",
    classLevel: 11,
    chapter: "Sequences & Series (AP, GP, Special Series)",
    duration: "05h 30m",
    weightage: "High"
  },
  {
    id: "math-7",
    subject: "Mathematics",
    classLevel: 11,
    chapter: "Straight Lines",
    duration: "05h 20m",
    weightage: "High"
  },
  {
    id: "math-8",
    subject: "Mathematics",
    classLevel: 11,
    chapter: "Circles",
    duration: "06h 15m",
    weightage: "High"
  },
  {
    id: "math-9",
    subject: "Mathematics",
    classLevel: 11,
    chapter: "Conic Sections (Parabola, Ellipse, Hyperbola)",
    duration: "08h 30m",
    weightage: "High"
  },
  {
    id: "math-10",
    subject: "Mathematics",
    classLevel: 11,
    chapter: "Permutations & Combinations (P&C)",
    duration: "06h 00m",
    weightage: "High"
  },
  {
    id: "math-11",
    subject: "Mathematics",
    classLevel: 12,
    chapter: "Determinants",
    videoId: "uhq_WUNlvh8",
    duration: "04h 50m",
    weightage: "High"
  },
  {
    id: "math-12",
    subject: "Mathematics",
    classLevel: 12,
    chapter: "Matrices",
    duration: "05h 15m",
    weightage: "High"
  },
  {
    id: "math-13",
    subject: "Mathematics",
    classLevel: 12,
    chapter: "Inverse Trigonometric Functions (ITF)",
    duration: "04h 00m",
    weightage: "Medium"
  },
  {
    id: "math-14",
    subject: "Mathematics",
    classLevel: 12,
    chapter: "Limits, Continuity & Differentiability (LCD)",
    duration: "07h 30m",
    weightage: "High"
  },
  {
    id: "math-15",
    subject: "Mathematics",
    classLevel: 12,
    chapter: "Application of Derivatives (AOD)",
    duration: "07h 00m",
    weightage: "High"
  },
  {
    id: "math-16",
    subject: "Mathematics",
    classLevel: 12,
    chapter: "Indefinite Integration",
    duration: "06h 30m",
    weightage: "Medium"
  },
  {
    id: "math-17",
    subject: "Mathematics",
    classLevel: 12,
    chapter: "Definite Integration & Area Under Curve",
    duration: "07h 15m",
    weightage: "High"
  },
  {
    id: "math-18",
    subject: "Mathematics",
    classLevel: 12,
    chapter: "Differential Equations",
    duration: "05h 30m",
    weightage: "High"
  },
  {
    id: "math-19",
    subject: "Mathematics",
    classLevel: 12,
    chapter: "Vector Algebra",
    duration: "05h 45m",
    weightage: "High"
  },
  {
    id: "math-20",
    subject: "Mathematics",
    classLevel: 12,
    chapter: "Three Dimensional Geometry (3D)",
    duration: "06h 30m",
    weightage: "High"
  },
  {
    id: "math-21",
    subject: "Mathematics",
    classLevel: 12,
    chapter: "Probability & Bayes' Theorem",
    duration: "06h 40m",
    weightage: "High"
  },
  {
    id: "math-22",
    subject: "Mathematics",
    classLevel: 12,
    chapter: "Statistics",
    duration: "03h 15m",
    weightage: "High"
  },

  // ==========================================
  // PHYSICAL CHEMISTRY (CLASS 11 & 12)
  // ==========================================
  {
    id: "pc-1",
    subject: "Physical Chemistry",
    classLevel: 11,
    chapter: "Some Basic Concepts of Chemistry (Mole Concept)",
    duration: "05h 15m",
    weightage: "Core"
  },
  {
    id: "pc-2",
    subject: "Physical Chemistry",
    classLevel: 11,
    chapter: "Structure of Atom (Quantum Numbers & Bohr Model)",
    duration: "05h 45m",
    weightage: "High"
  },
  {
    id: "pc-3",
    subject: "Physical Chemistry",
    classLevel: 11,
    chapter: "Chemical Thermodynamics & Thermochemistry",
    duration: "07h 15m",
    weightage: "High"
  },
  {
    id: "pc-4",
    subject: "Physical Chemistry",
    classLevel: 11,
    chapter: "Chemical & Ionic Equilibrium",
    duration: "07h 50m",
    weightage: "High"
  },
  {
    id: "pc-5",
    subject: "Physical Chemistry",
    classLevel: 11,
    chapter: "Redox Reactions",
    duration: "03h 20m",
    weightage: "Core"
  },
  {
    id: "pc-6",
    subject: "Physical Chemistry",
    classLevel: 12,
    chapter: "Solutions & Colligative Properties",
    duration: "05h 30m",
    weightage: "High"
  },
  {
    id: "pc-7",
    subject: "Physical Chemistry",
    classLevel: 12,
    chapter: "Electrochemistry & Nernst Equation",
    duration: "06h 40m",
    weightage: "High"
  },
  {
    id: "pc-8",
    subject: "Physical Chemistry",
    classLevel: 12,
    chapter: "Chemical Kinetics & Arrhenius Equation",
    duration: "05h 45m",
    weightage: "High"
  },

  // ==========================================
  // ORGANIC CHEMISTRY (CLASS 11 & 12)
  // ==========================================
  {
    id: "oc-1",
    subject: "Organic Chemistry",
    classLevel: 11,
    chapter: "IUPAC Nomenclature & Structural Isomerism",
    duration: "04h 45m",
    weightage: "Core"
  },
  {
    id: "oc-2",
    subject: "Organic Chemistry",
    classLevel: 11,
    chapter: "General Organic Chemistry (GOC & Electronic Effects)",
    videoId: "FFCT-lh86tA",
    duration: "07h 20m",
    weightage: "High"
  },
  {
    id: "oc-3",
    subject: "Organic Chemistry",
    classLevel: 11,
    chapter: "Hydrocarbons (Alkanes, Alkenes, Alkynes & Aromatic)",
    videoId: "02CBTEOMMsA",
    duration: "06h 05m",
    weightage: "High"
  },
  {
    id: "oc-4",
    subject: "Organic Chemistry",
    classLevel: 12,
    chapter: "Haloalkanes & Haloarenes (SN1, SN2, E1, E2)",
    duration: "05h 30m",
    weightage: "High"
  },
  {
    id: "oc-5",
    subject: "Organic Chemistry",
    classLevel: 12,
    chapter: "Alcohols, Phenols & Ethers",
    duration: "06h 00m",
    weightage: "High"
  },
  {
    id: "oc-6",
    subject: "Organic Chemistry",
    classLevel: 12,
    chapter: "Aldehydes, Ketones & Carboxylic Acids",
    duration: "07h 45m",
    weightage: "High"
  },
  {
    id: "oc-7",
    subject: "Organic Chemistry",
    classLevel: 12,
    chapter: "Amines & Diazonium Salts",
    duration: "04h 45m",
    weightage: "High"
  },
  {
    id: "oc-8",
    subject: "Organic Chemistry",
    classLevel: 12,
    chapter: "Biomolecules & Practical Organic Chemistry",
    duration: "03h 50m",
    weightage: "High"
  },

  // ==========================================
  // INORGANIC CHEMISTRY (CLASS 11 & 12)
  // ==========================================
  {
    id: "ioc-1",
    subject: "Inorganic Chemistry",
    classLevel: 11,
    chapter: "Periodic Classification & Periodicity of Elements",
    videoId: "nLE7_YBFQNQ",
    duration: "04h 40m",
    weightage: "High"
  },
  {
    id: "ioc-2",
    subject: "Inorganic Chemistry",
    classLevel: 11,
    chapter: "Chemical Bonding & Molecular Structure (VSEPR, MOT)",
    duration: "07h 30m",
    weightage: "High"
  },
  {
    id: "ioc-3",
    subject: "Inorganic Chemistry",
    classLevel: 12,
    chapter: "Coordination Compounds & Crystal Field Theory",
    duration: "07h 00m",
    weightage: "High"
  },
  {
    id: "ioc-4",
    subject: "Inorganic Chemistry",
    classLevel: 12,
    chapter: "d- and f-Block Elements",
    duration: "04h 30m",
    weightage: "High"
  },
  {
    id: "ioc-5",
    subject: "Inorganic Chemistry",
    classLevel: 12,
    chapter: "p-Block Elements (Group 13 to 18 Trends)",
    duration: "05h 45m",
    weightage: "Medium"
  }
];
