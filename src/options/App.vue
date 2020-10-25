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
          {{ lang('extDocument') }}
        </a>
      </div>
    </aside>
    <div class="content flex-width-auto">
      <div v-show="currentTab === 'config'">
        <h2>{{ lang('config') }}</h2>
        <p v-html="lang('configDescription')">
        </p>
        <div class="card">
          <div class="flex">
            <div class="left">
              <img alt="sync"
                   src="/icons/sync.png"/>
              <h3>
                <b>{{ lang('sync') }}</b>
                <span>{{ lang('enable') }}</span>
              </h3>
            </div>
            <div>
              <button>{{ lang('alreadySync') }}</button>
            </div>
          </div>
          <p v-html="lang('syncDescription')">
          </p>
        </div>
      </div>
      <div v-show="currentTab === 'release'">
        <div class="header">
          <img src="/icons/logo.svg">
          <b>{{ lang('extName') }}</b><span>{{ lang('extDescription') }}</span>
        </div>
        <div class="release-list-layout">
          <h2>{{ lang('releaseConfig') }}</h2>
          <p v-html="lang('releaseDescription')">
          </p>
          <div class="release-list">
            <div class="item card"
                 v-for="index in Object.keys(releaseConfig)"
                 :key="index">
              <div class="name flex">
                <label class="flex-width-auto">
                  <input class="ghost"
                         type="text"
                         v-model="releaseConfig[index].name"
                         :placeholder="lang('inputName')">
                </label>
                <button @click="saveRelease(index)"
                        :disabled="saveRun.hasOwnProperty(index)">
                  <template v-if="saveRun.hasOwnProperty(index)">
                    {{ lang('inputRun') }}
                  </template>
                  <template v-else>
                    {{ successSave.indexOf(index) > -1 ? lang('alreadySave') : lang('TestAndSave') }}
                  </template>
                </button>
              </div>
              <section>
                <div class="input-item flex">
                  <span>{{ lang('defaultRelease') }}</span>
                  <label class="flex-width-auto">
                    <input type="checkbox"
                           v-model="releaseConfig[index].default"
                           class="ghost check">
                  </label>
                </div>
                <div class="input-item flex">
                  <span>{{ lang('releaseUrl') }}</span>
                  <label class="flex-width-auto">
                    <input class="ghost"
                           type="text"
                           v-model="releaseConfig[index].url"
                           :placeholder="lang('releasePlaceholder')">
                  </label>
                </div>
                <div class="input-item flex">
                  <span>{{ lang('releaseAuth') }}</span>
                  <label class="flex-width-auto">
                    <input class="ghost"
                           type="text"
                           v-model="releaseConfig[index].salt"
                           :placeholder="lang('releaseAuthPlaceholder')">
                  </label>
                </div>
                <div class="input-item flex">
                  <span>{{ lang('otherParams') }}</span>
                  <label class="flex-width-auto">
                <textarea class="ghost"
                          v-model="releaseConfig[index].params"
                          :placeholder="lang('otherParamsPlaceholder')"></textarea>
                  </label>
                </div>
                <div class="msg input-item flex">
                  <div class="flex-width-auto error-msg">
                    <template v-if="errorSave.hasOwnProperty(index)">
                      {{ errorSave[index] }}
                    </template>
                    <template v-else-if="!releaseData.hasOwnProperty(index)">
                      {{ lang('releaseTip') }}
                    </template>
                  </div>
                  <button class="small"
                          @click="releaseDelete(index)">
                    {{ lang('delete') }}
                  </button>
                </div>
              </section>
            </div>
          </div>
          <div class="add-btn-box">
            <button id="add"
                    @click="releaseAdd">{{ lang('releaseAdd') }}
            </button>
          </div>
        </div>
      </div>
      <div v-show="currentTab === 'history'">

        <h2>{{ lang('history') }}</h2>
        <p v-html="lang('historyDescription')">
        </p>
        <div class="card history-card"
             v-for="(item,index) in historyData"
             :key="index">
          <div class="flex">
            <div class="left">
              <h3>{{ item.title }}</h3>
            </div>
            <div class="right">
              <button>{{ lang('browserPage') }}</button>
            </div>
          </div>
          <p class="card-content">
            <span>{{ item.url }}</span><br/>
            <span>{{ item.time }}</span>
            {{ lang('releaseTo') }}<b>{{ item.configName }}</b>{{ lang('releaseToError') }}
            <br/>
            <span>{{ item.msg }}</span>
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import Axios from 'axios'
import common from "@/common";

