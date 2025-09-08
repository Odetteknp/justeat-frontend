// src/pages/partner/restaurant/OwnerRestaurantPage.tsx
import React, { useEffect, useState } from "react";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { Form, Upload, Select, Input, Button, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import type { RcFile } from "antd/es/upload";
import {
  getMyRestaurant,
  updateMyRestaurant,
  type MyRestaurant,
} from "../../../services/restaurantOwner";
import "./OwnerRestaurantPage.css";

const { Option } = Select;
const { TextArea } = Input;

function fileToBase64(f: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });
}

const OwnerRestaurantPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [myRest, setMyRest] = useState<MyRestaurant | null>(null);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await getMyRestaurant();
        console.log("my restaurant =", r);
        setMyRest(r);

        form.setFieldsValue({
          name: r?.name ?? "",
          address: r?.address ?? "",
          description: r?.description ?? "",
          openingTime: r?.openingTime ?? "",
          closingTime: r?.closingTime ?? "",
          restaurantStatusId: r?.restaurantStatusId ?? 1,
          pictureBase64: r?.pictureBase64 ?? undefined, // ⬅ hidden field
        });

        if (r?.pictureBase64) {
          setFileList([
            {
              uid: "-1",
              name: "current.png",
              status: "done",
              url: r.pictureBase64,
            },
          ]);
        } else {
          setFileList([]);
        }
      } catch (e: any) {
        message.error(e?.response?.data?.error || "โหลดข้อมูลร้านไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, [form]);

  const beforeUpload = async (file: RcFile) => {
    const b64 = await fileToBase64(file);
    // แสดง preview ผ่าน fileList (Upload control)
    setFileList([
      {
        uid: file.uid, // RcFile มี uid
        name: file.name,
        status: "done",
        url: b64,
      },
    ]);
    // เก็บ base64 ไว้ใน form field เพื่อส่งตอน submit
    form.setFieldValue("pictureBase64", b64);

    // ไม่อัปโหลดจริง ให้ antd จบ flow
    return false;
  };

  const onRemove = () => {
    setFileList([]);
    form.setFieldValue("pictureBase64", undefined);
  };

  // ... ด้านบนเหมือนเดิม

  const onFinish = async (values: any) => {
    // ✅ กันกรณีไม่มี id / id ไม่เป็นตัวเลข
    if (!myRest || !Number.isFinite(Number(myRest.id))) {
      message.error("ไม่พบไอดีร้านของคุณ");
      console.log("myRest.id ที่ได้มา =", myRest?.id);
      return;
    }

    try {
      setSaving(true);

      await updateMyRestaurant(Number(myRest.id), {
        name: values.name?.trim(),
        address: values.address?.trim(),
        description: values.description?.trim(),
        openingTime: values.openingTime?.trim(),
        closingTime: values.closingTime?.trim(),
        restaurantStatusId: values.restaurantStatusId,
        pictureBase64: values.pictureBase64,
      });

      message.success("อัปเดตร้านเรียบร้อย");
    } catch (e: any) {
      message.error(e?.response?.data?.error || "อัปเดตไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-wrapper">
      <Form form={form} layout="vertical" style={{ width: "100%" }} onFinish={onFinish}>
        {/* เก็บ base64 ไว้ใน form แบบ hidden */}
        <Form.Item name="pictureBase64" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item label="Add Photo" className="form-item">
          <div className="upload-wrapper">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onRemove={onRemove}
              maxCount={1}
              // กัน antd ไปยิง network เอง
              customRequest={({ onSuccess }) => {
                onSuccess && onSuccess({}, new XMLHttpRequest());
              }}
            >
              {fileList.length >= 1 ? null : (
                <div className="upload-btn">
                  {saving ? <LoadingOutlined /> : <PlusOutlined />}
                  <div className="upload-text">Upload Now!</div>
                </div>
              )}
            </Upload>
          </div>
        </Form.Item>

        <Form.Item
          label="Status"
          name="restaurantStatusId"
          className="form-item"
          rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
        >
          <Select placeholder="Status" className="input-field">
            <Option value={1}>เปิด</Option>
            <Option value={2}>ปิด</Option>
            <Option value={3}>ปิดชั่วคราว</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Restaurant's Name"
          name="name"
          className="form-item"
          rules={[{ required: true, message: "กรุณากรอกชื่อร้าน" }]}
        >
          <Input className="input-field" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          className="form-item"
          rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
        >
          <TextArea rows={5} className="input-field" />
        </Form.Item>

        <Form.Item label="Opening Time (เช่น 09:00)" name="openingTime" className="form-item">
          <Input className="input-field" placeholder="09:00" />
        </Form.Item>

        <Form.Item label="Closing Time (เช่น 21:00)" name="closingTime" className="form-item">
          <Input className="input-field" placeholder="21:00" />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          className="form-item"
          rules={[{ required: true, message: "กรุณากรอกที่อยู่" }]}
        >
          <TextArea rows={5} className="input-field" />
        </Form.Item>

        <Form.Item className="form-submit-item">
          <Button
            type="primary"
            htmlType="submit"
            className="submit-button-Owner"
            loading={saving}
            disabled={
              loading ||
              !myRest ||
              !Number.isFinite(Number(myRest.id))
            }
          >
            {saving ? "กำลังบันทึก..." : "SUBMIT"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default OwnerRestaurantPage;
