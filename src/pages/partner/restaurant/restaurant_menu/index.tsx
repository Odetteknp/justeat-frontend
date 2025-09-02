import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Space, Typography, Popconfirm, message, Modal, Form, Input, Select, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CameraOutlined } from '@ant-design/icons';
import './index.css';

const { Title, Text } = Typography;
const { Option } = Select;

// กำหนดประเภทข้อมูล (Interface) สำหรับเมนูอาหาร
interface MenuItem {
  id?: string;
  name: string;
  restaurant: string;
  description: string;
  price: string;
  status: 'พร้อมขาย' | 'หมดชั่วคราว';
  picture?: string;
}

const MenuManagementPage: React.FC = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [form] = Form.useForm();
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);

  // URL ของ Backend API
  const apiUrl = 'http://localhost:8080/api/menus'; // ตัวแปรนี้จะถูกใช้งานในฟังก์ชัน fetch ต่างๆ

  const loggedInRestaurantId = 'restaurant-123';

  // ฟังก์ชันจำลองการดึงข้อมูลจาก API
  const fetchMenus = async () => {
    // ในอนาคต: คุณจะใช้ตัวแปร apiUrl ที่นี่
    // เช่น: const response = await fetch(`${apiUrl}?restaurantId=${loggedInRestaurantId}`);
    // setMenus(await response.json());

    const mockData: MenuItem[] = [
      {
        id: '1',
        name: 'สเต็กเนื้อโคขุน',
        restaurant: loggedInRestaurantId,
        description: 'สเต็กเนื้อโคขุนย่างถ่าน เสิร์ฟพร้อมซอสพริกไทยดำ',
        price: '350',
        status: 'พร้อมขาย',
        picture: 'https://via.placeholder.com/150/FE7018/FFFFFF?text=Steak',
      },
      {
        id: '2',
        name: 'ข้าวผัดทะเล',
        restaurant: loggedInRestaurantId,
        description: 'ข้าวผัดหอมกลิ่นกระทะ พร้อมกุ้ง ปลาหมึก และหอยแมลงภู่',
        price: '150',
        status: 'หมดชั่วคราว',
        picture: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Fried+Rice',
      },
      {
        id: '3',
        name: 'ยำหมูกรอบ',
        restaurant: loggedInRestaurantId,
        description: 'หมูกรอบทอดใหม่ๆ คลุกเคล้ากับน้ำยำรสจัดจ้าน',
        price: '120',
        status: 'พร้อมขาย',
        picture: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Spicy+Salad',
      },
    ];
    setMenus(mockData);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleAddNew = () => {
    setEditingMenu(null);
    form.resetFields();
    setPictureUrl(null);
    setIsModalVisible(true);
  };

  const handleEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    form.setFieldsValue(menu);
    setPictureUrl(menu.picture || null);
    setIsModalVisible(true);
  };

  const handleDelete = (menuId: string) => {
    // ในอนาคต: คุณจะใช้ตัวแปร apiUrl ที่นี่
    // เช่น: await fetch(`${apiUrl}/${menuId}`, { method: 'DELETE' });
    setMenus(menus.filter(menu => menu.id !== menuId));
    message.success('ลบเมนูเรียบร้อยแล้ว!');
  };

  const handleSave = () => {
    form.validateFields()
      .then(async (values) => {
        const menuDataToSave = {
          ...values,
          id: editingMenu ? editingMenu.id : String(Date.now()),
          restaurant: loggedInRestaurantId,
          picture: pictureUrl,
        };

        if (editingMenu) {
          // ในอนาคต: คุณจะใช้ตัวแปร apiUrl ที่นี่
          // เช่น: await fetch(`${apiUrl}/${menuDataToSave.id}`, { method: 'PUT', body: JSON.stringify(menuDataToSave) });
          setMenus(menus.map(menu => (menu.id === menuDataToSave.id ? menuDataToSave : menu)));
          message.success('แก้ไขเมนูเรียบร้อยแล้ว!');
        } else {
          // ในอนาคต: คุณจะใช้ตัวแปร apiUrl ที่นี่
          // เช่น: await fetch(apiUrl, { method: 'POST', body: JSON.stringify(menuDataToSave) });
          setMenus([...menus, menuDataToSave]);
          message.success('เพิ่มเมนูใหม่เรียบร้อยแล้ว!');
        }

        setIsModalVisible(false);
        setEditingMenu(null);
        setPictureUrl(null);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handlePictureUpload = (file: any) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPictureUrl(reader.result as string);
      message.success('อัปโหลดรูปภาพสำเร็จ');
    };
    reader.onerror = () => {
      message.error('อัปโหลดรูปภาพไม่สำเร็จ');
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div className="menu-management-container">
      <div className="menu-management-header">
        <Title level={2}>จัดการเมนูอาหาร</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={handleAddNew}
        >
          เพิ่มเมนูใหม่
        </Button>
      </div>
      <Space direction="vertical" size="middle" className="menu-list">
        {menus.map((menu) => (
          <Card key={menu.id} className="menu-card">
            <Row align="middle" justify="space-between">
              <Col span={18}>
                <Space align="start">
                  <img src={menu.picture || 'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=No+Image'} alt={menu.name} className="menu-card-image" />
                  <div>
                    <Text strong className="menu-name">{menu.name}</Text>
                    <br />
                    <Text type="secondary">
                      ร้าน: {menu.restaurant}
                      <br />
                      รายละเอียด: {menu.description}
                      <br />
                      ราคา: {menu.price}
                      <br />
                      สถานะ: {menu.status}
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col span={6} style={{ textAlign: 'right' }}>
                <Space>
                  <Button 
                    type="text" 
                    icon={<EditOutlined style={{ color: '#faad14' }} />} 
                    onClick={() => handleEdit(menu)}
                  >
                    แก้ไข
                  </Button>
                  <Popconfirm
                    title="ยืนยันการลบเมนู?"
                    description={`คุณต้องการลบเมนู "${menu.name}" ใช่หรือไม่?`}
                    onConfirm={() => handleDelete(menu.id as string)}
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
        title={editingMenu ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
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
          name="menu_form"
        >
          <Form.Item
            name="name"
            label="ชื่อเมนู"
            rules={[{ required: true, message: 'กรุณากรอกชื่อเมนู!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="รายละเอียด"
            rules={[{ required: true, message: 'กรุณากรอกรายละเอียด!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="price"
            label="ราคา"
            rules={[{ required: true, message: 'กรุณากรอกราคา!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="สถานะ"
            rules={[{ required: true, message: 'กรุณาเลือกสถานะ!' }]}
          >
            <Select>
              <Option value="พร้อมขาย">พร้อมขาย</Option>
              <Option value="หมดชั่วคราว">หมดชั่วคราว</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="รูปภาพเมนู"
          >
            <Upload 
              name="picture" 
              listType="picture-card" 
              showUploadList={false}
              beforeUpload={handlePictureUpload}
            >
              {pictureUrl ? (
                <img src={pictureUrl} alt="menu preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="upload-placeholder">
                  <CameraOutlined style={{ fontSize: '2em', color: '#FE7018' }} />
                  <div style={{ marginTop: 8 }}>อัปโหลด</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagementPage;