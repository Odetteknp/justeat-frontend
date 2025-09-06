import { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Modal,
  Table,
  Space,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { menu } from "../../../../services/menu";
import { auth } from "../../../../services/auth";
import { getToken } from "../../../../services/tokenStore";

// Map menuTypeId <-> label ภาษาไทย
const MENU_TYPES: Record<number, string> = {
  1: "เมนูหลัก",
  2: "ของทานเล่น",
  3: "ของหวาน",
  4: "เครื่องดื่ม",
};

export default function MenuManagementUI() {
  const [menus, setMenus] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const token = getToken();
  if (!token) {
    message.error("กรุณาเข้าสู่ระบบก่อน");
    return;
  }

  // โหลดเมนูจาก backend
  useEffect(() => {
    const load = async () => {
      try {
        const meRest = await auth.meRestaurant();
        console.log("meRest =", meRest);
        setRestaurantId(meRest.restaurant.ID);

        const res = await menu.listByRestaurant(meRest.restaurant.ID);
        setMenus(res.data.items);
      } catch (err: any) {
        message.error("โหลดร้านไม่สำเร็จ: " + err.message);
      }
    };
    load();
  }, []);

  if (!restaurantId) return <p>กำลังโหลดร้าน...</p>;

  // เปิด modal สร้างเมนู
  const openAddForm = () => {
    form.resetFields();
    setEditingId(null);
    setVisible(true);
  };

  // เปิด modal แก้ไข (set ค่า + preview รูปเก่า)
  const openEditForm = (record: any) => {
    form.setFieldsValue({
      name: record.menuName,
      price: record.price,
      type: record.menuTypeId,
      detail: record.detail,
      image: record.picture
        ? [
            {
              uid: "-1",
              name: "current-image.png",
              status: "done",
              url: record.picture,
            },
          ]
        : [],
    });
    setEditingId(record.id);
    setVisible(true);
  };

  // ลบเมนู
  const handleDelete = async (id: number) => {
    try {
      await menu.remove(id, token);
      setMenus(menus.filter((m) => m.id !== id));
      message.success("ลบเมนูสำเร็จ");
    } catch (err: any) {
      message.error("ลบเมนูล้มเหลว: " + err.message);
    }
  };

  // แปลงไฟล์ -> base64
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("ไม่สามารถแปลงไฟล์ได้"));
        }
      };
      reader.onerror = (err) => reject(err);
    });

  // บันทึกข้อมูล
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // handle image (AntD Upload -> fileList)
      let picture = "";
      if (values.image && values.image.length > 0) {
        const fileObj = values.image[0].originFileObj;
        if (fileObj) {
          picture = await toBase64(fileObj as File);
        } else if (values.image[0].url) {
          picture = values.image[0].url; // กรณีแก้ไขแล้วใช้รูปเก่า
        }
      }

      const payload = {
        menuName: values.name,
        price: values.price,
        detail: values.detail ?? "",
        picture: picture ?? "",
        menuTypeId: values.type,
        menuStatusId: 1,
      };

      setLoading(true);
      if (editingId) {
        await menu.update(editingId, payload, token);
        message.success("แก้ไขเมนูสำเร็จ");
      } else {
        await menu.create(restaurantId, payload, token);
        message.success("เพิ่มเมนูสำเร็จ");
      }

      const res = await menu.listByRestaurant(restaurantId);
      setMenus(res.data.items);
      setVisible(false);
      setLoading(false);
    } catch (err: any) {
      message.error("เกิดข้อผิดพลาด: " + err.message);
      setLoading(false);
    }
  };

  // คอลัมน์ Table
  const columns = [
    {
      title: "รูป",
      dataIndex: "picture",
      render: (val: string) =>
        val ? (
          <img src={val} alt="menu" style={{ width: 50, height: 50, objectFit: "cover" }} />
        ) : (
          "-"
        ),
    },
    { title: "ชื่อเมนู", dataIndex: "menuName" },
    { title: "ราคา", dataIndex: "price" },
    {
      title: "ประเภท",
      dataIndex: "menuTypeId",
      render: (val: number) => MENU_TYPES[val] || "-",
    },
    {
      title: "การจัดการ",
      render: (_: any, record: any) => (
        <Space>
          <Button onClick={() => openEditForm(record)}>แก้ไข</Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h1>จัดการเมนูอาหาร</h1>
      <Button type="primary" onClick={openAddForm}>
        เพิ่มเมนูใหม่
      </Button>

      <Table
        dataSource={menus}
        columns={columns}
        rowKey="id"
        style={{ marginTop: 16 }}
      />

      {/* Modal Form */}
      <Modal
        title={editingId ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={handleSave}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="ชื่อเมนู"
            name="name"
            rules={[{ required: true, message: "กรุณากรอกชื่อเมนู" }]}
          >
            <Input placeholder="ชื่อเมนู" />
          </Form.Item>

          <Form.Item
            label="ราคา"
            name="price"
            rules={[{ required: true, message: "กรุณากรอกราคา" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="รายละเอียด" name="detail">
            <Input.TextArea rows={3} placeholder="รายละเอียดเมนู" />
          </Form.Item>

          <Form.Item
            label="ประเภทอาหาร"
            name="type"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value={1}>เมนูหลัก</Select.Option>
              <Select.Option value={2}>ของทานเล่น</Select.Option>
              <Select.Option value={3}>ของหวาน</Select.Option>
              <Select.Option value={4}>เครื่องดื่ม</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="รูปภาพ" name="image" valuePropName="fileList" getValueFromEvent={(e) => e.fileList}>
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false} // ป้องกัน auto-upload
            >
              <Button icon={<UploadOutlined />}>อัปโหลดรูป</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
