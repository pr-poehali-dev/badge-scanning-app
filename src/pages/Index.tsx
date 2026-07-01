import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Section = 'home' | 'scan' | 'contacts' | 'dialogs' | 'reports' | 'profile' | 'settings';

interface Message {
  id: number;
  from: 'me' | 'them';
  text: string;
  time: string;
}

interface Contact {
  id: number;
  name: string;
  role: string;
  company: string;
  email: string;
  time: string;
  initials: string;
}

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: 'home', label: 'Главная', icon: 'LayoutDashboard' },
  { id: 'scan', label: 'Сканирование', icon: 'ScanLine' },
  { id: 'contacts', label: 'Контакты', icon: 'Users' },
  { id: 'dialogs', label: 'Диалоги', icon: 'MessageSquare' },
  { id: 'reports', label: 'Отчёты', icon: 'BarChart3' },
  { id: 'profile', label: 'Профиль', icon: 'User' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' },
];

const MOCK: Contact[] = [
  { id: 1, name: 'Анна Соколова', role: 'CTO', company: 'TechNova', email: 'a.sokolova@technova.io', time: '10:24', initials: 'АС' },
  { id: 2, name: 'Дмитрий Орлов', role: 'Product Lead', company: 'FinCore', email: 'd.orlov@fincore.ru', time: '10:41', initials: 'ДО' },
  { id: 3, name: 'Елена Морозова', role: 'CEO', company: 'DataBridge', email: 'e.morozova@databridge.com', time: '11:07', initials: 'ЕМ' },
  { id: 4, name: 'Игорь Лебедев', role: 'Head of R&D', company: 'Quantum Labs', email: 'i.lebedev@qlabs.dev', time: '11:52', initials: 'ИЛ' },
];

const INITIAL_THREADS: Record<number, Message[]> = {
  1: [
    { id: 1, from: 'them', text: 'Добрый день! Рад был познакомиться на конференции.', time: '10:26' },
    { id: 2, from: 'me', text: 'Взаимно! Очень интересный доклад по ЛКМ-рынку.', time: '10:31' },
  ],
};

interface Profile {
  photo: string | null;
  lastName: string; firstName: string; middleName: string;
  position: string; company: string; phone: string; email: string;
}

const EMPTY_PROFILE: Profile = {
  photo: null, lastName: '', firstName: '', middleName: '',
  position: '', company: '', phone: '', email: '',
};

