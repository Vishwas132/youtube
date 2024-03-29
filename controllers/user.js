import * as user from "../services/user.js";
import config from "config";

const signupUser = async (req, res) => {
  try {
    const { refreshToken, ...userObj } = await user.signupUser(req.body);
    res.cookie("sessionToken", refreshToken, {
      maxAge: config.get("app.sessionExpiresInMilliseconds"),
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });
    return res.status(200).json(userObj);
  } catch (error) {
    console.trace("error", error);
    return res.status(500).json({ error: error });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userObj = await user.getUserProfile(req.params.userId);
    if (!userObj) return res.sendStatus(404);
    const { Channels, ...newUserObj } = userObj;
    Object.assign(newUserObj, Channels);
    return res.status(200).json(newUserObj);
  } catch (error) {
    console.trace("error", error);
    return res.status(500).json(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const userObj = await user.deleteUser(userId);
    if (!userObj) return res.sendStatus(404);
    return res.status(200).json(`User ${userId} deleted`);
  } catch (error) {
    console.trace("error", error);
    return res.status(500).json(error);
  }
};

const getPdfReport = async (req, res) => {
  try {
    const pdf = await user.getPdfReport(req.params);
    if (!pdf) return res.sendStatus(404);
    // res.set({
    //   "Content-Type": "application/pdf",
    //   "Content-length": pdf.length,
    // });
    return res.status(200).sendFile(pdf);
  } catch (error) {
    console.trace("error", error);
    return res.status(500).json(error);
  }
};

const getChannelInfo = async (req, res) => {
  try {
    const { userId } = req.body;
    let channelObj = await user.getChannelInfo(userId);
    if (channelObj === undefined) return res.sendStatus(404);
    if (channelObj.userId !== String(userId)) {
      let { channelOwnerId, ...newChannelObj } = channelObj;
      channelObj = newChannelObj;
    }
    return res.status(200).json(channelObj);
  } catch (error) {
    console.trace("error", error);
    return res.status(500).json(error);
  }
};

export { getUserProfile, signupUser, deleteUser, getPdfReport, getChannelInfo };
