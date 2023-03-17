const express = require("express");
const createError = require("http-errors");

const app = express();
const PORT = process.env.PORT || 3000;

const rootRoutes = require("./routes/root.js");

app.use("/", rootRoutes);

app.use((request, response, next) => {
  next(createError(404));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});