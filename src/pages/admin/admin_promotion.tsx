import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Space, Typography, Popconfirm, message, Modal, Form, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import './admin_promotion.css';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

const { Text } = Typography;
const { Option } = Select;

interface PromotionItem {
  ID?: number;
  promoCode: string;
  promoDetail: string;
  values: number;
  minOrder: number;
  startAt: string;
  endAt: string;
  adminId?: number;
  promoTypeId: number;
  PromoType?: {
    ID: number;
    TypeName: string;
  }
}

const PromotionManagementPage: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionItem | null>(null);
  const [form] = Form.useForm();
  
  const apiUrl = 'http://localhost:8000/admin/promotion';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTY5NjQ5MjksImlhdCI6MTc1NjcwNTcyOSwicm9sZSI6ImFkbWluIiwidXNlcklkIjoxfQ.iTWHPihFc_00gEymQpQ3e36zzYQo1q2bBrnJRf9ZH5o';
  
  const fetchPromotions = async () => {
    try {
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch promotions');
      }

      const data = await response.json();
      let promotionsList: PromotionItem[] = [];
      if (data.items && Array.isArray(data.items)) {
        promotionsList = data.items;
      } else if (Array.isArray(data)) {
        promotionsList = data;
      } else {
        throw new Error('Invalid data format received from API');
      }

      const formattedPromotions = promotionsList.map(promo => {
        if (!promo.PromoType || !promo.PromoType.TypeName) {
          return {
            ...promo,
            PromoType: {
              ID: promo.promoTypeId,
              TypeName: promo.promoTypeId === 1 ? 'Discount' : 'Percent' 
            }
          };
        }
        return promo;
      });

      setPromotions(formattedPromotions);
      
    } catch (error) {
      console.error('Error fetching promotions:', error);
      message.error('ไม่สามารถดึงข้อมูลโปรโมชั่นได้');
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleAddNew = () => {
    setEditingPromotion(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (promotion: PromotionItem) => {
    setEditingPromotion(promotion);
    const promoTypeString = promotion.PromoType?.TypeName || (promotion.promoTypeId === 1 ? 'Discount' : 'Percent');
    
    form.setFieldsValue({
      promoCode: promotion.promoCode,
      promoDetail: promotion.promoDetail,
      values: promotion.values,
      minOrder: promotion.minOrder,
      startAt: promotion.startAt ? dayjs(promotion.startAt) : null,
      endAt: promotion.endAt ? dayjs(promotion.endAt) : null,
      promo_type: promoTypeString,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (promoId: number | undefined) => {
    if (!promoId) return;

    try {
      const response = await fetch(`${apiUrl}/${promoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        message.success('ลบโปรโมชั่นเรียบร้อยแล้ว!');
        fetchPromotions();
      } else {
        const errorData = await response.json();
        message.error(`เกิดข้อผิดพลาด: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Network or server error:', error);
      message.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };

  const onFinish = async (values: any) => {
    const promoTypeID = values.promo_type === 'Discount' ? 1 : 2;

    const requestBody = {
      promoCode: values.promoCode,
      promoDetail: values.promoDetail,
      values: values.values,
      minOrder: values.minOrder,
      startAt: values.startAt ? values.startAt.toISOString() : null,
      endAt: values.endAt ? values.endAt.toISOString() : null,
      promoTypeId: promoTypeID,
    };

    const requestUrl = editingPromotion
      ? `${apiUrl}/${editingPromotion.ID}`
      : apiUrl;
    const requestMethod = editingPromotion ? 'PUT' : 'POST';

    try {
      const response = await fetch(requestUrl, {
        method: requestMethod,
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        message.success(editingPromotion ? 'แก้ไขโปรโมชั่นเรียบร้อยแล้ว!' : 'เพิ่มโปรโมชั่นใหม่เรียบร้อยแล้ว!');
        setIsModalVisible(false);
        setEditingPromotion(null);
        fetchPromotions();
      } else {
        const errorData = await response.json();
        message.error(`เกิดข้อผิดพลาด: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Network or server error:', error);
      message.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
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
                  <img src={'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=No+Image'} alt={promo.promoCode} className="promo-card-image" />
                  <div>
                    <Text strong className="promo-name">{promo.promoCode}</Text>
                    <br />
                    <Text type="secondary">
                      รายละเอียด: {promo.promoDetail}
                      <br />
                      ประเภท: {promo.PromoType?.TypeName || (promo.promoTypeId === 1 ? 'ลดเป็นค่าคงที่' : 'ลดเป็นเปอร์เซ็นต์')}
                      <br />
                      ส่วนลด: {promo.values} {promo.promoTypeId === 1 ? 'บาท' : '%'}
                      <br />
                      สั่งขั้นต่ำ: {promo.minOrder} บาท
                      <br />
                      เริ่ม: {promo.startAt ? promo.startAt.split('T')[0] : 'N/A'}
                      <br />
                      สิ้นสุด: {promo.endAt ? promo.endAt.split('T')[0] : 'N/A'}
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
                    description={`คุณต้องการลบโปรโมชั่น "${promo.promoCode}" ใช่หรือไม่?`}
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
          <Button key="submit" type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
            บันทึก
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="promo_form"
          onFinish={onFinish}
        >
          <Form.Item
            name="promoCode" 
            label="Promo Code"
            rules={[{ required: true, message: 'กรุณากรอกรหัสโปรโมชั่น!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="promoDetail"
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
              <Option value="Discount">ลดเป็นค่าคงที่</Option>
              <Option value="Percent">ลดเป็นเปอร์เซ็นต์</Option>
            </Select>
          </Form.Item>

          {formPromoType && (
            <Form.Item
              name="values" 
              label={formPromoType === 'Discount' ? 'มูลค่าส่วนลด (บาท)' : 'มูลค่าส่วนลด (%)'}
              rules={[
                { required: true, message: 'กรุณากรอกมูลค่าส่วนลด!' },
                {
                  validator: (_, value) => {
                    if (formPromoType === 'Percent' && (value < 1 || value > 100)) {
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
            name="startAt" 
            label="วันที่เริ่ม"
            rules={[{ required: true, message: 'กรุณาเลือกวันที่เริ่ม!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="endAt" 
            label="วันที่สิ้นสุด"
            rules={[
              {
                required: true,
                message: 'กรุณาเลือกวันที่สิ้นสุด!',
              },
              ({ getFieldValue }) => ({
                validator(_, value: Dayjs) {
                  const startAt: Dayjs = getFieldValue('startAt');
                  if (!value || !startAt || value.isSameOrAfter(startAt, 'day')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มโปรโมชั่น!'));
                },
              }),
            ]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionManagementPage;