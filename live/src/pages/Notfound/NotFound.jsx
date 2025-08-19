import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const Handleclick = () => {
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Result
        status="404"
        title="404 Not Found"
        subTitle="Your link has expired."
        extra={
          <Button type="primary" className="bg-primary" onClick={Handleclick}>
            Go Home
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
