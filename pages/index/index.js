// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    navListArr:[
      {
        title: "图片认证",
        isToMiniApp: !1,
        text: "点击图片认证,就可以上传裁剪移动缩放等等",
        url: "../canvas/index"
      },
      {
        title: "头像DIY",
        isToMiniApp: !1,
        text: "个性化美化头像哦~多种饰品供选择~",
        url: "../iconAvatar/iconAvatar"
      }, {
        title: "照片拼相框",
        avatar: "../../images/frame/frame5.png",
        isToMiniApp: !1,
        text: "美美的你和美美的相框更配哦~",
        url: "../splicePhoto/splicePhoto"
    }, {
        title: "给我个国旗",
        avatar: "../../images/flag.png",
        isToMiniApp: !1,
        text: "头像加国旗~",
        url: "../bgAvatar/bgAvatar"
    }]
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
      
    }
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        wx.request({
          url: `${app.globalData.baseUrl}/wx/save`,
          data:res.userInfo,
          method: "GET",
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  toCropper() {
    wx.navigateTo({
      url: `../canvas/index`
    })
  },
  navItemClick(e) {
    console.log(e)
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: item.url,
    })
  }

})