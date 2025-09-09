import React, { useEffect, useState } from "react";
import { getProfile } from "../../services/user";
import type { UserProfile } from "../../types";
import { applyRestaurant } from "../../services/restaurantApplication";
import "./RestaurantRegisterForm.css";
import Owner from "../../assets/Restaurants/Owner.png";
import ResRegis from "../../assets/Restaurants/ResRegister.png";

const RestaurantRegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    ownerPhone: "",

    name: "",
    phone: "",
    description: "",
    restaurantType: "",
    address: "",
    openingTime: "",
    closingTime: "",
    logo: null as File | null,
  });

  // โหลด profile จาก backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile: UserProfile = await getProfile();
        setFormData((prev) => ({
          ...prev,
          ownerFirstName: profile.firstName || "",
          ownerLastName: profile.lastName || "",
          ownerEmail: profile.email || "",
          ownerPhone: profile.phoneNumber || "",
        }))
      } catch(err) {
        console.error("❌ โหลดข้อมูล user ไม่สำเร็จ:", err)
      }
    }
    loadProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, logo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.restaurantType) {
      alert("กรุณาเลือกหมวดหมู่ร้านอาหาร");
      return;
    }

    let base64: string | undefined;

    if (formData.logo) {
      console.log("🚀 convert file -> base64", formData.logo);

      base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;

        reader.readAsDataURL(formData.logo!);
      });
    }

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        pictureBase64: base64,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        restaurantCategoryId: Number(formData.restaurantType),
      };

      const res = await applyRestaurant(payload);
      console.log("✅ สมัครร้าน response:", res);
      alert("สมัครร้านเรียบร้อยแล้ว!");
    } catch (err) {
      console.error("❌ สมัครร้านล้มเหลว", err);
      alert("สมัครร้านไม่สำเร็จ กรุณาลองใหม่");
    }
  };


  return (
    <div className="register-restaurant-container">
      <div className="register-header">
        <h1>Register Your Restaurant</h1>
        <p>Let’s get your restaurant online!</p>
      </div>

      <div className="register-card">
        <p className="owner-caption">Owner Information</p>
        <img src={Owner} alt="ResRegis" className="owner-image" />
        

        <form onSubmit={handleSubmit} className="register-form">
          <div className="owner-info">
            <div className="form-group-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="ownerFirstName"
                  value={formData.ownerFirstName}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="ownerLastName"
                  value={formData.ownerLastName}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                required
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleChange}
                required
                readOnly
              />
            </div>

            <div className="restaurant-info">
              {/* ลบคำว่า Restaurant Information */}

              <p className="res-caption">Restaurant Information</p>
              <div className="restaurant-image">
                <img
                  src={ResRegis}
                  alt="Restaurant Registration"
                  className="restaurant-image-centered"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="restaurantType"
                value={formData.restaurantType}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="1">Rice Dishes</option>
                <option value="2">Noodles</option>
                <option value="3">Coffee & Tea</option>
                <option value="4">Fast Food</option>
                <option value="5">Healthy</option>
                <option value="6">Bubble Tea</option>
                <option value="7">Bakery</option>
                <option value="8">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Opening Time</label>
              <input
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Closing Time</label>
              <input
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                rows={4}
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Photo or Logo</label>
              <div className="upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              {formData.logo && (
                <p className="file-name">📷 {formData.logo.name}</p>
              )}
            </div>
          </div>

          <button type="submit" className="submit-button">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RestaurantRegisterForm;