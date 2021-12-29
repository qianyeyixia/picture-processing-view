// pages/canvas/index.js
const app = getApp();
var getPhoteFrameList = require("../../utils/getPhoteFrame");

Page({
  /**
   * 页面的初始数据
   */
  canvasNode: null,
  ctx: null,
  imgageMapList: new Map([]),
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
    currentColor: "white",
    frameSrcs: [], // 图片相框
    showFrameSrcs: false, // 展示相框
    currentFrameObj: {},
    frame_path: "http://www.shazhibin.top/frame_path"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.cropper = this.selectComponent("#image-cropper");
    if (app.globalData.imgSrc) {
      this.setData({
        imgSrc: app.globalData.imgSrc
      })
    }
    this.getFrameList()
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
        this.canvasNode.width = this.data.dw * this.dpr;
        this.canvasNode.height = this.data.dh* this.dpr
        this.ctx.scale(this.dpr, this.dpr);
      });
  },
  onShow() {
    if (app.globalData.imgSrc) {
      this.setData({
        imgSrc: app.globalData.imgSrc
      })
    }
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
      // 保存原始的图片
      wx.getImageInfo({
        src: res.tempFilePaths[0],
        success: _res => {
          this.imgageMapList.set("origin", {
            ..._res,
            imgSrc: res.tempFilePaths[0]
          })
          console.log(this.imgageMapList);
        },
        fail: err => {
          console.log(err, "err")
          wx.hideLoading()
        }
      })
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
          let _width = 230,
            _height = 280
          if (t.data.currentFrameObj.path) {
            console.log("t.data.currentFrameObj.path");
            t.drawImage(t.data.currentFrameObj.path, _width, _height)
            t.drawImage2(_data.result.picturePath, _width , _height,  10, 10, 10, 10)
          } else {
            t.drawImage(_data.result.picturePath, _width, _height)
          }
        },
        fail: (res) => {
          console.log("fail res", res);
          wx.hideLoading()
        },
      });
    });
  },
  drawImage: function (imageSrc, width, height, offectX = 0, offectY = 0) {
    console.log("drawImage ---", imageSrc, width, height);
    let canvas = this.canvasNode
    let ctx = this.ctx
    let img = canvas.createImage();
    img.width = width;
    img.height = height;
    img.src = imageSrc;
    img.onload = function () {
      console.log("img onload");
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, offectX, offectY, width, height);
    };
    img.onerror = (r) => {
      console.log("err", r);
    }
  },
  drawImage2(imageSrc, width, height, offectX = 0, offectY = 0, dx = 0, dy = 0, dWidth, dHeight) {
    let canvas = this.canvasNode
    let ctx = this.ctx
    let img = canvas.createImage();
    img.width = width;
    img.height = height;
    img.src = imageSrc;
    dWidth = dWidth ? dWidth : width
    dHeight = dHeight ? dHeight : height
    
    img.onload = function () {
      console.log("img onload");
      // ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, offectX, offectY, width, height, dx, dy, dWidth, dHeight);
    };
    img.onerror = (r) => {
      console.log("err", r);
    }
  },
  isSrcEmpty() {
    if (!this.data.imgSrc) {
      wx.showToast({
        title: "没有上传图片,不能切换"
      })
    }
  },
  changeColor(e) {
    const color = e.target.dataset.color
    if (!this.data.imgSrc) {
      wx.showModal({
        content: "没有上传图片,不能改变背景颜色",
        showCancel: false,
      })
      return false
    }
    this.setData({
      currentColor: color
    })
    this.ctx.fillStyle = color
    this.drawImage(this.data.imgSrc, 230 / 3, 280 / 3)
  },
  getOriginImage(e) {
    const color = e.target.dataset.color
    let current = this.imgageMapList.get(color)
    console.log(!current);
    let _width = current?.width || 230,
      _height = current?.height || 280;
    this.ctx.fillRect(0, 0, _width * this.dpr, _height * this.dpr)
    this.ctx.setFillStyle = "white"
    if (!current) {
      wx.showModal({
        content: "没有上传图片,还原图片背景",
        showCancel: false,
      })
      return false
    } else {
      this.drawImage(current?.imgSrc, _width, _height)
    }
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
      console.log(err)
    })
  },
  toggleFrame() {
    this.setData({
      showFrameSrcs: !this.data.showFrameSrcs
    })
  },
  // 选择相框
  chooseFrame(e) {
    console.log(e.currentTarget.dataset.src);
    wx.getImageInfo({
      src: e.currentTarget.dataset.src,
    }).then(res => {
      console.log(res);
      this.setData({
        currentFrameObj: res,
        _left: (this.data.sysInfo.windowWidth - 230) / 2,
      })
      this.ctx.fillStyle = this.data.currentColor
      this.drawImage(this.data.currentFrameObj.path, 230, 280)
    }).catch(() => {
      wx.hideLoading()
    })
  },
  touchStart(e) {
    console.log(e);
  }
});