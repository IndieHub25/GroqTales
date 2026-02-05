const router = require("express").Router();
const requireAuth = require("../../middleware/requireAuth");

router.get("/", requireAuth, async (req, res) => {
    // try {
    //     const body = req.body?? {};
    //     res.user.privacySettings = {
    //         ...req.user.privacySettings,
    //         profilePublic: Boolean(body.profilePublic),
    //         allowComments: Boolean(body.allowComments),
    //         showActivity: Boolean(body.showActivity),
    //         showReadingHistory: Boolean(body.showReadingHistory),
    //         dataCollection: Boolean(body.dataCollection),
    //         personalization: Boolean(body.personalization),
    //     };
    //     await req.user.save();
        res.json(req.user.privacySettings);
    // } catch (err) {
    //     console.error("Privacy settings retrieval failed:", err);
    //     res.status(500).json({error: "Failed to retrieve privacy settings"});
    // }
});

router.put("/", requireAuth, async(req,res)=>{
    try{
        Object.assign(req.user.privacySettings, req.body);
        await req.user.save();
        //await req.user.save();
    res.json(req.user.privacySettings);
    } catch (err) {
        //console.error("Privacy settings update failed:", err);
        res.status(500).json({error: "Failed to update privacy settings"});
    }
    
});

module.exports = router;