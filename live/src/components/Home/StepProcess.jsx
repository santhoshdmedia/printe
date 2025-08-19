import React from "react";
import { stepProcess } from "../../../data";
import { Card } from "antd";

const StepProcess = () => {
  return (
    <div className="lg:bg-[#e9ffff00] rounded-lg ">
      <ul className="center_div justify-between lg:flex-row flex-col p-1 gap-x-2 gap-y-4">
        {stepProcess.map((data, index) => {
          return (
            <Card hoverable key={index} className={`shadow-md ${index % 2 === 0 ? "bg-primary" : "bg-secondary"} !w-full lg:!border-transparent !text-white`}>
              <Card.Meta title={<h1 className="!text-white">{data.title}</h1>} description={<h1 className="!text-white">{data.content}</h1>} avatar={<data.icon size={35} />} />
            </Card>
          );
        })}
      </ul>
    </div>
  );
};

export default StepProcess;
