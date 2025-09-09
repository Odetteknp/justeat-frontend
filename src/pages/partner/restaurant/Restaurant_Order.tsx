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
import {
  ownerOrders,
  statusTH,
  type OwnerOrderSummary,
  type OwnerOrderDetail,
} from '../../../services/ownerOrders';
import { getMenuName } from '../../../services/menu';

type FoodItemRow = {
  key: string | number;
  name: string;
  detail?: string;
  quantity: number;
  price: number;
  total: number;
};

const LIMIT = 20;

const RestaurantOrder: React.FC = () => {
  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  // list states
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<OwnerOrderSummary[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // detail modal states
  const [open, setOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<OwnerOrderDetail | null>(null);
  const [detailRows, setDetailRows] = useState<FoodItemRow[]>([]);

  // action loading (by order id)
  const [actingId, setActingId] = useState<number | null>(null);

  // ---------------- Helpers ----------------
  const refreshList = async (restId = restaurantId, p = page) => {
    if (!restId) return;
    const { data } = await ownerOrders.list(restId, { page: p, limit: LIMIT });
    setList(data.items || []);
    setTotal(data.total || 0);
  };

  const refreshDetailIfOpen = async (orderId: number) => {
    if (!open || !restaurantId || !detail?.order?.ID) return;
    if (detail.order.ID !== orderId) return;

    const { data } = await ownerOrders.detail(restaurantId, orderId);
    setDetail(data);

    // ดึงชื่อเมนูแบบเดิม (ทีละตัว) แต่กัน error ไว้
    const names = await Promise.all(
      (data.items ?? []).map((it) => getMenuName(it.menuId).catch(() => null))
    );

    const rows: FoodItemRow[] = (data.items ?? []).map((it, idx) => ({
      key: it.id,
      name: names[idx] ?? `เมนู #${it.menuId}`,
      quantity: it.qty,
      price: Number(it.unitPrice),
      total: Number(it.total),
    }));
    setDetailRows(rows);
  };

  // ✅ Owner ทำได้แค่ accept/cancel ตอน Pending เท่านั้น
  const doAction = async (orderId: number, kind: 'accept' | 'cancel') => {
    try {
      setActingId(orderId);
      if (kind === 'accept') await ownerOrders.accept(orderId);
      if (kind === 'cancel') await ownerOrders.cancel(orderId);

      message.success('อัปเดตสถานะสำเร็จ');
      await refreshList();
      await refreshDetailIfOpen(orderId);
    } catch (e: any) {
      if (e?.response?.status === 409) {
        message.warning('สถานะถูกเปลี่ยนไปแล้ว โปรดรีเฟรช');
        await refreshList();
        await refreshDetailIfOpen(orderId);
      } else {
        message.error(e?.response?.data?.error || 'อัปเดตสถานะไม่สำเร็จ');
      }
    } finally {
      setActingId(null);
    }
  };

  const renderActions = (o: OwnerOrderSummary) => {
    // Pending → ร้านกดได้: Accept / Cancel
    if (o.orderStatusId === 1) {
      return (
        <Space>
          <Button type="primary" loading={actingId === o.id} onClick={() => doAction(o.id, 'accept')}>
            Accept
          </Button>
          <Button danger loading={actingId === o.id} onClick={() => doAction(o.id, 'cancel')}>
            Cancel
          </Button>
        </Space>
      );
    }
    // Preparing / Delivering / Completed / Cancelled → ไม่มีปุ่มฝั่งร้าน
    return null;
  };

  // ---------------- Effects ----------------
  // 1) load my restaurant id
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const meRest = await getMyRestaurant();
        if (!meRest?.id) {
          message.error('ไม่พบร้านของคุณ');
          setRestaurantId(null);
          return;
        }
        setRestaurantId(meRest.id);
      } catch (e: any) {
        message.error(e?.response?.data?.error || 'โหลดข้อมูลร้านไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) load orders when have restaurantId or page changes
  useEffect(() => {
    if (!restaurantId) return;
    (async () => {
      try {
        setLoading(true);
        await refreshList(restaurantId, page);
      } catch (e: any) {
        message.error(e?.response?.data?.error || 'โหลดรายการออเดอร์ไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, page]);

  // 3) polling อัปเดตสถานะ (เช่น ไรเดอร์กดรับ → Delivering)
  useEffect(() => {
    if (!restaurantId) return;
    const id = window.setInterval(() => {
      refreshList(restaurantId, page).catch(() => {});
    }, 15000); // 15s
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, page]);

  // 4) open modal detail
  const handleOpenDetail = async (orderId: number) => {
    if (!restaurantId) return;
    try {
      setDetailLoading(true);
      setOpen(true);

      const { data } = await ownerOrders.detail(restaurantId, orderId);
      setDetail(data);

      // ดึงชื่อเมนูด้วย getMenuName แบบเดิม (กันพังด้วย catch)
      const names = await Promise.all(
        (data.items ?? []).map((it) => getMenuName(it.menuId).catch(() => null))
      );

      const rows: FoodItemRow[] = (data.items ?? []).map((it, idx) => ({
        key: it.id,
        name: names[idx] ?? `เมนู #${it.menuId}`,
        quantity: it.qty,
        price: Number(it.unitPrice),
        total: Number(it.total),
      }));
      setDetailRows(rows);
    } catch (e: any) {
      message.error(e?.response?.data?.error || 'โหลดรายละเอียดออเดอร์ไม่สำเร็จ');
    } finally {
      setDetailLoading(false);
    }
  };

  // ---------------- Table Columns ----------------
  const columns = [
    { title: 'รายการอาหาร', dataIndex: 'name', key: 'name', width: '40%' },
    { title: 'รายละเอียด', dataIndex: 'detail', key: 'detail', width: '20%', render: (t: string) => t || '-' },
    { title: 'จำนวน', dataIndex: 'quantity', key: 'quantity', width: '10%' },
    {
      title: 'ราคาต่อหน่วย (บาท)',
      dataIndex: 'price',
      key: 'price',
      width: '15%',
      render: (n: number) => n.toLocaleString(),
    },
    {
      title: 'ราคารวม (บาท)',
      dataIndex: 'total',
      key: 'total',
      width: '15%',
      render: (n: number) => n.toLocaleString(),
    },
  ];

  // ---------------- Cards ----------------
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
              {renderActions(o)}
              <Button onClick={() => handleOpenDetail(o.id)}>ดูรายละเอียด</Button>
            </Space>
          }
        >
          <Descriptions column={1} size="small" style={{ marginBottom: 8 }}>
            <Descriptions.Item label="ชื่อลูกค้า">{o.customerName || '-'}</Descriptions.Item>
            <Descriptions.Item label="ราคารวมทั้งหมด">
              {Number(o.total).toLocaleString()} บาท
            </Descriptions.Item>
            <Descriptions.Item label="สถานะ">{status}</Descriptions.Item>
            <Descriptions.Item label="เวลาสั่ง">{timeStr}</Descriptions.Item>
          </Descriptions>
        </Card>
      );
    });
  }, [list, actingId]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / LIMIT)), [total]);

  // ---------------- Modal Footer ----------------
  const renderModalActions = () => {
    if (!detail) return null;
    const id = detail.order.ID;
    const s = detail.order.orderStatusId;
    if (s === 1) {
      return (
        <Space>
          <Button type="primary" loading={actingId === id} onClick={() => doAction(id, 'accept')}>
            Accept
          </Button>
          <Button danger loading={actingId === id} onClick={() => doAction(id, 'cancel')}>
            Cancel
          </Button>
        </Space>
      );
    }
    return null;
  };

  // ---------------- Render ----------------
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

      {total > LIMIT && (
        <div style={{ marginTop: 16 }}>
          <Space>
            <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              ก่อนหน้า
            </Button>
            <span>
              หน้า {page} / {totalPages}
            </span>
            <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              ถัดไป
            </Button>
          </Space>
        </div>
      )}

      <Modal
        title={detail ? `รายละเอียดออเดอร์ #${detail.order.ID ?? '-'}` : 'รายละเอียดออเดอร์'}
        open={open}
        onCancel={() => {
          setOpen(false);
          setDetail(null);
          setDetailRows([]);
        }}
        footer={
          <Space>
            {renderModalActions()}
            <Button onClick={() => setOpen(false)}>ปิด</Button>
          </Space>
        }
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
              <Descriptions.Item label="ยอดย่อย">
                {detail.order.subtotal.toLocaleString()} บาท
              </Descriptions.Item>
              <Descriptions.Item label="ส่วนลด">
                {detail.order.discount.toLocaleString()} บาท
              </Descriptions.Item>
              <Descriptions.Item label="ค่าส่ง">
                {detail.order.deliveryFee.toLocaleString()} บาท
              </Descriptions.Item>
              <Descriptions.Item label="รวมสุทธิ">
                <b>{detail.order.total.toLocaleString()} บาท</b>
              </Descriptions.Item>
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
