const express = require("express");
const app = express();
const bodyParser = require("body-parser"); // bodyParser는 클라이언트에서 오는 정보를 서버에서 분석해서 가져올 수 있게 해줌
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config/key");

const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

// application/x-www-form-unlencoded 데이터를 분석해서 가져올 수 있게 해줌
app.use(bodyParser.urlencoded({ extended: true }));

// application/json 타입으로 된 것을 분석해서 가져올 수 있게 해줌
app.use(bodyParser.json());
app.use(cookieParser());

const cors_origin = ["http://localhost:3000"]; // 로컬 개발용 기본 cors origin(front3000)

app.use(
  cors({
    origin: cors_origin, // 허락하고자 하는 요청 주소
    credentials: true, // 설정 내용을 response 헤더에 추가
  })
);

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected...")) // 성공적으로 연결 시
  .catch((err) => console.log(err)); // 연결 실패 시

app.get("/", (req, res) => res.send("Hello World!@"));

app.get("/api/hello", (req, res) => {
  res.send("아녕하세요~!");
});

// 회원가입을 위한 route
app.post("/api/users/register", (req, res) => {
  // 회원 가입할 때 필요한 정보들을 client에서 가져오면
  // 그것들을 DB에 넣어준다.
  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      // status(200)은 성공했다는 표시
      success: true, // 성공 시 success:true를 넘겨줌
    });
  }); // 몽고DB 메서드
});

app.post("/api/users/login", (req, res) => {
  // 요청된 이메일을 데이터베이스에 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다",
      });
    }

    // 요청된 이메일이 데이터베이스에 있다면 비밀번호 검증
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다" });
      // 비밀번호까지 맞다면 토큰 생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err); // 400은 에러가 있다는 뜻

        // 쿠키, 로컬스토리지 등 안전한 곳 중 한 곳에 토큰을 저장한다.
        res
          .cookie("x_auth", user.token) // 쿠키에 x_auth라는 이름으로 저장
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

// auth는 endpoint에서 리퀘스트를 받은 다음 콜백함수를 실행하기 전 중간에서 무언가를 해주는 미들웨어
app.get("/api/users/auth", auth, (req, res) => {
  // 여기까지 미들웨어를 통과한 것은 Authentification이 True라는 말
  res.status(200).json({
    _id: req.user._id, // auth에서 user를 req에 넣었기 때문에 사용 가능
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

const port = 5000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
