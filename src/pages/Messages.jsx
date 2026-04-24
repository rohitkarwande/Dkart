import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Send, MessageSquare, Package } from 'lucide-react';
import './Messages.css';

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherParties, setOtherParties] = useState({}); // userId -> profile map
  const messagesEndRef = useRef(null);
  const { profile } = useAuthStore();

  const CURRENT_USER_ID = profile?.id;

  // Fetch chat list with profile info for both parties
  useEffect(() => {
    if (!CURRENT_USER_ID) return;

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id,
          status,
          listing_id,
          buyer_id,
          seller_id,
          equipment_listings (id, title, price)
        `)
        .or(`buyer_id.eq.${CURRENT_USER_ID},seller_id.eq.${CURRENT_USER_ID}`)
        .order('created_at', { ascending: false });

      if (error) { console.error(error); return; }

      setChats(data || []);

      // Collect all unique other-party IDs to fetch names
      const otherIds = [...new Set(
        (data || []).map(c => c.buyer_id === CURRENT_USER_ID ? c.seller_id : c.buyer_id)
      )].filter(Boolean);

      if (otherIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, company_name, is_verified')
          .in('id', otherIds);

        const profileMap = {};
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
        setOtherParties(profileMap);
      }
    };

    fetchChats();
  }, [CURRENT_USER_ID]);

  // Fetch messages + subscribe to real-time updates
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', activeChat.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        scrollToBottom();
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat_${activeChat.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChat.id}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !CURRENT_USER_ID) return;

    const messageText = newMessage;
    setNewMessage('');

    const { error } = await supabase.from('messages').insert([{
      chat_id: activeChat.id,
      sender_id: CURRENT_USER_ID,
      content: messageText,
    }]);

    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeChat) return;
    const { error } = await supabase
      .from('chats')
      .update({ status: newStatus })
      .eq('id', activeChat.id);

    if (!error) {
      setActiveChat(prev => ({ ...prev, status: newStatus }));
      setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, status: newStatus } : c));
    }
  };

  const getOtherParty = (chat) => {
    const otherId = chat.buyer_id === CURRENT_USER_ID ? chat.seller_id : chat.buyer_id;
    return otherParties[otherId] || null;
  };

  const getStatusColor = (status) => {
    if (status === 'open') return '#10b981';
    if (status === 'negotiating') return '#f59e0b';
    if (status === 'closed') return '#64748b';
    return '#10b981';
  };

  return (
    <div className="messages-container">
      <div className="chat-layout">

        {/* Left Sidebar: Chat List */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>Messages & Deals</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {chats.length} conversation{chats.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="chat-list">
            {chats.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <MessageSquare size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                <p style={{ fontWeight: '600' }}>No conversations yet</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Contact a seller to start negotiating</p>
              </div>
            ) : (
              chats.map((chat) => {
                const other = getOtherParty(chat);
                const displayName = other?.company_name || other?.full_name || 'Unknown User';
                const role = chat.buyer_id === CURRENT_USER_ID ? 'Buying' : 'Selling';

                return (
                  <div
                    key={chat.id}
                    className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                    onClick={() => setActiveChat(chat)}
                  >
                    <div className="chat-avatar">{displayName[0]?.toUpperCase() || '?'}</div>
                    <div className="chat-preview">
                      <div className="chat-name">{displayName}</div>
                      <div className="chat-listing-title">
                        <Package size={12} /> {chat.equipment_listings?.title || 'Unknown Listing'}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', background: '#f1f5f9', color: 'var(--text-muted)', fontWeight: '600' }}>
                          {role}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: getStatusColor(chat.status) }}>
                          {chat.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Main: Chat Area */}
        {activeChat ? (
          <main className="chat-main">
            <header className="chat-header">
              <div className="chat-header-info">
                <h3>{activeChat.equipment_listings?.title || 'Negotiation'}</h3>
                <p style={{ color: getStatusColor(activeChat.status), fontWeight: '700' }}>
                  Status: {activeChat.status?.toUpperCase()}
                </p>
              </div>
              <div className="chat-actions">
                {activeChat.status === 'open' && (
                  <button className="chat-btn primary" onClick={() => handleUpdateStatus('negotiating')}>
                    Start Negotiating
                  </button>
                )}
                {activeChat.status === 'negotiating' && (
                  <>
                    <button className="chat-btn secondary" onClick={() => handleUpdateStatus('open')}>
                      Reopen
                    </button>
                    <button className="chat-btn primary" onClick={() => handleUpdateStatus('closed')}>
                      Mark as Closed
                    </button>
                  </>
                )}
              </div>
            </header>

            <div className="messages-area">
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
                  <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p style={{ fontWeight: '600' }}>Start the negotiation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSentByMe = msg.sender_id === CURRENT_USER_ID;
                  return (
                    <div key={msg.id} className={`message-bubble ${isSentByMe ? 'sent' : 'received'}`}>
                      <div className="message-content">{msg.content}</div>
                      {msg.attachment_url && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                          📎 <a href={msg.attachment_url} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>Attached File</a>
                        </div>
                      )}
                      <div className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="chat-input"
                placeholder="Type your message or offer..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                <Send size={18} />
              </button>
            </form>
          </main>
        ) : (
          <div className="empty-chat-state">
            <MessageSquare size={48} style={{ opacity: 0.3 }} />
            <h3>Select a conversation</h3>
            <p>Choose a chat from the sidebar to view messages and negotiate deals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
