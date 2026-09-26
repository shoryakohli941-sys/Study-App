export interface ManzilLecture {
  id: string; // YouTube Video ID - we'll keep as "dummy" or actual IDs if we had them, but since we don't know the exact IDs, we can just use empty or placeholder. Actually wait, if the thumbnail uses id, maybe we should just use empty strings or "dummy" so they fail gracefully, OR we can extract true IDs if we have them. The prompt says "A client-side app cannot scrape full YouTube playlists dynamically without an API key due to CORS." and "When no valid video ID exists or the image fails to load, render a clean geometric fallback card". We'll use a standard format for ID, like "dummy-P1" or empty. Let's just use empty string or an invalid string like "NONE" so it intentionally fails and uses fallback.
  videoId: string; // Add a specific videoId field for clarity
  title: string;
  subject: string;
  duration: string;
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
      { id: "P1", videoId: "", title: "Units & Dimensions", subject: "Physics", duration: "04h 15m" },
      { id: "P2", videoId: "", title: "Motion in 1D & 2D", subject: "Physics", duration: "05h 30m" },
      { id: "P3", videoId: "", title: "NLM & Friction", subject: "Physics", duration: "04h 45m" },
      { id: "P4", videoId: "", title: "Work Energy & Power", subject: "Physics", duration: "03h 50m" },
      { id: "P5", videoId: "", title: "Circular Motion", subject: "Physics", duration: "02h 45m" },
      { id: "P6", videoId: "", title: "System of Particles & Rotational Motion", subject: "Physics", duration: "06h 15m" },
      { id: "P7", videoId: "", title: "Gravitation", subject: "Physics", duration: "03h 20m" },
      { id: "P8", videoId: "", title: "Mechanical Properties of Solids & Fluids", subject: "Physics", duration: "04h 10m" },
      { id: "P9", videoId: "", title: "Thermal Physics & Thermodynamics", subject: "Physics", duration: "05h 05m" },
      { id: "P10", videoId: "", title: "Kinetic Theory of Gases", subject: "Physics", duration: "02h 30m" },
      { id: "P11", videoId: "", title: "Oscillations & Waves", subject: "Physics", duration: "05h 45m" },
      { id: "P12", videoId: "", title: "Electrostatics", subject: "Physics", duration: "06h 30m" },
      { id: "P13", videoId: "", title: "Current Electricity", subject: "Physics", duration: "04h 25m" },
      { id: "P14", videoId: "", title: "Moving Charges & Magnetism", subject: "Physics", duration: "05h 15m" },
      { id: "P15", videoId: "", title: "EMI & AC", subject: "Physics", duration: "04h 55m" },
      { id: "P16", videoId: "", title: "Ray Optics", subject: "Physics", duration: "06h 20m" },
      { id: "P17", videoId: "", title: "Wave Optics", subject: "Physics", duration: "03h 40m" },
      { id: "P18", videoId: "", title: "Modern Physics & Semiconductors", subject: "Physics", duration: "05h 10m" },
    ]
  },
  {
    id: "PLxyGaR3hEy3hJnlzYRfM6-sFuIEj0WRoC",
    subject: "Mathematics",
    url: "https://youtube.com/playlist?list=PLxyGaR3hEy3hJnlzYRfM6-sFuIEj0WRoC",
    lectures: [
      { id: "M1", videoId: "", title: "Sets & Relations", subject: "Mathematics", duration: "03h 15m" },
      { id: "M2", videoId: "", title: "Functions", subject: "Mathematics", duration: "05h 45m" },
      { id: "M3", videoId: "", title: "Quadratic Equations", subject: "Mathematics", duration: "04h 10m" },
      { id: "M4", videoId: "", title: "Complex Numbers", subject: "Mathematics", duration: "04h 50m" },
      { id: "M5", videoId: "", title: "Matrices & Determinants", subject: "Mathematics", duration: "05h 20m" },
      { id: "M6", videoId: "", title: "Binomial Theorem", subject: "Mathematics", duration: "03h 40m" },
      { id: "M7", videoId: "", title: "Sequence & Series", subject: "Mathematics", duration: "04h 15m" },
      { id: "M8", videoId: "", title: "Limits Continuity & Differentiability", subject: "Mathematics", duration: "06h 30m" },
      { id: "M9", videoId: "", title: "Application of Derivatives", subject: "Mathematics", duration: "05h 10m" },
      { id: "M10", videoId: "", title: "Indefinite & Definite Integration", subject: "Mathematics", duration: "07h 00m" },
      { id: "M11", videoId: "", title: "Differential Equations", subject: "Mathematics", duration: "03h 50m" },
      { id: "M12", videoId: "", title: "Vector Algebra", subject: "Mathematics", duration: "04h 25m" },
      { id: "M13", videoId: "", title: "3D Geometry", subject: "Mathematics", duration: "03h 45m" },
      { id: "M14", videoId: "", title: "Probability", subject: "Mathematics", duration: "04h 05m" },
      { id: "M15", videoId: "", title: "Statistics", subject: "Mathematics", duration: "02h 30m" },
    ]
  },
  {
    id: "PLxyGaR3hEy3hVmPjmool3j3U78cTYxYq-",
    subject: "Physical Chemistry",
    url: "https://youtube.com/playlist?list=PLxyGaR3hEy3hVmPjmool3j3U78cTYxYq-",
    lectures: [
      { id: "PC1", videoId: "", title: "Mole Concept", subject: "Physical Chemistry", duration: "04h 20m" },
      { id: "PC2", videoId: "", title: "Atomic Structure", subject: "Physical Chemistry", duration: "05h 10m" },
      { id: "PC3", videoId: "", title: "Chemical Thermodynamics", subject: "Physical Chemistry", duration: "06h 00m" },
      { id: "PC4", videoId: "", title: "Chemical & Ionic Equilibrium", subject: "Physical Chemistry", duration: "06h 45m" },
      { id: "PC5", videoId: "", title: "Redox Reactions", subject: "Physical Chemistry", duration: "03h 15m" },
      { id: "PC6", videoId: "", title: "Solutions", subject: "Physical Chemistry", duration: "04h 30m" },
      { id: "PC7", videoId: "", title: "Electrochemistry", subject: "Physical Chemistry", duration: "05h 25m" },
      { id: "PC8", videoId: "", title: "Chemical Kinetics", subject: "Physical Chemistry", duration: "04h 15m" },
    ]
  },
  {
    id: "PLxyGaR3hEy3jWivnsFTb5uvzpHZK3qvDj",
    subject: "Organic Chemistry",
    url: "https://youtube.com/playlist?list=PLxyGaR3hEy3jWivnsFTb5uvzpHZK3qvDj",
    lectures: [
      { id: "OC1", videoId: "", title: "IUPAC Nomenclature", subject: "Organic Chemistry", duration: "03h 30m" },
      { id: "OC2", videoId: "", title: "Isomerism", subject: "Organic Chemistry", duration: "04h 20m" },
      { id: "OC3", videoId: "", title: "General Organic Chemistry (GOC)", subject: "Organic Chemistry", duration: "07h 15m" },
      { id: "OC4", videoId: "", title: "Hydrocarbons", subject: "Organic Chemistry", duration: "06h 10m" },
      { id: "OC5", videoId: "", title: "Haloalkanes & Haloarenes", subject: "Organic Chemistry", duration: "04h 45m" },
      { id: "OC6", videoId: "", title: "Alcohols Phenols & Ethers", subject: "Organic Chemistry", duration: "05h 30m" },
      { id: "OC7", videoId: "", title: "Aldehydes Ketones & Carboxylic Acids", subject: "Organic Chemistry", duration: "06h 00m" },
      { id: "OC8", videoId: "", title: "Amines", subject: "Organic Chemistry", duration: "03h 50m" },
      { id: "OC9", videoId: "", title: "Biomolecules", subject: "Organic Chemistry", duration: "04h 15m" },
    ]
  },
  {
    id: "PLxyGaR3hEy3hUTwPWVhqBOR0l_1o3vyCs",
    subject: "Inorganic Chemistry",
    url: "https://youtube.com/playlist?list=PLxyGaR3hEy3hUTwPWVhqBOR0l_1o3vyCs",
    lectures: [
      { id: "IOC1", videoId: "", title: "Periodic Classification", subject: "Inorganic Chemistry", duration: "03h 20m" },
      { id: "IOC2", videoId: "", title: "Chemical Bonding", subject: "Inorganic Chemistry", duration: "06h 15m" },
      { id: "IOC3", videoId: "", title: "Coordination Compounds", subject: "Inorganic Chemistry", duration: "05h 10m" },
      { id: "IOC4", videoId: "", title: "d- and f-Block Elements", subject: "Inorganic Chemistry", duration: "04h 30m" },
      { id: "IOC5", videoId: "", title: "p-Block Essentials", subject: "Inorganic Chemistry", duration: "06h 45m" },
    ]
  }
];
