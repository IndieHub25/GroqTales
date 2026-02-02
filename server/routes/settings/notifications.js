const router = require("express").Router();
const requireAuth = require("../../middleware/requireAuth");

router.get("/", requireAuth, async(req, res) =>{
    res.json(req.user.notificationSettings);
});

router.put("/", requireAuth, async(req, res)=>{
    req.user.notificationSettings = {
        ...req.user.notificationSettings,
        ...req.body
    };
    await req.user.save();
    res.json(req.user.notificationSettings);
});

module.exports = router;
   