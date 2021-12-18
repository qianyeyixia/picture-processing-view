// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    this.initGlobalData()
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  initGlobalData() {
    this.globalData = {
      userInfo: null,
      baseUrl: "http://www.shazhibin.top/service",
      imgaeSrc: undefined,
      myDevice: wx.getSystemInfoSync()
    }
  },
  globalData: {
   
  }
})