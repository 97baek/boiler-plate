import React, { useEffect } from "react";
import axios from "axios";

function LandingPage() {
  // 랜딩페이지에 들어오자 마자 useEffect 실행
  useEffect(() => {
    axios.get("/api/hello").then((res) => console.log(res));
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      <h2>시작 페이지</h2>
    </div>
  );
}

export default LandingPage;
