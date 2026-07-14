import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing middleware
  app.use(express.json());

  // API Route: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Elderly Health Server is running" });
  });

  // API Route: AI Health Analysis using Gemini
  app.post("/api/analyze", async (req, res) => {
    try {
      const { name, age, gender, height, weight, bmi, systolic, diastolic, pulse, sugar } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Missing required parameter: name" });
      }

      // Check if API key is present
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          analysis: `(หมายเหตุ: ยังไม่มีการตั้งค่ากุญแจบริการ AI - GEMINI_API_KEY ในระบบ)\n\nสวัสดีเจ้าคุณ ${name} อายุ ${age} ปี ยินดีต้อนรับสู่ระบบตรวจสุขภาพบ้านรัชดา หมู่ 11 เจ้า!\n\nจากผลการวัด:\n- น้ำหนัก ${weight} กก. ส่วนสูง ${height} ซม. (ดัชนีมวลกาย BMI: ${bmi || 'ไม่ได้คำนวณ'})\n- ความดันโลหิต: ${systolic}/${diastolic} mmHg (ชีพจร: ${pulse} ครั้ง/นาที)\n- ค่าน้ำตาลในเลือด: ${sugar ? sugar + ' mg/dL' : 'ไม่ได้ระบุ'}\n\nคำแนะนำเบื้องต้น: ขอความกรุณาเจ้าของเครื่องอัปเดต GEMINI_API_KEY ในแถบความลับ (Secrets) เพื่อเปิดใช้งานบริการคุณหมอ AI วิเคราะห์ข้อมูลอย่างเป็นธรรมชาติเจ้า! แต่ขณะนี้ท่านสามารถรับชมแผนภูมิแนวโน้มสุขภาพและการจำแนกค่ามาตรฐานตามตารางสีทางด้านล่างได้ทันทีเจ้า.`
        });
      }

      const client = getGeminiClient();

      const systemPrompt = `คุณคือ "หมอดี (Mhor Dee)" คุณหมอ AI ประจำใจและผู้ช่วยดูแลสุขภาพผู้สูงอายุแสนอบอุ่นประจำบ้านรัชดา หมู่ 11 ตำบลเปือ อำเภอเชียงกลาง จังหวัดน่าน
คุณพูดคุยภาษาไทยเป็นหลักที่เปี่ยมไปด้วยความสุภาพ อ่อนโยน ให้เกียรติ ยิ้มแย้ม และแทรกคำศัพท์ภาษาเหนือ (คำเมือง) ที่อ่อนหวานนอบน้อมเพื่อสร้างความคุ้นเคยให้ผู้สูงอายุรู้สึกรักและสบายใจ เช่น "สวัสดีเจ้าป้ออุ้ยแม่อุ้ย", "อโรคยา ปรมา ลาภา (ความไม่มีโรคเป็นลาภอันประเสริฐ)", "ดูแลสุขภาพดีๆ เน้อเจ้า", "กิ๋นข้าวลำๆ เน้อ", "เป๋นห่วงเน้อเจ้า"

หน้าที่ของคุณ:
1. วิเคราะห์ข้อมูลสุขภาพปัจจุบันของผู้ใช้งานอย่างละเอียด
2. จำแนกสถานะ ดัชนีมวลกาย (BMI), ความดันโลหิต, ชีพจร และ ค่าน้ำตาลในเลือด ตามมาตรฐานสาธารณสุขไทย
3. เสนอแนะคำแนะนำสุขภาพที่ "เป็นรูปธรรมและเหมาะกับวิถีชีวิตชาวจังหวัดน่าน อำเภอเชียงกลาง" เช่น:
   - ด้านอาหาร: ชวนกินผักนึ่ง น้ำพริกหนุ่ม ลาบปลา แกงแค หลีกเลี่ยงของเค็มจัด ขนมขบเคี้ยว หรือของหวานจัด
   - ด้านการออกกำลังกาย/กิจกรรม: แนะนำให้เดินรับลมเย็นยามเช้าแถวบ้านรัชดา ยืดเหยียดร่างกายเบาๆ ไปร่วมกิจกรรมที่โรงเรียนผู้สูงอายุ ต.เปือ หรือไปทำบุญที่วัด
   - สุขภาพจิต: แนะนำให้ทำจิตใจให้แจ่มใส สวดมนต์ นั่งสมาธิ คุยกับลูกหลาน
4. จบด้วยถ้อยคำให้กำลังใจที่สุภาพ อบอุ่น มีความหวัง และอ่อนน้อมถ่อมตน

กรุณาเขียนคำแนะนำโดยแบ่งส่วนให้ชัดเจน อ่านง่าย ใช้ตัวหนา และสัญลักษณ์ขีดเพื่อให้อ่านง่ายสำหรับสายตาผู้สูงอายุ`;

      const userMessage = `ผู้ป่วย: คุณ ${name}
อายุ: ${age} ปี
ส่วนสูง: ${height} ซม.
น้ำหนัก: ${weight} กก.
ค่า BMI: ${bmi}
ความดันโลหิต: ${systolic}/${diastolic} mmHg
อัตราการเต้นของหัวใจ (ชีพจร): ${pulse} ครั้งต่อนาที
ระดับน้ำตาลในเลือด: ${sugar ? sugar + ' mg/dL' : 'ไม่ได้ระบุ'}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "เกิดข้อผิดพลาดในการเรียกใช้ระบบวิเคราะห์ AI" });
    }
  });

  // Vite development or production mode static hosting
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Elderly Health server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
