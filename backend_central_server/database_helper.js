const sqlite3 = require("sqlite3").verbose();

const db_table_statements = [
  `CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    question_type INTEGER,
    question_string TEXT,
    question_vector BLOB
  )`,
  `CREATE INDEX IF NOT EXISTS idx_question_type ON questions (question_type)`,
  `CREATE TABLE IF NOT EXISTS surveyAnswered (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    secret_survey_id TEXT,
    blocktime INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS idx_secret_survey_id ON surveyAnswered (secret_survey_id)`,

  `CREATE TABLE IF NOT EXISTS Posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post TEXT,
    image BLOB,
    time INTEGER,
    createdBy INTEGER, 
    totalLikes INTEGER DEFAULT 0
)`,

  `CREATE TABLE IF NOT EXISTS Likes (
    user TEXT,
    post_id INTEGER,
    PRIMARY KEY (user, post_id),
    FOREIGN KEY (post_id) REFERENCES Posts(id)
)`,

  `CREATE TABLE IF NOT EXISTS Follows (
    follower TEXT,
    following INTEGER, 
    PRIMARY KEY (follower, following)
)`,
  `CREATE TABLE IF NOT EXISTS reward_transactions (
   id integer primary key autoincrement,
   from_eth TEXT,
    to_eth TEXT,
    amount INTEGER,
    time INTEGER
)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_createdBy ON Posts (createdBy)`,

  `CREATE INDEX IF NOT EXISTS idx_posts_time ON Posts (time)`,

  `CREATE INDEX IF NOT EXISTS idx_follows_follower ON Follows (follower)`,

  `CREATE INDEX IF NOT EXISTS idx_follows_following ON Follows (following)`,

  `CREATE INDEX IF NOT EXISTS idx_likes_post_id ON Likes (post_id)`,
  `CREATE INDEX IF NOT EXISTS idx_transaction ON reward_transactions (from_eth,to_eth,time)`,
];

function db_init() {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  db.serialize(function () {
    db_table_statements.forEach((statement) => {
      db.run(statement, function (err) {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`Statement executed: ${statement}`);
      });
    });
  });
  db.close(); // Close the database connection after all operations are completed
}

function saveRewardTransaction(from, to, amount, time, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const stmt = db.prepare(
    "INSERT INTO reward_transactions (from_eth, to_eth, amount, time) VALUES (?, ?, ?, ?)"
  );
  stmt.run(from, to, amount, time, function (err) {
    if (err) {
      callback(err);
      return;
    }
    callback(null, this.lastID); // Return the ID of the inserted row
  });
  stmt.finalize();
  db.close(); // Close the database connection after all operations are completed
}

function getRewardTotalOfUser(user, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const query = `SELECT sum(amount) as total FROM reward_transactions WHERE to_eth = ?`;
  db.get(query, user, function (err, row) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, row);
  });
  db.close(); // Close the database connection after all operations are completed
}

function getTotalValueTransactedOnPlatform(callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const query = `SELECT sum(amount)/2 as total FROM reward_transactions`;
  db.get(query, function (err, row) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, row);
  });
  db.close(); // Close the database connection after all operations are completed
}

function getAllQuestions(q_Type, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  if (q_Type == 999) {
    query = `SELECT id, question_id,question_type, question_string, question_vector FROM questions where question_type in (0,1)`;
  } else {
    query = `SELECT id, question_id,question_type, question_string, question_vector FROM questions where question_type=${q_Type}`;
  }

  db.all(query, function (err, rows) {
    if (err) {
      callback(err, null);

      return;
    }
    const questions = rows.map((row) => ({
      id: row.id,
      question_id: row.question_id,
      question_type: row.question_type,
      question_string: row.question_string,
      question_vector: new Float32Array(
        new Uint8Array(row.question_vector).buffer
      ),
    }));
    callback(null, questions);
  });
  db.close(); // Close the database connection after all operations are completed
}

function insertQuestion(
  questionId,
  question_type,
  questionString,
  questionVector,
  callback
) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const stmt = db.prepare(
    "INSERT INTO questions (question_id, question_type,question_string, question_vector) VALUES (?, ?, ?,?)"
  );
  stmt.run(
    questionId,
    question_type,
    questionString,
    Buffer.from(questionVector.buffer),
    function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, this.lastID); // Return the ID of the inserted row
    }
  );
  stmt.finalize();
  db.close(); // Close the database connection after all operations are completed
}

