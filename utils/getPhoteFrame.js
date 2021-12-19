async function  getPhoteFrameList(el, app) {
    const  userInfo = await wx.getStorage({key: "userInfo"})
    console.log(userInfo.data);
    return new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/wx/photo/getFrameList`,
          method: "GET",
          data: {
              openId: userInfo.data.openId
          },
          success: (res => {
              resolve(res)
          }),
          fail: (err => {
              reject(err)
          })
        })
    })
}

module.exports =  getPhoteFrameList