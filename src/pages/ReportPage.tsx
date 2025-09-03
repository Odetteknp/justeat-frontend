import { useEffect, useState } from "react";
import { Layout, Card, Form, Select, Input, Button, Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { reports, type Report } from "../services/reports";
import "./ReportPage.css";

const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;


const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList);

const issueTypeMap: Record<number, string> = {
  1: "ได้รับอาหารไม่ครบ",
  2: "จัดส่งล่าช้า",
  3: "ระบบล่ม",
  4: "อื่น ๆ",
};

const ReportPage = () => {
  const [form] = Form.useForm();
  const [reportsData, setReportsData] = useState<Report[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // โหลดรายงานทั้งหมดตอนเปิดหน้า
  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const res = await reports.list();
        setReportsData(res.data.reports);
      } catch (e: any) {
        message.error(e?.response?.data?.error || "โหลดรายงานไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  // submit form → POST /reports
  const handleFinish = async (values: any) => {
    const formData = new FormData();
    formData.append("name", values.name || "");
    formData.append("email", values.email || "");
    formData.append("phoneNumber", values.phoneNumber || "");
    formData.append("description", values.description || "");
    formData.append("issueTypeId", values.issueTypeId?.toString() || "");

    if (values.upload && Array.isArray(values.upload)) {
      values.upload.forEach((file: any) => {
        if (file.originFileObj) {
          formData.append("pictures", file.originFileObj);
        }
      });
    }

    try {
      setSubmitting(true);
      await reports.create(formData);
      message.success("รายงานปัญหาเรียบร้อยค่ะ");

      form.resetFields();
      // reload list หลัง submit
      const res = await reports.list();
      setReportsData(res.data.reports);
    } catch (e: any) {
      message.error(e?.response?.data?.error || "บันทึกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Content className="content">
        <Card className="card-title">
          <p className="card-heading">Tell us what’s wrong</p>
        </Card>

        <Card className="card-report">
          <Form layout="vertical" form={form} onFinish={handleFinish}>
            <Form.Item
              label="Title"
              name="issueTypeId"
              rules={[{ required: true, message: "กรุณาเลือกหัวข้อ" }]}
            >
              <Select placeholder="Select title" className="input-field">
                {Object.entries(issueTypeMap).map(([id, name]) => (
                  <Option key={id} value={Number(id)}>{name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "กรุณากรอกคำอธิบายปัญหา" }]}
            >
              <TextArea rows={5} />
            </Form.Item>

            <Form.Item
              label="Add Photo"
              name="upload"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload listType="picture-card" maxCount={5} beforeUpload={() => false}>
                <button>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload Now!</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item label="Name" name="name">
              <Input className="input-field" />
            </Form.Item>

            <Form.Item label="Email" name="email">
              <Input className="input-field" />
            </Form.Item>

            <Form.Item label="Phone Number" name="phoneNumber">
              <Input className="input-field" />
            </Form.Item>

            <Form.Item className="form-submit-item">
              <Button
                type="primary"
                htmlType="submit"
                className="submit-button"
                loading={submitting}
              >
                SUBMIT
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card className="card-report" style={{ marginTop: 20 }}>
          <h3>Issue Report</h3>
          {loading ? (
            <p>กำลังโหลด...</p>
          ) : reportsData.length > 0 ? (
            reportsData.map((issue) => (
              <div key={issue.id}>
                <strong>Title:</strong> {issueTypeMap[issue.issueTypeId]} |{" "}
                <strong>Description:</strong> {issue.description}
              </div>
            ))
          ) : (
            <p>ยังไม่มีรายงาน</p>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default ReportPage;