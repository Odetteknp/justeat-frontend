// src/data/menuData.ts
import wings from '../assets/image/wings.png';
import salmon from '../assets/image/salmon.png';
import padthai from '../assets/image/padthai.png';
import tomyum from '../assets/image/tomyum.png';
import frenchfries from '../assets/image/frenchfries.png';

import kaprao from '../assets/image/kaprao.png';
import kaprao2 from '../assets/image/kaprao2.png';
import kaprao3 from '../assets/image/kaprao3.png';

import yum from '../assets/image/yum.png';
import yum2 from '../assets/image/yum2.png';
import yum3 from '../assets/image/yum3.png';
import yum4 from '../assets/image/yum4.png';
import yum5 from '../assets/image/yum5.png';

import omelette from '../assets/image/omelette.png';
import cute1 from '../assets/image/cute1.png';
import cute2 from '../assets/image/cute2.png';

import somtam1 from '../assets/image/somtam1.png';
import somtam2 from '../assets/image/somtam2.png';

export type Section = { id: string; label: string };

export type Choice = { id: string; name: string; price?: number };
export type MenuOption = {
  id: string;
  label: string;
  type: 'single' | 'multiple';
  required?: boolean;
  choices: Choice[];
};

export interface MenuItem {
  name: string;
  price: string;      // เก็บเป็น string เช่น "$50"
  image: string;
  sectionId: string;
  options?: MenuOption[];  // สำหรับ Modal ตัวเลือก
}

export const SECTIONS: Section[] = [
  { id: 'featured', label: 'เมนูแนะนำ' },
  { id: 'kaprao',  label: 'กะเพรา' },
  { id: 'yum',     label: 'ยำ' },
  { id: 'fried',   label: 'ทอด' },
  { id: 'egg',     label: 'เมนูไข่' },
  { id: 'somtum',  label: 'ส้มตำ' },
];

