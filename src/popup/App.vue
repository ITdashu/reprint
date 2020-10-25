<template>
  <main>
    <span id="close"
          class="close-icon">&times;</span>
    <p>
      <b>{{ lang('reprintTo') }}</b>
    </p>
    <div class="content">
      <label v-for="(item,index) in release"
             :key="index">
        <img v-if="sendStatus === 'run' && selectRelease.indexOf(index) > -1"
             src="/icons/loading.gif"
             alt="loading">
        <span class="icon icon-success"
              v-if="successRelease.indexOf(index) > -1">✔</span>
        <span class="icon icon-error"
              v-if="errorRelease.indexOf(index) > -1">✖</span>
        <input type="checkbox"
               v-if="sendStatus === 'noRun' || allRelease.indexOf(index) === -1"
               :value="index"
               v-model="selectRelease">{{ item.name }}
      </label>
    </div>
    <div class="action">
      <a href="https://itdashu.com/reward.html"
         target="_blank">{{ lang('reward') }}</a>
      <div class="right">
        <button @click="send"
                :disabled="sendStatus === 'run'">{{ sendStatus === 'run' ? lang('reprintRun') : lang('reprint') }}
        </button>
        <button @click="openOptions">{{ lang('moreOptions') }}</button>
      </div>
    </div>
  </main>
</template>

<script>
import common from "@/common";

export default {
  name: 'App',
  mixins: [common],
  data() {
    return {
      options: 'options',
      release: {},
      selectRelease: [],
      successRelease: [],
      errorRelease: [],
      sendStatus: 'noRun',
      releaseKey: 'reprint_release',
      historyKey: 'reprint_history'
    }
  },
  computed: {
    allRelease() {
      return this.selectRelease.concat(this.successRelease, this.errorRelease)
    }
  },
  mounted() {
    browser.storage.local.get(this.releaseKey).then(data => {
      if (data.hasOwnProperty(this.releaseKey)) {
        data = JSON.parse(data[this.releaseKey])
      } else {
        data = {}
      }

      Object.keys(data).forEach(id => {
        if (data[id].default) {
          this.selectRelease.push(id)
        }
      })
      console.log('获取到的配置', data)
      this.$set(this, 'release', data)
    })

    browser.runtime.onMessage.addListener((data, sender, sendResponse) => {
      switch (data.action) {
        case "reprintSuccess":
          this.successRelease.push(data.id)
          this.deleteSelectRelease(data.id)
          break;
        case "reprintError":
          this.errorRelease.push(data.id)
          this.deleteSelectRelease(data.id)
          break;
      }
    })
  },
  methods: {
    deleteSelectRelease(id) {
      let index = this.selectRelease.indexOf(id)
      if (index > -1) {
        this.selectRelease.splice(index, 1)
      }

      if (this.selectRelease.length <= 0) {
        this.sendStatus = 'noRun'
      }
    },
    send() {
      console.log('触发点击事件', this.selectRelease)
      this.sendStatus = 'run'
      browser.runtime.sendMessage({
        action: 'reprint',
        params: this.selectRelease
      }, () => {
        console.log('似乎走到了错误')
        console.log(browser.runtime.lastError)
      })
    },
    openOptions() {
      browser.tabs.create({
        url: browser.runtime.getURL(browser.runtime.getURL("/options.html"))
      })
    }
  }
}
</script>

<style lang="scss">
@import "popup";
</style>
