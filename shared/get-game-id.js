function getGameId(location) {
  const regex = /\/(\d+)(\/|$)/;
  const match = regex.exec(location);

  // return 0 if number not found (likely on lobby page)
  return match ? parseInt(match[1], 10) : 0;
}

module.exports = getGameId;
