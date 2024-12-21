import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt, { hash } from "bcrypt";


const app = express();
const port = 3000;
const saltRounds = 10;



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

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      //hashing 
        bcrypt.hash(password, saltRounds,async(err,hash)=> {
        if(err){
         console.log("error "); 
        }else{
        const result = await db.query(
          "INSERT INTO users (email, password) VALUES ($1, $2)",
          [email, hash]
        );
        console.log(result);
        res.render("afterRegister.ejs");
      }

      });
      
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const loginpassword = req.body.password;

  try{
    const result = await db.query("SELECT * FROM users WHERE email = $1",[
      email,
    ]);
    if(result.rows.length > 0){
      //console.log(result.rows);
      const users = result.rows[0];
      const storeHashedPassword = users.password;

      bcrypt.compare(loginpassword,storeHashedPassword,(err, result)=>{
        if(err){
          console.log("Error");
        }else{
          if(result){
            res.render("secrets.ejs");
          }else{
            res.send("Incorrect Password");
          }
        }
      })

    }else{
      res.send("Users not found"); //not register 
    }
  }catch(err){
    console.log(err);
  }
  

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
