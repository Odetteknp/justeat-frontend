import type { Rule } from "antd/es/form";

export const NAME_PATTERN = /^[ก-๙a-zA-Z\s]+$/;

export const nameRules = (label: string): Rule[] => [
  { required: true, message: `กรุณากรอก${label}` },
  { pattern: NAME_PATTERN, message: `${label}ต้องเป็นตัวอักษรเท่านั้น` },
  { max: 50, message: `${label}ต้องไม่เกิน 50 ตัวอักษร` },
];

export const phoneRules: Rule[] = [
  { required: true, message: "กรุณากรอกเบอร์โทรศัพท์" },
  { pattern: /^[0-9]{9,10}$/, message: "กรุณากรอกให้ถูกต้อง (9–10 หลัก)" },
];