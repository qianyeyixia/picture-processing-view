async function getUserInfo(app) {
  const res = await wx.login({
    timeout: 5000,
  });
  console.log("wx.login", res);

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseUrl}/wx/login`,
      data: {
        code: res.code,
      },
      success: (_res) => {
        console.log(_res);
        app.globalData.userInfo = {
          ...app.globalData.userInfo,
          ..._res.data.result,
        };
        wx.setStorage({
          key: "userInfo",
          data: app.globalData.userInfo
        })
        let userInfo = {
          ...app.globalData.userInfo,
        }
        resolve(_res)
        wx.request({
          url: app.globalData.baseUrl + '/wx/save',
          data: {
            ...userInfo
          },
          method: 'POST',
          success: (_r => {
            console.log("save _r", _r);
          })
        })
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
