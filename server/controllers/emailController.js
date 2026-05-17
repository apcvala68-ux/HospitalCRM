import { google } from 'googleapis';
import { getGmailClient } from './authController.js';

const gmail = google.gmail('v1');

const parseEmail = (email) => {
  const headers = email.payload?.headers || [];
  const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const from = getHeader('From');
  const to = getHeader('To');
  const subject = getHeader('Subject');
  const date = getHeader('Date');

  // Extract body
  let body = '';
  let htmlBody = '';

  const extractParts = (parts) => {
    if (!parts) return;
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      if (part.mimeType === 'text/html' && part.body?.data) {
        htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      if (part.parts) extractParts(part.parts);
    }
  };

  if (email.payload?.parts) {
    extractParts(email.payload.parts);
  } else if (email.payload?.body?.data) {
    body = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
  }

  // Extract attachments
  const attachments = [];
  const extractAttachments = (parts) => {
    if (!parts) return;
    for (const part of parts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size,
          attachmentId: part.body.attachmentId,
        });
      }
      if (part.parts) extractAttachments(part.parts);
    }
  };
  if (email.payload?.parts) extractAttachments(email.payload.parts);

  // Parse sender name and email
  const fromMatch = from.match(/^(.*?)\s*<(.+?)>$/) || [null, from, from];
  const senderName = fromMatch[1].replace(/"/g, '').trim() || fromMatch[2];
  const senderEmail = fromMatch[2];

  return {
    id: email.id,
    threadId: email.threadId,
    from: senderName,
    fromEmail: senderEmail,
    to,
    subject: subject || '(No Subject)',
    date: new Date(date).toISOString(),
    snippet: email.snippet || '',
    body: body || htmlBody,
    isHtml: !!htmlBody && !body,
    attachments,
    labelIds: email.labelIds || [],
    internalDate: email.internalDate,
  };
};

export const getEmails = async (req, res, next) => {
  try {
    const { label = 'INBOX', maxResults = 20, pageToken } = req.query;
    const client = await getGmailClient(req.user);
    const gmailClient = google.gmail({ version: 'v1', auth: client });

    const listRes = await gmailClient.users.messages.list({
      userId: 'me',
      labelIds: [label],
      maxResults: parseInt(maxResults),
      pageToken: pageToken || undefined,
    });

    const messages = listRes.data.messages || [];
    const emails = [];

    // Fetch full email data for each message
    for (const msg of messages.slice(0, 10)) {
      const emailRes = await gmailClient.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });
      emails.push(parseEmail(emailRes.data));
    }

    res.json({
      emails,
      nextPageToken: listRes.data.nextPageToken,
      resultSizeEstimate: listRes.data.resultSizeEstimate,
    });
  } catch (error) {
    if (error.message.includes('Google account not connected')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const getEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await getGmailClient(req.user);
    const gmailClient = google.gmail({ version: 'v1', auth: client });

    const emailRes = await gmailClient.users.messages.get({
      userId: 'me',
      id,
      format: 'full',
    });

    res.json({ email: parseEmail(emailRes.data) });
  } catch (error) {
    if (error.message.includes('Google account not connected')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const getAttachment = async (req, res, next) => {
  try {
    const { messageId, attachmentId } = req.params;
    const client = await getGmailClient(req.user);
    const gmailClient = google.gmail({ version: 'v1', auth: client });

    const attachmentRes = await gmailClient.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId,
    });

    const data = attachmentRes.data.data;
    const buffer = Buffer.from(data, 'base64');

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${attachmentId}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const sendEmail = async (req, res, next) => {
  try {
    const { to, subject, body, html, cc, bcc, replyTo } = req.body;
    const client = await getGmailClient(req.user);
    const gmailClient = google.gmail({ version: 'v1', auth: client });

    // Build email
    const headers = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `From: me`,
    ];
    if (cc) headers.push(`Cc: ${cc}`);
    if (bcc) headers.push(`Bcc: ${bcc}`);
    if (replyTo) headers.push(`Reply-To: ${replyTo}`);

    const message = [
      headers.join('\r\n'),
      '',
      html || `Content-Type: text/plain; charset="UTF-8"\r\n\r\n${body}`,
    ].join('\r\n');

    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await gmailClient.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    if (error.message.includes('Google account not connected')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await getGmailClient(req.user);
    const gmailClient = google.gmail({ version: 'v1', auth: client });

    await gmailClient.users.messages.modify({
      userId: 'me',
      id,
      requestBody: { removeLabelIds: ['UNREAD'] },
    });

    res.json({ message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

export const getLabels = async (req, res, next) => {
  try {
    const client = await getGmailClient(req.user);
    const gmailClient = google.gmail({ version: 'v1', auth: client });

    const labelsRes = await gmailClient.users.labels.list({ userId: 'me' });
    res.json({ labels: labelsRes.data.labels || [] });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const client = await getGmailClient(req.user);
    const gmailClient = google.gmail({ version: 'v1', auth: client });

    const profile = await gmailClient.users.getProfile({ userId: 'me' });
    res.json({
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
      threadsTotal: profile.data.threadsTotal,
      historyId: profile.data.historyId,
    });
  } catch (error) {
    if (error.message.includes('Google account not connected')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
