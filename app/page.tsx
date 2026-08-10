"use client";

import { useMemo, useState } from "react";

type Tab = "overview" | "articles" | "members" | "health";
type Tone = "blue" | "green" | "amber" | "red" | "purple" | "slate";

const units = ["Toàn công ty", "iKame Games", "iKame Apps", "P&OD", "Technology"];
const periods = ["7 ngày qua", "15 ngày qua", "30 ngày qua", "H1 2025", "H2 2025"];
const categories = ["Tất cả phân loại", "Process & Guidelines", "Knowledge", "Best Practices", "Case Studies", "Others"];

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Tổng quan", icon: "⌘" },
  { id: "articles", label: "Bài viết", icon: "▤" },
  { id: "members", label: "Thành viên & PIC", icon: "♧" },
  { id: "health", label: "Health metrics", icon: "♡" },
];

const reviewArticles = [
  ["Quy trình bảo mật hệ thống & phân quyền", "Technology / DevOps", "Tác giả: Nguyễn V.A", "Process & Guidelines", 26],
  ["Hướng dẫn setup môi trường local dev", "Technology / Frontend", "Tác giả: Trần T.B", "Knowledge", 24],
  ["Chính sách nghỉ phép & remote work", "P&OD / HR", "Tác giả: Lê V.C", "Process & Guidelines", 22],
  ["SLA xử lý bug theo mức độ priority", "iKame Games / QA", "Tác giả: Phạm T.D", "Best Practices", 19],
  ["Quy trình onboarding nhân viên mới P&OD", "P&OD / HR", "Tác giả: Hoàng M.E", "Process & Guidelines", 17],
  ["Kiến trúc hệ thống iKame Apps v1", "iKame Apps / Backend", "Tác giả: Vũ T.F", "Knowledge", 15],
  ["Quy trình release mobile app", "iKame Games / Mobile", "Tác giả: Đặng V.G", "Process & Guidelines", 11],
  ["Hướng dẫn sử dụng Figma cho Design team", "iKame Games / Design", "Tác giả: Ngô T.H", "Knowledge", 10],
  ["Data retention & backup policy", "Technology / DevOps", "Tác giả: Phan V.I", "Process & Guidelines", 9],
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

function Icon({ children, tone = "blue" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`icon icon-${tone}`}>{children}</span>;
}

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function SectionTitle({ icon, title, action }: { icon: string; title: string; action?: string }) {
  return (
    <div className="section-title">
      <div><span className="section-icon">{icon}</span><strong>{title}</strong></div>
      {action && <button className="text-button">{action}</button>}
    </div>
  );
}

function MetricCard({ label, value, note, tone = "blue", progress }: { label: string; value: string; note: string; tone?: Tone; progress?: number }) {
  return (
    <Card className="metric-card">
      <span className="metric-label">{label}</span>
      <div className={`metric-value text-${tone}`}>{value}</div>
      {progress !== undefined && <div className="progress"><span className={`fill-${tone}`} style={{ width: `${progress}%` }} /></div>}
      <span className="metric-note">{note}</span>
    </Card>
  );
}

function SelectField({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (v: string) => void }) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {values.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Card className="empty-state">
      <div className="empty-icon">⌕</div>
      <h3>Không tìm thấy dữ liệu phù hợp</h3>
      <p>Thử thay đổi đơn vị, thời gian hoặc phân loại để xem thêm kết quả.</p>
      <button className="secondary-button" onClick={onReset}>Đặt lại bộ lọc</button>
    </Card>
  );
}

function Donut({ segments, center }: { segments: string; center: string }) {
  return <div className="donut" style={{ background: `conic-gradient(${segments})` }}><div><strong>{center}</strong><span>bài viết</span></div></div>;
}

