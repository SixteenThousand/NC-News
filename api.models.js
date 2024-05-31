const db = require("./db/connection");


/**
* Fetches a list of all the topics data from the DB.
* @return Promise<Object[]>: an array of the topics, represented as 
*   objects with properties:
*     "slug": string
*     "description": string
*/
async function getAllTopics() {
  return db.query(`SELECT * FROM topics`)
    .then(({ rows }) => {
      return rows;
    });
}

async function getArticleById(id) {
  return db.query(
    `SELECT * FROM articles WHERE article_id = $1`,
    [id])
    .then(({ rows }) => {
      if(rows.length > 0) {
        return rows[0];
      } else {
        return Promise.reject({
          status: 404,
          msg: "Not Found",
        });
      }
    });
}

async function getAllArticles() {
  return db.query(
    `SELECT
      articles.author,
      articles.title,
      articles.article_id,
      articles.topic,
      articles.votes,
      articles.created_at,
      article_img_url,
      COUNT(comment_id)::INTEGER AS comment_count
      FROM articles JOIN comments ON articles.article_id = comments.comment_id
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;`)
    .then(({ rows }) => {
      return rows;
    });
}

async function getCommentsByArticle(articleId) {
  return db.query(
    `SELECT
      comment_id,
      votes,
      created_at,
      author,
      body,
      article_id
      FROM comments WHERE article_id = $1
      ORDER BY created_at DESC`,
    [articleId])
    .then(({ rows }) => {
      if(rows.length > 0) { 
        return rows;
      } else {
        // note here we use the error handling of getArticleById
        // to throw a 404
        return getArticleById(articleId)
          .then(() => {
            return rows;
          });
      }
    });
}
 
async function insertComment(articleId,comment) {
  return db.query(
    `INSERT INTO comments (author,article_id,body) VALUES
      ($1,$2,$3)
      RETURNING *;`,
    [comment.username, articleId, comment.body])
    .then(({ rows }) => {
      return rows[0];
    });
}


module.exports = {
  getAllTopics,
  getArticleById,
  getAllArticles,
  getCommentsByArticle,
  insertComment,
};
