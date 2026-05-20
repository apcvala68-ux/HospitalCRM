import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmails, useEmail, useEmailProfile, useLabels, useSendEmail, useMarkAsRead } from '../../hooks/useEmail';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Inbox, Send, Star, Archive, Trash2, RefreshCw, Search,
  Mail, Paperclip, Reply, Forward, Edit3, X, Loader2,
  ChevronLeft, AlertCircle, ExternalLink,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const LABELS = [
  { id: 'INBOX', label: 'Inbox', icon: Inbox },
  { id: 'SENT', label: 'Sent', icon: Send },
  { id: 'DRAFT', label: 'Drafts', icon: Edit3 },
  { id: 'STARRED', label: 'Starred', icon: Star },
  { id: 'IMPORTANT', label: 'Important', icon: AlertCircle },
];

function ComposeModal({ onClose, onSent, replyTo }) {
  const sendEmail = useSendEmail();
  const [to, setTo] = useState(replyTo?.fromEmail || '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [cc, setCc] = useState('');

  const handleSend = async () => {
    if (!to.trim()) return;
    await sendEmail.mutateAsync({
      to,
      subject: subject || '(No Subject)',
      body,
      cc: cc || undefined,
    });
    onSent();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 bg-black/50" onClick={onClose}>
      <div className="w-full max-w-2xl bg-card rounded-t-xl shadow-2xl border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50 rounded-t-xl">
          <span className="text-sm font-medium">{replyTo ? 'Reply' : 'New Message'}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <span className="text-sm text-muted-foreground w-12">To</span>
            <Input value={to} onChange={e => setTo(e.target.value)} className="border-0 focus-visible:ring-0 px-0 h-8" placeholder="recipient@email.com" />
          </div>
          <div className="flex items-center gap-2 border-b pb-2">
            <span className="text-sm text-muted-foreground w-12">Cc</span>
            <Input value={cc} onChange={e => setCc(e.target.value)} className="border-0 focus-visible:ring-0 px-0 h-8" placeholder="cc@email.com" />
          </div>
          <div className="flex items-center gap-2 border-b pb-2">
            <span className="text-sm text-muted-foreground w-12">Subject</span>
            <Input value={subject} onChange={e => setSubject(e.target.value)} className="border-0 focus-visible:ring-0 px-0 h-8" placeholder="Subject" />
          </div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your message..."
            className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground"><Paperclip className="h-4 w-4" /></Button>
            </div>
            <Button onClick={handleSend} disabled={sendEmail.isPending || !to.trim()}>
              {sendEmail.isPending ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <Send className="h-4 w-4 sm:mr-2" />}
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [selectedLabel, setSelectedLabel] = useState('INBOX');
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const { data: profileData, isLoading: profileLoading, error: profileError } = useEmailProfile();
  const { data: emailsData, isLoading: emailsLoading, error: emailsError, refetch: refetchEmails } = useEmails(selectedLabel);
  const { data: emailData, isLoading: emailLoading } = useEmail(selectedEmailId);
  const { data: labelsData } = useLabels();
  const markAsRead = useMarkAsRead();

  const profile = profileData;
  const emails = emailsData?.emails || [];
  const selectedEmail = emailData?.email;

  // Auto-mark as read when opening email
  useEffect(() => {
    if (selectedEmailId && selectedEmail?.labelIds?.includes('UNREAD')) {
      markAsRead.mutate(selectedEmailId);
    }
  }, [selectedEmailId]);

  const handleSelectEmail = (id) => {
    setSelectedEmailId(id);
  };

  const handleReply = (email) => {
    setReplyTo(email);
    setShowCompose(true);
  };

  const handleForward = (email) => {
    setReplyTo({ ...email, subject: `Fwd: ${email.subject}` });
    setShowCompose(true);
  };

  const handleComposeSent = () => {
    refetchEmails();
    setSelectedEmailId(null);
  };

  useEffect(() => {
    if (emailsError) toast.error(emailsError.message || 'Failed to load emails');
  }, [emailsError]);

  // Check if Google is connected
  if (profileError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Mail className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Google Account Not Connected</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Sign in with Google to access your Gmail inbox directly from the hospital CRM.
        </p>
        <Button onClick={() => navigate('/login')}>Sign In with Google</Button>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4">
      {/* Left Sidebar - Labels */}
      <div className="w-56 border-r bg-card flex flex-col">
        <div className="p-4">
          <Button onClick={() => { setReplyTo(null); setShowCompose(true); }} className="w-full">
            <Edit3 className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Compose</span>
          </Button>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {LABELS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setSelectedLabel(id); setSelectedEmailId(null); }}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                selectedLabel === id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
        {/* Custom Labels */}
        {labelsData?.labels?.filter(l => l.type === 'user').length > 0 && (
          <div className="px-2 pb-4">
            <p className="text-xs text-muted-foreground px-3 mb-2">Labels</p>
            {labelsData.labels.filter(l => l.type === 'user').map(l => (
              <button
                key={l.id}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
              >
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color?.textColor || '#888' }} />
                {l.name}
              </button>
            ))}
          </div>
        )}
        {/* Profile */}
        {profile && (
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            <p className="text-xs text-muted-foreground">{profile.messagesTotal} messages</p>
          </div>
        )}
      </div>

      {/* Email List */}
      <div className={`${selectedEmailId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r bg-card`}>
        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {emailsError ? (
            <div className="flex justify-center py-8"><p className="text-destructive font-medium">Failed to load emails</p></div>
          ) : emailsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Inbox className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No emails in {selectedLabel.toLowerCase()}</p>
            </div>
          ) : (
            <div>
              {emails
                .filter(e => !searchQuery || e.subject.toLowerCase().includes(searchQuery.toLowerCase()) || e.from.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(email => (
                  <button
                    key={email.id}
                    onClick={() => handleSelectEmail(email.id)}
                    className={`w-full text-left border-b p-3 hover:bg-muted/50 transition-colors ${
                      selectedEmailId === email.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    } ${email.labelIds?.includes('UNREAD') ? 'bg-muted/30' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm truncate ${email.labelIds?.includes('UNREAD') ? 'font-bold' : 'font-medium'}`}>
                            {email.from}
                          </span>
                          {email.labelIds?.includes('UNREAD') && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-sm truncate text-muted-foreground">{email.subject}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{email.snippet}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
                      </span>
                    </div>
                    {email.attachments?.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{email.attachments.length}</span>
                      </div>
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Reading Pane */}
      <div className={`${selectedEmailId ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-background`}>
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="border-b p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedEmailId(null)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold flex-1 ml-2 md:ml-0">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Star className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Archive className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {selectedEmail.from?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedEmail.from}</p>
                    <p className="text-xs text-muted-foreground">{selectedEmail.fromEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      to {selectedEmail.to} · {format(new Date(selectedEmail.date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => handleReply(selectedEmail)}>
                  <Reply className="h-3.5 w-3.5 sm:mr-1.5" /><span className="hidden sm:inline"> Reply</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleForward(selectedEmail)}>
                  <Forward className="h-3.5 w-3.5 sm:mr-1.5" /><span className="hidden sm:inline"> Forward</span>
                </Button>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedEmail.isHtml ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm font-sans">{selectedEmail.body}</pre>
              )}

              {/* Attachments */}
              {selectedEmail.attachments?.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    {selectedEmail.attachments.length} Attachment{selectedEmail.attachments.length > 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmail.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[150px]">{att.filename}</span>
                        <span className="text-xs text-muted-foreground">
                          {att.size ? `${(att.size / 1024).toFixed(1)} KB` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
            <Mail className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Select an email to read</p>
            <p className="text-sm">Choose from the list on the left</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal
          onClose={() => { setShowCompose(false); setReplyTo(null); }}
          onSent={handleComposeSent}
          replyTo={replyTo}
        />
      )}
    </div>
  );
}
