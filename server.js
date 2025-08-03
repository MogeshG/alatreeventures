const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock database
const referralsStore = [];
const userReferrals = [];

// Helper function to generate codes
function generateRandomCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Debug endpoint to check current state
app.get('/api/debug', (req, res) => {
  res.json({
    referralsStore,
    userReferrals
  });
});

// Routes
app.post('/api/generate-referral-code', (req, res) => {
  console.log('Generate request body:', req.body);
  
  const { userId } = req.body;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: "Valid userId (string) is required" 
    });
  }
  
  const code = generateRandomCode(8);
  referralsStore.push({ 
    code, 
    referrerId: userId, 
    uses: 0,
    createdAt: new Date().toISOString()
  });
  
  console.log(`Generated code ${code} for user ${userId}`);
  res.json({ success: true, code });
});

app.post('/api/redeem-referral-code', (req, res) => {
  console.log('Redeem request body:', req.body);
  
  const { code, newUserId } = req.body;
  
  // Validate input
  if (!code || !newUserId) {
    return res.status(400).json({ 
      success: false, 
      error: "Both code and newUserId are required" 
    });
  }
  
  // Case-insensitive search and trim whitespace
  const referral = referralsStore.find(r => 
    r.code.trim().toUpperCase() === code.trim().toUpperCase()
  );
  
  if (!referral) {
    console.log(`Code not found: ${code}`);
    return res.status(404).json({ 
      success: false, 
      error: "Invalid code" 
    });
  }

  // Update uses count
  referral.uses++;
  
  // Record redemption
  userReferrals.push({ 
    newUserId, 
    referrerCode: referral.code, // Use stored case
    redeemedAt: new Date().toISOString() 
  });
  
  console.log(`Redeemed code ${referral.code} for user ${newUserId}`);
  res.json({ 
    success: true, 
    message: "Referral applied!",
    referrerId: referral.referrerId
  });
});

app.get('/api/referral-metrics', (req, res) => {
  const { referrerId } = req.query;
  
  if (!referrerId) {
    return res.status(400).json({ 
      success: false, 
      error: "referrerId query parameter is required" 
    });
  }
  
  // Filter by referrer and calculate metrics
  const referrerCodes = referralsStore
    .filter(r => r.referrerId === referrerId)
    .map(r => r.code);
    
  const totalReferrals = userReferrals
    .filter(ur => referrerCodes.includes(ur.referrerCode))
    .length;
  
  res.json({
    success: true,
    totalReferrals,
    revenueGeneratedCents: totalReferrals * 30000, // Example calculation
    commissionEarnedCents: totalReferrals * 6000  // Example calculation
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: "Internal server error" 
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