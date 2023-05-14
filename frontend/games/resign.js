export function configureResignButton(gameButtonsContainer, gameID) {
  // resign button of game page
  const resignButton = gameButtonsContainer.querySelector("#resignButton");
  resignButton.addEventListener("click", async () => {
    await fetch(`/api/games/${gameID}/resign`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  });
}
