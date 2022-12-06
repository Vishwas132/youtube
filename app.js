import express from "express";
import route from "./routes/index.js";
import db from "./models/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import Handlebars from "handlebars";
import cons from "consolidate";

const app = express();
let port = 3000;

const corsOptions = {
  origin: "http://127.0.0.1:5500",
  credentials: true,
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(route);

app.use(express.static("/view/"));
app.set("view engine", "handlebars");
app.set("views", "./view/pages/");
app.engine("handlebars", cons.handlebars);

db.sequelize
  // .sync({alter: true})
  // .sync({force: true})
  .authenticate()
  .then(() => {
    return app.listen(port, () => {
      console.log(`Server listning on at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.trace("Server Error: ", err);
  });

export default app;
