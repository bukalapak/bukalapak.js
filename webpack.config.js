module.exports = {
  entry: {
    bukalapak: "./src/bukalapak.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {loader: "babel-loader"}
        ]
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

