function usersPlaceholderController(req, res) {
  res.status(501).json({ message: 'Users module placeholder.' });
}

module.exports = {
  usersPlaceholderController,
};
