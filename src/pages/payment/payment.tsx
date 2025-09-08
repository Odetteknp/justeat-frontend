import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card, Row, Col, Button, Typography, message,
  Space, Alert, Steps,
} from "antd";
import {
  DownloadOutlined, QrcodeOutlined, DeleteOutlined, CreditCardOutlined,
} from "@ant-design/icons";
import QRCode from "qrcode";
// @ts-ignore
import generatePayload from "promptpay-qr";
import ImageUploading from "react-images-uploading";
import type { ImageListType } from "react-images-uploading";

const { Title, Text, Paragraph } = Typography;

const PROMPTPAY_MOBILE = "0934719687";
const QR_EXPIRE_SECONDS = 10;

function formatMMSS(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

const fmtTHB = (n?: number) =>
  typeof n === "number" && !Number.isNaN(n)
    ? new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(n)
    : "-";

// --- helper: แปลงไฟล์เป็น base64 สำหรับพรีวิว/ส่งขึ้น backend ---
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
  });

// helper: แปลง base64 data URL เป็น base64 string อย่างเดียว
const extractBase64 = (dataUrl: string): string => {
  const base64Index = dataUrl.indexOf("base64,");
  return base64Index !== -1 ? dataUrl.substring(base64Index + 7) : dataUrl;
};

// ข้อมูลคำสั่งซื้อจำลอง - ในการใช้งานจริงควรได้มาจาก API
const mockOrderData = {
  orderID: "ODR-2025-001234",
  customerName: "คุณสมชาย ใจดี",
  customerPhone: "081-234-5678",
  subtotal: 2688,
  shippingFee: 20,
  discount: 100,
  totalAmount: 1, // ยอดที่ต้องชำระจริง
  orderDate: "2025-01-15 14:30:25",
};

