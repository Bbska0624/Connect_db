import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './chat.css';
import Navbar from '../../shared/Navbar';
import {
  getThreads,
  getMessages,
  sendMessage,
  getPeople,
  getGeneralMessages,
  sendGeneralMessage,
} from '../../services/chatService';

// ── helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_AVATAR_BG = 'linear-gradient(135deg,var(--accent-lt),var(--accent))';

const AvatarImg = ({ avatarUrl, avatar, avatarStyle, size = 40 }) => {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: avatarStyle || DEFAULT_AVATAR_BG,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size * 0.45, flexShrink: 0,
      }}
    >
      {avatar}
    </div>
  );
};

// Build a virtual thread from a person/user object (before any messages exist)
const makeVirtualThread = (user) => ({
  id:          String(user.id ?? user._id),
  userId:      String(user.id ?? user._id),
  name:        user.name,
  avatar:      user.avatar,
  avatarUrl:   user.avatarUrl || '',
  avatarStyle: user.avatarStyle || '',
  isOnline:    user.isOnline ?? false,
  lastMessage: '',
  lastTime:    '',
  unread:      0,
  _virtual:    true,
});

// ─────────────────────────────────────────────────────────────────────────────

const Chat = () => {
  const location = useLocation();

  const [activeTab,       setActiveTab]       = useState('dms');
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isGeneralOpen,   setIsGeneralOpen]   = useState(false);
  const [panelData,       setPanelData]       = useState(null);

  // Thread list + people
  const [threads,  setThreads]  = useState([]);
  const [people,   setPeople]   = useState([]);

  // Active DM conversation
  const [activeThread,  setActiveThread]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [msgInput,      setMsgInput]      = useState('');
  const [sendingMsg,    setSendingMsg]    = useState(false);

  // General channel
  const [genMessages, setGenMessages] = useState([]);
  const [genInput,    setGenInput]    = useState('');

  const [loadingThreads, setLoadingThreads] = useState(true);

  const msgsEndRef       = useRef(null);
  const genEndRef        = useRef(null);
  const openUserHandled  = useRef(false);   // prevent repeated handling of route state

  const myId = (() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || '{}')?.id ?? ''; } catch { return ''; }
  })();

  const myUser = (() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || '{}'); } catch { return {}; }
  })();

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([getThreads(), getPeople()]).then(([tRes, pRes]) => {
      if (tRes.success) setThreads(tRes.data);
      if (pRes.success) setPeople(pRes.data);
      setLoadingThreads(false);
    });
  }, []);

  // ── Handle navigate-from-Discover / navigate-from-People ─────────────────
  // Runs once after threads finish loading
  useEffect(() => {
    if (loadingThreads || openUserHandled.current) return;
    const openUser = location.state?.openUser;
    if (!openUser) return;
    openUserHandled.current = true;

    const existing = threads.find(t => String(t.userId) === String(openUser.id));
    if (existing) {
      openThread(existing);
    } else {
      setActiveThread(makeVirtualThread(openUser));
      setMessages([]);
    }
    setActiveTab('dms');
  }, [loadingThreads, threads]);

  // ── Poll: refresh messages every 4 s when a thread is open ───────────────
  useEffect(() => {
    if (!activeThread) return;
    const id = setInterval(async () => {
      const res = await getMessages(activeThread.userId);
      if (res.success) setMessages(res.data);
    }, 4000);
    return () => clearInterval(id);
  }, [activeThread?.userId]);

  // ── Poll: refresh thread list every 8 s ──────────────────────────────────
  useEffect(() => {
    const id = setInterval(async () => {
      const res = await getThreads();
      if (res.success) setThreads(res.data);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  // ── Scroll to bottom on new messages ─────────────────────────────────────
  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { genEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [genMessages]);

  // ── Open a thread ─────────────────────────────────────────────────────────
  const openThread = async (thread) => {
    setActiveThread(thread);
    const res = await getMessages(thread.userId);
    if (res.success) setMessages(res.data);
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: 0 } : t));
  };

  // ── Start or switch to a conversation with a person (from People tab) ────
  const startConversation = (person) => {
    const existing = threads.find(t => String(t.userId) === String(person.id));
    if (existing) {
      openThread(existing);
    } else {
      setActiveThread(makeVirtualThread(person));
      setMessages([]);
    }
    setActiveTab('dms');
    setIsUserPanelOpen(false);
  };

  // ── Send DM ───────────────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    const text = msgInput.trim();
    if (!text || sendingMsg || !activeThread) return;
    setSendingMsg(true);
    const res = await sendMessage(activeThread.userId, text);
    if (res.success) {
      setMessages(prev => [...prev, res.data]);
      setMsgInput('');
      // Refresh thread list so this conversation appears / updates
      getThreads().then(r => {
        if (r.success) {
          setThreads(r.data);
          // If this was a virtual thread, replace it with the real one from the API
          if (activeThread._virtual) {
            const real = r.data.find(t => String(t.userId) === String(activeThread.userId));
            if (real) setActiveThread(real);
          }
        }
      });
    }
    setSendingMsg(false);
  };

  // ── General channel ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isGeneralOpen && genMessages.length === 0) {
      getGeneralMessages().then(res => { if (res.success) setGenMessages(res.data); });
    }
  }, [isGeneralOpen]);

  const handleSendGeneral = async () => {
    const text = genInput.trim();
    if (!text) return;
    const res = await sendGeneralMessage(text);
    if (res.success) {
      setGenMessages(prev => [...prev, res.data]);
      setGenInput('');
    }
  };

  // ── User panel ────────────────────────────────────────────────────────────
  const openUserPanel = (person) => {
    setPanelData(person);
    setIsUserPanelOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

      <div className="chat-shell">

        {/* ── Left: thread list ── */}
        <div className="thread-col">
          <div className="tc-head">
            <div className="tc-title">Мессеж</div>
            <div className="tc-search">
              <span className="tc-search-ico">🔍</span>
              <input className="tc-search-inp" placeholder="Хайх..." />
            </div>
          </div>

          {/* Tabs */}
          <div className="chat-tabs">
            <button className={`chat-tab${activeTab === 'dms'    ? ' on' : ''}`} onClick={() => setActiveTab('dms')}>
              💬 Мессеж
            </button>
            <button className={`chat-tab${activeTab === 'people' ? ' on' : ''}`} onClick={() => setActiveTab('people')}>
              👥 Бүгд <span className="ct-badge">{people.length}</span>
            </button>
          </div>

          {/* ── DM tab ── */}
          <div className="thread-list" style={{ display: activeTab === 'dms' ? 'flex' : 'none', flexDirection: 'column' }}>

            {/* General channel */}
            <div className="tc-cat">▾ СУВГУУД</div>
            <div className="th-item" onClick={() => setIsGeneralOpen(true)}>
              <div className="th-av" style={{ background: 'linear-gradient(135deg,var(--accent-lt),var(--accent))', borderRadius: '10px', fontSize: '18px', fontWeight: 900 }}>#</div>
              <div className="th-body">
                <div className="th-row">
                  <div className="th-name"># general</div>
                </div>
                <div className="th-pre">Нийтийн чат</div>
              </div>
            </div>

            {/* DM threads from API */}
            <div className="tc-cat" style={{ marginTop: '6px' }}>▾ ХАРИЛЦАА</div>

            {/* Virtual (new) thread shown at top if no real thread yet */}
            {activeThread?._virtual && (
              <div className="th-item on">
                <AvatarImg avatarUrl={activeThread.avatarUrl} avatar={activeThread.avatar} avatarStyle={activeThread.avatarStyle} size={40} />
                <div className="th-body">
                  <div className="th-row">
                    <div className="th-name">{activeThread.name}</div>
                  </div>
                  <div className="th-pre" style={{ color: 'var(--dim)' }}>Шинэ харилцаа</div>
                </div>
              </div>
            )}

            {loadingThreads
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="th-item" style={{ gap: 10 }}>
                    <div className="th-av skeleton">&nbsp;</div>
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 6 }}>&nbsp;</div>
                      <div className="skeleton" style={{ height: 10, width: '80%' }}>&nbsp;</div>
                    </div>
                  </div>
                ))
              : threads.map(thread => (
                  <div
                    key={thread.id}
                    className={`th-item${activeThread?.id === thread.id ? ' on' : ''}`}
                    onClick={() => openThread(thread)}
                  >
                    <div style={{ position: 'relative' }}>
                      <AvatarImg avatarUrl={thread.avatarUrl} avatar={thread.avatar} avatarStyle={thread.avatarStyle} size={40} />
                      {thread.isOnline && <div className="th-on"></div>}
                    </div>
                    <div className="th-body">
                      <div className="th-row">
                        <div className="th-name">{thread.name}</div>
                        <div className="th-time">{thread.lastTime}</div>
                      </div>
                      <div className={`th-pre${thread.unread ? ' new' : ''}`}>{thread.lastMessage}</div>
                    </div>
                    {thread.unread > 0 && <div className="th-unread">{thread.unread}</div>}
                  </div>
                ))
            }

            {!loadingThreads && threads.length === 0 && !activeThread?._virtual && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--sub)', fontSize: 13 }}>
                Харилцаа байхгүй байна.<br />Discover-оос оюутантай холбогдоорой.
              </div>
            )}
          </div>

          {/* ── People tab ── */}
          <div className="thread-list" style={{ display: activeTab === 'people' ? 'flex' : 'none', flexDirection: 'column' }}>
            <div className="tc-cat">▾ ОНЛАЙН</div>
            {people.filter(p => p.isOnline).map(person => (
              <div key={String(person.id)} className="th-item" onClick={() => openUserPanel(person)}>
                <div style={{ position: 'relative' }}>
                  <AvatarImg avatarUrl={person.avatarUrl} avatar={person.avatar} avatarStyle={person.avatarStyle} size={40} />
                  <div className="th-on"></div>
                </div>
                <div className="th-body">
                  <div className="th-row">
                    <div className="th-name">{person.name}</div>
                    <div className="ppl-mbti">{person.mbti}</div>
                  </div>
                  <div className="th-pre">{person.major} · {person.year}</div>
                </div>
                <div className="ppl-score">{person.score}</div>
              </div>
            ))}

            <div className="tc-cat" style={{ marginTop: '8px' }}>▾ ОФЛАЙН</div>
            {people.filter(p => !p.isOnline).map(person => (
              <div key={String(person.id)} className="th-item" onClick={() => openUserPanel(person)}>
                <div style={{ position: 'relative' }}>
                  <AvatarImg avatarUrl={person.avatarUrl} avatar={person.avatar} avatarStyle={person.avatarStyle} size={40} />
                </div>
                <div className="th-body">
                  <div className="th-row">
                    <div className="th-name">{person.name}</div>
                    <div className="ppl-mbti">{person.mbti}</div>
                  </div>
                  <div className="th-pre">{person.major} · {person.year}</div>
                </div>
                <div className="ppl-score" style={{ color: 'var(--dim)' }}>{person.score}</div>
              </div>
            ))}

            {people.length === 0 && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--sub)', fontSize: 13 }}>
                Одоогоор бусад оюутан байхгүй байна.
              </div>
            )}
          </div>
        </div>

        {/* ── Right: chat window ── */}
        <div className="chat-win">
          {activeThread ? (
            <>
              {/* Header */}
              <div className="chat-bar">
                <AvatarImg avatarUrl={activeThread.avatarUrl} avatar={activeThread.avatar} avatarStyle={activeThread.avatarStyle} size={38} />
                <div style={{ marginLeft: 10 }}>
                  <div className="cb-name">{activeThread.name}</div>
                  <div className="cb-status" style={{ color: activeThread.isOnline ? '#059669' : 'var(--mute)' }}>
                    {activeThread.isOnline ? '● Онлайн байна' : '○ Офлайн'}
                  </div>
                </div>
                <div className="cb-acts">
                  <div className="cb-btn" onClick={() => {
                    const person = people.find(p => String(p.id) === String(activeThread.userId));
                    if (person) openUserPanel(person);
                  }}>👤</div>
                  <div className="cb-btn">⋯</div>
                </div>
              </div>

              {/* Messages */}
              <div className="msgs">
                <div className="date-sep">Өнөөдөр</div>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--sub)', fontSize: 13, padding: '32px 0' }}>
                    Анхны мессежээ илгээнэ үү 👋
                  </div>
                )}
                {messages.map(msg => {
                  const isMe = String(msg.senderId) === myId;
                  return (
                    <div key={msg.id ?? msg._id} className={`msg-row${isMe ? ' me' : ''}`}>
                      <div style={{ flexShrink: 0, marginTop: 2 }}>
                        <AvatarImg
                          avatarUrl={isMe ? (myUser.avatarUrl || '') : (activeThread.avatarUrl || '')}
                          avatar={isMe ? (myUser.avatar || '😊') : activeThread.avatar}
                          avatarStyle={isMe ? (myUser.avatarStyle || '') : activeThread.avatarStyle}
                          size={36}
                        />
                      </div>
                      <div className="msg-content">
                        <div className={`msg-sender${isMe ? ' me-n' : ''}`}>
                          {isMe ? 'Би' : activeThread.name}
                          <span className="msg-ts">{msg.time}</span>
                        </div>
                        <div className="bubble">{msg.text}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={msgsEndRef} />
              </div>

              {/* Input */}
              <div className="chat-inp-row">
                <div className="chat-box">
                  <button className="chat-ico">📎</button>
                  <input
                    className="chat-inp"
                    placeholder={`${activeThread.name} руу мессеж...`}
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  />
                  <button className="chat-ico">😊</button>
                </div>
                <button className="chat-send" onClick={handleSendMessage} disabled={sendingMsg}>
                  {sendingMsg
                    ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span>
                    : '➤'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sub)', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 40 }}>💬</div>
              <div style={{ fontSize: 14 }}>Харилцааг сонгоно уу</div>
            </div>
          )}
        </div>

        {/* ── User side panel ── */}
        <div className={`user-panel${isUserPanelOpen ? ' open' : ''}`}>
          <div className="up-close" onClick={() => setIsUserPanelOpen(false)}>✕</div>
          {panelData && (
            <>
              <div className="up-head">
                <div className="up-ava" style={{ background: panelData.avatarStyle }}>
                  {panelData.avatarUrl
                    ? <img src={panelData.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : panelData.avatar
                  }
                  <div className={`up-dot ${panelData.isOnline ? 'on' : 'off'}`}></div>
                </div>
                <div className="up-name">{panelData.name}</div>
                <div className="up-mbti">{panelData.mbti}</div>
                <div className="up-meta">{panelData.major} · {panelData.year}</div>
              </div>
              <div className="up-match-bar">
                <div className="up-match-lbl">Хуваарийн таарц</div>
                <div className="up-match-n">{panelData.score}</div>
              </div>
              <div className="up-track">
                <div className="up-fill" style={{ width: panelData.score, background: 'linear-gradient(90deg,var(--accent),var(--accent-h))' }}></div>
              </div>
              <div className="up-sec">СОНИРХОЛ</div>
              <div className="up-tags">
                {panelData.tags.map((tag, i) => (
                  <span key={i} className="up-tag">{tag}</span>
                ))}
              </div>
              <div className="up-sec" style={{ marginTop: '16px' }}>ТАНИЛЦУУЛГА</div>
              <div className="up-bio">{panelData.bio}</div>
              <button className="up-chat-btn" onClick={() => startConversation(panelData)}>
                💬 Мессеж илгээх
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── GENERAL CHANNEL OVERLAY ── */}
      <div className={`gen-ov${isGeneralOpen ? ' open' : ''}`}>
        <div className="gen-modal">
          <div className="gen-top">
            <button className="gen-back" onClick={() => setIsGeneralOpen(false)}>←</button>
            <div className="gen-hash">#</div>
            <div>
              <span className="gen-title">general</span>
              <span className="gen-desc"> · нийтийн чат</span>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="gen-online">
                <div className="gen-dot"></div>
                <span><strong style={{ color: 'var(--ink)' }}>{people.filter(p => p.isOnline).length}</strong> онлайн</span>
              </div>
              <button className="gen-x" onClick={() => setIsGeneralOpen(false)}>✕ Гарах</button>
            </div>
          </div>

          {/* Messages */}
          <div className="gen-msgs">
            {genMessages.map(msg => (
              <div key={msg.id ?? msg._id} className="gen-msg">
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  <AvatarImg avatarUrl={msg.avatarUrl || ''} avatar={msg.avatar} avatarStyle={msg.avatarStyle} size={36} />
                </div>
                <div className="gen-body">
                  <div className="gen-head">
                    <span className="gen-name">{msg.senderName}</span>
                    <span className="gen-ts">{msg.time}</span>
                  </div>
                  <div className="gen-text">{msg.text}</div>
                </div>
              </div>
            ))}
            <div ref={genEndRef} />
          </div>

          {/* Input */}
          <div className="gen-inp-row">
            <div className="gen-box">
              <span style={{ fontSize: '16px', color: 'var(--mute)', cursor: 'pointer' }}>📎</span>
              <input
                className="gen-inp"
                placeholder="# general-д мессеж бичих..."
                value={genInput}
                onChange={e => setGenInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendGeneral()}
              />
              <span style={{ fontSize: '16px', color: 'var(--mute)', cursor: 'pointer' }}>😊</span>
            </div>
            <button className="gen-send" onClick={handleSendGeneral}>➤</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
