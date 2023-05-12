const path = require("path");

module.exports = {
  context: path.resolve(__dirname),
  entry: ["./frontend/lobby.js"],
  output: {
    path: path.resolve(__dirname, "backend", "static", "scripts"),
    publicPath: "/backend/static/scripts",
    filename: "[name]-bundle.js",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" },
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
};
