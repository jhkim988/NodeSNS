const path = require('path');
const express = require('express');
const multer = require('multer'); // form 태그의 enctype = "multipart/form-data", express.json(), express.urlencoded()가 해석을 못한다. multer가 해석해준다.
const {
    Post,
    Hashtag,
    User
} = require('../models');
const {
    isLoggedIn
} = require('./middlewares');
const router = express.Router();
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext); // 파일명 중복을 막기 위해 날짜를 넣는다.
        }, // cb(에러, 결괏값)
    }), // 서버 디스크에 이미지 저장(외부에 저장하는 방법도 있다.)
    limit: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});



// img 업로드 router
router.post('/img', isLoggedIn, upload.single('img'), (req, res, next) => {
    // single: 이미지 하나(필드명), array:이미지 여러 개(단일 필드), fields: 이미지 여러 개(여러 필드), none: 이미지 X
    // type="file"의 id나 name을 single 함수의 변수로 넣어준다.
    // console.log(req.file); // form을 업로드 하면 req.body에 저장되는 것처럼, image multer로 업로드 한 것은 req.file에 저장돼 있다.
    res.json({
        url: `/img/${req.file.filename}`
    });
});

const upload2 = multer();
// 게시글 업로드 router
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => { // 사진을 안 올릴 때는 none
    try {
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            userId: req.user.id
        });
        const hashtags = req.body.content.match(/#[^(\.|\s)]*/g); // 정규표현식으로 추출, array로 나온다. [#노드, #익스프레스, #아톰]
        if (hashtags) {
            const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
                where: {
                    title: tag.slice(1).toLowerCase()
                }
            }))); // findOrCreate의 return 값 = Promise<Model, boolean> post와 result의 0번째 index에 관계를 생성해준다.
            await post.addHashtags(result.map(r => r[0])); // post와 Hashtags의 관계를 만들어준다.
            // A.getB: 관계있는 row 조회
            // A.addB: 관계 생성
            // A.setB: 관계 수정
            // A.removeB: 관계 제거
        };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        next(err);
    };
});
// 게시글 삭제
router.delete('/:id', async (req, res, next) => {
    try {
        await Post.destroy({
            where: {
                id: req.params.id,
                userId: req.user.id // 내가 쓴 게시글인지 확인
            }
        });
        res.send('OK');
    } catch (e) {
        console.error(e);
        next(e)
    }
});

// hash태그 검색
router.get('/hashtag', async (req, res, next) => {
    const query = req.query.hashtag;
    if (!query) {
        return res.redirect('/'); // 아무것도 입력하지 않으면 main 페이지
    }
    try {
        const hashtag = await Hashtag.findOne({
            where: {
                title: query
            }
        }); // 우선 하나를 찾는다.
        let posts = [];
        if (hashtag) {
            posts = await hashtag.getPosts({
                include: [{
                    model: User
                }]
            }); // 다대다 관계, 찾은 해시태그와 관계있는 글들을 가져온다.
        }
        return res.render('main', {
            title: `${query} | NodeBird`,
            user: req.user,
            twits: posts
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/:id/like', async (req, res, next) => {
    try {
        const post = await Post.findOne({
            where: {
                id: req.params.id
            }
        });
        await post.addLiker(req.user.id, 10);
        res.send('OK');
    } catch (e) {
        console.error(e);
        next(e);
    };
});

router.delete('/:id/unlike', async (req, res, next) => {
    try {
        const post = await Post.findOne({
            where: {
                id: req.params.id
            }
        });
        await post.removeLiker(req.user.id, 10);
        res.send('OK');
    } catch (e) {
        console.error(e);
        next(e);
    };
});

module.exports = router;