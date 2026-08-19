/**
 * Application configuration.
 */
const app = {
  name: { short: "Omni", long: "Omni Docs" },
  description:
    "This documentation is your comprehensive guide to the Omni ecosystem, including our libraries, APIs, tools, and services.",
  organization: {
    website: "https://omni.dev",
    blog: "https://omni.dev/blog",
  },
  appUrl: "https://docs.omni.dev",
  merchUrl: "https://shop.omni.dev",
  // TODO extract all to Omni API
  legal: {
    privacyPolicy: "https://omni.dev/privacy-policy",
    termsOfService: "https://omni.dev/terms-of-service",
  },
  // Mirrors the omni-api social catalog (SSOT). If these diverge, omni-api wins.
  socials: {
    threads: "https://www.threads.com/@omnidotdev",
    x: "https://x.com/omnidotdev",
    discord: "https://discord.gg/omnidotdev",
    github: "https://github.com/omnidotdev",
    linkedin: "https://www.linkedin.com/company/omnidotdev",
  },
};

export default app;
