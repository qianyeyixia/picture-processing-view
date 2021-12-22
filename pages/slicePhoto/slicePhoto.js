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
  data: {
    imgObj: null,
    frameObj: null,
    deviceRatio: 1,
    readuSave: true,
    imgSrc: "",
    frameSrc:
      "http://www.shazhibin.top/frame_path/2021-11/962708232feb46eb9891734d3ab8fc84.png",
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
    totalHeight: 0,
    totalWidth: 15,
    frame_path: "http://www.shazhibin.top/frame_path",
    longImageSrcs: [],
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
    getPhoteFrameList(this, app)
      .then((res) => {
        console.log(res);
        const { data } = res;
        this.setData({
          frame_path: data.result,
          frameSrcs: data.resultList,
        });
      })
      .catch((err) => {
        wxLogin.getUserInfo(app).then((res) => {
          console.log("wxLogin", res);
          wx.setStorage({
            key: "useInfo",
            data: res.data.result,
          });
        });
      });
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
    const i = wx.createCanvasContext("tempCanvas", t);
    wx.showLoading({
      title: "生成中",
    });
    let frameInfo = t.data.frameObj;
    let imgInfo = t.data.frameObj;
    let _offsetX = Math.abs((frameInfo.width - imgInfo.width) / 2);
    let _offsetY = Math.abs((frameInfo.height - imgInfo.height) / 2);
    let _width = Math.max(imgInfo.width, frameInfo.width);
    let _height = Math.max(imgInfo.height, frameInfo.height);
    i.drawImage(frameInfo.path, 0, 0, _width, _height);
    i.drawImage(
      imgInfo.path,
      _offsetX,
      _offsetY,
      imgInfo.width,
      imgInfo.height
    );
    console.log("drawImage -----");
    i.draw();
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: "tempCanvas",
        x: 0,
        y: 0,
        destWidth: _width,
        destHeight: _height,
        fileType: "png",
      })
        .then(async (res) => {
          console.log("getTemFile success", err);
          const [_saveError, _saveData] = app.to(
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
            })
          );
          console.log(" _saveError", _saveError);
          console.log(" _saveData", _saveData);
        })
        .catch((err) => {
          console.log("getTemFile err", err);
        });
    }, 1599);
    // setTimeout(() => {
    //     t.getTemFile({
    //         width: _width,
    //         height: _height,
    //     }).then((_c) => {
    //         console.log("getTemFile", _c);
    //         wx.saveImageToPhotosAlbum({
    //             filePath: _c.tempFilePath
    //         }).then(saveRes => {
    //             console.log(" saveImageToPhotosAlbum函数 then", saveRes)
    //             wx.hideLoading()
    //             wx.showModal({
    //                 title: '温馨提示',
    //                 content: '图片保存成功，可在相册中查看',
    //                 showCancel: false,
    //                 success(cc) {
    //                     wx.clear
    //                 }
    //             })
    //         })
    //     })
    // }, 1599)
  },
  getTemFile(options) {
    console.log("getTemFile 触发");
    let t = this;
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        canvasId: "tempCanvas",
        x: 0,
        y: 0,
        destWidth: options.width,
        destHeight: options.height,
        fileType: "png",
      })
        .then((res) => {
          console.log("getTemFile success", err);
          resolve(res);
        })
        .catch((err) => {
          console.log("getTemFile err", err);
          t.getTemFile(options);
          reject(err);
        });
    });
  },
});
