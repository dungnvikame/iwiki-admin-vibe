"use client";

import { useMemo, useState } from "react";

type Tab = "overview" | "articles" | "members" | "health";
type Tone = "blue" | "green" | "amber" | "red" | "purple" | "slate";
type PanelData = { title: string; subtitle?: string; content: React.ReactNode } | null;

const units = ["Toàn công ty", "iKame Games", "iKame Apps", "P&OD", "Technology"];
const periods = ["7 ngày qua", "15 ngày qua", "30 ngày qua", "H1 2025", "H2 2025"];
const categories = ["Tất cả phân loại", "Process & Guidelines", "Knowledge", "Best Practices", "Case Studies", "Others"];
const teamsByUnit: Record<string, string[]> = {
  "Toàn công ty": ["Tất cả team", "Games / Backend", "Games / Mobile", "Games / Design", "Apps / Backend", "Apps / QA", "P&OD / HR", "P&OD / L&D", "Technology / DevOps", "Technology / Frontend"],
  "iKame Games": ["Tất cả team", "Backend", "Mobile", "Design", "QA"],
  "iKame Apps": ["Tất cả team", "Backend", "Frontend", "QA", "Product"],
  "P&OD": ["Tất cả team", "HR", "L&D", "Internal Comms"],
  "Technology": ["Tất cả team", "DevOps", "Frontend", "Backend", "Security"],
};

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Tổng quan", icon: "⌘" },
  { id: "articles", label: "Bài viết", icon: "▤" },
  { id: "members", label: "Thành viên & PIC", icon: "♧" },
  { id: "health", label: "Health metrics", icon: "♡" },
];

const reviewArticles = [
  ["Quy trình bảo mật hệ thống & phân quyền", "Technology / DevOps", "Nguyễn V.A", "Process & Guidelines", 26],
  ["Hướng dẫn setup môi trường local dev", "Technology / Frontend", "Trần T.B", "Knowledge", 24],
  ["Chính sách nghỉ phép & remote work", "P&OD / HR", "Lê V.C", "Process & Guidelines", 22],
  ["SLA xử lý bug theo mức độ priority", "iKame Games / QA", "Phạm T.D", "Best Practices", 19],
  ["Quy trình onboarding nhân viên mới P&OD", "P&OD / HR", "Hoàng M.E", "Process & Guidelines", 17],
  ["Kiến trúc hệ thống iKame Apps v1", "iKame Apps / Backend", "Vũ T.F", "Knowledge", 15],
  ["Quy trình release mobile app", "iKame Games / Mobile", "Đặng V.G", "Process & Guidelines", 11],
  ["Hướng dẫn sử dụng Figma cho Design team", "iKame Games / Design", "Ngô T.H", "Knowledge", 10],
  ["Data retention & backup policy", "Technology / DevOps", "Phan V.I", "Process & Guidelines", 9],
] as const;

const topArticles = [
  ["Quy trình onboarding kỹ sư mới", "Technology", "3 tháng", 214, 48, "Còn hạn"],
  ["Hướng dẫn deploy production", "DevOps", "5 tháng", 187, 62, "Còn hạn"],
  ["Best practice code review", "Technology", "7 tháng", 143, 31, "Sắp hết hạn"],
  ["Quy trình xử lý incident", "DevOps", "9 tháng", 128, 44, "Sắp hết hạn"],
  ["Kiến trúc microservice iKame Games", "Backend", "14 tháng", 116, 29, "Outdate"],
] as const;

const members = [
  ["Nguyễn Minh A.", "Games/Backend", 5, 1, 0, 2, 312, "Hôm nay", "Tốt"],
  ["Trần Thị B.", "Tech/DevOps", 3, 2, 1, 0, 180, "Hôm qua", "Tốt"],
  ["Lê Văn C.", "P&OD/HR", 1, 0, 3, 4, 45, "8 ngày", "Cần nhắc"],
  ["Phạm Thị D.", "Apps/QA", 0, 0, 2, 1, 0, "18 ngày", "Không active"],
  ["Hoàng Minh E.", "Games/Design", 4, 3, 0, 0, 220, "Hôm nay", "Tốt"],
  ["Vũ Thị F.", "Tech/Frontend", 2, 1, 0, 3, 97, "3 ngày", "Theo dõi"],
  ["Đặng Văn G.", "Games/Mobile", 0, 0, 1, 5, 12, "21 ngày", "Không active"],
] as const;

