var express = require("express");
var router = express.Router();
const { authJWT } = require("../middlewares/authJWT");
const { checkBody } = require("../modules/checkBody");
// const Project = require("../models/projects");
const pool = require("../models/connection");

//------------------------------
// Date formating for SQL request
const formatDate = (date) => {
  return !date ? null : date;
};
//------------------------------

// Get projects
router.get("/", authJWT, async (req, res) => {
  try {
    const { userId, team, leader } = req.user;

    // const projects = leader
    //   ? await Project.find({ ownerTeam: team })
    //   : await Project.find({ owner: userId });

    const projects = leader
      ? await pool.query('SELECT * FROM projects WHERE "ownerTeam" = $1', [
          team,
        ])
      : await pool.query("SELECT * FROM projects WHERE owner = $1", [userId]);

    res.json({ result: true, projects: projects.rows });
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
    // const projectExisting = await Project.findOne({
    //   title,
    //   owner: req.user.userId,
    // });

    const projectExisting = await pool.query(
      "SELECT * FROM projects WHERE title = $1 AND owner = $2",
      [title, req.user.userId],
    );

    if (projectExisting.rows[0]) {
      return res
        .status(409)
        .json({ result: false, error: "Project already existing for user" });
    }
  } catch (error) {
    console.error("Error check", error);
    return res.status(502).json({
      result: false,
      error: "Server error when checking project, try later",
    });
  }

  // Project creation
  const regex = /\s+/g;
  const slug = title.trim().toLowerCase().replace(regex, "_");
  try {
    // const newProject = await Project.create({
    //   title,
    //   slug,
    //   description,
    //   owner: req.user.userId,
    //   ownerTeam: req.user.team,
    //   sportTeam,
    //   productEngineer,
    //   kickOff,
    //   feasiOk,
    //   creaOk,
    //   selectionOk,
    //   shipmentOk,
    //   industrialisation,
    //   kickOffIndus,
    //   goIndus,
    //   trialRun,
    //   pilotRun,
    //   goProd,
    //   status,
    // });

    const newProject = await pool.query(
      'INSERT INTO projects (title, slug, description, owner, "ownerTeam", "sportTeam", "productEngineer", "kickOff", "feasiOk", "creaOk", "selectionOk", "shipmentOk", industrialisation, "kickOffIndus", "goIndus", "trialRun", "pilotRun", "goProd", status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *',
      [
        title.trim(),
        slug,
        description,
        req.user.userId,
        req.user.team,
        sportTeam.trim(),
        productEngineer,
        formatDate(kickOff),
        formatDate(feasiOk),
        formatDate(creaOk),
        formatDate(selectionOk),
        formatDate(shipmentOk),
        industrialisation,
        formatDate(kickOffIndus),
        formatDate(goIndus),
        formatDate(trialRun),
        formatDate(pilotRun),
        formatDate(goProd),
        status,
      ],
    );

    res.json({
      result: true,
      project: newProject.rows[0],
    });
  } catch (error) {
    console.log("Error creation", error);
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
    // const projectExisting = await Project.findByIdAndDelete(
    //   req.params.projectId,
    // );
    const projectExisting = await pool.query(
      "DELETE FROM projects WHERE id = $1",
      [req.params.projectId],
    );
    if (projectExisting.rowCount === 0) {
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
    // const projectExisting = await Project.findOne({
    //   _id: req.params.projectId,
    //   owner: req.user.userId,
    // });
    const projectExisting = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND owner = $2",
      [req.params.projectId, req.user.userId],
    );
    if (!projectExisting.rows[0]) {
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
    // await Project.updateOne(
    //   { _id: req.params.projectId },
    //   {
    //     title,
    //     slug,
    //     description,
    //     sportTeam,
    //     productEngineer,
    //     kickOff,
    //     feasiOk,
    //     creaOk,
    //     selectionOk,
    //     shipmentOk,
    //     industrialisation,
    //     kickOffIndus,
    //     goIndus,
    //     trialRun,
    //     pilotRun,
    //     goProd,
    //     status,
    //   },
    // );

    const modifiedProject = await pool.query(
      'UPDATE projects SET title=$1, slug=$2, description=$3, "sportTeam"=$4, "productEngineer"=$5, "kickOff"=$6, "feasiOk"=$7, "creaOk"=$8, "selectionOk"=$9, "shipmentOk"=$10, industrialisation=$11, "kickOffIndus"=$12, "goIndus"=$13, "trialRun"=$14, "pilotRun"=$15, "goProd"=$16, status=$17 WHERE id = $18 RETURNING *',
      [
        title.trim(),
        slug,
        description,
        sportTeam.trim(),
        productEngineer,
        formatDate(kickOff),
        formatDate(feasiOk),
        formatDate(creaOk),
        formatDate(selectionOk),
        formatDate(shipmentOk),
        industrialisation,
        formatDate(kickOffIndus),
        formatDate(goIndus),
        formatDate(trialRun),
        formatDate(pilotRun),
        formatDate(goProd),
        status,
        req.params.projectId,
      ],
    );

    // Fetch the updated project
    // const modifiedProject = await Project.findById(req.params.projectId);

    res.json({
      result: true,
      project: modifiedProject.rows[0],
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
