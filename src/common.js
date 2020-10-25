export default {
  methods:{
    lang(msg){
      return browser.i18n.getMessage(msg)
    }
  }
}