import { defineMailAdapter } from './contract.js';
import { connectGoogle, connected, disconnect, requestCapability } from '../auth.js';
import { getProfile, listMessages, getMessage, modifyMessage, sendMessage } from '../gmail.js';

// Gmail is the sole implemented provider in this development alpha.
// Other email services are planned, not silently aliased to this adapter.
export const gmailAdapter = defineMailAdapter({
  id: 'gmail',
  displayName: 'Gmail',
  transport: 'gmail-api',
  capabilities: {
    read: true,
    search: true,
    modify: true,
    send: true,
    attachmentMetadata: true,
    attachmentDownload: false,
    providerDrafts: false,
    scheduleSend: false,
    push: false,
    endToEndEncryption: false
  },
  methods: {
    connect: connectGoogle,
    connected,
    disconnect,
    requestCapability,
    getProfile,
    listMessages,
    getMessage,
    modifyMessage,
    sendMessage
  }
});
