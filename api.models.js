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

// retrieves all data about articles based on a given set of filters.
// @param filters: Object; the filters to be applied. Each key in the object 
// should be a field in the articles table, and its value the value you want 
// search results in that field to have
async function selectArticles(filters) {
  let filterQuery = "";
  let filterParams = [];
  if(filters !== undefined) {
    for(const field in filters) {
      filterParams.push(filters[field]); // this step MUST be done first!
      filterQuery += `WHERE ${field} = $${filterParams.length}`;
    }
  }
  console.log(`filterQuery: >>${filterQuery}<<`); // debug
  console.log(`filterParams: >>${filterParams}<<`); // debug
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
      ${filterQuery}
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;`,
      filterParams)
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

async function updateVotes(articleId,incVotes) {
  return db.query(
    `SELECT votes FROM articles WHERE article_id = $1`,
    [articleId])
    .then(({ rows }) => {
      if(rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Not Found",
        });
      }
      return rows[0].votes;
    })
    .then((currentVotes) => {
      currentVotes += incVotes;
      if(currentVotes < 0) currentVotes = 0;
      return db.query(
        `UPDATE articles
          SET votes = $1 WHERE article_id = $2
          RETURNING *;`,
        [currentVotes, articleId]);
    })
    .then(({ rows }) => {
      return rows[0];
    });
}

async function deleteCommentById(commentId) {
  return db.query(
    `DELETE FROM comments
      WHERE comment_id = $1
      RETURNING *;`,
    [commentId])
    .then(({ rows }) => {
      if(rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Not Found",
        });
      }
    });
}

async function getAllUsers() {
  return db.query(`SELECT * FROM users;`,)
    .then(({ rows }) => {
      return rows;
    });
}


module.exports = {
  getAllTopics,
  getArticleById,
  selectArticles,
  getCommentsByArticle,
  insertComment,
  deleteCommentById,
  updateVotes,
  getAllUsers,
};
