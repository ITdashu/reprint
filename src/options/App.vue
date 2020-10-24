<template>
  <main>
    <aside>
      <ul class="nav">
        <li :class="['item',currentTab === item.id ? 'active' : '']"
            v-for="(item,index) in tabs"
            @click="currentTab = item.id"
            :key="index">
          <img alt="release"
               :src="currentTab === item.id ? item.activeIcon : item.icon"/>
          {{ item.name }}
        </li>
      </ul>
      <div class="footer">
        <img alt="help"
             src="/icons/help.png">
        <a href="#">
          技术文档
        </a>
      </div>
    </aside>
    <div class="content flex-width-auto">
      <div v-show="currentTab === 'config'">
        <h2>设置</h2>
        <p>
          Reprint可以自动提取网页正文，并发布到您允许的任何地方。<br />
          除了此处的设置，您还应该配置好服务端的发布接口，参看：<a href="#">常用软件发布插件</a>或<a href="#">自定义发布接口对接文档</a>
        </p>
        <div class="card">
          <div class="flex">
            <div class="left">
              <img alt="sync" src="/icons/sync.png" />
              <h3>
                <b>同步：</b>
                <span>已启用</span>
              </h3>
            </div>
            <div>
              <button>启用同步</button>
            </div>
          </div>
          <p>
            请注意：您需要在所有设备上（包括此设备）的Chrome浏览器中登录，这样同步的选项才能正常使用。<br />
            可以在其他设备上查看此页面，来检查同步是否生效。
          </p>
        </div>
      </div>
      <div v-show="currentTab === 'release'">
        <div class="header">
          <img src="/icons/logo.svg">
          <b>Release</b><span>（转载网页到任何地方）</span>
        </div>
        <div class="release-list-layout">
          <h2>配置</h2>
          <div class="release-list">
            <div class="item card"
                 v-for="index in Object.keys(releaseConfig)"
                 :key="index">
              <div class="name flex">
                <label class="flex-width-auto">
                  <input class="ghost"
                         type="text"
                         v-model="releaseConfig[index].name"
                         placeholder="请输入名称">
                </label>
                <button @click="saveRelease(index)">测试后保存</button>
              </div>
              <section>
                <div class="input-item flex">
                  <span>默认发布</span>
                  <label class="flex-width-auto">
                    <input type="checkbox"
                           v-model="releaseConfig[index].default"
                           class="ghost check">
                  </label>
                </div>
                <div class="input-item flex">
                  <span>发布地址</span>
                  <label class="flex-width-auto">
                    <input class="ghost"
                           type="text"
                           v-model="releaseConfig[index].url"
                           placeholder="请输入发布地址，如：https://itdashu.com..">
                  </label>
                </div>
                <div class="input-item flex">
                  <span>AUTH 认证字符串</span>
                  <label class="flex-width-auto">
                    <input class="ghost"
                           type="text"
                           v-model="releaseConfig[index].salt"
                           placeholder="请输入认证字符串">
                  </label>
                </div>
                <div class="input-item flex">
                  <span>额外参数</span>
                  <label class="flex-width-auto">
                <textarea class="ghost"
                          v-model="releaseConfig[index].params"
                          placeholder="请输入json字符串"></textarea>
                  </label>
                </div>
                <div class="msg input-item"
                     v-if="!releaseData.hasOwnProperty(index)">
                  为了防止被滥用，新增配置必须点击校验，通过测试后保存。发布接口校验说明
                </div>
                <div class="input-item footer-action"
                     v-else>
                  <button class="small"
                          @click="releaseDelete(index)">删除
                  </button>
                </div>
              </section>
            </div>
          </div>
          <div class="add-btn-box">
            <button id="add"
                    @click="releaseAdd">添加发布配置
            </button>
          </div>
        </div>
      </div>
      <div v-show="currentTab === 'history'">

        <h2>历史</h2>
        <p>
          使用中发布失败的记录会出现在此处。<br />
          此处的记录只保留20条，且当您点击下发列表点击条目则该条目会在列表删除。
        </p>
        <div class="card history-card">
          <div class="flex">
            <div class="left">
              <h3>可以在其他设备上查看此页面，来检查同步是否生效</h3>
            </div>
            <div class="right">
              <button>访问该页面</button>
            </div>
          </div>
          <p class="card-content">
            <span>https://baidu.com/sdfsdkw/sdi?sdf</span><br />
            <span>2020/10/12 21:19:05</span>
            发布至<b>OSCE官网</b>时失败
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script>

  export default {
    name: 'App',
    data() {
      return {
        releaseKey: 'reprint_release',
        currentTab: 'config',
        tabs: [
          {
            icon: '/icons/config.png',
            activeIcon: '/icons/config-active.png',
            name: '配置',
            id: 'config'
          },
          {
            icon: '/icons/release.png',
            activeIcon: '/icons/release-active.png',
            name: '发布接口',
            id: 'release'
          },
          {
            icon: '/icons/history.png',
            activeIcon: '/icons/history-active.png',
            name: '错误历史',
            id: 'history'
          }
        ],
        releaseConfig: {},
        releaseData: {}
      }
    },
    mounted() {
      this.getRelease()
    },
    methods: {
      randomString(len=32) {
        len = len || 32;
        let chars = 'ABCDEFGHJKMNPQRSTWXYZOLVU1234567890';
        /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        let maxPos = chars.length;
        let output = '';
        for (let i = 0; i < len; i++) {
          output += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        if(this.releaseConfig.hasOwnProperty(output)){
          return this.randomString(len)
        }
        return output;
      },
      releaseDelete(index) {
        console.log('开始删除')
        this.$delete(this.releaseConfig,index)
        if(this.releaseData.hasOwnProperty(index)){
          this.$delete(this.releaseData,index)
        }
        this.saveConfig(this.releaseKey, this.releaseData)
      },
      saveRelease(index) {
        console.log('触发保存')
        let release = JSON.parse(JSON.stringify(this.releaseConfig))
        console.log(release)
        this.$set(this.releaseData,index,release[index])
        this.saveConfig(this.releaseKey,this.releaseData)
      },
      saveConfig(key, data) {
        let options = {}
        options[key] = JSON.stringify(data)
        console.log('保存前',options)
        browser.storage.local.set(options).then(res => {
          console.log('保存成功')
        })
      },
      releaseAdd() {
        let id = this.randomString()
        this.$set(this.releaseConfig,id,{
          name: '',
          url: '',
          default: false,
          salt: '',
          params: ''
        })
        console.log('新增后',this.releaseConfig)
      },
      getRelease() {
        browser.storage.local.get(this.releaseKey).then(data => {
          if(data.hasOwnProperty(this.releaseKey)){
            data = JSON.parse(data[this.releaseKey])
          }else{
            data = {}
          }
          this.releaseConfig = JSON.parse(JSON.stringify(data))
          this.releaseData = data
        })
      }
    }
  }
</script>

<style lang="scss">
  @import "options";
</style>
