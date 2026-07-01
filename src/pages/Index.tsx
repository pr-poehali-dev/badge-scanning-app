import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Section = 'home' | 'scan' | 'contacts' | 'reports' | 'profile' | 'settings';

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

const Index = () => {
  const [active, setActive] = useState<Section>('scan');
  const [scanning, setScanning] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(MOCK);

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
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <Icon name="QrCode" size={22} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-none">BadgeScan</p>
            <p className="text-xs text-primary-foreground/60 mt-1">Enterprise Edition</p>
          </div>
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
              <Icon name={item.icon} size={18} />
              {item.label}
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
            <p className="text-xs text-muted-foreground">Рынки лакокрасочных материалов и сырья для ЛКМ · Москва</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
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
          {active === 'home' && <HomeView contacts={contacts} />}
          {active === 'scan' && (
            <ScanView scanning={scanning} onScan={simulateScan} contacts={contacts} />
          )}
          {active === 'contacts' && <ContactsView contacts={contacts} />}
          {active === 'reports' && <ReportsView contacts={contacts} />}
          {active === 'profile' && <Placeholder icon="User" title="Профиль участника" />}
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
              <Icon name={item.icon} size={20} />
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

const HomeView = ({ contacts }: { contacts: Contact[] }) => (
  <div className="max-w-5xl mx-auto space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat icon="Users" label="Собрано контактов" value={String(contacts.length)} hint="За сегодня" />
      <Stat icon="ScanLine" label="Сканирований" value={String(contacts.length + 3)} hint="Всего сессий" />
      <Stat icon="Building2" label="Компаний" value="18" hint="Уникальных" />
      <Stat icon="TrendingUp" label="Конверсия" value="72%" hint="В диалог" />
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

const ContactsView = ({ contacts }: { contacts: Contact[] }) => (
  <div className="max-w-5xl mx-auto bg-card rounded-xl border border-border overflow-hidden">
    <div className="p-5 border-b border-border flex items-center gap-3">
      <div className="relative flex-1">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Поиск по имени или компании…"
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>
      <Button variant="outline" size="sm" className="gap-2">
        <Icon name="SlidersHorizontal" size={16} /> Фильтры
      </Button>
    </div>
    <div className="divide-y divide-border">
      {contacts.map((c) => (
        <ContactRow key={c.id} c={c} />
      ))}
    </div>
  </div>
);

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

const ContactRow = ({ c }: { c: Contact }) => (
  <div className="flex items-center gap-4 py-3">
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
    <Icon name="ChevronRight" size={16} className="text-muted-foreground shrink-0" />
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