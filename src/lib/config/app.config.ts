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
  socials: {
    x: "https://x.com/omnidotdev",
    github: "https://github.com/omnidotdev",
    discord: "https://discord.gg/omnidotdev",
    linkedin: "https://linkedin.com/company/omnidotdev",
  },
};

export default app;