const Payment: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { search } = useLocation();

  const params = new URLSearchParams(search);
  const initialOrderCode = params.get("order") || mockOrderData.orderID;
  const qAmount = params.get("amount");
  const initialAmount =
    qAmount !== null && !Number.isNaN(Number(qAmount))
      ? Number(qAmount)
      : mockOrderData.totalAmount;
  const orderId = params.get("orderId") ? Number(params.get("orderId")) : 3; //  =========== mock orderId

  const [orderCode] = useState<string>(initialOrderCode);
  const [amount] = useState<number>(initialAmount);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  const [expireAt, setExpireAt] = useState<number | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(0);

  const isQRAlive = Boolean(qrDataUrl && expireAt && remainingSec > 0);

  // ---- แนบสลิป: states (react-images-uploading) ----
  const [images, setImages] = useState<ImageListType>([]);
  const [uploading, setUploading] = useState(false);

  const handleSuccess = () => {
    setTimeout(() => navigate("/payment/success"), 200);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (qrDataUrl && expireAt) {
      const tick = () => {
        const left = Math.ceil((expireAt - Date.now()) / 1000);
        setRemainingSec(left);
        if (left <= 0) {
          setQrDataUrl(null);
          setExpireAt(null);
          messageApi.warning("QR หมดอายุแล้ว กรุณาสร้างใหม่");
        }
      };
      tick();
      timer = setInterval(tick, 1000);
    } else {
      setRemainingSec(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [qrDataUrl, expireAt, messageApi]);

  const handleGenerateQR = async () => {
    try {
      setGenerating(true);
      const payload = generatePayload(PROMPTPAY_MOBILE, {
        amount: Number(Number(amount).toFixed(2)),
      });
      const url = await QRCode.toDataURL(payload, { width: 300, margin: 1 });
      setQrDataUrl(url);
      setExpireAt(Date.now() + QR_EXPIRE_SECONDS * 1000);
      messageApi.success("สร้าง QR สำเร็จ");
    } catch (err) {
      console.error("QR Generation Error:", err);
      messageApi.error("สร้าง QR ไม่สำเร็จ");
    } finally {
      setGenerating(false);
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadQR = async () => {
    if (!qrDataUrl) return;

    setDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const a = document.createElement("a");
      a.href = qrDataUrl;
      a.download = `QR_${orderCode || "payment"}_${amount || ""}.png`;
      a.click();
      messageApi.success("ดาวน์โหลด QR สำเร็จ");
    } catch (error) {
      messageApi.error("ดาวน์โหลดไม่สำเร็จ");
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmitSlip = async () => {
    if (uploading) return;  // กันกดรัว
    setUploading(true);

    try {
      // ตรวจชนิด/ขนาดไฟล์ "ก่อน" อ่าน Base64
      const file = images[0].file as File;
      const typeOk = /^image\/(png|jpe?g)$/.test(file.type) || /\.(png|jpe?g)$/i.test(file.name);
      if (!typeOk) {
        messageApi.error("รองรับเฉพาะไฟล์ PNG/JPG เท่านั้น");
        return;
      }
      const MAX = 5 * 1024 * 1024;
      if (file.size > MAX) {
        messageApi.error("ไฟล์ใหญ่เกิน 5MB");
        return;
      }

      // อ่านไฟล์หลังผ่าน validation แล้ว
      const dataUrl = await getBase64(file);
      const base64Data = extractBase64(dataUrl);

      const requestData = {
        orderId: orderId,
        amount: 0, // <= ชั่วคราวเพื่อข้ามการเช็คยอด padi_at
        //amount: Math.round(amount * 100), // ส่งเป็นสตางค์
        contentType: file.type,
        slipBase64: base64Data,
      };

      const API_BASE = import.meta.env?.VITE_API_BASE_URL ?? "http://localhost:8000";
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/api/payments/verify-easyslip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorMsg = "Upload failed";
        try {
          const ct = response.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } else {
            const text = await response.text();
            if (text) errorMsg = text;
          }
        } catch { /* ignore */ }
        throw new Error(errorMsg);
      }

      const ct = response.headers.get("content-type") || "";
      const result = ct.includes("application/json") ? await response.json() : {};

      if (result.success || result.ok) {
        //แสดงผลเป็น “บาท”
        const displayAmount =
          typeof result.slipData?.amountSatang === "number"
            ? result.slipData.amountSatang / 100
            : amount;

        const transRef =
          result.slipData?.transRef || (result.paymentId ? `TXN-${result.paymentId}` : "-");

        messageApi.success(`ตรวจสอบสลิปสำเร็จ! จำนวนเงิน: ${fmtTHB(displayAmount)}`);
        messageApi.info(`รหัสธุรกรรม: ${transRef}`);

        setImages([]);
        setTimeout(() => handleSuccess(), 200);
      } else {
        const errorMsg = result.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
        messageApi.error(`ตรวจสอบสลิปไม่สำเร็จ: ${errorMsg}`);
        result.validationErrors?.forEach((error: string) => messageApi.warning(error));
      }
    } catch (error) {
      console.error("Upload error:", error);
      messageApi.error("อัปโหลดสลิปไม่สำเร็จ: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "white", minHeight: "100%", width: "100%" }}>
      {contextHolder}

      <Row justify="center" style={{ padding: "16px 8px" }}>
        {/* Left Column - Instructions */}
        <Col xs={24} md={8} lg={7} xl={8}>
          <Card
            bordered
            style={{ borderRadius: 12, height: "fit-content", position: "sticky", top: 16 }}
          >
            <Title level={4} style={{ marginBottom: 32 }}>
              กรุณาทำตามขั้นตอนที่แนะนำ
            </Title>
            <Steps
              size="small"
              direction="vertical"
              current={-1}
              items={[
                { title: 'คลิกปุ่ม "บันทึก QR" หรือแคปหน้าจอ' },
                { title: "เปิดแอปพลิเคชันธนาคารบนอุปกรณ์ของท่าน" },
                { title: 'เลือกไปที่เมนู "สแกน" หรือ "QR Code" และกดที่ "รูปภาพ"' },
                { title: 'เลือกภาพที่บันทึกไว้และทำการชำระเงิน' },
                { title: 'อัปโหลดสลิปยืนยันการโอนในหน้านี้ แล้วกด "ส่งสลิปยืนยันการชำระ"' },
              ]}
            />
            <Paragraph style={{ marginTop: 85 }}>
              <Text type="secondary">
                หมายเหตุ: ช่องทางชำระเงินพร้อมเพย์ใช้ได้กับแอป/วอลเล็ตที่รองรับพร้อมเพย์เท่านั้น
              </Text>
            </Paragraph>
          </Card>
        </Col>

        {/* Middle Column - QR Code */}
        <Col xs={24} md={8} lg={8} xl={9} style={{ paddingLeft: 8, paddingRight: 8 }}>
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
              <Text strong>{fmtTHB(amount)}</Text>
            </div>

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

            <div
              style={{
                margin: "8px 0 16px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`PromptPay QR สำหรับชำระเงิน ${fmtTHB(amount)}`}
                  style={{ width: 280, height: 280, objectFit: "contain" }}
                />
              ) : (
                <div
                  style={{
                    width: 300,
                    height: 280,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px dashed #ddd",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Text type="secondary">
                      กดปุ่ม "สร้าง QR PromptPay" เพื่อแสดง QR Code
                    </Text>
                  </div>
                </div>
              )}
            </div>

            <Space wrap>
              <Button
                className={`Payment-white-button ${qrDataUrl ? "is-ready" : ""}`}
                style={{
                  height: 48,
                  width: 120,
                }}
                icon={<DownloadOutlined />}
                disabled={!qrDataUrl}
                loading={downloading}
                onClick={handleDownloadQR}
              >
                บันทึก QR
              </Button>

              <Button
                style={{
                  height: 48,
                  width: 180,
                }}
                className={`Payment-orange-button ${qrDataUrl ? "" : "is-ready"}`}
                icon={<QrcodeOutlined />}
                onClick={handleGenerateQR}
                loading={generating}
                disabled={isQRAlive || generating}
              >
                สร้าง QR PromptPay
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Right Column - Upload Slip */}
        <Col xs={24} md={8} lg={8} xl={7}>
          <Card
            bordered
            style={{ borderRadius: 12, height: "fit-content", position: "sticky", top: 16 }}
            bodyStyle={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <Title level={4} style={{ marginBottom: 16, textAlign: "center" }}>
              แนบสลิปการโอนเงิน
            </Title>

            <ImageUploading
              value={images}
              onChange={setImages}
              maxNumber={1}
              dataURLKey="dataURL"
              acceptType={["jpg", "jpeg", "png"]}
            >
              {({ imageList, onImageUpload, onImageUpdate }) => {
                const hasImg = imageList.length > 0;

                const handleClick = () => {
                  if (hasImg) onImageUpdate(0);  // แทนที่รูปเดิม
                  else onImageUpload();          // อัปโหลดรูปใหม่ครั้งแรก
                };

                return (
                  <div
                    onClick={handleClick}
                    style={{
                      width: 200,
                      height: 334,
                      border: "1px dashed #EF664B",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClick();
                      }
                    }}
                  >
                    {hasImg ? (
                      <img
                        src={imageList[0].dataURL}
                        alt="slip"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <span>+ แนบสลิป</span>
                    )}
                  </div>
                );
              }}
            </ImageUploading>

            <Space wrap style={{ marginTop: 16 }}>
              <Button
                className={`Payment-white-button ${images.length && !uploading ? "is-ready" : ""}`}
                style={{
                  height: 48,
                  width: 80,
                }}
                icon={<DeleteOutlined />}
                onClick={() => setImages([])}
                disabled={!images.length}
              >
                ลบรูป
              </Button>
              <Button
                className={`Payment-orange-button ${images.length && !uploading ? "is-ready" : ""}`}
                icon={<CreditCardOutlined />}
                onClick={handleSubmitSlip}
                loading={uploading}
                disabled={!images.length || uploading}
                style={{
                  height: 48,
                  maxWidth: 180, // ป้องกันปุ่มกระตุก
                }}
              >
                {uploading ? "กำลังตรวจสอบสลิป..." : "แจ้งชำระเงิน"}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Payment;