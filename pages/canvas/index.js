// pages/canvas/index.js
const app = getApp();
var getPhoteFrameList = require("../../utils/getPhoteFrame");
var WXlogin = require("../../utils/login")
Page({
  /**
   * 页面的初始数据
   */
  imgageMapList: new Map([]),
  data: {
    canvasNode: null,
    ctx: null,
    dpr: 1,
    sysInfo: null,
    imgSrc: null,
    dw: 230, //宽度
    dh: 280, //高度
    _left: -9999999,
    imageList: [],
    currentImgResultObj: {},
    currentImageBgBool: false,
    isLoading: false,
    currentColor: "white",
    frameSrcs: [], // 图片相框
    showFrameSrcs: false, // 展示相框
    currentFrameObj: {},
    frame_path: "http://www.shazhibin.top/frame_path"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getFrameList()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady(c) {
    console.log("c", 45, c, app.globalData);
    this.setData({
      sysInfo: app.globalData.myDevice
    })
    const query = wx.createSelectorQuery().in(this);
    query
      .select("#testCanvas")
      .fields({
        node: true,
        size: true,
      })
      .exec((res) => {
        let canvasNode = res[0].node;
        let ctx = canvasNode.getContext("2d");
        let dpr = app.globalData.myDevice.pixelRatio;
        canvasNode.width = this.data.dw * dpr;
        canvasNode.height = this.data.dh * dpr
        this.setData({
          canvasNode,
          ctx,
          dpr,
        })
        this.data.ctx.scale(this.dpr, this.dpr);
        if (app.globalData.imgSrc) {
          this.setData({
            _left: (this.data.sysInfo.windowWidth - 230) / 2,
            imgSrc: app.globalData.imgSrc
          })
          wx.getImageInfo({
            src: app.globalData.imgSrc,
          }).then(_r => {
            console.log(76, _r);
            this.drawImage(this.data.imgSrc, 230 * dpr, 280 * dpr)
          })
        }
      });
  },
  chooseImage: function () {
    if (!app.globalData.hasUserInfo) {
      wx.getUserProfile({
        desc: "重新授权",
        lang: "zh_CN",
        success: (res) => {
          console.log("getUserProfile", res);
          app.globalData.userInfo = {
            ...app.globalData.userInfo,
            ...res.userInfo
          }
          WXlogin.getUserInfo(app).then(_r => {
            wx.navigateTo({
              url: "../canvas/cropper",
            });
          })
        },
      });
      return;
    }
    wx.navigateTo({
      url: "../canvas/cropper",
    });
  },
  drawImage(imageSrc, width, height, offectX = 0, offectY = 0, reset = true) {
    let {
      canvasNode,
      ctx
    } = this.data
    let t = this
    this.setData({
      isLoading:true
    })
    let img = canvasNode.createImage();
    img.width = width;
    img.height = height;
    img.src = imageSrc;
    img.onload = function () {
      console.log("img onload");
      if(reset) {
        ctx.fillRect(0, 0, canvasNode.width, canvasNode.height)
      }
      ctx.drawImage(img, offectX, offectY, width, height);
      t.setData({
        isLoading:false
      })
    };
    img.onerror = (r) => {
      console.log("err", r);
      t.setData({
        isLoading:false
      })
    }
  },
  drawImage2(imageSrc, width, height, offectX = 0, offectY = 0, dx = 0, dy = 0, dWidth, dHeight) {
    let {
      canvasNode,
      ctx
    } = this.data
    let t = this
    t.setData({
      isLoading:true
    })
    let img = canvasNode.createImage();
    img.width = width;
    img.height = height;
    img.src = imageSrc;
    dWidth = dWidth ? dWidth : width
    dHeight = dHeight ? dHeight : height
    img.onload = function () {
      console.log("img onload");
      ctx.drawImage(img, offectX, offectY, width, height, dx, dy, dWidth, dHeight);
      t.setData({
        isLoading:false
      })
    };
    img.onerror = (r) => {
      console.log("err", r);
      t.setData({
        isLoading:false
      })
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
    let {ctx, dpr} = this.data
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
    ctx.fillStyle = color
    this.drawImage(this.data.imgSrc, 230*dpr　, 280* dpr)
  },
  getOriginImage(e) {
    let {ctx, dpr} = this.data
    const color = e.target.dataset.color
    let current = this.imgageMapList.get(color)
    console.log(!current);
    let _width = current?.width || 230,
      _height = current?.height || 280;
    ctx.fillRect(0, 0, _width * dpr, _height * dpr)
    ctx.setFillStyle = "white"
    if (!current) {
      wx.showModal({
        content: "没有上传图片,还原图片背景",
        showCancel: false,
      })
      return false
    } else {
      this.drawImage(current?.imgSrc, _width * dpr, _height  * dpr)
    }
  },
  removeImageBg(e) {
    const color = e.target.dataset.color;
    this.setData({
      isLoading: true
    })
    if (!this.data.imgSrc) {
      return wx.showModal({
        content: "没有上传图片,请上传图片后重试",
        showCancel: false,
      })
    }
    wx.uploadFile({
      filePath: this.data.imgSrc,
      name: 'file',
      url: `${app.globalData.baseUrl}/wx/photo/getForeground`,
      formData: {
        openId: app.globalData.userInfo.openId,
      },
      success: (res) => {
        let _data = JSON.parse(res.data);
        this.imgageMapList.set("origin", {
          imgSrc: this.data.imgSrc,
          width: 230,
          height: 280
        })
        this.imgageMapList.set(color, {
          imgSrc: _data.result.picturePath,
          width: 230,
          height: 280
        })
        this.setData({
          imgSrc: _data.result.picturePath,
          currentImageBgBool:true
        })
        this.drawImage(this.data.imgSrc, 230 * this.data.dpr, 280 * this.data.dpr)
      },
      fail: (err) => {
        console.log(err);
        this.setData({
          isLoading: false
        })
      },
    })
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
    let {ctx, dpr} = this.data
    console.log(e.currentTarget.dataset.src);
    wx.getImageInfo({
      src: e.currentTarget.dataset.src,
    }).then(res => {
      console.log(res);
      this.setData({
        currentFrameObj: res,
        _left: (this.data.sysInfo.windowWidth - 230) / 2,
      })
      ctx.fillRect(0, 0, 230 * dpr, 280* dpr)
      // t.drawImage(img, offectX, offectY, width, height);
      // ctx.fillStyle = this.data.currentColor
      let f_width = (230 - 40) * dpr;
      let f_height = (280 - 40) * dpr;
      let f_offsetX = 20 * dpr;
      let f_foosetY = 20  * dpr;
      // currentFrameObj.path
      this.drawImage(this.data.currentFrameObj.path, 230 * dpr, 280 * dpr, 0, 0,false)
      this.drawImage(this.data.imgSrc, f_width, f_height, f_offsetX, f_foosetY,false)
    }).catch(() => {
      wx.hideLoading()
    })
  },
  saveImage() {
    let t = this;
    this.setData({
      isLoading: true
    })
    wx.canvasToTempFilePath({
      canvas: this.data.canvasNode,
    }).then(r => {
      wx.uploadFile({
        filePath: r.tempFilePath,
        name: 'file',
        url:  `${app.globalData.baseUrl}/wx/photo/uploadFile`,
        formData: {
          openId: app.globalData.userInfo.openId,
        },
        success: res => {
          const data = _res.data
          let {result} = JSON.parse(data)
          wx.showModal({
            showCancel:false,
            content: `请及时保存图片ID为${result.id}联系客服`
          })
        },
        fail: err =>{
          wx.showModal({
            showCancel:false,
            content: "上传失败,请稍候重试"
          })  
        },
        complete: ()=> {
          t.setData({
            isLoading:false
          })
        }
      })
    }).catch(err => {
      console.log("err",err);
      wx.showModal({
        showCancel:false,
        content: "上传失败,请稍候重试"
      })
    })
  }
});