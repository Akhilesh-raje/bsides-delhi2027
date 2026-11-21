/**
 * Neo-Delhi 3D Cybersecurity Conference
 * Speaker Directory & Talk Abstracts
 *
 * Lineup of world-class security researchers, zero-day developers,
 * cryptographers, and hardware reverse engineers speaking at BSides Delhi 2027.
 */

export interface SpeakerSocials {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

export interface Speaker {
  id: string;
  name: string;
  handle: string;
  role: string;
  company: string;
  avatar: string;
  bio: string;
  talkTitle: string;
  talkAbstract: string;
  track: "offensive" | "defense" | "ai-security" | "hardware-iot" | "crypto-privacy" | "cloud-devsecops";
  keynote: boolean;
  featured: boolean;
  day: 1 | 2;
  time: string;
  stage: string;
  socials: SpeakerSocials;
  tags: string[];
}

export const SPEAKERS: Speaker[] = [
  {
    id: "arjun-bhardwaj",
    name: "Dr. Arjun Bhardwaj",
    handle: "@kernel_drifter",
    role: "Chief Research Scientist",
    company: "Vanguard Exploit Labs",
    avatar: "/speakers/arjun-bhardwaj.jpg",
    bio: "Pioneer in mobile kernel security with over a decade of low-level vulnerability research. Author of several seminal zero-click iOS sandbox escape exploits and regular speaker at Black Hat, DEF CON, and CanSecWest.",
    talkTitle: "Dissecting Zero-Click Remote Code Execution: From Apple Baseband to Kernel Space",
    talkAbstract:
      "This keynote deconstructs the architecture of contemporary zero-click iMessage and cellular baseband exploit chains. We trace the path of an over-the-air packet from raw Shannon baseband demodulation through Mach message IPC to arbitrary kernel write primitives, illustrating how modern memory safety mitigations (PAC, SPTM, and PPL) were systematically bypassed.",
    track: "offensive",
    keynote: true,
    featured: true,
    day: 1,
    time: "10:00 - 11:00 AM",
    stage: "Hall Ashoka (Main Arena)",
    socials: {
      twitter: "https://x.com/kernel_drifter",
      github: "https://github.com/kernel-drifter",
      linkedin: "https://linkedin.com/in/arjun-bhardwaj-cyber",
    },
    tags: ["iOS", "Zero-Click", "Baseband", "Kernel", "PAC Bypass"],
  },
  {
    id: "elena-rostova",
    name: "Elena Rostova",
    handle: "@glitch_witch",
    role: "Hardware Security Architect",
    company: "ZeroFlux Security",
    avatar: "/speakers/elena-rostova.jpg",
    bio: "Hardware reverse engineer and physical security researcher specializing in electromagnetic fault injection (EMFI) and power side-channel analysis. She has designed secure cryptoprocessors and audited automotive ECUs across Europe and Asia.",
    talkTitle: "Faulting the Unfaultable: Laser & Voltage Glitching Secure Elements in Critical Transit",
    talkAbstract:
      "Smart cards, electronic passports, and railway ticketing tokens rely on secure cryptoprocessors rated at Common Criteria EAL6+. In this session, Elena presents benchtop hardware attack setups utilizing custom pulsed-laser diodes and precision FPGA voltage glitchers capable of bypassing RSA key verification in modern transport smart cards within microseconds.",
    track: "hardware-iot",
    keynote: true,
    featured: true,
    day: 1,
    time: "11:15 AM - 12:15 PM",
    stage: "Hall Ashoka (Main Arena)",
    socials: {
      twitter: "https://x.com/glitch_witch",
      github: "https://github.com/zeroflux-hw",
      website: "https://glitchwitch.sec",
    },
    tags: ["Hardware", "EMFI", "Fault Injection", "Smart Cards", "DMRC"],
  },
  {
    id: "tanya-kapoor",
    name: "Tanya Kapoor",
    handle: "@cipher_tanya",
    role: "Principal Cryptographer",
    company: "Post-Quantum Initiative India",
    avatar: "/speakers/tanya-kapoor.jpg",
    bio: "Cryptographic researcher leading national initiatives on Post-Quantum Cryptography transition. Tanya contributes to NIST PQC standardization benchmarks and designs zero-knowledge proof architectures for privacy-preserving identities.",
    talkTitle: "Surviving the Quantum Horizon: Practical Migration to ML-KEM and ML-DSA at Scale",
    talkAbstract:
      "With NIST finalizing post-quantum standards, organizations face a monumental cryptographic migration. This session explores practical challenges in swapping RSA/ECC for Kyber (ML-KEM) and Dilithium (ML-DSA) across legacy TLS stacks, hardware security modules, and constrained IoT gateways without crippling handshake latency.",
    track: "crypto-privacy",
    keynote: false,
    featured: true,
    day: 1,
    time: "01:30 - 02:15 PM",
    stage: "Hall Chanakya (Cryptex)",
    socials: {
      twitter: "https://x.com/cipher_tanya",
      github: "https://github.com/tanyakapoor",
      linkedin: "https://linkedin.com/in/tanya-kapoor-crypto",
    },
    tags: ["PQC", "ML-KEM", "Cryptography", "NIST", "Zero-Knowledge"],
  },
  {
    id: "dev-rathee",
    name: "Dev Rathee",
    handle: "@dev_redteam",
    role: "Director of Adversary Simulation",
    company: "Apex Offensive",
    avatar: "/speakers/dev-rathee.jpg",
    bio: "Red team operator who has simulated advanced persistent threat (APT) groups against Fortune 100 banks and government ministries. Passionate about Active Directory forest compromise and covert C2 infrastructure.",
    talkTitle: "Crown Jewels in 45 Minutes: Abusing Cross-Tenant Entra ID Trusts and Golden Certificates",
    talkAbstract:
      "When perimeter firewalls hold, hybrid identity brokers become the prime avenue of infiltration. Dev walks through an end-to-end red team engagement where a single misconfigured certificate template in Active Directory Certificate Services (AD CS) allowed forging Golden Certificates and pivoting seamlessly into Azure Entra ID global admin privileges.",
    track: "offensive",
    keynote: false,
    featured: true,
    day: 1,
    time: "02:30 - 03:15 PM",
    stage: "Hall Ashoka (Main Arena)",
    socials: {
      twitter: "https://x.com/dev_redteam",
      github: "https://github.com/apex-offensive",
    },
    tags: ["Red Team", "Active Directory", "ADCS", "Entra ID", "Cloud Pivot"],
  },
  {
    id: "maya-nair",
    name: "Maya Nair",
    handle: "@ebpf_huntress",
    role: "Lead Threat Hunter",
    company: "Sentinel Cloud Security",
    avatar: "/speakers/maya-nair.jpg",
    bio: "Kernel hacker turned threat hunter. Maya specializes in developing high-throughput Linux detection engines using extended Berkeley Packet Filters (eBPF) to detect in-memory rootkits and evasive container breakouts.",
    talkTitle: "eBPF vs The Ghost in the Ring 0: Detecting Covert Linux Rootkits in Kubernetes",
    talkAbstract:
      "Attackers are shifting stealth techniques to kernel modules and hidden BPF tracepoint hooks. This talk unveils how defenders can weaponize eBPF probes against kernel-level malware, monitoring LSM hooks, sys_call_table overwrites, and kprobe hijacking with sub-microsecond latency and zero kernel instability.",
    track: "defense",
    keynote: false,
    featured: true,
    day: 1,
    time: "03:30 - 04:15 PM",
    stage: "Hall Chanakya (Blue Chamber)",
    socials: {
      twitter: "https://x.com/ebpf_huntress",
      github: "https://github.com/mayanair-sec",
      linkedin: "https://linkedin.com/in/maya-nair-dfir",
    },
    tags: ["eBPF", "Kubernetes", "Linux Kernel", "Rootkits", "Threat Hunting"],
  },
  {
    id: "sameer-sharma",
    name: "Sameer Sharma",
    handle: "@prompt_injector",
    role: "Head of AI Red Teaming",
    company: "NeuroSec Labs",
    avatar: "/speakers/sameer-sharma.jpg",
    bio: "AI security pioneer investigating vulnerabilities in autonomous agent ecosystems, multi-modal foundation models, and vector database architectures. Co-author of the OWASP Top 10 for Large Language Models.",
    talkTitle: "Hijacking the Agentic Mind: Indirect Prompt Injections in Multi-Modal Autonomous Workflows",
    talkAbstract:
      "As software engineering and DevOps teams delegate bash execution, API calling, and database queries to AI agents, indirect prompt injection becomes the new SQL injection. Sameer reveals novel attack vectors where adversarial images and hidden zero-width unicode in git PRs cause automated agents to exfiltrate AWS credentials and back-door production clusters.",
    track: "ai-security",
    keynote: true,
    featured: true,
    day: 2,
    time: "09:30 - 10:30 AM",
    stage: "Hall Ashoka (Main Arena)",
    socials: {
      twitter: "https://x.com/prompt_injector",
      github: "https://github.com/sameersharma-ai",
      website: "https://neurosec.ai",
    },
    tags: ["LLM Security", "Prompt Injection", "AI Agents", "MCP", "OWASP AI"],
  },
  {
    id: "vikramaditya-sen",
    name: "Vikramaditya Sen",
    handle: "@scada_vulture",
    role: "Senior ICS/SCADA Security Consultant",
    company: "Indus Grid Defense",
    avatar: "/speakers/vikramaditya-sen.jpg",
    bio: "Industrial control system engineer who has hardened regional power grids, nuclear facilities, and smart city metro transit systems across South Asia.",
    talkTitle: "Subverting Communications-Based Train Control (CBTC): The Anatomy of an Urban Metro Cyber Incident",
    talkAbstract:
      "Urban metro railways depend on Wireless CBTC systems operating on shared 2.4/5.8 GHz ISM bands or dedicated LTE-M spectrum. Vikram walks through the RF protocols, packet framing, and safety interlocks governing wayside zone controllers and on-board train automatic controllers (ATO/ATP), outlining defensive strategies against spoofed signaling packets.",
    track: "hardware-iot",
    keynote: false,
    featured: true,
    day: 2,
    time: "11:00 - 11:45 AM",
    stage: "Hall Aryabhata & Palika Sub-level",
    socials: {
      twitter: "https://x.com/scada_vulture",
      linkedin: "https://linkedin.com/in/vikram-sen-scada",
    },
    tags: ["SCADA", "ICS", "Metro Transit", "CBTC", "Critical Infrastructure"],
  },
  {
    id: "aarti-choudhary",
    name: "Aarti Choudhary",
    handle: "@cloud_contain",
    role: "Staff Security Architect",
    company: "HyperScale Defense",
    avatar: "/speakers/aarti-choudhary.jpg",
    bio: "Kubernetes SIG-Security contributor and cloud penetration tester. Aarti has spent years auditing hyperscaler control planes and container runtimes.",
    talkTitle: "Escaping the Sandbox: Novel Linux Namespaces & cgroups v2 Breakouts in Production Kubernetes",
    talkAbstract:
      "Container sandboxing relies on delicate interactions between kernel namespaces, seccomp filters, and cgroup hierarchies. This technical deep-dive demonstrates how unprivileged containers can leverage newly disclosed kernel primitives in user namespaces to achieve host root execution and drain entire production clusters.",
    track: "cloud-devsecops",
    keynote: false,
    featured: false,
    day: 2,
    time: "12:00 - 12:45 PM",
    stage: "Hall Aryabhata (DevSec Hub)",
    socials: {
      twitter: "https://x.com/cloud_contain",
      github: "https://github.com/aartichoudhary",
    },
    tags: ["Kubernetes", "Container Escape", "cgroups", "Linux", "Cloud Native"],
  },
  {
    id: "karan-verma",
    name: "Karan Verma",
    handle: "@dfir_karan",
    role: "Head of Cyber Forensics",
    company: "Metropolis CIRT",
    avatar: "/speakers/karan-verma.jpg",
    bio: "Digital forensics incident response specialist who has led triage operations for high-profile national ransomware incidents, state-sponsored supply chain hacks, and SWIFT banking heists.",
    talkTitle: "Ghost in the Pagefile: Advanced Volatile Memory Reconstruction in Sophisticated Ransomware Campaigns",
    talkAbstract:
      "When threat actors employ fileless reflective DLL injection and wipe event logs, volatile physical memory holds the only uncorrupted source of truth. Karan showcases live memory acquisition and timeline reconstruction using Volatility 3 and custom Rekall plugins to uncover C2 beaconing and decrypt staging payloads.",
    track: "defense",
    keynote: false,
    featured: false,
    day: 2,
    time: "02:00 - 02:45 PM",
    stage: "Hall Chanakya (Blue Chamber)",
    socials: {
      twitter: "https://x.com/dfir_karan",
      linkedin: "https://linkedin.com/in/karan-verma-dfir",
    },
    tags: ["DFIR", "Memory Forensics", "Ransomware", "Volatility", "Incident Response"],
  },
  {
    id: "simran-kaur",
    name: "Simran Kaur",
    handle: "@zk_simran",
    role: "Cryptographic Protocol Engineer",
    company: "Verifiable Systems",
    avatar: "/speakers/simran-kaur.jpg",
    bio: "Zero-knowledge proof researcher and privacy advocate. Simran designs succinct non-interactive arguments of knowledge (SNARKs/STARKs) for decentralized identity verification.",
    talkTitle: "Zero-Knowledge Identity Verification: Authenticating Without Exposing Personal Identifiable Information",
    talkAbstract:
      "Balancing regulatory compliance with user privacy requires cutting-edge cryptography. This talk unpacks how Groth16 and PLONK proof systems allow conference attendees and digital citizens to mathematically prove ticket validity, age, or authorization tokens without divulging their legal name or underlying credentials.",
    track: "crypto-privacy",
    keynote: false,
    featured: false,
    day: 2,
    time: "03:00 - 03:45 PM",
    stage: "Hall Chanakya (Cryptex)",
    socials: {
      twitter: "https://x.com/zk_simran",
      github: "https://github.com/simrankaur-crypto",
    },
    tags: ["Zero-Knowledge", "SNARKs", "Privacy", "Identity", "Cryptography"],
  },
];

/** Retrieve all registered speakers */
export function getAllSpeakers(): Speaker[] {
  return SPEAKERS;
}

/** Retrieve speaker by unique ID or slug */
export function getSpeakerBySlug(slug: string): Speaker | undefined {
  return SPEAKERS.find((s) => s.id === slug);
}

/** Retrieve all keynote speakers */
export function getKeynoteSpeakers(): Speaker[] {
  return SPEAKERS.filter((s) => s.keynote);
}

/** Retrieve all featured speakers for carousel / highlights */
export function getFeaturedSpeakers(): Speaker[] {
  return SPEAKERS.filter((s) => s.featured);
}

/** Retrieve speakers by specific technical track */
export function getSpeakersByTrack(track: string): Speaker[] {
  return SPEAKERS.filter((s) => s.track === track);
}
