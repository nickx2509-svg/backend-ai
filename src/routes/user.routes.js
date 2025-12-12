import { Router } from "express";
import { changeCurrectPassword,
   getCurrentUser, 
   getUserChannelProfie, 
   getWatchHistory, 
   loginUser, 
   logoutUser,
    refreshAccessToken, 
    registerUser, 
    updateUserAvatar,
     updateUserCoverImage,
     updateUserDetail } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

router.route('/register').post(
   upload.fields([

    {
      name:"avatar",
      maxCount:1
    },
    {
      name:"coverImage",
      maxCount:1
    }

   ]),

  registerUser
)

router.route('/login').post(loginUser)

//secured route
router.route('/logout').post( verifyJWT, logoutUser)

router.route('/refreshToken').post( refreshAccessToken )

router.route("/change-password").post(verifyJWT , changeCurrectPassword),

router.route('/current-user').get( verifyJWT , getCurrentUser)

router.route('/update-detail').patch(verifyJWT,updateUserDetail)

router.route('/update-avatar').patch( verifyJWT , upload.single , updateUserAvatar)

router.route('/update-coverImage').patch( verifyJWT,upload.single("/coverImage"),updateUserCoverImage)

router.route("/c/:username").get( verifyJWT,getUserChannelProfie)

router.route('/get-watch-history').get(verifyJWT,getWatchHistory)

export default router