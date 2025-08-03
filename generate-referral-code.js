app.post('/api/generate-referral-code', (req, res) => {
  const { userId } = req.body;
  const code = generateRandomCode(8);
  
  referralsStore.push({
    code,
    referrerId: userId,
    uses: 0
  });

  res.json({ success: true, code });
});

function generateRandomCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}