import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import './Messages.css';

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { profile, user } = useAuthStore();
  const location = useLocation();
  const currentUserId = profile?.id || user?.id;

  // Fetch initial chat list
  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUserId) return;

      // In the new schema, chat_rooms are linked via inquiries
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id, 
          deals (
            id,
            status,
            buyer_id,
            seller_id,
            equipment_listings (title)
          )
        `)
        .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`, { foreignTable: 'deals' });

      if (error) {
        console.error('Error fetching chats:', error);
        return;
      }

      if (data) {
        console.log('Fetched chats:', data);
        // Flatten the structure for easier use in the component
        const flattenedChats = data.map(room => ({
          id: room.id,
          status: room.deals?.status,
          buyer_id: room.deals?.buyer_id,
          seller_id: room.deals?.seller_id,
          equipment_listings: room.deals?.equipment_listings
        }));
        
        setChats(flattenedChats);
        
        // Handle direct navigation via chatId query param
        const params = new URLSearchParams(location.search);
        const targetChatId = params.get('chatId');
        if (targetChatId) {
          const target = flattenedChats.find(c => c.id === targetChatId);
          if (target) setActiveChat(target);
        }
      }
    };
    fetchChats();
  }, [currentUserId, location.search]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', activeChat.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        scrollToBottom();
      }
    };

    fetchMessages();

    // Set up real-time subscription for new messages in this chat
    const channel = supabase
      .channel(`chat_${activeChat.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${activeChat.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const messageText = newMessage;
    setNewMessage(''); // optimistic clear

    const { error } = await supabase.from('messages').insert([
      {
        room_id: activeChat.id,
        sender_id: currentUserId,
        content: messageText,
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    }
  };

  return (
    <div className="messages-container">
      <div className="chat-layout">
        
        {/* Left Sidebar: Chat List */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>Messages & Deals</h2>
          </div>
          <div className="chat-list">
            {chats.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active conversations
              </div>
            ) : (
              chats.map((chat) => {
                const otherPartyId = chat.buyer_id === currentUserId ? chat.seller_id : chat.buyer_id;
                // In a real app, we would fetch the other party's name. For now, use placeholder.
                const otherPartyName = "User " + (otherPartyId ? otherPartyId.substring(0, 5) : 'Unknown');

                return (
                  <div 
                    key={chat.id} 
                    className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                    onClick={() => setActiveChat(chat)}
                  >
                    <div className="chat-avatar">{otherPartyName[0]}</div>
                    <div className="chat-preview">
                      <div className="chat-name">{otherPartyName}</div>
                      <div className="chat-listing-title">📦 {chat.equipment_listings?.title || 'Unknown Listing'}</div>
                      <div className="chat-last-message">Status: {chat.status}</div>
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
                <h3>Negotiation for {activeChat.equipment_listings?.title}</h3>
                <p>Status: {activeChat.status}</p>
              </div>
              <div className="chat-actions">
                <button className="chat-btn secondary">Attach Quotation</button>
                <button className="chat-btn primary">Make Offer</button>
              </div>
            </header>

            <div className="messages-area">
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
                  Start the negotiation by sending a message!
                </div>
              ) : (
                messages.map((msg) => {
                  const isSentByMe = msg.sender_id === currentUserId;
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
                placeholder="Type your message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                ➤
              </button>
            </form>
          </main>
        ) : (
          <div className="empty-chat-state">
            <span>💬</span>
            <h3>Select a conversation</h3>
            <p>Choose a chat from the sidebar to view messages and negotiate deals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
