// Mock database
const referralsStore = [];
const userReferrals = [];

const generateCode = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

module.exports = { referralsStore, userReferrals, generateCode };