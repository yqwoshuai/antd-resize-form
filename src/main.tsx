import React from "react";
import ReactDOM from "react-dom";
import ResizeForm from "./ResizeForm";

import { Input } from "antd";

import "antd/dist/antd.css";

import type { ConfigItemType } from "./ResizeForm";

const config: ConfigItemType[] = [
  {
    type: Input,
    label: "表单1",
    name: "key1",
    rules: [
      {
        required: true,
        message: "必填",
      },
    ],
    customProps: {
      allowClear: true,
      placeholder: "请输入key1",
    },
  },
  {
    type: Input,
    label: "表单2",
    name: "key2",
    customProps: {
      allowClear: true,
      placeholder: "请输入key2",
    },
  },
  {
    type: Input,
    label: "表单3",
    name: "key3",
    customProps: {
      allowClear: true,
      placeholder: "请输入key3",
    },
  }
];

const submitForm = (values: any) => {
  console.log(values);
};

ReactDOM.render(
  <ResizeForm config={config} labelWidth={'auto'} onSubmit={submitForm} />,
  document.getElementById("root")
);
