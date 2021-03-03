const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // 비밀번호 암호화
const saltRounds = 10; // 비밀번호 자릿수
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, // 공백 없애기
    unique: 1, // 중복 금지
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String, // object 말고 변수에 할당 가능
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

// pre는 index.js에서 user.save 전에 할 행동
userSchema.pre("save", function (next) {
  let user = this;

  // 저장 시 변경 사항이 패스워드일 경우에만
  if (user.isModified("password")) {
    // 비밀번호를 암호화 시킨다.
    // salt를 생성하고
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) return next(err); // 에러 발생 시 next(err)을 이용해 다음 메서드인 user.save로 err을 넘김

      // 암호화, 첫 번째 매개변수 myPlaintextPassword는 가입할 때 요청한 password, user.password와 같음
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err);
        user.password = hash; // hash된 비밀번호로 변경
        next(); // 다음 함수로 넘어감
      });
    });
  } else {
    // 저장 시 변경 사항이 패스워드가 아니면 다음 함수로
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err); // 틀리면 err
    cb(null, isMatch); // 맞으면 에러는 null, isMatch는 true
  });
};

userSchema.methods.generateToken = function (cb) {
  let user = this;
  // jsonwebtoken을 이용해서 id를 secretToken과 암호화시켜 token 생성하기
  let token = jwt.sign(user._id.toHexString(), "secretToken");

  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  let user = this;

  // 토큰 decode
  jwt.verify(token, "secretToken", function (err, decoded) {
    // 유저 아이디를 이용해서 유저를 찾은 다음
    // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema); // 스키마를 모델로 감싸기

module.exports = { User };
