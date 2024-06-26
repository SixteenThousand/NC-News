const express = require("express");
const controllers = require("./api.controllers");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());
if(process.env.ENABLE_LOGGING) app.use(controllers.logRequest);

app.get("/api/topics", controllers.getTopics);
app.get("/api", controllers.getApiHelp);
app.get("/api/articles/:article_id", controllers.getArticlesParamId);
app.get("/api/articles", controllers.getArticles);
app.get("/api/articles/:article_id/comments",
  controllers.getCommentsByArticle);
app.post("/api/articles/:article_id/comments", controllers.postComment);
app.patch("/api/articles/:article_id", controllers.patchArticle);
app.delete("/api/comments/:comment_id", controllers.deleteComment);
app.get("/api/users", controllers.getUsers);

// error handlers
if(process.env.ENABLE_LOGGING) app.use(controllers.logError);
app.use(controllers.handlePostgresErrors);
app.use(controllers.handleCustomErrors);


module.exports = app;
