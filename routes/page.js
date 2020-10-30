const express = require('express');
const router = express.Router();
const {
    isLoggedIn,
    isNotLoggedIn
} = require('./middlewares');
const {
    Post,
    User
} = require('../models');

// 프로필 페이지
router.get('/profile', isLoggedIn, (req, res) => {
    console.log(req.user);
    res.render('profile', {
        title: '내 정보 - NodeBird',
        user: req.user
    });
})

// 회원가입 페이지
router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', {
        title: '회원가입 - NodeBird',
        user: req.user,
        joinError: req.flash('joinError') // 일회성 메세지
    });
});

// 메인 페이지
router.get('/', (req, res, next) => {
    Post.findAll({
        include: [{ // 작성자
            model: User, // User를 불러오고
            attributes: ['id', 'nick'] // User의 id와 nick을 가져온다.
        }, { // 좋아요를 누른 사람을 가져온다.
            model: User,
            attributes: ['id', 'nick'],
            as: 'Liker'
        }],
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(posts => {
        // console.log(posts); // Liker가 들어가 있다.
        res.render('main', {
            title: 'NodeBird',
            twits: posts,
            user: req.user,
            loginError: req.flash('loginError')
        });
    }).catch(error => {
        console.error(error);
        next(error);
    });
});

module.exports = router;