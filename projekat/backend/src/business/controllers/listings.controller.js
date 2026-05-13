function listingsPlaceholderController(req, res) {
  res.status(501).json({ message: 'Listings module placeholder.' });
}

module.exports = {
  listingsPlaceholderController,
};
