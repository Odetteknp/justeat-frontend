import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Card,
    Row,
    Col,
    Spin,
    Button,
    Typography,
    message,
    Descriptions,
    Divider,
    Space,
    Result,
} from "antd";
import { ReloadOutlined, HomeOutlined, FileTextOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/* ---------------- Types ---------------- */
type PaymentMethod = "PromptPay" | "CreditCard" | "MobileBanking" | "Cash";
type PaymentStatus = "SUCCESS" | "PENDING" | "FAILED";

interface PaymentSuccessData {
    orderCode: string;
    paidAmount: number;
    currency: string;
    method: PaymentMethod;
    paidAt: string;        // ISO string
    txnId?: string;        // รหัสอ้างอิงธุรกรรมจากเกตเวย์
    customerName?: string;
}

/* ---------------- Backend placeholders (เตรียมต่อ API ภายหลัง) ---------------- */
// ดึงผลการชำระเงินที่สำเร็จจาก backend (เช่น /api/payments/{sessionId})
async function fetchPaymentResult(sessionId?: string): Promise<PaymentSuccessData> {
    // TODO: call real API, e.g.:
    // const res = await fetch(`/api/payments/${sessionId}`);
    // return await res.json();
    // ---- DEMO DATA ----
    await new Promise((r) => setTimeout(r, 400)); // หน่วงสั้น ๆ ให้เห็น Spin
    return {
        orderCode: "ORD-2025-000123",
        paidAmount: 329.0,
        currency: "THB",
        method: "PromptPay",
        paidAt: new Date().toISOString(),
        txnId: "TXN-5F8A2C7E",
        customerName: "คุณลูกค้า",
    };
}

// ยืนยันคำสั่งซื้อหลังชำระเงินสำเร็จ (เช่น lock สถานะ order, ออกใบเสร็จ)
async function confirmOrderAfterPayment(orderCode: string): Promise<void> {
    // TODO: call real API, e.g. POST /api/orders/{orderCode}/confirm
    await new Promise((r) => setTimeout(r, 150));
}

// ล้างตะกร้า/สถานะการชำระเงินฝั่ง client
function clearLocalCartAndPaymentState() {
    try {
        localStorage.removeItem("cart");
        localStorage.removeItem("checkout_session");
    } catch { }
}

/* ---------------- Component ---------------- */
const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PaymentSuccessData | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    // ดึง sessionId หรือข้อมูลจาก router state/query (ถ้ามี)
    const sessionId = useMemo(() => {
        // จาก state
        const fromState = (location.state as any)?.sessionId as string | undefined;
        if (fromState) return fromState;

        // จาก query ?session_id=xxx
        const params = new URLSearchParams(location.search);
        const q = params.get("session_id") || undefined;
        return q;
    }, [location.state, location.search]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const result = await fetchPaymentResult(sessionId);

                if (cancelled) return;

                setData(result);

                // เรียก confirm order (เตรียมไว้ให้ backend)
                await confirmOrderAfterPayment(result.orderCode);

                // ล้างข้อมูลตะกร้าฝั่ง client
                clearLocalCartAndPaymentState();

                setLoading(false);
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    messageApi.error("ไม่สามารถดึงข้อมูลการชำระเงินได้");
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [sessionId, messageApi]);

    const GoMainPage = () => {  // ไปหน้าหลัก
        setTimeout(() => {
            navigate("/");      
        }, 200);
    };

    const handleViewOrder = () => {
        if (!data?.orderCode) return;
        navigate(`/orders/${encodeURIComponent(data.orderCode)}`, { replace: false });
    };

    const handleReload = () => {
        setLoading(true);
        // force refetch
        navigate(0); // reload route (ง่ายและตรง)
    };

    return (
        <div
            style={{
                backgroundColor: "white",
                minHeight: "100%",
                width: "100%",
                padding: 8,
            }}
        >
            {contextHolder}

            <Row justify="center" style={{ marginTop: 0 }}>
                <Col xs={24} sm={22} md={20} lg={16} xl={12}>
                    <Card
                        style={{ borderRadius: 16 }}
                        bodyStyle={{ padding: 24 }}
                    >
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "48px 0" }}>
                                <Spin size="large" />
                                <div style={{ marginTop: 16 }}>
                                    <Text type="secondary" style={{ fontSize: 18 }}>กำลังตรวจสอบการชำระเงินของคุณ...</Text>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Result
                                    status="success"
                                    title="ชำระเงินสำเร็จ!"
                                    subTitle={
                                        "ขอบคุณสำหรับการสั่งซื้อ เราได้รับการชำระเงินเรียบร้อยแล้ว"
                                    }
                                    style={{ marginTop: -40 }}
                                />

                                <Divider style={{ marginTop: -20 }} />

                                <Title level={4} style={{ margin: "16px" }}>
                                    สรุปคำสั่งซื้อ
                                </Title>

                                <Descriptions
                                    bordered
                                    size="middle"
                                    column={1}
                                    labelStyle={{ width: 180 }}
                                >
                                    <Descriptions.Item label="รหัสคำสั่งซื้อ">
                                        {data?.orderCode ?? "-"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="จำนวนเงินที่ชำระ">
                                        {data
                                            ? `${data.paidAmount.toLocaleString()} ${data.currency}`
                                            : "-"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="วิธีการชำระเงิน">
                                        {data?.method ?? "-"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="เลขอ้างอิงธุรกรรม">
                                        {data?.txnId ?? "-"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="เวลาที่ชำระเงิน">
                                        {data
                                            ? new Date(data.paidAt).toLocaleString()
                                            : "-"}
                                    </Descriptions.Item>
                                </Descriptions>
                                <div style={{ display: "flex", justifyContent: "center", 
                                        marginTop: 24 }}>
                                    <Space wrap size="middle" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                                        <Button type="primary" size="large" style={{ backgroundColor: "rgb(239, 102, 75)"}} className="Payment-ok-button" icon={<HomeOutlined />} onClick={GoMainPage}>
                                            กลับไปหน้าหลัก
                                        </Button>
                                        <Button size="large" className="white-outline-button" icon={<FileTextOutlined />} onClick={handleViewOrder}>
                                            ดูคำสั่งซื้อ
                                        </Button>   
                                        <Button size="large" className="white-outline-button" icon={<ReloadOutlined />} onClick={handleReload}>
                                            โหลดใหม่
                                        </Button>
                                    </Space>
                                </div>

                                <Divider />

                                <Text type="secondary">
                                    *เก็บใบเสร็จ/เลขอ้างอิงไว้เป็นหลักฐาน หากมีปัญหาในการชำระเงินกรุณาติดต่อฝ่ายบริการลูกค้า
                                </Text>
                            </>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PaymentSuccessPage;
