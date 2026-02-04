import DefaultTheme from 'vitepress/theme'
import { setupCopyTable } from './client'

export default {
  extends: DefaultTheme,
  
  enhanceApp({ app, router }) {
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      setupCopyTable(router)
    }
  }
}