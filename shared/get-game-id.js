function getGameId(location) {
  location = location.replace(/\/$/, "");

  const gameId = location.substring(location.lastIndexOf("/") + 1);

  return gameId === "lobby" ? 0 : parseInt(gameId);
}

module.exports = getGameId;
