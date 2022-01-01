// pages/photo.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    defaultSize: "mini",
    primarySize: "default",
    warnSize: "default",
    disabled: false,
    isLoading: false,
    plain: false,
    loading: false,
    image1Src: "",
    originImgSrc: "",
    canvas: null,
    context: null,
    sysInfo:null,
    x: 0,
    y: 0,
    dw: 100,
    dh: 100,
    image1: null,
    mvTid: null,
    chgTid: null,
    openId: "",
    userInfo: null,
    baseUri: "http://www.shazhibin.top/service",
    hasUserInfo: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (c) {
    console.log(c);
    if (c.imgSrc && c.imgSrc != "null" && c.imgSrc != "undefined") {
      this.setData({
        image1Src: c.imgSrc,
      });
      setTimeout(() => {
        this.drawImage();
      }, 500);
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
    const query = wx.createSelectorQuery().in(this);
    query
      .select("#canvas1")
      .fields({
        node: true,
        size: true,
      })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        canvas.width = this.data.dw;
        canvas.height = this.data.dh;
        this.setData({
          canvas: canvas,
          context: ctx,
        });
      });

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  choosePhoto: function (event) {
    console.log(app.globalData);
    if (!app.globalData.hasUserInfo) {
      wx.getUserProfile({
        desc: "完善信息",
        lang: "zh_CN",
        success: (res) => {
          console.log("getUserProfile", res);
          app.globalData.userInfo = {
            ...res,
            ...res.userInfo
          }
          app.globalData.hasUserInfo = true
          this.setData({
            userInfo: res.userInfo,
            "userInfo.openId": app.globalData.userInfo.openId,
            hasUserInfo: true,
          });
          wx.setStorage({
            key: "userInfo",
            data: app.globalData.userInfo
          })
          wx.request({
            url: this.data.baseUri + "/wx/save",
            data: this.data.userInfo,
            method: "POST",
          });
        },
      });
      return;
    }
    wx.navigateTo({
      url: "../canvas/cropper",
    });
  },
  bthClick: function (event) {
    let context = this.data.context;
    context.fillStyle = event.target.dataset.color;
    this.drawImage();
  },
  drawImage: function () {
    this.setData({
      isLoading:true
    })
    let t = this;
    let data = this.data;
    console.log("data", data);
    let canvas = data.canvas;
    let context = data.context;
    // 创建一个图片
    const image = canvas.createImage();
    image.width = data.dw;
    image.height = data.dh;
    image.onload = function () {
      console.log("图片加载完成");
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, data.x, data.y, data.dw, data.dh);
      t.setData({
        isLoading:false
      })
    };
    image.src = data.image1Src; // 要加载的图片 url
    image.onerror = function () {
      console.log("图片加载失败");
      t.setData({
        isLoading:false
      })
    };
  },
  btnStartMovePhoto: function (event) {
    let dataThis = this;
    let a = parseInt(event.target.dataset.a);
    let b = parseInt(event.target.dataset.b);
    let mvTid = setInterval(function () {
      let x = dataThis.data.x + a;
      let y = dataThis.data.y + b;
      dataThis.setData({
        x: x,
        y: y,
      });
      dataThis.drawImage();
    }, 50);
    this.setData({
      mvTid: mvTid,
    });
  },
  btnEndMovePhoto: function () {
    clearInterval(this.data.mvTid);
  },
  btnStartChangePhoto: function (event) {
    let dataThis = this;
    let a = parseInt(event.target.dataset.a);
    let chgTid = setInterval(function () {
      let dw = dataThis.data.dw + a;
      let dh = dataThis.data.dh + a;
      dataThis.setData({
        dw: dw,
        dh: dh,
      });
      dataThis.drawImage();
    }, 50);
    this.setData({
      chgTid: chgTid,
    });
  },
  BtnEndChangePhoto: function () {
    clearInterval(this.data.chgTid);
  },
  removeBg() {
    let t = this;
    wx.uploadFile({
      filePath: t.data.image1Src,
      name: 'file',
      url: `${app.globalData.baseUrl}/wx/photo/getForeground`,
      formData: {
        openId: app.globalData.userInfo.openId,
      },
      success: (res) => {
        let _data = JSON.parse(res.data);
        console.log(_data);
        let originImgSrc = t.data.image1Src
        t.setData({
          image1Src: _data.result.picturePath,
          originImgSrc: originImgSrc
        });
        t.drawImage()
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
  setImgBg() {
    let t = this;
    t.setData({
      image1Src: t.data.originImgSrc,
      originImgSrc: ""
    })
    t.drawImage()
  },
  saveImage() {
    let t = this
    this.setData({
      isLoading:true
    })
    wx.canvasToTempFilePath({
      canvas:this.data.canvas,
    }).then(res => {
      wx.uploadFile({
        url: `${app.globalData.baseUrl}/wx/photo/uploadFile`,
        filePath:res.tempFilePath,
        name: 'file',
        formData: {
          openId: app.globalData.userInfo.openId,
        },
        success:(_res) => {
          const data = _res.data
          let {result} = JSON.parse(data)
          wx.showModal({
            showCancel:false,
            content: `请及时保存图片ID为${result.id}联系客服`
          })
        },
        fail: err => {
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