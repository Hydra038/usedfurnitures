'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Mail, MailOpen, Check, Archive, Clock, Trash2, Eye, X } from 'lucide-react';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: ContactMessage['status']) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      fetchMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const saveAdminNotes = async (id: number) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ admin_notes: adminNotes })
        .eq('id', id);

      if (error) throw error;
      fetchMessages();
      if (selectedMessage) {
        setSelectedMessage({ ...selectedMessage, admin_notes: adminNotes });
      }
      alert('Notes saved successfully!');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      unread: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      replied: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || styles.read;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <Mail className="w-4 h-4" />;
      case 'read': return <MailOpen className="w-4 h-4" />;
      case 'replied': return <Check className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Messages</h1>
        <p className="text-gray-600">
          {unreadCount > 0 && (
            <span className="text-primary-600 font-semibold">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </span>
          )}
          {unreadCount === 0 && 'No unread messages'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'unread', 'read', 'replied', 'archived'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-2 text-sm">
                ({messages.filter(m => m.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No messages found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No contact messages yet.' 
              : `No ${filter} messages.`
            }
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedMessage?.id === msg.id ? 'ring-2 ring-primary-600' : ''
                }`}
                onClick={() => {
                  setSelectedMessage(msg);
                  setAdminNotes(msg.admin_notes || '');
                  if (msg.status === 'unread') {
                    updateStatus(msg.id, 'read');
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{msg.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(msg.status)}`}>
                        {getStatusIcon(msg.status)}
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{msg.email}</p>
                  </div>
                </div>
                <p className="text-gray-700 line-clamp-2 mb-2">{msg.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(msg.created_at).toLocaleDateString()} at{' '}
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          {/* Message Detail */}
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow-md p-6 lg:sticky lg:top-4 h-fit">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold">Message Details</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-semibold text-gray-600">From</label>
                  <p className="text-lg font-semibold">{selectedMessage.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Email</label>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-primary-600 hover:underline block"
                  >
                    {selectedMessage.email}
                  </a>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Message</label>
                  <p className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {selectedMessage.message}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Received</label>
                  <p className="text-gray-700">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Update Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'read')}
                    className="btn-secondary text-sm py-2"
                  >
                    <MailOpen className="w-4 h-4 inline mr-1" />
                    Mark Read
                  </button>
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'replied')}
                    className="btn-secondary text-sm py-2"
                  >
                    <Check className="w-4 h-4 inline mr-1" />
                    Mark Replied
                  </button>
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'archived')}
                    className="btn-secondary text-sm py-2"
                  >
                    <Archive className="w-4 h-4 inline mr-1" />
                    Archive
                  </button>
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'unread')}
                    className="btn-secondary text-sm py-2"
                  >
                    <Mail className="w-4 h-4 inline mr-1" />
                    Mark Unread
                  </button>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Add private notes about this message..."
                />
                <button
                  onClick={() => saveAdminNotes(selectedMessage.id)}
                  className="btn-primary w-full mt-2"
                >
                  Save Notes
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteMessage(selectedMessage.id)}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Message
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex bg-white rounded-lg shadow-md p-12 items-center justify-center">
              <div className="text-center">
                <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