const formulas = {
  total: "COUNT(bài viết có trạng thái Published) trong phạm vi bộ lọc.",
  newArticles: "COUNT(bài có published_at nằm trong khoảng thời gian đang chọn).",
  activeMembers: "Số thành viên có ít nhất 1 hành động trong 30 ngày / tổng thành viên được cấp quyền.",
  approvalTime: "AVG(approved_at − submitted_at) của các bài được duyệt trong kỳ.",
  views: "SUM(views) của tất cả bài viết thuộc phạm vi bộ lọc.",
  old12: "COUNT(bài Published có ngày cập nhật gần nhất cách hiện tại trên 12 tháng).",
  old6: "COUNT(bài Published có tuổi từ 6 đến 12 tháng và chưa review trong kỳ).",
  freshness: "Số bài được cập nhật trong 12 tháng gần nhất / tổng bài Published × 100.",
  search: "Số phiên tìm kiếm có ít nhất 1 kết quả / tổng phiên tìm kiếm × 100.",
  contribution: "Số thành viên có ít nhất 1 bài mới trong kỳ / tổng thành viên active × 100.",
  reuse: "Số bài có ít nhất 3 lượt đọc / tổng bài Published × 100.",
  compliance: "Số bài được review đúng hạn / tổng bài đến hạn review × 100.",
};

function Icon({ children, tone = "blue" }: { children: React.ReactNode; tone?: Tone }) { return <span className={`icon icon-${tone}`}>{children}</span>; }
function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: Tone }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={`card ${className}`}>{children}</section>; }

