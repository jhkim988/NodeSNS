const KakaoStrategy = require('passport-kakao').Strategy;
const { User } = require('../models');

// (2)
module.exports = passport => {
    // /auth/kakao -> kakao 로그인 -> kakao 인증 서버 -> 인증 -> /auth/kakao/callback으로 프로필 반환
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_ID, // kakao app ID
        callbackURL: '/auth/kakao/callback' // router, kakao redirect 주소
    }, async (accessToken, refreshToken, profile, done) => { // Token 기반 로그인 (4)
        // 회원을 DB에 저장해야한다.
        try {
            const exUser = await User.findOne({
                where: {
                    snsId: profile.id, // kakao가 profile 객체에 snsId를 보내준다.
                    provider: 'kakao'
                }
            }); // 기존에 kakao로 가입한 유저가 있는지?
            if (exUser) {
                done(null, exUser);
            } else {
                const newUser = await User.create({
                    email: profile._json && profile._json.kakao_account.email,
                    nick: profile._json && profile._json.properties.nickname,
                    snsId: profile.id, 
                    provider: 'kakao', // 만일 naver나 구글 등 다른 서비스를 추가한다면...
                });
                done(null, newUser);
            };
        } catch (error) {
            console.error(error);
            done(error);
        };
    }));
};