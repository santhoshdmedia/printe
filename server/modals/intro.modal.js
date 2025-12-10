const { model, Schema, default: mongoose } = require("mongoose");

module.exports = model(
  "intro",
  Schema(
    {
      name: {
        type: Array,
      },
      email:{
        type:String,
      },
      phone: {
        type: Number,
        required: true,
      }
    },
    {
      collection: "intro",
      timestamps: true,
    }
  )
);
