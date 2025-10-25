import { useState, useEffect } from "react";

import "./index.css";

export default function SessionIdSwitcher() {
const [proxy, setProxy] = useState("");
const [sessionNum, setSessionNum] = useState(null);
const [suffix, setSuffix] = useState("");
const [hasSession, setHasSession] = useState(false);
const [message, setMessage] = useState("");

  const sessionRegex = /(sessionid-)(\d+)([^@:]*)/i;

  useEffect(() => {
    parseProxy(proxy);
  }, [proxy]);

  function parseProxy(text) {
    const m = text.match(sessionRegex);
    if (m) {
      setHasSession(true);
      setSessionNum(Number(m[2]));
      setSuffix(m[3] || "");
    } else {
      setHasSession(false);
      setSessionNum(null);
      setSuffix("");
    }
  }

  function updateProxyWithNewNum(newNum) {
    const m = proxy.match(sessionRegex);
    if (!m) return;
    const before = proxy.slice(0, m.index);
    const afterStart = m.index + m[0].length;
    const after = proxy.slice(afterStart);
    const newSegment = `${m[1]}${newNum}${m[3] || ""}`;
    const newProxy = before + newSegment + after;
    setProxy(newProxy);
    setSessionNum(newNum);
    return newProxy;
  }

  function changeBy(delta) {
    if (!hasSession) return;
    const next = (Number(sessionNum) + delta) >>> 0;
    updateProxyWithNewNum(next);
  }

  async function copyProxy() {
    try {
      await navigator.clipboard.writeText(proxy);
      showMessage("Скопировано в буфер обмена");
    } catch (e) {
      showMessage("Ошибка копирования: " + e.message);
    }
  }

  async function copyNum() {
    try {
      navigator.clipboard.writeText(sessionNum);
      showMessage("Скопировано в буфер обмена");
    } catch (e) {
      showMessage("Ошибка копирования: " + e.message);
    }
  }

  function showMessage(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  }

  function onProxyInput(e) {
    const val = e.target.value;
    setProxy(val);
    parseProxy(val);
  }

  function onSessionClick() {
    if (!hasSession) return;
    copyProxy();
  }

  function onNumberClick() {
    if (!hasSession) return;
    copyNum();
  }

  function onSetNumberManually(e) {
    const val = e.target.value.trim();
    if (!/^[0-9]+$/.test(val)) return;
    const n = Number(val);
    updateProxyWithNewNum(n);
  }

  return (
    <div className="app-container">
      <style>{`
        body, html { background-color: #0d1117; color: #e6edf3; font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
        .app-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #161b22; border: 1px solid #30363d; border-radius: 16px; padding: 24px; width: 100%; max-width: 600px; box-shadow: 0 0 20px rgba(0,0,0,0.4); }
        .title { font-size: 1.5rem; font-weight: 600; margin-bottom: 16px; text-align: center; }
        textarea { width: 100%; background: #0d1117; color: #e6edf3; border: 1px solid #30363d; border-radius: 8px; padding: 10px; font-family: monospace; resize: none; min-height: 80px; }
        .session-controls { display: flex; align-items: center; gap: 8px; margin-top: 16px; }
        button { background: #21262d; color: #e6edf3; border: 1px solid #30363d; border-radius: 8px; padding: 6px 12px; cursor: pointer; transition: background 0.2s ease; }
        button:hover { background: #30363d; }
        input.session { background: #0d1117; border: 1px solid #30363d; border-radius: 8px; color: #e6edf3; width: 80px; text-align: center; font-size: 1rem; padding: 6px; font-family: monospace; cursor: pointer; }
        input.session-number { margin-left: 12px;}
        .copy-btn { background: #238636; border: none; color: white; font-weight: 500; margin-left: auto; }
        .copy-btn:hover { background: #2ea043; }
        .error { color: #f85149; margin-top: 8px; }
        .hint { margin-top: 12px; font-size: 0.85rem; color: #8b949e; text-align: center; }
        .message { margin-top: 16px; text-align: center; color: #3fb950; font-size: 0.9rem; }
      `}</style>

      <div className="card">
        <textarea value={proxy} onChange={onProxyInput} />
     
        {hasSession ? (
          <div className="session-controls">
          <label>Прокси строка:</label>
            <button onClick={() => changeBy(-1)}>–</button>
            <input
              type="text"
              className="session"
              value={String(sessionNum)}
              onChange={(e) => setSessionNum(e.target.value)}
              onBlur={onSetNumberManually}
              onKeyDown={(e) => e.key === "Enter" && onSetNumberManually(e)}
              onClick={onSessionClick}
              title="Кликните, чтобы скопировать обновленную прокси"
            />
            <button onClick={() => changeBy(1)}>+</button>
            <label className="session-number">номер:</label>
            <input
              type="text"
              className="session"
              value={String(sessionNum)}
              onClick={onNumberClick}
              title="Кликните, чтобы скопировать обновленную прокси"
            />
          </div>
        ) : (
          <div className="error">sessionid не найден в строке прокси.</div>
        )}

        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
}
