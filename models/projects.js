const mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: null,
  },
  owner: {
    // Cle etrangere
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sportTeam: {
    type: String,
    required: true,
  },
  productEngineer: {
    type: String,
    default: null,
  },
  kickOff: {
    type: Date,
    default: null,
  },
  feasiOk: {
    type: Date,
    default: null,
  },
  creaOk: {
    type: Date,
    default: null,
  },
  selectionOk: {
    type: Date,
    default: null,
  },
  shipmentOk: {
    type: Date,
    default: null,
  },
  industrialisation: {
    type: Boolean,
    required: true,
  },
  kickOffIndus: {
    type: Date,
    default: null,
  },
  goIndus: {
    type: Date,
    default: null,
  },
  trialRun: {
    type: Date,
    default: null,
  },
  pilotRun: {
    type: Date,
    default: null,
  },
  goProd: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    default: null,
  },
});

const Project = mongoose.model("projects", projectSchema);

module.exports = Project;
