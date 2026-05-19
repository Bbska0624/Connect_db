// Must be used AFTER the auth middleware (requires req.user to be set).
const adminAuth = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Зөвхөн админ хандах боломжтой',
      data: null,
    });
  }
  next();
};

export default adminAuth;
