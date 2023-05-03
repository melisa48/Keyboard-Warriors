export function getGameId(location) {
  const gameId = location.substring(location.lastIndexOf("/") + 1);

  return gameId === "lobby" ? 0 : parseInt(gameId);
}
