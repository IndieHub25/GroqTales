const router = require("express").Router();
const requireAuth = require("../../middleware/requireAuth");

router.get("/", requireAuth, async (req, res) => {
  res.json(req.user.wallet || null);
});

router.put("/", requireAuth, async(req,res)=>{
    const {address, network, provider} = req.body;
    req.user.wallet = {
        address,
        network,
        provider,
        verified: true,
        lastConnectedAt: new Date(),
    };
    await req.user.save();
    res.json(req.user.wallet);
});

module.exports = router;