// pages/canvas/index.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ctx: null,
    canvas: null,
    imgSrc: null,
    width: 150, //宽度
    height: 150, //高度
    limit_move: false,
    show_cropper: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.cropper = this.selectComponent("#image-cropper");
    const query = wx.createSelectorQuery();
    query
      .select("#testCanvas")
      .fields({node:true, size:true})
      .exec(res => {
        console.log(res)
        const ctx = res[0].node;
        const canvas = ctx.getContext("2d")
        canvas.setFillStyle('red')
        canvas.fillRect(10, 10, 150, 100)
        canvas.draw()
        canvas.fillRect(50, 50, 150, 100)
        canvas.draw(true) 
      })
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("app", app);
    if (!app.globalData.userInfo || app.globalData.userInfo == {}) {
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
      });
    }
  },

  chooseImage: function () {
    let _this = this;
    wx.showLoading()
    wx.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
    }).then((res) => {
      console.log("chooseImage res", res, res.tempFilePaths[0]);
      const uploadTask = wx.uploadFile({
        filePath: res.tempFilePaths[0],
        name: "file",
        url: `${app.globalData.baseUrl}/wx/photo/getForeground`,
        formData: {
          openId: app.globalData.userInfo.openId,
        },
        success: (fileRes) => {
          console.log("success", fileRes, JSON.parse(fileRes.data));
          let _data = JSON.parse(fileRes.data);
          const _base64Str = `data:image/png:base64,${_data.result}`
          const _befferURL = wx.createBufferURL(wx.base64ToArrayBuffer(_base64Str))
          console.log("_befferURL",_befferURL)
          _this.setData({
            imgSrc:_befferURL
          });
          app.globalData.imgaeSrc = _befferURL
        },
        fail: (res) => {
          console.log("fail res", res);
          wx.hideLoading()
        },
      });
      uploadTask.onProgressUpdate((res) => {
        console.log("上传进度", res.progress);
        if (res.progress == 100) {
          wx.hideLoading()
        }
        console.log("已经上传的数据长度", res.totalBytesSent);
        console.log("预期需要上传的数据总长度", res.totalBytesExpectedToSend);
      });
    });
  },
  toCropper() {
    wx.navigateTo({
      url: `./cropper?imgSrc=${this.data.imgaeSrc}`,
    })
  }
});
