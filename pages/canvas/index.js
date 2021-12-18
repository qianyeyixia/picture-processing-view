// pages/canvas/index.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
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
    console.log("onload", options, app.globalData)
    this.cropper = this.selectComponent("#image-cropper");
    if (app.globalData.imgSrc) {
      this.setData({
        imgSrc: app.globalData.imgSrc
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("app", app);
    if (!app.globalData.userInfo) {
      wx.login({
        timeout: 5000,
      }).then((res) => {
        console.log("wx.login", res)
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
      }).error(e => {
        console.error();
      })
    }
  },
  onShow() {
    console.log("show" , app.globalData.imgSrc)
    if (app.globalData.imgSrc) {
      this.setData({
        imgSrc: app.globalData.imgSrc
      })
    }
  },
  onHide() {
    console.log("onhide")
  },
  chooseImage: function () {
    let _this = this;
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
          console.log("success", fileRes);
          let _data = JSON.parse(fileRes.data);
          _this.setData({
            imgSrc: `data:image/png;base64,${_data.result}`,
          });
          app.globalData.imgaeSrc = _this.data.imgSrc
        },
        fail: (res) => {
          console.log("fail res", res);
        },
      });
      uploadTask.onProgressUpdate((res) => {
        console.log("上传进度", res.progress);
        if (res.progress == 100) {
          // wx.navigateTo({
          //   url: './cropper',
          // })
        }
        console.log("已经上传的数据长度", res.totalBytesSent);
        console.log("预期需要上传的数据总长度", res.totalBytesExpectedToSend);
      });
    });
  },
  drawImage: function (id, imageSrc, width, height, color = "wdhite") {
    const {
      ctx,
      canvas
    } = this.data;
    let img = canvas.createImage();
    img.id = id;
    img.src = imageSrc;
    img.width = width;
    img.height = height;
    img.onload = function () {
      console.log("图片加载完成");
      ctx.drawImage(img, 0, 0, width, height);
    };
  },
  toCropper() {
    wx.navigateTo({
      url: `cropper?imgSrc=${this.data.imgSrc}`,
    })
  },
  toSlice() {
    wx.navigateTo({
      url: `../slicePhoto/slicePhoto?imgSrc=${this.data.imgSrc}`,
    })
  },
  isSrcEmpty() {
    if(!this.data.imgSrc) {
      wx.showToast({
        title: "没有上传图片,不能切换"
      })
    }
  }
});