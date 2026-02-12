const router = require("express").Router();
const {authRequired: requireAuth} = require("../../middleware/auth");
const User= require("../../models/User");

// router.get("/", requireAuth, async (req, res) => {
// //   if (!req.user.wallet) {
// //     return res.json({
// //         success: true,
// //         data: null,
// //     });
// // }
// try {
// return res.json({
//     success: true,
//     data: {
//         address: req.user.wallet?.address ?? "",
//         // network: req.user.wallet.network,
//         // provider: req.user.wallet.provider,
//         connected: !!req.user.wallet?.address,
//         verified: req.user.wallet?.verified ?? false,
//         //lastConnectedAt: req.user.wallet.lastConnectedAt,
//     },
// });
// } catch(err){
//     console.error("Fetch wallet failed:", err);
//     res.status(500).json({
//         success: false,
//         error: {message: "Failed to fetch wallet"},
//     });
// }
// });

router.put("/", requireAuth, async(req,res)=>{
    try {
        const {address} = req.body;

        if (!address) {
            return res
            .status(400)
            .json({
                // success: false,
                error:  "wallet address is required",

                });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res
            .status(404)
            .json({
                // success: false,
                error:  "user not found",

                });
        }
    user.wallet = {
        address,
        connected: true,
        // network,
        // provider,
        verified: false,
        lastConnectedAt: new Date(),
    };
    await user.save();
    return res.json({
        success: true,
        data: user.wallet,
    });
    } catch(err){
        console.error("Wallet update failed:", err);
        res.status(500).json({
            //success: false,
            error:  "server error",
    });
    }
    
});

module.exports = router;