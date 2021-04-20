import React, { useState, useEffect, useMemo, Component } from "react";
import { Form, Row, Col, Space, Button } from "antd";
import { FormProps, FormItemProps } from "antd/es/form";
import { DownOutlined } from "@ant-design/icons";
import { useBoolean } from "ahooks";
import RcResizeObserver from "rc-resize-observer";

// 定义一些特定宽度下，一行显示的表单元件数量
const FormItemNumber = [
  [520, 1], // 520以下宽度显示1个表单元件
  [720, 2], // 520 ~ 720 宽度显示2个表单元件
  [1200, 3], // 720 ~ 1200 宽度显示3个表单元件
  [Infinity, 4], // 1200以上宽度显示4个表单元件
];

// 使用antd的表单元件类型，并使用Partial将所有属性转为可选类型，添加自定义属性
export type ConfigItemType = Partial<FormItemProps> & {
  // 表单元件对应字段
  name: string;
  // 表单元件  antd组件
  type: React.ComponentType;
  // 单个表单元件占据的栅格数
  colSize?: number;
  // 给表单元件中表单元素的属性
  customProps?: any;
  // 其余自定义属性
  [key: string]: any;
};

// ResizeForm表单的props类型
export interface FormPropsType extends FormProps {
  // 表单元件配置
  config: ConfigItemType[];
  // 表单label宽度
  labelWidth?: number | "auto";
  // 默认显示的表单数量
  defaultFormItemNum?: number;
  // 默认下是否折叠表单
  defaultCollapse?: boolean;
  // 默认下表单元件占据的栅格数
  defaultFormItemSpanSize?: number;
  // 提交表单触发方法
  onSubmit: (params: any) => void;
  // 重置表单触发方法
  onReset?: () => void;
}

// 响应式表单  对antd的Form组件二次封装，支持表单元件配置化，
function ResizeForm({
  config,
  labelWidth = 100,
  defaultCollapse = true,
  defaultFormItemNum,
  defaultFormItemSpanSize,
  onSubmit,
  onReset,
}: FormPropsType) {
  // 表单元件过多时是否隐藏部分元件
  const [collapseForm, changeCollapseForm] = useBoolean(defaultCollapse);
  // 获取表单实例
  const [form] = Form.useForm();
  // 表单整体的宽度，在resize过程中会变化
  const [width, setWidth] = useState(1024);

  // 计算每个表单元件占据的栅格数
  const formItemSpanSize = useMemo(() => {
    // 设置了默认栅格数直接返回
    if (defaultFormItemSpanSize) {
      return defaultFormItemSpanSize;
    }
    // 通过定义的特定宽度计算当前的栅格数，找到第一个大于当前宽度的特定宽度
    const numIndex = FormItemNumber.find((item) => width < item[0]);
    // 最高24栅格，除以表单元件数量，即为单个表单元件占据的栅格数
    console.log(24 / numIndex![1]);
    return 24 / numIndex![1];
  }, [width, defaultFormItemSpanSize]);

  // 计算当前应当显示的表单元件数量
  const nowFormItemNumber = useMemo(() => {
    // 设置了默认的表单数量直接返回
    if (defaultFormItemNum) {
      return defaultFormItemNum;
    }
    console.log(Math.max(1, 24 / formItemSpanSize - 1));
    // 根据表单元件占据的栅格数计算，最后 -1 是给搜索重置按钮留出一个位置，最少显示一个表单元件
    return Math.max(1, 24 / formItemSpanSize - 1);
  }, [defaultFormItemNum, formItemSpanSize]);

  // 当前是否需要展示 展开收起 按钮
  const isCollapseShow = config.length > nowFormItemNumber;

  // 点击重置按钮
  const handleReset = () => {
    // 重置表单
    form.resetFields();
    onReset?.();
  };

  // 表单提交，验证成功后触发onSubmit回调
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <RcResizeObserver
      key="resize-form"
      onResize={(offset) => {
        if (width !== offset.width) {
          setWidth(offset.width);
        }
      }}
    >
      <div>
        <Form
          form={form}
          labelCol={{
            flex: labelWidth === "auto" ? labelWidth : `0 0 ${labelWidth}px`,
          }}
          onFinish={handleSubmit}
        >
          <Row>
            {config.map(
              ({ type: Component, customProps, colSize, ...item }, index) => {
                // 计算每个表单元件应当占据的栅格数，最多占据24个栅格
                const colSpan = Math.min(formItemSpanSize * (colSize || 1), 24);
                // 判断是否展示表单元件，本身隐藏和收起 超过当前需要显示数量的表单元件都不展示
                // 隐藏的元素不能返回外层的Col容器
                if (
                  item.hidden ||
                  (collapseForm && index >= nowFormItemNumber)
                ) {
                  return (
                    <Form.Item
                      key={item.name}
                      {...item}
                      hidden={
                        item.hidden ||
                        (collapseForm && index >= nowFormItemNumber)
                      }
                    >
                      <Component {...customProps}></Component>
                    </Form.Item>
                  );
                }
                return (
                  <Col key={item.name} span={colSpan}>
                    <Form.Item {...item}>
                      <Component {...customProps}></Component>
                    </Form.Item>
                  </Col>
                );
              }
            )}
            <Col span={formItemSpanSize} style={{ textAlign: "right" }}>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    搜索
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                  {isCollapseShow && (
                    <span onClick={() => changeCollapseForm.toggle()}>
                      {collapseForm ? "展开" : "收起"}
                      <DownOutlined
                        style={{
                          marginLeft: "0.5em",
                          transition: "0.3s all",
                          transform: `rotate(${collapseForm ? 0 : 0.5}turn)`,
                        }}
                      />
                    </span>
                  )}
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </RcResizeObserver>
  );
}

export default ResizeForm;
