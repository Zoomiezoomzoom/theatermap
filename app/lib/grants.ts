export interface Grant {
  id: number;
  name: string;
  organization?: string;
  deadline: string;
  amount: string;
  description: string;
  url: string;
  category: string;
  location: string;
  eligibility: string;
  type: string;
  notes?: string;
  image?: string;
  requirements?: string[];
  applicationProcess?: string[];
  contactEmail?: string;
}

export const categories = {
  federal: "National Endowment for the Arts and other federal programs",
  state: "California Arts Council and state-level programs",
  municipal: "San Francisco city government grants",
  regional: "Bay Area regional organizations like Theatre Bay Area",
  private: "Private foundations and corporate giving programs",
  award: "Recognition awards that may include monetary prizes",
  fellowship: "Individual artist fellowships and residencies",
  emergency: "Emergency assistance for artists in crisis"
};

export const grantTypes = {
  project: "Funding for specific theater productions or projects",
  operating: "General operating support for organizations",
  artist: "Individual artist grants and fellowships",
  program: "Ongoing program support",
  "multi-year": "Grants spanning multiple years",
  residency: "Artist residency programs",
  emergency: "Crisis/emergency assistance",
  payroll: "Funding specifically for artist wages"
};

export const grants: Grant[] = [
  {
    id: 1,
    name: "Theatre Bay Area CA$H Grant",
    organization: "Theatre Bay Area",
    deadline: "2025-08-15",
    amount: "$500 - $5,000",
    description: "Creative Assistance for the Small (Organization) and Hungry (Artist) - supports individual theatre artists and small theatre companies in the SF Bay Area",
    url: "https://www.theatrebayarea.org/grants/cash/",
    category: "regional",
    location: "Bay Area",
    eligibility: "Bay Area theatre artists and small companies",
    type: "project",
    notes: "Three categories: CA$H Creates, CA$H Performs, CA$H Sustains",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf"
  },
  {
    id: 2,
    name: "San Francisco Arts Commission Individual Artist Grant",
    organization: "San Francisco Arts Commission",
    deadline: "2025-11-06",
    amount: "Up to $30,000",
    description: "For individual SF-based artists to fund works of art that take place in San Francisco",
    url: "https://www.sfartscommission.org/grants",
    category: "municipal",
    location: "San Francisco",
    eligibility: "SF-based individual artists",
    type: "project",
    notes: "Priority for historically marginalized communities",
    image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25"
  },
  {
    id: 3,
    name: "NEA Grants for Arts Projects",
    organization: "National Endowment for the Arts",
    deadline: "2025-07-20",
    amount: "$10,000 - $100,000",
    description: "Supports public engagement with, and access to, various forms of art across the nation, including theater and performing arts",
    url: "https://www.arts.gov/grants/grants-for-arts-projects",
    category: "federal",
    location: "United States",
    eligibility: "Nonprofit organizations, units of state or local government, federally recognized tribal communities",
    type: "project",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
  },
  {
    id: 4,
    name: "Hewlett Foundation Performing Arts Program",
    organization: "William and Flora Hewlett Foundation",
    deadline: "2025-09-30",
    amount: "$50,000 - $200,000",
    description: "Supporting Bay Area performing arts organizations to achieve artistic excellence and community engagement",
    url: "https://hewlett.org/programs/performing-arts/",
    category: "private",
    location: "Bay Area",
    eligibility: "Bay Area nonprofit performing arts organizations",
    type: "operating",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35"
  },
  {
    id: 5,
    name: "Kenneth Rainin Foundation NEW Program",
    organization: "Kenneth Rainin Foundation",
    deadline: "2025-10-15",
    amount: "$25,000 - $100,000",
    description: "Supporting the creation and presentation of new and experimental work in contemporary dance, theater and performance",
    url: "https://krfoundation.org/arts/grants/",
    category: "private",
    location: "Bay Area",
    eligibility: "Bay Area artists and arts organizations creating new theatrical works",
    type: "project",
    image: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212"
  },
  {
    id: 6,
    name: "California Arts Council Artists Fellowship",
    organization: "California Arts Council",
    deadline: "2025-12-01",
    amount: "$50,000",
    description: "Supporting individual artists in their artistic practice and professional development",
    url: "https://arts.ca.gov/grants/artists-fellowship/",
    category: "fellowship",
    location: "California",
    eligibility: "California-based individual artists",
    type: "artist",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"
  },
  {
    id: 7,
    name: "Theatre Bay Area Artist Relief Fund",
    organization: "Theatre Bay Area",
    deadline: "2025-12-31",
    amount: "Up to $2,000",
    description: "Emergency assistance for theater artists facing financial crisis due to COVID-19 or other emergencies",
    url: "https://www.theatrebayarea.org/relief",
    category: "emergency",
    location: "Bay Area",
    eligibility: "Bay Area theater artists in financial crisis",
    type: "emergency",
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca"
  },
  {
    id: 8,
    name: "Zellerbach Family Foundation Community Arts",
    organization: "Zellerbach Family Foundation",
    deadline: "2025-06-30",
    amount: "$5,000 - $15,000",
    description: "Supporting arts and culture that builds community engagement and enriches civic life",
    url: "https://zff.org/applying-for-a-grant/",
    category: "private",
    location: "Bay Area",
    eligibility: "Bay Area nonprofit arts organizations and fiscally sponsored projects",
    type: "project",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
  },
  {
    id: 9,
    name: "Berkeley Civic Arts Grants",
    organization: "City of Berkeley",
    deadline: "2025-03-15",
    amount: "$5,000 - $10,000",
    description: "Supporting arts and cultural activities that reflect Berkeley's cultural richness and diversity",
    url: "https://www.cityofberkeley.info/civic-arts/",
    category: "municipal",
    location: "Berkeley",
    eligibility: "Berkeley-based artists and arts organizations",
    type: "project",
    image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25"
  },
  {
    id: 10,
    name: "Silicon Valley Creates Project Support",
    organization: "Silicon Valley Creates",
    deadline: "2025-05-01",
    amount: "$2,500 - $7,500",
    description: "Supporting innovative arts projects that engage Silicon Valley communities",
    url: "https://www.svcreates.org/grants",
    category: "regional",
    location: "Silicon Valley",
    eligibility: "Artists and organizations in Santa Clara County",
    type: "project",
    image: "https://images.unsplash.com/photo-1504270997636-07ddfbd48945"
  },
  {
    id: 11,
    name: "California Arts Council Impact Projects",
    organization: "California Arts Council",
    deadline: "2025-04-15",
    amount: "$20,000 - $40,000",
    description: "Supporting collaborative projects that center the arts as a vehicle for social change",
    url: "https://arts.ca.gov/grants/impact-projects/",
    category: "state",
    location: "California",
    eligibility: "California nonprofit organizations and artist collectives",
    type: "project",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
  },
  {
    id: 12,
    name: "Dramatists Guild Foundation Emergency Grants",
    organization: "Dramatists Guild Foundation",
    deadline: "2025-12-31",
    amount: "Up to $5,000",
    description: "Providing emergency financial assistance to theater writers facing unforeseen circumstances",
    url: "https://dgf.org/programs/grants/",
    category: "emergency",
    location: "United States",
    eligibility: "Professional theater writers in crisis",
    type: "emergency",
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca"
  },
  {
    id: 13,
    name: "Playwrights Foundation Residency",
    organization: "Playwrights Foundation",
    deadline: "2025-08-30",
    amount: "$5,000 + Housing",
    description: "Three-month residency program for emerging playwrights to develop new work",
    url: "https://playwrightsfoundation.org/residency",
    category: "fellowship",
    location: "San Francisco",
    eligibility: "Early to mid-career playwrights",
    type: "residency",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"
  },
  {
    id: 14,
    name: "Oakland Cultural Funding Program",
    organization: "City of Oakland",
    deadline: "2025-02-28",
    amount: "$15,000 - $25,000",
    description: "Supporting arts and cultural projects that reflect Oakland's diverse communities",
    url: "https://www.oaklandca.gov/cultural-funding-program",
    category: "municipal",
    location: "Oakland",
    eligibility: "Oakland-based artists and organizations",
    type: "project",
    image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25"
  },
  {
    id: 15,
    name: "Doris Duke Performing Artist Awards",
    organization: "Doris Duke Charitable Foundation",
    deadline: "2025-07-01",
    amount: "$275,000",
    description: "Multi-year awards supporting performing artists to take creative risks and explore new artistic directions",
    url: "https://www.ddcf.org/grants/performing-artists/",
    category: "award",
    location: "United States",
    eligibility: "Established performing artists with significant body of work",
    type: "multi-year",
    image: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212"
  },
  {
    id: 16,
    name: "NEA Our Town",
    organization: "National Endowment for the Arts",
    deadline: "2025-09-15",
    amount: "$25,000 - $150,000",
    description: "Supporting creative placemaking projects that integrate arts into community development efforts",
    url: "https://www.arts.gov/grants/our-town",
    category: "federal",
    location: "United States",
    eligibility: "Partnerships between arts organizations and government entities",
    type: "project",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
  },
  {
    id: 17,
    name: "Gerbode Special Award in the Arts",
    organization: "Wallace Alexander Gerbode Foundation",
    deadline: "2025-11-15",
    amount: "$50,000",
    description: "Commission awards for Bay Area artists to create new theater works",
    url: "https://gerbode.org/special-awards-in-the-arts/",
    category: "award",
    location: "Bay Area",
    eligibility: "Professional Bay Area theater artists",
    type: "project",
    image: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212"
  },
  {
    id: 18,
    name: "California Relief Fund for Artists",
    organization: "California Arts Council",
    deadline: "2025-06-01",
    amount: "$1,000 - $5,000",
    description: "Emergency support for artists facing economic hardships",
    url: "https://arts.ca.gov/relief-fund/",
    category: "emergency",
    location: "California",
    eligibility: "California artists experiencing financial emergencies",
    type: "emergency",
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca"
  },
  {
    id: 19,
    name: "Marin Arts Council Grant",
    organization: "Marin Arts Council",
    deadline: "2025-03-01",
    amount: "$2,500 - $7,500",
    description: "Supporting arts projects and programs in Marin County",
    url: "https://marinarts.org/grants",
    category: "regional",
    location: "Marin County",
    eligibility: "Marin County artists and arts organizations",
    type: "project",
    image: "https://images.unsplash.com/photo-1504270997636-07ddfbd48945"
  },
  {
    id: 20,
    name: "California Performing Arts Equitable Payroll Fund",
    organization: "California Office of Small Business Advocate",
    deadline: "2025-08-01",
    amount: "Varies",
    description: "New $12.5M fund to help performing arts organizations pay living wages",
    url: "https://calosba.ca.gov/",
    category: "state",
    location: "California",
    eligibility: "CA nonprofit theaters, dance companies, choral groups, presenters",
    type: "payroll",
    notes: "New program launching 2025 - approximately 300 organizations expected to receive funding",
    image: "https://images.unsplash.com/photo-1547623542-de3ff5e36c45"
  }
];

// Add the rest of the grants here...

export const metadata = {
  lastUpdated: "2025-05-27",
  totalGrants: grants.length,
  note: "This database focuses on theater-specific grants available to Bay Area theater makers. Deadlines are estimated based on typical cycles - always verify current deadlines on official websites.",
  disclaimer: "Due to recent NEA grant cancellations under the Trump administration, federal funding landscape is changing rapidly. Several Bay Area theaters lost NEA grants in May 2025."
}; 