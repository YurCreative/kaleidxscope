// 只在客户端执行的代码
import { watch } from 'vue'

// 添加样式到页面
function addCopyTableStyles() {
  if (document.querySelector('#copy-table-styles')) return
  
  const style = document.createElement('style')
  style.id = 'copy-table-styles'
  style.textContent = `
    /* 可复制的表格样式 */
    .vp-doc table.copyable-markdown-table {
      margin: 1em 0;
      border-collapse: collapse;
      width: 100%;
    }

    /* 表格单元格样式 */
    .vp-doc table.copyable-markdown-table td.copyable-cell {
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
      padding: 10px 16px !important;
      border: 1px solid var(--vp-c-border);
    }

    /* 悬停效果 */
    .vp-doc table.copyable-markdown-table td.copyable-cell:hover {
      background-color: var(--vp-c-brand-light) !important;
      color: var(--vp-c-brand-dark) !important;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    /* 点击反馈效果 */
    .vp-doc table.copyable-markdown-table td.copyable-cell.copied {
      background-color: var(--vp-c-brand) !important;
      color: white !important;
      animation: copyFlash 0.5s ease;
    }

    @keyframes copyFlash {
      0% { background-color: inherit; }
      50% { background-color: var(--vp-c-brand); color: white; }
      100% { background-color: var(--vp-c-brand-light); }
    }

    /* 添加复制指示器 */
    .vp-doc table.copyable-markdown-table td.copyable-cell::after {
      content: '📋';
      opacity: 0;
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }

    .vp-doc table.copyable-markdown-table td.copyable-cell:hover::after {
      opacity: 0.5;
    }

    /* 提示弹窗样式 */
    .copy-toast {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: var(--vp-c-bg);
      border: 1px solid var(--vp-c-border);
      border-radius: 12px;
      padding: 16px;
      min-width: 280px;
      max-width: 400px;
      z-index: 1000;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .copy-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    .copy-toast.success {
      border-left: 4px solid var(--vp-c-green);
    }

    .copy-toast.error {
      border-left: 4px solid var(--vp-c-red);
    }

    .toast-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
      color: var(--vp-c-text-1);
    }

    .toast-text {
      font-size: 12px;
      color: var(--vp-c-text-2);
      word-break: break-all;
      overflow-wrap: break-word;
      max-height: 60px;
      overflow-y: auto;
      padding-right: 4px;
    }

    /* 暗色模式适配 */
    .dark .copy-toast {
      background: var(--vp-c-bg-alt);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }

    /* 响应式设计 */
    @media (max-width: 640px) {
      .copy-toast {
        width: 90%;
        min-width: auto;
        max-width: none;
        left: 50%;
        right: auto;
        transform: translateX(-50%) translateY(100px);
      }
      
      .vp-doc table.copyable-markdown-table td.copyable-cell {
        padding: 8px 12px !important;
      }
    }
  `
  
  document.head.appendChild(style)
}

export function setupCopyTable(router) {
  // 确保在浏览器环境中运行
  if (typeof window === 'undefined') return
  
  // 添加样式
  addCopyTableStyles()
  
  // 初始化和路由变更时都执行
  const init = () => {
    setTimeout(initMarkdownTables, 100)
  }
  
  // 监听路由变化
  watch(() => router.route, init, { immediate: true })
  
  // 监听 DOM 变化（处理动态加载的内容）
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        setTimeout(initMarkdownTables, 50)
      }
    })
  })
  
  // 开始观察文档变化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

function initMarkdownTables() {
  const tables = document.querySelectorAll('.vp-doc table')
  
  tables.forEach((table) => {
    if (table.dataset.copyEnabled === 'true') return
    table.dataset.copyEnabled = 'true'
    table.classList.add('copyable-markdown-table')
    
    // 处理表头
    table.querySelectorAll('thead th, thead td').forEach(cell => {
      cell.style.cursor = 'default'
      cell.title = '表头'
    })
    
    // 处理内容单元格
    table.querySelectorAll('tbody td').forEach(cell => {
      enhanceCell(cell)
    })
  })
}

function enhanceCell(cell) {
  cell.classList.add('copyable-cell')
  const originalTitle = cell.title || ''
  cell.title = '点击复制内容\n' + originalTitle
  cell.addEventListener('click', handleCellClick)
}

async function handleCellClick(event) {
  const cell = event.currentTarget
  const text = getCellText(cell)
  
  try {
    await copyToClipboard(text)
    showCopyToast(text)
    
    // 视觉反馈
    cell.classList.add('copied')
    setTimeout(() => cell.classList.remove('copied'), 500)
  } catch (err) {
    console.error('复制失败:', err)
    showCopyToast('复制失败，请手动选择文本复制', false)
  }
}

function getCellText(cell) {
  const codeElement = cell.querySelector('code')
  if (codeElement) {
    return codeElement.textContent || cell.textContent
  }
  return cell.textContent.replace(/\s+/g, ' ').trim()
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return true
  }
  
  // 降级方案
  return new Promise((resolve) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    
    try {
      const success = document.execCommand('copy')
      resolve(success)
    } catch (err) {
      resolve(false)
    } finally {
      document.body.removeChild(textArea)
    }
  })
}

function showCopyToast(content, success = true) {
  // 移除旧的提示
  const oldToast = document.querySelector('.copy-toast')
  if (oldToast) oldToast.remove()
  
  // 创建提示元素
  const toast = document.createElement('div')
  toast.className = `copy-toast ${success ? 'success' : 'error'}`
  
  // 限制显示内容长度
  const displayText = content.length > 50 ? content.substring(0, 50) + '...' : content
  
  toast.innerHTML = `
    <div class="toast-icon">${success ? '✅' : '❌'}</div>
    <div class="toast-content">
      <div class="toast-title">${success ? '已复制到剪贴板' : '复制失败'}</div>
      <div class="toast-text">${displayText}</div>
    </div>
  `
  
  document.body.appendChild(toast)
  
  // 显示动画
  setTimeout(() => toast.classList.add('show'), 10)
  
  // 自动消失
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, success ? 2000 : 3000)
}