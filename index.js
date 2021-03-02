const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser"); // bodyParser는 클라이언트에서 오는 정보를 서버에서 분석해서 가져올 수 있게 해줌
const { User } = require("./models/User");
const config = require("./config/key");

// application/x-www-form-unlencoded 데이터를 분석해서 가져올 수 있게 해줌
app.use(bodyParser.urlencoded({ extended: true }));

// application/json 타입으로 된 것을 분석해서 가져올 수 있게 해줌
app.use(bodyParser.json());

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
