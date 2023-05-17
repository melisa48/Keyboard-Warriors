export function configureSubmitButton(gameButtonsContainer, gameID) {
  // submit button of game page
  const submitButton = gameButtonsContainer.querySelector("#submitButton");
  submitButton.addEventListener("click", async () => {
    // get all board square divs with player tile children
    const boardSquares = document.querySelectorAll(".board-square");
    const boardSquaresWithPlayerTile = Array.from(boardSquares).filter(
      (boardSquare) => boardSquare.querySelector(".player-tile")
    );

    // array of objects that contains each tile and board position played by user
    let tilesPlayed = [];
    boardSquaresWithPlayerTile.forEach((boardSquareWithPlayerTile) => {
      const boardX = parseInt(boardSquareWithPlayerTile.getAttribute("x"));
      const boardY = parseInt(boardSquareWithPlayerTile.getAttribute("y"));

      const playerTile =
        boardSquareWithPlayerTile.querySelector(".player-tile");
      const canonicalTileID = parseInt(playerTile.getAttribute("id"));

      // TODO: Get letter on database side from canonical tile ID; this is just for
      // testing
      tilesPlayed.push({
        boardX: boardX,
        boardY: boardY,
        canonicalTileID: canonicalTileID,
        letter: playerTile.textContent,
      });
    });

    // take away the tiles from the board that were played? (if API request successful, if not
    // successful, don't remove)
    // since server will emit, and client will listen, will update the board accordingly
    // tiles emitted won't be draggable
    await fetch(`/api/games/${gameID}/submit-word`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tilesPlayed),
    })
      .then(async (newTiles) => {
        if (!newTiles.ok) {
          const errorMessage = await newTiles.text();
          throw new Error(errorMessage);
        }

        // remove played tiles from board
        boardSquaresWithPlayerTile.forEach((boardSquareWithPlayerTile) => {
          const playerTile =
            boardSquareWithPlayerTile.querySelector(".player-tile");
          boardSquareWithPlayerTile.removeChild(playerTile);
        });

        return newTiles.json();
      })
      .then((newTiles) => {
        // put the new tiles returned from the server on the tile boxes
        // that are missing a tile in the user's rack

        const tileBoxElements = document.getElementsByClassName("tile-box");

        let iterator = 0;
        for (let i = 0; i < tileBoxElements.length; i++) {
          // ensure that for loop doesn't go over the new tiles length
          if (iterator == newTiles.length) {
            break;
          }

          // add tile to tile boxes that don't have a tile
          if (tileBoxElements[i].childElementCount == 0) {
            // create player-tile
            const divElement = document.createElement("div");
            divElement.id = newTiles[iterator].id;
            divElement.classList += "player-tile square no-drop";
            divElement.style = "background-color: #E1B995;";
            // divElement.addEventListener("dragstart", drag);
            divElement.addEventListener("dragstart", drag);
            divElement.draggable = true;
            divElement.textContent = newTiles[iterator].letter;

            // append the newly created player-tile to the tile box which is missing a tile
            tileBoxElements[i].appendChild(divElement);

            iterator += 1;
          }
        }
      })
      .catch((error) => {
        // in case of an error, alert the user of their error and reload the page
        alert(JSON.parse(error.message).message);
        location.reload();
      });
  });
}
