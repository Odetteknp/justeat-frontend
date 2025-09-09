// src/pages/owner/Restaurant_Menu.tsx
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
  Typography,
  Card,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { menu } from "../../../services/menu";
import { auth } from "../../../services/auth";
import { getToken } from "../../../services/tokenStore";
import "./Restaurant_Menu.css";

// ประเภทเมนู (lookup table)
const MENU_TYPES: Record<number, string> = {
  1: "เมนูหลัก",
  2: "ของทานเล่น",
  3: "ของหวาน",
  4: "เครื่องดื่ม",
};

// helper: คืน id (รองรับทั้ง id / ID จาก backend)
const idOf = (x: any) => x?.id ?? x?.ID;

// ==============================
// Component: จัดการเมนูอาหาร
// ==============================
export default function MenuManagementUI() {
  const [menus, setMenus] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form] = Form.useForm();

  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [authMissing, setAuthMissing] = useState(false);

  // โหลดร้าน + เมนู
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        setAuthMissing(true);
        message.error("กรุณาเข้าสู่ระบบก่อน");
        console.warn("[init] missing token");
        return;
      }

      try {
        console.log("[init] โหลดข้อมูลร้าน");
        const meRest = await auth.meRestaurant();
        const restId = meRest?.restaurant?.ID;

        if (!restId) throw new Error("ไม่พบร้านของฉัน");
        setRestaurantId(restId);

        console.log("[init] โหลดเมนู restId =", restId);
        const menuRes = await menu.listByRestaurant(restId);

        // normalize id ทุก item
        const items = (menuRes.data.items ?? []).map((m: any) => ({
          ...m,
          id: idOf(m),
        }));

        setMenus(items);
      } catch (err: any) {
        console.error("[init] error:", err);
        message.error("โหลดข้อมูลไม่สำเร็จ");
      }
    })();
  }, []);

  if (authMissing) return <p>กรุณาเข้าสู่ระบบ</p>;
  if (!restaurantId) return <p>กำลังโหลดร้าน...</p>;

  // -------------------------
  // Action Handlers
  // -------------------------

  const openAddForm = () => {
    console.log("[openAddForm]");
    form.resetFields();
    setEditingId(null);
    setVisible(true);
  };

  const openEditForm = async (record: any) => {
    try {
      console.log("[openEditForm] record =", record);

      form.setFieldsValue({
        name: record.name,
        price: record.price,
        type: record.menuTypeId,
        detail: record.detail,
        image: record.image
          ? [
              {
                uid: "-1",
                name: "current-image.png",
                status: "done",
                url: record.image,
              },
            ]
          : [],
      });

      setEditingId(Number(idOf(record)));
      setVisible(true);
    } catch (err: any) {
      console.error("[openEditForm] error:", err);
      message.error("โหลดเมนูไม่สำเร็จ");
    }
  };

  const handleDelete = async (menuId: number) => {
    try {
      console.log("[handleDelete] menuId =", menuId);
      const token = getToken()!;

      await menu.remove(menuId, token);
      setMenus((prev) => prev.filter((m) => idOf(m) !== menuId));

      message.success("ลบเมนูสำเร็จ");
    } catch (err: any) {
      console.error("[handleDelete] error:", err);
      message.error("ลบเมนูล้มเหลว");
    }
  };

  const handleToggleStatus = async (menuId: number, newStatusId: number) => {
    try {
      console.log("[toggleStatus] menuId =", menuId, "→", newStatusId);
      const token = getToken()!;

      await menu.updateStatus(menuId, newStatusId, token);

      const list = await menu.listByRestaurant(restaurantId!);
      const items = (list.data.items ?? []).map((m: any) => ({
        ...m,
        id: idOf(m),
      }));
      setMenus(items);

      message.success(
        newStatusId === 1 ? "เมนูเปิดขายแล้ว" : "ปิดการขายเมนูนี้แล้ว"
      );
    } catch (err: any) {
      console.error("[toggleStatus] error:", err);
      message.error("เปลี่ยนสถานะล้มเหลว");
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () =>
        typeof reader.result === "string"
          ? resolve(reader.result)
          : reject(new Error("ไม่สามารถแปลงไฟล์ได้"));
      reader.onerror = (err) => reject(err);
    });

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log("[handleSave] values =", values);

      // จัดการรูปภาพ
      let image = "";
      if (values.image && values.image.length > 0) {
        const fileObj = values.image[0].originFileObj;
        image = fileObj
          ? await toBase64(fileObj as File)
          : values.image[0].url ?? "";
      }

      const payload = {
        name: values.name,
        price: values.price,
        detail: values.detail ?? "",
        image,
        menuTypeId: values.type,
        menuStatusId: 1,
      };

      setLoading(true);
      const token = getToken()!;

      if (editingId) {
        console.log("[handleSave] UPDATE menu id =", editingId);
        await menu.update(editingId, payload, token);
      } else {
        console.log("[handleSave] CREATE new menu");
        await menu.create(restaurantId!, payload, token);
      }

      const res = await menu.listByRestaurant(restaurantId!);
      const items = (res.data.items ?? []).map((m: any) => ({
        ...m,
        id: idOf(m),
      }));
      setMenus(items);

      message.success(editingId ? "แก้ไขเมนูสำเร็จ" : "เพิ่มเมนูสำเร็จ");
      setVisible(false);
    } catch (err: any) {
      console.error("[handleSave] error:", err);
      message.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Table Columns
  // -------------------------
  const columns = [
    {
      title: "รูป",
      dataIndex: "image",
      render: (val: string) =>
        val ? (
          <img
            src={val}
            alt="menu"
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        ) : (
          "-"
        ),
    },
    { title: "ชื่อเมนู", dataIndex: "name" },
    { title: "ราคา", dataIndex: "price" },
    {
      title: "ประเภท",
      dataIndex: "menuTypeId",
      render: (val: number) => MENU_TYPES[val] || "-",
    },
    {
      title: "สถานะ",
      dataIndex: "menuStatusId",
      render: (val: number) =>
        val === 1 ? (
          <span style={{ color: "green" }}>พร้อมขาย</span>
        ) : (
          <span style={{ color: "red" }}>หมด</span>
        ),
    },
    {
      title: "การจัดการ",
      render: (_: any, record: any) => {
        const id = Number(idOf(record));
        return (
          <Space>
            <Button onClick={() => openEditForm(record)}>แก้ไข</Button>
            <Button danger onClick={() => handleDelete(id)}>ลบ</Button>
            {record.menuStatusId === 1 ? (
              <Button onClick={() => handleToggleStatus(id, 2)} danger>
                ปิดการขาย
              </Button>
            ) : (
              <Button onClick={() => handleToggleStatus(id, 1)} type="dashed">
                เปิดขาย
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  // -------------------------
  // Render
  // -------------------------
  return (
    <div style={{ padding: 24, maxWidth: 1440, margin: "0 auto" }}>
      <Card>
        <Typography.Title level={2}>จัดการเมนูอาหาร</Typography.Title>

        <Button
          type="primary"
          onClick={openAddForm}
          style={{ marginBottom: 16 }}
        >
          + เพิ่มเมนูใหม่
        </Button>

        <Table
          dataSource={menus}
          columns={columns}
          rowKey={(r) => String(idOf(r))}
          bordered
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title={editingId ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={handleSave}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={loading}
        destroyOnClose
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
            rules={[{ required: true, message: "กรุณาเลือกประเภทอาหาร" }]}
          >
            <Select>
              <Select.Option value={1}>เมนูหลัก</Select.Option>
              <Select.Option value={2}>ของทานเล่น</Select.Option>
              <Select.Option value={3}>ของหวาน</Select.Option>
              <Select.Option value={4}>เครื่องดื่ม</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="รูปภาพ"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList ?? []}
          >
            <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>อัปโหลดรูป</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
