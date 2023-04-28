const express = require("express");
const mysql = require("mysql2");

let control = null;
let timer;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "appyogi",
});

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to database: ", error);
    return;
  }

  const query =
    "CREATE TABLE IF NOT EXISTS KEYBOARD (ID BIGINT(20) NOT NULL AUTO_INCREMENT, USER INTEGER(11) NOT NULL, KEYBOARD_KEY INTEGER(11) NOT NULL, PRIMARY KEY(ID))";

  connection.execute(query, (err, rows) => {
    if (err) console.log("Error", err);
  });

  console.log("Connected to database.");
});

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.post("/key-press", (req, res) => {
  try {
    const user = req.query.user;
    const key = req.body.key;

    const selectQuery = `Select * from Keyboard where keyboard_key = ${key}`;
    const insertQuery = `Insert into Keyboard (user, keyboard_key) values('${user}', '${key}')`;
    const deleteQuery = `Delete from Keyboard where keyboard_key = ${key}`;

    connection.execute(selectQuery, (err, rows) => {
      if (rows.length > 0) {
        connection.execute(deleteQuery, (err, rows) => {
          if (!err) {
            control = null;
            clearTimeout(timer);
            return res.status(200).json({ status: "success", data: "remove" });
          }
        });
      } else {
        connection.execute(insertQuery, (err, rows) => {
          if (!err) {
            control = null;
            clearTimeout(timer);
            return res.status(200).json({ status: "success", data: "add" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/key-data", (req, res) => {
  try {
    const selectQuery = `Select * from Keyboard`;

    connection.execute(selectQuery, (err, rows) => {
      return res.status(200).json({ status: "success", data: rows });
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/get-control", (req, res) => {
  res.status(200).json({ status: 200, data: control });
});

app.post("/set-control", (req, res) => {
  control = req.body.control;

  timer = setTimeout(() => {
    control = null;
  }, 120000);

  res.status(200).json({ status: 200, data: control });
});

app.listen(5000, () => {
  console.log("Server running on port 5000...");
});
