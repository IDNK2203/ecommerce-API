const mongoose = require("mongoose");
const { Schema } = mongoose;
const recipeSchema = Schema(
  {
    dishName: {
      type: String,
      required: true,
    },
    // ingredients:{
    //   type:String,
    //   required:true,
    // },
    // procedures:{
    //   type:String,
    //   required:true,
    // }
    chef: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("recipe", recipeSchema);
