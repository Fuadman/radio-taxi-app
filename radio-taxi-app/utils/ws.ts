import { Platform } from 'react-native';

const WS_PATH = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000').replace(/^http/, 'ws') + '/ws';

export function connectWebSocket(token: string, onMessage: (msg: any) => void) {
  // Use native WebSocket in RN / Expo and browser WebSocket on web
  const ws = new WebSocket(WS_PATH);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'auth', token }));
  };
  ws.onmessage = (ev) => {
    try {
      const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
      onMessage(data);
    } catch (err) {
      console.warn('ws parse error', err);
    }
  };
  ws.onerror = (e) => console.warn('ws error', e);
  ws.onclose = () => console.log('ws closed');

  return {
    send: (obj: any) => {
      try { ws.send(JSON.stringify(obj)); } catch (err) { console.warn('ws send err', err); }
    },
    close: () => ws.close(),
  };
}
