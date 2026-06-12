/**
 * certifications.ts — credential records, as typed data
 * (implementation-architecture §2; Phase 14: DEPTH.04 content source).
 *
 * HONESTY LAW: every record below maps 1:1 to a real certificate PDF
 * under /public/certificates (sourced from context/certificates/ and
 * context/certificates.txt). Issue dates are month-precision as the
 * issuer printed them; tenure-style records carry the issuer's span.
 * Credential IDs are included only where the issuer printed one.
 * A record without a file does not exist here — a pointing link to a
 * missing PDF would be a fake artifact.
 */

export interface CertificationRecord {
  /** Issuing organization, as printed. */
  provider: string;
  /** Credential title, as printed (lightly shortened, never embellished). */
  title: string;
  /** Issue stamp, "YYYY.MM" (or a span where the issuer gave one). */
  issued: string;
  /** Domain tag — mono metadata, one or two words. */
  domain: string;
  /** Real PDF under /public — the record's verification artifact. */
  file: string;
  /** Issuer credential ID, where one was printed. */
  credentialId?: string;
}

/** Newest first — an archive reads from the present backwards. */
export const CERTIFICATIONS: readonly CertificationRecord[] = [
  {
    provider: "Google",
    title: "The Bits and Bytes of Computer Networking",
    issued: "2026.04",
    domain: "networking",
    file: "/certificates/google-computer-networking.pdf",
    credentialId: "8ZC2F0L881GO",
  },
  {
    provider: "Arm",
    title: "Computer Architecture Essentials on Arm",
    issued: "2026.04",
    domain: "computer architecture",
    file: "/certificates/arm-computer-architecture.pdf",
    credentialId: "FGT07C8FCES7",
  },
  {
    provider: "Infosys",
    title: "Kanban in Practice",
    issued: "2026.04",
    domain: "process",
    file: "/certificates/infosys-kanban.pdf",
  },
  {
    provider: "Google",
    title: "Operating Systems and You: Becoming a Power User",
    issued: "2026.03",
    domain: "operating systems",
    file: "/certificates/google-operating-systems.pdf",
    credentialId: "GN2K6ZKSPU91",
  },
  {
    provider: "NPTEL",
    title: "Software Engineering",
    issued: "2025.11",
    domain: "software engineering",
    file: "/certificates/nptel-software-engineering.pdf",
    credentialId: "NPTEL25CS108S56610129710338786",
  },
  {
    provider: "Forage",
    title: "J.P. Morgan Software Engineering Job Simulation",
    issued: "2025.11",
    domain: "kafka · rest apis",
    file: "/certificates/jpmorgan-forage-software-engineering.pdf",
    credentialId: "SpTqxs2Tj7TdSbR6v",
  },
  {
    provider: "Infosys",
    title: "Data Structures and Algorithms",
    issued: "2025.11",
    domain: "algorithms",
    file: "/certificates/infosys-data-structures-algorithms.pdf",
  },
  {
    provider: "Infosys",
    title: "Explore Machine Learning using Python",
    issued: "2025.11",
    domain: "ai/ml",
    file: "/certificates/infosys-ml-python.pdf",
  },
  {
    provider: "Saylor Academy",
    title: "CS403: Introduction to Modern Database Systems",
    issued: "2025.11",
    domain: "databases",
    file: "/certificates/saylor-cs403-databases.pdf",
  },
  {
    provider: "Saylor Academy",
    title: "MA121: Introduction to Statistics",
    issued: "2025.11",
    domain: "statistics",
    file: "/certificates/saylor-ma121-statistics.pdf",
  },
  {
    provider: "Bennett University",
    title: "Smart India Hackathon — Qualifier",
    issued: "2025.09",
    domain: "hackathon",
    file: "/certificates/bennett-sih-qualifier.pdf",
  },
  {
    provider: "Enactus, Bennett University",
    title: "Project Management Department — Tenure",
    issued: "2024 – 2025",
    domain: "project management",
    file: "/certificates/enactus-project-management.pdf",
  },
  {
    provider: "Infosys",
    title: "Digital Electronics",
    issued: "2025.03",
    domain: "electronics",
    file: "/certificates/infosys-digital-electronics.pdf",
  },
  {
    provider: "Infosys",
    title: "Electronics and Number Systems",
    issued: "2025.03",
    domain: "electronics",
    file: "/certificates/infosys-electronics-number-systems.pdf",
  },
  {
    provider: "Infosys",
    title: "Core Java Programming",
    issued: "2025.03",
    domain: "programming",
    file: "/certificates/infosys-core-java.pdf",
  },
  {
    provider: "DeepLearning.AI",
    title: "Introduction to TensorFlow for AI, ML, and Deep Learning",
    issued: "2024.12",
    domain: "ai/ml",
    file: "/certificates/deeplearningai-intro-tensorflow.pdf",
    credentialId: "AZRGV7JJGT0M",
  },
  {
    provider: "University of Illinois Urbana-Champaign",
    title: "Entrepreneurship I: Laying the Foundation",
    issued: "2024.12",
    domain: "entrepreneurship",
    file: "/certificates/uiuc-entrepreneurship-1.pdf",
    credentialId: "BRMATF1ENDW3",
  },
  {
    provider: "MathWorks",
    title: "Introduction to Linear Algebra with MATLAB",
    issued: "2024.10",
    domain: "mathematics",
    file: "/certificates/mathworks-linear-algebra.pdf",
  },
  {
    provider: "MathWorks",
    title: "Image Processing with MATLAB",
    issued: "2024.10",
    domain: "image processing",
    file: "/certificates/mathworks-image-processing.pdf",
  },
  {
    provider: "Infosys",
    title: "Python Fundamentals",
    issued: "2024.10",
    domain: "programming",
    file: "/certificates/infosys-python-fundamentals.pdf",
    credentialId: "1-b65cbcc7-105a-43bc-a3cf-ddc9aef67d8a",
  },
];

/** Distinct issuers — feeds the chamber sub-readout, derived. */
export const PROVIDER_COUNT = new Set(
  CERTIFICATIONS.map((c) => c.provider)
).size;
