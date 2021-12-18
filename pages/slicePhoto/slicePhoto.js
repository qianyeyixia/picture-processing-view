// pages/slicePhoto/slicePhoto.js
const app = getApp();
var cImg = require("../../utils/chooseImage");
var getUser = require("../../utils/login")
Page({
    /**
     * 页面的初始数据
     */
    data: {
        readuSave: true,
        imgSrc: "../../images/frame/frame2.png",
        frameSrc: "",
        isFrameChoose: !1,
        photoSrc: "",
        frameHeight: 0,
        minScale: .5,
        maxScale: 2,
        photoWidth: 0,
        photoHeight: 0,
        photoLeft: 0,
        photoTop: 0,
        whichDeleteShow: 99999,
        frameSrcs: [{
            src: "frame1.png",
            title: "文艺小清新"
        }, {
            src: "frame2.png",
            title: "Happy Birthday"
        }, {
            src: "frame3.png",
            title: "素描花环"
        }, {
            src: "frame4.png",
            title: "文艺小清新"
        }, {
            src: "frame5.png",
            title: "卡通小屋"
        }, {
            src: "frame6.png",
            title: "爱心相框"
        }, {
            src: "frame7.png",
            title: "心形云朵"
        }, {
            src: "frame8.png",
            title: "爱心花环"
        }, {
            src: "frame9.png",
            title: "拍立得相框"
        }, {
            src: "frame10.png",
            title: "文艺小清新"
        }, {
            src: "frame11.png",
            title: "贴纸"
        }],
        device: null,
        totalHeight: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (c) {
        if (c.imgSrc) {
            this.setData({
                imgSrc: c.imgSrc
            })
        }
        if (app.globalData.myDevice) {
            let device = app.globalData.myDevice;
            let deviceRatio = device.windowWidth / 750
            this.setData({
                device:device,
                deviceRatio: deviceRatio,
                page: "photoFrame",
                longImageSrcs: [],
                imgViewHeight: device.windowHeight - 160 * deviceRatio
            })
        }
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        if (!app.globalData.userInf) {
            getUser.getUserInfo(app)
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        // 1.展示图片
        // 2.选择相框
        // 3.保存合并后的图片
        // 使用 wx.canvasToTempFilePath, 把当前画布指定区域的内容导出生成指定大小的图片, 在 draw() 回调里调用该方法才能保证图片导出成功。
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    chooseFrame(e) {
        console.log(e)
        let t = this;
        wx.getImageInfo({
            src: "../../images/frame/" + e.currentTarget.dataset.src,
            success: function (a) {
                var i = a.width / (750 * e.deviceRatio);
                e.frameWidth = a.width / i, t.frameHeight = a.height / i, t.setData({
                    frameHeight: e.frameHeight,
                    isFrameChoose: !1,
                    frameSrc: "../../images/frame/" + e.currentTarget.dataset.src,
                    readuSave: !0
                });
            }
        });
    },
    chooseImags() {
        cImg.chooseImg(this, app)
    },
    saveImgToPhone() {
        const t = this;
        const i = wx.createCanvasContext("tempCanvas", t);
        wx.getImageInfo({
            src:t.data.frameSrc
        }).then(res => {
            console.log("外边框",res);
            // i.drawImage(t.data.frameSrc, 0, 0 ,res.width,res.height)
            i.drawImage(res.path, 0, 0 ,res.width,res.height)
            wx.getImageInfo({
              src: t.data.imgSrc,
            }).then(_res => {
                console.log("头像大小", _res)
                let sx = res.width/ 2 - _res.width/2
                let sy = res.height/ 2 - _res.height/2
                // i.drawImage(t.data.imgSrc, sx, sy , res.width /2,res.height /2)
                i.drawImage(_res.path, sx, sy , res.width /2,res.height /2)
                i.draw(true, () => {
                    console.log("绘制完成");
                })
                setTimeout(() => {
                    wx.canvasToTempFilePath({
                        canvasId: "tempCanvas"
                    }).then(_res_ => {
                        console.log("函数 then", _res_)
                        wx.saveImageToPhotosAlbum({
                            filePath:_res_.tempFilePath
                        }).then(saveRes => {
                            console.log(" saveImageToPhotosAlbum函数 then", _res_)
                            wx.showModal({
                                title: '温馨提示',
                                content: '图片保存成功，可在相册中查看',
                                showCancel: false,
                                success(cc) {
                                  wx.clear
                                }
                              })
                        })
                    }).catch(e => {
                        console.log("错误",e);
                    })
                }, 1500)
            })


        })
       
    }
})