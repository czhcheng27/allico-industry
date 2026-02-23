"use client";

/* 更新说明（2026-02-20）： 通用 modal 容器同时支持表单 ref 确认流与简单异步 onOk 流。 */

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type Ref,
  type ReactNode,
} from "react";
import { message, Modal } from "antd";

type ConfirmResult = {
  code: number;
  data?: unknown;
};

type ContentRefType = {
  onConfirm?: () => Promise<ConfirmResult>;
};

export type ModalOptions = {
  title?: string;
  width?: number | string;
  okText?: string;
  cancelText?: string;
  footer?: ReactNode | null;
  showCancel?: boolean;
  onOk?: () => Promise<void>;
  okCallback?: (value?: unknown) => void;
  cancelCallback?: () => void;
};

export type ModalAPI = {
  open: (node: ReactNode, options?: ModalOptions) => void;
  close: () => void;
};

export default function ModalContainer({
  setAPI,
}: {
  setAPI: (api: ModalAPI | null) => void;
}) {
  const contentRef = useRef<ContentRefType>(null);
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<ModalOptions>({});
  const [confirmLoading, setConfirmLoading] = useState(false);

  const open = useCallback((node: ReactNode, nextOptions: ModalOptions = {}) => {
    setContent(node);
    setOptions(nextOptions);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    options.cancelCallback?.();
  }, [options]);

  const handleOk = async () => {
    if (options.onOk) {
      try {
        setConfirmLoading(true);
        await options.onOk();
        setVisible(false);
        options.okCallback?.();
      } catch (error) {
        message.error(error instanceof Error ? error.message : String(error));
      } finally {
        setConfirmLoading(false);
      }
      return;
    }

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

  return (
    <Modal
      open={visible}
      width={options.width || 600}
      title={options.title || ""}
      okText={options.okText || "Confirm"}
      cancelText={options.cancelText || "Cancel"}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      onCancel={close}
      destroyOnHidden
      closable={options.showCancel !== false}
      footer={options.footer === null ? null : undefined}
      cancelButtonProps={
        options.showCancel === false ? { style: { display: "none" } } : undefined
      }
    >
      <div className="border-t border-gray-100 pt-4">
        {isValidElement(content)
          ? cloneElement(
            content as ReactElement<{ ref: Ref<ContentRefType> }>,
            {
              ref: contentRef,
            },
          )
          : content}
      </div>
    </Modal>
  );
}
