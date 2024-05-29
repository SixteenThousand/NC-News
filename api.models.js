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

async function getArticles() {
  return db.query(
    `SELECT articles.*, COUNT(comment_id) AS comment_count
      FROM articles JOIN comments ON articles.article_id = comments.comment_id
      GROUP BY articles.article_id;`)
    .then(({ rows }) => {
      return rows;
    });
}


module.exports = {
  getAllTopics,
  getArticleById,
  getArticles,
};
