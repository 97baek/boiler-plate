const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser"); // bodyParser는 클라이언트에서 오는 정보를 서버에서 분석해서 가져올 수 있게 해줌
const cookieParser = require("cookie-parser");
const config = require("./config/key");

const { User } = require("./models/User");

// application/x-www-form-unlencoded 데이터를 분석해서 가져올 수 있게 해줌
app.use(bodyParser.urlencoded({ extended: true }));

// application/json 타입으로 된 것을 분석해서 가져올 수 있게 해줌
app.use(bodyParser.json());
app.use(cookieParser());

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

// 회원가입을 위한 route
app.post("/register", (req, res) => {
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

app.post("/login", (req, res) => {
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
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