function SectionTitle({ icon, title, action, onAction }: { icon: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="section-title"><div><span className="section-icon">{icon}</span><strong>{title}</strong></div>{action && <button className="text-button" onClick={onAction}>{action}</button>}</div>;
}

function MetricCard({ label, value, note, formula, tone = "blue", progress, onOpen }: { label: string; value: string; note: string; formula: string; tone?: Tone; progress?: number; onOpen?: () => void }) {
  return <Card className={`metric-card ${onOpen ? "clickable" : ""}`}>
    <div className="metric-head"><span className="metric-label">{label}</span><span className="info-wrap"><button className="info-button" aria-label={`Công thức ${label}`}>i</button><span className="formula-tooltip" role="tooltip"><b>Công thức tính</b>{formula}</span></span></div>
    <button className="metric-main" onClick={onOpen} disabled={!onOpen}><span className={`metric-value text-${tone}`}>{value}</span>{progress !== undefined && <span className="progress"><i className={`fill-${tone}`} style={{ width: `${progress}%` }} /></span>}<span className="metric-note">{note}</span></button>
  </Card>;
}

function SelectField({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (v: string) => void }) {
  return <label className="select-field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>{values.map((item) => <option key={item}>{item}</option>)}</select></label>;
}

function EmptyState({ onReset }: { onReset: () => void }) { return <Card className="empty-state"><div className="empty-icon">⌕</div><h3>Không tìm thấy dữ liệu phù hợp</h3><p>Thử thay đổi đơn vị, team, thời gian hoặc phân loại để xem thêm kết quả.</p><button className="secondary-button" onClick={onReset}>Đặt lại bộ lọc</button></Card>; }
function Donut({ segments, center, onClick }: { segments: string; center: string; onClick?: () => void }) { return <button className="donut-button" onClick={onClick} aria-label="Xem chi tiết biểu đồ"><span className="donut" style={{ background: `conic-gradient(${segments})` }}><span><strong>{center}</strong><small>bài viết</small></span></span></button>; }

function DetailPanel({ data, onClose }: { data: PanelData; onClose: () => void }) {
  if (!data) return null;
  return <><button className="panel-backdrop" aria-label="Đóng bảng chi tiết" onClick={onClose} /><aside className="detail-panel" role="dialog" aria-modal="true" aria-label={data.title}><div className="panel-header"><div><span>CHI TIẾT</span><h3>{data.title}</h3>{data.subtitle && <p>{data.subtitle}</p>}</div><button onClick={onClose} aria-label="Đóng">×</button></div><div className="panel-content">{data.content}</div><div className="panel-footer"><button className="secondary-button" onClick={onClose}>Đóng</button><button className="primary-button" onClick={onClose}>Đã hiểu</button></div></aside></>;
}

const detailList = (items: string[]) => <div className="detail-list">{items.map((item, i) => <div key={item}><span>{i + 1}</span><p>{item}</p></div>)}</div>;

function Overview({ factor, open, navigate }: { factor: number; open: (p: NonNullable<PanelData>) => void; navigate: (tab: Tab, title?: string) => void }) {
  const value = (n: number) => Math.max(1, Math.round(n * factor));
  const status = [["Chờ duyệt",14,"amber"],["Mới trong kỳ",18,"blue"],["Đã chỉnh sửa",9,"green"],["Chưa ai đọc",31,"red"],["Cần review",22,"purple"],["Nháp",7,"slate"]] as const;
  return <div className="tab-content">
    <div className="content-heading"><div><span className="eyebrow">TỔNG QUAN HỆ THỐNG</span><h2>Kho tri thức đang vận hành thế nào?</h2></div><span className="updated">● Cập nhật 2 phút trước</span></div>
    <div className="metric-grid five">
      <MetricCard label="Tổng bài tri thức" value={String(value(247))} note="↑ 18 trong kỳ" formula={formulas.total} onOpen={() => navigate("articles")}/>
      <MetricCard label="Bài mới trong kỳ" value={String(value(18))} note="↑ 6 so với kỳ trước" formula={formulas.newArticles} tone="green" onOpen={() => navigate("articles", "Bài mới trong kỳ")}/>
      <MetricCard label="Thành viên active" value={`${value(63)}/${value(80)}`} note="12 chưa truy cập" formula={formulas.activeMembers} tone="purple" onOpen={() => navigate("members")}/>
      <MetricCard label="TG. duyệt trung bình" value="2.4 ngày" note="↓ cải thiện 0.6 ngày" formula={formulas.approvalTime} tone="amber" onOpen={() => navigate("members")}/>
      <MetricCard label="Tổng lượt đọc" value={value(1842).toLocaleString("vi-VN")} note="↑ 340 so với kỳ trước" formula={formulas.views} onOpen={() => navigate("articles")}/>
    </div>
    <div className="status-row">{status.map(([label,n,tone]) => <button key={label} onClick={() => navigate("articles", label)}><i className={`dot ${tone}`} />{label}<b>{value(n)}</b></button>)}</div>
    <div className="two-col overview-charts">
      <Card><SectionTitle icon="◔" title="Bài theo phân loại" action="Xem chi tiết" onAction={() => open({title:"Cơ cấu nội dung",subtitle:"Phân loại bài Published",content:detailList(["Process & Guidelines: 35%", "Knowledge: 30%", "Best Practices: 23%", "Others: 12%"])})}/><div className="donut-layout"><Donut center={String(value(247))} onClick={() => navigate("articles")} segments="#3988e6 0 35%, #1fa57a 35% 65%, #f2a01a 65% 88%, #8b8b80 88% 100%"/><div className="legend-list"><button onClick={() => navigate("articles","Process & Guidelines")}><i className="dot blue"/>Process & Guidelines <b>35%</b></button><button onClick={() => navigate("articles","Knowledge")}><i className="dot green"/>Knowledge <b>30%</b></button><button onClick={() => navigate("articles","Best Practices")}><i className="dot amber"/>Best Practices <b>23%</b></button><button onClick={() => navigate("articles","Others")}><i className="dot slate"/>Others <b>12%</b></button></div></div></Card>
      <Card><SectionTitle icon="▥" title="Bài theo đơn vị" action="12 tháng" onAction={() => open({title:"Xu hướng theo đơn vị",subtitle:"12 tháng gần nhất",content:detailList(["iKame Games tăng 12%", "Technology tăng 9%", "iKame Apps tăng 6%", "P&OD tăng 3%"])})}/><div className="bar-list">{[["iKame Games",82],["Technology",69],["iKame Apps",52],["P&OD",28],["Khác",16]].map(([name,n]) => <button key={name} onClick={() => navigate("articles",String(name))}><span>{name}</span><span><i style={{ width: `${Number(n)}%` }}/></span><b>{value(Number(n))}</b></button>)}</div><MiniLine/></Card>
    </div>
    <Card><SectionTitle icon="⌕" title="Từ khóa tìm kiếm" action="Xem báo cáo tìm kiếm" onAction={() => open({title:"Báo cáo tìm kiếm",subtitle:"30 ngày gần nhất",content:detailList(["Tổng 1.284 phiên tìm kiếm", "79% phiên có kết quả", "66 phiên không có kết quả", "4 chủ đề cần bổ sung nội dung"])})}/><p className="sub-label">Tìm nhiều nhất</p><div className="chip-row">{["onboarding 84","deploy 71","incident 58","OKR 47","code review 39","off-boarding 31","security policy 28"].map(x => <button className="chip-button" key={x} onClick={() => open({title:`Kết quả cho “${x.replace(/ \d+$/,"") }”`,content:detailList(["Quy trình liên quan", "Hướng dẫn thực hành", "Bài viết được đọc nhiều nhất"])})}><Badge tone="green">{x}</Badge></button>)}</div><p className="sub-label danger-label">⊘ Không có kết quả — cần bổ sung nội dung</p><div className="chip-row">{["data governance 22","expense policy 2025 19","API rate limit 14","remote work guide 11"].map(x => <button className="chip-button" key={x} onClick={() => open({title:"Knowledge gap",subtitle:x,content:detailList(["Chưa có bài viết phù hợp", "Đề xuất phân công PIC", "Độ ưu tiên: Cao"])})}><Badge tone="red">{x}</Badge></button>)}</div></Card>
  </div>;
}

function MiniLine() { return <div className="mini-line" aria-label="Biểu đồ lượt đọc 12 tháng"><svg viewBox="0 0 420 100" role="img"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3988e6" stopOpacity=".25"/><stop offset="1" stopColor="#3988e6" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 87 L35 73 L70 79 L105 57 L140 43 L175 49 L210 34 L245 17 L280 29 L315 9 L350 20 L385 5 L420 14 L420 100 L0 100Z"/><path d="M0 87 L35 73 L70 79 L105 57 L140 43 L175 49 L210 34 L245 17 L280 29 L315 9 L350 20 L385 5 L420 14"/></svg><div>{["T6","T7","T8","T9","T10","T11","T12","T1","T2","T3","T4","T5"].map(m => <span key={m}>{m}</span>)}</div></div>; }

function Articles({ factor, open, notify, focus }: { factor: number; open: (p: NonNullable<PanelData>) => void; notify: (s:string) => void; focus?: string }) {
  const [expanded,setExpanded] = useState(false); const value=(n:number)=>Math.max(1,Math.round(n*factor));
  const articleDetail = (a: readonly [string,string,string,string,number]) => open({title:a[0],subtitle:`${a[1]} · ${a[4]} tháng chưa review`,content:<><div className="detail-kpis"><span><b>{a[3]}</b>Phân loại</span><span><b>{a[2]}</b>PIC / Tác giả</span><span><b>{a[4]} tháng</b>Tuổi bài viết</span></div>{detailList(["Trạng thái: Cần review", "Ưu tiên: Cao", "Hành động đề xuất: Chỉ định PIC và review trong 7 ngày"])}</>});
  return <div className="tab-content">
    <div className="content-heading"><div><span className="eyebrow">TỔNG QUAN BÀI VIẾT</span><h2>Chất lượng và độ mới của nội dung</h2>{focus && <Badge tone="blue">Đang lọc nhanh: {focus}</Badge>}</div><button className="primary-button" onClick={() => {notify("Đã tạo báo cáo mẫu");open({title:"Báo cáo bài viết",subtitle:"Dữ liệu theo bộ lọc hiện tại",content:detailList([`${value(247)} bài đã đăng`, `${value(31)} bài quá hạn review`, "Freshness Score: 67%", "Báo cáo thật sẽ hỗ trợ xuất CSV/PDF"])})}}>＋ Tạo báo cáo</button></div>
    <div className="metric-grid five"><MetricCard label="Tổng bài đã đăng" value={String(value(247))} note="Tất cả thời gian" formula={formulas.total}/><MetricCard label="Đăng trong kỳ" value={String(value(18))} note="↑ 6 so với kỳ trước" formula={formulas.newArticles} tone="green"/><MetricCard label="Outdate >12 tháng" value={String(value(31))} note="Cần review gấp" formula={formulas.old12} tone="red" onOpen={() => setExpanded(true)}/><MetricCard label="Outdate 6–12 tháng" value={String(value(19))} note="Sắp outdate" formula={formulas.old6} tone="amber" onOpen={() => setExpanded(true)}/><MetricCard label="Freshness Score" value="67%" note="Mục tiêu: >70%" formula={formulas.freshness} tone="amber" progress={67}/></div>
    <div className="alerts"><button className="alert danger" onClick={()=>setExpanded(true)}><b>△ {value(31)} bài chưa được review sau hơn 12 tháng</b><span>— xem danh sách ưu tiên</span></button><button className="alert warning" onClick={()=>setExpanded(true)}><b>◷ {value(19)} bài sắp đến hạn review</b><span>— lên lịch trong 30 ngày tới</span></button></div>
    <Card><SectionTitle icon="△" title="Bài viết outdate cần review ngay" action="Sắp xếp: cũ nhất" onAction={()=>notify("Danh sách đã sắp xếp theo bài cũ nhất")}/><div className="review-list">{reviewArticles.slice(0,expanded?reviewArticles.length:6).map(a=><button key={a[0]} className={a[4]>=12?"critical":"warning-item"} onClick={()=>articleDetail(a)}><span className="warn-icon">{a[4]>=12?"△":"◷"}</span><span><strong>{a[0]}</strong><small>{a[1]} · Tác giả: {a[2]} · <Badge tone={a[3]==="Knowledge"?"blue":a[3]==="Best Practices"?"amber":"red"}>{a[3]}</Badge></small></span><b>{a[4]} tháng</b></button>)}</div><button className="expand-button" onClick={()=>setExpanded(!expanded)}>{expanded?"Thu gọn":"Xem tất cả bài cần review"} →</button></Card>
    <div className="two-col"><Card><SectionTitle icon="▥" title="Bài đăng theo tháng" action="Xem dữ liệu" onAction={()=>open({title:"Bài đăng theo tháng",content:detailList(["T3: 21 bài", "T4: 17 bài", "T5: 18 bài"])})}/><div className="column-chart">{[12,8,15,11,19,14,9,16,13,21,17,18].map((n,i)=><button key={i} onClick={()=>open({title:`Tháng ${((i+7)%12)||12}`,content:detailList([`${n} bài được đăng`, `${Math.max(1,n-4)} tác giả đóng góp`])})}><i style={{height:`${n*4}px`}}/><span>{`T${(i+7)%12||12}`}</span></button>)}</div></Card><Card><SectionTitle icon="◔" title="Tuổi thọ bài viết" action="Chi tiết" onAction={()=>setExpanded(true)}/><div className="donut-layout compact"><Donut center="247" onClick={()=>setExpanded(true)} segments="#1fa57a 0 28%, #3988e6 28% 50%, #f2a01a 50% 88%, #dd4b4b 88% 100%"/><div className="legend-list static"><span><i className="dot green"/>&lt;3 tháng <b>28%</b></span><span><i className="dot blue"/>3–6 tháng <b>22%</b></span><span><i className="dot amber"/>6–12 tháng <b>38%</b></span><span><i className="dot red"/>&gt;12 tháng <b>12%</b></span></div></div></Card></div>
    <Card><SectionTitle icon="☆" title="Top bài được đọc nhiều nhất" action={`⊘ Bài chưa ai đọc: ${value(31)}`} onAction={()=>open({title:"Bài chưa ai đọc",content:detailList(["31 bài chưa phát sinh lượt đọc", "18 bài thuộc Process & Guidelines", "Đề xuất: rà soát tiêu đề và phân phối lại nội dung"])})}/><div className="table-wrap"><table><thead><tr><th>#</th><th>Tên bài</th><th>Team</th><th>Đăng</th><th>Đọc ↕</th><th>Lưu</th><th>Trạng thái</th></tr></thead><tbody>{topArticles.map((a,i)=><tr key={a[0]} tabIndex={0} onClick={()=>open({title:a[0],subtitle:a[1],content:detailList([`${value(Number(a[3]))} lượt đọc`, `${value(Number(a[4]))} lượt lưu`, `Trạng thái: ${a[5]}`])})} onKeyDown={e=>e.key==="Enter"&&e.currentTarget.click()}><td>{i+1}</td><td><strong>{a[0]}</strong></td><td>{a[1]}</td><td>{a[2]}</td><td><b>{value(Number(a[3]))}</b></td><td>{value(Number(a[4]))}</td><td><Badge tone={a[5]==="Còn hạn"?"green":a[5]==="Outdate"?"red":"amber"}>{a[5]}</Badge></td></tr>)}</tbody></table></div></Card>
  </div>;
}

function Members({ factor, open, notify }: { factor:number; open:(p:NonNullable<PanelData>)=>void; notify:(s:string)=>void }) {
  const [status,setStatus]=useState("Tất cả trạng thái"); const shown=status==="Tất cả trạng thái"?members:members.filter(m=>m[8]===status); const value=(n:number)=>Math.max(0,Math.round(n*factor));
  const memberDetail=(m:typeof members[number])=>open({title:m[0],subtitle:m[1],content:<><div className="detail-kpis"><span><b>{m[2]}</b>Bài mới</span><span><b>{m[6]}</b>Lượt đọc</span><span><b>{m[7]}</b>Hoạt động gần nhất</span></div>{detailList([`Trạng thái: ${m[8]}`, `${m[5]} bài cần review`, `${m[3]} bài đang chờ duyệt`])}</>});
  return <div className="tab-content"><div className="content-heading"><div><span className="eyebrow">TÌNH TRẠNG PIC & THÀNH VIÊN</span><h2>Đóng góp và mức độ tham gia</h2></div><select className="small-select" value={status} onChange={e=>setStatus(e.target.value)} aria-label="Lọc trạng thái thành viên">{["Tất cả trạng thái","Tốt","Theo dõi","Cần nhắc","Không active"].map(x=><option key={x}>{x}</option>)}</select></div>
    <div className="alert warning"><b>△ 3 thành viên chưa hoạt động hơn 14 ngày</b><span>— cần follow-up</span><button onClick={()=>open({title:"Danh sách cần follow-up",content:<>{detailList(["Phạm Thị D. — 18 ngày", "Đặng Văn G. — 21 ngày", "Mai Ngọc H. — 16 ngày"])}<button className="primary-button full-button" onClick={()=>notify("Đã ghi nhận follow-up cho 3 thành viên")}>Ghi nhận follow-up</button></>})}>Xem danh sách</button></div>
    <Card><SectionTitle icon="♧" title="Theo dõi đóng góp PIC" action={`${shown.length} thành viên`} onAction={()=>setStatus("Tất cả trạng thái")}/><div className="table-wrap"><table className="member-table"><thead><tr><th>Thành viên</th><th>Đơn vị / Team</th><th>Bài mới</th><th>Chờ duyệt</th><th>Nháp</th><th>Cần review</th><th>Lượt đọc</th><th>Hoạt động</th><th>Trạng thái</th></tr></thead><tbody>{shown.map(m=><tr key={m[0]} tabIndex={0} onClick={()=>memberDetail(m)} onKeyDown={e=>e.key==="Enter"&&e.currentTarget.click()}><td><div className="person"><span>{String(m[0]).split(" ").slice(-2).map(x=>x[0]).join("")}</span><strong>{m[0]}</strong></div></td><td>{m[1]}</td><td>{value(Number(m[2]))}</td><td>{value(Number(m[3]))}</td><td>{value(Number(m[4]))}</td><td>{value(Number(m[5]))}</td><td><b>{value(Number(m[6]))}</b></td><td>{m[7]}</td><td><Badge tone={m[8]==="Tốt"?"green":m[8]==="Không active"?"red":m[8]==="Cần nhắc"?"amber":"blue"}>{m[8]}</Badge></td></tr>)}</tbody></table></div></Card>
    <div className="two-col member-bottom"><Card><SectionTitle icon="↻" title="Tình trạng người duyệt (KM)" action="Xem backlog" onAction={()=>open({title:"Backlog người duyệt",content:detailList(["Nguyễn KM1: 8 bài", "Trần KM2: 4 bài", "Lê KM3: 6 bài — quá SLA"])})}/><div className="table-wrap"><table><thead><tr><th>Knowledge Manager</th><th>Chờ duyệt</th><th>Đã duyệt</th><th>TG. TB</th></tr></thead><tbody>{[["Nguyễn KM1",8,22,"1.8 ngày"],["Trần KM2",4,31,"2.1 ngày"],["Lê KM3",6,18,"3.4 ngày"]].map(r=><tr key={String(r[0])} onClick={()=>open({title:String(r[0]),content:detailList([`${r[1]} bài chờ duyệt`, `${r[2]} bài đã duyệt`, `Thời gian trung bình: ${r[3]}`])})}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody></table></div></Card><Card><SectionTitle icon="♧" title="Tần suất truy cập thành viên" action="Xem nhóm" onAction={()=>open({title:"Phân nhóm truy cập",content:detailList([">4 lần/tuần: 29 người", "2–3 lần/tuần: 19 người", "1–2 lần/tuần: 15 người", "Không truy cập: 17 người"])})}/><div className="frequency">{[[">4 lần/tuần",29,"green"],["2–3 lần/tuần",19,"blue"],["1–2 lần/tuần",15,"amber"],["Không truy cập",17,"red"]].map(([l,n,c])=><button key={String(l)} onClick={()=>open({title:String(l),content:detailList([`${value(Number(n))} thành viên trong nhóm`, "Nhấn vào từng thành viên ở bảng để xem chi tiết"])})}><span>{l}</span><i><b className={`fill-${c}`} style={{width:`${Number(n)*2.6}%`}}/></i><strong>{value(Number(n))}</strong></button>)}</div></Card></div>
  </div>;
}

function Health({ open }: { open:(p:NonNullable<PanelData>)=>void }) {
  const cells=[[18,12,22,8],[9,16,14,5],[24,8,10,12],[6,18,8,3]], rows=["Process","Knowledge","Best Practices","Others"], cols=["Games","Apps","Tech","P&OD"];
  return <div className="tab-content"><div className="content-heading"><div><span className="eyebrow">HEALTH METRICS</span><h2>Sức khỏe kho tri thức</h2></div><span className="updated">Mục tiêu quý 2/2025</span></div><div className="metric-grid five health-metrics"><MetricCard label="Knowledge Freshness" value="67%" note="Mục tiêu: >70% · cần cải thiện" formula={formulas.freshness} tone="amber" progress={67}/><MetricCard label="Search Success Rate" value="79%" note="79/100 lượt tìm có kết quả" formula={formulas.search} progress={79}/><MetricCard label="Contribution Rate" value="54%" note="43/80 member có bài trong kỳ" formula={formulas.contribution} tone="green" progress={54}/><MetricCard label="Knowledge Reuse" value="61%" note="Bài đọc ≥3 lần / tổng bài" formula={formulas.reuse} progress={61}/><MetricCard label="Review Compliance" value="48%" note="Review đúng hạn / tổng đến hạn" formula={formulas.compliance} tone="red" progress={48}/></div>
    <Card><SectionTitle icon="▥" title="Expertise Coverage Map — bài viết theo loại × team" action="Giải thích heatmap" onAction={()=>open({title:"Cách đọc Expertise Coverage Map",content:detailList(["Đỏ: 0 bài — knowledge gap cần xử lý", "Xanh nhạt: dưới 8 bài", "Xanh trung: 8–15 bài", "Xanh đậm: trên 15 bài"])})}/><div className="heatmap"><div className="heat-head"><span/>{cols.map(c=><b key={c}>{c}</b>)}</div>{cells.map((row,ri)=><div className="heat-row" key={rows[ri]}><b>{rows[ri]}</b>{row.map((n,i)=><button key={i} onClick={()=>open({title:`${rows[ri]} · ${cols[i]}`,subtitle:`${n} bài viết`,content:detailList(n<8?["Coverage thấp", "Đề xuất bổ sung nội dung", "Cần phân công PIC"]:["Coverage ổn định", "Tiếp tục duy trì review định kỳ"])})} className={`heat heat-${n===0?0:n<8?1:n<15?2:3}`}>{n}</button>)}</div>)}</div><div className="heat-legend"><span><i className="heat-0"/>0 · gap</span><span><i className="heat-1"/>&lt;8 bài</span><span><i className="heat-2"/>8–15 bài</span><span><i className="heat-3"/>&gt;15 bài</span></div></Card>
    <Card><SectionTitle icon="⌁" title="Xu hướng health metrics (6 tháng gần nhất)" action="Xem phân tích" onAction={()=>open({title:"Phân tích xu hướng",content:detailList(["Search Success tăng 8 điểm", "Freshness tăng 11 điểm", "Contribution tăng 9 điểm", "Review Compliance vẫn dưới mục tiêu"])})}/><div className="trend-chart"><div className="y-axis"><span>85%</span><span>70%</span><span>55%</span><span>40%</span></div><svg viewBox="0 0 760 190" preserveAspectRatio="none" role="img" aria-label="Xu hướng 6 tháng"><path className="grid" d="M0 20H760 M0 70H760 M0 120H760 M0 170H760"/><polyline className="line blue-line" points="0,78 152,70 304,62 456,52 608,40 760,35"/><polyline className="line green-line" points="0,150 152,136 304,126 456,112 608,100 760,91"/><polyline className="line amber-line" points="0,180 152,170 304,162 456,150 608,139 760,127"/></svg><div className="x-axis">{["T12","T1","T2","T3","T4","T5"].map(x=><span key={x}>{x}</span>)}</div></div><div className="chart-legend"><span><i className="dot green"/>Freshness</span><span><i className="dot blue"/>Search Success</span><span><i className="dot amber"/>Contribution</span></div></Card>
  </div>;
}

export default function Home() {
  const [tab,setTab]=useState<Tab>("overview"), [unit,setUnit]=useState(units[0]), [team,setTeam]=useState("Tất cả team"), [period,setPeriod]=useState(periods[2]), [category,setCategory]=useState(categories[0]), [search,setSearch]=useState(""), [sidebarOpen,setSidebarOpen]=useState(false), [panel,setPanel]=useState<PanelData>(null), [toast,setToast]=useState(""), [focus,setFocus]=useState("");
  const teamOptions=teamsByUnit[unit];
  const notify=(message:string)=>{setToast(message);window.setTimeout(()=>setToast(""),2600)};
  const changeUnit=(next:string)=>{setUnit(next);setTeam("Tất cả team")};
  const factor=useMemo(()=>{const u=unit===units[0]?1:({"iKame Games":.34,"iKame Apps":.23,"P&OD":.16,"Technology":.27}[unit]||1),p=period==="7 ngày qua"?.52:period==="15 ngày qua"?.72:1,c=category===categories[0]?1:.3,t=team==="Tất cả team"?1:.42;return u*p*c*t},[unit,team,period,category]);
  const noResults=search.toLowerCase().includes("xyz")||search.toLowerCase().includes("không có");
  const reset=()=>{setUnit(units[0]);setTeam("Tất cả team");setPeriod(periods[2]);setCategory(categories[0]);setSearch("");setFocus("")};
  const navigate=(next:Tab,quick="")=>{setTab(next);setFocus(quick);setSidebarOpen(false);window.scrollTo({top:0,behavior:"smooth"})};
  const openSimple=(title:string,items:string[])=>setPanel({title,content:detailList(items)});
  return <div className="app-shell">
    <aside className={sidebarOpen?"sidebar open":"sidebar"}><div className="brand"><span className="brand-mark">iW</span><div><strong>iWiki</strong><small>Knowledge Admin</small></div><button className="close-menu" onClick={()=>setSidebarOpen(false)}>×</button></div><nav><span className="nav-label">KHÔNG GIAN LÀM VIỆC</span><button className={tab==="overview"?"active":""} onClick={()=>navigate("overview")}><Icon>⌘</Icon>Knowledge Dashboard</button><button className={tab==="articles"?"active":""} onClick={()=>navigate("articles")}><Icon tone="slate">▤</Icon>Quản lý bài viết</button><button className={tab==="members"?"active":""} onClick={()=>navigate("members")}><Icon tone="slate">♧</Icon>Thành viên</button><button onClick={()=>setPanel({title:"Thống kê tìm kiếm",subtitle:"30 ngày gần nhất",content:detailList(["1.284 phiên tìm kiếm", "79% tìm kiếm thành công", "66 phiên không có kết quả", "Top keyword: onboarding"])})}><Icon tone="slate">⌕</Icon>Thống kê tìm kiếm</button><span className="nav-label">QUẢN TRỊ</span><button onClick={()=>openSimple("Cấu hình kho tri thức",["Chu kỳ review mặc định: 12 tháng", "Cảnh báo sớm: trước 30 ngày", "Phân loại đang sử dụng: 5"])}><Icon tone="slate">⚙</Icon>Cấu hình kho tri thức</button><button onClick={()=>openSimple("Phân quyền",["Admin / Leadership: xem toàn công ty", "Knowledge Manager: xem và quản lý review", "Team Lead / PIC: xem theo team được phân quyền"])}><Icon tone="slate">♙</Icon>Phân quyền</button></nav><button className="sidebar-help" onClick={()=>openSimple("Hướng dẫn sử dụng",["Chọn bộ lọc Đơn vị → Team", "Di chuột vào nút i để xem công thức", "Nhấn KPI, biểu đồ hoặc dòng bảng để xem chi tiết"])}><span>?</span><div><strong>Cần trợ giúp?</strong><small>Xem hướng dẫn sử dụng</small></div></button><button className="profile" onClick={()=>openSimple("Dung Nguyen",["Vai trò: Knowledge Manager", "Phạm vi: Toàn công ty", "Lần truy cập gần nhất: Hôm nay"])}><span>DN</span><div><strong>Dung Nguyen</strong><small>Knowledge Manager</small></div><b>⋯</b></button></aside>
    {sidebarOpen&&<button className="backdrop" aria-label="Đóng menu" onClick={()=>setSidebarOpen(false)}/>}<main><header className="topbar"><button className="menu-button" onClick={()=>setSidebarOpen(true)}>☰</button><div className="page-title"><Icon>⌘</Icon><div><strong>Knowledge Dashboard</strong><span>Demo · Dữ liệu mẫu</span></div></div><div className="top-actions"><label className="search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm bài viết, thành viên..."/></label><button className="round-button" aria-label="Trợ giúp" onClick={()=>openSimple("Trợ giúp nhanh",["Bộ lọc tự động cập nhật dữ liệu", "Nút i hiển thị công thức metric", "Mọi bảng và biểu đồ đều có thể mở chi tiết"])}>?</button><button className="round-button notification" aria-label="Thông báo" onClick={()=>openSimple("Thông báo",["31 bài cần review gấp", "3 thành viên cần follow-up", "6 bài đang chờ duyệt quá SLA"])}>♢<i/></button><button className="avatar" onClick={()=>openSimple("Tài khoản",["Dung Nguyen", "Knowledge Manager", "Toàn công ty"])}>DN</button></div></header>
    <div className="filter-panel"><div className="filters"><SelectField label="Đơn vị" value={unit} values={units} onChange={changeUnit}/><SelectField label="Team" value={team} values={teamOptions} onChange={setTeam}/><SelectField label="Thời gian" value={period} values={periods} onChange={setPeriod}/><SelectField label="Phân loại" value={category} values={categories} onChange={setCategory}/></div><button className="reset-button" onClick={reset}>↻ Đặt lại</button></div><div className="filter-summary"><span>Đang xem:</span><Badge tone="blue">{unit}</Badge><Badge tone="slate">{team}</Badge><Badge tone="slate">{period}</Badge><Badge tone="slate">{category}</Badge></div>
    <div className="tabs" role="tablist">{tabs.map(t=><button role="tab" aria-selected={tab===t.id} className={tab===t.id?"active":""} onClick={()=>navigate(t.id)} key={t.id}><span>{t.icon}</span>{t.label}</button>)}</div>{noResults?<div className="content"><EmptyState onReset={reset}/></div>:<div className="content">{tab==="overview"&&<Overview factor={factor} open={setPanel} navigate={navigate}/>} {tab==="articles"&&<Articles factor={factor} open={setPanel} notify={notify} focus={focus}/>} {tab==="members"&&<Members factor={factor} open={setPanel} notify={notify}/>} {tab==="health"&&<Health open={setPanel}/>}</div>}</main>
    <DetailPanel data={panel} onClose={()=>setPanel(null)}/>{toast&&<div className="toast" role="status">✓ {toast}</div>}
  </div>;
}
