import { Layout, Card, Form, Select, Input, Button, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './ReportPage.css';
import { useState } from 'react';

const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const issueTypeMap: Record<number, string> = {
  1: "ได้รับอาหารไม่ครบ",
  2: "จัดส่งล่าช้า",
  3: "ระบบล่ม",
  4: "อื่น ๆ"
};

const ReportPage = () => {
  const [form] = Form.useForm();
  const [issues, setIssues] = useState<any[]>([]);

  const handleFinish = async (values: any) => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", values.name || "");
    formData.append("email", values.email || "");
    formData.append("phoneNumber", values.phoneNumber || "");
    formData.append("description", values.description || "");
    formData.append("issueTypeId", values.issueTypeId?.toString() || "");

    // แน่ใจว่า upload มีและเป็น array
    if (values.upload && Array.isArray(values.upload)) {
      values.upload.forEach((file: any) => {
        if (file.originFileObj) {
          formData.append("pictures", file.originFileObj);  // ชื่อ field ต้องตรงกับ backend
        }
      });
    }

    try {
      const response = await fetch("http://localhost:8000/reports", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // หลีกเลี่ยงการตั้ง Content-Type เพราะ browser ตั้งให้เอง
        },
        body: formData,
      });

      if (response.ok) {
        alert("รายงานปัญหาเรียบร้อยค่ะ");
        form.resetFields();
        setIssues(prev => [...prev, values]);
      } else {
        const data = await response.json();
        alert("เกิดข้อผิดพลาด: " + (data.error || "ไม่ทราบสาเหตุ"));
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการส่งรายงาน");
    }
  };

  return (
    <Layout>
      <Content className="content">
        <Card className="card-title">
          <p className='card-heading'>Tell us what’s wrong</p>
        </Card>

        <Card className="card-report">
          <Form layout="vertical" form={form} onFinish={handleFinish}>
            <Form.Item label="Title" name="issueTypeId" rules={[{ required: true, message: "กรุณาเลือกหัวข้อ" }]}>
              <Select placeholder="Select title" className="input-field">
                {Object.entries(issueTypeMap).map(([id, name]) => (
                  <Option key={id} value={Number(id)}>{name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Description" name="description" rules={[{ required: true, message: "กรุณากรอกคำอธิบายปัญหา" }]}>
              <TextArea rows={5} />
            </Form.Item>

            <Form.Item label="Add Photo" name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload listType="picture-card" maxCount={5} beforeUpload={() => false /* prevent auto upload */}>
                <div>
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
              <Button type="primary" htmlType="submit" className="submit-button">
                SUBMIT
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {issues.length > 0 && (
          <Card className="card-report" style={{ marginTop: 20 }}>
            <h3>Issue Report</h3>
            {issues.map((issue, index) => (
              <div key={index}>
                <strong>Title:</strong> {issueTypeMap[issue.issueTypeId]} |
                <strong> Description:</strong> {issue.description}
              </div>
            ))}
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default ReportPage;