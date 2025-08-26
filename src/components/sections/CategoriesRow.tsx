import { Avatar, Typography, Flex, ConfigProvider } from "antd";
import React from "react";

type Category = {   // กำหนดโครงสร้างของข้อมูล
  id: string,
  name: string,
  icon: string,
  href: string
}

interface Props {   // props ที่รับเข้ามา
  title?: string;
  items: Category[];
  size?: number;    // ขนาด icon
  gap?: number;     // ระยะห่าง
  scroll?: boolean;
}

export default function CategoriesRowAntd({
  title = "หมวดหมู่",
  items,
  size = 64,
  gap = 28,
  scroll = false,
}: Props) {

  // layout ของกล่องรวม
  const containerStyle: React.CSSProperties = scroll
      // โหมด scroll
      ? {
        display: "gird",
        gridAutoFlow: "column",
        gap,
        overflow: "auto",
        paddingBottom: 8,
      }
      // โหมด wrap
      : {
        display: "flex",
        flexWrap: "wrap",
        gap,
        alignItems: "center",
        justifyContent: "space-around",
        paddingTop: 10,
      }
  
    // style ของ icon
    const thumbStyle: React.CSSProperties = {
      borderRadius: "50%",
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.12)",
      transition: "transform .12s ease",
      width: size,
      height: size,
      overflow: "hidden",
    }

    return (
      <section>
        {/* ส่วนหัว */}
        {/* Typography.Text มาจาก antdesign ใช้จัดการ font style */}
        <Typography.Text
          strong
          style={{ 
            display: "block", 
            margin: "10px 0 12px"
          }}
        >
          {title}
        </Typography.Text>
        
        {/* ConfigProvider ตั้งค่าการทำงานของ component ลูกๆ */}
        <ConfigProvider>
          <div style={containerStyle}>
            {items.map((c) => (
              <a
                key={c.id}
                href={c.href}
                aria-label={c.name}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Flex vertical align="center" gap={8}>
                  <div className="cat-thumb">
                    <Avatar
                      src={c.icon}
                      size={size}
                      shape="circle"
                      alt={c.name}
                    />
                  </div>

                  <Typography.Text
                    style={{
                      fontSize: 12,
                      color: "#595959",
                      textAlign: "center",
                      maxWidth: size + 40
                    }}
                  >
                    {c.name}
                  </Typography.Text>
                </Flex>
              </a>
            ))}
          </div>
        </ConfigProvider>

        <style>
          {`.cat-thumb:hover { transfrom: scale(1.05); }`}
        </style>
      </section>
    )
}