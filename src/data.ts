import { SeniorProfile, HealthRecord } from "./types";

export const SEED_PROFILES: SeniorProfile[] = [
  {
    id: "senior-1",
    firstName: "ป้ออุ้ยดี",
    lastName: "ศรีเชียงกลาง",
    age: 74,
    height: 165,
    createdAt: "2026-05-10T08:00:00.000Z"
  },
  {
    id: "senior-2",
    firstName: "แม่อุ้ยแก้ว",
    lastName: "แก้วปัญญา",
    age: 68,
    height: 154,
    createdAt: "2026-05-11T09:30:00.000Z"
  },
  {
    id: "senior-3",
    firstName: "ป้ออุ้ยอินทร์",
    lastName: "แก้วปันบุญ",
    age: 81,
    height: 160,
    createdAt: "2026-05-12T10:00:00.000Z"
  }
];

export const SEED_RECORDS: HealthRecord[] = [
  // Senior 1: Por Ui Dee (Generally good, slightly elevated BP)
  {
    id: "rec-1-1",
    seniorId: "senior-1",
    date: "2026-07-10",
    weight: 62.5,
    systolic: 128,
    diastolic: 82,
    pulse: 72,
    bloodSugar: 95,
    note: "วัดก่อนอาหารเช้า ร่างกายแข็งแรงดี"
  },
  {
    id: "rec-1-2",
    seniorId: "senior-1",
    date: "2026-07-11",
    weight: 62.2,
    systolic: 130,
    diastolic: 84,
    pulse: 75,
    bloodSugar: 98,
    note: "วัดช่วงสาย รู้สึกกระปรี้กระเปร่า"
  },
  {
    id: "rec-1-3",
    seniorId: "senior-1",
    date: "2026-07-12",
    weight: 62.0,
    systolic: 124,
    diastolic: 80,
    pulse: 70,
    bloodSugar: 92,
    note: "นอนหลับเต็มอิ่ม ลมเย็นสบาย"
  },
  {
    id: "rec-1-4",
    seniorId: "senior-1",
    date: "2026-07-13",
    weight: 62.4,
    systolic: 125,
    diastolic: 81,
    pulse: 74,
    bloodSugar: 94,
    note: "ล่าสุดวันนี้ สบายดีมากครับ"
  },

  // Senior 2: Mae Ui Kaew (Diabetic risk, overweight, elevated blood sugar)
  {
    id: "rec-2-1",
    seniorId: "senior-2",
    date: "2026-07-10",
    weight: 65.0,
    systolic: 135,
    diastolic: 85,
    pulse: 78,
    bloodSugar: 122,
    note: "ทานข้าวเหนียวมะม่วงไปเมื่อเย็นวาน"
  },
  {
    id: "rec-2-2",
    seniorId: "senior-2",
    date: "2026-07-11",
    weight: 64.8,
    systolic: 132,
    diastolic: 83,
    pulse: 80,
    bloodSugar: 118,
    note: "เริ่มลดของหวาน กินผักนึ่งเยอะขึ้น"
  },
  {
    id: "rec-2-3",
    seniorId: "senior-2",
    date: "2026-07-12",
    weight: 64.5,
    systolic: 129,
    diastolic: 81,
    pulse: 76,
    bloodSugar: 110,
    note: "คุมอาหารแป้ง ดีขึ้นตามลำดับ"
  },
  {
    id: "rec-2-4",
    seniorId: "senior-2",
    date: "2026-07-13",
    weight: 64.2,
    systolic: 134,
    diastolic: 82,
    pulse: 79,
    bloodSugar: 105,
    note: "วันนี้ตื่นไปเดินเล่นยามเช้า ดื่มน้ำอุ่น"
  },

  // Senior 3: Por Ui In (Hypertension stage 2 risk, underweight/slight, older)
  {
    id: "rec-3-1",
    seniorId: "senior-3",
    date: "2026-07-10",
    weight: 48.0,
    systolic: 165,
    diastolic: 95,
    pulse: 68,
    bloodSugar: 88,
    note: "ปวดหัวมึนศีรษะตอนเช้า"
  },
  {
    id: "rec-3-2",
    seniorId: "senior-3",
    date: "2026-07-11",
    weight: 47.8,
    systolic: 158,
    diastolic: 92,
    pulse: 65,
    bloodSugar: 90,
    note: "พักผ่อนมากขึ้น ดื่มน้ำเยอะขึ้น"
  },
  {
    id: "rec-3-3",
    seniorId: "senior-3",
    date: "2026-07-12",
    weight: 48.2,
    systolic: 162,
    diastolic: 94,
    pulse: 67,
    bloodSugar: 87,
    note: "ลืมทานยาความดันช่วงเย็น"
  },
  {
    id: "rec-3-4",
    seniorId: "senior-3",
    date: "2026-07-13",
    weight: 48.1,
    systolic: 155,
    diastolic: 90,
    pulse: 69,
    bloodSugar: 89,
    note: "วันนี้วัดได้ดีขึ้น แต่ยังเฝ้าระวังอยู่"
  }
];
