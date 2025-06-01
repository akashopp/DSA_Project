import express from "express";

import { CreateUser, getUser, getUserSolved, AddProblem, DeleteProblem, findUser, LogoutUser, LoginUser, getUsernames, getUserActivity, postUserActivity, clearMentions } from "../controllers/user.controller.js";

const router = express.Router();

router.route("/register").post(CreateUser);
router.route("/getuser/:id").get(getUser);
router.route("/getproblems/:id").get(getUserSolved)
router.route("/addproblem").put(AddProblem)
router.route("/deleteproblem").put(DeleteProblem)
router.route("/finduser").post(findUser);
router.route("/login").post(LoginUser);
router.route("/logout").post(LogoutUser)
router.post("/usernames", getUsernames);
router.get("/activities", getUserActivity);
router.post("/activities", postUserActivity);
router.post("/clearMentions", clearMentions);

// router.route("/addproblem").https://github.com/akashopp/DSA-Project.gitpost(AddProblem);

export default router;