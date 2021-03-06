const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serieSchema = new Schema({
  name: { type: String },
  rating: { type: [Number] },
  genre: { type: [String] },
  resume: { type: String },
  imgPath: String,

  review: [
    {
      user: String,
      comment: String,
    },
  ],
  post: {type: Boolean, default: false},
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
});

const Serie = mongoose.model("Serie", serieSchema);

module.exports = Serie;
