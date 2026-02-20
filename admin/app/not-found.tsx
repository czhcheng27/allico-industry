"use client";

import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="admin-center-screen">
      <Result
        status="404"
        title="404"
        subTitle="Page not found."
        extra={
          <Button type="primary" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        }
      />
    </div>
  );
}
