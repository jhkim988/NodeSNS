const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.json(),
    transports: [
        // 로그들을 파일로 생성한다.
        new transports.File({ filename: 'combined.log' }),
        new transports.File({ filename: 'error.log', level: 'error' })
    ]
});
if (process.env.NODE_ENV !== 'production') {
    // 배포환경이 아니라면 console에도 기록한다.
    logger.add(new transports.Console({ format: format.simple() }));
}
module.exports = logger;