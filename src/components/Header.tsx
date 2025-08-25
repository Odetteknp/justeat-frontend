import React from "react";
import { Layout, Menu, Dropdown, Input, Button, Avatar } from "antd";
import { DownOutlined, UserOutlined, SearchOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import logoImage from "../assets/LOGO.png";

const { Header } = Layout;

interface HeaderProps {
  isLoggedIn: boolean;
}

const AppHeader: React.FC<HeaderProps> = ({ isLoggedIn }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isPartner = pathname.startsWith("/partner");

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/")
  }

  const partnerMenu = (
    <Menu>
      <Menu.Item key="rider">
        <Link to="/partner/rider">Rider</Link>
      </Menu.Item>
      <Menu.Item key="rest">
        <Link to="/partner/restaurant">Restaurant</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className={isPartner ? "partner-header header" : "header"}>
      <div className="header-container">

        {/* ซ้าย */}
        <div className="header-left">
          {isPartner ? (
            <Button
              type="text"
              className="header-back"
              icon={<ArrowLeftOutlined/>}
              onClick={goBack}
            >
              
            </Button>
          ) : (
            <div className="header-logo">
              <Link to="/">
                <img src={logoImage} alt="Logo" />
              </Link>
            </div>
          )}
        </div>

        {/* กลาง */}
        {!isPartner ? (

          // กรณีไม่ใช่ Partner
          <Menu
            mode="horizontal"
            theme="dark"
            className="header-menu"
            selectedKeys={[pathname]}
          >
            <Menu.Item key="/" className="header-item">
              <Link to="/">Home</Link>
            </Menu.Item>
            <Menu.Item key="/menu" className="header-item">
              <Link to="/menu">Menu</Link>
            </Menu.Item>
            <Menu.Item key="/rest" className="header-item">
              <Link to="/rest">Restaurants</Link>
            </Menu.Item>
            <Menu.Item key="/help" className="header-item">
              <Link to="/help">Help</Link>
            </Menu.Item>
          </Menu>

        ) : (
          // กรณีที่เป็น partner ซึ่งมี 2 role ก็ต้องเช็คอีกว่าเป็น rest or rider
          <Menu
            mode="horizontal"
            className="header-menu"
            selectedKeys={[pathname]}
          >
            {pathname.startsWith("/partner/rider") ? (
              <>
                <Menu.Item key="/partner/rider/overview">
                    <Link to="/partner/rider/overview">คิดก่อนจะใส่อะ</Link>
                </Menu.Item>
                <Menu.Item key="/partner/rider/orders">
                  <Link to="/partner/rider/orders">อาจจะ</Link>
                </Menu.Item>
                <Menu.Item key="/partner/rider/settings">
                  <Link to="/partner/rider/settings">?</Link>
                </Menu.Item>
              </>
            ) : (
              <>
                <Menu.Item key="/partner/rest/overview">
                  <Link to="/partner/rest/overview">คิดก่อนจะใส่อะ</Link>
                </Menu.Item>
                <Menu.Item key="/partner/rest/menu">
                  <Link to="/partner/rest/menu">อาจจะ</Link>
                </Menu.Item>
                <Menu.Item key="/partner/rest/orders">
                  <Link to="/partner/rest/orders">ไม่รู้</Link>
                </Menu.Item>
                <Menu.Item key="/partner/rest/settings">
                  <Link to="/partner/rest/settings">?</Link>
                </Menu.Item>
              </>
            )}
          </Menu>
        )}

        {/* ขวา */}
        <div className="header-right">
          {!isPartner && (
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              className="header-search"
            />
          )}

          {!isPartner && (
            <Dropdown overlay={partnerMenu} trigger={["click"]}>
              <Button className="header-partner" type="text">
                Partner <DownOutlined />
              </Button>
            </Dropdown>            
          )}


          {!isLoggedIn ? (
            <Link to="/login">
              <Button className="header-signin" shape="round">
                Sign In
              </Button>
            </Link>
          ) : (
            <Link to="/profile">
              <Avatar icon={<UserOutlined />} />
            </Link>
          )}
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;
