//刷新tab
browser.tabs.query({}).then(tabs => {
  tabs.forEach(tab => {
    console.log(tab)
    browser.pageAction.show(tab.id).then(() => {
    })
  })
})

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading") {
    browser.pageAction.show(Number(tabId)).then(() => {
    })
  }
})

//初始化历史记录
browser.runtime.onMessage.addListener((data, sender, sendResponse) => {
  console.log('后台进程接到消息', data)
  switch (data.action) {
    case 'reprint':
      console.log('这里是正常的')
      browser.tabs.query({currentWindow: true, active: true}).then(tabs => {
        console.log('当前活动标签页',tabs)
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