function getGameId(location) {
  const regex = /\/(\d+)(\/|$)/;
  const match = regex.exec(location);

  return match ? parseInt(match[1], 10) : "lobby";
}

module.exports = getGameId;
