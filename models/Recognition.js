const mongoose = require("mongoose");

const recognitionSchema =
  new mongoose.Schema(
    {
      title: String,

      description: String,

      image: String,
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Recognition",
  recognitionSchema
);