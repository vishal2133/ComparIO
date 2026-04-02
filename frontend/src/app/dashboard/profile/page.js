'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', bio: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');
  const [showDelete, setShowDelete] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('compario_token') : null;

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', bio: user.bio || '' });
  }, [user]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        login(data.user, token);
        showMsg('success', 'Profile updated successfully! ✅');
      } else {
        showMsg('error', data.message);
      }
    } catch {
      showMsg('error', 'Failed to save. Try again.');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm)
      return showMsg('error', 'New passwords do not match');
    if (passwords.newPass.length < 6)
      return showMsg('error', 'New password must be 6+ characters');
    setChangingPass(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Password changed successfully! 🔒');
        setPasswords({ current: '', newPass: '', confirm: '' });
      } else {
        showMsg('error', data.message);
      }
    } catch {
      showMsg('error', 'Failed. Try again.');
    }
    setChangingPass(false);
  };

  const inputStyle = {
    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)',
    color: 'var(--text)', borderRadius: '12px', padding: '11px 14px',
    fontSize: '14px', outline: 'none',
  };

  const labelStyle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', display: 'block', marginBottom: '6px' };

  const tabs = ['profile', 'security', 'preferences'];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>My Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Manage your account details and preferences</p>
      </div>

      {/* Toast */}
      {msg.text && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl border animate-slide-up"
          style={{
            background: msg.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
            borderColor: msg.type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)',
            color: msg.type === 'success' ? '#34d399' : '#f87171',
          }}>
          {msg.text}
        </div>
      )}

      {/* Avatar + level */}
      <div className="rounded-3xl border p-6 mb-5 flex items-center gap-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-black text-3xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-amber-400 flex items-center justify-center text-xs">
            🏆
          </div>
        </div>
        <div>
          <div className="font-black text-xl" style={{ color: 'var(--text)' }}>{user?.name}</div>
          <div className="text-sm" style={{ color: 'var(--text3)' }}>{user?.email}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-black px-3 py-1 rounded-full"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
              Bronze Member
            </span>
            <span className="text-xs" style={{ color: 'var(--text3)' }}>
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl mb-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === tab ? 'text-white' : ''
            }`}
            style={{
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? undefined : 'var(--text3)',
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label style={labelStyle}>Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210" style={inputStyle} />
            </div>
          </div>
          <div className="mb-4">
            <label style={labelStyle}>Email Address</label>
            <input value={user?.email || ''} disabled
              style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Email cannot be changed</p>
          </div>
          <div className="mb-6">
            <label style={labelStyle}>Bio (optional)</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell us a bit about yourself..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-60"
            style={{ background: 'var(--accent)' }}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="font-black mb-4" style={{ color: 'var(--text)' }}>🔒 Change Password</h3>
            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label style={labelStyle}>Current Password</label>
                <input type="password" value={passwords.current}
                  onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="••••••••" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <input type="password" value={passwords.newPass}
                  onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
                  placeholder="Min 6 characters" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" value={passwords.confirm}
                  onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Repeat new password" style={inputStyle} />
              </div>
            </div>
            <button onClick={handleChangePassword} disabled={changingPass}
              className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: 'var(--accent)' }}>
              {changingPass ? 'Changing...' : '🔐 Update Password'}
            </button>
          </div>

          {/* Danger zone */}
          <div className="rounded-3xl border p-6"
            style={{ background: 'rgba(248,113,113,0.05)', borderColor: 'rgba(248,113,113,0.2)' }}>
            <h3 className="font-black text-red-400 mb-2">⚠️ Danger Zone</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>
              Deleting your account removes all your data permanently — alerts, warranty items, and coins.
            </p>
            {!showDelete ? (
              <button onClick={() => setShowDelete(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold border text-red-400 hover:bg-red-500/10 transition"
                style={{ borderColor: 'rgba(248,113,113,0.3)' }}>
                Delete Account
              </button>
            ) : (
              <div className="flex gap-3">
                <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition">
                  Yes, delete permanently
                </button>
                <button onClick={() => setShowDelete(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border transition"
                  style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PREFERENCES TAB */}
      {activeTab === 'preferences' && (
        <div className="rounded-3xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h3 className="font-black mb-5" style={{ color: 'var(--text)' }}>⚙️ Notification Preferences</h3>
          {[
            { key: 'emailAlerts', label: 'Email price alerts', sub: 'Get notified by email when your target price is reached', icon: '📧' },
            { key: 'pushAlerts', label: 'Push notifications', sub: 'Browser push notifications for deals', icon: '🔔' },
          ].map(pref => (
            <div key={pref.key} className="flex items-center justify-between py-4 border-b last:border-0"
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{pref.icon}</span>
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>{pref.label}</div>
                  <div className="text-xs" style={{ color: 'var(--text3)' }}>{pref.sub}</div>
                </div>
              </div>
              <div className="relative w-11 h-6 rounded-full cursor-pointer transition-all"
                style={{ background: 'rgba(59,130,246,0.3)' }}>
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-blue-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}