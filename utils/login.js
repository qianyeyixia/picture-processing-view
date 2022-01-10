async function getUserInfo(app) {
  const res = await wx.login();
  console.log("wx.login", res);
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseUrl}/wx/login`,
      data: {
        code: res.code,
      },
      success: (_res) => {
        console.log("login",_res);
        app.globalData.userInfo = {
          ...app.globalData.userInfo,
          ..._res.data.result,
        };
        let userInfo = {
          ...app.globalData.userInfo,
        }
        app.globalData.userInfoData = _res.data.result
        app.globalData.hasUserInfo = _res.data.result.hasUserInfo
        const hasUserInfo = _res.data.result.hasUserInfo
        if(!hasUserInfo) {
          wx.request({
            url: app.globalData.baseUrl + '/wx/save',
            data: {
              ...userInfo
            },
            method: 'POST',
            success: (_r => {
              console.log("save _r", _r);
              wx.setStorageSync({
                key: "userInfo",
                data:{
                  ... app.globalData.userInfo,
                  ..._r.userInfo
                }
              })
              resolve(_res.data)
            }),
            error: (e) => {
              reject(_res)
            }
          })
        } else {
          resolve(+res)
        }
      },
      error: (error) => {
        console.log("getUserInfo error")
        reject(error)
      }
    });
  })
}
module.exports = {
  getUserInfo,
};
