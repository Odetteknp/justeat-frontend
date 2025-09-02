import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Space, Typography, Popconfirm, message, Modal, Form, Input, Select, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CameraOutlined } from '@ant-design/icons';
import './admin_promotion.css';

const { Title, Text } = Typography;
const { Option } = Select;

// กำหนดประเภทข้อมูล (Interface) สำหรับโปรโมชั่น
// Interface นี้จะตรงกับข้อมูลที่ได้รับจาก Go Backend
interface PromotionItem {
  ID?: number;
  Promo_code: string;
  Promo_detail: string;
  Value: number;
  Min_order: number;
  Start_at: string;
  End_at: string;
  Admin_id: number;
  Promo_type_id: number;
  Picture: string | null;
}

const PromotionManagementPage: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionItem | null>(null);
  const [form] = Form.useForm();
  
  // State สำหรับ URL ของรูปภาพเพื่อใช้แสดงผลบนหน้าจอ
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  
  // State สำหรับไฟล์รูปภาพจริงเพื่อใช้ส่งไปยัง Go Backend
  const [pictureFile, setPictureFile] = useState<File | null>(null);

  const apiUrl = 'http://localhost:8080/api/promotions';
  const loggedInAdminId = 1;

  // ฟังก์ชันจำลองการดึงข้อมูลจาก API
  const fetchPromotions = async () => {
    const mockData: PromotionItem[] = [
      {
        ID: 1,
        Promo_code: 'SALE20',
        Promo_detail: 'ส่วนลด 20% สำหรับทุกออเดอร์',
        Promo_type_id: 2,
        Value: 20,
        Min_order: 100,
        Start_at: '2025-08-01',
        End_at: '2025-08-31',
        Admin_id: loggedInAdminId,
        Picture: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=SALE20',
      },
      {
        ID: 2,
        Promo_code: 'FIXED50',
        Promo_detail: 'ส่วนลด 50 บาท เมื่อสั่งครบ 300 บาท',
        Promo_type_id: 1,
        Value: 50,
        Min_order: 300,
        Start_at: '2025-09-01',
        End_at: '2025-09-15',
        Admin_id: loggedInAdminId,
        Picture: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=FIXED50',
      },
    ];
    setPromotions(mockData);
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleAddNew = () => {
    setEditingPromotion(null);
    form.resetFields();
    setPictureUrl(null);
    setPictureFile(null);
    setIsModalVisible(true);
  };

  const handleEdit = (promotion: PromotionItem) => {
    setEditingPromotion(promotion);
    const promoTypeString = promotion.Promo_type_id === 1 ? 'fixed' : 'percentage';
    form.setFieldsValue({ ...promotion, promo_type: promoTypeString });
    setPictureUrl(promotion.Picture || null);
    // ไม่สามารถตั้งค่า pictureFile ได้จาก URL ที่เป็น string
    setPictureFile(null); 
    setIsModalVisible(true);
  };

  const handleDelete = (promoId: number | undefined) => {
    setPromotions(promotions.filter(promo => promo.ID !== promoId));
    message.success('ลบโปรโมชั่นเรียบร้อยแล้ว!');
  };

  const handleSave = () => {
  form.validateFields()
    .then(async (values) => {
      // แปลงค่า promo_type string จากฟอร์ม กลับเป็น Promo_type_id number
      const promo_type_id = values.promo_type === 'fixed' ? 1 : 2;

      // สร้าง FormData เพื่อส่งข้อมูลไป Go Backend
      const formData = new FormData();
      formData.append('Promo_code', values.promo_code);
      formData.append('Promo_detail', values.promo_detail);
      formData.append('Value', values.value.toString());
      formData.append('Min_order', values.min_order.toString());
      formData.append('Start_at', values.start_at);
      formData.append('End_at', values.end_at);
      formData.append('Admin_id', loggedInAdminId.toString());
      formData.append('Promo_type_id', promo_type_id.toString());
      
      // เพิ่มไฟล์รูปภาพลงใน FormData
      if (pictureFile) {
        formData.append('Picture', pictureFile);
      }

      // กำหนด URL และ Method
      const requestUrl = editingPromotion 
        ? `${apiUrl}/${editingPromotion.ID}` 
        : apiUrl;
      const requestMethod = editingPromotion ? 'PUT' : 'POST';

      try {
        // ส่งข้อมูล FormData ไปยัง Go Backend
        const response = await fetch(requestUrl, {
          method: requestMethod,
          body: formData,
        });

        if (response.ok) {
          message.success(editingPromotion ? 'แก้ไขโปรโมชั่นเรียบร้อยแล้ว!' : 'เพิ่มโปรโมชั่นใหม่เรียบร้อยแล้ว!');
          setIsModalVisible(false);
          setEditingPromotion(null);
          setPictureUrl(null);
          setPictureFile(null);
          // หลังจากบันทึกสำเร็จ ให้เรียก fetchPromotions() เพื่อดึงข้อมูลล่าสุด
          fetchPromotions(); 
        } else {
          // หากมีข้อผิดพลาดจากเซิร์ฟเวอร์
          const errorData = await response.json();
          message.error(`เกิดข้อผิดพลาด: ${errorData.message}`);
        }
      } catch (error) {
        // หากเกิดข้อผิดพลาดด้านเครือข่าย
        console.error('Network or server error:', error);
        message.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      }
    })
    .catch(info => {
      console.log('Validate Failed:', info);
      // หากมีการตรวจสอบข้อมูลไม่ผ่าน
    });
};
  const handlePictureUpload = (file: File) => {
    // เก็บไฟล์จริงไว้ใน state เพื่อใช้ส่งไปยัง Backend
    setPictureFile(file);

    // สร้าง Data URL เพื่อใช้แสดงผลบนหน้าจอ
    const reader = new FileReader();
    reader.onload = () => {
      setPictureUrl(reader.result as string);
      message.success('อัปโหลดรูปภาพสำเร็จ');
    };
    reader.onerror = () => {
      message.error('อัปโหลดรูปภาพไม่สำเร็จ');
    };
    reader.readAsDataURL(file);

    // คืนค่า false เพื่อป้องกันไม่ให้อัปโหลดไฟล์ทันที
    return false;
  };

  const formPromoType = Form.useWatch('promo_type', form);

  return (
    <div className="promo-management-container">
      <div className="promo-management-header">
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={handleAddNew}
        >
          เพิ่มโปรโมชั่นใหม่
        </Button>
      </div>
      <Space direction="vertical" size="middle" className="promo-list">
        {promotions.map((promo) => (
          <Card key={promo.ID} className="promo-card">
            <Row align="middle" justify="space-between">
              <Col span={18}>
                <Space align="start">
                  <img src={promo.Picture || 'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=No+Image'} alt={promo.Promo_code} className="promo-card-image" />
                  <div>
                    <Text strong className="promo-name">{promo.Promo_code}</Text>
                    <br />
                    <Text type="secondary">
                      รายละเอียด: {promo.Promo_detail}
                      <br />
                      ประเภท: {promo.Promo_type_id === 1 ? 'ลดเป็นค่าคงที่' : 'ลดเป็นเปอร์เซ็นต์'}
                      <br />
                      ส่วนลด: {promo.Value} {promo.Promo_type_id === 1 ? 'บาท' : '%'}
                      <br />
                      สั่งขั้นต่ำ: {promo.Min_order} บาท
                      <br />
                      เริ่ม: {promo.Start_at}
                      <br />
                      สิ้นสุด: {promo.End_at}
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col span={6} style={{ textAlign: 'right' }}>
                <Space>
                  <Button 
                    type="text" 
                    icon={<EditOutlined style={{ color: '#faad14' }} />} 
                    onClick={() => handleEdit(promo)}
                  >
                    แก้ไข
                  </Button>
                  <Popconfirm
                    title="ยืนยันการลบโปรโมชั่น?"
                    description={`คุณต้องการลบโปรโมชั่น "${promo.Promo_code}" ใช่หรือไม่?`}
                    onConfirm={() => handleDelete(promo.ID)}
                    okText="ใช่"
                    cancelText="ไม่"
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                    >
                      ลบ
                    </Button>
                  </Popconfirm>
                </Space>
              </Col>
            </Row>
          </Card>
        ))}
      </Space>

      <Modal
        title={editingPromotion ? 'แก้ไขโปรโมชั่น' : 'เพิ่มโปรโมชั่นใหม่'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            ยกเลิก
          </Button>,
          <Button key="submit" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            บันทึก
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="promo_form"
        >
          <Form.Item
            name="promo_code"
            label="Promo Code"
            rules={[{ required: true, message: 'กรุณากรอกรหัสโปรโมชั่น!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="promo_detail"
            label="รายละเอียดโปรโมชั่น"
            rules={[{ required: true, message: 'กรุณากรอกรายละเอียดโปรโมชั่น!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="promo_type"
            label="ประเภทส่วนลด"
            rules={[{ required: true, message: 'กรุณาเลือกประเภทส่วนลด!' }]}
          >
            <Select>
              <Option value="fixed">ลดเป็นค่าคงที่</Option>
              <Option value="percentage">ลดเป็นเปอร์เซ็นต์</Option>
            </Select>
          </Form.Item>

          {formPromoType && (
            <Form.Item
              name="value"
              label={formPromoType === 'fixed' ? 'มูลค่าส่วนลด (บาท)' : 'มูลค่าส่วนลด (%)'}
              rules={[
                { required: true, message: 'กรุณากรอกมูลค่าส่วนลด!' },
                {
                  validator: (_, value) => {
                    if (formPromoType === 'percentage' && (value < 1 || value > 100)) {
                      return Promise.reject(new Error('เปอร์เซ็นต์ส่วนลดต้องอยู่ระหว่าง 1-100!'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input type="number" />
            </Form.Item>
          )}

          <Form.Item
            label="รูปภาพคูปอง"
          >
            <Upload 
              name="picture" 
              listType="picture-card" 
              showUploadList={false}
              beforeUpload={handlePictureUpload}
            >
              {pictureUrl ? (
                <img src={pictureUrl} alt="coupon preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="upload-placeholder">
                  <CameraOutlined style={{ fontSize: '2em', color: '#FE7018' }} />
                  <div style={{ marginTop: 8 }}>อัปโหลด</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="min_order"
            label="ยอดสั่งซื้อขั้นต่ำ"
            rules={[{ required: true, message: 'กรุณากรอกยอดสั่งซื้อขั้นต่ำ!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="start_at"
            label="วันที่เริ่ม"
            rules={[{ required: true, message: 'กรุณาเลือกวันที่เริ่ม!' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="end_at"
            label="วันที่สิ้นสุด"
            rules={[
              {
                required: true,
                message: 'กรุณาเลือกวันที่สิ้นสุด!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startAt = getFieldValue('start_at');
                  if (!value || !startAt || new Date(value) >= new Date(startAt)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มโปรโมชั่น!'));
                },
              }),
            ]}
          >
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionManagementPage;