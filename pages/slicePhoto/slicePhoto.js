// pages/slicePhoto/slicePhoto.js
const app = getApp();
var cImg = require("../../utils/chooseImage");
var wxLogin = require("../../utils/login");
var getPhoteFrameList = require("../../utils/getPhoteFrame");
Page({
  /**
   * 页面的初始数据
   */
  deviceRatio: 0,
  device: null,
  ctx: null,
  canvasNode: null,
  dpr: 0,
  data: {
    imgObj: null,
    frameObj: null,
    deviceRatio: 1,
    readuSave: true,
    BoxHeight: 0,
    imgSrc: "",
    frameSrc: "http://www.shazhibin.top/frame_path/2021-11/962708232feb46eb9891734d3ab8fc84.png",
    frameHeight: 0,
    frameWidth: 0,
    isFrameChoose: !1,
    photoSrc: "",
    frameHeight: 0,
    minScale: 0.5,
    maxScale: 2,
    photoWidth: 0,
    photoHeight: 0,
    photoLeft: 0,
    photoTop: 0,
    whichDeleteShow: 99999,
    frameSrcs: [],
    device: null,
    totalHeight: 320,
    totalWidth: 280,
    frame_path: "http://www.shazhibin.top/frame_path",
    longImageSrcs: [],
    resetStatus: 5,
  },
  onReady: function () {
    const query = wx.createSelectorQuery().in(this);
    query
      .select("#tempCanvas")
      .fields({
        node: true,
        size: true,
      })
      .exec((res) => {
        this.canvasNode = res[0].node;
        this.ctx = this.canvasNode.getContext("2d");
        this.dpr = app.globalData.myDevice.pixelRatio;
        this.canvasNode.width = 100 * this.dpr;
        this.canvasNode.height = 100 * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (c) {
    if (c.imgSrc) {
      this.setData({
        imgSrc: c.imgSrc,
      });
    }
    if (app.globalData.myDevice) {
      this.device = app.globalData.myDevice;
      this.deviceRatio = this.device.windowWidth / 750;
      this.setData({
        device: this.device,
        deviceRatio: this.deviceRatio,
        page: "photoFrame",
        longImageSrcs: [],
        imgViewHeight: this.device.windowHeight - 160 * this.deviceRatio,
      });
    }
    this.getFrameList()
  },
  getFrameList() {
    let t = this
    getPhoteFrameList(this, app).then(res => {
      const {
        data
      } = res;
      t.setData({
        frame_path: data.result,
        frameSrcs: data.resultList,
      });
    }).catch(err => {
      wxLogin.getUserInfo(app).then((_res) => {
        wx.setStorage({
          key: "userInfo",
          data: _res.data.result,
        });
        t.setData({
          resetStatus: t.data.resetStatus--
        })
        t.getFrameList(t, app)
      });
    })
  },
  /**
   * @description: 选择背景框
   * @param {*} e
   * @return {*}
   */
  chooseFrame(e) {
    let t = this;
    wx.getImageInfo({
      src: e.currentTarget.dataset.src,
      success: function (a) {
        console.log("a", a, t.data.deviceRatio);
        let i = a.width / (750 * t.deviceRatio);
        console.log("i", i);
        t.frameHeight = a.height / i;
        t.frameWidth = a.width / i;
        if (t.frameHeight > 500) {
          t.frameHeight = t.frameHeight - 500 + a.height;
        }
        console.log(a.width, "a.width", t.frameHeight, "t.frameHeight");
        t.setData({
          frameHeight: t.frameHeight,
          frameSrc: e.currentTarget.dataset.src,
        });
      },
    });
  },
  /**
   * @description: 上传图片
   * @param {*}
   * @return {*}
   */
  chooseImags() {
    let t = this;
    cImg.chooseImg(this, app, (res) => {
      wx.showLoading({
        title: "保存中~",
      });
      const imgaeSrcInfo = this.data.imgObj;
      console.log("imgaeSrcInfo", imgaeSrcInfo);
      wx.downloadFile({
        url: t.data.frameSrc,
        success: (temRes) => {
          console.log("temRes", temRes);
          if (temRes === 200) {
            t.setData({
              frameObj: {
                ...t.data.frameObj,
                ...temRes,
              },
            });
          }
        },
        complete: () => {
          wx.hideLoading();
        },
      });
      wx.getImageInfo({
        src: t.data.frameSrc,
      }).then((frameInfo) => {
        console.log("frameInfo", frameInfo);
        t.setData({
          photoWidth: Math.min(imgaeSrcInfo.width, frameInfo.width),
          photoHeight: Math.min(imgaeSrcInfo.height, frameInfo.height),
          frameObj: frameInfo,
          BoxHeight: Math.max(imgaeSrcInfo.height, frameInfo.height),
        });
      });
    });
  },
  /**
   * @description: 将图片保存到本地
   * @param {*}
   * @return {*}
   */
  saveImgToPhone() {
    const t = this;
    const i = this.ctx;
    const c = this.canvasNode;
    console.log(t, i);
    wx.showLoading({
      title: "生成中",
    });
    let frameInfo = t.data.frameObj;
    let imgInfo = t.data.imgObj;
    console.log("frameInfo", frameInfo);
    console.log("imgInfo", imgInfo);
    let _offsetX = Math.abs((frameInfo.width - imgInfo.width) / 2);
    let _offsetY = Math.abs((frameInfo.height - imgInfo.height) / 2);
    let _width = Math.max(imgInfo.width, frameInfo.width);
    let _height = Math.max(imgInfo.height, frameInfo.height);
    console.log("i", i);
    c.width = _width * t.dpr;
    c.height = _height * t.dpr;
    // t.setData({
    //   totalHeight: _height * t.dpr,
    //   totalWidth:　_width * t.dpr
    // })
    console.log(_width, _height, frameInfo, imgInfo, _offsetX, _offsetY);
    let framImgEl = c.createImage();
    console.log("framImgEl start", framImgEl);
    framImgEl.onload = () => {
      console.log("framImgEl", framImgEl);
      i.drawImage(
        frameInfo.path,
        0,
        0,
        _width,
        _height,
        0,
        0,
        frameInfo.width,
        frameInfo.height
      );
    };
    framImgEl.onerror = (e) => {
      console.log("framImgEl err", framImgEl, e);

    }
    framImgEl.src = frameInfo.path;

    let imgEl = c.createImage();
    console.log("imgEl start", imgEl);
    imgEl.onerror = (e) => {
      console.log("imgEl err", imgEl, e);
    }
    imgEl.onload = () => {
      console.log("imgEl", imgEl);
      i.drawImage(
        imgInfo.path,
        _offsetX,
        _offsetY,
        imgInfo.width,
        imgInfo.height
      );
    };
    imgEl.src = imgInfo.path;
    console.log("drawImage -----", _width, _height);
    setTimeout(() => {
      t.getTemFile({
        width: _width,
        height: _height
      })
    }, 800)

  },
  getTemFile(options) {
    console.log("getTemFile 触发", options);
    let t = this;
    let c = this.canvasNode;
    const url = c.toDataURL("image/png", 0.8)
    console.log(url);
    wx.getImageInfo({
      src: url,
    }).then(res => {
      console.log(res);
      wx.saveImageToPhotosAlbum({
          filePath: res.path,
        })
        .then((_res) => {
          wx.hideLoading()
          console.log(" _res", _res);
        })
        .catch((err) => {
          console.log("err", err);
        })
    }).catch((e) => {
      console.log("wx.getImageInfo err", e);
    })


    // wx.canvasToTempFilePath({
    //     canvas: t.canvasNode,
    //   })
    //   .then((res) => {
    //     console.log("getTemFile success", res);
    //     wx.saveImageToPhotosAlbum({
    //         filePath: res.tempFilePath,
    //       })
    //       .then((_res) => {
    //         wx.hideLoading()
    //         console.log(" _res", _res);
    //       })
    //       .catch((err) => {
    //         console.log("err", err);
    //       })
    //   })
    //   .catch((err) => {
    //     console.log("getTemFile err", err);
    //     this.getTemFile(options)
    //   });
  },
});