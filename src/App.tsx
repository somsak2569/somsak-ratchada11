import React, { useState, useEffect } from "react";
import {
  Heart,
  Activity,
  TrendingUp,
  UserPlus,
  PlusCircle,
  Users,
  Smile,
  Volume2,
  VolumeX,
  Sparkles,
  MapPin,
  User,
  Calendar,
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  Check,
  Shield,
  Clock,
  AlertCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  AreaChart,
  Area
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { SeniorProfile, HealthRecord } from "./types";
import { SEED_PROFILES, SEED_RECORDS } from "./data";
import {
  calculateBMI,
  getBMICategory,
  getBPCategory,
  getSugarCategory,
  getPulseCategory
} from "./utils";

export default function App() {
  // --- Persistent States ---
  const [profiles, setProfiles] = useState<SeniorProfile[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");

  // --- UI Controls ---
  const [activeTab, setActiveTab] = useState<"dashboard" | "add-record" | "history" | "add-member" | "ai-doctor">("dashboard");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Form States (New Record) ---
  const [weight, setWeight] = useState<string>("");
  const [systolic, setSystolic] = useState<string>("");
  const [diastolic, setDiastolic] = useState<string>("");
  const [pulse, setPulse] = useState<string>("");
  const [bloodSugar, setBloodSugar] = useState<string>("");
  const [recordDate, setRecordDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [recordNote, setRecordNote] = useState<string>("");

  // --- Form States (New Member) ---
  const [newFirstName, setNewFirstName] = useState<string>("");
  const [newLastName, setNewLastName] = useState<string>("");
  const [newAge, setNewAge] = useState<string>("");
  const [newHeight, setNewHeight] = useState<string>("");

  // --- AI States ---
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // --- Text-to-Speech States ---
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // --- Load Data on Mount ---
  useEffect(() => {
    const localProfiles = localStorage.getItem("ratchada_profiles");
    const localRecords = localStorage.getItem("ratchada_records");

    let finalProfiles = SEED_PROFILES;
    let finalRecords = SEED_RECORDS;

    if (localProfiles) {
      try {
        finalProfiles = JSON.parse(localProfiles);
      } catch (e) {
        console.error("Failed to parse profiles, resetting to seed data", e);
      }
    } else {
      localStorage.setItem("ratchada_profiles", JSON.stringify(SEED_PROFILES));
    }

    if (localRecords) {
      try {
        finalRecords = JSON.parse(localRecords);
      } catch (e) {
        console.error("Failed to parse records, resetting to seed data", e);
      }
    } else {
      localStorage.setItem("ratchada_records", JSON.stringify(SEED_RECORDS));
    }

    setProfiles(finalProfiles);
    setRecords(finalRecords);

    if (finalProfiles.length > 0) {
      setSelectedProfileId(finalProfiles[0].id);
    }
  }, []);

  // --- Helper to Trigger Toasts ---
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- Speak text aloud (TTS) ---
  const handleSpeakText = (textToSpeak: string) => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      // Clean markdown tags for clear speech synthesis
      const cleanText = textToSpeak
        .replace(/\*\*|#|\*|-/g, "")
        .replace(/เจ้า/g, "เจ้า, ")
        .replace(/นะกรับ|นะค่ะ|นะเจ้า/g, "นะเจ้า ");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "th-TH";
      utterance.rate = 0.95; // Slightly slower for elderly ears

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      triggerToast("อุปกรณ์นี้ไม่รองรับระบบออกเสียงภาษาไทยเจ้า");
    }
  };

  // Stop speech when tab changes
  useEffect(() => {
    if (isSpeaking && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [activeTab]);

  // --- Derived states ---
  const currentProfile = profiles.find((p) => p.id === selectedProfileId);
  const currentRecords = records
    .filter((r) => r.seniorId === selectedProfileId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const latestRecord = currentRecords.length > 0 ? currentRecords[currentRecords.length - 1] : null;

  // Real-time calculations as user types in Form
  const tempWeightNum = parseFloat(weight) || 0;
  const tempHeightNum = currentProfile?.height || 160;
  const tempBMI = calculateBMI(tempWeightNum, tempHeightNum);
  const tempBMIData = getBMICategory(tempBMI);

  const tempSystolicNum = parseInt(systolic) || 0;
  const tempDiastolicNum = parseInt(diastolic) || 0;
  const tempBPData = getBPCategory(tempSystolicNum, tempDiastolicNum);

  const tempSugarNum = parseInt(bloodSugar) || 0;
  const tempSugarData = getSugarCategory(tempSugarNum);

  // --- Add New Member ---
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newLastName.trim()) {
      triggerToast("กรุณากรอกชื่อและนามสกุลด้วยเจ้า");
      return;
    }
    const ageNum = parseInt(newAge);
    const heightNum = parseInt(newHeight);

    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
      triggerToast("กรุณากรอกอายุที่ถูกต้องเจ้า");
      return;
    }
    if (isNaN(heightNum) || heightNum < 50 || heightNum > 250) {
      triggerToast("กรุณากรอกส่วนสูงที่ถูกต้องเจ้า");
      return;
    }

    const newProfile: SeniorProfile = {
      id: "senior-" + Date.now(),
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      age: ageNum,
      height: heightNum,
      createdAt: new Date().toISOString()
    };

    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    localStorage.setItem("ratchada_profiles", JSON.stringify(updatedProfiles));

    // Select the new member immediately
    setSelectedProfileId(newProfile.id);

    // Reset fields
    setNewFirstName("");
    setNewLastName("");
    setNewAge("");
    setNewHeight("");

    setActiveTab("dashboard");
    triggerToast(`เพิ่มข้อมูล ${newProfile.firstName} สำเร็จแล้วเจ้า!`);
  };

  // --- Add New Health Record ---
  const handleAddRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId) {
      triggerToast("กรุณาเลือกหรือสร้างโปรไฟล์ผู้สูงอายุก่อนเจ้า");
      return;
    }

    const weightNum = parseFloat(weight);
    const sysNum = parseInt(systolic);
    const diaNum = parseInt(diastolic);
    const pulseNum = parseInt(pulse);
    const sugarNum = parseFloat(bloodSugar) || 0;

    if (isNaN(weightNum) || weightNum <= 10 || weightNum > 300) {
      triggerToast("กรุณากรอกน้ำหนักที่ถูกต้อง (กก.) เจ้า");
      return;
    }
    if (isNaN(sysNum) || sysNum < 50 || sysNum > 300) {
      triggerToast("กรุณากรอกความดันโลหิตค่าบน (systolic) ที่ถูกต้องเจ้า");
      return;
    }
    if (isNaN(diaNum) || diaNum < 30 || diaNum > 200) {
      triggerToast("กรุณากรอกความดันโลหิตค่าล่าง (diastolic) ที่ถูกต้องเจ้า");
      return;
    }
    if (isNaN(pulseNum) || pulseNum < 30 || pulseNum > 250) {
      triggerToast("กรุณากรอกชีพจรที่ถูกต้องเจ้า");
      return;
    }

    const newRecord: HealthRecord = {
      id: "rec-" + Date.now(),
      seniorId: selectedProfileId,
      date: recordDate,
      weight: weightNum,
      systolic: sysNum,
      diastolic: diaNum,
      pulse: pulseNum,
      bloodSugar: sugarNum > 0 ? sugarNum : 0,
      note: recordNote.trim() || undefined
    };

    // Remove duplicates for the same date if needed, or simply append
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    localStorage.setItem("ratchada_records", JSON.stringify(updatedRecords));

    // Reset fields
    setWeight("");
    setSystolic("");
    setDiastolic("");
    setPulse("");
    setBloodSugar("");
    setRecordNote("");
    setRecordDate(new Date().toISOString().split("T")[0]);

    setActiveTab("dashboard");
    triggerToast("บันทึกข้อมูลสุขภาพเรียบร้อยแล้วเจ้า!");
  };

  // --- Call Express API for Gemini Health Analysis ---
  const handleGetAiAnalysis = async () => {
    if (!currentProfile || !latestRecord) {
      triggerToast("กรุณาเลือกโปรไฟล์และลงบันทึกข้อมูลสุขภาพก่อนเจ้า");
      return;
    }

    setIsAiLoading(true);
    setAiError(null);
    setAiAnalysis("");

    try {
      const bmiVal = calculateBMI(latestRecord.weight, currentProfile.height);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: `${currentProfile.firstName} ${currentProfile.lastName}`,
          age: currentProfile.age,
          height: currentProfile.height,
          weight: latestRecord.weight,
          bmi: bmiVal,
          systolic: latestRecord.systolic,
          diastolic: latestRecord.diastolic,
          pulse: latestRecord.pulse,
          sugar: latestRecord.bloodSugar > 0 ? latestRecord.bloodSugar : null
        })
      });

      if (!res.ok) {
        throw new Error("ระบบวิเคราะห์ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งเจ้า");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAiAnalysis(data.analysis);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "เกิดข้อผิดพลาดในการวิเคราะห์สุขภาพเจ้า");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Trigger analysis when entering AI Tab
  useEffect(() => {
    if (activeTab === "ai-doctor" && currentProfile && latestRecord) {
      handleGetAiAnalysis();
    }
  }, [activeTab, selectedProfileId]);

  return (
    <div id="app_root" className="min-h-screen bg-[#ecefe9] py-0 md:py-10 px-0 md:px-4 flex justify-center items-start font-sans antialiased text-[#2c3e2b]">
      
      {/* Smart Phone Wrapper to provide high-end, immersive mobile feeling on desktop, native on mobile */}
      <div id="phone_wrapper" className="w-full max-w-md bg-white min-h-[100vh] md:min-h-[840px] md:rounded-[40px] md:shadow-2xl md:border-8 md:border-emerald-900 overflow-hidden flex flex-col justify-between relative">
        
        {/* Smartphone top status bar (Decorative) */}
        <div id="phone_status_bar" className="hidden md:flex bg-emerald-950 text-emerald-200 text-xs px-6 py-2 justify-between items-center select-none font-mono">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            บ้านรัชดา หมู่ 11 • เชียงกลาง • น่าน
          </span>
          <div className="flex items-center gap-2">
            <span>สัญญาณดี</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
        </div>

        {/* Application Header */}
        <header id="app_header" className="bg-emerald-800 text-white p-5 rounded-b-[24px] shadow-md flex flex-col gap-3 relative overflow-hidden">
          {/* Nan Mountains Graphic Accents */}
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-4">
            <Activity className="w-48 h-48 text-white" />
          </div>

          <div className="flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-2xl shadow-inner border-2 border-emerald-600">
                🏡
              </div>
              <div>
                <p className="text-emerald-200 text-xs tracking-wider">แอปสุขภาพมือถือ</p>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1 font-display">
                  บ้านรัชดา ม.11
                </h1>
              </div>
            </div>
            
            <span className="bg-emerald-700/80 text-emerald-100 text-[11px] px-2.5 py-1 rounded-full border border-emerald-600/50 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-amber-300" /> 
              เปือ-เชียงกลาง
            </span>
          </div>

          {/* Profile Selector Banner */}
          <div className="bg-emerald-900/90 rounded-2xl p-3 border border-emerald-700/60 flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2.5 overflow-hidden w-[75%]">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-semibold text-lg flex-shrink-0">
                👴
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-emerald-300 text-[10px] uppercase tracking-wider font-semibold">ผู้สูงอายุที่วัดสุขภาพ</p>
                {currentProfile ? (
                  <h2 className="text-sm font-bold text-white truncate">
                    {currentProfile.firstName} {currentProfile.lastName} ({currentProfile.age} ปี)
                  </h2>
                ) : (
                  <p className="text-sm text-emerald-200 italic truncate">ยังไม่มีรายชื่อผู้สูงอายุ</p>
                )}
              </div>
            </div>

            {/* Quick Profile switcher modal trigger/dropdown */}
            <select
              id="profile_select"
              className="bg-emerald-950 text-emerald-100 text-xs px-2 py-1.5 rounded-lg border border-emerald-600 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer max-w-[100px]"
              value={selectedProfileId}
              onChange={(e) => {
                setSelectedProfileId(e.target.value);
                setActiveTab("dashboard");
              }}
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="text-emerald-950">
                  {p.firstName}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Dynamic Toast Message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-44 left-4 right-4 z-50 bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg border border-amber-400 font-bold text-center text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 flex-shrink-0" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Dynamic Screen Content */}
        <main id="app_main_content" className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <AnimatePresence mode="wait">
            
            {/* Tab 1: Dashboard View */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {currentProfile ? (
                  <>
                    {/* Latest Record Stats Grid */}
                    <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/60 flex items-center justify-between text-xs text-emerald-800">
                      <span className="flex items-center gap-1 font-semibold">
                        <User className="w-3.5 h-3.5 text-emerald-700" />
                        ส่วนสูง: <b className="text-emerald-900">{currentProfile.height} ซม.</b>
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        บันทึกสุขภาพล่าสุด:{" "}
                        <b className="text-emerald-900">
                          {latestRecord ? latestRecord.date : "ไม่มีข้อมูล"}
                        </b>
                      </span>
                    </div>

                    {latestRecord ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-[#2c3e2b] text-base flex items-center gap-1.5 font-display">
                            <ClipboardList className="w-5 h-5 text-emerald-700" />
                            ผลการตรวจวัดสุขภาพล่าสุด
                          </h3>
                        </div>

                        {/* Visual Metric Cards */}
                        <div className="grid grid-cols-2 gap-3">
                          
                          {/* Weight & BMI Card */}
                          {(() => {
                            const bmi = calculateBMI(latestRecord.weight, currentProfile.height);
                            const bmiData = getBMICategory(bmi);
                            return (
                              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition">
                                <div>
                                  <span className="text-[11px] text-gray-500 font-semibold block">น้ำหนัก & ดัชนีมวลกาย</span>
                                  <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-bold font-mono text-emerald-950">{latestRecord.weight}</span>
                                    <span className="text-xs text-gray-500 font-semibold">กก.</span>
                                  </div>
                                </div>
                                <div className={`mt-3 p-1.5 rounded-lg border ${bmiData.bgColor} ${bmiData.borderColor} text-center`}>
                                  <p className="text-[10px] font-semibold text-gray-500">ดัชนีมวลกาย (BMI)</p>
                                  <p className="font-mono font-bold text-sm text-emerald-950">{bmi}</p>
                                  <p className={`text-[9px] font-bold ${bmiData.color} mt-0.5`}>{bmiData.label}</p>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Fasting Blood Sugar Card */}
                          {(() => {
                            const hasSugar = latestRecord.bloodSugar > 0;
                            const sugarData = getSugarCategory(latestRecord.bloodSugar);
                            return (
                              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition">
                                <div>
                                  <span className="text-[11px] text-gray-500 font-semibold block">ค่าน้ำตาลในเลือด</span>
                                  <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-bold font-mono text-emerald-950">
                                      {hasSugar ? latestRecord.bloodSugar : "-"}
                                    </span>
                                    <span className="text-xs text-gray-500 font-semibold">mg/dL</span>
                                  </div>
                                </div>
                                <div className={`mt-3 p-1.5 rounded-lg border ${hasSugar ? `${sugarData.bgColor} ${sugarData.borderColor}` : 'bg-gray-50 border-gray-200'} text-center flex-1 flex flex-col justify-center`}>
                                  {hasSugar ? (
                                    <>
                                      <p className="text-[10px] font-semibold text-gray-500">ประเมินน้ำตาล</p>
                                      <p className={`text-[10px] font-bold ${sugarData.color} mt-0.5`}>{sugarData.label}</p>
                                    </>
                                  ) : (
                                    <p className="text-[10px] text-gray-400 italic font-medium">ไม่ได้วัดค่าน้ำตาล</p>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Blood Pressure Card (Spans 2 columns for clear detail) */}
                          {(() => {
                            const bpData = getBPCategory(latestRecord.systolic, latestRecord.diastolic);
                            const isCrisis = bpData.label.includes("วิกฤต");
                            return (
                              <div className={`col-span-2 bg-white p-4 rounded-2xl shadow-sm border ${isCrisis ? 'border-red-400 bg-red-50/20 pulse-warning' : 'border-emerald-100'} hover:shadow-md transition`}>
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                  <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                                    <Activity className="w-3.5 h-3.5 text-rose-500" /> ความดันโลหิต (ค่าบน / ค่าล่าง)
                                  </span>
                                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${bpData.bgColor} ${bpData.borderColor} ${bpData.color}`}>
                                    {bpData.label}
                                  </span>
                                </div>
                                
                                <div className="flex justify-around items-center py-1">
                                  <div className="text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ค่าบน (Systolic)</p>
                                    <div className="flex items-baseline justify-center gap-0.5 mt-1">
                                      <span className="text-3xl font-extrabold font-mono text-emerald-950">{latestRecord.systolic}</span>
                                      <span className="text-xs text-gray-500 font-bold">mmHg</span>
                                    </div>
                                  </div>
                                  
                                  <div className="h-10 w-[1px] bg-gray-200"></div>

                                  <div className="text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ค่าล่าง (Diastolic)</p>
                                    <div className="flex items-baseline justify-center gap-0.5 mt-1">
                                      <span className="text-3xl font-extrabold font-mono text-emerald-950">{latestRecord.diastolic}</span>
                                      <span className="text-xs text-gray-500 font-bold">mmHg</span>
                                    </div>
                                  </div>

                                  <div className="h-10 w-[1px] bg-gray-200"></div>

                                  <div className="text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ชีพจร (Pulse)</p>
                                    <div className="flex items-baseline justify-center gap-0.5 mt-1">
                                      <span className="text-2xl font-bold font-mono text-emerald-950">{latestRecord.pulse}</span>
                                      <span className="text-xs text-gray-500 font-semibold">ครั้ง/นาที</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-2.5 bg-gray-50/80 p-2 rounded-xl text-[11px] text-gray-600 border border-gray-100 flex items-start gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <span><b>คำแนะนำเบื้องต้น:</b> {bpData.advice}</span>
                                </div>
                              </div>
                            );
                          })()}

                        </div>

                        {latestRecord.note && (
                          <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/50 text-xs text-emerald-800">
                            <b>บันทึกผู้ตรวจ:</b> {latestRecord.note}
                          </div>
                        )}

                        {/* Quick Navigation to AI and Charts */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button
                            id="btn_view_charts"
                            onClick={() => setActiveTab("history")}
                            className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold py-3.5 px-4 rounded-2xl border border-emerald-200 transition text-sm flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                          >
                            <TrendingUp className="w-4 h-4" />
                            ดูแผนภูมิแนวโน้ม
                          </button>
                          
                          <button
                            id="btn_view_ai"
                            onClick={() => setActiveTab("ai-doctor")}
                            className="bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold py-3.5 px-4 rounded-2xl transition text-sm flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                          >
                            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                            ให้คุณหมอ AI วิเคราะห์
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-emerald-200 shadow-sm space-y-4">
                        <p className="text-sm text-gray-400">ยังไม่มีข้อมูลผลการตรวจวัดสุขภาพของสมาชิกท่านนี้</p>
                        <button
                          id="btn_add_first_record"
                          onClick={() => setActiveTab("add-record")}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-6 rounded-2xl transition text-sm flex items-center justify-center gap-2 mx-auto active:scale-95"
                        >
                          <PlusCircle className="w-4 h-4" />
                          ลงบันทึกข้อมูลครั้งแรกเจ้า
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-emerald-200 shadow-sm space-y-4">
                    <p className="text-sm text-gray-400">กรุณาเพิ่มสมาชิกผู้สูงอายุคนแรกของหมู่บ้านเพื่อเริ่มใช้งาน</p>
                    <button
                      id="btn_create_member_dashboard"
                      onClick={() => setActiveTab("add-member")}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-6 rounded-2xl transition text-sm flex items-center justify-center gap-2 mx-auto active:scale-95"
                    >
                      <UserPlus className="w-4 h-4" />
                      เพิ่มสมาชิกรายแรกเจ้า
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab 2: Add New Health Record Form */}
            {activeTab === "add-record" && (
              <motion.div
                key="add-record"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <button onClick={() => setActiveTab("dashboard")} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition active:scale-95">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-[#2c3e2b] text-base font-display">ลงบันทึกข้อมูลสุขภาพใหม่</h3>
                </div>

                {currentProfile ? (
                  <form onSubmit={handleAddRecordSubmit} className="space-y-4 bg-white p-4 rounded-3xl border border-emerald-100/50 shadow-sm">
                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                      <span className="text-base">📝</span>
                      <span>บันทึกผลให้กับคุณ <b>{currentProfile.firstName} {currentProfile.lastName}</b> (ส่วนสูงที่ลงทะเบียนไว้: {currentProfile.height} ซม.)</span>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-3.5">
                      
                      {/* Weight Input */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">น้ำหนักตัว (กก.) *</label>
                        <input
                          id="input_weight"
                          type="number"
                          step="0.1"
                          required
                          placeholder="เช่น 60.5"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                        />
                      </div>

                      {/* Blood Sugar Input */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">น้ำตาลในเลือด (mg/dL)</label>
                        <input
                          id="input_sugar"
                          type="number"
                          placeholder="เว้นว่างได้หากไม่วัด"
                          value={bloodSugar}
                          onChange={(e) => setBloodSugar(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                        />
                      </div>

                      {/* Systolic (ความดันค่าบน) */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">ความดันค่าบน (systolic) *</label>
                        <input
                          id="input_systolic"
                          type="number"
                          required
                          placeholder="เช่น 120"
                          value={systolic}
                          onChange={(e) => setSystolic(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                        />
                      </div>

                      {/* Diastolic (ความดันค่าล่าง) */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">ความดันค่าล่าง (diastolic) *</label>
                        <input
                          id="input_diastolic"
                          type="number"
                          required
                          placeholder="เช่น 80"
                          value={diastolic}
                          onChange={(e) => setDiastolic(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                        />
                      </div>

                      {/* Pulse Input */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">ชีพจร (ครั้ง/นาที) *</label>
                        <input
                          id="input_pulse"
                          type="number"
                          required
                          placeholder="เช่น 75"
                          value={pulse}
                          onChange={(e) => setPulse(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                        />
                      </div>

                      {/* Date of record */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">วันที่ตรวจวัด *</label>
                        <input
                          id="input_date"
                          type="date"
                          required
                          value={recordDate}
                          onChange={(e) => setRecordDate(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                        />
                      </div>

                    </div>

                    {/* Note Input */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">บันทึกเพิ่มเติม (ถ้ามี)</label>
                      <input
                        id="input_note"
                        type="text"
                        placeholder="เช่น วัดก่อนอาหารเช้า, มีอาการเวียนหัวนิดหน่อย"
                        value={recordNote}
                        onChange={(e) => setRecordNote(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    {/* Real-time Validation / Live Status Box */}
                    {(tempWeightNum > 0 || tempSystolicNum > 0 || tempSugarNum > 0) && (
                      <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 text-xs space-y-1.5">
                        <p className="font-bold text-emerald-950 mb-1">วิเคราะห์ผลลัพธ์ยามพิมพ์ (ทันที):</p>
                        
                        {tempWeightNum > 0 && (
                          <p className="flex items-center justify-between">
                            <span>ดัชนีมวลกาย BMI: <b>{tempBMI}</b></span>
                            <span className={`font-bold ${tempBMIData.color}`}>{tempBMIData.label}</span>
                          </p>
                        )}

                        {tempSystolicNum > 0 && tempDiastolicNum > 0 && (
                          <p className="flex items-center justify-between">
                            <span>ความดันโลหิต: <b>{tempSystolicNum}/{tempDiastolicNum}</b></span>
                            <span className={`font-bold ${tempBPData.color}`}>{tempBPData.label}</span>
                          </p>
                        )}

                        {tempSugarNum > 0 && (
                          <p className="flex items-center justify-between">
                            <span>ระดับน้ำตาล: <b>{tempSugarNum}</b> mg/dL</span>
                            <span className={`font-bold ${tempSugarData.color}`}>{tempSugarData.label}</span>
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      id="btn_submit_record"
                      type="submit"
                      className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transition active:scale-95 text-base flex items-center justify-center gap-2 cursor-pointer mt-3"
                    >
                      <Check className="w-5 h-5" />
                      บันทึกข้อมูลสุขภาพเจ้า
                    </button>
                  </form>
                ) : (
                  <p className="text-gray-400 italic text-center">กรุณาสร้างโปรไฟล์ก่อนบันทึกสุขภาพเจ้า</p>
                )}
              </motion.div>
            )}

            {/* Tab 3: History & Charts */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <button onClick={() => setActiveTab("dashboard")} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition active:scale-95">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-[#2c3e2b] text-base font-display">กราฟแนวโน้มรายงานผลสุขภาพ</h3>
                </div>

                {currentRecords.length > 0 ? (
                  <div className="space-y-4 pb-6">
                    <p className="text-xs text-gray-500 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      📈 วิเคราะห์รายงานสุขภาพของคุณ <b>{currentProfile?.firstName}</b> เป็นกราฟความเคลื่อนไหว ยิ่งมีจุดบันทึกเยอะ ยิ่งติดตามสถานะโรคได้แม่นยำขึ้นเจ้า
                    </p>

                    {/* Chart 1: Blood Pressure Trend (Systolic & Diastolic) */}
                    <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                        กราฟความดันโลหิต (ค่าบน / ค่าล่าง) mmHg
                      </p>
                      
                      <div className="h-52 w-full text-xs font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={currentRecords}
                            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis domain={[40, 200]} stroke="#94a3b8" />
                            <Tooltip
                              contentStyle={{ background: "#2e6f40", color: "#fff", borderRadius: "12px", border: "none" }}
                              labelClassName="font-bold text-amber-200"
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            <ReferenceLine y={140} label={{ value: "เริ่มสูง (140)", fill: "#f97316", position: "insideBottomLeft", fontSize: 10 }} stroke="#f97316" strokeDasharray="3 3" />
                            <ReferenceLine y={90} label={{ value: "เริ่มสูง (90)", fill: "#f97316", position: "insideBottomLeft", fontSize: 10 }} stroke="#f97316" strokeDasharray="3 3" />
                            <Line
                              name="ความดันบน (Systolic)"
                              type="monotone"
                              dataKey="systolic"
                              stroke="#ef4444"
                              strokeWidth={3}
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              name="ความดันล่าง (Diastolic)"
                              type="monotone"
                              dataKey="diastolic"
                              stroke="#0d9488"
                              strokeWidth={3}
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Chart 2: Fasting Blood Sugar Trend */}
                    {(() => {
                      const recordsWithSugar = currentRecords.filter((r) => r.bloodSugar > 0);
                      if (recordsWithSugar.length === 0) return null;
                      return (
                        <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm">
                          <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            กราฟระดับน้ำตาลในเลือด (Fasting Blood Sugar) mg/dL
                          </p>
                          
                          <div className="h-52 w-full text-xs font-mono">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={recordsWithSugar}
                                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                              >
                                <defs>
                                  <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis domain={[50, 200]} stroke="#94a3b8" />
                                <Tooltip
                                  contentStyle={{ background: "#2e6f40", color: "#fff", borderRadius: "12px", border: "none" }}
                                  labelClassName="font-bold text-amber-200"
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                <ReferenceLine y={126} label={{ value: "เกณฑ์เสี่ยงเบาหวาน (126)", fill: "#ef4444", position: "insideBottomLeft", fontSize: 10 }} stroke="#ef4444" strokeDasharray="3 3" />
                                <ReferenceLine y={100} label={{ value: "เริ่มสูง (100)", fill: "#f59e0b", position: "insideBottomLeft", fontSize: 10 }} stroke="#f59e0b" strokeDasharray="3 3" />
                                <Area
                                  name="ระดับน้ำตาล"
                                  type="monotone"
                                  dataKey="bloodSugar"
                                  stroke="#f59e0b"
                                  fillOpacity={1}
                                  fill="url(#colorSugar)"
                                  strokeWidth={3}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Chart 3: Weight Trend */}
                    <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        กราฟแนวโน้มน้ำหนักตัว (Weight Trend) กิโลกรัม
                      </p>
                      
                      <div className="h-52 w-full text-xs font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={currentRecords}
                            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                              contentStyle={{ background: "#2e6f40", color: "#fff", borderRadius: "12px", border: "none" }}
                              labelClassName="font-bold text-amber-200"
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            <Line
                              name="น้ำหนัก (กก.)"
                              type="monotone"
                              dataKey="weight"
                              stroke="#059669"
                              strokeWidth={3}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* List Table of History */}
                    <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-sm">
                      <h4 className="font-bold text-emerald-950 text-sm mb-3 font-display flex items-center gap-1">
                        📊 ตารางข้อมูลประวัติทั้งหมด
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-emerald-50 text-emerald-900 font-bold border-b border-emerald-100">
                              <th className="p-2 font-display">วันที่</th>
                              <th className="p-2 font-display">น้ำหนัก</th>
                              <th className="p-2 font-display">ความดัน</th>
                              <th className="p-2 font-display">น้ำตาล</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRecords.slice().reverse().map((r) => (
                              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 font-mono font-semibold">
                                <td className="p-2 text-gray-600">{r.date}</td>
                                <td className="p-2 text-emerald-950">{r.weight} กก.</td>
                                <td className="p-2 text-rose-600">{r.systolic}/{r.diastolic}</td>
                                <td className="p-2 text-amber-600">{r.bloodSugar > 0 ? `${r.bloodSugar}` : "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                ) : (
                  <p className="text-gray-400 italic text-center py-10">ยังไม่มีข้อมูลสำหรับวาดแผนภูมิแนวโน้มเจ้า</p>
                )}
              </motion.div>
            )}

            {/* Tab 4: Add New Member Form */}
            {activeTab === "add-member" && (
              <motion.div
                key="add-member"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <button onClick={() => setActiveTab("dashboard")} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition active:scale-95">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-[#2c3e2b] text-base font-display">ลงทะเบียนผู้สูงอายุรายใหม่</h3>
                </div>

                <form onSubmit={handleAddMemberSubmit} className="space-y-4 bg-white p-5 rounded-3xl border border-emerald-100/50 shadow-sm">
                  <div className="text-center py-2">
                    <span className="text-4xl block">👴👵</span>
                    <p className="text-xs text-gray-400 mt-2">กรอกข้อมูลพื้นฐานเพื่อลงทะเบียนสมาชิกลงแฟ้มหมู่บ้านเปือ หมู่ 11เจ้า</p>
                  </div>

                  {/* First Name */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">ชื่อจริง (เช่น ดี) *</label>
                    <input
                      id="input_new_first"
                      type="text"
                      required
                      placeholder="ไม่ต้องกรอกคำนำหน้า เช่น ดี"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">นามสกุล (เช่น ศรีเชียงกลาง) *</label>
                    <input
                      id="input_new_last"
                      type="text"
                      required
                      placeholder="กรอกนามสกุล"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Age */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">อายุ (ปี) *</label>
                      <input
                        id="input_new_age"
                        type="number"
                        required
                        placeholder="เช่น 74"
                        value={newAge}
                        onChange={(e) => setNewAge(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                      />
                    </div>

                    {/* Height */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">ส่วนสูง (ซม.) *</label>
                      <input
                        id="input_new_height"
                        type="number"
                        required
                        placeholder="เช่น 165"
                        value={newHeight}
                        onChange={(e) => setNewHeight(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button
                    id="btn_submit_member"
                    type="submit"
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transition active:scale-95 text-base flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    <UserPlus className="w-5 h-5" />
                    ยืนยันการลงทะเบียนสมาชิเจ้า
                  </button>
                </form>
              </motion.div>
            )}

            {/* Tab 5: AI Doctor Analysis */}
            {activeTab === "ai-doctor" && (
              <motion.div
                key="ai-doctor"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <button onClick={() => setActiveTab("dashboard")} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition active:scale-95">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-[#2c3e2b] text-base font-display">คุณหมอ AI วิเคราะห์สุขภาพส่วนบุคคล</h3>
                </div>

                <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-4 rounded-3xl text-white shadow-md relative overflow-hidden flex items-center justify-between">
                  <div className="z-10 space-y-1">
                    <p className="text-[10px] uppercase text-emerald-200 font-bold tracking-wider">แชทบอทวิเคราะห์พฤติกรรม</p>
                    <h4 className="font-bold text-sm font-display flex items-center gap-1.5 text-white">
                      <Sparkles className="w-4.5 h-4.5 text-amber-300 fill-amber-300" />
                      คุณหมอดี (Mhor Dee AI)
                    </h4>
                    <p className="text-[10px] text-emerald-100">แพทย์จำลองเฉพาะทางสำหรับผู้สูงอายุ ต.เปือ น่าน</p>
                  </div>
                  <span className="text-4xl filter drop-shadow z-10 select-none">🩺</span>
                </div>

                {isAiLoading ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-emerald-100 shadow-sm flex flex-col items-center justify-center space-y-4">
                    <div className="w-14 h-14 rounded-full border-4 border-emerald-200 border-t-emerald-800 animate-spin"></div>
                    <div className="space-y-1.5 animate-pulse">
                      <p className="text-sm font-bold text-emerald-900 font-display">คุณหมอดีกำลังใคร่ครวญข้อมูลสุขภาพเจ้า...</p>
                      <p className="text-xs text-gray-400">คำนวณ BMI, ดัชนีความดัน, ค่าน้ำตาล และจัดเตรียมข้อมูลแนะนำตามวิถีชาวน่าน</p>
                    </div>
                  </div>
                ) : aiError ? (
                  <div className="bg-red-50 p-4 rounded-3xl border border-red-200 text-center space-y-3">
                    <p className="text-xs text-red-600 font-bold">{aiError}</p>
                    <button
                      id="btn_retry_ai"
                      onClick={handleGetAiAnalysis}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition active:scale-95"
                    >
                      ลองวิเคราะห์ใหม่อีกรอบเจ้า
                    </button>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-3">
                    {/* Read Aloud Box Accent */}
                    <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100/50 flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                        {isSpeaking ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        )}
                        <span>{isSpeaking ? "กำลังอ่านออกเสียงให้ฟัง..." : "ให้คุณหมอดีช่วยอ่านออกเสียงให้ฟัง"}</span>
                      </div>
                      <button
                        id="btn_speak_toggle"
                        onClick={() => handleSpeakText(aiAnalysis)}
                        className={`px-3 py-2 rounded-xl flex items-center gap-1 text-xs font-bold shadow-sm transition active:scale-95 ${
                          isSpeaking ? "bg-red-100 text-red-700 border border-red-200" : "bg-emerald-800 text-white hover:bg-emerald-900"
                        }`}
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        {isSpeaking ? "หยุด" : "เปิดเสียงป้ออุ้ยแม่อุ้ย"}
                      </button>
                    </div>

                    {/* AI Markdown-like Response Container */}
                    <div className="bg-white p-5 rounded-3xl border border-emerald-100/50 shadow-sm text-left relative">
                      <div className="prose prose-sm text-[#2c3e2b] text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {aiAnalysis}
                      </div>

                      {/* Nan Province Warm Sign-off Stamp */}
                      <div className="mt-5 border-t border-gray-100 pt-3 flex justify-between items-center text-[10px] text-gray-400">
                        <span>วิเคราะห์โดยปัญญาประดิษฐ์ Gemini 3.5</span>
                        <span className="font-semibold flex items-center gap-1 text-emerald-800">
                          🏡 บ้านรัชดา หมู่ 11 ต.เปือ อ.เชียงกลาง
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-emerald-200 shadow-sm space-y-4">
                    <p className="text-sm text-gray-400">กรุณากดวิเคราะห์ข้อมูลสุขภาพเพื่อขอคำแนะนำด้านพฤติกรรมโภชนาการและการใช้ชีวิตของชาวน่านเจ้า</p>
                    <button
                      id="btn_start_ai"
                      onClick={handleGetAiAnalysis}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-6 rounded-2xl transition text-sm flex items-center justify-center gap-2 mx-auto active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      ให้คุณหมอดีเริ่มต้นวิเคราะห์สุขภาพเจ้า
                    </button>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Smartphone Bottom Tab Navigation */}
        <nav id="app_nav" className="bg-white border-t border-emerald-50 px-3 py-3 flex justify-around items-center rounded-t-[24px] shadow-lg z-20">
          
          {/* Nav Tab 1: Dashboard */}
          <button
            id="nav_dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === "dashboard" ? "bg-emerald-50 text-emerald-800 font-bold scale-105" : "text-gray-400 hover:text-emerald-700"
            }`}
          >
            <Smile className="w-5.5 h-5.5 mb-1" />
            <span className="text-[10px]">หน้าแรก</span>
          </button>

          {/* Nav Tab 2: Add record */}
          <button
            id="nav_add_record"
            onClick={() => {
              if (profiles.length === 0) {
                triggerToast("กรุณาสร้างประวัติผู้สูงอายุรายใหม่ก่อนเจ้า");
                setActiveTab("add-member");
              } else {
                setActiveTab("add-record");
              }
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === "add-record" ? "bg-emerald-50 text-emerald-800 font-bold scale-105" : "text-gray-400 hover:text-emerald-700"
            }`}
          >
            <PlusCircle className="w-5.5 h-5.5 mb-1" />
            <span className="text-[10px]">บันทึกใหม่</span>
          </button>

          {/* Nav Tab 3: Trends/History */}
          <button
            id="nav_history"
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === "history" ? "bg-emerald-50 text-emerald-800 font-bold scale-105" : "text-gray-400 hover:text-emerald-700"
            }`}
          >
            <TrendingUp className="w-5.5 h-5.5 mb-1" />
            <span className="text-[10px]">กราฟ-ประวัติ</span>
          </button>

          {/* Nav Tab 4: AI Advisor */}
          <button
            id="nav_ai_doctor"
            onClick={() => setActiveTab("ai-doctor")}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === "ai-doctor" ? "bg-emerald-50 text-emerald-800 font-bold scale-105 animate-pulse" : "text-gray-400 hover:text-emerald-700"
            }`}
          >
            <Sparkles className="w-5.5 h-5.5 mb-1 text-teal-600 fill-teal-100" />
            <span className="text-[10px] text-teal-800">วิเคราะห์ AI</span>
          </button>

          {/* Nav Tab 5: Register Member */}
          <button
            id="nav_add_member"
            onClick={() => setActiveTab("add-member")}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === "add-member" ? "bg-emerald-50 text-emerald-800 font-bold scale-105" : "text-gray-400 hover:text-emerald-700"
            }`}
          >
            <UserPlus className="w-5.5 h-5.5 mb-1" />
            <span className="text-[10px]">เพิ่มสมาชิก</span>
          </button>

        </nav>

        {/* Decorative Smartphone virtual home line (only visible on desktop wrapper) */}
        <div id="phone_home_bar" className="hidden md:block w-32 h-1.5 bg-emerald-900/40 rounded-full mx-auto my-1.5 flex-shrink-0 select-none pointer-events-none"></div>

      </div>
    </div>
  );
}
