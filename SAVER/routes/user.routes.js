import { Router } from "express";
import { getProfile, login, logout, register } from "../controllers/user.controller.js";
import { isloggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import { forgotpassword } from "../controllers/user.controller.js";
import { resetpassword } from "../controllers/user.controller.js";
import { changepassword } from "../controllers/user.controller.js";
import { updateuser } from "../controllers/user.controller.js";

const router = Router();

router.post('/register',upload.single("avatar"), register);
router.post('/login', login);
router.get('/logout',logout);
router.get('/me', isloggedIn, getProfile);
router.post('/forgot-password', forgotpassword);
router.post('/reset-password', resetpassword);
router.post('/change-password', isloggedIn, changepassword)
router.put('/update/:id', isloggedIn, upload.single("avatar"), updateuser)
export default router;
