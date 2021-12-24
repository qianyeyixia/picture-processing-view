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
  to(promise) {  
    return promise.then(data => {
       return [null, data];
    })
    .catch(err => [err]);
 },
  async initGlobalData() {
    const [error, userInfoData] = await this.to(wx.getStorage({key:"userInfo"}))
    console.log("userInfoData", userInfoData);

    const hasUserInfo = userInfoData?.data?.openId ? true : false
    this.globalData = {
      userInfo: userInfoData?.data || null,
      baseUrl: "http://www.shazhibin.top/service",
      imgaeSrc: undefined,
      hasUserInfo,
      myDevice: wx.getSystemInfoSync()
    }
  },
  globalData: {
   
  }
})