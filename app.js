// app.js
var wxLogin = require("./utils/login")

App({
  onLaunch() {
    // 展示本地存储能力
    this.initGlobalData()
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
    const hasUserInfo = userInfoData?.data?.openId &&  userInfoData?.data?.hasUserInfo
    this.globalData = {
      userInfo: userInfoData?.data || null,
      baseUrl: "http://www.shazhibin.top/service",
      imgaeSrc: undefined,
      hasUserInfo,
      myDevice: wx.getSystemInfoSync()
    }
    console.log("app",this.globalData);
    // if(!hasUserInfo) {
    //   wxLogin.getUserInfo(this)
    // }
  },
  globalData: {
   
  }
})