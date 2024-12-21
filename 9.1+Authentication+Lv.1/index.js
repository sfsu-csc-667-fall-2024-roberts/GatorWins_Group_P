import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;



// Create a connection pool
const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Secrets',
  password: '123456',
  port: 5432, // Default PostgreSQL port
});

db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  const result = await db.query(
    "INSERT INTO users (email, password) VALUES ($1, $2)",
    [email, password]
  );

  //console.log(result);
  res.render("secrets.ejs");

  

  
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try{
    const result = await db.query("SELECT * FROM users WHERE email = $1",[
      email,
    ]);
    if(result.rows.length > 0){
      console.log(result.rows);
      const users = result.rows[0];
      const storePassword = users.password;

      if(password == storePassword){
        res.render("secrets.ejs");
      }else{
        res.send("Incorrect Password");
      }
    }else{
      res.send("Users not found");
    }
  }catch(err){
    console.log(err);
  }
  

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
