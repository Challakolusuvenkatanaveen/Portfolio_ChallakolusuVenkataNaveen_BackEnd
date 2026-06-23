const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({ message: "Super admin access required" });
  }
  next();
};

const adminOrSuperAdmin = (req, res, next) => {
  if (!["super_admin", "admin"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { superAdminOnly, adminOrSuperAdmin };
