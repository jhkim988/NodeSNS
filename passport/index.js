const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

const cache = {};

module.exports = passport => {
    passport.serializeUser((user, done) => {
        // req.login시에 serializeUser를 호출하여, 유저 정보 중 id만을 세션에 저장한다.
        // /auth/login의 req.login(user), user를 받아온다.
        // req.user = {id: 1, name: zero, age: 25}; 이런 형식
        // 이 상태로 저장하면 무거워진다. id가 고유값이므로 id만 저장해도 된다.
        done(null, user.id); // 그래서 id만 가져온다.
        // mongoDB라면 user._id로 하면 된다.
        // {id: 1, name: zero, age: 25} -> 1
    });

    // app.js의 passport.initialize()와 passport.session()을 만나면 deserializeUser가 실행된다.
    // 메모뢰에 user.id만 저장돼 있는데, 이것을 DB에서 찾아서 완전한 유저 정보로 복구한다.
    // 요청이 올 때마다 deserializeUser가 실행된다.
    passport.deserializeUser((id, done) => {
        // 위에서 id만 저장했으므로 id를 인자로 받는다.
        const _ = () => {
            User.findOne({
                where: { id },
                include: [{
                    model: User,
                    attributes: ['id', 'nick'],
                    as: 'Followers'
                }, {
                    model: User,
                    attributes: ['id', 'nick'],
                    as: 'Followings'
                }]
            }) // DB에서 찾는다. 추가로 팔로잉/팔로워도 검색한다.
                .then(user => {
                    cache[id] = user;
                    done(null, user);
                }) // id만 저장했던 것을 모든 정보로 복구한다.
                .catch(err => done(err));
        }
        _();
        // 캐싱을 하면 팔로우가 바로 적용 안되기 때문에 보류한다.
        
        // if (cache[id]) { // 캐싱
        //     done(null, cache[id]);
        // } else {
            
        // }

        // 1 -> {id: 1, name: zero, age: 25};
        // 복구된 정보를 req.user로 보내준다.
        // 매 요청마다 passport.session(), deserializeUser가 호출, user.id를 DB조회 후 req.user로
    }); // 모든 요청에서 실행되기 때문에 DB조회를 캐싱해서 효율적으로 만들어야한다.

    local(passport);
    kakao(passport);
};