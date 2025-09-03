import { Link } from "react-router-dom";

// antd
import { 
  Breadcrumb,
  Space,
  Typography,
} from "antd";

import { 
  HomeOutlined, 
  LockOutlined, 
  UserOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function PageHeader() {
  return (
    <div className="page-header">
      <Breadcrumb
        items={[
          { title: <Link to="/"><Space size={6}><HomeOutlined/>หน้าแรก</Space></Link>},
          { title: "บัญชีผู้ใช้" },
          { title: "โปรไฟล์" },
        ]}
      />
      <div className="title-row">
        <Space align="center" size={10}>
          <UserOutlined className="title-icon"/>
          <Title level={3} style={{ margin: 0 }}>
            จัดการโปรไฟล์
          </Title>
        </Space>

        <Link to="/profile/security" className="header-link">
          <Space size={6}><LockOutlined/>ความปลอดภัย</Space>
        </Link>
      </div>
      <Text type="secondary">อัปเดตข้อมูลส่วนตัวของคุณให้เป็นปัจจุบัน</Text>
    </div>
  )
}