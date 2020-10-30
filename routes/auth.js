const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();
const { User } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

// POST /auth/join
router.post('/join', isNotLoggedIn, async (req, res, next) => { // 미들웨어를 연달아 쓸 수 있다.
    // 이미 로그인 한 사람은 회원가입하지 않는다.
    const { email, nick, password } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } });
        if (exUser) {
            req.flash('joinError','이미 가입된 이메일입니다.');
            return res.redirect('/join'); // 다시 회원가입 페이지로 돌려보낸다.
        }
        console.time('암호화 시간');
        const hash = await bcrypt.hash(password, 12); // bcrypt로 암호화한다. 두 번째 매개변수 숫자가 커질수록 암호화가 복잡해진다. 대신 속도가 느려진다.
        console.timeEnd('암호화 시간'); // 시간이 1초 정도 나오도록

        await User.create({
            email,
            nick,
            password: hash
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// PORT /auth/login
router.post('/login', isNotLoggedIn, (req, res, next) => { // req.body.email, req.body.password
    passport.authenticate('local', (authError, user, info) => { // localStrategy를 수행한다.
        // passport의 done(에러, 성공, 실패)가 authError, user, info로 전달된다.
        if (authError) {
            console.error(authError)
            return next(authError);
        }
        if (!user) { // 실패
            req.flash('loginError', info.message);
            return res.redirect('/');
        }
        return req.login(user, loginError => { // done에서 성공은 하지만, req.login에서 실패하는 경우도 있다.
            // 매개변수 user -> req.user 세션에 저장한다. req.login 시에 passport의 serializeUser가 호출된다.
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            };
            return res.redirect('/');
        }); // passport가 req에 login메서드를 추가해준다.
        // session에 로그인이 저장된다. req.user에서 사용자 정보를 찾을 수 있다.
    })(req, res, next);
});

// /auth/logout
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    // req.session.destroy(); // 세션을 지운다. 다른 세션도 지워버리기 때문에 안 해도 된다.
    res.redirect('/');
});

//(1)
router.get('/kakao', passport.authenticate('kakao')); // KakaoStrategy가 실행된다. kakao 서버에서 인증을 대신 해주고 kakao/callback으로 응답이 온다.
// (3)
router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/', // 실패했을 때 redirect
}), (req, res) => {
    res.redirect('/'); // 성공했을 때 callback
});
module.exports = router;