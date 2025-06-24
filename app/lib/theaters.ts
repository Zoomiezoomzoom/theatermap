export interface Theater {
  id: string;
  name: string;
  status: "open" | "opening-soon" | "closed";
  submissionTypes: string[];
  fee: number;
  deadline: string;
  deadlineType: "fixed" | "rolling";
  responseTime: string;
  website: string;
  description: string;
  lastUpdated: string;
  userSubmissionCount: number;
  genre: string[];
  theaterSize: "major" | "mid-size" | "small-fringe";
  contactInfo?: string;
  guidelines?: string;
  tips?: string[];
  imageUrl?: string;
}

export const theaters: Theater[] = [
  {
    id: "magic-theatre",
    name: "Magic Theatre",
    status: "open",
    submissionTypes: ["full-length", "contemporary"],
    fee: 25,
    deadline: "2025-04-30",
    deadlineType: "fixed",
    responseTime: "3-6 months",
    website: "https://magictheatre.org/submissions",
    description: "Seeking bold new American plays that challenge and inspire",
    lastUpdated: "2025-01-15",
    userSubmissionCount: 12,
    genre: ["contemporary", "new-works"],
    theaterSize: "major",
    contactInfo: "literary@magictheatre.org",
    guidelines: "Full-length plays only. No musicals. Contemporary American themes preferred.",
    tips: ["They respond quickly", "Great feedback even on rejections", "Looking for diverse voices"],
    imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: "sf-playhouse",
    name: "San Francisco Playhouse",
    status: "open",
    submissionTypes: ["full-length", "musicals"],
    fee: 0,
    deadline: "rolling",
    deadlineType: "rolling",
    responseTime: "4-8 months",
    website: "https://sfplayhouse.org/submissions",
    description: "Producing new works and reimagined classics in intimate settings",
    lastUpdated: "2025-01-12",
    userSubmissionCount: 8,
    genre: ["contemporary", "musical", "new-works"],
    theaterSize: "major",
    contactInfo: "submissions@sfplayhouse.org",
    guidelines: "Full-length plays and musicals. Strong character development required.",
    tips: ["Very selective", "Likes character-driven stories", "Musicals need strong book"],
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: "cutting-ball",
    name: "Cutting Ball Theater",
    status: "opening-soon",
    submissionTypes: ["experimental", "avant-garde"],
    fee: 15,
    deadline: "2025-03-15",
    deadlineType: "fixed",
    responseTime: "2-4 months",
    website: "https://cuttingball.com/submit",
    description: "Experimental theater pushing boundaries of form and content",
    lastUpdated: "2025-01-10",
    userSubmissionCount: 5,
    genre: ["experimental", "avant-garde"],
    theaterSize: "small-fringe",
    contactInfo: "info@cuttingball.com",
    guidelines: "Experimental works only. Traditional plays not accepted.",
    tips: ["Very experimental", "Likes non-traditional forms", "Small but influential"]
  },
  {
    id: "marin-theatre",
    name: "Marin Theatre Company",
    status: "open",
    submissionTypes: ["full-length", "contemporary"],
    fee: 20,
    deadline: "2025-05-31",
    deadlineType: "fixed",
    responseTime: "3-5 months",
    website: "https://marintheatre.org/submissions",
    description: "New American plays that speak to contemporary audiences",
    lastUpdated: "2025-01-08",
    userSubmissionCount: 15,
    genre: ["contemporary", "new-works"],
    theaterSize: "mid-size",
    contactInfo: "literary@marintheatre.org",
    guidelines: "Full-length contemporary plays. No period pieces.",
    tips: ["Good for emerging playwrights", "Professional development opportunities", "Strong community focus"]
  },
  {
    id: "berkeley-rep",
    name: "Berkeley Repertory Theatre",
    status: "closed",
    submissionTypes: ["full-length", "classical"],
    fee: 30,
    deadline: "2024-12-31",
    deadlineType: "fixed",
    responseTime: "6-12 months",
    website: "https://berkeleyrep.org/submissions",
    description: "World-class theater with international reputation",
    lastUpdated: "2024-12-15",
    userSubmissionCount: 25,
    genre: ["contemporary", "classical", "new-works"],
    theaterSize: "major",
    contactInfo: "literary@berkeleyrep.org",
    guidelines: "Full-length plays only. Very competitive. International submissions accepted.",
    tips: ["Extremely competitive", "Likes political themes", "Strong production values required"],
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: "shotgun-players",
    name: "Shotgun Players",
    status: "open",
    submissionTypes: ["full-length", "political"],
    fee: 0,
    deadline: "rolling",
    deadlineType: "rolling",
    responseTime: "2-3 months",
    website: "https://shotgunplayers.org/submit",
    description: "Political theater that challenges and provokes",
    lastUpdated: "2025-01-14",
    userSubmissionCount: 7,
    genre: ["contemporary", "political"],
    theaterSize: "mid-size",
    contactInfo: "submissions@shotgunplayers.org",
    guidelines: "Political or socially relevant themes preferred. Full-length plays.",
    tips: ["Likes political content", "Quick responses", "Community engagement important"]
  },
  {
    id: "custom-made",
    name: "Custom Made Theatre Co.",
    status: "open",
    submissionTypes: ["full-length", "contemporary"],
    fee: 10,
    deadline: "2025-06-30",
    deadlineType: "fixed",
    responseTime: "4-6 months",
    website: "https://custommadetheatre.com/submissions",
    description: "Intimate theater focusing on character-driven stories",
    lastUpdated: "2025-01-11",
    userSubmissionCount: 3,
    genre: ["contemporary", "new-works"],
    theaterSize: "small-fringe",
    contactInfo: "info@custommadetheatre.com",
    guidelines: "Character-driven plays. Small cast preferred (2-6 actors).",
    tips: ["Intimate productions", "Good for character studies", "Small but growing"]
  },
  {
    id: "z-space",
    name: "Z Space",
    status: "opening-soon",
    submissionTypes: ["experimental", "dance-theater"],
    fee: 20,
    deadline: "2025-02-28",
    deadlineType: "fixed",
    responseTime: "3-4 months",
    website: "https://zspace.org/submissions",
    description: "Experimental performance space for innovative works",
    lastUpdated: "2025-01-09",
    userSubmissionCount: 4,
    genre: ["experimental", "dance-theater"],
    theaterSize: "small-fringe",
    contactInfo: "submissions@zspace.org",
    guidelines: "Experimental works, dance-theater, and interdisciplinary pieces.",
    tips: ["Very experimental", "Likes interdisciplinary work", "Good for avant-garde artists"]
  },
  {
    id: "theatre-rhinoceros",
    name: "Theatre Rhinoceros",
    status: "open",
    submissionTypes: ["full-length", "lgbtq"],
    fee: 0,
    deadline: "rolling",
    deadlineType: "rolling",
    responseTime: "2-4 months",
    website: "https://therhino.org/submissions",
    description: "LGBTQ+ focused theater company",
    lastUpdated: "2025-01-13",
    userSubmissionCount: 6,
    genre: ["contemporary", "lgbtq"],
    theaterSize: "small-fringe",
    contactInfo: "submissions@therhino.org",
    guidelines: "LGBTQ+ themes and characters. Full-length plays preferred.",
    tips: ["LGBTQ+ focused", "Supportive of new voices", "Community-oriented"]
  },
  {
    id: "crowded-fire",
    name: "Crowded Fire Theater",
    status: "open",
    submissionTypes: ["full-length", "contemporary"],
    fee: 15,
    deadline: "2025-07-31",
    deadlineType: "fixed",
    responseTime: "3-5 months",
    website: "https://crowdedfire.org/submissions",
    description: "New plays that reflect the diversity of our world",
    lastUpdated: "2025-01-07",
    userSubmissionCount: 9,
    genre: ["contemporary", "new-works"],
    theaterSize: "mid-size",
    contactInfo: "literary@crowdedfire.org",
    guidelines: "Diverse voices and perspectives. Full-length contemporary plays.",
    tips: ["Diversity-focused", "Good feedback", "Supportive environment"]
  }
];

export const statusOptions = [
  { value: "all", label: "All" },
  { value: "open", label: "Currently Open" },
  { value: "opening-soon", label: "Opening Soon" },
  { value: "closed", label: "Closed" }
];

export const genreOptions = [
  { value: "all", label: "All" },
  { value: "new-works", label: "New Works" },
  { value: "contemporary", label: "Contemporary" },
  { value: "classical", label: "Classical" },
  { value: "musical", label: "Musical" },
  { value: "experimental", label: "Experimental" },
  { value: "political", label: "Political" },
  { value: "lgbtq", label: "LGBTQ+" }
];

export const feeOptions = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "under25", label: "Under $25" },
  { value: "25plus", label: "$25+" }
];

export const sizeOptions = [
  { value: "all", label: "All" },
  { value: "major", label: "Major" },
  { value: "mid-size", label: "Mid-size" },
  { value: "small-fringe", label: "Small/Fringe" }
]; 