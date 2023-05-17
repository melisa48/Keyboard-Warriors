export function configureResignButton(gameButtonsContainer, gameID) {
  // resign button of game page
  const resignButton = gameButtonsContainer.querySelector("#resignButton");
  resignButton.addEventListener("click", async () => {
    await fetch(`/api/games/${gameID}/resign`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        // remove the player's rack

        const playerTiles = document.querySelector(".player-tiles");

        while (playerTiles.firstChild) {
          playerTiles.removeChild(playerTiles.firstChild);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
}
