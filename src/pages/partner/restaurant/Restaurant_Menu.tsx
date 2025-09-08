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
import { option } from "../../../services/option";
import { auth } from "../../../services/auth";
import { getToken } from "../../../services/tokenStore";
import "./Restaurant_Menu.css"

const MENU_TYPES: Record<number, string> = {
  1: "เมนูหลัก",
  2: "ของทานเล่น",
  3: "ของหวาน",
  4: "เครื่องดื่ม",
};

type OptionItem = {
  id?: number; ID?: number;
  name: string;
  optionValues?: any[];
};

export default function MenuManagementUI() {
  const [menus, setMenus] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [authMissing, setAuthMissing] = useState(false);

  // options
  const [allOptions, setAllOptions] = useState<OptionItem[]>([]);
  const [originSelectedOptionIds, setOriginSelectedOptionIds] = useState<number[]>([]); // ใช้ตอนแก้ไข

  // helper
  const idOf = (x: any) => x?.id ?? x?.ID;

  // โหลดร้าน + เมนู + ออปชัน
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        setAuthMissing(true);
        message.error("กรุณากเข้าสู่ระบบก่อน");
        console.log("[init] ไม่มี token");
        return;
      }
      try {
        console.log("[init] โหลด meRestaurant");
        const meRest = await auth.meRestaurant();
        console.log("[init] meRestaurant =", meRest);
        const restId = meRest?.restaurant?.ID ?? meRest?.restaurant?.ID;
        if (!restId) throw new Error("ไม่พบร้านของฉัน");
        setRestaurantId(restId);

        console.log("[init] โหลดเมนู + ออปชัน restId=", restId);
        const [menuRes, optRes] = await Promise.all([
          menu.listByRestaurant(restId),
          option.list(),
        ]);

        console.log("[init] menu.listByRestaurant res =", menuRes);
        console.log("[init] option.list res =", optRes);

        setMenus(menuRes.data.items);
        setAllOptions(optRes.data.items ?? optRes.data ?? []);
      } catch (err: any) {
        console.error("[init] error:", err);
        message.error("โหลดข้อมูลไม่สำเร็จ: " + (err?.message ?? "unknown error"));
      }
    })();
  }, []);

  if (authMissing) return <p>กรุณาเข้าสู่ระบบ</p>;
  if (!restaurantId) return <p>กำลังโหลดร้าน...</p>;

  // เปิด modal สร้างเมนู
  const openAddForm = () => {
    console.log("[openAddForm]");
    form.resetFields();
    form.setFieldsValue({ options: [] });
    setOriginSelectedOptionIds([]);
    setEditingId(null);
    setVisible(true);
  };

  // เปิด modal แก้ไข + โหลด options ที่ผูกไว้
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

      const menuId = idOf(record);
      setEditingId(menuId);
      setVisible(true);

      console.log("[openEditForm] เรียก listOptionsByMenu menuId=", menuId);
      const res = await menu.listOptionsByMenu(menuId);
      console.log("[openEditForm] options by menu =", res);

      const opts = res.data.items ?? [];
      const ids = opts.map((o: any) => idOf(o)).filter(Boolean);
      form.setFieldsValue({ options: ids });
      setOriginSelectedOptionIds(ids);
      console.log("[openEditForm] originSelectedOptionIds =", ids);
    } catch (err: any) {
      console.error("[openEditForm] error:", err);
      message.error("โหลดตัวเลือกของเมนูไม่สำเร็จ: " + (err?.message ?? "unknown error"));
    }
  };

  // ลบเมนู
  const handleDelete = async (id: number) => {
    try {
      console.log("[handleDelete] id=", id);
      const token = getToken()!;
      const res = await menu.remove(id, token);
      console.log("[handleDelete] res =", res);
      setMenus((prev) => prev.filter((m) => idOf(m) !== id));
      message.success("ลบเมนูสำเร็จ");
    } catch (err: any) {
      console.error("[handleDelete] error:", err);
      message.error("ลบเมนูล้มเหลว: " + (err?.message ?? "unknown error"));
    }
  };

  // toggle สถานะเมนู
  const handleToggleStatus = async (id: number, newStatusId: number) => {
    try {
      console.log("[handleToggleStatus] id=", id, "newStatusId=", newStatusId);
      const token = getToken()!;
      const res = await menu.updateStatus(id, newStatusId, token);
      console.log("[handleToggleStatus] res =", res);
      message.success(newStatusId === 1 ? "เมนูกลับมาขายได้แล้ว" : "ปิดการขายเมนูนี้แล้ว");
      const list = await menu.listByRestaurant(restaurantId!);
      setMenus(list.data.items);
    } catch (err: any) {
      console.error("[handleToggleStatus] error:", err);
      message.error("เปลี่ยนสถานะล้มเหลว: " + (err?.message ?? "unknown error"));
    }
  };

  // base64 helper
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("ไม่สามารถแปลงไฟล์ได้"));
      reader.onerror = (err) => reject(err);
    });

  // แนบ/ถอด option ให้เมนู
  const syncMenuOptions = async (menuId: number, selectedIds: number[]) => {
    console.log("[syncMenuOptions] menuId=", menuId, "selectedIds=", selectedIds);
    const token = getToken()!;

    const toAttachOrUpdate = selectedIds; // เรียก attach เพื่ออัปเดต sortOrder ด้วย
    const toDetach = originSelectedOptionIds.filter((oldId) => !selectedIds.includes(oldId));

    console.log("[syncMenuOptions] toAttachOrUpdate=", toAttachOrUpdate, "toDetach=", toDetach);

    // ทำแบบ sequential เพื่อง่ายต่อการ debug (จะเห็น log ทีละตัวชัด ๆ)
    for (let i = 0; i < toAttachOrUpdate.length; i++) {
      const optId = toAttachOrUpdate[i];
      try {
        console.log(`[syncMenuOptions] ATTACH optionId=${optId}`);
const res = await menu.attachOption(menuId, optId, token);
        console.log("[syncMenuOptions] attach res =", res);
      } catch (err) {
        console.error("[syncMenuOptions] attach error:", err);
        throw err;
      }
    }

    for (const optId of toDetach) {
      try {
        console.log(`[syncMenuOptions] DETACH optionId=${optId}`);
        const res = await menu.detachOption(menuId, optId, token);
        console.log("[syncMenuOptions] detach res =", res);
      } catch (err) {
        console.error("[syncMenuOptions] detach error:", err);
        throw err;
      }
    }

    console.log("[syncMenuOptions] เสร็จสิ้น");
  };

  // บันทึกข้อมูลเมนู + options
  const handleSave = async () => {
    try {
      console.log("[handleSave] เริ่มบันทึกฟอร์ม");

      const values = await form.validateFields();
      console.log("[handleSave] form values =", values);

      // Image
      let image = "";
      if (values.image && values.image.length > 0) {
        const fileObj = values.image[0].originFileObj;
        image = fileObj ? await toBase64(fileObj as File) : (values.image[0].url ?? "");
      }
      console.log("[handleSave] image:", image ? "มีรูป" : "ไม่มีรูป");

      const payload = {
        name: values.name,
        price: values.price,
        detail: values.detail ?? "",
        image: image ?? "",
        menuTypeId: values.type,
        menuStatusId: 1,
      };
      console.log("[handleSave] payload =", payload);

      const selectedOptionIds: number[] = (values.options ?? []).map((n: any) => Number(n));
      console.log("[handleSave] selectedOptionIds =", selectedOptionIds);

      setLoading(true);
      const token = getToken()!;
      let menuId = editingId;

      if (editingId) {
        console.log("[handleSave] UPDATE เมนู id =", editingId);
        const res = await menu.update(editingId, payload, token);
        console.log("[handleSave] update res =", res);
      } else {
        console.log("[handleSave] CREATE เมนูใหม่");
        const created = await menu.create(restaurantId!, payload, token);
        console.log("[handleSave] create res =", created);
        menuId = created?.data?.id ?? created?.data?.ID ?? created?.data?.item?.id ?? created?.data?.item?.ID;
        console.log("[handleSave] menuId ใหม่ =", menuId);
        if (!menuId) throw new Error("ไม่พบรหัสเมนูที่สร้างใหม่");
        setOriginSelectedOptionIds([]); // ครั้งแรกให้ sync แนบทั้งหมด
      }

      console.log("[handleSave] call syncMenuOptions");
      await syncMenuOptions(menuId!, selectedOptionIds);

      console.log("[handleSave] reload list");
      const res = await menu.listByRestaurant(restaurantId!);
      setMenus(res.data.items);

      message.success(editingId ? "แก้ไขเมนูสำเร็จ" : "เพิ่มเมนูสำเร็จ");
      setVisible(false);
    } catch (err: any) {
      console.error("[handleSave] error:", err);
      message.error("เกิดข้อผิดพลาด: " + (err?.message ?? "unknown error"));
    } finally {
      console.log("[handleSave] จบการทำงาน");
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "รูป",
      dataIndex: "image",
      render: (val: string) =>
        val ? (
          <img src={val} alt="menu" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
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
        val === 1 ? <span style={{ color: "green" }}>พร้อมขาย</span> : <span style={{ color: "red" }}>หมด</span>,
    },
    {
      title: "การจัดการ",
      render: (_: any, record: any) => {
        const id = idOf(record);
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

  return (
    <div style={{ padding: 24, maxWidth: 1440, margin: "0 auto" }}>
      <Card>
        <Typography.Title level={2}>จัดการเมนูอาหาร</Typography.Title>
        <Button type="primary" onClick={openAddForm} style={{ marginBottom: 16 }}>
          + เพิ่มเมนูใหม่
        </Button>

        <Table
          dataSource={menus}
          columns={columns}
          rowKey={(r) => idOf(r)}
          bordered
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title={editingId ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
        open={visible}
        onCancel={() => {
          console.log("[modal] cancel");
          setVisible(false);
        }}
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

          {/* เลือก Options (หลายตัว) ใช้ลำดับที่เลือกเป็น sortOrder */}
          <Form.Item label="ตัวเลือกเพิ่มเติม (Options)" name="options">
            <Select
              mode="multiple"
              placeholder="เลือกตัวเลือกที่ต้องการ"
              optionFilterProp="label"
              showSearch
              maxTagCount="responsive"
              allowClear
              options={allOptions.map((o) => ({
                label: o.name,
                value: Number(idOf(o)),
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
