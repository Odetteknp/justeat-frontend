import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card, Row, Col, Button, Typography, message,
  Space, Alert, Steps, Tooltip
} from "antd";
import {
  DownloadOutlined, QrcodeOutlined, ReloadOutlined
} from "@ant-design/icons";
import QRCode from "qrcode";
// @ts-ignore
import generatePayload from "promptpay-qr";
import ImageUploading from "react-images-uploading";
import type { ImageListType } from "react-images-uploading";

const { Title, Text, Paragraph } = Typography;

const PROMPTPAY_MOBILE = "0934719687";
const QR_EXPIRE_SECONDS = 300;

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
  orderCode: "ODR-2025-001234",
  customerName: "คุณสมชาย ใจดี",
  customerPhone: "081-234-5678",
  subtotal: 2688,
  shippingFee: 20,
  discount: 100,
  totalAmount: 5, // ยอดที่ต้องชำระจริง
  orderDate: "2025-01-15 14:30:25",
};

const Payment: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { search } = useLocation();

  const params = new URLSearchParams(search);
  const initialOrderCode = params.get("order") || mockOrderData.orderCode;
  const qAmount = params.get("amount");
  const initialAmount =
    qAmount !== null && !Number.isNaN(Number(qAmount))
      ? Number(qAmount)
      : mockOrderData.totalAmount;
  const orderId = params.get("orderId") ? Number(params.get("orderId")) : 1;

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
    if (qrDataUrl && remainingSec > 0) {
      messageApi.warning("QR ปัจจุบันยังไม่หมดอายุ กรุณาล้างหรือรอให้หมดอายุ");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      messageApi.error("ยอดเงินไม่ถูกต้อง");
      return;
    }
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
    if (!images.length || !images[0].file) {
      messageApi.warning("โปรดแนบสลิปก่อนส่งยืนยัน");
      return;
    }
    if (!amount || amount <= 0) {
      messageApi.error("กรุณาใส่ยอดเงินที่ถูกต้อง");
      return;
    }

    try {
      setUploading(true);
      const file = images[0].file as File;

      // ตรวจชนิด/ขนาดไฟล์ "ก่อน" อ่าน Base64
      if (!/^image\/(png|jpe?g)$/.test(file.type)) {
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
        amount: Math.round(amount * 100), // ส่งเป็นสตางค์
        contentType: file.type,
        slipBase64: base64Data,
      };

      const API_BASE = import.meta.env?.VITE_API_BASE_URL ?? "http://localhost:8000";

      const response = await fetch(`${API_BASE}/api/payments/upload-slip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}` // ถ้ามีระบบล็อกอิน
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorMsg = "Upload failed";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          /* ignore non-JSON */
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();

      if (result.success || result.ok) {
        const displayAmount =
          typeof result.slipData?.amount === "number"
            ? result.slipData.amount
            : amount;

        const transRef =
          result.slipData?.transRef || `TXN-${result.paymentId}`;

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
  }; // <-- ปิดฟังก์ชันให้เรียบร้อย

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
            <Title level={4} style={{ marginBottom: 20 }}>
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
            <Paragraph style={{ marginTop: 16 }}>
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
                  alt={`PromptPay QR Code สำหรับชำระเงิน ${amount?.toFixed(2)} บาท`}
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
                  role="img"
                  aria-label="พื้นที่แสดง QR Code PromptPay"
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
              <Tooltip title="บันทึกภาพ QR เพื่อไปใช้จ่ายในแอปธนาคาร">
                <Button
                  icon={<DownloadOutlined />}
                  disabled={!qrDataUrl}
                  loading={downloading}
                  onClick={handleDownloadQR}
                  aria-label="ดาวน์โหลด QR Code สำหรับชำระเงิน"
                >
                  บันทึก QR
                </Button>
              </Tooltip>

              <Button
                type="primary"
                icon={<QrcodeOutlined />}
                onClick={handleGenerateQR}
                loading={generating}
                disabled={isQRAlive || generating}
                aria-label="สร้าง QR Code PromptPay สำหรับการชำระเงิน"
              >
                สร้าง QR PromptPay
              </Button>

              <Button
                icon={<ReloadOutlined />}
                onClick={handleClearQR}
                disabled={!qrDataUrl}
                aria-label="ลบ QR Code ปัจจุบัน"
              >
                ล้าง QR
              </Button>
            </Space>

            <Button
              size="large"
              onClick={handleSuccess}
              style={{
                height: 48,
                width: 256,
                color: "white",
                backgroundColor: "rgb(239, 102, 75)",
                border: "1px solid rgba(255,255,255,0.2)",
                marginTop: 24,
              }}
            >
              ตกลง
            </Button>
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
                      height: 300,
                      border: "1px dashed #EF664B",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                    role="button"
                    aria-label={hasImg ? "คลิกเพื่อเปลี่ยนสลิป" : "คลิกเพื่ออัปโหลดสลิป"}
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
              <Button onClick={() => setImages([])} disabled={!images.length}>
                ลบรูป
              </Button>
              <Button type="primary" onClick={handleSubmitSlip} loading={uploading} disabled={!images.length}>
                ส่งสลิปยืนยันการชำระ
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Footer */}
      <div style={{ padding: "0 16px 32px", textAlign: "center", marginTop: 16 }}>
        <Text type="secondary">*เดโม—ยังไม่ได้เชื่อมระบบชำระเงินจริง/ตรวจสถานะอัตโนมัติ</Text>
      </div>
    </div>
  );
};

export default Payment;
