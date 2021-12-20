
const app = getApp();

const request = (url, options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      ...options,
      success: (res) => {
        let {
          data: { rtnCode },
        } = res;
        if (rtnCode === "-9999") {
          reject(res);
        } else {
          resolve(res);
        }
      },
      fail: (err) => {
        resolve(res);
      },
    });
  });
};
