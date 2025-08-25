import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Button,
  Avatar,
  Typography,
  message,
  Tag,
  Form,
  Input,
  Select,
  DatePicker,
  Table,
  Space,
  Statistic,
  Empty,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";

import {
  UserOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SearchOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/** ---------- Types ---------- */
type OrderStatus = "PENDING" | "PICKED_UP" | "DELIVERED" | "CANCELLED";

interface WorkHistory {
  id: string;             // unique row id
  orderId: string;
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number;
  fareTHB: number;
  paymentMethod: "CASH" | "WALLET" | "QR";
  assignedAt: string;     // ISO string
  deliveredAt?: string;   // ISO string
  durationMin?: number;
  status: OrderStatus;
}

interface FetchParams {
  page: number;
  pageSize: number;
  orderId?: string;
  status?: OrderStatus;
  dateFrom?: string; // ISO
  dateTo?: string;   // ISO
}

/** ---------- Helper: แปะสี Tag ตามสถานะ ---------- */
const statusTag = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return <Tag color="gold">รอรับงาน</Tag>;
    case "PICKED_UP":
      return <Tag color="blue">รับของแล้ว</Tag>;
    case "DELIVERED":
      return <Tag color="green">ส่งสำเร็จ</Tag>;
    case "CANCELLED":
      return <Tag color="red">ยกเลิก</Tag>;
    default:
      return <Tag>—</Tag>;
  }
};

/** ---------- Mock API (เตรียมต่อ Backend จริง) ---------- */
// ที่เดียวที่ต้องเปลี่ยนเมื่อมี API จริง: ฟังก์ชัน fetchHistories
async function fetchHistories(
  params: FetchParams,
  signal?: AbortSignal
): Promise<{ data: WorkHistory[]; total: number; summary: { totalTrips: number; totalFare: number } }> {
  // *** ตัวอย่าง mock: delay 600ms เพื่อจำลองโหลดจากเน็ต ***
  await new Promise((r) => setTimeout(r, 600));

  // mock records
  const base: WorkHistory[] = Array.from({ length: 57 }).map((_, i) => {
    const delivered = i % 7 !== 0;
    const assignedAt = dayjs().subtract(i, "day").hour(10).minute(5).second(0);
    const deliveredAt = delivered ? assignedAt.add(32 + (i % 20), "minute") : undefined;

    return {
      id: `hist-${i + 1}`,
      orderId: `ODR${String(10000 + i)}`,
      pickupAddress: `ร้านอาหาร #${(i % 9) + 1}, เขตเมือง`,
      dropoffAddress: `ลูกค้า #${(i % 13) + 1}, ต.ในเมือง`,
      distanceKm: +(2 + (i % 6) * 0.7).toFixed(1),
      fareTHB: 35 + (i % 5) * 10,
      paymentMethod: (["CASH", "WALLET", "QR"] as const)[i % 3],
      assignedAt: assignedAt.toISOString(),
      deliveredAt: deliveredAt?.toISOString(),
      durationMin: delivered ? deliveredAt!.diff(assignedAt, "minute") : undefined,
      status: (["PENDING", "PICKED_UP", "DELIVERED", "CANCELLED"] as OrderStatus[])[i % 4],
    };
  });

  // filter ด้วย params
  let filtered = base;

  if (params.orderId) {
    const q = params.orderId.trim().toLowerCase();
    filtered = filtered.filter((r) => r.orderId.toLowerCase().includes(q));
  }
  if (params.status) {
    filtered = filtered.filter((r) => r.status === params.status);
  }
  if (params.dateFrom) {
    const from = dayjs(params.dateFrom);
    filtered = filtered.filter((r) => dayjs(r.assignedAt).isAfter(from) || dayjs(r.assignedAt).isSame(from, "day"));
  }
  if (params.dateTo) {
    const to = dayjs(params.dateTo);
    filtered = filtered.filter((r) => dayjs(r.assignedAt).isBefore(to) || dayjs(r.assignedAt).isSame(to, "day"));
  }

  const total = filtered.length;
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const paged = filtered.slice(start, end);

  // สรุป
  const totalFare = filtered.reduce((acc, v) => acc + v.fareTHB, 0);

  // รับ signal ยกเลิก (สำหรับ backend จริง axios/fetch จะรองรับ)
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  return {
    data: paged,
    total,
    summary: { totalTrips: filtered.length, totalFare },
  };
}

