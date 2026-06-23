const mongoose = require("mongoose");

const themeSchema =
  new mongoose.Schema(
    {
      mode: {
        type: String,
        default: "light",
      },

      primaryColor: String,

      secondaryColor: String,
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Theme",
  themeSchema
);