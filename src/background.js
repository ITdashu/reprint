//刷新tab

//初始化历史记录
browser.runtime.onMessage.addListener((data, sender, sendResponse) => {
  console.log('后台进程接到消息', data)
  switch (data.action) {
    case 'reprint':
      browser.tabs.query({currentWindow: true, active: true}).then(tabs => {
        browser.tabs.sendMessage(tabs[0].id, data).then(() => {
          console.log('通知标签页采集文章')
        })
      })
      break;
    case 'notifications':
      browser.notifications.create({
        "type": data.type || 'basic',
        "iconUrl": data.icon || browser.extension.getURL("/icons/logo.svg"),
        "title": data.title || '发布失败',
        "message": data.message || '已记录至失败记录日志，请至插件配置页面查看'
      }).then(() => {
        console.log('消息已弹出')
      });
      break;
  }
})