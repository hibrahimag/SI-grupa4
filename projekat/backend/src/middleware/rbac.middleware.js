module.exports = function rbacMiddleware() {
  return function roleGuard(req, res, next) {
    next();
  };
};
