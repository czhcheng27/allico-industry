"use client";

import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography } from "antd";
import { getProductListApi, getRoleListApi, getUserListApi } from "@/lib/api";

const { Title, Paragraph } = Typography;

type DashboardStats = {
  productTotal: number;
  userTotal: number;
  roleTotal: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    productTotal: 0,
    userTotal: 0,
    roleTotal: 0,
  });

  useEffect(() => {
    Promise.all([
      getProductListApi({ page: 1, pageSize: 1 }),
      getUserListApi({ page: 1, pageSize: 1 }),
      getRoleListApi({ page: 1, pageSize: 1 }),
    ])
      .then(([productRes, userRes, roleRes]) => {
        setStats({
          productTotal: productRes.data.total || 0,
          userTotal: userRes.data.total || 0,
          roleTotal: roleRes.data.total || 0,
        });
      })
      .catch((error) => {
        console.error("Dashboard stats error:", error);
      });
  }, []);

  return (
    <div>
      <div className="admin-page-title">
        <Title level={3}>Dashboard</Title>
        <Paragraph type="secondary">
          Real-time overview of current admin data.
        </Paragraph>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Products" value={stats.productTotal} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Users" value={stats.userTotal} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Roles" value={stats.roleTotal} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
