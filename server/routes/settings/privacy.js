const router = require("express").Router();
const {authRequired: requireAuth} = require("../../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
    try{
        const p = req.user.privacySettings;

        res.json({
            success: true,
            data: {
                profileVisible: p.profilePublic?? true,
                allowComments: p.allowComments?? true,
                showActivity: p.showActivity?? true,
                showReadingHistory: p.showReadingHistory?? true,
                dataCollection: p.dataCollection?? true,
                personalization: p.personalization?? true,
            },
    });
}catch(err){
    console.error("Fetch privacy settings failed:", err);
    res.status(500).json({
        success: false,
        error: {message: "Failed to fetch privacy settings"},
    });
}
});

router.put("/", requireAuth, async(req,res)=>{
    try{
        const {
            profileVisible,
            allowComments,
            showActivity,
            showReadingHistory,
            dataCollection,
            personalization,
        } = req.body;

        if(typeof profileVisible == "boolean")
            req.user.privacySettings.profilePublic = profileVisible;
        if(typeof allowComments == "boolean")
            req.user.privacySettings.allowComments = allowComments;
        if(typeof showActivity == "boolean")
            req.user.privacySettings.showActivity = showActivity;
        if(typeof showReadingHistory == "boolean")
            req.user.privacySettings.showReadingHistory = showReadingHistory;
        if(typeof dataCollection == "boolean")
            req.user.privacySettings.dataCollection = dataCollection;
        if(typeof personalization == "boolean")
            req.user.privacySettings.personalization = personalization;

        await req.user.save();
        
    res.json({
        success: true,
        data: req.body,
    });
    } catch (err) {
        console.error("Privacy settings update failed:", err);
        res.status(500).json({
            success: false,
            error: {message: "Failed to update privacy settings"},
    });
    }
});

module.exports = router;