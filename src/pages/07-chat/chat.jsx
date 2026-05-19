import { useState, useEffect, useRef } from 'react';
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

const Chat = () => {
  const [activeTab,       setActiveTab]       = useState('dms');
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isGeneralOpen,   setIsGeneralOpen]   = useState(false);
  const [panelData,       setPanelData]       = useState(null);

  // Thread list + people
  const [threads,  setThreads]  = useState([]);
  const [people,   setPeople]   = useState([]);

  // Active DM conversation
  const [activeThread,  setActiveThread]  = useState(null); // thread object
  const [messages,      setMessages]      = useState([]);
  const [msgInput,      setMsgInput]      = useState('');
  const [sendingMsg,    setSendingMsg]    = useState(false);

  // General channel
  const [genMessages, setGenMessages] = useState([]);
  const [genInput,    setGenInput]    = useState('');

  const [loadingThreads, setLoadingThreads] = useState(true);

  const msgsEndRef = useRef(null);
  const genEndRef  = useRef(null);

  const myId = JSON.parse(localStorage.getItem('auth_user') || '{}')?.id ?? '';

  // ── Initial load ──────────────────────────────────────────────────────────
  // GET /api/chat/threads  +  GET /api/chat/people  +  default conversation
  useEffect(() => {
    Promise.all([getThreads(), getPeople()]).then(([tRes, pRes]) => {
      if (tRes.success) {
        setThreads(tRes.data);
        // Open the first thread by default
        if (tRes.data.length > 0) openThread(tRes.data[0]);
      }
      if (pRes.success) setPeople(pRes.data);
      setLoadingThreads(false);
    });
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { genEndRef.current?.scrollIntoView({ behavior: 'smooth' });  }, [genMessages]);

  // ── Thread selection ──────────────────────────────────────────────────────
  // GET /api/chat/messages/:userId
  const openThread = async (thread) => {
    setActiveThread(thread);
    const res = await getMessages(thread.userId);
    if (res.success) setMessages(res.data);
    // Clear unread badge
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: 0 } : t));
  };

  // ── Send DM ───────────────────────────────────────────────────────────────
  // POST /api/chat/messages/:userId
  const handleSendMessage = async () => {
    const text = msgInput.trim();
    if (!text || sendingMsg || !activeThread) return;
    setSendingMsg(true);
    const res = await sendMessage(activeThread.userId, text);
    if (res.success) {
      setMessages(prev => [...prev, res.data]);
      setMsgInput('');
      // Update thread preview
      setThreads(prev => prev.map(t =>
        t.id === activeThread.id ? { ...t, lastMessage: text, lastTime: res.data.time } : t
      ));
    }
    setSendingMsg(false);
  };

  // ── General channel ───────────────────────────────────────────────────────
  // GET /api/chat/general  (lazy — only when modal opens)
  useEffect(() => {
    if (isGeneralOpen && genMessages.length === 0) {
      getGeneralMessages().then(res => { if (res.success) setGenMessages(res.data); });
    }
  }, [isGeneralOpen]);

  // POST /api/chat/general
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

      {/* ── CHAT SHELL ── */}
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
              👥 Бүгд <span className="ct-badge">1,247</span>
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
                  <div className="th-time">14:31</div>
                </div>
                <div className="th-pre new">Номинчимэг: React мэддэг үү?</div>
              </div>
              <div className="th-unread">12</div>
            </div>

            {/* DM threads from API */}
            <div className="tc-cat" style={{ marginTop: '6px' }}>▾ ИДЭВХТЭЙ</div>
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
                    <div className="th-av" style={{ background: thread.avatarStyle }}>
                      {thread.avatar}
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
          </div>

          {/* ── People tab ── */}
          <div className="thread-list" style={{ display: activeTab === 'people' ? 'flex' : 'none', flexDirection: 'column' }}>
            <div className="tc-cat">▾ ОНЛАЙН</div>
            {people.filter(p => p.isOnline).map(person => (
              <div key={person.id} className="th-item" onClick={() => openUserPanel(person)}>
                <div className="th-av" style={{ background: person.avatarStyle }}>
                  {person.avatar}
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
              <div key={person.id} className="th-item" onClick={() => openUserPanel(person)}>
                <div className="th-av" style={{ background: person.avatarStyle }}>{person.avatar}</div>
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
          </div>
        </div>

        {/* ── Right: chat window ── */}
        <div className="chat-win">
          {activeThread ? (
            <>
              {/* Header */}
              <div className="chat-bar">
                <div className="cb-av" style={{ background: activeThread.avatarStyle }}>{activeThread.avatar}</div>
                <div>
                  <div className="cb-name">{activeThread.name}</div>
                  <div className="cb-status" style={{ color: activeThread.isOnline ? '#059669' : 'var(--mute)' }}>
                    {activeThread.isOnline ? '● Онлайн байна' : '○ Офлайн'}
                  </div>
                </div>
                <div className="cb-acts">
                  <div className="cb-btn" onClick={() => {
                    const person = people.find(p => p.id === activeThread.userId);
                    if (person) openUserPanel(person);
                  }}>👤</div>
                  <div className="cb-btn">📅</div>
                  <div className="cb-btn">⋯</div>
                </div>
              </div>

              {/* Common time banner */}
              <div className="ct-banner">
                <div style={{ fontSize: '16px' }}>📅</div>
                <div className="ct-txt">Та хоёр <strong>Лхагва 14:00–16:00, Пүрэв 10:00–12:00</strong> нийтлэг цагтай.</div>
              </div>

              {/* Messages */}
              <div className="msgs">
                <div className="date-sep">Өнөөдөр</div>
                {messages.map(msg => (
                  <div key={msg.id} className={`msg-row${String(msg.senderId) === myId ? ' me' : ''}`}>
                    <div className="msg-av">
                      {String(msg.senderId) === myId ? '😊' : activeThread.avatar}
                    </div>
                    <div className="msg-content">
                      <div className={`msg-sender${String(msg.senderId) === myId ? ' me-n' : ''}`}>
                        {String(msg.senderId) === myId ? 'Би' : activeThread.name}
                        <span className="msg-ts">{msg.time}</span>
                      </div>
                      <div className="bubble">{msg.text}</div>
                    </div>
                  </div>
                ))}
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
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="chat-ico">😊</button>
                </div>
                <button className="chat-send" onClick={handleSendMessage} disabled={sendingMsg}>
                  {sendingMsg ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span> : '➤'}
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
                  {panelData.avatar}
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
              <div className="up-sec" style={{ marginTop: '16px' }}>НИЙТЛЭГ ЦАГ</div>
              <div className="up-sched">📅 Лхагва 14:00–16:00, Пүрэв 10:00–12:00</div>
              <button className="up-chat-btn" onClick={() => {
                const thread = threads.find(t => t.userId === panelData.id);
                if (thread) { openThread(thread); setActiveTab('dms'); }
                setIsUserPanelOpen(false);
              }}>
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
              <div className="gen-online"><div className="gen-dot"></div><span><strong style={{ color: 'var(--ink)' }}>48</strong> онлайн</span></div>
              <button className="gen-x" onClick={() => setIsGeneralOpen(false)}>✕ Гарах</button>
            </div>
          </div>

          {/* Messages */}
          <div className="gen-msgs">
            {genMessages.map(msg => (
              <div key={msg.id} className="gen-msg">
                <div className="gen-av" style={{ background: msg.avatarStyle }}>{msg.avatar}</div>
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