function deleteId(id) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  db.run("DELETE FROM questions WHERE id = ?", id, function (err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Row(s) deleted: ${this.changes}`);
  });
  db.close(); // Close the database connection after all operations are completed
}

function insertSurveyAnswered(secretSurveyId, blocktime, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const stmt = db.prepare(
    "INSERT INTO surveyAnswered (secret_survey_id, blocktime) VALUES (?, ?)"
  );
  stmt.run(secretSurveyId, blocktime, function (err) {
    if (err) {
      callback(err);
      return;
    }
    callback(null, this.lastID); // Return the ID of the inserted row
  });
  stmt.finalize();
  db.close(); // Close the database connection after all operations are completed
}

function getSurveyAnswered(secretSurveyId, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const query = `SELECT blocktime FROM surveyAnswered WHERE secret_survey_id = ?`;
  db.all(query, secretSurveyId, function (err, rows) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, rows);
  });
  db.close(); // Close the database connection after all operations are completed
}

// Function to insert a post into the Posts table
function insertPost(postData, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const stmt = db.prepare(
    "INSERT INTO Posts (post, image, time, createdBy) VALUES (?, ?, ?, ?)"
  );
  stmt.run(
    postData.post,
    postData.image,
    postData.time,
    postData.createdBy,
    function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, this.lastID); // Return the ID of the inserted row
    }
  );
  stmt.finalize();
  db.close(); // Close the database connection after all operations are completed
}

function increaseLikes(postId, user, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    const stmt = db.prepare("INSERT INTO Likes (user, post_id) VALUES (?, ?)");
    stmt.run(user, postId, function (err) {
      if (err) {
        db.run("ROLLBACK");
        callback(err);
        return;
      }
      db.run(
        "UPDATE Posts SET totalLikes = totalLikes + 1 WHERE id = ?",
        postId,
        function (err) {
          if (err) {
            db.run("ROLLBACK");
            callback(err);
            return;
          }
          db.run("COMMIT");
          callback(null);
        }
      );
    });
    stmt.finalize();
  });
}

function decreaseLikes(postId, user, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    db.run(
      "DELETE FROM Likes WHERE user = ? AND post_id = ?",
      user,
      postId,
      function (err) {
        if (err) {
          db.run("ROLLBACK");
          callback(err);
          return;
        }
        db.run(
          "UPDATE Posts SET totalLikes = totalLikes - 1 WHERE id = ?",
          postId,
          function (err) {
            if (err) {
              db.run("ROLLBACK");
              callback(err);
              return;
            }
            db.run("COMMIT");
            callback(null);
          }
        );
      }
    );
  });
}

// Function to add a following for a follower
function addFollowing(follower, following, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const stmt = db.prepare(
    "INSERT INTO Follows (follower, following) VALUES (?, ?)"
  );
  stmt.run(follower, following, function (err) {
    if (err) {
      callback(err);
      return;
    }
    callback(null);
  });
  stmt.finalize();
  db.close();
}

// Function to remove a following for a follower
function removeFollowing(follower, following, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  db.run(
    "DELETE FROM Follows WHERE follower = ? AND following = ?",
    follower,
    following,
    function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    }
  );
  db.close();
}

function getTop10RecentPostsByFollowing(user, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const query = `
        SELECT P.*, CASE WHEN L.user IS NULL THEN 0 ELSE 1 END AS liked
        FROM Posts P
        INNER JOIN Follows F ON P.createdBy = F.following
        LEFT JOIN Likes L ON P.id = L.post_id AND L.user = ?
        WHERE F.follower = ?
        ORDER BY P.time DESC
        LIMIT 10
    `;
  db.all(query, [user, user], function (err, rows) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, rows);
  });
  db.close();
}

function getLatest10Posts(user, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const query = `
        SELECT P.*, CASE WHEN L.user IS NULL THEN 0 ELSE 1 END AS liked
        FROM Posts P
        LEFT JOIN Likes L ON P.id = L.post_id AND L.user = ?
        ORDER BY P.time DESC
        LIMIT 10
    `;
  db.all(query, user, function (err, rows) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, rows);
  });
  db.close();
}

// Function to retrieve 10 latest posts from all posts
function getOrganisationsAllPost(organisationId, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const query = `
        SELECT *
        FROM Posts
        WHERE createdBy = ?
        ORDER BY time DESC
    `;
  db.all(query, organisationId, function (err, rows) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, rows);
  });
  db.close();
}

function getUsersFollowings(user, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const query = `
        SELECT following
        FROM Follows
        WHERE follower = ?
    `;
  db.all(query, user, function (err, rows) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, rows);
  });
  db.close();
}

function getOrganisationFollowers(orgId, callback) {
  const db = new sqlite3.Database("ResearchAppDB[DoNotDelete].db");
  const query = `
        SELECT follower
        FROM Follows
        WHERE following = ?
    `;
  db.all(query, orgId, function (err, rows) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, rows);
  });
  db.close();
}

module.exports = {
  db_init,
  getAllQuestions,
  insertQuestion,
  deleteId,
  insertSurveyAnswered,
  getSurveyAnswered,
  insertPost,
  increaseLikes,
  decreaseLikes,
  addFollowing,
  removeFollowing,
  getTop10RecentPostsByFollowing,
  getLatest10Posts,
  getOrganisationsAllPost,
  getUsersFollowings,
  getOrganisationFollowers,
  saveRewardTransaction,
  getRewardTotalOfUser,
  getTotalValueTransactedOnPlatform,
};
