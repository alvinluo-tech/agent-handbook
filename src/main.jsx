import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './figfix.css'
import App from './App.jsx'

// 给翻开控制台的玩家一个小彩蛋
console.log(
  '%c AGENT 开发全指南 %c FROM ZERO TO AGENT MASTER %c\n' +
  '▶ 你已经会用 DevTools 了——这是 Agent 工程师的好起点。\n' +
  '▶ 按 F12 的手,也写得出 Agent Loop。去 CH.03 试试。',
  'background:#e4572e;color:#fff;padding:4px 8px;font-weight:bold',
  'background:#33291f;color:#f2b705;padding:4px 8px',
  '',
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

