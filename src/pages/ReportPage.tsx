import { Layout, Card, Form, Select, Input, Button, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './ReportPage.css';
import { useState } from 'react';

const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const normFile = (e: any) => Array.isArray(e) ? e : e?.fileList;

// Mapping id -> type_name
const issueTypeMap: Record<number, string> = {
  1: "ได้รับอาหารไม่ครบ",
  2: "จัดส่งล่าช้า",
  3: "ระบบล่ม",
  4: "อื่น ๆ"
};

const ReportPage = () => {
  const [form] = Form.useForm();
  const [issues, setIssues] = useState<any[]>([]); // สำหรับแสดง report

  const handleFinish = async (values: any) => {
    // แปลง upload เป็นชื่อไฟล์
    if (values.upload) {
      values.Photo = values.upload.map((f: any) => f.name).join(",");
    }
    delete values.upload;

    // เพิ่ม title จาก IssueTypeID
    values.Title = issueTypeMap[values.IssueTypeID];

    try {
      const response = await fetch("http://localhost:8081/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        alert("รายงานปัญหาเรียบร้อยค่ะ");
        form.resetFields();

        // สำหรับตัวอย่าง เพิ่ม issue ลง state เพื่อแสดง report
        setIssues(prev => [...prev, values]);
      } else {
        const data = await response.json();
        alert("เกิดข้อผิดพลาด: " + data.error);
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
            {/* Select ส่ง id แทนชื่อ */}
            <Form.Item label="Title" name="IssueTypeID" rules={[{ required: true, message: "กรุณาเลือกหัวข้อ" }]}>
              <Select placeholder="Select title" className="input-field">
                {Object.entries(issueTypeMap).map(([id, name]) => (
                  <Option key={id} value={Number(id)}>
                    {name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Description" name="Description" rules={[{ required: true, message: "กรุณากรอกคำอธิบายปัญหา" }]}>
              <TextArea rows={5} />
            </Form.Item>

            <Form.Item label="Add Photo" name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload listType="picture-card" maxCount={5}>
                <button type="button" className="upload-btn">
                  <PlusOutlined />
                  <div className="upload-text">Upload Now!</div>
                </button>
              </Upload>
            </Form.Item>

            <Form.Item label="Order ID" name="OrderID">
              <Input className="input-field" />
            </Form.Item>

            <Form.Item label="Name" name="Name">
              <Input className="input-field" />
            </Form.Item>

            <Form.Item label="Email" name="Email">
              <Input className="input-field" />
            </Form.Item>

            <Form.Item label="Phone Number" name="PhoneNumber">
              <Input className="input-field" />
            </Form.Item>

            <Form.Item className="form-submit-item">
              <Button type="primary" htmlType="submit" className="submit-button">
                SUBMIT
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* ตัวอย่างแสดง report */}
        {issues.length > 0 && (
          <Card className="card-report" style={{ marginTop: 20 }}>
            <h3>Issue Report</h3>
            {issues.map((issue, index) => (
              <div key={index}>
                <strong>OrderID:</strong> {issue.OrderID} | 
                <strong> Title:</strong> {issue.Title} | 
                <strong> Description:</strong> {issue.Description}
              </div>
            ))}
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default ReportPage;
