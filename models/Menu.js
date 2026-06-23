const mongoose = require("mongoose");

const menuSchema =
  new mongoose.Schema(
    {
      menuName: String,

      menuPath: String,

      icon: String,

      order: Number,

      isVisible: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Menu",
  menuSchema
);