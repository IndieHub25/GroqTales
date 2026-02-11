const router = require("express").Router();
const {authRequired :requireAuth} = require("../../middleware/auth");

router.get("/", requireAuth, async(req, res) =>{
    try {
        const settings = req.user.notificationSettings;
    
    return res.json({
        success: true,
        data: {
            email: settings.email.platform ?? false,
            push : settings.inApp.messages ?? false,
            sms: false,
            marketing : settings.email.platform ?? false,
            updates : settings.email.platform ?? false,
            comments : settings.email.comments ?? false,
            likes : settings.email.likes ?? false,
            follows : settings.email.followers ?? false,
            
            // likes: req.user.notificationSettings.email.likes,
            // followers: req.user.notificationSettings.email.followers,
            // nftSales: req.user.notificationSettings.email.nftSales,
            // platform: req.user.notificationSettings.email.platform,
        
        // inApp: {
        //     comments: req.user.notificationSettings.inApp.comments,
        //     likes: req.user.notificationSettings.inApp.likes,
        //     followers: req.user.notificationSettings.inApp.follwers,
        //     messages: req.user.notificationSettings.inApp.messages,
        // },
    },  
});
} catch(err){
    console.log("Fetch notification settings failed:", err);
    res.status(500).json({
        success: false,
        error: {message: "Failed to fetch notification settings"},
    });
}
});

router.put("/", requireAuth, async(req, res)=>{
    try {
        const {email, push, comments, likes, follows,} = req.body;

        if(typeof comments === "boolean")
            req.user.notificationSettings.email.comments = comments;
        if(typeof likes === "boolean")
            req.user.notificationSettings.email.likes = likes;
        if(typeof follows === "boolean")
            req.user.notificationSettings.email.follows = follows;
        if(typeof email === "boolean")
            req.user.notificationSettings.email.platform = email;
        if(typeof push === "boolean")
            req.user.notificationSettings.inApp.messages = push;

        await req.user.save();
        return res.json({
            success: true,
            data: req.body,
    });
    } catch (err) {
        console.error("Notification settings update failed:", err);
        res.status(500).json({
            success: false,
            error: {message: "Failed to update notification settings"},
    });
    }
});


module.exports = router;
   