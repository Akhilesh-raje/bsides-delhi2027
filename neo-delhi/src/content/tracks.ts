/**
 * Neo-Delhi 3D Cybersecurity Conference
 * Track Definitions & Themes
 *
 * Defines the core technical tracks for BSides Delhi 2027, mapping directly
 * to conference stages across Hall Ashoka, Hall Chanakya, Hall Aryabhata,
 * and the Subterranean Cyber Bunker.
 */

export interface Track {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  description: string;
  detailedDescription: string;
  color: string;
  badgeBg: string;
  room: string;
  icon: string;
  topics: string[];
  targetAudience: string[];
}

export const TRACKS: Track[] = [
  {
    id: "offensive",
    name: "Offensive Operations & Zero-Day Research",
    shortName: "Offensive",
    slug: "offensive",
    color: "#D62E42", // Signal red
    badgeBg: "rgba(214, 46, 66, 0.15)",
    room: "Hall Ashoka (Main Arena)",
    icon: "crosshair",
    description: "Cutting-edge vulnerability research, kernel exploit development, hypervisor escapes, and modern red team evasion tactics.",
    detailedDescription:
      "Deep dive into state-of-the-art offensive security. From exploiting macOS/iOS XNU kernel memory allocators and bypasses for modern Windows Exploit Guard mitigations to weaponizing novel Active Directory certificate anomalies, this track explores the frontier where attackers operate.",
    topics: [
      "Modern Heap Exploitation & Mitigations",
      "Browser Sandbox & V8 JIT Zero-Days",
      "EDR Internals Hooking & Unhooking",
      "Active Directory & Kerberos Exploitation",
      "Zero-Click Mobile Exploitation Pipelines",
      "Living-off-the-Land (LotL) Tactics in Cloud Environments",
    ],
    targetAudience: [
      "Penetration Testers",
      "Red Team Operators",
      "Vulnerability Researchers",
      "Exploit Developers",
    ],
  },
  {
    id: "defense",
    name: "Defensive Architecture, Blue Team & Threat Hunting",
    shortName: "Defense & DFIR",
    slug: "defense",
    color: "#00E5FF", // Cyan glow
    badgeBg: "rgba(0, 229, 255, 0.15)",
    room: "Hall Chanakya (Blue Chamber)",
    icon: "shield-check",
    description: "Next-gen SOC engineering, threat hunting at petabyte scale, forensic deep dives, and autonomic incident response.",
    detailedDescription:
      "Defenders face an asymmetrical challenge. This track focuses on building resilient telemetry pipelines, detecting subtle kernel rootkits, behavioral threat modeling, and reconstructing complex multi-stage nation-state APT campaigns through memory and disk forensics.",
    topics: [
      "eBPF-driven Linux Telemetry & Detection",
      "Memory Forensics with Volatility 3 on Modern Kernels",
      "Zero-Trust Identity Federation Architecture",
      "Hunting LOLBAS with Sigma & YARA-L Rules",
      "Autonomous Incident Triage via LLM Co-pilots",
      "Cloud Infrastructure Attack Surface Management",
    ],
    targetAudience: [
      "SOC Analysts",
      "Incident Responders",
      "Detection Engineers",
      "Security Architects",
      "Threat Hunters",
    ],
  },
  {
    id: "ai-security",
    name: "AI/LLM Security & Adversarial Machine Learning",
    shortName: "AI Red Teaming",
    slug: "ai-security",
    color: "#BD00FF", // Neon purple
    badgeBg: "rgba(189, 0, 255, 0.15)",
    room: "Hall Ashoka (Stage B)",
    icon: "cpu",
    description: "Jailbreaks, indirect prompt injection, model weight tampering, training data poisoning, and autonomous agent safety guardrails.",
    detailedDescription:
      "As generative AI and agentic systems integrate into critical infrastructure, their attack surfaces explode. This track investigates token manipulation, multi-modal jailbreaks, gradient-based prompt optimization, automated agent hijackings, and defenses against data extraction.",
    topics: [
      "Indirect Prompt Injection via Vector Databases (RAG)",
      "Model Extraction & Intellectual Property Theft",
      "Adversarial Attacks on Multi-Modal Vision Transformers",
      "Automated LLM Red Teaming Harnesses",
      "Securing MCP (Model Context Protocol) & Agent Tool Calling",
      "Differential Privacy & Guardrail Bypasses",
    ],
    targetAudience: [
      "AI Safety Researchers",
      "Machine Learning Engineers",
      "Red Teamers",
      "DevOps & Security Engineers",
    ],
  },
  {
    id: "hardware-iot",
    name: "Hardware Hacking, Firmware & Critical Infrastructure",
    shortName: "Hardware & ICS",
    slug: "hardware-iot",
    color: "#FF9100", // Amber hazard
    badgeBg: "rgba(255, 145, 0, 0.15)",
    room: "Hall Aryabhata & Palika Sub-level",
    icon: "chip",
    description: "Silicon physical attacks, glitching, UART/JTAG reversing, SDR satellite intercepts, and SCADA/OT defense.",
    detailedDescription:
      "Step into the physical realm where bits meet atoms. From voltage fault injection on secure microcontrollers and automotive CAN bus hijacking to reverse-engineering Delhi Metro RF tokens and industrial PLC logic, this hands-on track exposes the hardware underbelly.",
    topics: [
      "Electromagnetic & Voltage Fault Injection (EMFI)",
      "Automotive CAN & UDS Reverse Engineering",
      "DMRC Contactless RFID Smart Card Cryptanalysis",
      "SCADA/Modbus Protocol Subversion & OT Hardening",
      "Satellite & LoRaWAN RF Intercepts with HackRF",
      "Flash Memory Dumping & Monolithic Firmware Emulation",
    ],
    targetAudience: [
      "Hardware Reverse Engineers",
      "Automotive Security Specialists",
      "ICS/SCADA Engineers",
      "Badgelife & IoT Enthusiasts",
    ],
  },
  {
    id: "crypto-privacy",
    name: "Cryptographic Engineering & Post-Quantum Frontiers",
    shortName: "Crypto & Privacy",
    slug: "crypto-privacy",
    color: "#00E676", // Cyber emerald
    badgeBg: "rgba(0, 230, 118, 0.15)",
    room: "Hall Chanakya (Cryptex)",
    icon: "key",
    description: "Post-quantum transition (ML-KEM / ML-DSA), zero-knowledge proofs, hardware security modules, and privacy-preserving computation.",
    detailedDescription:
      "As quantum supremacy nears, the foundations of public-key cryptography must evolve. Learn practical implementations of NIST PQC standards, how side-channel attacks leak AES keys from power traces, and how zk-SNARKs enable verifiable computation without data leakage.",
    topics: [
      "Migrating Enterprise PKI to NIST PQC (ML-KEM / ML-DSA)",
      "Differential Power Analysis (DPA) on Cryptographic ASICs",
      "Zero-Knowledge Proofs for Anonymous Authentication",
      "Homomorphic Encryption in Confidential Cloud Computing",
      "DPDPA Compliance & Privacy Enhancing Technologies",
      "Subtle Flaws in TLS 1.3 Key Exchange Implementations",
    ],
    targetAudience: [
      "Cryptographers",
      "Compliance Officers",
      "Blockchain Security Engineers",
      "Privacy Architects",
    ],
  },
  {
    id: "cloud-devsecops",
    name: "Cloud Native Security & Supply Chain Defense",
    shortName: "Cloud & DevSecOps",
    slug: "cloud-devsecops",
    color: "#2979FF", // Cyber azure
    badgeBg: "rgba(41, 121, 255, 0.15)",
    room: "Hall Aryabhata (DevSec Hub)",
    icon: "cloud",
    description: "Kubernetes container escapes, IAM privilege escalation in AWS/GCP, software bill of materials (SBOM), and CI/CD pipeline poisoning.",
    detailedDescription:
      "Modern enterprises run on multi-cloud fabrics and automated software pipelines. This track dissects real-world container break-outs, identity broker compromises, typosquatting package attacks, and cryptographically verified SLSA supply chains.",
    topics: [
      "Kubernetes Node Isolation Breakouts via CRI-O/containerd",
      "IAM Graph Analysis & Privilege Escalation in Multi-Cloud",
      "Securing GitHub Actions & CI/CD from Runner Poisoning",
      "Software Supply Chain Attestation with Sigstore & In-Toto",
      "eBPF-Powered Runtime Security in Microservices",
      "Cloud Forensics & Volatile Memory Acquisition in AWS",
    ],
    targetAudience: [
      "DevSecOps Engineers",
      "Cloud Architects",
      "Site Reliability Engineers",
      "Infrastructure Security Leads",
    ],
  },
];

/** Get all tracks */
export function getAllTracks(): Track[] {
  return TRACKS;
}

/** Look up track by identifier */
export function getTrackById(id: string): Track | undefined {
  return TRACKS.find((track) => track.id === id || track.slug === id);
}
