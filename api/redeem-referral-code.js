app.post('/api/redeem-referral-code', (req, res) => {
  // 1. Input validation
  if (!req.body.code || !req.body.newUserId) {
    return res.status(400).json({ 
      success: false, 
      message: "Both code and newUserId are required" 
    });
  }

  // 2. Clean and normalize inputs
  const cleanCode = req.body.code.toString().trim();
  const cleanUserId = req.body.newUserId.toString().trim();

  // 3. Debug logging (optional but helpful)
  console.log(`Redeem attempt - Code: "${cleanCode}", User: "${cleanUserId}"`);
  console.log('Available codes:', referralsStore.map(r => r.code));

  // 4. Case-insensitive search with original case preservation
  const referral = referralsStore.find(r => 
    r.code.trim().toLowerCase() === cleanCode.toLowerCase()
  );

  if (!referral) {
    return res.status(404).json({  // Changed to 404 Not Found
      success: false, 
      message: "Invalid referral code" 
    });
  }

  // 5. Update referral usage
  referral.uses++;
  
  // 6. Store redemption with original code case
  userReferrals.push({ 
    newUserId: cleanUserId, 
    referrerCode: referral.code, // Preserve original case
    redeemedAt: new Date().toISOString() 
  });

  // 7. Success response
  res.json({ 
    success: true, 
    message: "Referral applied!",
    referrerId: referral.referrerId // Added referrer info
  });
});
