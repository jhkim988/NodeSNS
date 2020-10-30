const express = require('express');
const {
    isLoggedIn
} = require('./middlewares');
const {
    User
} = require('../models');
const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.user.id
            }
        }); // 로그인한 나 자신을 DB에서 검색
        console.log(user);
        await user.addFollowings(parseInt(req.params.id, 10)); // :id를 팔로잉한 사람으로 추가한다.
        res.send('success');
    } catch (e) {
        console.error(e);
        next(e);
    };
});

router.post('/:id/unfollow', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.user.id
            }
        }); // 로그인한 나 자신을 DB에서 검색
        console.log(user);
        await user.removeFollowings(parseInt(req.params.id, 10));
        res.send('success');
    } catch (e) {
        console.error(e);
        next(e);
    };
});

router.post('/profile', async (req, res, next) => {
    try {
        await User.update({
            nick: req.body.nick
        }, {
            where: {
                id: req.user.id
            }
        });
        res.redirect('/profile');
    } catch(e){
        console.error(e);
        next(e);
    }

})

module.exports = router;