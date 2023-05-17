const swapDiv = document.getElementById("swapDiv");

function removeTilesFromSwapRack(swapSquaresWithPlayerTile) {
  swapSquaresWithPlayerTile.forEach((swapSquareWithPlayerTile) => {
    const swapTile = swapSquareWithPlayerTile.querySelector(".player-tile");
    swapSquareWithPlayerTile.removeChild(swapTile);
  });
}

export function configureConfirmSwapButton(swapButtonsContainer, gameID) {
  // swap button of game page
  const swapButton = swapButtonsContainer.querySelector("#confirmSwap");
  swapButton.addEventListener("click", async () => {
    // get tiles to swap
    // get all swapRack square divs with player tile children
    const swapRack = document.querySelectorAll(".swap-tile-box");
    const swapSquaresWithPlayerTile = Array.from(swapRack).filter(
      (swapSquare) => swapSquare.querySelector(".player-tile")
    );

    const tilesSwapped = [];
    swapSquaresWithPlayerTile.forEach((swapSquareWithPlayerTile) => {
      const swapTile = swapSquareWithPlayerTile.querySelector(".player-tile");
      const canonicalTileID = parseInt(swapTile.getAttribute("id"));

      tilesSwapped.push({
        canonicalTileID: canonicalTileID,
        letter: swapTile.textContent,
      });
    });

    // send tiles back to bag
    await fetch(`/api/games/${gameID}/swap`, {
      method: "post",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(tilesSwapped),
    })
      .then(async (newTiles) => {
        if (!newTiles.ok) {
          const errorMessage = await newTiles.text();
          throw new Error(errorMessage);
        }

        return newTiles.json();
      })
      .then((newTiles) => {
        // add new tiles to rack
        const tileBoxElements = document.getElementsByClassName("tile-box");
        let iterator = 0;
        for (let i = 0; i < tileBoxElements.length; i++) {
          if (iterator == newTiles.length) {
            break;
          }

          if (tileBoxElements[i].childElementCount == 0) {
            const divElement = document.createElement("div");
            divElement.id = newTiles[iterator].id;
            divElement.classList += "player-tile square no-drop";
            divElement.style = "background-color: #E1B995;";
            divElement.addEventListener("dragstart", drag);
            divElement.draggable = true;
            divElement.textContent = newTiles[iterator].letter;

            // append the newly created player-tile to the tile box which is missing a tile
            tileBoxElements[i].appendChild(divElement);

            iterator += 1;
          }
        }

        // remove from swaprack
        removeTilesFromSwapRack(swapSquaresWithPlayerTile);

        swapDiv.style.display = "none";
      })
      .catch((error) => {
        alert(JSON.parse(error.message).message);
        location.reload();
      });
  });
}

export function configureSwapButton(gameButtonsContainer) {
  const swapButton = gameButtonsContainer.querySelector("#swapButton");
  swapButton.addEventListener("click", () => {
    swapDiv.style.display = "block";
  });
}

export function configureCancelSwapButton(swapButtonsContainer) {
  const cancelSwap = swapButtonsContainer.querySelector("#cancelSwap");
  cancelSwap.addEventListener("click", () => {
    // getting tiles from swap rack
    const swapRack = document.querySelectorAll(".swap-tile-box");
    const swapSquaresWithPlayerTile = Array.from(swapRack).filter(
      (swapSquare) => swapSquare.querySelector(".player-tile")
    );

    const tilesSwapped = [];
    swapSquaresWithPlayerTile.forEach((swapSquareWithPlayerTile) => {
      const swapTile = swapSquareWithPlayerTile.querySelector(".player-tile");
      const canonicalTileID = parseInt(swapTile.getAttribute("id"));

      tilesSwapped.push({
        canonicalTileID: canonicalTileID,
        letter: swapTile.textContent,
      });
    });

    // add tiles back to rack
    const tileBoxElements = document.getElementsByClassName("tile-box");
    let iterator = 0;
    for (let i = 0; i < tileBoxElements.length; i++) {
      if (iterator == tilesSwapped.length) {
        break;
      }

      if (tileBoxElements[i].childElementCount == 0) {
        const divElement = document.createElement("div");
        divElement.id = tilesSwapped[iterator].canonicalTileID;
        divElement.classList += "player-tile square no-drop";
        divElement.style = "background-color: #E1B995;";
        divElement.addEventListener("dragstart", drag);
        divElement.draggable = true;
        divElement.textContent = tilesSwapped[iterator].letter;

        // append the newly created player-tile to the tile box which is missing a tile
        tileBoxElements[i].appendChild(divElement);

        iterator += 1;
      }
    }

    // remove tiles from swap rack
    removeTilesFromSwapRack(swapSquaresWithPlayerTile);

    swapDiv.style.display = "none";
  });
}
