import { readdir } from "fs/promises";
import { basename, dirname } from "path";
import { Sequelize, DataTypes } from "sequelize";
import { fileURLToPath } from "url";

import jsonObj from "config";
const { database, username, password, ...dbConfig } = jsonObj.get("database");

import { createNamespace } from "cls-hooked";
const cls = createNamespace("youtube_backend");
Sequelize.useCLS(cls);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = {};
const sequelize = new Sequelize(database, username, password, {
  logging: console.log,
  ...dbConfig,
});

const files = await readdir(__dirname);
await Promise.all(
  files
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 &&
        file !== basename(__filename) &&
        file.slice(-3) === ".js"
      );
    })
    .map(async (file) => {
      const model = await import(`./${file}`);
      const namedModel = model.default(sequelize, DataTypes);
      db[namedModel.name] = namedModel;
      // return db;
    })
);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