/** ---------- Component ---------- */
const RiderWorkHistories: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm<{
    orderId?: string;
    status?: OrderStatus;
    range?: [Dayjs, Dayjs];
  }>();

  const [data, setData] = useState<WorkHistory[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [summary, setSummary] = useState<{ totalTrips: number; totalFare: number }>({
    totalTrips: 0,
    totalFare: 0,
  });

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // เก็บ AbortController ไว้ยกเลิก fetch หากมีการค้นหาใหม่
  const abortRef = useRef<AbortController | null>(null);

  const columns: ColumnsType<WorkHistory> = useMemo(
    () => [
      {
        title: "คำสั่งซื้อ",
        dataIndex: "orderId",
        key: "orderId",
        render: (v) => <Text strong>{v}</Text>,
      },
      {
        title: "รับจาก (Pickup)",
        dataIndex: "pickupAddress",
        key: "pickupAddress",
        ellipsis: true,
      },
      {
        title: "ส่งที่ (Dropoff)",
        dataIndex: "dropoffAddress",
        key: "dropoffAddress",
        ellipsis: true,
      },
      {
        title: "ระยะทาง (กม.)",
        dataIndex: "distanceKm",
        key: "distanceKm",
        align: "right",
      },
      {
        title: "ค่าโดยสาร (฿)",
        dataIndex: "fareTHB",
        key: "fareTHB",
        align: "right",
        render: (v) => v.toLocaleString("th-TH"),
      },
      {
        title: "ชำระเงิน",
        dataIndex: "paymentMethod",
        key: "paymentMethod",
        render: (v: WorkHistory["paymentMethod"]) => {
          const label = v === "CASH" ? "เงินสด" : v === "WALLET" ? "วอลเล็ท" : "QR";
          return <Tag>{label}</Tag>;
        },
      },
      {
        title: "รับงาน",
        dataIndex: "assignedAt",
        key: "assignedAt",
        render: (v) => dayjs(v).format("YYYY-MM-DD HH:mm"),
      },
      {
        title: "ส่งสำเร็จ",
        dataIndex: "deliveredAt",
        key: "deliveredAt",
        render: (v?: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : <Text type="secondary">—</Text>),
      },
      {
        title: "ระยะเวลา (นาที)",
        dataIndex: "durationMin",
        key: "durationMin",
        align: "right",
        render: (v?: number) => (v ? v : <Text type="secondary">—</Text>),
      },
      {
        title: "สถานะ",
        dataIndex: "status",
        key: "status",
        render: (s: OrderStatus) => statusTag(s),
        filters: [
          { text: "รอรับงาน", value: "PENDING" },
          { text: "รับของแล้ว", value: "PICKED_UP" },
          { text: "ส่งสำเร็จ", value: "DELIVERED" },
          { text: "ยกเลิก", value: "CANCELLED" },
        ],
        onFilter: (value, record) => record.status === value,
      },
    ],
    []
  );

  /** ---------- Handler: ดึงข้อมูล ---------- */
  const loadData = async (opts?: { resetPage?: boolean }) => {
    try {
      if (opts?.resetPage) setPage(1);

      // ยกเลิก request เก่า (ถ้ามี)
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      const { orderId, status, range } = form.getFieldsValue();
      const params: FetchParams = {
        page: opts?.resetPage ? 1 : page,
        pageSize,
        orderId: orderId || undefined,
        status: status || undefined,
        dateFrom: range?.[0] ? range[0].startOf("day").toISOString() : undefined,
        dateTo: range?.[1] ? range[1].endOf("day").toISOString() : undefined,
      };

      // TODO: เปลี่ยนมาเรียก API จริง เช่น:
      // const res = await axios.get('/api/rider/histories', { params, signal: controller.signal })
      // const { items, total, summary } = res.data;
      const res = await fetchHistories(params, controller.signal);

      setData(res.data);
      setTotal(res.total);
      setSummary(res.summary);
    } catch (err: any) {
      if (err?.name === "AbortError") return; // ถูกยกเลิกเอง ไม่ต้องแจ้ง
      console.error(err);
      messageApi.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  /** ---------- Effect: โหลดครั้งแรก ---------- */
  useEffect(() => {
    // default range เป็น 7 วันย้อนหลัง
    form.setFieldsValue({
      range: [dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day")],
    });
    loadData({ resetPage: true });
    // cleanup abort เมื่อ unmount
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ---------- เมื่อ page/pageSize เปลี่ยน ให้โหลดใหม่ ---------- */
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  /** ---------- Export CSV (ง่าย ๆ) ---------- */
  const handleExportCSV = () => {
    const header = [
      "orderId,pickupAddress,dropoffAddress,distanceKm,fareTHB,paymentMethod,assignedAt,deliveredAt,durationMin,status",
    ];
    const body = data.map((r) =>
      [
        r.orderId,
        `"${r.pickupAddress.replace(/"/g, '""')}"`,
        `"${r.dropoffAddress.replace(/"/g, '""')}"`,
        r.distanceKm,
        r.fareTHB,
        r.paymentMethod,
        r.assignedAt,
        r.deliveredAt ?? "",
        r.durationMin ?? "",
        r.status,
      ].join(",")
    );
    const csv = [...header, ...body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rider_histories_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    pageSizeOptions: [5, 10, 20, 50],
    showTotal: (t) => `ทั้งหมด ${t} รายการ`,
    onChange: (p, ps) => {
      setPage(p);
      setPageSize(ps);
    },
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        minHeight: "100vh",
        width: "100%",
        paddingBottom: 24,
      }}
    >
      {contextHolder}

      {/* Header Card */}
      <Card
        style={{
          background: "rgb(239, 102, 75)",
          color: "white",
          marginBottom: 24,
          borderRadius: 16,
        }}
      >
        <Row align="middle" gutter={[16, 16]}>
          <Col>
            <Avatar
              size={64}
              icon={<HistoryOutlined /> }
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            />
          </Col>

          <Col flex="1">
            <Title level={2} style={{ color: "white", margin: 0 }}>
              ประวัติการจัดส่ง
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
              ดูงานย้อนหลัง ค้นหา และส่งออกข้อมูลได้ที่นี่
            </Text>
          </Col>

          <Col>
            <Space wrap>
              <Button
                icon={<DownloadOutlined />}
                size="large"
                onClick={handleExportCSV}
              >
                ส่งออก CSV (เฉพาะหน้าปัจจุบัน)
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Summary */}
      <Row gutter={[16, 16]} style={{ padding: "0 12px", marginBottom: 8 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered>
            <Statistic title="จำนวนงาน (ตามเงื่อนไขค้นหา)" value={summary.totalTrips} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered>
            <Statistic
              title="รายได้รวมโดยประมาณ (บาท/฿)"
              value={summary.totalFare}
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      {/* Search Form */}
      <Card style={{ margin: "0 12px 12px", borderRadius: 12 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={() => loadData({ resetPage: true })}
        >
          <Row gutter={[16, 8]}>
            <Col xs={24} md={8}>
              <Form.Item label="รหัสคำสั่งซื้อ" name="orderId">
                <Input placeholder="เช่น ODR10023" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="สถานะ" name="status">
                <Select
                  allowClear
                  options={[
                    { label: "รอรับงาน", value: "PENDING" },
                    { label: "รับของแล้ว", value: "PICKED_UP" },
                    { label: "ส่งสำเร็จ", value: "DELIVERED" },
                    { label: "ยกเลิก", value: "CANCELLED" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="ช่วงวันที่ (รับงาน)" name="range">
                <RangePicker
                  allowEmpty={[false, false]}
                  style={{ width: "100%" }}
                  showTime={false}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end" gutter={8}>
            <Col>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  form.resetFields();
                  form.setFieldsValue({
                    range: [dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day")],
                  });
                  loadData({ resetPage: true });
                }}
              >
                ล้างเงื่อนไข
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
              >
                ค้นหา
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Table */}
      <Card style={{ margin: "0 12px", borderRadius: 12 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table<WorkHistory>
            rowKey="id"
            dataSource={data}
            columns={columns}
            pagination={pagination}
            locale={{
              emptyText: <Empty description="ไม่พบข้อมูลตามเงื่อนไขที่เลือก" />,
            }}
            scroll={{ x: 980 }}
          />
        )}
      </Card>
    </div>
  );
};

export default RiderWorkHistories;