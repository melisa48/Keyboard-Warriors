export function configurePassButton(gameButtonsContainer, gameID) {
  const passButton = gameButtonsContainer.querySelector("#passButton");
  passButton.addEventListener("click", async () => {
    await fetch(`/api/games/${gameID}/pass-turn`, {
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
