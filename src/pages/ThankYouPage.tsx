import { useNavigate } from "react-router-dom";
import starImg from "../assets/image/star.png";
import "./RestaurantReview.css"; // ✅ ใช้ style เดียวกัน

export default function ThankYouPage() {
  const navigate = useNavigate();

  const handleBackHome = () => {
    // ตอนนี้ยังไม่มีหน้า Home → กลับไปหน้ารีวิวอาหาร ("/") แทน
    navigate("/");
  };

  return (
    <div className="rr">
      <header className="rr__header">
        <h1 className="rr__title">รีวิวร้านอาหาร</h1>
      </header>

      <section className="rr__card rr__thank">
        <div className="rr_image">
          <img src={starImg} alt="ดาว" className="bigStar" />
        </div>
        <h2 className="rr__thankTitle">ขอบคุณสำหรับการรีวิว ⭐</h2>
        <p className="rr__thankText">
          ความคิดเห็นของคุณช่วยให้ร้านอาหารและไรเดอร์ของเราพัฒนาบริการได้ดียิ่งขึ้น
        </p>
        <div className="rr__actionsHome">
          <button className="rr__btn rr__btn--primary" onClick={handleBackHome}>
            กลับไปหน้าแรก
          </button>
        </div>
      </section>
    </div>
  );
}
