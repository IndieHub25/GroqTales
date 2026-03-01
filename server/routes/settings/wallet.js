const router = require("express").Router();
const {authRequired: requireAuth} = require("../../middleware/auth");
const User= require("../../models/User");

router.get("/", requireAuth, async (req, res) => {
//   if (!req.user.wallet) {
//     return res.json({
//         success: true,
//         data: null,
//     });
// }
try {
    const wallet = req.user.wallet || {};
    return res.json({
    success: true,
    data: {
        address: wallet.address ?? "",
        // network: req.user.wallet.network,
        // provider: req.user.wallet.provider,
        connected: !!wallet.address,
        verified: wallet.verified ?? false,
        lastConnectedAt: wallet.lastConnectedAt?? null,
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

        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res
            .status(400)
            .json({
                success: false,
                error: {message:  "A valid wallet address is required"},

                });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res
            .status(404)
            .json({
                success: false,
                error: {message: "user not found"},

                });
        }
    user.wallet = {
        ...(user.wallet?.toObject?.()??{}),
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
            success: false,
            error: {message: "server error"},
    });
    }
    
});

module.exports = router;