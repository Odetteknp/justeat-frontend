import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card, Row, Col, Spin, Button, Avatar, Typography, message, InputNumber, Input,
  Descriptions, Space, Divider, Alert, Steps, Upload, Modal
} from "antd";
import {
  ArrowLeftOutlined, DownloadOutlined, QrcodeOutlined, CheckCircleOutlined, ReloadOutlined
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import QRCode from "qrcode";
// @ts-ignore
import generatePayload from "promptpay-qr";

const { Title, Text, Paragraph } = Typography;

const PROMPTPAY_MOBILE = "0934719687";
const QR_EXPIRE_SECONDS = 300;

function formatMMSS(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

// --- helper: แปลงไฟล์เป็น base64 สำหรับพรีวิว/ส่งขึ้น backend ---
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
  });

const Payment: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { search } = useLocation();

  const params = new URLSearchParams(search);
  const initialOrderCode = params.get("order") || "ODR-DEMO-001";
  const initialAmount = params.get("amount") ? Number(params.get("amount")) : 0;

  const [orderCode, setOrderCode] = useState<string>(initialOrderCode);
  const [amount, setAmount] = useState<number | null>(initialAmount || null);
  const [note, setNote] = useState<string>("");

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  const [expireAt, setExpireAt] = useState<number | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const [verifying, setVerifying] = useState<boolean>(false);

  // ---- แนบสลิป: states ----
  const [slipList, setSlipList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // *สมมติ* มี paymentIntentId ที่ backend สร้าง (เผื่อเชื่อมต่อจริง)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const GoMainPage = () => {
    messageApi.success("เดโม UI: กำลังกลับไปหน้าหลัก...");
    setTimeout(() => navigate("/"), 200);
  };

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
    return () => { if (timer) clearInterval(timer); };
  }, [qrDataUrl, expireAt, messageApi]);

  const handleGenerateQR = async () => {
    if (amount == null || isNaN(Number(amount)) || Number(amount) <= 0) {
      messageApi.error("กรุณาใส่ยอดเงินที่ถูกต้องก่อนสร้าง QR");
      return;
    }
    try {
      setGenerating(true);
      // (ทางจริงอาจ POST ไป backend เพื่อสร้าง paymentIntent แล้วรับ paymentIntentId กลับมา)
      // const res = await fetch('/api/payments/intents', {method:'POST', body: JSON.stringify({orderCode, amount})});
      // const { paymentIntentId } = await res.json();
      // setPaymentIntentId(paymentIntentId);

      const payload: string = generatePayload(PROMPTPAY_MOBILE, {
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

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR_${orderCode || "payment"}_${amount || ""}.png`;
    a.click();
  };

  const handleIHavePaid = async () => {
    messageApi.info("เดโม UI: แจ้งชำระเรียบร้อย (ยังไม่เชื่อม backend)");
  };

  const handleVerifyPayment = async () => {
    setVerifying(true);
    // ตัวอย่างเรียกสถานะจริง:
    // const res = await fetch(`/api/payments/${paymentIntentId}/status`);
    // const data = await res.json();
    setTimeout(() => {
      setVerifying(false);
      messageApi.info("เดโม UI: ตรวจสถานะการชำระ (ยังไม่เชื่อม backend)");
    }, 800);
  };

  // ---- แนบสลิป: config ----
  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) messageApi.error("อัปโหลดได้เฉพาะไฟล์รูปภาพเท่านั้น");
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) messageApi.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
    return isImage && isLt5M ? true : Upload.LIST_IGNORE; // ปล่อยให้ antd จัดการ (ไม่อัปโหลดขึ้นเซิร์ฟเวอร์จริง)
  };

  const onChangeUpload: UploadProps["onChange"] = ({ fileList }) => {
    setSlipList(fileList.slice(-1)); // จำกัด 1 ไฟล์
  };

  const onPreview: UploadProps["onPreview"] = async (file) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage((file.url as string) || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleSubmitSlip = async () => {
    if (!slipList.length || !slipList[0].originFileObj) {
      messageApi.warning("โปรดแนบสลิปก่อนส่งยืนยัน");
      return;
    }
    try {
      setUploading(true);
      const file = slipList[0].originFileObj as File;
      // ตัวอย่างอัปโหลดจริง:
      // const form = new FormData();
      // form.append('slip', file);
      // form.append('orderCode', orderCode);
      // form.append('amount', String(amount ?? ''));
      // if (paymentIntentId) form.append('paymentIntentId', paymentIntentId);
      // await fetch('/api/payments/upload-slip', { method: 'POST', body: form });
      messageApi.success("เดโม UI: แนบสลิปสำเร็จ (ยังไม่เชื่อม backend)");
    } catch (e) {
      console.error(e);
      messageApi.error("อัปโหลดสลิปไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };


  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", width: "100%" }}>
      {contextHolder}

      {/* QR + คำแนะนำ */}
      <Row justify="center" style={{ padding: "0 8px 0" }}>
        <Col xs={24} md={16} lg={12} xl={14}>
          <Card bordered style={{ borderRadius: 12 }} bodyStyle={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Title level={4} style={{ marginTop: 0, textAlign: "center" }}>สแกนจ่ายด้วย PromptPay</Title>

            <div style={{ marginBottom: 8, textAlign: "center" }}>
              <Text>ผู้รับเงิน: </Text><Text strong>{PROMPTPAY_MOBILE}</Text><br />
              <Text>ยอดเงิน: </Text>
              <Text strong>{amount != null && !isNaN(Number(amount)) ? `${Number(amount).toFixed(2)} บาท` : "-"}</Text>
            </div>

            {qrDataUrl && expireAt && remainingSec > 0 && (
              <Alert style={{ marginBottom: 12, textAlign: "center" }} type="info" showIcon
                message={<span>QR จะหมดอายุใน <b>{formatMMSS(remainingSec)}</b></span>} />
            )}

            <div style={{ margin: "8px 0 16px", display: "flex", justifyContent: "center" }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="PromptPay QR" style={{ width: 280, height: 280, objectFit: "contain" }} />
              ) : (
                <div style={{ width: 280, height: 280, display: "flex", alignItems: "center", justifyContent: "center",
                              border: "1px dashed #ddd", borderRadius: 12 }}>
                  <Spin tip="ยังไม่มี QR — ใส่ยอดแล้วกด 'สร้าง QR' " />
                </div>
              )}
            </div>

            <Space wrap>
              <Button icon={<DownloadOutlined />} disabled={!qrDataUrl} onClick={handleDownloadQR}>
                บันทึก QR
              </Button>
              {!qrDataUrl && (
                <Button type="primary" icon={<QrcodeOutlined />} onClick={handleGenerateQR} loading={generating}>
                  สร้าง QR ใหม่
                </Button>
              )}
            </Space>

            {/*  เพิ่มส่วน “แนบสลิป” ใต้ปุ่ม บันทึก QR  */}
            <Divider />
            <Title level={5} style={{ marginBottom: 8 }}>แนบสลิปการโอนเงิน</Title>
            <Upload
              listType="picture-card"
              fileList={slipList}
              beforeUpload={beforeUpload}
              onChange={onChangeUpload}
              onPreview={onPreview}
              maxCount={1}
              accept="image/*"
              style={{ width: "200px" }}
            >
              {slipList.length >= 1 ? null : "+ แนบสลิป"}
            </Upload>
            <Space wrap style={{ marginTop: 16 }}>
              <Button onClick={() => setSlipList([])} disabled={!slipList.length}>
                ลบรูป
              </Button>
              <Button type="primary" onClick={handleSubmitSlip} loading={uploading} disabled={!slipList.length}>
                ส่งสลิปยืนยันการชำระ
              </Button>
            </Space>
            <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
              <img alt="slip preview" style={{ width: "100%" }} src={previewImage} />
            </Modal>
            {/* 🔼🔼 สิ้นสุดส่วนแนบสลิป 🔼🔼 */}

            <Divider />
            <Card style={{ maxWidth: 760, margin: "0 auto" }}>
              <Title level={4} style={{ marginBottom: 30 }}>กรุณาทำตามขั้นตอนที่แนะนำ</Title>
              <Steps size="small" direction="vertical" current={-1} items={[
                { title: 'คลิกปุ่ม "บันทึก QR" หรือแคปหน้าจอ' },
                { title: "เปิดแอปพลิเคชันธนาคารบนอุปกรณ์ของท่าน" },
                { title: 'เลือกไปที่เมนู "สแกน" หรือ "QR Code" และกดที่ "รูปภาพ"' },
                { title: "เลือกภาพที่บันทึกไว้และทำการชำระเงิน โดยกรุณาเช็คชื่อบัญชีผู้รับ คือ “บริษัท ช้อปปี้เพย์ (ประเทศไทย) จำกัด”" },
                { title: "อัปโหลดสลิปยืนยันการโอนในหน้านี้ แล้วกด “ส่งสลิปยืนยันการชำระ”" },
              ]} />
              <Paragraph style={{ marginTop: 16 }}>
                <Text type="secondary">
                  หมายเหตุ: ช่องทางชำระเงินพร้อมเพย์ใช้ได้กับแอป/วอลเล็ตที่รองรับพร้อมเพย์เท่านั้น
                </Text>
              </Paragraph>
            </Card>

            <Button size="large" onClick={handleSuccess}
              style={{ height: 48, width: 256, color: "white", backgroundColor: "rgb(239, 102, 75)",
                       border: "1px solid rgba(255,255,255,0.2)", marginTop: 24 }}>
              ตกลง
            </Button>
          </Card>
        </Col>
      </Row>

      {/* หมายเหตุ */}
      <div style={{ padding: "0 16px 32px", textAlign: "center", marginTop: 16 }}>
        <Text type="secondary">
          *เดโม—ยังไม่ได้เชื่อมระบบชำระเงินจริง/ตรวจสถานะอัตโนมัติ
        </Text>
      </div>

      {/* รายละเอียดคำสั่งซื้อ (อยู่ล่าง) */}
      <Row gutter={[24, 24]} style={{ padding: "0 8px 16px" }} justify="center">
        <Col xs={24} md={14} lg={12}>
          <Card bordered style={{ borderRadius: 12 }}>
            <Title level={4} style={{ marginTop: 0 }}>รายละเอียดคำสั่งซื้อ</Title>
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="รหัสคำสั่งซื้อ">
                <Input value={orderCode} onChange={(e) => setOrderCode(e.target.value)} placeholder="เช่น ODR-2025-0001" />
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
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น โอนจากบัญชี xxx" />
              </Descriptions.Item>
            </Descriptions>

            <Space style={{ marginTop: 16 }} wrap>
              <Button type="primary" icon={<QrcodeOutlined />} loading={generating} onClick={handleGenerateQR}>
                สร้าง QR PromptPay
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleClearQR}>ล้าง QR</Button>
              <Button loading={verifying} onClick={handleVerifyPayment}>ตรวจสถานะการชำระ</Button>
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
