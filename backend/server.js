const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const rootRoutes = require("./routes/root.js");

app.use("/", rootRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});