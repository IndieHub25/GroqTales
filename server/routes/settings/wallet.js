const router = require("express").Router();
const {authRequired: requireAuth} = require("../../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
//   if (!req.user.wallet) {
//     return res.json({
//         success: true,
//         data: null,
//     });
// }
try {
return res.json({
    success: true,
    data: {
        address: req.user.wallet?.address ?? "",
        // network: req.user.wallet.network,
        // provider: req.user.wallet.provider,
        connected: !!req.user.wallet?.address,
        verified: req.user.wallet?.verified ?? false,
        //lastConnectedAt: req.user.wallet.lastConnectedAt,
    },
});
} catch(err){
    console.error("Fetch wallet failed:", err);
    res.status(500).json({
        success: false,
        error: {message: "Failed to fetch wallet"},
    });
}
});

router.put("/", requireAuth, async(req,res)=>{
    try {
        const {address} = req.body;

        // if (!address || !network || !provider) {
        //     return res
        //     .status(400)
        //     .json({
        //         success: false,
        //         error: {message: "address, network, and provider are required"},

        //         });
        // }
    req.user.wallet = {
        address,
        // network,
        // provider,
        verified: false,
        // lastConnectedAt: new Date(),
    };
    await req.user.save();
    return res.json({
        success: true,
        data: {
            address,
            connected: true,
            verified: false,
        }
    });
    } catch(err){
        console.error("Wallet update failed:", err);
        res.status(500).json({
            success: false,
            error: {message: "Failed to update wallet"},
    });
    }
    
});

module.exports = router;