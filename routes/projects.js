var express = require("express");
var router = express.Router();

const Project = require("../models/projects");

// Post new project
router.post("/", async (req, res) => {
  try {
    const newProject = await Project.create({
      title: "test titre",
      slug: "slug titre",
      //   owner: "pat",
      sportTeam: "trot",
      industrialisation: true,
    });

    res.json({ result: true });
  } catch (error) {
    console.error("Erreur de route", error);
    res.json({ result: false, error: "Required data missing" });
  }
});

module.exports = router;
