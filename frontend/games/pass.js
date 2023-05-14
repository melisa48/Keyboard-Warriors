export function configurePassButton(gameButtonsContainer, gameID) {
  const passButton = gameButtonsContainer.querySelector("#passButton");
  passButton.addEventListener("click", async () => {
    // get all board square divs with player tile children
    const boardSquares = document.querySelectorAll(".board-square");
    const boardSquaresWithPlayerTile = Array.from(boardSquares).filter(
      (boardSquare) => boardSquare.querySelector(".player-tile")
    );

    const returnTiles = [];
    // move played tiles from board into an array
    boardSquaresWithPlayerTile.forEach((boardSquareWithPlayerTile) => {
      const playerTile =
        boardSquareWithPlayerTile.querySelector(".player-tile");
      returnTiles.push(playerTile);
      boardSquareWithPlayerTile.removeChild(playerTile);
    });

    //Grab the player's rack and add return tiles into empty slots
    const playerRack = document.getElementsByClassName("player-tiles")[0];
    for (const child of playerRack.children) {
      if (!child.firstElementChild) {
        child.appendChild(returnTiles.pop());
      }
    }
    await fetch(`/api/games/${gameID}/pass-turn`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
    });
  });
}
