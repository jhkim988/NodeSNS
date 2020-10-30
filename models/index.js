const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);

// 일대다 관계
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);

// 다대다 관계
db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });
// 다대다 관계에서는 새로운 모델(테이블)이 생성된다. through에는 새로 생기는 모델 이름을 넣어준다.
{// Example
  // post
  // 1 안녕하세요. #노드 #익스프레스
  // 2 안녕하십니까. #노드 #제이드
  // 3 안녕~ #제이드 #퍼그

  // hastag
  // 1 노드
  // 2 익스프레스
  // 3 제이드
  // 4 퍼그

  // post -> (hastag, hashtag, ...)
  // 1 -> (1, 2)
  // 2 -> (1, 3)
  // 3 -> (3, 4)

  // 짝을 지어줄 테이블이 필요하다.
}

// 팔로워 팔로잉 관계
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followers', foreignKey: 'followingId' }); // 둘 중 어느 게 팔로워/팔로잉인지 모르기 때문에 as를 써준다.
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followings', foreignKey: 'followerId' });
{// Example
  // 1 제로
  // 2 네로
  // 3 히어로
  // 4 바보

  // 1 제로
  // 2 네로
  // 3 히어로
  // 4 바보

  // Follower -> Following
  // 1 -> (2, 3, 4)
  // 2 -> 3
  // 3 -> 1
}

// 사용자 - 게시글 좋아요
db.User.belongsToMany(db.Post, { through: "Like" });
db.Post.belongsToMany(db.User, { through: "Like", as: "Liker" });

module.exports = db;
