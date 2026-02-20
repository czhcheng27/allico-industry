"use client";

import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="admin-center-screen">
      <Result
        status="403"
        title="403"
        subTitle="You do not have permission to access this page."
        extra={
          <Button type="primary" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        }
      />
    </div>
  );
}
