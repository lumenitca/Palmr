/* eslint-disable no-undef */
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const defaultConfigs = [
  // General Configurations
  {
    key: "appName",
    value: "Palmr. ",
    type: "string",
    group: "general",
  },
  {
    key: "showHomePage",
    value: "true",
    type: "boolean",
    group: "general",
  },
  {
    key: "appDescription",
    value: "Secure and simple file sharing - Your personal cloud",
    type: "string",
    group: "general",
  },
  {
    key: "appLogo",
    value: "https://i.ibb.co/gMpk75bZ/Group.png",
    type: "string",
    group: "general",
  },
  {
    key: "firstUserAccess",
    value: "true",
    type: "boolean",
    group: "general",
  },
  // Storage Configurations
  {
    key: "maxFileSize",
    value: "1073741824", // default 1GiB in bytes
    type: "bigint",
    group: "storage",
  },
  {
    key: "maxTotalStoragePerUser",
    value: "10737418240", // 10GB in bytes
    type: "bigint",
    group: "storage",
  },
  // Security Configurations
  {
    key: "jwtSecret",
    value: crypto.randomBytes(64).toString("hex"),
    type: "string",
    group: "security",
  },
  {
    key: "maxLoginAttempts",
    value: "5",
    type: "number",
    group: "security",
  },
  {
    key: "loginBlockDuration",
    value: "600", // 10 minutes in seconds
    type: "number",
    group: "security",
  },
  {
    key: "passwordMinLength",
    value: "8",
    type: "number",
    group: "security",
  },
  // Email Configurations
  {
    key: "smtpEnabled",
    value: "false",
    type: "boolean",
    group: "email",
  },
  {
    key: "smtpHost",
    value: "smtp.gmail.com",
    type: "string",
    group: "email",
  },
  {
    key: "smtpPort",
    value: "587",
    type: "number",
    group: "email",
  },
  {
    key: "smtpUser",
    value: "your-email@gmail.com",
    type: "string",
    group: "email",
  },
  {
    key: "smtpPass",
    value: "your-app-specific-password",
    type: "string",
    group: "email",
  },
  {
    key: "smtpFromName",
    value: "Palmr",
    type: "string",
    group: "email",
  },
  {
    key: "smtpFromEmail",
    value: "noreply@palmr.app",
    type: "string",
    group: "email",
  },
  {
    key: "smtpSecure",
    value: "auto",
    type: "string",
    group: "email",
  },
  {
    key: "smtpNoAuth",
    value: "false",
    type: "boolean",
    group: "email",
  },
  {
    key: "passwordResetTokenExpiration",
    value: "3600",
    type: "number",
    group: "security",
  },
  // OIDC SSO Configurations
  {
    key: "oidcEnabled",
    value: "false",
    type: "boolean",
    group: "oidc",
  },
  {
    key: "oidcIssuerUrl",
    value: "",
    type: "string",
    group: "oidc",
  },
  {
    key: "oidcClientId",
    value: "",
    type: "string",
    group: "oidc",
  },
  {
    key: "oidcClientSecret",
    value: "",
    type: "string",
    group: "oidc",
  },
  {
    key: "oidcRedirectUri",
    value: "",
    type: "string",
    group: "oidc",
  },
  {
    key: "oidcScope",
    value: "openid profile email",
    type: "string",
    group: "oidc",
  },
  {
    key: "oidcAutoRegister",
    value: "true",
    type: "boolean",
    group: "oidc",
  },
  {
    key: "oidcAdminEmailDomains",
    value: "",
    type: "string",
    group: "oidc",
  },
  {
    key: "serverUrl",
    value: "http://localhost:3333",
    type: "string",
    group: "general",
  }
];

async function main() {
  console.log("🌱 Starting app configurations seed...");
  console.log("🛡️  Protected mode: Only creates missing configurations");

  let createdCount = 0;
  let skippedCount = 0;

  for (const config of defaultConfigs) {
    const existingConfig = await prisma.appConfig.findUnique({
      where: { key: config.key },
    });

    if (existingConfig) {
      console.log(`⏭️  Configuration '${config.key}' already exists, skipping...`);
      skippedCount++;
      continue;
    }

    await prisma.appConfig.create({
      data: config,
    });

    console.log(`✅ Created configuration: ${config.key}`);
    createdCount++;
  }

  console.log("\n📊 Seed Summary:");
  console.log(`   ✅ Created: ${createdCount} configurations`);
  console.log(`   ⏭️  Skipped: ${skippedCount} configurations`);
  console.log("🎉 App configurations seeded successfully!");
}

main()
  .catch((error) => {
    console.error("Error during seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 