function Overview({ factor }: { factor: number }) {
  const value = (n: number) => Math.max(1, Math.round(n * factor));
  return (
    <div className="tab-content">
      <div className="content-heading"><div><span className="eyebrow">TỔNG QUAN HỆ THỐNG</span><h2>Kho tri thức đang vận hành thế nào?</h2></div><span className="updated">● Cập nhật 2 phút trước</span></div>
      <div className="metric-grid five">
        <MetricCard label="Tổng bài tri thức" value={String(value(247))} note="↑ 18 trong kỳ" />
        <MetricCard label="Bài mới trong kỳ" value={String(value(18))} note="↑ 6 so với kỳ trước" tone="green" />
        <MetricCard label="Thành viên active" value={`${value(63)}/${value(80)}`} note="12 chưa truy cập" tone="purple" />
        <MetricCard label="TG. duyệt trung bình" value="2.4 ngày" note="↓ cải thiện 0.6 ngày" tone="amber" />
        <MetricCard label="Tổng lượt đọc" value={value(1842).toLocaleString("vi-VN")} note="↑ 340 so với kỳ trước" tone="blue" />
      </div>
      <div className="status-row">
        <button><i className="dot amber" />Chờ duyệt <b>{value(14)}</b></button>
        <button><i className="dot blue" />Mới trong kỳ <b>{value(18)}</b></button>
        <button><i className="dot green" />Đã chỉnh sửa <b>{value(9)}</b></button>
        <button><i className="dot red" />Chưa ai đọc <b>{value(31)}</b></button>
        <button><i className="dot purple" />Cần review <b>{value(22)}</b></button>
        <button><i className="dot slate" />Nháp <b>{value(7)}</b></button>
      </div>
      <div className="two-col overview-charts">
        <Card>
          <SectionTitle icon="◔" title="Bài theo phân loại" action="Xem chi tiết" />
          <div className="donut-layout">
            <Donut center={String(value(247))} segments="#3988e6 0 35%, #1fa57a 35% 65%, #f2a01a 65% 88%, #8b8b80 88% 100%" />
            <div className="legend-list">
              <span><i className="dot blue" />Process & Guidelines <b>35%</b></span>
              <span><i className="dot green" />Knowledge <b>30%</b></span>
              <span><i className="dot amber" />Best Practices <b>23%</b></span>
              <span><i className="dot slate" />Others <b>12%</b></span>
            </div>
          </div>
        </Card>
        <Card>
          <SectionTitle icon="▥" title="Bài theo đơn vị" action="12 tháng" />
          <div className="bar-list">
            {[["iKame Games",82],["Technology",69],["iKame Apps",52],["P&OD",28],["Khác",16]].map(([name,n]) => <div key={name}><span>{name}</span><div><i style={{ width: `${Number(n)}%` }} /></div><b>{value(Number(n))}</b></div>)}
          </div>
          <MiniLine />
        </Card>
      </div>
      <Card>
        <SectionTitle icon="⌕" title="Từ khóa tìm kiếm" action="Xem báo cáo tìm kiếm" />
        <p className="sub-label">Tìm nhiều nhất</p>
        <div className="chip-row">{["onboarding 84", "deploy 71", "incident 58", "OKR 47", "code review 39", "off-boarding 31", "security policy 28"].map(x => <Badge key={x} tone="green">{x}</Badge>)}</div>
        <p className="sub-label danger-label">⊘ Không có kết quả — cần bổ sung nội dung</p>
        <div className="chip-row">{["data governance 22", "expense policy 2025 19", "API rate limit 14", "remote work guide 11"].map(x => <Badge key={x} tone="red">{x}</Badge>)}</div>
      </Card>
    </div>
  );
}

