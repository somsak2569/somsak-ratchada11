import { HealthRecord } from "./types";

export function calculateBMI(weight: number, heightCm: number): number {
  if (!heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  status: "normal" | "warning" | "danger";
  advice: string;
} {
  if (bmi <= 0) return { label: "ไม่มีข้อมูล", color: "text-gray-500", bgColor: "bg-gray-100", borderColor: "border-gray-200", status: "normal", advice: "-" };
  if (bmi < 18.5) {
    return {
      label: "น้ำหนักน้อยกว่าเกณฑ์ (ผอม)",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      status: "warning",
      advice: "ควรรับประทานอาหารที่มีคุณค่าทางโภชนาการเพิ่มขึ้น เน้นโปรตีนและคาร์โบไฮเดรตเชิงซ้อน"
    };
  }
  if (bmi < 23.0) {
    return {
      label: "น้ำหนักปกติ (สมส่วน)",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      status: "normal",
      advice: "รักษาสุขภาพและพฤติกรรมการกินที่ดีแบบนี้ต่อไป"
    };
  }
  if (bmi < 25.0) {
    return {
      label: "น้ำหนักเกิน",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      status: "warning",
      advice: "ควรเริ่มควบคุมอาหารประเภทแป้ง ของหวาน และออกกำลังกายเบาๆ เช่น การเดิน"
    };
  }
  if (bmi < 30.0) {
    return {
      label: "โรคอ้วนระดับ 1",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      status: "danger",
      advice: "ลดอาหารมัน ของทอด ของหวาน และเพิ่มการขยับร่างกายเพื่อความปลอดภัยของข้อเข่า"
    };
  }
  return {
    label: "โรคอ้วนระดับ 2 (อ้วนอันตราย)",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    status: "danger",
    advice: "ควรปรึกษาแพทย์หรือเจ้าหน้าที่สาธารณสุขเพื่อดูแลเรื่องน้ำหนักตัวอย่างปลอดภัย"
  };
}

export function getBPCategory(systolic: number, diastolic: number): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  status: "normal" | "warning" | "danger";
  advice: string;
} {
  if (!systolic || !diastolic) {
    return { label: "ไม่มีข้อมูล", color: "text-gray-500", bgColor: "bg-gray-100", borderColor: "border-gray-200", status: "normal", advice: "-" };
  }

  // Hypertensive Crisis
  if (systolic >= 180 || diastolic >= 110) {
    return {
      label: "วิกฤตความดันโลหิตสูงรุนแรง",
      color: "text-red-700 font-bold animate-pulse",
      bgColor: "bg-red-100",
      borderColor: "border-red-400",
      status: "danger",
      advice: "อันตรายมาก! ควรรีบนั่งพัก 5 นาทีแล้ววัดใหม่ หากยังสูงอยู่หรือมีอาการปวดศีรษะ ตาพร่ามัว ควรรีบไปโรงพยาบาลเชียงกลางทันที"
    };
  }

  // Stage 2 Hypertension
  if (systolic >= 160 || diastolic >= 100) {
    return {
      label: "ความดันโลหิตสูงระดับ 2",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      status: "danger",
      advice: "ความดันโลหิตสูงมาก ควรไปพบแพทย์เพื่อตรวจเช็กอย่างละเอียด หลีกเลี่ยงกิจกรรมที่เหนื่อยล้าเฉียบพลัน"
    };
  }

  // Stage 1 Hypertension
  if (systolic >= 140 || diastolic >= 90) {
    return {
      label: "ความดันโลหิตสูงระดับ 1",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      status: "warning",
      advice: "เริ่มมีความดันโลหิตสูง ควรลดละอาหารเค็มจัด ผงชูรส พักผ่อนให้เพียงพอ และวัดความดันเป็นประจำ"
    };
  }

  // Pre-hypertension
  if (systolic >= 120 || diastolic >= 80) {
    return {
      label: "ก่อนความดันโลหิตสูง (เฝ้าระวัง)",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      status: "warning",
      advice: "ความดันโลหิตค่อนข้างสูง ควรเริ่มดูแลสุขภาพ ลดของเค็มและนอนหลับให้สนิท"
    };
  }

  // Normal
  return {
    label: "ความดันโลหิตปกติ",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    status: "normal",
    advice: "ความดันโลหิตยอดเยี่ยม รักษาสุขภาพกายใจให้แจ่มใสแบบนี้สม่ำเสมอ"
  };
}

export function getSugarCategory(sugar: number): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  status: "normal" | "warning" | "danger";
  advice: string;
} {
  if (!sugar) return { label: "ไม่มีข้อมูล", color: "text-gray-500", bgColor: "bg-gray-100", borderColor: "border-gray-200", status: "normal", advice: "-" };

  if (sugar < 70) {
    return {
      label: "น้ำตาลในเลือดต่ำเกินไป",
      color: "text-sky-600",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200",
      status: "danger",
      advice: "เสี่ยงอาการวูบ หมดสติ ควรดื่มน้ำหวานหรือกินอมยิ้มทันที และแจ้งญาติหรือผู้ดูแลใกล้ชิด"
    };
  }
  if (sugar < 100) {
    return {
      label: "น้ำตาลในเลือดปกติ",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      status: "normal",
      advice: "ค่าน้ำตาลสวยงามมาก รักษารูปแบบการรับประทานอาหารที่ดีนี้ไว้"
    };
  }
  if (sugar < 126) {
    return {
      label: "เริ่มสูง (กลุ่มเสี่ยงเบาหวาน)",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      status: "warning",
      advice: "เริ่มเสี่ยงเบาหวาน ควรงดน้ำอัดลม ชาหวาน กาแฟใส่นมข้นหวาน ของหวาน และลดกินข้าวขัดสี"
    };
  }
  return {
    label: "สูงผิดปกติ (เสี่ยงเป็นเบาหวานสูง)",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    status: "danger",
    advice: "ค่าน้ำตาลค่อนข้างสูงมาก มีโอกาสเป็นเบาหวาน ควรปรึกษาแพทย์ที่ รพ.สต. หรือ รพ.เชียงกลาง เพื่อตรวจอย่างสม่ำเสมอ"
  };
}

export function getPulseCategory(pulse: number): {
  label: string;
  color: string;
} {
  if (!pulse) return { label: "ไม่มีข้อมูล", color: "text-gray-500" };
  if (pulse < 60) return { label: "ชีพจรช้ากว่าปกติ", color: "text-amber-600" };
  if (pulse <= 100) return { label: "ชีพจรปกติ", color: "text-emerald-600" };
  return { label: "ชีพจรเร็วกว่าปกติ", color: "text-red-600" };
}
