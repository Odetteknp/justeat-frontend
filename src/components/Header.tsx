import React from "react";
import { Layout, Menu, Dropdown, Input, Button, Avatar } from "antd";
import { DownOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import logoImage from "../assets/LOGO.png";

const { Header } = Layout;

interface HeaderProps {
  isLoggedIn: boolean;
}

const AppHeader: React.FC<HeaderProps> = ({ isLoggedIn }) => {
  const { pathname } = useLocation();

  const partnerMenu = (
    <Menu>
      <Menu.Item key="rider">
        <Link to="/partner/rider">Rider</Link>
      </Menu.Item>
      <Menu.Item key="restaurant">
        <Link to="/partner/restaurant">Restaurant</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">
            <img src={logoImage} alt="Logo" />
          </Link>
        </div>

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
          <Menu.Item key="/restaurants" className="header-item">
            <Link to="/restaurants">Restaurants</Link>
          </Menu.Item>
          <Menu.Item key="/help" className="header-item">
            <Link to="/help">Help</Link>
          </Menu.Item>
        </Menu>

        <div className="header-right">
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            className="header-search"
          />

          <Dropdown overlay={partnerMenu} trigger={["click"]}>
            <Button className="header-partner" type="text">
              Partner <DownOutlined />
            </Button>
          </Dropdown>

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
