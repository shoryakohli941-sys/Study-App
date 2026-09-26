export interface ManzilLecture {
  id: string; // YouTube Video ID
  title: string;
  subject: string;
}

export interface ManzilPlaylist {
  id: string; // Playlist ID
  subject: string;
  url: string;
  lectures: ManzilLecture[];
}

export const MANZIL_PLAYLISTS: ManzilPlaylist[] = [
  {
    id: "PLxyGaR3hEy3gYPGsrnKx-XAi3yV6rocEx",
    subject: "Physics",
    url: "https://youtube.com/playlist?list=PLxyGaR3hEy3gYPGsrnKx-XAi3yV6rocEx",
    lectures: [
      { id: "P1", title: "Kinematics 1D & 2D", subject: "Physics" },
      { id: "P2", title: "NLM & Friction", subject: "Physics" },
      { id: "P3", title: "Work, Energy & Power", subject: "Physics" },
      { id: "P4", title: "Rotational Dynamics", subject: "Physics" },
      { id: "P5", title: "Gravitation", subject: "Physics" },
      { id: "P6", title: "Thermodynamics & KTG", subject: "Physics" },
      { id: "P7", title: "Electrostatics", subject: "Physics" },
    ]
  },
  {
    id: "PLxyGaR3hEy3hJnlzYRfM6-sFuIEj0WRoC",
    subject: "Maths",
    url: "https://youtube.com/playlist?list=PLxyGaR3hEy3hJnlzYRfM6-sFuIEj0WRoC",
    lectures: [
      { id: "M1", title: "Matrices & Determinants", subject: "Maths" },
      { id: "M2", title: "Relations & Functions", subject: "Maths" },
      { id: "M3", title: "Inverse Trigonometric Functions", subject: "Maths" },
      { id: "M4", title: "Limits, Continuity & Differentiability", subject: "Maths" },
      { id: "M5", title: "Definite Integrals & AUC", subject: "Maths" },
      { id: "M6", title: "Vectors & 3D Geometry", subject: "Maths" },
    ]
  },
  {
    id: "PLxyGaR3hEy3hVmPjmool3j3U78cTYxYq-",
    subject: "Physical Chem",
    url: "https://youtube.com/playlist?list=PLxyGaR3hEy3hVmPjmool3j3U78cTYxYq-",
    lectures: [
      { id: "PC1", title: "Mole Concept & Stoichiometry", subject: "Physical Chem" },
      { id: "PC2", title: "Atomic Structure", subject: "Physical Chem" },
      { id: "PC3", title: "Thermodynamics", subject: "Physical Chem" },
      { id: "PC4", title: "Chemical & Ionic Equilibrium", subject: "Physical Chem" },
      { id: "PC5", title: "Chemical Kinetics", subject: "Physical Chem" },
    ]
  },
  {
    id: "PLxyGaR3hEy3jWivnsFTb5uvzpHZK3qvDj",
    subject: "Organic Chem",
    url: "https://youtube.com/playlist?list=PLxyGaR3hEy3jWivnsFTb5uvzpHZK3qvDj",
    lectures: [
      { id: "OC1", title: "IUPAC Nomenclature & Isomerism", subject: "Organic Chem" },
      { id: "OC2", title: "General Organic Chemistry (GOC)", subject: "Organic Chem" },
      { id: "OC3", title: "Hydrocarbons", subject: "Organic Chem" },
      { id: "OC4", title: "Haloalkanes & Haloarenes", subject: "Organic Chem" },
    ]
  },
  {
    id: "PLxyGaR3hEy3hUTwPWVhqBOR0l_1o3vyCs",
    subject: "Inorganic Chem",
    url: "https://youtube.com/playlist?list=PLxyGaR3hEy3hUTwPWVhqBOR0l_1o3vyCs",
    lectures: [
      { id: "IOC1", title: "Periodic Table & Periodicity", subject: "Inorganic Chem" },
      { id: "IOC2", title: "Chemical Bonding", subject: "Inorganic Chem" },
      { id: "IOC3", title: "Coordination Compounds", subject: "Inorganic Chem" },
    ]
  }
];