const Index = () => {
  const [active, setActive] = useState<Section>('scan');
  const [scanning, setScanning] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(MOCK);
  const [dialogContact, setDialogContact] = useState<Contact | null>(null);
  const [threads, setThreads] = useState<Record<number, Message[]>>(INITIAL_THREADS);
  const [readIds, setReadIds] = useState<Set<number>>(new Set([1]));
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);

  const unreadCount = contacts.filter(
    (c) => threads[c.id] && !readIds.has(c.id)
  ).length;

  const openDialog = (c: Contact) => {
    setDialogContact(c);
    setActive('dialogs');
  };

  const markRead = (contactId: number) => {
    setReadIds((prev) => new Set([...prev, contactId]));
  };

  const exportToExcel = () => {
    const rows = contacts.map((c) => ({
      'Дата сканирования': c.time,
      'Фамилия': c.name.split(' ')[0] ?? '',
      'Имя': c.name.split(' ')[1] ?? '',
      'Компания': c.company,
      'Должность': c.role,
      'Телефон': '',
      'Электронная почта': c.email,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [16, 18, 18, 22, 22, 18, 28].map((w) => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Контакты');
    XLSX.writeFile(wb, 'Контакты_ЛКМ_конференция.xlsx');
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const pool: Omit<Contact, 'id' | 'time'>[] = [
        { name: 'Павел Григорьев', role: 'CFO', company: 'NordStack', email: 'p.grigoriev@nordstack.io', initials: 'ПГ' },
        { name: 'Ольга Тихонова', role: 'VP Sales', company: 'Brightway', email: 'o.tihonova@brightway.com', initials: 'ОТ' },
        { name: 'Сергей Волков', role: 'Architect', company: 'CloudPeak', email: 's.volkov@cloudpeak.dev', initials: 'СВ' },
      ];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const now = new Date();
      setContacts((prev) => [
        { ...pick, id: Date.now(), time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}` },
        ...prev,
      ]);
      setScanning(false);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-primary text-primary-foreground p-6 sticky top-0 h-screen">
        <div className="mb-8 px-1">
          <img
            src="https://cdn.poehali.dev/projects/e53c8560-39e7-4b8f-bd8c-5898c960f106/bucket/7d037700-7288-4857-a63b-ef565a0fab06.jpg"
            alt="Рынки лакокрасочных материалов и сырья для ЛКМ"
            className="w-full rounded-lg bg-white p-2"
          />
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-primary-foreground/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon name={item.icon} size={18} />
                {item.id === 'dialogs' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              {item.label}
              {item.id === 'dialogs' && unreadCount > 0 && (
                <span className="ml-auto bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-sm font-semibold">
            МК
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">Максим Королёв</p>
            <p className="text-xs text-primary-foreground/50 truncate">Рынки ЛКМ и сырья</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
          <div>
            <h1 className="font-display font-semibold text-lg text-foreground">
              {NAV.find((n) => n.id === active)?.label}
            </h1>
            <p className="text-xs text-muted-foreground">Рынки лакокрасочных материалов и сырья для ЛКМ · Сочи</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={exportToExcel}>
              <Icon name="Download" size={16} />
              <span className="hidden sm:inline">Экспорт</span>
            </Button>
            <Button size="sm" className="gap-2 bg-accent hover:bg-accent/90" onClick={() => setActive('scan')}>
              <Icon name="ScanLine" size={16} />
              <span className="hidden sm:inline">Сканировать</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 animate-fade-in" key={active}>
          {active === 'home' && <HomeView contacts={contacts} profile={profile} onProfileChange={setProfile} />}
          {active === 'scan' && (
            <ScanView scanning={scanning} onScan={simulateScan} contacts={contacts} />
          )}
          {active === 'contacts' && <ContactsView contacts={contacts} onMessage={openDialog} onExport={exportToExcel} />}
          {active === 'dialogs' && (
            <DialogsView
              contacts={contacts}
              initialContact={dialogContact}
              threads={threads}
              setThreads={setThreads}
              onRead={markRead}
            />
          )}
          {active === 'reports' && <ReportsView contacts={contacts} />}
          {active === 'profile' && <ProfileView profile={profile} onProfileChange={setProfile} />}
          {active === 'settings' && <Placeholder icon="Settings" title="Настройки приложения" />}
        </main>

        {/* Mobile nav */}
        <nav className="lg:hidden flex items-center justify-around border-t border-border bg-card py-2 sticky bottom-0">
          {NAV.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-[11px] ${
                active === item.id ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon name={item.icon} size={20} />
                {item.id === 'dialogs' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value, hint }: { icon: string; label: string; value: string; hint: string }) => (
  <div className="bg-card rounded-xl border border-border p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
        <Icon name={icon} size={18} className="text-primary" />
      </div>
    </div>
    <p className="font-display font-bold text-2xl text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{hint}</p>
  </div>
);

const HomeView = ({
  contacts,
  profile,
  onProfileChange,
}: {
  contacts: Contact[];
  profile: Profile;
  onProfileChange: (p: Profile) => void;
}) => (
  <div className="max-w-5xl mx-auto space-y-6">
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Профиль участника */}
      <ProfileCard profile={profile} onProfileChange={onProfileChange} />

      {/* Статистика */}
      <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
        <Stat icon="Users" label="Собрано контактов" value={String(contacts.length)} hint="За сегодня" />
        <Stat icon="ScanLine" label="Сканирований" value={String(contacts.length + 3)} hint="Всего сессий" />
        <Stat icon="Building2" label="Компаний" value="18" hint="Уникальных" />
        <Stat icon="TrendingUp" label="Конверсия" value="72%" hint="В диалог" />
      </div>
    </div>

    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display font-semibold text-foreground mb-4">Последние контакты</h3>
      <div className="divide-y divide-border">
        {contacts.slice(0, 4).map((c) => (
          <ContactRow key={c.id} c={c} />
        ))}
      </div>
    </div>
  </div>
);

const ScanView = ({
  scanning,
  onScan,
  contacts,
}: {
  scanning: boolean;
  onScan: () => void;
  contacts: Contact[];
}) => (
  <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">
    <div className="bg-primary rounded-2xl p-8 flex flex-col items-center justify-center text-primary-foreground">
      <div className="relative w-64 h-64 rounded-2xl border-2 border-white/20 overflow-hidden bg-black/20">
        {/* corners */}
        {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
          <span
            key={i}
            className={`absolute ${pos} w-6 h-6 border-accent ${
              i === 0 ? 'border-t-2 border-l-2' : i === 1 ? 'border-t-2 border-r-2' : i === 2 ? 'border-b-2 border-l-2' : 'border-b-2 border-r-2'
            }`}
          />
        ))}
        {scanning ? (
          <div className="absolute inset-x-3 top-3 h-0.5 bg-accent shadow-[0_0_12px_2px] shadow-accent scan-line" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="QrCode" size={80} className="text-white/25" />
          </div>
        )}
      </div>
      <p className="mt-6 text-sm text-primary-foreground/70 text-center">
        {scanning ? 'Распознавание QR-кода…' : 'Наведите камеру на QR-код бейджа участника'}
      </p>
      <Button
        onClick={onScan}
        disabled={scanning}
        className="mt-5 bg-accent hover:bg-accent/90 gap-2 min-w-48"
      >
        <Icon name={scanning ? 'Loader' : 'ScanLine'} size={18} className={scanning ? 'animate-spin' : ''} />
        {scanning ? 'Сканирую…' : 'Начать сканирование'}
      </Button>
    </div>

    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground">Собранные бейджи</h3>
        <Badge variant="secondary">{contacts.length}</Badge>
      </div>
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {contacts.map((c) => (
          <ContactRow key={c.id} c={c} />
        ))}
      </div>
    </div>
  </div>
);

const ContactsView = ({
  contacts,
  onMessage,
  onExport,
}: {
  contacts: Contact[];
  onMessage: (c: Contact) => void;
  onExport: () => void;
}) => {
  const [query, setQuery] = useState('');
  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.company.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="max-w-5xl mx-auto bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex items-center gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Поиск по имени или компании…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon name="SlidersHorizontal" size={16} /> Фильтры
        </Button>
        <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={onExport}>
          <Icon name="FileSpreadsheet" size={16} />
          <span className="hidden sm:inline">Выгрузить в Excel</span>
        </Button>
      </div>
      <div className="divide-y divide-border">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">Контакты не найдены</p>
        )}
        {filtered.map((c) => (
          <ContactRow key={c.id} c={c} onMessage={() => onMessage(c)} />
        ))}
      </div>
    </div>
  );
};

const ReportsView = ({ contacts }: { contacts: Contact[] }) => (
  <div className="max-w-5xl mx-auto space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat icon="Users" label="Всего контактов" value={String(contacts.length)} hint="За конференцию" />
      <Stat icon="Clock" label="Ср. время" value="1.8с" hint="На сканирование" />
      <Stat icon="Star" label="В избранном" value="6" hint="Приоритетные" />
      <Stat icon="Mail" label="Отправлено" value="9" hint="Писем" />
    </div>
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display font-semibold text-foreground mb-4">Активность по часам</h3>
      <div className="flex items-end gap-2 h-40">
        {[30, 55, 40, 80, 65, 95, 70, 50, 60].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full rounded-t-md bg-accent/80" style={{ height: `${h}%` }} />
            <span className="text-[10px] text-muted-foreground">{9 + i}:00</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContactRow = ({ c, onMessage }: { c: Contact; onMessage?: () => void }) => (
  <div className="flex items-center gap-4 py-3 group">
    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
      {c.initials}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
      <p className="text-xs text-muted-foreground truncate">
        {c.role} · {c.company}
      </p>
    </div>
    <div className="text-right shrink-0 hidden sm:block">
      <p className="text-xs text-muted-foreground">{c.email}</p>
      <p className="text-[11px] text-muted-foreground/70">{c.time}</p>
    </div>
    {onMessage ? (
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onMessage}
      >
        <Icon name="MessageSquare" size={14} />
        <span className="hidden sm:inline text-xs">Написать</span>
      </Button>
    ) : (
      <Icon name="ChevronRight" size={16} className="text-muted-foreground shrink-0" />
    )}
  </div>
);

const DialogsView = ({
  contacts,
  initialContact,
  threads,
  setThreads,
  onRead,
}: {
  contacts: Contact[];
  initialContact?: Contact | null;
  threads: Record<number, Message[]>;
  setThreads: React.Dispatch<React.SetStateAction<Record<number, Message[]>>>;
  onRead: (id: number) => void;
}) => {
  const [selected, setSelected] = useState<Contact | null>(initialContact ?? contacts[0] ?? null);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = selected ? threads[selected.id] ?? [] : [];

  const selectContact = (c: Contact) => {
    setSelected(c);
    onRead(c.id);
  };

  const send = () => {
    if (!selected || !text.trim()) return;
    const now = new Date();
    const msg: Message = {
      id: Date.now(),
      from: 'me',
      text: text.trim(),
      time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
    };
    setThreads((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] ?? []), msg],
    }));
    onRead(selected.id);
    setText('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-10rem)] flex rounded-xl border border-border overflow-hidden bg-card">
      {/* Список контактов */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <p className="font-display font-semibold text-sm text-foreground">Контакты</p>
          <p className="text-xs text-muted-foreground mt-0.5">{contacts.length} участников</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map((c) => {
            const last = threads[c.id]?.at(-1);
            const unread = !threads[c.id];
            return (
              <button
                key={c.id}
                onClick={() => selectContact(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border/50 transition-colors ${
                  selected?.id === c.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                    {last && <span className="text-[10px] text-muted-foreground shrink-0">{last.time}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {last ? (last.from === 'me' ? `Вы: ${last.text}` : last.text) : c.company}
                  </p>
                </div>
                {unread && (
                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Чат */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Шапка чата */}
          <div className="h-14 border-b border-border px-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
              {selected.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{selected.name}</p>
              <p className="text-xs text-muted-foreground">{selected.role} · {selected.company}</p>
            </div>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <Icon name="MessageSquare" size={22} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Начните диалог с {selected.name.split(' ')[0]}</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    m.from === 'me'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-secondary text-foreground rounded-bl-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.from === 'me' ? 'text-primary-foreground/60 text-right' : 'text-muted-foreground'}`}>
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Поле ввода */}
          <div className="border-t border-border p-4 flex items-end gap-3">
            <textarea
              rows={1}
              placeholder={`Сообщение для ${selected.name.split(' ')[0]}…`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 transition max-h-32"
            />
            <Button
              onClick={send}
              disabled={!text.trim()}
              className="bg-accent hover:bg-accent/90 text-white h-10 w-10 p-0 shrink-0"
            >
              <Icon name="Send" size={18} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Выберите контакт для начала диалога
        </div>
      )}
    </div>
  );
};

const ProfileField = ({
  label, field, placeholder, required = true, type = 'text', profile, onProfileChange,
}: {
  label: string; field: keyof Profile; placeholder: string; required?: boolean; type?: string;
  profile: Profile; onProfileChange: (p: Profile) => void;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-foreground">
      {label}
      {!required && <span className="ml-1 text-xs text-muted-foreground">(необязательно)</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={profile[field] as string}
      onChange={(e) => onProfileChange({ ...profile, [field]: e.target.value })}
      className="h-10 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent/40 transition"
    />
  </div>
);

const ProfileCard = ({ profile, onProfileChange }: { profile: Profile; onProfileChange: (p: Profile) => void }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);

  const initials = [profile.lastName[0], profile.firstName[0]].filter(Boolean).join('').toUpperCase() || 'УЧ';
  const fullName = [profile.lastName, profile.firstName, profile.middleName].filter(Boolean).join(' ') || 'Участник';

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onProfileChange({ ...profile, photo: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 flex flex-col gap-5">
      <h3 className="font-display font-semibold text-foreground">Мой профиль</h3>

      {/* Фото */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => fileRef.current?.click()}
          className="relative w-16 h-16 rounded-full border-2 border-dashed border-border bg-secondary cursor-pointer hover:border-accent transition-colors flex items-center justify-center overflow-hidden group shrink-0"
        >
          {profile.photo ? (
            <img src={profile.photo} alt="Фото" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display font-bold text-lg text-muted-foreground">{initials}</span>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Icon name="Camera" size={16} className="text-white" />
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{fullName}</p>
          <p className="text-xs text-muted-foreground truncate">{profile.position || 'Должность не указана'}</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs text-accent hover:underline mt-1"
          >
            {profile.photo ? 'Изменить фото' : 'Загрузить фото'}
          </button>
        </div>
      </div>

      {/* Поля */}
      <div className="grid grid-cols-1 gap-3">
        <div className="grid grid-cols-2 gap-3">
          <ProfileField label="Фамилия" field="lastName" placeholder="Иванов" profile={profile} onProfileChange={onProfileChange} />
          <ProfileField label="Имя" field="firstName" placeholder="Иван" profile={profile} onProfileChange={onProfileChange} />
        </div>
        <ProfileField label="Отчество" field="middleName" placeholder="Иванович" required={false} profile={profile} onProfileChange={onProfileChange} />
        <ProfileField label="Должность" field="position" placeholder="Руководитель отдела" profile={profile} onProfileChange={onProfileChange} />
        <ProfileField label="Компания" field="company" placeholder="ООО «Лакокрас»" profile={profile} onProfileChange={onProfileChange} />
        <ProfileField label="Телефон" field="phone" placeholder="+7 (900) 000-00-00" type="tel" profile={profile} onProfileChange={onProfileChange} />
        <ProfileField label="E-mail" field="email" placeholder="ivanov@company.ru" type="email" profile={profile} onProfileChange={onProfileChange} />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Icon name={saved ? 'Check' : 'Save'} size={15} />
          {saved ? 'Сохранено' : 'Сохранить'}
        </Button>
        {saved && <span className="text-xs text-muted-foreground animate-fade-in">Данные обновлены</span>}
      </div>
    </div>
  );
};

const ProfileView = ({ profile, onProfileChange }: { profile: Profile; onProfileChange: (p: Profile) => void }) => (
  <div className="max-w-2xl mx-auto">
    <ProfileCard profile={profile} onProfileChange={onProfileChange} />
  </div>
);

const Placeholder = ({ icon, title }: { icon: string; title: string }) => (
  <div className="max-w-5xl mx-auto bg-card rounded-xl border border-border p-16 flex flex-col items-center justify-center text-center">
    <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
      <Icon name={icon} size={26} className="text-primary" />
    </div>
    <h3 className="font-display font-semibold text-foreground text-lg">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
      Раздел готов к настройке. Напишите, какие поля и действия здесь нужны.
    </p>
  </div>
);

export default Index;