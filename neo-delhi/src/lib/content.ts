// All site copy lives here. Anything marked TBA / tentative is placeholder — replace before launch.

export const EVENT = {
  name: "BSides Delhi 2027",
  dates: "February 13–14, 2027",
  city: "New Delhi",
  venue: "Venue announcing soon",
  // TODO: real addresses / links
  cfpUrl: "#speakers",
  contactEmail: "",
};

export const SECTIONS = ["hero", "about", "speakers", "agenda", "villages", "sponsors", "tickets"] as const;

export const NAV = [
  { label: "About", href: "#about" },
  { label: "Speakers", href: "#speakers" },
  { label: "Agenda", href: "#agenda" },
  { label: "Villages & CTF", href: "#villages" },
  { label: "Sponsors", href: "#sponsors" },
];

export const STATS = [
  { value: "2", label: "days" },
  { value: "3", label: "tracks" },
  { value: "24h", label: "CTF" },
  { value: "∞", label: "chai" },
];

export const SPEAKERS = [
  { role: "Keynote", name: "To be announced", topic: "Day 1 opening keynote" },
  { role: "Keynote", name: "To be announced", topic: "Day 2 opening keynote" },
  { role: "Main track", name: "Call for papers open", topic: "Offensive, defensive, research" },
  { role: "Workshops", name: "Call for trainers open", topic: "Hands-on, 2–4 hour labs" },
];

export const AGENDA = [
  {
    day: "Day 1 · Feb 13",
    slots: [
      ["09:00", "Registration & chai"],
      ["10:00", "Opening keynote"],
      ["11:00", "Talks — main track"],
      ["13:00", "Lunch · villages open"],
      ["14:00", "Workshops & talks"],
      ["18:00", "CTF kickoff"],
    ],
  },
  {
    day: "Day 2 · Feb 14",
    slots: [
      ["09:30", "Chai & CTF continues"],
      ["10:00", "Day 2 keynote"],
      ["11:00", "Talks — main track"],
      ["14:00", "Lightning talks"],
      ["16:00", "CTF ends · prizes"],
      ["17:00", "Closing & community meetup"],
    ],
  },
];

// Also used as the neon signboards in the Chandni Chowk scene.
export const VILLAGES = [
  { name: "CTF", hi: "सीटीएफ", desc: "24-hour jeopardy CTF, beginner to brutal." },
  { name: "Hardware", hi: "हार्डवेयर", desc: "Badges, soldering, UART and firmware." },
  { name: "Red Team", hi: "रेड टीम", desc: "Adversary emulation and live labs." },
  { name: "Cloud", hi: "क्लाउड", desc: "Break and fix misconfigured cloud." },
  { name: "Lockpick", hi: "ताला", desc: "Physical security, hands on." },
  { name: "Careers", hi: "करियर", desc: "Resume reviews and mentor meetups for students." },
];

export const SPONSOR_TIERS = ["Platinum", "Gold", "Silver", "Community"];


// HUD cards shown beside each chapter (real coordinates and facts).
export const HUD: Record<string, { name: string; hi: string; coords: string; facts: string[] }> = {
  hero: { name: "India Gate", hi: "इंडिया गेट", coords: "28.6129° N · 77.2295° E", facts: ["Built 1921–1931", "Height 42 m", "Kartavya Path"] },
  about: { name: "Rajiv Chowk", hi: "राजीव चौक", coords: "28.6328° N · 77.2197° E", facts: ["Delhi Metro interchange", "Yellow + Blue lines", "Platform 1"] },
  speakers: { name: "Connaught Place", hi: "कनॉट प्लेस", coords: "28.6315° N · 77.2167° E", facts: ["Built 1929–1933", "Georgian colonnades", "Central Park"] },
  agenda: { name: "Qutub Minar", hi: "क़ुतुब मीनार", coords: "28.5244° N · 77.1855° E", facts: ["Built 1199 CE", "Height 72.5 m", "UNESCO World Heritage"] },
  villages: { name: "Chandni Chowk", hi: "चाँदनी चौक", coords: "28.6562° N · 77.2309° E", facts: ["Laid out 1650", "Jama Masjid, 1656", "Old Delhi"] },
  sponsors: { name: "Jantar Mantar", hi: "जंतर मंतर", coords: "28.6271° N · 77.2166° E", facts: ["Built 1724", "13 astronomical instruments", "Samrat Yantra: 21 m sundial"] },
};
