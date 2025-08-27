import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Card,
    Row,
    Col,
    Spin,
    Button,
    Avatar,
    Typography,
    message,
    InputNumber,
    Input,
    Descriptions,
    Space,
    Divider,
    Alert,
    Steps,
} from "antd";
import {
    ArrowLeftOutlined,
    DownloadOutlined,
    QrcodeOutlined,
    CheckCircleOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import QRCode from "qrcode";
// @ts-ignore  // ถ้าใช้ TS ให้มีไฟล์ declare module 'promptpay-qr';
import generatePayload from "promptpay-qr";

const { Title, Text, Paragraph } = Typography;

// ==== ปรับค่าได้ตามจริงจากระบบ ====
const PROMPTPAY_MOBILE = "0934719687"; // เบอร์พร้อมเพย์ผู้รับเงิน 
// ตั้งเวลาหมดอายุ QR (วินาที)
const QR_EXPIRE_SECONDS = 300; // 30 วินาที 

function formatMMSS(seconds: number) {
    const s = Math.max(0, Math.floor(seconds));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
}

const Payment: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const { search } = useLocation();

    // สมมติค่าเบื้องต้น (อ่านจาก query หรือจะไปดึงจาก backend ภายหลัง)
    const params = new URLSearchParams(search);
    const initialOrderCode = params.get("order") || "ODR-DEMO-001";
    const initialAmount = params.get("amount") ? Number(params.get("amount")) : 0;

    const [orderCode, setOrderCode] = useState<string>(initialOrderCode);
    const [amount, setAmount] = useState<number | null>(initialAmount || null);
    const [note, setNote] = useState<string>("");

    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [generating, setGenerating] = useState<boolean>(false);

    // หมดอายุ
    const [expireAt, setExpireAt] = useState<number | null>(null); // timestamp ms
    const [remainingSec, setRemainingSec] = useState<number>(0);

    const [verifying, setVerifying] = useState<boolean>(false);

    const GoMainPage = () => {
    // โหมด UI อย่างเดียว: แค่โชว์ข้อความเฉย ๆ ไม่ลบข้อมูล/redirect
    messageApi.success("เดโม UI: กำลังกลับไปหน้าหลัก... (ไม่มีการลบข้อมูล)");
    setTimeout(() => {
      navigate("/");      // ไปหน้าหลัก
    }, 200);
  };

  const handleSuccess = () => {
    // โหมด UI อย่างเดียว: แค่โชว์ข้อความเฉย ๆ ไม่ลบข้อมูล/redirect
    messageApi.success("เดโม UI: กำลังกลับไปหน้าหลัก... (ไม่มีการลบข้อมูล)");
    setTimeout(() => {
      navigate("/payment/success");      // ไปหน้าหลัก
    }, 200);
  };

    useEffect(() => {
        let timer: number | undefined;
        if (qrDataUrl && expireAt) {
            const tick = () => {
                const left = Math.ceil((expireAt - Date.now()) / 1000);
                setRemainingSec(left);
                if (left <= 0) {
                    // หมดอายุ
                    setQrDataUrl(null);
                    setExpireAt(null);
                    messageApi.warning("QR หมดอายุแล้ว กรุณาสร้างใหม่");
                }
            };
            tick();
            timer = window.setInterval(tick, 1000);
        } else {
            setRemainingSec(0);
        }
        return () => {
            if (timer) window.clearInterval(timer);
        };
    }, [qrDataUrl, expireAt, messageApi]);

    // เผื่อกรณีต้องโหลดข้อมูลจาก backend เมื่อโหลดหน้า
    useEffect(() => {
        // (ตัวอย่าง) ดึงข้อมูลคำสั่งซื้อ เพื่อเอายอดรวมจริง
        // async function fetchOrder() {
        //   const res = await fetch(`/api/orders/${orderCode}`);
        //   const data = await res.json();
        //   setAmount(data.total); // ยอดสุทธิจริงจาก backend
        // }
        // fetchOrder();
    }, [orderCode]);

    const handleGenerateQR = async () => {
        if (amount == null || isNaN(Number(amount)) || Number(amount) <= 0) {
            messageApi.error("กรุณาใส่ยอดเงินที่ถูกต้องก่อนสร้าง QR");
            return;
        }
        try {
            setGenerating(true);

            // 1) EMVCo payload สำหรับ PromptPay
            const payload: string = generatePayload(PROMPTPAY_MOBILE, {
                amount: Number(Number(amount).toFixed(2)),
            });

            // 2) สร้างรูป QR (data URL)
            const url = await QRCode.toDataURL(payload, { width: 300, margin: 1 });
            setQrDataUrl(url);

            // ตั้งเวลาหมดอายุใหม่ทุกครั้งที่สร้าง QR
            setExpireAt(Date.now() + QR_EXPIRE_SECONDS * 1000);

            messageApi.success("สร้าง QR สำเร็จ");
        } catch (err) {
            console.error(err);
            messageApi.error("สร้าง QR ไม่สำเร็จ");
        } finally {
            setGenerating(false);
        }
    };

    const handleClearQR = () => {
        setQrDataUrl(null);
        setExpireAt(null);
        setRemainingSec(0);
    };

    const handleDownloadQR = () => {
        if (!qrDataUrl) return;
        const a = document.createElement("a");
        a.href = qrDataUrl;
        a.download = `QR_${orderCode || "payment"}_${amount || ""}.png`;
        a.click();
    };

    const handleIHavePaid = async () => {
        // TODO: ยิง backend เพื่อบันทึกว่า user ชำระแล้ว (หรือแนบ slip)
        // await fetch(`/api/payments/confirm`, {...})
        messageApi.info("เดโม UI: แจ้งชำระเรียบร้อย (ยังไม่เชื่อม backend)");
    };

    const handleVerifyPayment = async () => {
        // TODO: ตรวจสถานะจาก backend (ถ้าใช้ payment intent)
        setVerifying(true);
        setTimeout(() => {
            setVerifying(false);
            messageApi.info("เดโม UI: ตรวจสถานะการชำระ (ยังไม่เชื่อม backend)");
        }, 800);
    };

    const header = (
        <Card
            style={{
                background: "rgb(239, 102, 75)",
                color: "white",
                marginBottom: 24,
                borderRadius: 16,
            }}
        >
            <Row align="middle" gutter={24}>
                <Col>
                    <Avatar
                        onClick={GoMainPage}
                        size={64}
                        icon={<ArrowLeftOutlined />}
                        style={{
                            cursor: "pointer",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                        }}
                    />
                </Col>

                <Col flex="1">
                    <Title level={2} style={{ color: "white", margin: 0 }}>
                        การชำระเงิน 💲
                    </Title>
                    <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
                        เลือกยอดและกด “สร้าง QR” เพื่อชำระผ่าน PromptPay
                    </Text>
                </Col>
            </Row>
        </Card>
    );

    return (
        <div style={{ backgroundColor: "white", minHeight: "100vh", width: "100%" }}>
            {contextHolder}
            {header}

            {/* บล็อค: QR Code (กึ่งกลางหน้าจอ) */}
            <Row justify="center" style={{ padding: "0 8px 0" }}>
                <Col xs={24} md={16} lg={12} xl={14}>
                    <Card
                        bordered
                        style={{ borderRadius: 12 }}
                        bodyStyle={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                    >
                        <Title level={4} style={{ marginTop: 0, textAlign: "center" }}>
                            สแกนจ่ายด้วย PromptPay
                        </Title>

                        <div style={{ marginBottom: 8, textAlign: "center" }}>
                            <Text>ผู้รับเงิน: </Text>
                            <Text strong>{PROMPTPAY_MOBILE}</Text>
                            <br />
                            <Text>ยอดเงิน: </Text>
                            <Text strong>
                                {amount != null && !isNaN(Number(amount))
                                    ? `${Number(amount).toFixed(2)} บาท`
                                    : "-"}
                            </Text>
                        </div>

                        {/* แถบนับถอยหลัง */}
                        {qrDataUrl && expireAt && remainingSec > 0 && (
                            <Alert
                                style={{ marginBottom: 12, textAlign: "center" }}
                                type="info"
                                showIcon
                                message={
                                    <span>
                                        QR จะหมดอายุใน <b>{formatMMSS(remainingSec)}</b>
                                    </span>
                                }
                            />
                        )}

                        {/* กล่อง QR กึ่งกลาง */}
                        <div style={{ margin: "8px 0 16px", display: "flex", justifyContent: "center" }}>
                            {qrDataUrl ? (
                                <img
                                    src={qrDataUrl}
                                    alt="PromptPay QR"
                                    style={{ width: 280, height: 280, objectFit: "contain" }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 280,
                                        height: 280,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "1px dashed #ddd",
                                        borderRadius: 12,
                                    }}
                                >
                                    <Spin tip="ยังไม่มี QR — ใส่ยอดแล้วกด 'สร้าง QR' " />
                                </div>
                            )}
                        </div>

                        <Space wrap>
                            <Button
                                icon={<DownloadOutlined />}
                                disabled={!qrDataUrl}
                                onClick={handleDownloadQR}
                            >
                                บันทึก QR
                            </Button>

                            {!qrDataUrl && (
                                <Button type="primary" icon={<QrcodeOutlined />} onClick={handleGenerateQR}>
                                    สร้าง QR ใหม่
                                </Button>
                            )}
                        </Space>

                        {/* คำแนะนำ (อยู่กึ่งกลาง ใต้ QR) */}
                        <Divider />
                        <Card style={{ maxWidth: 760, margin: "0 auto" }}>
                            <Title level={4} style={{ marginBottom: 30 }}>
                                กรุณาทำตามขั้นตอนที่แนะนำ
                            </Title>

                            {/* current = -1 เพื่อไม่ไฮไลต์ขั้นปัจจุบัน แสดงเป็นรายการขั้นตอนเฉย ๆ */}
                            <Steps
                                size="small"
                                direction="vertical"
                                current={-1}
                                items={[
                                    {
                                        title:
                                            'คลิกปุ่ม "บันทึก QR" หรือแคปหน้าจอ',
                                    },
                                    {
                                        title:
                                            "เปิดแอปพลิเคชันธนาคารบนอุปกรณ์ของท่าน",
                                    },
                                    {
                                        title:
                                            'เลือกไปที่เมนู "สแกน" หรือ "QR Code" และกดที่ "รูปภาพ"',
                                    },
                                    {
                                        title:
                                            "เลือกภาพที่ท่านบันทึก/แคปไว้และทำการชำระเงิน โดยกรุณาเช็คชื่อบัญชีผู้รับ คือ “บริษัท ช้อปปี้เพย์ (ประเทศไทย) จำกัด”",
                                    },
                                    {
                                        title:
                                            "ตั้งค่า/อัปโหลดหลักฐานยืนยันทันทีหลังจากชำระเงินสำเร็จ หรือภายใน 30 วินาที ในกรณีที่มีธุรกรรมจำนวนมาก",
                                    },
                                ]}
                            />

                            <Paragraph style={{ marginTop: 16 }}>
                                <Text type="secondary">
                                    หมายเหตุ: ช่องทางชำระเงินพร้อมเพย์ใช้ได้กับแอปพลิเคชันธนาคารหรือวอลเล็ตรองรับการชำระเงินด้วยพร้อมเพย์เท่านั้น
                                </Text>
                            </Paragraph>
                        </Card>
                            <Button
                                size="large"
                                onClick={handleSuccess} // ไปที่หน้าชำระสำเร็จ
                                style={{ 
                                    height: "48px",
                                    width: "256px",
                                    color: "white",
                                    backgroundColor: "rgb(239, 102, 75)",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    marginTop: 24 
                                    
                                }}
                                className="Payment-ok-button"
                            >
                                ตกลง
                            </Button>
                    </Card>
                </Col>
            </Row>

            <div style={{ padding: "0 16px 32px", textAlign: "center", marginTop: 16 }}>
                <Text type="secondary">
                    *หมายเหตุ: ขณะนี้เป็นเดโมฝั่งหน้าเว็บเท่านั้น ยังไม่ได้เชื่อมต่อระบบชำระเงินจริง/ตรวจสถานะอัตโนมัติ
                </Text>
            </div>

            {/* บล็อค: รายละเอียดคำสั่งซื้อ */}
            <Row gutter={[24, 24]} style={{ padding: "0 8px 16px" }} justify="center">
                <Col xs={24} md={14} lg={12}>
                    <Card bordered style={{ borderRadius: 12 }}>
                        <Title level={4} style={{ marginTop: 0 }}>
                            รายละเอียดคำสั่งซื้อ
                        </Title>
                        <Descriptions column={1} size="middle">
                            <Descriptions.Item label="รหัสคำสั่งซื้อ">
                                <Input
                                    value={orderCode}
                                    onChange={(e) => setOrderCode(e.target.value)}
                                    placeholder="เช่น ODR-2025-0001"
                                />
                            </Descriptions.Item>

                            <Descriptions.Item label="ยอดชำระ (บาท)">
                                <InputNumber
                                    style={{ width: "100%" }}
                                    value={amount ?? undefined}
                                    onChange={(v) => setAmount(v == null ? null : Number(v))}
                                    min={0}
                                    step={0.01}
                                    stringMode
                                    placeholder="ใส่จำนวนเงิน เช่น 259.50"
                                />
                            </Descriptions.Item>

                            <Descriptions.Item label="หมายเหตุ / ข้อความแนบ">
                                <Input
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="เช่น โอนจากบัญชี xxx"
                                />
                            </Descriptions.Item>
                        </Descriptions>

                        <Space style={{ marginTop: 16 }} wrap>
                            <Button
                                type="primary"
                                icon={<QrcodeOutlined />}
                                loading={generating}
                                onClick={handleGenerateQR}
                            >
                                สร้าง QR PromptPay
                            </Button>

                            <Button icon={<ReloadOutlined />} onClick={handleClearQR}>
                                ล้าง QR
                            </Button>

                            <Button loading={verifying} onClick={handleVerifyPayment}>
                                ตรวจสถานะการชำระ
                            </Button>

                            <Button type="default" icon={<CheckCircleOutlined />} onClick={handleIHavePaid}>
                                ฉันชำระเงินแล้ว
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Payment;
