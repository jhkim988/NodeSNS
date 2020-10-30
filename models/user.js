module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {
        email: {
            type: DataTypes.STRING(40),
            allowNull: false,
            unique: true
        },
        nick: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: true // 카카오로 로그인 할 때...
        },
        provider: {
            // 카카오 로그인... provider가 카카오면 카카오로 로그인, local이면 Nodebird에서 직접 로그인
            type: DataTypes.STRING(10),
            defaultValue: 'local'
        },
        snsId: {
            // 카카오로 로그인 했을 때 카카오 아이디를 저장한다.
            type: DataTypes.STRING(30),
            allowNull: true
        }
    }, {
        timestamps: true,
        paranoid: true, // 삭제 날짜를 저장해두면 복구할 수 있다.
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });
}