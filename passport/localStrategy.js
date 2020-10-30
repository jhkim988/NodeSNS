const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = passport => {
    passport.use(new LocalStrategy({
        // urlencoded 미들웨어가 form에서 post 요청이 온 것을 해석해서 req.body에 넣어준다.
        usernameField: 'email', // req.body.email
        passwordField: 'password' // req.body.password
    }, async (email, password, done) => { // done(에러, 성공, 실패)
        // done(서버에러), done(null, 사용자정보), done(null, false, 실패 정보)
        try {
            const exUser = await User.findOne({ where: { email } });
            if (exUser) { // email이 있는지 검사
                // 비밀번호 검사
                const result = await bcrypt.compare(password, exUser.password); // 비밀번호 비교
                // bcrypt: 비밀번호 암호화 알고리즘
                if (result) {
                    done(null, exUser);
                } else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }
            } else {
                done(null, false, { message: '가입되지 않은 회원입니다.' });
            }
        } catch (error) {
            console.error(error);
            done(error);
        };
    }));
};