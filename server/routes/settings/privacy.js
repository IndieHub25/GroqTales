const router = require("express").Router();
const requireAuth = require("../../middleware/requireAuth");

router.get("/", requireAuth, async (req, res) => {
    res.json(req.user.privacySettings);
});

router.put("/", requireAuth, async(req,res)=>{
    req.user.privacySettings = {
        ...req.user.privacySettings,
        ...req.body
    };
    await req.user.save();
    res.json(req.user.privacySettings);
});

module.exports = router;