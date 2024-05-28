const express = require("express");
const controllers = require("./api.controllers");


const app = express();

app.get("/api/topics", controllers.getTopics);


module.exports = app;
