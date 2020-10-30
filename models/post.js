module.exports = (sequelize, DataTypes) => sequelize.define('post', {
    content: {
        type: DataTypes.STRING(140),
        allowNull: false
    },
    img: {
        // 이미지는 서버에 저장해두고, 이미지의 주소를 불러온다.
        type: DataTypes.STRING(200),
        allowNull: true
    }
}, {
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci'
});