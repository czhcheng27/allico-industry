"use client";

/* 更新说明（2026-02-20）： forbidden 页面放在后台壳内渲染，保证侧栏和顶部保持可见。 */

import { useRouter } from "next/navigation";
import { Button, Result } from "antd";

export default function ForbiddenInShellPage() {
  const router = useRouter();

  return (
    <Result
      status="403"
      title="403"
      subTitle="You do not have permission to access this page."
      extra={
        <Button type="primary" onClick={() => router.push("/")}>
          Back to Available Page
        </Button>
      }
    />
  );
}
