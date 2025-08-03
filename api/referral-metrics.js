app.get('/api/referral-metrics', (req, res) => {
  const { referrerId } = req.query;
  
  res.json({
    totalReferrals: 10,
    revenueGeneratedCents: 300000,
    commissionEarnedCents: 60000
  });
});