export default {
  name: 'App',
  mixins: [common],
  data() {
    return {
      releaseKey: 'reprint_release',
      currentTab: 'config',
      successSave: [],
      saveRun: {},
      errorSave: {},
      historyKey: 'reprint_history',
      historyData: [],
      tabs: [
        {
          icon: '/icons/config.png',
          activeIcon: '/icons/config-active.png',
          name: this.lang('config'),
          id: 'config'
        },
        {
          icon: '/icons/release.png',
          activeIcon: '/icons/release-active.png',
          name: this.lang('releaseConfig'),
          id: 'release'
        },
        {
          icon: '/icons/history.png',
          activeIcon: '/icons/history-active.png',
          name: this.lang('history'),
          id: 'history'
        }
      ],
      releaseConfig: {},
      releaseData: {}
    }
  },
  mounted() {
    this.getRelease()
    this.getHistory()
  },
  methods: {
    randomString(len = 32) {
      len = len || 32;
      let chars = 'ABCDEFGHJKMNPQRSTWXYZOLVU1234567890';
      /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
      let maxPos = chars.length;
      let output = '';
      for (let i = 0; i < len; i++) {
        output += chars.charAt(Math.floor(Math.random() * maxPos));
      }
      if (this.releaseConfig.hasOwnProperty(output)) {
        return this.randomString(len)
      }
      return output;
    },
    releaseDelete(index) {
      console.log('开始删除')
      this.$delete(this.releaseConfig, index)
      if (this.releaseData.hasOwnProperty(index)) {
        this.$delete(this.releaseData, index)
      }
      this.saveConfig(this.releaseKey, this.releaseData)
    },
    saveRelease(index) {
      console.log('触发保存')
      this.$set(this.saveRun, index, true)

      Axios.post(this.releaseConfig[index].url, {
        salt: this.releaseConfig[index].salt,
        title: 'Reprint test',
        content: 'Reprint the article anywhere',
        description: 'Reprint the article anywhere',
        siteName: 'ITDaShu',
        url: 'https://itdashu.com'
      }).then(({data}) => {
        console.log('保存成功', data)
        if (typeof data === 'object' && data.hasOwnProperty('code') && data.hasOwnProperty('msg')) {
          let release = JSON.parse(JSON.stringify(this.releaseConfig))
          console.log(release)
          this.$set(this.releaseData, index, release[index])
          this.saveConfig(this.releaseKey, this.releaseData)
          this.successSave.push(index)
          if (this.errorSave.hasOwnProperty(index)) {
            this.$delete(this.errorSave, index)
          }
        } else {
          this.$set(this.errorSave, index, this.lang('releaseUrlResponseError'))
        }
        this.$delete(this.saveRun, index)
      }).catch(() => {
        this.$delete(this.saveRun, index)
        console.log('保持失败')
        this.$set(this.errorSave, index, this.lang('releaseUrlTestError'))
      })
    },
    saveConfig(key, data) {
      let options = {}
      options[key] = JSON.stringify(data)
      console.log('保存前', options)
      browser.storage.local.set(options).then(res => {
        console.log('保存成功')
      })
    },
    releaseAdd() {
      let id = this.randomString()
      this.$set(this.releaseConfig, id, {
        name: '',
        url: '',
        default: false,
        salt: '',
        params: ''
      })
      console.log('新增后', this.releaseConfig)
    },
    getRelease() {
      browser.storage.local.get(this.releaseKey).then(data => {
        if (data.hasOwnProperty(this.releaseKey)) {
          data = JSON.parse(data[this.releaseKey])
        } else {
          data = {}
        }
        this.releaseConfig = JSON.parse(JSON.stringify(data))
        this.releaseData = data
      })
    },
    getHistory() {
      browser.storage.local.get(this.historyKey).then(data => {
        console.log('拿到的数据', data)
        if (data.hasOwnProperty(this.historyKey)) {
          data = JSON.parse(data[this.historyKey])
        } else {
          data = {}
        }

        this.historyData = data
      })
    }
  }
}
</script>

<style lang="scss">
@import "options";
</style>
