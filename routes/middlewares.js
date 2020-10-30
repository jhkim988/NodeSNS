exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { // req.login, req.logout, req.isAuthenticated: passport가 추가해준다.
        // req.isAuthenticate(): 로그인 여부를 알려준다.
        next();
    } else {
        res.status(403).send('로그인 필요');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
};