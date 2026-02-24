"use client";

/* 更新说明（2026-02-20）： 通用 drawer 容器通过 ref.onConfirm 统一确认/取消交互。 */

import {
  useCallback,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { Button, Drawer, Space, message } from "antd";

type ConfirmResult = {
  code: number;
  data?: unknown;
};

type ContentRefType = {
  onConfirm?: () => Promise<ConfirmResult>;
};

export type DrawerOptions = {
  title?: string;
  width?: number | string;
  okText?: string;
  cancelText?: string;
  customizedBtns?: ReactNode | null;
  okCallback?: (value?: unknown) => void;
  cancelCallback?: () => void;
};

export type DrawerAPI = {
  open: (node: ReactNode, options?: DrawerOptions) => void;
  close: () => void;
};

export default function DrawerContainer({
  setAPI,
}: {
  setAPI: (api: DrawerAPI | null) => void;
}) {
  const contentRef = useRef<ContentRefType>(null);
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<DrawerOptions>({});
  const [confirmLoading, setConfirmLoading] = useState(false);

  const open = useCallback(
    (node: ReactNode, nextOptions: DrawerOptions = {}) => {
      setContent(node);
      setOptions(nextOptions);
      setVisible(true);
    },
    [],
  );

  const close = useCallback(() => {
    setVisible(false);
    options.cancelCallback?.();
  }, [options]);

  const handleOk = async () => {
    if (!contentRef.current?.onConfirm) {
      setVisible(false);
      options.okCallback?.();
      return;
    }

    try {
      setConfirmLoading(true);
      const result = await contentRef.current.onConfirm();
      if (result?.code === 200) {
        setVisible(false);
        options.okCallback?.(result.data);
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : String(error));
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    setAPI({ open, close });
    return () => {
      setAPI(null);
    };
  }, [setAPI, open, close]);

  const defaultButtons = (
    <Space>
      <Button onClick={close}>{options.cancelText || "Cancel"}</Button>
      <Button type="primary" loading={confirmLoading} onClick={handleOk}>
        {options.okText || "Confirm"}
      </Button>
    </Space>
  );

  return (
    <Drawer
      open={visible}
      title={options.title || ""}
      size={options.width || 650}
      closable={false}
      onClose={close}
      destroyOnHidden
      extra={options.customizedBtns ?? defaultButtons}
    >
      {isValidElement(content)
        ? cloneElement(content as ReactElement<{ ref: Ref<ContentRefType> }>, {
            ref: contentRef,
          })
        : content}
    </Drawer>
  );
}