function MiniLine() {
  return (
    <div className="mini-line" aria-label="Biểu đồ lượt đọc 12 tháng">
      <svg viewBox="0 0 420 100" role="img"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3988e6" stopOpacity=".25"/><stop offset="1" stopColor="#3988e6" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 87 L35 73 L70 79 L105 57 L140 43 L175 49 L210 34 L245 17 L280 29 L315 9 L350 20 L385 5 L420 14 L420 100 L0 100Z"/><path d="M0 87 L35 73 L70 79 L105 57 L140 43 L175 49 L210 34 L245 17 L280 29 L315 9 L350 20 L385 5 L420 14"/></svg>
      <div>{["T6","T7","T8","T9","T10","T11","T12","T1","T2","T3","T4","T5"].map(m => <span key={m}>{m}</span>)}</div>
    </div>
  );
}

function Articles({ factor }: { factor: number }) {
  const [expanded, setExpanded] = useState(false);
  const value = (n: number) => Math.max(1, Math.round(n * factor));
  return (
    <div className="tab-content">
      <div className="content-heading"><div><span className="eyebrow">TỔNG QUAN BÀI VIẾT</span><h2>Chất lượng và độ mới của nội dung</h2></div><button className="primary-button">＋ Tạo báo cáo</button></div>
      <div className="metric-grid five">
        <MetricCard label="Tổng bài đã đăng" value={String(value(247))} note="Tất cả thời gian" />
        <MetricCard label="Đăng trong kỳ" value={String(value(18))} note="↑ 6 so với kỳ trước" tone="green" />
        <MetricCard label="Outdate >12 tháng" value={String(value(31))} note="Cần review gấp" tone="red" />
        <MetricCard label="Outdate 6–12 tháng" value={String(value(19))} note="Sắp outdate" tone="amber" />
        <MetricCard label="Freshness Score" value="67%" note="Mục tiêu: >70%" tone="amber" progress={67} />
      </div>
      <div className="alerts"><div className="alert danger"><b>△ {value(31)} bài chưa được review sau hơn 12 tháng</b><span>— cần chỉ định PIC review ngay để tránh tri thức lỗi thời</span></div><div className="alert warning"><b>◷ {value(19)} bài sắp đến hạn review</b><span>(6–12 tháng) — nên lên lịch review trong 30 ngày tới</span></div></div>
      <Card>
        <SectionTitle icon="△" title="Bài viết outdate cần review ngay" action="Sắp xếp: cũ nhất" />
        <div className="review-list">
          {reviewArticles.slice(0, expanded ? reviewArticles.length : 6).map((a) => <article key={a[0]} className={a[4] >= 12 ? "critical" : "warning-item"}><span className="warn-icon">{a[4] >= 12 ? "△" : "◷"}</span><div><strong>{a[0]}</strong><small>{a[1]} · {a[2]} · <Badge tone={a[3] === "Knowledge" ? "blue" : a[3] === "Best Practices" ? "amber" : "red"}>{a[3]}</Badge></small></div><b>{a[4]} tháng</b></article>)}
        </div>
        <button className="expand-button" onClick={() => setExpanded(!expanded)}>{expanded ? "Thu gọn" : "Xem tất cả bài cần review"} →</button>
      </Card>
      <div className="two-col">
        <Card><SectionTitle icon="▥" title="Bài đăng theo tháng" /><div className="column-chart">{[12,8,15,11,19,14,9,16,13,21,17,18].map((n,i) => <div key={i}><i style={{height:`${n*4}px`}}/><span>{`T${(i+7)%12||12}`}</span></div>)}</div></Card>
        <Card><SectionTitle icon="◔" title="Tuổi thọ bài viết" /><div className="donut-layout compact"><Donut center="247" segments="#1fa57a 0 28%, #3988e6 28% 50%, #f2a01a 50% 88%, #dd4b4b 88% 100%"/><div className="legend-list"><span><i className="dot green"/> &lt;3 tháng <b>28%</b></span><span><i className="dot blue"/>3–6 tháng <b>22%</b></span><span><i className="dot amber"/>6–12 tháng <b>38%</b></span><span><i className="dot red"/>&gt;12 tháng <b>12%</b></span></div></div></Card>
      </div>
      <Card>
        <SectionTitle icon="☆" title="Top bài được đọc nhiều nhất" action={`⊘ Bài chưa ai đọc: ${value(31)}`} />
        <div className="table-wrap"><table><thead><tr><th>#</th><th>Tên bài</th><th>Team</th><th>Đăng</th><th>Đọc ↕</th><th>Lưu</th><th>Trạng thái</th></tr></thead><tbody>{topArticles.map((a,i) => <tr key={a[0]}><td>{i+1}</td><td><strong>{a[0]}</strong></td><td>{a[1]}</td><td>{a[2]}</td><td><b>{value(Number(a[3]))}</b></td><td>{value(Number(a[4]))}</td><td><Badge tone={a[5] === "Còn hạn" ? "green" : a[5] === "Outdate" ? "red" : "amber"}>{a[5]}</Badge></td></tr>)}</tbody></table></div>
      </Card>
    </div>
  );
}

