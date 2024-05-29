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
      return rows[0];
    });
}


module.exports = {
  getAllTopics,
  getArticleById,
};
