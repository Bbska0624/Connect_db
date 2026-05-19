// src/utils/match-logic.js

// Оюутнуудын ID-аас хамаарч аватарт өнгө өгөх (таны app.js дээрх логик)
export const getAvatarColor = (id) => {
  const colors = {
    1: 'linear-gradient(145deg, var(--accent-lt), var(--accent))',
    2: 'linear-gradient(145deg, #E0F2FE, #BAE6FD)',
    3: 'linear-gradient(145deg, #F3E8FF, #DDD6FE)',
    4: 'linear-gradient(145deg, #FEF3C7, #FCD34D)'
  };
  return colors[id] || colors[1];
};

// Хуваарь тааралтыг хувиар тооцоолох алгоритм
export const calculateMatchScore = (mySched, peerSched) => {
  if (!mySched.length || !peerSched.length) return 0;
  const common = mySched.filter(u => 
    peerSched.some(p => p.day === u.day && p.hour === u.hour)
  );
  return Math.round((common.length / mySched.length) * 100);
};