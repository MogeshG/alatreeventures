import express from "express";
import cors from "cors";
import generateRandomCode from "../utilities/generateRandomId.js";
import { referralsStore, userReferrals } from "../lib/referralStore.js";

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug endpoint to check current state
app.get("/api/debug", (req, res) => {
  res.json({
    referralsStore,
    userReferrals,
  });
});

// Generate Referral Code
app.post("/api/generate-referral-code", (req, res) => {
  const { userId } = req.body;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({
      success: false,
      error: "Valid userId (string) is required",
    });
  }
  const existing_referral = referralsStore.find((referral) => referral.referrerId === userId);

  if (existing_referral) {
    return res.status(400).json({
      success: false,
      code: existing_referral.code,
      message: `Referral Code already exists for ${userId}`,
    });
  }

  const code = generateRandomCode();
  referralsStore.push({
    code,
    referrerId: userId,
    uses: 0,
    createdAt: new Date().toISOString(),
  });

  console.log(`Generated code ${code} for user ${userId}`);
  res.json({ success: true, code });
});

app.post("/api/redeem-referral-code", (req, res) => {
  const { code, newUserId } = req.body;

  // Validate input
  if (!code) {
    return res.status(400).json({
      success: false,
      error: "code is required",
    });
  } else if (!newUserId) {
    return res.status(400).json({
      success: false,
      error: "newUserId are required",
    });
  }

  // Checking already referrer or not
  const existing_referral = userReferrals.find((user) => user.newUserId === newUserId);

  if (existing_referral) {
    return res.status(400).json({
      success: false,
      error: `${newUserId} is already referrer using ${existing_referral.referrerCode}`,
    });
  }

  // Case-insensitive search and trim whitespace
  const referral = referralsStore.find(
    (r) => r.code.trim().toUpperCase() === code.trim().toUpperCase()
  );

  if (!referral) {
    console.log(`Code not found: ${code}`);
    return res.status(404).json({
      success: false,
      error: "Invalid code",
    });
  }

  // Update uses count
  referral.uses++;

  // Record redemption
  userReferrals.push({
    newUserId,
    referrerCode: referral.code,
    redeemedAt: new Date().toISOString(),
  });

  console.log(`Redeemed code ${referral.code} for user ${newUserId}`);
  res.json({
    success: true,
    message: "Referral applied!",
    referrerId: referral.referrerId,
  });
});

app.get("/api/referral-metrics", (req, res) => {
  const { referrerId } = req.query;

  if (!referrerId) {
    return res.status(400).json({
      success: false,
      error: "referrerId query parameter is required",
    });
  }

  // Filter by referrer and calculate metrics
  const referrerCodes = referralsStore
    .filter((r) => r.referrerId === referrerId)
    .map((r) => r.code);

  const totalReferrals = userReferrals.filter((ur) =>
    referrerCodes.includes(ur.referrerCode)
  ).length;

  res.json({
    success: true,
    totalReferrals,
    revenueGeneratedCents: totalReferrals * 30000,
    commissionEarnedCents: totalReferrals * 6000,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoints:
  - POST /api/generate-referral-code
  - POST /api/redeem-referral-code
  - GET /api/referral-metrics?referrerId=USER_001
  - GET /api/debug (for testing)`);
});