function Members({ factor }: { factor: number }) {
  const [status, setStatus] = useState("Tất cả trạng thái");
  const shown = status === "Tất cả trạng thái" ? members : members.filter((m) => m[8] === status);
  const value = (n: number) => Math.max(0, Math.round(n * factor));
  return (
    <div className="tab-content">
      <div className="content-heading"><div><span className="eyebrow">TÌNH TRẠNG PIC & THÀNH VIÊN</span><h2>Đóng góp và mức độ tham gia</h2></div><select className="small-select" value={status} onChange={(e)=>setStatus(e.target.value)}>{["Tất cả trạng thái","Tốt","Theo dõi","Cần nhắc","Không active"].map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="alert warning"><b>△ 3 thành viên chưa hoạt động hơn 14 ngày</b><span>— cần follow-up</span><button onClick={() => alert("Đã tạo danh sách follow-up mẫu")}>Xem danh sách</button></div>
      <Card>
        <SectionTitle icon="♧" title="Theo dõi đóng góp PIC" action={`${shown.length} thành viên`} />
        <div className="table-wrap"><table className="member-table"><thead><tr><th>Thành viên</th><th>Đơn vị / Team</th><th>Bài mới</th><th>Chờ duyệt</th><th>Nháp</th><th>Cần review</th><th>Lượt đọc</th><th>Hoạt động</th><th>Trạng thái</th></tr></thead><tbody>{shown.map((m)=><tr key={m[0]}><td><div className="person"><span>{String(m[0]).split(" ").slice(-2).map(x=>x[0]).join("")}</span><strong>{m[0]}</strong></div></td><td>{m[1]}</td><td>{value(Number(m[2]))}</td><td>{value(Number(m[3]))}</td><td>{value(Number(m[4]))}</td><td>{value(Number(m[5]))}</td><td><b>{value(Number(m[6]))}</b></td><td>{m[7]}</td><td><Badge tone={m[8] === "Tốt" ? "green" : m[8] === "Không active" ? "red" : m[8] === "Cần nhắc" ? "amber" : "blue"}>{m[8]}</Badge></td></tr>)}</tbody></table></div>
      </Card>
      <div className="two-col member-bottom">
        <Card><SectionTitle icon="↻" title="Tình trạng người duyệt (KM)" /><div className="table-wrap"><table><thead><tr><th>Knowledge Manager</th><th>Chờ duyệt</th><th>Đã duyệt</th><th>TG. TB</th></tr></thead><tbody><tr><td>Nguyễn KM1</td><td>8</td><td>22</td><td>1.8 ngày</td></tr><tr><td>Trần KM2</td><td>4</td><td>31</td><td>2.1 ngày</td></tr><tr><td>Lê KM3</td><td className="text-red"><b>6</b></td><td>18</td><td className="text-amber"><b>3.4 ngày</b></td></tr></tbody></table></div></Card>
        <Card><SectionTitle icon="♧" title="Tần suất truy cập thành viên" /><div className="frequency">{[[">4 lần/tuần",29,"green"],["2–3 lần/tuần",19,"blue"],["1–2 lần/tuần",15,"amber"],["Không truy cập",17,"red"]].map(([l,n,c])=><div key={String(l)}><span>{l}</span><i><b className={`fill-${c}`} style={{width:`${Number(n)*2.6}%`}}/></i><strong>{value(Number(n))}</strong></div>)}</div></Card>
      </div>
    </div>
  );
}

function Health() {
  const cells = [[18,12,22,8],[9,16,14,5],[24,8,10,12],[6,18,8,3]];
  const rows = ["Process","Knowledge","Best Practices","Others"];
  return (
    <div className="tab-content">
      <div className="content-heading"><div><span className="eyebrow">HEALTH METRICS</span><h2>Sức khỏe kho tri thức</h2></div><span className="updated">Mục tiêu quý 2/2025</span></div>
      <div className="metric-grid five health-metrics">
        <MetricCard label="Knowledge Freshness" value="67%" note="Mục tiêu: >70% · cần cải thiện" tone="amber" progress={67}/>
        <MetricCard label="Search Success Rate" value="79%" note="79/100 lượt tìm có kết quả" tone="blue" progress={79}/>
        <MetricCard label="Contribution Rate" value="54%" note="43/80 member có bài trong kỳ" tone="green" progress={54}/>
        <MetricCard label="Knowledge Reuse" value="61%" note="Bài đọc ≥3 lần / tổng bài" tone="blue" progress={61}/>
        <MetricCard label="Review Compliance" value="48%" note="Review đúng hạn / tổng đến hạn" tone="red" progress={48}/>
      </div>
      <Card>
        <SectionTitle icon="▥" title="Expertise Coverage Map — bài viết theo loại × team" action="Số bài hiện có" />
        <div className="heatmap"><div className="heat-head"><span/><b>Games</b><b>Apps</b><b>Tech</b><b>P&OD</b></div>{cells.map((row,ri)=><div className="heat-row" key={rows[ri]}><b>{rows[ri]}</b>{row.map((n,i)=><span key={i} className={`heat heat-${n === 0 ? 0 : n < 8 ? 1 : n < 15 ? 2 : 3}`}>{n}</span>)}</div>)}</div>
        <div className="heat-legend"><span><i className="heat-0"/>0 · gap</span><span><i className="heat-1"/>&lt;8 bài</span><span><i className="heat-2"/>8–15 bài</span><span><i className="heat-3"/>&gt;15 bài</span></div>
      </Card>
      <Card>
        <SectionTitle icon="⌁" title="Xu hướng health metrics (6 tháng gần nhất)" action="T12 — T5" />
        <div className="trend-chart"><div className="y-axis"><span>85%</span><span>70%</span><span>55%</span><span>40%</span></div><svg viewBox="0 0 760 190" preserveAspectRatio="none" role="img" aria-label="Xu hướng 6 tháng"><path className="grid" d="M0 20H760 M0 70H760 M0 120H760 M0 170H760"/><polyline className="line blue-line" points="0,78 152,70 304,62 456,52 608,40 760,35"/><polyline className="line green-line" points="0,150 152,136 304,126 456,112 608,100 760,91"/><polyline className="line amber-line" points="0,180 152,170 304,162 456,150 608,139 760,127"/>{[[0,78],[152,70],[304,62],[456,52],[608,40],[760,35]].map((p,i)=><circle key={`b${i}`} cx={p[0]} cy={p[1]} r="4" className="point blue-point"/>)}{[[0,150],[152,136],[304,126],[456,112],[608,100],[760,91]].map((p,i)=><circle key={`g${i}`} cx={p[0]} cy={p[1]} r="4" className="point green-point"/>)}{[[0,180],[152,170],[304,162],[456,150],[608,139],[760,127]].map((p,i)=><circle key={`a${i}`} cx={p[0]} cy={p[1]} r="4" className="point amber-point"/>)}</svg><div className="x-axis">{["T12","T1","T2","T3","T4","T5"].map(x=><span key={x}>{x}</span>)}</div></div>
        <div className="chart-legend"><span><i className="dot green"/>Freshness</span><span><i className="dot blue"/>Search Success</span><span><i className="dot amber"/>Contribution</span></div>
      </Card>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("overview");
  const [unit, setUnit] = useState(units[0]);
  const [period, setPeriod] = useState(periods[2]);
  const [category, setCategory] = useState(categories[0]);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const factor = useMemo(() => {
    const u = unit === units[0] ? 1 : {"iKame Games":.34,"iKame Apps":.23,"P&OD":.16,"Technology":.27}[unit] || 1;
    const p = period === "7 ngày qua" ? .52 : period === "15 ngày qua" ? .72 : 1;
    const c = category === categories[0] ? 1 : .3;
    return u * p * c;
  }, [unit, period, category]);
  const noResults = search.toLowerCase().includes("xyz") || search.toLowerCase().includes("không có");
  const reset = () => { setUnit(units[0]); setPeriod(periods[2]); setCategory(categories[0]); setSearch(""); };
  return (
    <div className="app-shell">
      <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>
        <div className="brand"><span className="brand-mark">iW</span><div><strong>iWiki</strong><small>Knowledge Admin</small></div><button className="close-menu" onClick={()=>setSidebarOpen(false)}>×</button></div>
        <nav><span className="nav-label">KHÔNG GIAN LÀM VIỆC</span><button className="active"><Icon>⌘</Icon>Knowledge Dashboard</button><button><Icon tone="slate">▤</Icon>Quản lý bài viết</button><button><Icon tone="slate">♧</Icon>Thành viên</button><button><Icon tone="slate">⌕</Icon>Thống kê tìm kiếm</button><span className="nav-label">QUẢN TRỊ</span><button><Icon tone="slate">⚙</Icon>Cấu hình kho tri thức</button><button><Icon tone="slate">♙</Icon>Phân quyền</button></nav>
        <div className="sidebar-help"><span>?</span><div><strong>Cần trợ giúp?</strong><small>Xem hướng dẫn sử dụng</small></div></div>
        <div className="profile"><span>DN</span><div><strong>Dung Nguyen</strong><small>Knowledge Manager</small></div><button>⋯</button></div>
      </aside>
      {sidebarOpen && <button className="backdrop" aria-label="Đóng menu" onClick={()=>setSidebarOpen(false)}/>} 
      <main>
        <header className="topbar"><button className="menu-button" onClick={()=>setSidebarOpen(true)}>☰</button><div className="page-title"><Icon>⌘</Icon><div><strong>Knowledge Dashboard</strong><span>Demo · Dữ liệu mẫu</span></div></div><div className="top-actions"><label className="search"><span>⌕</span><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Tìm bài viết, thành viên..."/></label><button className="round-button">?</button><button className="round-button notification">♢<i/></button><span className="avatar">DN</span></div></header>
        <div className="filter-panel"><div className="filters"><SelectField label="Đơn vị" value={unit} values={units} onChange={setUnit}/><SelectField label="Thời gian" value={period} values={periods} onChange={setPeriod}/><SelectField label="Phân loại" value={category} values={categories} onChange={setCategory}/></div><button className="reset-button" onClick={reset}>↻ Đặt lại</button></div>
        <div className="tabs" role="tablist">{tabs.map(t=><button role="tab" aria-selected={tab===t.id} className={tab===t.id?"active":""} onClick={()=>setTab(t.id)} key={t.id}><span>{t.icon}</span>{t.label}</button>)}</div>
        {noResults ? <div className="content"><EmptyState onReset={reset}/></div> : <div className="content">{tab === "overview" && <Overview factor={factor}/>} {tab === "articles" && <Articles factor={factor}/>} {tab === "members" && <Members factor={factor}/>} {tab === "health" && <Health/>}</div>}
      </main>
    </div>
  );
}
