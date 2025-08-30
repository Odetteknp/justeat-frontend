import { PlusOutlined } from '@ant-design/icons';
import { Form, Upload, Select, Input, Button } from 'antd';
import './RestaurantPage.css';

const { Option } = Select;
const { TextArea } = Input;
const normFile = (e: any) => Array.isArray(e) ? e : e?.fileList;

const Restaurant = () => {
  return (
    <div className="form-wrapper">
      
        <Form layout="vertical" style={{ width: '100%' }}>
          <Form.Item
            label="Add Photo"
            name="upload"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            className="form-item"
          >
            <div className="upload-wrapper">
              <Upload action="/upload.do" listType="picture-card" maxCount={5}>
                <div className="upload-btn">
                  <PlusOutlined />
                  <div className="upload-text">Upload Now!</div>
                </div>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            className="form-item"
            rules={[{ required: true, message: 'กรุณาเลือกสถานะ' }]}
          >
            <Select placeholder="Status" className="input-field">
              <Option value="1">เปิด</Option>
              <Option value="2">ปิด</Option>
              <Option value="3">ปิดชั่วคราว</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Restaurant's Name"
            name="name"
            className="form-item"
            rules={[{ required: true, message: 'กรุณากรอกชื่อร้าน' }]}
          >
            <Input className="input-field" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            className="form-item"
            rules={[{ required: true, message: 'กรุณากรอกประเภท' }]}
          >
            <Input className="input-field" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            className="form-item"
            rules={[{ required: true, message: 'กรุณากรอกรายละเอียด' }]}
          >
            <TextArea rows={5} className="input-field" />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            className="form-item"
            rules={[{ required: true, message: 'กรุณากรอกที่อยู่' }]}
          >
            <TextArea rows={5} className="input-field" />
          </Form.Item>

          <Form.Item className="form-submit-item">
            <Button type="primary" htmlType="submit" className="submit-button">
              SUBMIT
            </Button>
          </Form.Item>
        </Form>
      
    </div>
  );
};

export default Restaurant;
