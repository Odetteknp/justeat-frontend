import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Modal,
  Space,
  Table,
  message,
  Spin,
} from 'antd';
import './Restaurant_Order.css';
import dayjs from 'dayjs';
import { getMyRestaurant } from '../../../services/restaurantOwner';
import { ownerOrders, statusTH, type OwnerOrderSummary, type OwnerOrderDetail } from '../../../services/ownerOrders';
import { getMenuName } from '../../../services/menu';

type FoodItemRow = {
  key: string | number;
  name: string;
  detail?: string;
  quantity: number;
  price: number;
  total: number;
};

const RestaurantOrder: React.FC = () => {
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // state สำหรับ list ออเดอร์
  const [list, setList] = useState<OwnerOrderSummary[]>([]);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);

  // state สำหรับ modal แสดงรายละเอียด
  const [open, setOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<OwnerOrderDetail | null>(null);
  const [detailRows, setDetailRows] = useState<FoodItemRow[]>([]);

  // โหลดร้านของฉัน → แล้วค่อยโหลดออเดอร์
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const meRest = await getMyRestaurant();
        console.log("[RestaurantOrder] getMyRestaurant =", meRest);

        if (!meRest?.id) {
          message.error('ไม่พบร้านของคุณ');
          setRestaurantId(null);
          return;
        }

        setRestaurantId(meRest.id);

        const { data } = await ownerOrders.list(meRest.id, { page, limit });
        console.log("[RestaurantOrder] ownerOrders.list result =", data);

        setList(data.items || []);
        setTotal(data.total || 0);
      } catch (e: any) {
        console.error("[RestaurantOrder] Fetch list error =", e);
        message.error(e?.response?.data?.error || 'โหลดรายการออเดอร์ไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // เปิด modal รายละเอียดออเดอร์
  const handleOpenDetail = async (orderId: number) => {
    if (!restaurantId) return;

    console.log("[RestaurantOrder] Open detail → orderId =", orderId, "restaurantId =", restaurantId);

    try {
      setDetailLoading(true);
      setOpen(true);

      const { data } = await ownerOrders.detail(restaurantId, orderId);
      console.log("[RestaurantOrder] ownerOrders.detail result =", data);

      setDetail(data);

      // ดึงชื่อเมนูทั้งหมดแบบ parallel
      const names = await Promise.all((data.items ?? []).map((it) => getMenuName(it.menuId)));
      console.log("[RestaurantOrder] getMenuName resolved =", names);

      // สร้าง rows สำหรับ Table
      const rows: FoodItemRow[] = (data.items ?? []).map((it, idx) => ({
        key: it.id,
        name: names[idx] ?? `เมนู #${it.menuId}`, // fallback กันชื่อหาย
        quantity: it.qty,
        price: Number(it.unitPrice),
        total: Number(it.total),
      }));
      console.log("[RestaurantOrder] detailRows mapped =", rows);

      setDetailRows(rows);
    } catch (e: any) {
      console.error("[RestaurantOrder] Fetch detail error =", e);
      message.error(e?.response?.data?.error || 'โหลดรายละเอียดออเดอร์ไม่สำเร็จ');
    } finally {
      setDetailLoading(false);
    }
  };

  // columns ของตารางแสดง items
  const columns = [
    { title: 'รายการอาหาร', dataIndex: 'name', key: 'name', width: '40%' },
    { title: 'รายละเอียด', dataIndex: 'detail', key: 'detail', width: '20%', render: (t: string) => t || '-' },
    { title: 'จำนวน', dataIndex: 'quantity', key: 'quantity', width: '10%' },
    { title: 'ราคาต่อหน่วย (บาท)', dataIndex: 'price', key: 'price', width: '15%', render: (n: number) => n.toLocaleString() },
    { title: 'ราคารวม (บาท)', dataIndex: 'total', key: 'total', width: '15%', render: (n: number) => n.toLocaleString() },
  ];

  // map list → card แสดงออเดอร์
  const cards = useMemo(() => {
    return list.map((o) => {
      const orderNo = `${String(o.id).padStart(6, '0')}`;
      const timeStr = dayjs(o.createdAt).format('YYYY-MM-DD HH:mm');
      const status = statusTH[o.orderStatusId] ?? `สถานะ #${o.orderStatusId}`;

      return (
        <Card
          key={o.id}
          title={`🧾 Order ID: ${orderNo}`}
          className="order-card"
          style={{ marginBottom: 24 }}
          extra={
            <Space>
              <Button type="primary" onClick={() => handleOpenDetail(o.id)}>
                ดูรายละเอียด
              </Button>
            </Space>
          }
        >
          <Descriptions column={1} size="small" style={{ marginBottom: 8 }}>
            <Descriptions.Item label="ชื่อลูกค้า">{o.customerName || '-'}</Descriptions.Item>
            <Descriptions.Item label="ราคารวมทั้งหมด">{Number(o.total).toLocaleString()} บาท</Descriptions.Item>
            <Descriptions.Item label="สถานะ">{status}</Descriptions.Item>
            <Descriptions.Item label="เวลาสั่ง">{timeStr}</Descriptions.Item>
          </Descriptions>
        </Card>
      );
    });
  }, [list]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

  return (
    <div className="order-page" style={{ padding: 24 }}>
      <div
        className="order-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}
      >
        <h2>รายการคำสั่งซื้อ (ร้านของฉัน)</h2>
      </div>

      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: 200 }}>
          <Spin />
        </div>
      ) : (
        <div className="order-list">
          {cards}
          {list.length === 0 && <div style={{ color: '#888' }}>ยังไม่มีออเดอร์</div>}
        </div>
      )}

      {/* Pagination แบบง่าย */}
      {total > limit && (
        <div style={{ marginTop: 16 }}>
          <Space>
            <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              ก่อนหน้า
            </Button>
            <span>หน้า {page} / {totalPages}</span>
            <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              ถัดไป
            </Button>
          </Space>
        </div>
      )}

      <Modal
        title={detail ? `รายละเอียดออเดอร์ #${detail.order.ID ?? "-"}` : 'รายละเอียดออเดอร์'}
        open={open}
        onCancel={() => {
          setOpen(false);
          setDetail(null);
          setDetailRows([]);
        }}
        footer={<Button onClick={() => setOpen(false)}>ปิด</Button>}
        width={800}
      >
        {detailLoading ? (
          <div style={{ display: 'grid', placeItems: 'center', minHeight: 160 }}>
            <Spin />
          </div>
        ) : detail ? (
          <>
            <Descriptions column={2} size="small" style={{ marginBottom: 12 }}>
              <Descriptions.Item label="สถานะ">
                {statusTH[detail.order.orderStatusId] ?? detail.order.orderStatusId}
              </Descriptions.Item>
              <Descriptions.Item label="เวลาสั่ง">
                {detail.order.CreatedAt ? dayjs(detail.order.CreatedAt).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="ยอดย่อย">{detail.order.subtotal.toLocaleString()} บาท</Descriptions.Item>
              <Descriptions.Item label="ส่วนลด">{detail.order.discount.toLocaleString()} บาท</Descriptions.Item>
              <Descriptions.Item label="ค่าส่ง">{detail.order.deliveryFee.toLocaleString()} บาท</Descriptions.Item>
              <Descriptions.Item label="รวมสุทธิ"><b>{detail.order.total.toLocaleString()} บาท</b></Descriptions.Item>
            </Descriptions>

            <Table
              dataSource={detailRows}
              columns={columns}
              size="small"
              pagination={false}
              bordered
            />
          </>
        ) : (
          <div style={{ color: '#888' }}>ไม่พบข้อมูลออเดอร์</div>
        )}
      </Modal>
    </div>
  );
};

export default RestaurantOrder;