const express = require("express");
const controllers = require("./api.controllers");


const app = express();

app.use(express.json());

app.get("/api/topics", controllers.getTopics);
app.get("/api", controllers.getApiHelp);
app.get("/api/articles/:article_id", controllers.getArticlesParamId);
app.get("/api/articles", controllers.getArticles);
app.get("/api/articles/:article_id/comments",
  controllers.getCommentsByArticle);
app.post("/api/articles/:article_id/comments", controllers.postComment);
app.patch("/api/articles/:article_id", controllers.patchArticle)

// error handlers
app.use(controllers.handlePostgresErrors);
app.use(controllers.handleCustomErrors);


module.exports = app;
