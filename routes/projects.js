var express = require("express");
var router = express.Router();
const { authJWT } = require("../middlewares/authJWT");
const { checkBody } = require("../modules/checkBody");

const Project = require("../models/projects");

// Get projects
router.get("/", authJWT, async (req, res) => {
  try {
    const { userId, team, leader } = req.user;

    const projects = leader
      ? await Project.find({ ownerTeam: team })
      : await Project.find({ owner: userId });

    res.json({ result: true, projects });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ result: false, error: "Error fetching projects" });
  }
});

// Post new project
router.post("/", authJWT, async (req, res) => {
  // req.body check
  if (!checkBody(req.body, ["title", "sportTeam"])) {
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
    const projectExisting = await Project.findOne({
      title,
      owner: req.user.userId,
    });
    if (projectExisting) {
      return res
        .status(409)
        .json({ result: false, error: "Project already existing for user" });
    }
  } catch (error) {
    console.error("Error", error);
    return res.status(502).json({
      result: false,
      error: "Server error when checking project, try later",
    });
  }

  // Project creation
  const regex = /\s+/g;
  const slug = title.trim().toLowerCase().replace(regex, "_");
  try {
    const newProject = await Project.create({
      title,
      slug,
      description,
      owner: req.user.userId,
      ownerTeam: req.user.team,
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
    const projectExisting = await Project.findByIdAndDelete(
      req.params.projectId,
    );
    if (!projectExisting) {
      return res
        .status(409)
        .json({ result: false, error: "Project not existing." });
    } else {
      return res.json({
        result: true,
        message: "Project deleted",
      });
    }
  } catch (error) {
    console.log("Error", error);
    return res.status(502).json({
      result: false,
      error: "Server error when checking project, try later",
    });
  }
});

// Patch  project
router.patch("/:projectId", authJWT, async (req, res) => {
  // req.body check
  if (!checkBody(req.body, ["title", "sportTeam"])) {
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
    const projectExisting = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.userId,
    });
    if (!projectExisting) {
      return res
        .status(404)
        .json({ result: false, error: "Project not found" });
    }
  } catch (error) {
    console.error("Error", error);
    return res.status(502).json({
      result: false,
      error: "Server error when checking project, try later",
    });
  }

  // Project modification
  const regex = /\s+/g;
  const slug = title.trim().toLowerCase().replace(regex, "_");
  try {
    await Project.updateOne(
      { _id: req.params.projectId },
      {
        title,
        slug,
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
      },
    );

    // Fetch the updated project
    const modifiedProject = await Project.findById(req.params.projectId);

    res.json({
      result: true,
      project: modifiedProject,
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(502).json({
      result: false,
      error: "Server error when updating project, try later",
    });
  }
});

module.exports = router;
