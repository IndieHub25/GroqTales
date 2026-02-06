const router = require("express").Router();
const requireAuth = require("../../middleware/requireAuth");

router.get("/", requireAuth, async (req, res) => {
  res.json(req.user.wallet || null);
});

router.put("/", requireAuth, async(req,res)=>{
    try {
        const {address, network, provider} = req.body;

        if (!address || !network || !provider) {
            return res
            .status(400)
            .json({error: "address, network, and provider are required"});
        }
    req.user.wallet = {
        address,
        network,
        provider,
        verified: false,
        lastConnectedAt: new Date(),
    };
    await req.user.save();
    res.json(req.user.wallet);
    } catch(err){
        console.error("Wallet update failed:", err);
        res.status(500).json({error: "Failed to update wallet"});
    }
    
});
