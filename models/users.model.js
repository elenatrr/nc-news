const db = require("../db/connection");

exports.selectUser = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then((result) => {
      if (username && result.rows.length === 0) {
        return Promise.reject({
          status: 422,
          msg: "Unable to process the request: username does not exist",
        });
      }

      return result.rows[0];
    });
};