export const menuItems: MenuItem[] = [
  // เมนูแนะนำ
  { name: 'ปีกไก่ทอด', price: '$50', image: wings, sectionId: 'featured',
    options: [
      { id: 'size', label: 'ขนาด', type: 'single', required: true, choices: [
        { id: 'sz-s', name: 'เล็ก' },
        { id: 'sz-m', name: 'กลาง', price: 10 },
        { id: 'sz-l', name: 'ใหญ่', price: 20 },
      ]},
    ]
  },
  { name: 'ข้าวหน้าแซลมอน', price: '$50', image: salmon, sectionId: 'featured' },
  { name: 'ผัดไท',          price: '$50', image: padthai, sectionId: 'featured' },

  // ✅ ต้มยำกุ้ง เพิ่ม option น้ำข้น/ใส + ความเผ็ด
  { name: 'ต้มยำกุ้ง', price: '$50', image: tomyum, sectionId: 'featured',
    options: [
      { id: 'soup', label: 'เลือกน้ำซุป', type: 'single', required: true, choices: [
        { id: 'soup-clear', name: 'น้ำใส' },
        { id: 'soup-thick', name: 'น้ำข้น' },
      ]},
      { id: 'spicy', label: 'ระดับความเผ็ด', type: 'single', required: true, choices: [
        { id: 'sp0', name: 'ไม่เผ็ด' },
        { id: 'sp1', name: 'เผ็ดน้อย' },
        { id: 'sp2', name: 'เผ็ดกลาง' },
        { id: 'sp3', name: 'เผ็ดมาก' },
      ]},
    ]
  },

  // กะเพรา
  { name: 'กะเพราหมูกรอบ', price: '$50', image: kaprao, sectionId: 'kaprao',
    options: [
      { id: 'spicy', label: 'ระดับความเผ็ด', type: 'single', required: true, choices: [
        { id: 'sp0', name: 'ไม่เผ็ด' },
        { id: 'sp1', name: 'เผ็ดน้อย' },
        { id: 'sp2', name: 'เผ็ดกลาง' },
        { id: 'sp3', name: 'เผ็ดมาก' },
      ]},
      { id: 'egg', label: 'ไข่', type: 'single', choices: [
        { id: 'e0',  name: 'ไม่ใส่ไข่' },
        { id: 'e1',  name: 'ไข่ดาว', price: 10 },
        { id: 'e2',  name: 'ไข่เจียว', price: 15 },
      ]},
    ]
  },
  { name: 'กะเพราหมูสับ',   price: '$50', image: kaprao2, sectionId: 'kaprao',
    options: [
      { id: 'spicy', label: 'ระดับความเผ็ด', type: 'single', required: true, choices: [
        { id: 'sp0', name: 'ไม่เผ็ด' },
        { id: 'sp1', name: 'เผ็ดน้อย' },
        { id: 'sp2', name: 'เผ็ดกลาง' },
        { id: 'sp3', name: 'เผ็ดมาก' },
      ]},
      { id: 'egg', label: 'ไข่', type: 'single', choices: [
        { id: 'e0',  name: 'ไม่ใส่ไข่' },
        { id: 'e1',  name: 'ไข่ดาว', price: 10 },
        { id: 'e2',  name: 'ไข่เจียว', price: 15 },
      ]},
    ]
  },
  { name: 'กะเพราทะเล',     price: '$50', image: kaprao3, sectionId: 'kaprao',
    options: [
      { id: 'spicy', label: 'ระดับความเผ็ด', type: 'single', required: true, choices: [
        { id: 'sp0', name: 'ไม่เผ็ด' },
        { id: 'sp1', name: 'เผ็ดน้อย' },
        { id: 'sp2', name: 'เผ็ดกลาง' },
        { id: 'sp3', name: 'เผ็ดมาก' },
      ]},
      { id: 'egg', label: 'ไข่', type: 'single', choices: [
        { id: 'e0',  name: 'ไม่ใส่ไข่' },
        { id: 'e1',  name: 'ไข่ดาว', price: 10 },
        { id: 'e2',  name: 'ไข่เจียว', price: 15 },
      ]},
    ]
  },

  // ✅ ยำทุกเมนู เพิ่ม option ความเผ็ด
  { name: 'ยำหอยนางรม', price: '$50', image: yum, sectionId: 'yum',
    options: [
      { id: 'spicy', label: 'ระดับความเผ็ด', type: 'single', required: true, choices: [
        { id: 'sp0', name: 'ไม่เผ็ด' },
        { id: 'sp1', name: 'เผ็ดน้อย' },
        { id: 'sp2', name: 'เผ็ดกลาง' },
        { id: 'sp3', name: 'เผ็ดมาก' },
      ]},
    ]
  },
  { name: 'ยำมาม่า', price: '$50', image: yum2, sectionId: 'yum',
    options: [
      { id: 'spicy', label: 'ระดับความเผ็ด', type: 'single', required: true, choices: [
        { id: 'sp0', name: 'ไม่เผ็ด' },
        { id: 'sp1', name: 'เผ็ดน้อย' },
        { id: 'sp2', name: 'เผ็ดกลาง' },
        { id: 'sp3', name: 'เผ็ดมาก' },
      ]},
    ]
  },
  { name: 'ยำหอยแครง', price: '$50', image: yum3, sectionId: 'yum',
    options: [
      { id: 'spicy', label: 'ระดับความเผ็ด', type: 'single', required: true, choices: [
        { id: 'sp0', name: 'ไม่เผ็ด' },
        { id: 'sp1', name: 'เผ็ดน้อย' },
        { id: 'sp2', name: 'เผ็ดกลาง' },
        { id: 'sp3', name: 'เผ็ดมาก' },
      ]},
    ]
  },
  { name: 'ยำหมูยอ', price: '$50', image: yum4, sectionId: 'yum',
    options: [
      { id: 'spicy', label: 'ระดับความเผ็ด', type: 'single', required: true, choices: [
        { id: 'sp0', name: 'ไม่เผ็ด' },
        { id: 'sp1', name: 'เผ็ดน้อย' },
        { id: 'sp2', name: 'เผ็ดกลาง' },
        { id: 'sp3', name: 'เผ็ดมาก' },
      ]},
    ]
  },
  { name: 'ยำไข่เยี่ยวม้า', price: '$50', image: yum5, sectionId: 'yum',
    options: [
      { id: 'spicy', label: 'ระดับความเผ็ด', type: 'single', required: true, choices: [
        { id: 'sp0', name: 'ไม่เผ็ด' },
        { id: 'sp1', name: 'เผ็ดน้อย' },
        { id: 'sp2', name: 'เผ็ดกลาง' },
        { id: 'sp3', name: 'เผ็ดมาก' },
      ]},
    ]
  },

  // ทอด
  { name: 'ปีกไก่ทอด', price: '$50', image: wings, sectionId: 'fried' ,
    options: [
      { id: 'size', label: 'ขนาด', type: 'single', required: true, choices: [
        { id: 'sz-s', name: 'เล็ก' },
        { id: 'sz-m', name: 'กลาง', price: 10 },
        { id: 'sz-l', name: 'ใหญ่', price: 20 },
      ]},
    ]
  },
  { name: 'เฟรนซ์ฟรายส์',     price: '$50', image: frenchfries, sectionId: 'fried' ,
    options: [
      { id: 'dip', label: 'ซอสจิ้ม', type: 'multiple', choices: [
        { id: 'dip-k', name: 'ซอสมะเขือเทศ' },
        { id: 'dip-m', name: 'มายองเนส' },
        { id: 'dip-c', name: 'ซอสพริก' },
      ]},
    ]
  },

  // เมนูไข่
  { name: 'ข้าวไข่เจียว',       price: '$50', image: omelette, sectionId: 'egg' },
  { name: 'ไข่ดาวหมูพลี',        price: '$50', image: cute1,    sectionId: 'egg' },
  { name: 'ไข่แผ่นแดนกระต่าย',   price: '$50', image: cute2,    sectionId: 'egg' },

  // ส้มตำ
  { name: 'ตำลาว',  price: '$50', image: somtam1, sectionId: 'somtum' },
  { name: 'ตำไทย',  price: '$50', image: somtam2, sectionId: 'somtum' },
];
