import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "舞萌DX KALEIDXSCOPE 开门指引",
  description: "舞萌DX KALEIDXSCOPE 开门指引",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      { icon: 'xiaohongshu', link: 'https://www.xiaohongshu.com/user/profile/64884625000000001c029c68' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/38424082' },
    ],
    lang: 'zh-CN',
	darkModeSwitchLabel: '浅色 / 深色',
	lightModeSwitchTitle: '切换到浅色模式',
	darkModeSwitchTitle: '切换到深色模式',
	sidebarMenuLabel: '菜单',
	returnToTopLabel: '返回到顶部'
  }
})
