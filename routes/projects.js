var express = require("express");
var router = express.Router();
const { authJWT } = require("../middlewares/authJWT");
const { checkBody } = require("../modules/checkBody");

const Project = require("../models/projects");

// Post new project
router.post("/", authJWT, async (req, res) => {
  // req.body check
  if (!checkBody(req.body, ["title", "sportTeam", "industrialisation"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const {
    title,
    description,
    sportTeam,
    productEngineer,
    kickOff,
    feasiOk,
    creaOk,
    selectionOk,
    shipmentOk,
    industrialisation,
    kickOffIndus,
    goIndus,
    trialRun,
    pilotRun,
    goProd,
    status,
  } = req.body;

  // Check project in BDD
  try {
    const projectExisting = await Project.findOne({ title, owner: req.userId });
    if (projectExisting) {
      return res
        .status(409)
        .json({ result: false, error: "Project already existing for user" });
    }
  } catch (error) {
    console.log("Error", error);
    return res.status(502).json({
      result: false,
      error: "Server error when checking project, try later",
    });
  }

  // Project creation
  const regex = /\s+/g;
  const slug = title.trim().toLowerCase().replace(regex, "-");
  try {
    const newProject = await Project.create({
      title,
      slug,
      description,
      owner: req.userId,
      sportTeam,
      productEngineer,
      kickOff,
      feasiOk,
      creaOk,
      selectionOk,
      shipmentOk,
      industrialisation,
      kickOffIndus,
      goIndus,
      trialRun,
      pilotRun,
      goProd,
      status,
    });

    res.json({
      result: true,
      project: newProject,
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(502).json({
      result: false,
      error: "Server error when creating project, try later",
    });
  }
});

// Delete project
router.delete("/:projectId", authJWT, async (req, res) => {
  // Check project in BDD
  try {
    const projectExisting = await Project.findOne({
      _id: req.params.projectId,
      owner: req.userId,
    });
    if (!projectExisting) {
      return res
        .status(409)
        .json({ result: false, error: "Project not existing for user" });
    }
  } catch (error) {
    console.log("Error", error);
    return res.status(502).json({
      result: false,
      error: "Server error when checking project, try later",
    });
  }

  // Project deletion
  try {
    const deleteProject = await Project.deleteOne({
      _id: req.params.projectId,
      owner: req.userId,
    });

    if (deleteProject.deletedCount > 0) {
      return res.json({
        result: true,
        message: "Project deleted",
      });
    } else {
      return res.json({
        result: false,
        message: "Project not deleted, error",
      });
    }
  } catch (error) {
    console.log("Error", error);
    return res
      .status(502)
      .json({ result: false, error: "2 Server error, try later" });
  }
});

module.exports = router;
