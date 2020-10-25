import Axios from "axios";
import {Readability} from "@mozilla/readability";

class ReprintSend {
  constructor(selectRelease) {
    this.selectRelease = selectRelease
    this.historyKey = 'reprint_history'
    this.releaseKey = 'reprint_release'
  }

  getRelease() {
    console.log('准备获取发布配置')
    return browser.storage.local.get(this.releaseKey).then(data => {
      if (data.hasOwnProperty(this.releaseKey)) {
        data = JSON.parse(data[this.releaseKey])
      } else {
        data = {}
      }
      this.release = data
      return data
    })
  }

  async send() {
    this.getRelease().then(() => {
      let dom = window.document.cloneNode(true)
      let reader = new Readability(dom, {});
      let article = reader.parse();
      console.log('获取到的正文内容', article)
      this.selectRelease.map(item => {
        this.reprint(item, article)
      })
    })
  }

  reprint(id, data) {
    console.log('当前发布配置', this.release)
    let config = this.release[id]
    let postData = {
      salt: config.salt,
      title: data.title,
      content: data.content,
      description: data.excerpt,
      siteName: data.siteName,
      url: window.parent.location.href
    }
    console.log('当前选用配置', config)
    Axios.post(config.url, postData).then(({data}) => {
      if(typeof data === 'object' && data.hasOwnProperty('code') && data.hasOwnProperty('msg')){
        let {code, msg} = data
        // var title = browser.i18n.getMessage("notificationTitle");
        // var content = browser.i18n.getMessage("notificationContent", message.url);
        if (code === 200) {
          browser.runtime.sendMessage({
            action: 'reprintSuccess',
            id: id,
            url: config.url
          }).then(() => {})
          browser.runtime.sendMessage({
            id: id,
            action: 'notifications',
            type: "basic",
            icon: browser.extension.getURL("icons/link-48.png"),
            title: '转载成功',
            message: msg
          }).then(() => {
            console.log('转载成功')
          });
        } else {
          this.error(id,postData, code, msg,config)
        }
      }else {
        console.log('接口不符合规范')
        this.error(id,postData, 5000, '发布接口异常',config)
      }
    }).catch(() => {
      console.log('发布失败')
      this.error(id,postData, 4000, '网络或发布接口配置错误',config)
    })
  }

  error(id,postData, code, msg,config) {
    browser.storage.local.get(this.historyKey).then(data => {
      browser.runtime.sendMessage({
        action: 'reprintError',
        id: id,
        configName:config.name,
        url: postData.url
      }).then(() => {})

      if (data.hasOwnProperty(this.historyKey)) {
        data = JSON.parse(data[this.historyKey])
      } else {
        data = []
      }
      console.log('走到此处')

      if(data.length > 20){
        data.pop()
      }
      data.splice(0,0,{
        code, msg,
        url:postData.url,
        title: postData.title,
        configName:config.name,
        time: (new Date()).toLocaleString()
      })
      let output = {}
      output[this.historyKey] = JSON.stringify(data)
      console.log('即将要保存的数据',output)
      browser.storage.local.set(output).then(() => {
        browser.runtime.sendMessage({
          action: 'notifications',
          type: "basic",
          icon: browser.extension.getURL("/icons/logo.svg"),
          title: '发布失败',
          message: '已记录至'+config.name+'失败，已记录日志，请至插件配置页面查看'
        }).then(() =>{})
      })
    })
  }
}

browser.runtime.onMessage.addListener((data, sender, sendResponse) => {
  console.log('接受到的数据', data)
  switch (data.action) {
    case 'reprint':
      let reprint = new ReprintSend(data.params)
      reprint.send()
      break;
  }
})
console.log('已在该页面加载Reprint脚本')