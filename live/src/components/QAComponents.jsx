import React, { useState } from "react";
import { Collapse } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";

const QAComponents = ({ data }) => {
  const { children } = data; // Destructure 'children' from 'data'

  const [activeKey, setActiveKey] = useState(null); // Track the currently open panel

  // Split the FAQ items into two columns
  const leftColumn = children.slice(0, Math.ceil(children.length / 2));
  const rightColumn = children.slice(Math.ceil(children.length / 2));

  // Handle panel change
  const handlePanelChange = (key) => {
    setActiveKey(key); // Update the active panel key
  };

  return (
    <div>
      {/* Title */}
      <div className="mb-10 text-center">
        <h1 className="title text-primary text-2xl font-bold">{data.name}</h1>
      </div>

      {/* FAQ Section with Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
        {/* Left Column */}
        <div>
          <Collapse
            activeKey={activeKey}
            onChange={handlePanelChange}
            accordion
            expandIcon={({ isActive }) =>
              isActive ? (
                <MinusOutlined className="text-primary" />
              ) : (
                <PlusOutlined className="text-primary" />
              )
            }
            className="bg-white rounded-lg shadow"
          >
            {leftColumn.map((faq) => (
              <Collapse.Panel
                header={<span className="font-medium">{faq.label}</span>}
                key={faq.key}
              >
                <p className="text-gray-700">{faq.children}</p>
              </Collapse.Panel>
            ))}
          </Collapse>
        </div>

        {/* Right Column */}
        <div>
          <Collapse
            activeKey={activeKey}
            onChange={handlePanelChange}
            accordion
            expandIcon={({ isActive }) =>
              isActive ? (
                <MinusOutlined className="text-primary" />
              ) : (
                <PlusOutlined className="text-primary" />
              )
            }
            className="bg-white rounded-lg shadow"
          >
            {rightColumn.map((faq) => (
              <Collapse.Panel
                header={<span className="font-medium">{faq.label}</span>}
                key={faq.key}
              >
                <p className="text-gray-700">{faq.children}</p>
              </Collapse.Panel>
            ))}
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default QAComponents;
