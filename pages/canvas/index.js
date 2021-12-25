// pages/canvas/index.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  canvasNode: null,
  ctx: null,
  data: {
    sysInfo: null,
    imgSrc: null,
    dw: 230, //宽度
    dh: 280, //高度
    limit_move: false,
    show_cropper: false,
    _left: -9999999,
    imageList: [],
    currentImgResultObj: {},
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
    this.setData({
      sysInfo: app.globalData.myDevice
    })
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

    const query = wx.createSelectorQuery().in(this);
    query
      .select("#testCanvas")
      .fields({
        node: true,
        size: true,
      })
      .exec((res) => {
        this.canvasNode = res[0].node;
        this.ctx = this.canvasNode.getContext("2d");
        this.dpr = app.globalData.myDevice.pixelRatio;
        this.canvasNode.width = this.data.dw ;
        this.canvasNode.height = this.data.dh
        this.ctx.scale(this.dpr, this.dpr);
      });
  },
  onShow() {
    console.log("show", app.globalData.imgSrc)
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
    let t = this;
    wx.showLoading()
    wx.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
    }).then((res) => {
      console.log("chooseImage res", res, res.tempFilePaths[0]);
      wx.uploadFile({
        filePath: res.tempFilePaths[0],
        name: "file",
        url: `${app.globalData.baseUrl}/wx/photo/getForeground`,
        formData: {
          openId: app.globalData.userInfo.openId,
        },
        success: (fileRes) => {
          console.log("uploadFile success", fileRes, JSON.parse(fileRes.data));
          let _data = JSON.parse(fileRes.data);
          t.data.imageList.push(_data.result)
          t.setData({
            imgSrc: _data.result.picturePath,
            _left: (t.data.sysInfo.windowWidth - 230) / 2,
            currentImgResultObj: _data.result,
            imageList: t.data.imageList
          });
          wx.hideLoading()
          app.globalData.imgaeSrc = _data.result.picturePath
          t.ctx.fillStyle = "white"
          t.drawImage(_data.result.picturePath, 230 /3, 280/3)
        },
        fail: (res) => {
          console.log("fail res", res);
          wx.hideLoading()
        },
      });
      // uploadTask.onProgressUpdate((res) => {
      //   console.log("上传进度", res.progress);
      //   if (res.progress == 100) {
      //     wx.hideLoading()
      //   }
      //   console.log("已经上传的数据长度", res.totalBytesSent);
      //   console.log("预期需要上传的数据总长度", res.totalBytesExpectedToSend);
      // });
    });
  },
  drawImage: function (imageSrc, width, height) {
    console.log("drawImage ---", imageSrc, width, height);
    let canvas = this.canvasNode
    let ctx = this.ctx
    // canvas.width = width
    // canvas.height = height
    // ctx.fillStyle = color
    let img = canvas.createImage();
    // img.id = id;
    img.width = width;
    img.height = height;
    img.src = imageSrc;
    img.onload = function () {
      console.log("img onload");
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.onerror = (r) => {
      console.log("err", r);
    }
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
    if (!this.data.imgSrc) {
      wx.showToast({
        title: "没有上传图片,不能切换"
      })
    }
  },
  changeColor(e) {
    console.log(e);
    const color = e.target.dataset.color
    if (!this.data.imgSrc) {
      wx.showModal({
        content: "没有上传图片,不能改变背景颜色",
        showCancel: false,
      })
      return false
    }
    this.ctx.fillStyle = color
    this.drawImage(this.data.imgSrc, 230 /3, 280/3)
  }
});