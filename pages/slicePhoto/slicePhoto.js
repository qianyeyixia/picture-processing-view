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
        t.setData({
          frameSrc: e.currentTarget.dataset.src,
          frameObj:a          
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
      t.setData({
        photoHeight: imgaeSrcInfo.height,
        photoWidth: imgaeSrcInfo.width,
      })
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
          photoWidth: imgaeSrcInfo.width,
          photoHeight: imgaeSrcInfo.height,
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
 
    let _width = Math.max(imgInfo.width, frameInfo.width);
    let _height = Math.max(imgInfo.height, frameInfo.height);
    let _offsetX = Math.abs((_width - imgInfo.width) / 2);
    let _offsetY = Math.abs((_height - imgInfo.height) / 2);
    console.log("_offsetX,_offsetY ", _offsetX, _offsetY);
    c.width = _width;
    c.height = _height;
    console.log(_width, _height, frameInfo, imgInfo, _offsetX, _offsetY);
   
    let frameImgEl = c.createImage();
    frameImgEl.onload = () => {
      console.log("frameImgEl", frameImgEl);
      i.drawImage(
        frameImgEl,
        0,
        0,
        _width,
        _height,
      );
    };
    frameImgEl.src = frameInfo.path;
    let imgEl = c.createImage();
    imgEl.onload = () => {
      console.log("imgEl", imgEl);
      i.drawImage(
        imgEl,
        _offsetX,
        _offsetY,
        c.width - 20,
        c.height - 20,
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
    wx.canvasToTempFilePath({
        canvas: t.canvasNode,
      })
      .then((res) => {
        console.log("getTemFile success", res);
        wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
          })
          .then((_res) => {
            wx.hideLoading()
            console.log(" _res", _res);
          })
          .catch((err) => {
            console.log("err", err);
          })
      })
      .catch((err) => {
        console.log("getTemFile err", err);
      });
  },
});