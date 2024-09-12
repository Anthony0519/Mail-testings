 const router = require("express").Router()
const { createUser,  verifyUser} = require("../controller/userController")
const { subscribe,  comfirmsubscription} = require("../controller/subController")

router.post("/signup",createUser)
router.post("/subscribe",subscribe)

router.get("/verify/:token",verifyUser)
router.get("/comfirm/:token",comfirmsubscription)

module.exports = router
