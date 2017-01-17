module.exports = {
  entry: {
    bukalapak: "./src/bukalapak.js"
  },
  module: {
    loaders: [
      {
        loader: "babel",
        exclude: /node_modules/,
        test: /\.js$/
      }
    ]
  },
  output: {
    path: "./dist/",
    filename: "[name].js",
    libraryTarget: "var",
    library: "Bukalapak"
  }
};

