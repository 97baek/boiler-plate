const { User } = require("../models/User");

// 인증 처리
let auth = (req, res, next) => {
  // 클라이언트 쿠키에서 토큰을 가져옴
  let token = req.cookies.x_auth;

  // 토큰을 복호화한 후 유저를 찾음
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true });

    req.token = token;
    req.user = user;
    next(); // 미들웨어인 auth에서 다음 콜백함수로 넘어갈 수 있게 함
  });

  // 유저가 있으면 인증 성공

  // 유저가 없으면 인증 실패
};

module.exports = { auth };
