import Profile from "./Profile";
import Documents from "./Documents";
import Reminders from "./Reminders";
import EmergencyAccess from "./EmergencyAccess";
import AIAssistant from "../components/AIAssistant";
import { useState } from "react";

import {
  LayoutDashboard,
  FileText,
  Bell,
  Bot,
  Shield,
  User,
  Settings,
  Search,
  LogOut,
  Mail,
  Hash,
  KeyRound,
  Moon,
  Sun,
  Check,
  Sparkles,
  ArrowUpRight,
  Plus,
  Clock3,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("lifesphere_dark_mode") === "true";
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("lifesphere_notifications");
    return saved === null ? true : saved === "true";
  });

  const firstName = user?.name?.split(" ")[0] || "there";
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Documents", icon: FileText },
    { name: "Reminders", icon: Bell },
    { name: "AI Assistant", icon: Bot },
    { name: "Emergency Access", icon: Shield },
    { name: "Profile", icon: User },
    { name: "Settings", icon: Settings },
  ];

  const goTo = (page) => {
    setActivePage(page);
    setMobileMenu(false);
  };

  const handleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem("lifesphere_dark_mode", newValue.toString());
  };

  const handleNotifications = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem("lifesphere_notifications", newValue.toString());
  };

  const renderDashboardHome = () => (
    <div className="home-page">
      <header className="topbar">
        <div className="topbar-left">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(true)}>
            <Menu size={20} />
          </button>

          <div>
            <span className="eyebrow">PERSONAL COMMAND CENTER</span>
            <h1>Good morning, {firstName}.</h1>
            <p>Everything important to your LifeSphere is in one place.</p>
          </div>
        </div>

        <div className="topbar-actions">
          <button className="icon-button" title="Search">
            <Search size={19} />
          </button>
          <button
            className="icon-button notification-button"
            title="Notifications"
            onClick={handleNotifications}
          >
            <Bell size={19} />
            {notifications && <span className="notification-dot" />}
          </button>

          <div className="topbar-profile">
            <div className="user-avatar">{initial}</div>
            <div className="topbar-profile-copy">
              <strong>{user?.name || "User"}</strong>
              <span>{user?.role || "USER"}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="hero-card">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            LifeSphere Intelligence
          </div>

          <h2>Your personal digital life, organized.</h2>
          <p>
            Store important documents, manage reminders, use AI to understand
            your information, and keep emergency access ready when it matters.
          </p>

          <div className="hero-actions">
            <button className="hero-primary" onClick={() => goTo("AI Assistant")}>
              <Bot size={17} />
              Ask LifeSphere AI
              <ArrowUpRight size={16} />
            </button>

            <button className="hero-secondary" onClick={() => goTo("Documents")}>
              <Plus size={17} />
              Add a document
            </button>
          </div>
        </div>

        <div className="hero-orbit">
          <div className="orbit-ring ring-one" />
          <div className="orbit-ring ring-two" />
          <div className="hero-orb">
            <Sparkles size={34} />
          </div>
        </div>
      </section>

      <section className="overview-heading">
        <div>
          <span className="section-kicker">OVERVIEW</span>
          <h2>Your LifeSphere at a glance</h2>
        </div>
        <span className="secure-pill">
          <Shield size={14} />
          Secure session
        </span>
      </section>

      <section className="premium-stats-grid">
        <button className="premium-stat" onClick={() => goTo("Documents")}>
          <div className="premium-stat-top">
            <div className="stat-icon indigo"><FileText size={19} /></div>
            <ArrowUpRight size={17} />
          </div>
          <strong>0</strong>
          <span>Documents</span>
          <small>Your secure information vault</small>
        </button>

        <button className="premium-stat" onClick={() => goTo("Reminders")}>
          <div className="premium-stat-top">
            <div className="stat-icon amber"><Bell size={19} /></div>
            <ArrowUpRight size={17} />
          </div>
          <strong>0</strong>
          <span>Reminders</span>
          <small>Nothing waiting for your attention</small>
        </button>

        <button className="premium-stat" onClick={() => goTo("AI Assistant")}>
          <div className="premium-stat-top">
            <div className="stat-icon violet"><Bot size={19} /></div>
            <ArrowUpRight size={17} />
          </div>
          <strong className="ready-value">Ready</strong>
          <span>AI Assistant</span>
          <small>Ask questions about your information</small>
        </button>

        <button className="premium-stat" onClick={() => goTo("Emergency Access")}>
          <div className="premium-stat-top">
            <div className="stat-icon emerald"><Shield size={19} /></div>
            <ArrowUpRight size={17} />
          </div>
          <strong className="protected-value">Protected</strong>
          <span>Emergency Access</span>
          <small>Controlled access is available</small>
        </button>
      </section>

      <section className="workspace-grid">
        <div className="workspace-card">
          <div className="workspace-card-header">
            <div>
              <span className="section-kicker">DOCUMENT CENTER</span>
              <h2>Recent documents</h2>
            </div>
            <button className="text-button" onClick={() => goTo("Documents")}>
              View all <ChevronRight size={15} />
            </button>
          </div>

          <div className="modern-empty">
            <div className="empty-icon"><FileText size={22} /></div>
            <h3>Your document space is empty</h3>
            <p>Upload your first document and LifeSphere AI can start understanding it.</p>
            <button className="soft-action" onClick={() => goTo("Documents")}>
              <Plus size={16} /> Upload document
            </button>
          </div>
        </div>

        <div className="workspace-card">
          <div className="workspace-card-header">
            <div>
              <span className="section-kicker">YOUR DAY</span>
              <h2>Upcoming reminders</h2>
            </div>
            <button className="text-button" onClick={() => goTo("Reminders")}>
              View all <ChevronRight size={15} />
            </button>
          </div>

          <div className="modern-empty">
            <div className="empty-icon amber-bg"><Clock3 size={22} /></div>
            <h3>Your schedule is clear</h3>
            <p>Create reminders for appointments, tasks and important dates.</p>
            <button className="soft-action" onClick={() => goTo("Reminders")}>
              <Plus size={16} /> Create reminder
            </button>
          </div>
        </div>
      </section>

      <section className="quick-actions">
        <div>
          <span className="section-kicker">QUICK ACTIONS</span>
          <h2>What would you like to do?</h2>
        </div>

        <div className="quick-action-grid">
          <button onClick={() => goTo("AI Assistant")}>
            <span className="quick-icon purple"><Bot size={18} /></span>
            <span><strong>Ask AI</strong><small>Understand your data</small></span>
            <ChevronRight size={17} />
          </button>

          <button onClick={() => goTo("Documents")}>
            <span className="quick-icon blue"><FileText size={18} /></span>
            <span><strong>Manage documents</strong><small>Upload or review files</small></span>
            <ChevronRight size={17} />
          </button>

          <button onClick={() => goTo("Reminders")}>
            <span className="quick-icon orange"><Bell size={18} /></span>
            <span><strong>Add reminder</strong><small>Stay on top of your day</small></span>
            <ChevronRight size={17} />
          </button>

          <button onClick={() => goTo("Emergency Access")}>
            <span className="quick-icon green"><Shield size={18} /></span>
            <span><strong>Emergency access</strong><small>Manage trusted access</small></span>
            <ChevronRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );

  const renderProfile = () => (
    <>
      <header className="dashboard-header">
        <div>
          <span className="section-kicker">ACCOUNT</span>
          <h1>Profile</h1>
          <p>Manage your LifeSphere account information.</p>
        </div>
        <div className="user-avatar">{initial}</div>
      </header>

      <section className="profile-container">
        <div className="profile-header-card">
          <div className="large-avatar">{initial}</div>
          <div>
            <h2>{user?.name || "User"}</h2>
            <p>{user?.email || "Email not available"}</p>
            <span className="role-badge">{user?.role || "USER"}</span>
          </div>
        </div>

        <div className="profile-details">
          <h2>Account Information</h2>
          <div className="profile-detail-row">
            <div className="profile-detail-icon"><Hash size={20} /></div>
            <div><span>User ID</span><strong>{user?.id || "N/A"}</strong></div>
          </div>
          <div className="profile-detail-row">
            <div className="profile-detail-icon"><User size={20} /></div>
            <div><span>Full Name</span><strong>{user?.name || "N/A"}</strong></div>
          </div>
          <div className="profile-detail-row">
            <div className="profile-detail-icon"><Mail size={20} /></div>
            <div><span>Email Address</span><strong>{user?.email || "N/A"}</strong></div>
          </div>
          <div className="profile-detail-row">
            <div className="profile-detail-icon"><KeyRound size={20} /></div>
            <div><span>Account Role</span><strong>{user?.role || "USER"}</strong></div>
          </div>
        </div>

        <div className="profile-security">
          <h2>Security</h2>
          <p>Your account is protected using JWT authentication and BCrypt password hashing.</p>
          <div className="security-status">
            <span>✓</span>
            <div>
              <strong>Account Protected</strong>
              <p>Your authentication session is active.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const renderSettings = () => (
    <>
      <header className="dashboard-header">
        <div>
          <span className="section-kicker">PREFERENCES</span>
          <h1>Settings</h1>
          <p>Manage your LifeSphere preferences.</p>
        </div>
        <div className="user-avatar">{initial}</div>
      </header>

      <section className="settings-container">
        <div className="settings-card">
          <div className="settings-card-header">
            <Settings size={22} />
            <div><h2>General</h2><p>Application preferences</p></div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              {darkMode ? <Moon size={20} /> : <Sun size={20} />}
              <div><strong>Appearance</strong><span>{darkMode ? "Dark mode" : "Light mode"}</span></div>
            </div>
            <button className={darkMode ? "toggle-button enabled" : "toggle-button"} onClick={handleDarkMode} aria-label="Toggle appearance">
              <span />
            </button>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <Bell size={20} />
              <div><strong>Notifications</strong><span>{notifications ? "Notifications enabled" : "Notifications disabled"}</span></div>
            </div>
            <button className={notifications ? "toggle-button enabled" : "toggle-button"} onClick={handleNotifications} aria-label="Toggle notifications">
              <span />
            </button>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <User size={22} />
            <div><h2>Account</h2><p>Your account information</p></div>
          </div>
          <div className="account-summary">
            <div className="account-avatar">{initial}</div>
            <div><strong>{user?.name || "User"}</strong><span>{user?.email || "N/A"}</span></div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <Shield size={22} />
            <div><h2>Security</h2><p>Authentication and account security</p></div>
          </div>
          <div className="security-setting">
            <div className="security-check"><Check size={18} /></div>
            <div><strong>JWT Authentication Active</strong><span>Your LifeSphere session is protected.</span></div>
          </div>
        </div>
      </section>
    </>
  );

  return (
    <div className={darkMode ? "life-dashboard dark-mode" : "life-dashboard"}>
      {mobileMenu && <div className="mobile-overlay" onClick={() => setMobileMenu(false)} />}

      <aside className={mobileMenu ? "sidebar mobile-open" : "sidebar"}>
        <div className="sidebar-brand">
          <div className="brand-mark"><Sparkles size={19} /></div>
          <div className="brand-copy">
            <strong>LifeSphere</strong>
            <span>PERSONAL AI</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileMenu(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={activePage === item.name ? "nav-item active" : "nav-item"}
                onClick={() => goTo(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-label security-label">SECURITY</div>
        <nav className="sidebar-nav">
          {menuItems.slice(4, 5).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={activePage === item.name ? "nav-item active" : "nav-item"}
                onClick={() => goTo(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-label account-label">ACCOUNT</div>
        <nav className="sidebar-nav">
          {menuItems.slice(5).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={activePage === item.name ? "nav-item active" : "nav-item"}
                onClick={() => goTo(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initial}</div>
          <div className="sidebar-user-copy">
            <strong>{user?.name || "User"}</strong>
            <span>{user?.email || "Account"}</span>
          </div>
        </div>

        <button className="sidebar-logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="dashboard-main">
        {activePage === "Dashboard" && renderDashboardHome()}
        {activePage === "Documents" && <Documents />}
        {activePage === "Reminders" && <Reminders />}
        {activePage === "Profile" && <Profile />}
        {activePage === "Settings" && renderSettings()}
        {activePage === "AI Assistant" && <AIAssistant />}
        {activePage === "Emergency Access" && <EmergencyAccess />}
      </main>

      <nav className="mobile-bottom-nav">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className={activePage === item.name ? "mobile-nav-item active" : "mobile-nav-item"}
              onClick={() => goTo(item.name)}
            >
              <Icon size={19} />
              <span>{item.name === "Emergency Access" ? "Emergency" : item.name.replace(" Assistant", "")}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default Dashboard;
