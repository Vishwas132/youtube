import {
  createAccessToken,
  createRefreshToken,
  getPasswordHash,
  removeVideoFiles,
} from "../utils/utils.js";
import db from "../models/index.js";
import puppeteer from "puppeteer";
import hb from "handlebars";
import path from "path";
import fsp from "fs/promises";
import { getAllVideos } from "./video.js";

const newUser = async (body) => {
  try {
    const { email, password } = body;
    const tokenObj = createAccessToken({ email });
    const refreshToken = createRefreshToken({ email });
    const passwordHash = await getPasswordHash(password);
    body.refreshToken = refreshToken;
    body.passwordHash = passwordHash;
    body.signedIn = true;
    const obj = await db.Users.create(body);
    return {
      userId: obj.dataValues.userId,
      accessToken: tokenObj.accessToken,
      accessTokenExpiry: tokenObj.accessTokenExpiry,
      refreshToken: refreshToken,
    };
  } catch (error) {
    console.trace("error", error);
    throw "Db error while executing query";
  }
};

const newUserProfile = async (body) => {
  try {
    const obj = await db.UsersProfile.create(body);
    return obj;
  } catch (error) {
    console.trace("error", error);
    throw "Db error while executing query";
  }
};

const newChannel = async (body) => {
  try {
    const obj = await db.Channels.create(body);
    return obj;
  } catch (error) {
    console.trace("error", error);
    throw "Db error while executing query";
  }
};

const createNewUser = async (body) => {
  try {
    const result = await db.sequelize.transaction(async (t) => {
      const userObj = await newUser(body);
      body.userId = userObj.userId;
      await newUserProfile(body);
      if (!body?.channelName) body.channelName = body.username;
      await newChannel(body);
      return userObj;
    });
    return result;
  } catch (error) {
    console.trace("error", error);
    throw error;
  }
};

const deleteUserById = async (userId) => {
  try {
    const videoObjs = await getAllVideos();
    const obj = await db.Users.destroy({
      where: {
        userId: userId,
      },
    });
    if (obj) {
      videoObjs.forEach(async (videoObj) => {
        await removeVideoFiles(videoObj.videoUrl);
      });
    }
    return obj;
  } catch (error) {
    console.trace("error", error);
    throw "Db error while executing query";
  }
};

const getProfileById = async (userId) => {
  try {
    const obj = await db.UsersProfile.findAll({
      where: {
        userId: userId,
      },
    });
    return obj?.[0]?.dataValues;
  } catch (error) {
    console.trace("error", error);
    throw "Db error while executing query";
  }
};

const channelInfo = async (channelId) => {
  try {
    const obj = await db.Channels.findByPk(channelId);
    return obj?.dataValues;
  } catch (error) {
    console.trace("error", error);
    throw "Db error while executing query";
  }
};

const channelInfoByUserId = async (userId) => {
  try {
    const obj = await db.Channels.findAll({
      where: { userId: userId },
    });
    return obj?.[0]?.dataValues;
  } catch (error) {
    console.trace("error", error);
    throw "Db error while executing query";
  }
};

const getPdfReport = async (body) => {
  try {
    let data = await getProfileById("v@abc.com");
    const content = (
      await fsp.readFile(process.cwd() + "/view/pages/profile.html", "utf8")
    ).toString();
    const pathName = path.resolve(process.cwd() + "/files/reports/display.pdf");
    const template = hb.compile(content, { strict: true });
    const html = template(data);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({
      path: pathName,
      format: "Letter",
      printBackground: false,
      margin: {
        top: "35px",
        right: "35px",
        bottom: "35px",
        left: "35px",
      },
    });
    await browser.close();
    return pathName;
  } catch (error) {
    console.trace("error", error);
    throw "Db error while executing query";
  }
};

export {
  createNewUser,
  deleteUserById,
  getProfileById,
  getPdfReport,
  channelInfo,
  channelInfoByUserId,
};
