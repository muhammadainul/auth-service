const express = require('express');
const router = express.Router();
const debug = require('debug');
const log = debug('auth-service:');

const UserService = require('../../services/user');

const { isVerified } = require('../../middlewares/isVerified');

router.post('/login', async (req, res) => {
   const userData = req.body;
   
   const result = await UserService.SignIn(userData);
   log('result', result);

    if (result.error) {
        return res.status(400).json({ 
            status: 400, 
            error: result.error 
        });
    } else {
        return res.status(200).json({
            status: 200, 
            data: result
        });
    }
});

router.post('/logout', isVerified, async (req, res) => {
    const bearerToken = req.headers;
    const user = req.user;

    if (!bearerToken.authorization) return res.sendStatus(401);

    if (!bearerToken.simandesk_token) return res.sendStatus(401);

    const result = await UserService.SignOut(bearerToken, user);
    log('result', result);

    if (result.error) {
        return res.status(400).json({ 
            status: 400, 
            error: result.error 
        });
    } else {
        return res.status(200).json({
            status: 200, 
            data: result
        });
    }
});

router.post('/token/refresh', isVerified, async (req, res, next) => {
    const bearerToken = req.headers;
    const userData = req.body;

    if (!bearerToken.authorization) return res.sendStatus(401);

    const result = await UserService.RefreshToken(bearerToken, userData);
    console.log('result', result);

    if (result.error) {
        return res.status(400).json({ 
            status: 400, 
            error: result.error 
        });
    } else {
        return res.status(200).json({
            status: 200, 
            data: result
        });
    }
});

module.exports = router;