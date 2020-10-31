#!/usr/bin/env node

// SNS 서비스는 데이터 간의 관계가 많다. - 팔로워 = 사람과 사람 간의 관계, 해시태그 = 글과 태그 간의 관계, 좋아요 = 사람과 글 간의 관계 등등...
// 따라서 관계형 데이터베이스인 mysql을 사용한다.

// nodemon: 서버 코드를 수정하면 매번 서버를 재실행해야 하는데, nodemon은 서버 코드가 바뀌는 것을 감지하여 자동으로 재시작해준다.
// nodemon은 개발할 때만 필요하기 때문에 개발용 dependencies(devDependencies)에 작성해준다.
// 개발용 dependencies 설치 명령: -D

const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');

require("dotenv").config(); // .env 파일에 작성한 키/값이 process.env에 들어간다.

const indexRouter = require('./routes/page.js');
const authRouter = require('./routes/auth.js');
const postRouter = require('./routes/post.js');
const userRouter = require('./routes/user.js');
const { sequelize } = require('./models');
const passportConfig = require('./passport');
const logger = require('./logger');
const helmet = require('helmet');
const hpp = require('hpp'); // hpp 공격 방어
const RedisStore = require('connect-redis')(session);

const app = express();
sequelize.sync();
passportConfig(passport);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 8081);

if (process.env.NODE_ENV === 'production'){
    app.use(morgan('combined'));
    app.use(helmet({}));
    app.use(hpp());
} else { // development
    app.use(morgan('dev'));
};

app.use(express.static(path.join(__dirname, 'public')));
app.use('/img',  express.static(path.join(__dirname, 'uploads'))); // uploads/abc.png -> /img/abc.png
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET)); // dotenv를 이용한다.
const sessionOption = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false
    },
    store: new RedisStore({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        logErrors: true
    })
}; // rate-limit-redis

if (process.env.NODE_ENV === 'production') {
    sessionOption.proxy = true; // 중개 서버, Proxy server를 사용할 때만
    // sessionOption.cookie.secure = true; // https
};

app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize()); // passport 설정 초기화 미들웨어
app.use(passport.session()); // localStrategy로 로그인 했을 때 session에 저장. express-session보다 아래에 있어야 한다. express-session이 만든 session을 passport가 또 사용하기 때문

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

// 404 error
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    logger.info('hello'); // console.info 대체
    logger.error('hello'); // console.error 대체
    next(err);
});

// 에러 처리 middleware
app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(`${app.get('port')}번 포트에서 서버 실행중입니다.`);
});