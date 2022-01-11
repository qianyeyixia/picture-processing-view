// pages/canvas/index.js
const app = getApp();
var getPhoteFrameList = require("../../utils/getPhoteFrame");
var WXlogin = require("../../utils/login")
var imgageMapList = new Map([])

Page({
  /**
   * 页面的初始数据
   */
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
    originImgObj: {},
    isLoading: false,
    currentColor: "white",
    frameSrcs: [], // 图片相框
    showFrameSrcs: false, // 展示相框
    currentFrameObj: {},
    frame_path: "http://www.shazhibin.top/frame_path",
  },
  onShow() {
    if(!this.data.frameSrcs.length) {
      this.getFrameList()
    } 
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady(c) {
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
            imgSrc: app.globalData.imgSrc,
          })
          wx.getImageInfo({
            src: app.globalData.imgSrc,
          }).then(_r => {
            console.log(76, _r);
            this.drawImage(this.data.imgSrc, 230 * dpr, 280 * dpr, 0,0 ,true)
          })
        }
      });
  },
  // 上传图片
  chooseImage: function () {
    wx.navigateTo({
      url: "../canvas/cropper",
    });
  },
  // 绘制图片到 canvas
  drawImage(imageSrc, width, height, offectX = 0, offectY = 0, reset = true) {
    console.log(109, imageSrc, width, height, offectX, offectY, reset);
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
  // 判断 imgSrc 是否存在 
  isSrcEmpty() {
    if (!this.data.imgSrc) {
      wx.showToast({
        title: "没有上传图片,不能切换"
      })
    }
  },
  // 改变颜色
  changeColor(e) {
    let {ctx,dpr, imgSrc, currentFrameObj} = this.data
    console.log("changeColor", imgSrc, currentFrameObj, 177, imgageMapList, ctx);
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
    if(currentFrameObj?.path) {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 230 * dpr, 280 * dpr)
      this.drawImage(this.data.imgSrc, 230 * dpr,280 * dpr, 0, 0 ,false)
      setTimeout(() => {
        this.drawImage(currentFrameObj.path, 230 * dpr　, 280 * dpr, 0, 0 ,false)
      }, 150)
    } else {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 230 * dpr, 280 * dpr)
      this.drawImage(this.data.imgSrc, 230 * dpr　, 280 * dpr, 0, 0 ,false)
    }
  },
  // 还原图片背景
  getOriginImage(e) {
    let {ctx, dpr, imgSrc, originImgObj, currentFrameObj, currentColor} = this.data
    const color = e.target.dataset.color
    const removeMap = imgageMapList.get("remove")
    const cMap = imgageMapList.get(currentFrameObj.id)
    console.log("getOriginImage", 183, originImgObj, currentFrameObj, imgageMapList, removeMap, cMap);
    this.setData({
      imgSrc: originImgObj.img.path
    })
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, 230 * dpr, 280 * dpr)
    if (!imgSrc) {
      wx.showModal({
        content: "没有上传图片,还原图片背景",
        showCancel: false,
      })
      return false
    } else {
      if(cMap?.frame && currentFrameObj.id) {
        this.drawImage(originImgObj.img.path, 
          230* dpr,
          280*dpr,
          0, 
          0, 
          false)
          setTimeout(() => {
            this.drawImage(currentFrameObj.path, 
              cMap.frame.width * dpr,
              cMap.frame.height * dpr,
              0, 
              0, 
              false)
          }, 120)
          imgageMapList.set(color, {
            img: {
              ...cMap.img,
              imgSrc: originImgObj.img.path, 
            },
            frame: {
              ...cMap.frame,
              path: currentFrameObj.path,
            }
          })
      } else {
        this.drawImage(originImgObj.img.path, 
         230 * dpr,
         280 * dpr,
          0, 
          0, 
          true)
          imgageMapList.set(color, {
            img:{
              ...removeMap.img,
              imgSrc:originImgObj.img.path, 
            }
          })
      }
      this.setData({
        currentImageBgBool:false
      })
    }
  },
  // 清除图片背景
  removeImageBg(e) {
    let {currentFrameObj, currentColor, ctx, imgSrc, dpr, originImgObj} = this.data
    const color = e.target.dataset.color;
    const currentMap = imgageMapList.get(currentFrameObj.id)
    console.log(218,imgageMapList,originImgObj, imgSrc, 192, "removeImageBg", color, currentMap, currentFrameObj,currentColor);
    this.setData({
      isLoading: true
    })
    if (!this.data.imgSrc) {
      return wx.showModal({
        content: "没有上传图片,请上传图片后重试",
        showCancel: false,
      })
    }
    if(originImgObj?.remove?.path) {
      ctx.fillStyle = currentColor
      ctx.fillRect(0, 0, 230 * dpr, 280* dpr)
      if(currentMap) {
        this.drawImage(originImgObj.remove.path, 230 *dpr, 280 *dpr, 0, 0, false)
        setTimeout(() => {
          this.drawImage(currentFrameObj.path, 230*dpr, 280*dpr, 0 , 0, false)
        },120)
        this.setData({
          currentImageBgBool:true,
          isLoading:false,
          imgSrc:originImgObj.remove.path,
          currentFrameObj: {
            ...currentFrameObj
          }
        })
        imgageMapList.set(color, {
          img:{
            imgSrc: originImgObj.remove.path,
          },
          frame: {
            path: currentFrameObj.path
          }
        })
      } else {
        this.drawImage(originImgObj.remove.path, 230*dpr, 280*dpr)
        imgageMapList.set(color, {
          img: {
            imgSrc: originImgObj.remove.path,
            width: 230,
            height: 280,
          }
        })
        this.setData({
          currentImageBgBool:true,
          isLoading:false,
          imgSrc:originImgObj.remove.path,
        })
      }
    } else {
      wx.uploadFile({
        filePath: this.data.imgSrc,
        name: 'file',
        url: `${app.globalData.baseUrl}/wx/photo/getForeground`,
        formData: {
          openId: app.globalData.userInfo.openId,
        },
        success: (res) => {
          let _data = JSON.parse(res.data);
          wx.getImageInfo({
            src: _data.result.picturePath,
          }).then(imgRemoveBgRes => {
            ctx.fillRect(0, 0, 230 * dpr, 280* dpr)
            ctx.fillStyle = currentColor
            if(currentMap) {
              this.drawImage(imgRemoveBgRes.path, 
                230* dpr, 
                280*dpr, 
                0, 
                0, 
                false)
              setTimeout(() => {
                  this.drawImage(currentMap.frame.path, 
                    currentMap.frame.width * dpr, currentMap.frame.height * dpr,0, 0, false)
              },200)
              imgageMapList.set(color, {
                img: {
                  ...currentMap.img,
                  imgSrc: imgRemoveBgRes.path
                },
                frame: currentMap.frame
              })
              imgageMapList.set("origin", currentMap)
            } else {
              this.drawImage(imgRemoveBgRes.path, 230 * dpr, 280 * dpr, 0,0,true)
              imgageMapList.set(color, {
                img: {
                  imgSrc:imgRemoveBgRes.path,
                  width: 230,
                  height: 280,
                }
              })
            }
            this.setData({
              originImgObj:{
                img: {
                  path: imgSrc
                },
                remove: {
                  path: imgRemoveBgRes.path
                }
              },
              imgSrc:imgRemoveBgRes.path,
              currentImageBgBool:true,
              isLoading:false
            })
            console.log("imgageMapList", imgageMapList);
          })
      
        },
        fail: (err) => {
          console.log(err);
          this.setData({
            isLoading: false
          })
        },
      })
    }
  },
  // 获取相框
  getFrameList() {
    let t = this
    getPhoteFrameList(this, app).then(res => {
      console.log("this.getFrameList");
      const {
        data
      } = res;
      t.setData({
        frame_path: data.result,
        frameSrcs: data.resultList,
      });
    })
  },
  toggleFrame() {
    this.setData({
      showFrameSrcs: !this.data.showFrameSrcs
    })
  },
  // 选择相框
  chooseFrame(e) {
    let {ctx, dpr, currentColor, currentImageBgBool, imgSrc, currentFrameObj} = this.data
    const currentFrameItem = e.currentTarget.dataset.item
    console.log(e.currentTarget.dataset.src, currentColor, dpr, 285, e);
    wx.getImageInfo({
      src: e.currentTarget.dataset.src,
    }).then(res => {
      console.log(res, 289, currentImageBgBool, imgSrc, currentFrameObj);
      this.setData({
        currentFrameObj: {
          ...res,
          ...currentFrameItem
        },
        _left: (this.data.sysInfo.windowWidth - 230) / 2,
      })
      ctx.fillStyle = currentColor
      ctx.fillRect(0, 0, 230 * dpr, 280* dpr)
      let f_width = 230 * dpr;
      let f_height = 280* dpr;
      this.drawImage(imgSrc, f_width, f_height, 0, 0,false)
      setTimeout(() => {
        if(imgSrc) {
          this.drawImage(res.path, 230 * dpr, 280 * dpr, 0, 0,false)
        }
      }, 120)
      imgageMapList.set(currentFrameItem.id, {
        img: {
          imgSrc,
          width: f_width,
          height: f_height,
          offsetX:0,
          offsetY:0
        },
        frame: {
          path: res.path,
          width: 230,
          height: 289
        }
      })
      console.log(imgageMapList);
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