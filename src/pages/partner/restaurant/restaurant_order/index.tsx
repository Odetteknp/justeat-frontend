// src/pages/HomePage/HomePage.tsx
import React, { useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  message,
} from 'antd';
import './index.css';
import dayjs from 'dayjs';

const { Option } = Select;

interface FoodItem {
  name: string;
  quantity: number;
  price: number;
  detail?: string;
}

interface Order {
  id: number;
  orderId: string;
  customerName: string;
  items: FoodItem[];
  status: string;
  time: string;
}

const initialOrders: Order[] = [
  {
    id: 1,
    orderId : 'JustEat-1001',
    customerName: 'ชะเอม',
    items: [
      { name: 'ข้าวผัดกะเพราทะเล', quantity: 1, price: 60, detail: 'เผ็ดมาก' },
      { name: 'น้ำเปล่า', quantity: 1, price: 20 },
    ],
    status: 'กำลังจัดเตรียม',
    time: '2025-08-25 14:30',
  },
  {
    id: 2,
    orderId : 'JustEat-1002',
    customerName: 'โกวิท',
    items: [
      { name: 'ผัดไทยกุ้งสด', quantity: 1, price: 60, detail: 'ไม่ใส่ถั่วงอก' },
      { name: 'โค้ก', quantity: 2, price: 18 },
    ],
    status: 'รอดำเนินการ',
    time: '2025-08-25 14:45',
  },
];

const HomePage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form] = Form.useForm();

  const showModal = (order?: Order) => {
    if (order) {
      form.setFieldsValue({
        ...order,
        time: dayjs(order.time),
      });
      setEditingOrder(order);
    } else {
      form.resetFields();
      setEditingOrder(null);
    }
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const formattedTime = values.time.format('YYYY-MM-DD HH:mm');

      const newOrderData: Order = {
        id: editingOrder ? editingOrder.id : Date.now(),
        orderId: values.orderId,
        customerName: values.customerName,
        items: values.items,
        status: values.status,
        time: formattedTime,
      };

      if (editingOrder) {
        setOrders(prev =>
          prev.map(order =>
            order.id === editingOrder.id ? newOrderData : order
          )
        );
        message.success('แก้ไขออเดอร์เรียบร้อยแล้ว');
      } else {
        setOrders(prev => [...prev, newOrderData]);
        message.success('เพิ่มออเดอร์ใหม่เรียบร้อยแล้ว');
      }

      setIsModalOpen(false);
    });
  };

  const handleDelete = (id: number) => {
    setOrders(prev => prev.filter(order => order.id !== id));
    message.success('ลบออเดอร์เรียบร้อยแล้ว');
  };

  const confirmOrder = (id: number) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, status: 'สำเร็จ' } : order
      )
    );
    message.success('ยืนยันคำสั่งซื้อเรียบร้อยแล้ว');
  };

  return (
    <div className="order-page" style={{ padding: 24 }}>
      <div
        className="order-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h2>รายการคำสั่งซื้อ </h2> 
        
      </div>

      <div className="order-list">
        {orders.map(order => (
          <Card
            key={order.id}
            title={`🧾 Order ID: ${order.orderId}`}
            className="order-card"
            style={{ marginBottom: 24 }}
            extra={
              <Space>
                {order.status !== 'สำเร็จ' && (
                  <>
                    <Button type="link" onClick={() => showModal(order)}>
                      แก้ไข
                    </Button>
                    <Popconfirm
                      title="คุณแน่ใจว่าต้องการลบออเดอร์นี้?"
                      onConfirm={() => handleDelete(order.id)}
                    >
                      <Button type="link" danger>
                        ลบ
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title="ยืนยันคำสั่งซื้อนี้ใช่หรือไม่?"
                      onConfirm={() => confirmOrder(order.id)}
                    >
                      <Button type="primary">ยืนยันคำสั่งซื้อ</Button>
                    </Popconfirm>
                  </>
                )}
              </Space>
            }
          >
            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="ชื่อลูกค้า">{order.customerName}</Descriptions.Item>
            </Descriptions>

            <Table
              dataSource={order.items.map((item, index) => ({ ...item, key: index }))}
              pagination={false}
              size="small"
              bordered
              columns={[
                {
                  title: 'รายการอาหาร',
                  dataIndex: 'name',
                  key: 'name',
                  width: '30%',
                },
                {
                  title: 'รายละเอียด',
                  dataIndex: 'detail',
                  key: 'detail',
                  width: '30%',
                  render: text => text || '-',
                },
                {
                  title: 'จำนวน',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: '10%',
                },
                {
                  title: 'ราคาต่อหน่วย (บาท)',
                  dataIndex: 'price',
                  key: 'price',
                  width: '15%',
                  render: (price: number) => price.toLocaleString(),
                },
                {
                  title: 'ราคารวม (บาท)',
                  key: 'total',
                  width: '15%',
                  render: (_, record: FoodItem) =>
                    (record.price * record.quantity).toLocaleString(),
                },
              ]}
            />

            <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="ราคารวมทั้งหมด">
                {order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()} บาท
              </Descriptions.Item>
              <Descriptions.Item label="สถานะ">{order.status}</Descriptions.Item>
              <Descriptions.Item label="เวลาสั่ง">{order.time}</Descriptions.Item>
            </Descriptions>
          </Card>
        ))}
      </div>

      <Modal
        title={editingOrder ? 'แก้ไขออเดอร์' : 'เพิ่มออเดอร์ใหม่'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Order ID"
            name="orderId"
            rules={[{ required: true, message: 'กรุณากรอก Order ID' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="ชื่อลูกค้า"
            name="customerName"
            rules={[{ required: true, message: 'กรุณากรอกชื่อลูกค้า' }]}
          >
            <Input />
          </Form.Item>

          <Form.List
            name="items"
            rules={[
              {
                validator: async (_, items) => {
                  if (!items || items.length < 1) {
                    return Promise.reject(new Error('กรุณาเพิ่มรายการอาหารอย่างน้อย 1 รายการ'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="start" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: 'กรุณากรอกชื่ออาหาร' }]}
                      style={{ flex: 2 }}
                    >
                     <Input placeholder="ชื่ออาหาร" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'detail']}
                      style={{ flex: 3 }}
                    >
                      <Input placeholder="รายละเอียดเพิ่มเติม (เช่น เผ็ดน้อย, ไม่ใส่ถั่ว)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'กรุณากรอกจำนวน' }]}
                      style={{ flex: 1 }}
                    >
                      <Input type="number" placeholder="จำนวน" min={1} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      rules={[{ required: true, message: 'กรุณากรอกราคา' }]}
                      style={{ flex: 1 }}
                    >
                      <Input type="number" placeholder="ราคา" min={0} />
                    </Form.Item>
                    <Button danger type="link" onClick={() => remove(name)}>
                      ลบ
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + เพิ่มเมนูอาหาร
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            label="สถานะ"
            name="status"
            rules={[{ required: true, message: 'กรุณาเลือกสถานะ' }]}
          >
            <Select>
              <Option value="รอดำเนินการ">รอดำเนินการ</Option>
              <Option value="กำลังจัดเตรียม">กำลังจัดเตรียม</Option>
              <Option value="สำเร็จ">สำเร็จ</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="เวลา"
            name="time"
            rules={[{ required: true, message: 'กรุณาเลือกเวลา' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HomePage;

