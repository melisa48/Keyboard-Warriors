export function configureConfirmSwapButton(swapButtonsContainer, gameID) {
    //swap button of game page
    const swapButton = swapButtonsContainer.querySelector("#confirmSwap");
    swapButton.addEventListener("click", async () => {
        // get tiles to swap
            //get all swapRack square divs with player tile children
        const swapRack = document.querySelectorAll(".swap-tile-box");
        const swapSquaresWithPlayerTile = Array.from(swapRack).filter(
            (swapSquare) => swapSquare.querySelector(".player-tile")
        );
        
        let tilesSwapped = [];
        swapSquaresWithPlayerTile.forEach((swapSquaresWithPlayerTile) => {
            const swapTile = swapSquaresWithPlayerTile.querySelector(".player-tile");
            const canonicalTileID = parseInt(swapTile.getAttribute("id"));

            tilesSwapped.push({
                boardX: -2,
                boardY: -2,
                canonicalTileID: canonicalTileID,
                letter: swapTile.textContent,
            });
        });
        console.log(tilesSwapped);
        // alert(tilesSwapped.length);

        //send tiles back to bag
        await fetch(`/api/games/${gameID}/swap`, {
            method: "post",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify(tilesSwapped)
        })
        .then(async (newTiles) => {
            if(!newTiles.ok) {
                const errorMessage = await newTiles.text();
                throw new Error(errorMessage);
            }
            return newTiles.json();
        })
        .then((newTiles) => {
            //add to rack
            const tileBoxElements = document.getElementsByClassName("tile-box");
            let iterator = 0;
            for (let i = 0; i < tileBoxElements.length; i++){
                if (iterator == newTiles.length) {
                    break;
                }

                if (tileBoxElements[i].childElementCount == 0) {
                    const divElement = document.createElement("div");
                    divElement.id = newTiles[iterator].canonicalTileID;
                    divElement.classList += "player-tile square no-drop";
                    divElement.style = "background-color: #E1B995;";
                    divElement.addEventListener("dragstart", drag);
                    divElement.draggable = true;
                    // divElement.setAttribute("ondragstart", "drag(event)");
                    divElement.textContent = newTiles[iterator].letter;

                    // append the newly created player-tile to the tile box which is missing a tile
                    tileBoxElements[i].appendChild(divElement);

                    iterator += 1;
                }
            }
            //remove from swaprack
            swapSquaresWithPlayerTile.forEach((swapSquaresWithPlayerTile) => {
                const swapTile = swapSquaresWithPlayerTile.querySelector(".player-tile");
                swapSquaresWithPlayerTile.removeChild(swapTile);
            })
            document.getElementById("swapDiv").style.display = "none";
        })
        .catch((error) => {
            console.log(error.message);
            alert(JSON.parse(error.message).message);
            location.reload();
        })

    })
}


export function configureSwapButton(swapButtonsContainer, gameID){
    const swapButton = swapButtonsContainer.querySelector("#swapButton");
    swapButton.addEventListener("click", () => {
        document.getElementById("swapDiv").style.display = "block";
    });

}

export function configureCancelSwapButton(swapButtonsContainer, gameID){
    const cancelSwap = swapButtonsContainer.querySelector("#cancelSwap");
    cancelSwap.addEventListener("click", () => {
        //getting tiles from swap rack
        const swapRack = document.querySelectorAll(".swap-tile-box");
        const swapSquaresWithPlayerTile = Array.from(swapRack).filter(
            (swapSquare) => swapSquare.querySelector(".player-tile")
        );

        let tilesSwapped = [];
        swapSquaresWithPlayerTile.forEach((swapSquaresWithPlayerTile) => {
            const swapTile = swapSquaresWithPlayerTile.querySelector(".player-tile");
            const canonicalTileID = parseInt(swapTile.getAttribute("id"));

            tilesSwapped.push({
                boardX: 0,
                boardY: 0,
                canonicalTileID: canonicalTileID,
                letter: swapTile.textContent,
            });
        });
        console.log(tilesSwapped);

        //add tiles back to rack
        const tileBoxElements = document.getElementsByClassName("tile-box");
        let iterator = 0;
        for (let i = 0; i < tileBoxElements.length; i++){
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
                // divElement.setAttribute("ondragstart", "drag(event)");
                divElement.textContent = tilesSwapped[iterator].letter;

                // append the newly created player-tile to the tile box which is missing a tile
                tileBoxElements[i].appendChild(divElement);

                iterator += 1;
            }
        }

        //remove tiles from swap rack
        swapSquaresWithPlayerTile.forEach((swapSquaresWithPlayerTile) => {
            const swapTile = swapSquaresWithPlayerTile.querySelector(".player-tile");
            swapSquaresWithPlayerTile.removeChild(swapTile);
        })
        document.getElementById("swapDiv").style.display = "none";
    });
}