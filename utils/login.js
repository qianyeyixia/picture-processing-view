function getUserInfo(app) {
    wx.login({
        timeout: 5000,
      }).then((res) => {
        wx.request({
          url: `${app.globalData.baseUrl}/wx/login`,
          data: {
            code: res.code,
          },
          success: (res) => {
            console.log(res);
            app.globalData.userInfo = {
              ...res.data.result,
            };
            console.log(app.globalData);
          },
        });
      }).catch(e => {
        console.error("错误`", e);
      })
}

module.exports = {
    getUserInfo
}