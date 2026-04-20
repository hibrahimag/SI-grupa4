function authPlaceholderController(req, res) {
  res.status(501).json({ message: 'Auth module placeholder.' });
}

module.exports = {
  authPlaceholderController,
};
