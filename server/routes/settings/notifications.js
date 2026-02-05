const router = require("express").Router();
const requireAuth = require("../../middleware/requireAuth");

router.get("/", requireAuth, async(req, res) =>{
    res.json(req.user.notificationSettings);
});

router.put("/", requireAuth, async(req, res)=>{
    try {
        const {email, inApp} = req.body;

        req.user.notificationSettings = {
            email: {
                ...req.user.notificationSettings.email,...email
            },
            inApp: {
                ...req.user.notificationSettings.inApp,
                ...inApp
            },
        };
        await req.user.save();
        res.json(req.user.notificationSettings);
    } catch (err) {
        console.error("Notification settings update failed:", err);
        res.status(500).json({error: "Failed to update notification settings"});
    }
});

module.exports = router;
   