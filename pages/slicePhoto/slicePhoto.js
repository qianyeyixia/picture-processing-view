// pages/slicePhoto/slicePhoto.js
const app = getApp();
var cImg = require("../../utils/chooseImage");
var wxLogin = require("../../utils/login")
var getPhoteFrameList = require("../../utils/getPhoteFrame")
Page({
    /**
     * 页面的初始数据
     */
    data: {
        deviceRatio: 1,
        readuSave: true,
        imgSrc: "",
        frameSrc: "",
        frameHeight: 0,
        frameWidth: 0,
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
        frameSrcs: [],
        device: null,
        totalHeight: 0,
        totalWidth: 15,
        frame_path: "http://www.shazhibin.top/frame_path",
        longImageSrcs: []
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
            this.device = app.globalData.myDevice;
            this.deviceRatio = this.device.windowWidth / 750;
            this.setData({
                device: this.device,
                deviceRatio: this.deviceRatio,
                page: "photoFrame",
                longImageSrcs: [],
                imgViewHeight: this.device.windowHeight - 160 * this.deviceRatio
            })
        }
        getPhoteFrameList(this, app).then(res => {
            console.log(res);
            const {
                data
            } = res
            this.setData({
                frame_path: data.result,
                frameSrcs: data.resultList
            })
        }).catch(err => {
            wxLogin.getUserInfo(app).then(res => {
                console.log("wxLogin", res);
            })
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        console.log(app.globalData);
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
            src: e.currentTarget.dataset.src,
            success: function (a) {
                console.log("a", a, t.data.deviceRatio);
                const {
                    windowHeight,
                    windowWidth,
                    screenWidth,
                    deviceRatio
                } = t.data.device
                let i = a.width / (750 * t.deviceRatio);
                console.log("i", i);
                t.frameHeight = a.height / i;
                t.frameWidth = a.width / i;
                if (t.frameHeight > 500) {
                    t.frameHeight = t.frameHeight - 500 + a.height
                }
                console.log(a.width, "a.width", t.frameHeight, "t.frameHeight");
                t.setData({
                    frameHeight: t.frameHeight,
                    frameSrc: e.currentTarget.dataset.src,
                });
            }
        });
    },
    chooseImags() {
        let t = this;
        cImg.chooseImg(this, app, res => {
            console.log("then", res);
            wx.showLoading({
                title: '保存中~',
            })
            const prmises = async () => {
                console.log("prmises 函数触发");
                const imgaeSrcInfo = await wx.getImageInfo({
                    src: res.result.picturePath
                })
                const frameInfo = await wx.getImageInfo({
                    src: this.data.frameSrc,
                })
                console.log("imgaeSrcInfo", imgaeSrcInfo);
                console.log("frameInfo", frameInfo);
                t.setData({
                    imgSrc: res.result.picturePath,
                    photoWidth: imgaeSrcInfo.width / frameInfo.height * frameInfo.width - 40,
                    photoHeight: imgaeSrcInfo.height / frameInfo.height * frameInfo.width - 40,
                })
                wx.hideLoading()
            }
            prmises()
        })
    },
    async saveImgToPhone() {
        const t = this;
        const i = wx.createCanvasContext("tempCanvas", t);
        wx.showLoading({
            title: '生成图片中',
        })
        console.log("t", t, i, "i");
        if (!t.data.frameSrc) return wx.showToast({
            title: '请选择相框',
            icon: 'error'
        })
        const frameInfo = await wx.getImageInfo({
            src: t.data.frameSrc,
        })
        if (!t.data.imgSrc) return wx.showToast({
            title: '请选择图片',
            icon: 'error'
        })
        const imgInfo = await wx.getImageInfo({
            src: t.data.imgSrc
        })
        console.log("imgInfo", imgInfo);
        console.log("frameInfo", frameInfo);
        let _width = frameInfo.width > imgInfo.width ? frameInfo.width : imgInfo.width / frameInfo.height * frameInfo.width
        let _heiht = frameInfo.height > imgInfo.height ? frameInfo.height : imgInfo.height / frameInfo.width * frameInfo.height
        await i.drawImage(frameInfo.path, 0, 0, _width, _heiht)
        let _x = Math.max(frameInfo.width - imgInfo.width, 0)
        let _y = Math.max(frameInfo.height - imgInfo.height, 0)
        await i.drawImage(imgInfo.path, _x, _y, imgInfo.width, imgInfo.height)
        await i.draw()
        setTimeout(() => {
            t.getTemFile().then((_c) => {
                console.log("getTemFile", _c);
                wx.saveImageToPhotosAlbum({
                    filePath: _c.tempFilePath
                }).then(saveRes => {
                    console.log(" saveImageToPhotosAlbum函数 then", saveRes)
                    wx.hideLoading()
                    wx.showModal({
                        title: '温馨提示',
                        content: '图片保存成功，可在相册中查看',
                        showCancel: false,
                        success(cc) {
                            wx.clear
                        }
                    })
                })
            })
        },1599)



        // console.log("frameSrc", frameSrc);
        // wx.getImageInfo({
        //     src: t.data.frameSrc
        // }).then(res => {
        //     console.log("外边框", res);
        // console.log(t.frameHeight, t.frameWidth,t.deviceRatio, res.width / (750 * t.deviceRatio));
        // let h =  res.width / (750 * t.deviceRatio),
        // c = res.width / h,
        // n = res.height / h,
        // l = t.data.totalHeight,
        // r = t.data.totalHeight + n;
        // t.setData({
        //     totalHeight: r,
        //     totalWidth: res.width,
        // })
        // console.log("l", l, "c", c, "n", n);
        //     i.drawImage(res.path, 0, 0, t.frameWidth, t.frameHeight)
        //     wx.getImageInfo({
        //         src: t.data.imgSrc,
        //     }).then(_res => {
        //         console.log("头像大小", _res)
        //         let aa =  t.frameHeight ? t.frameHeight : 1e3 * t.deviceRatio;


        //         i.drawImage(_res.path, 0, 0, nn, ll)
        //         i.draw()
        //         setTimeout(() => {
        //             t.getTemFile().then((_c) => {
        //                 console.log("getTemFile", _c);
        //                 wx.saveImageToPhotosAlbum({
        //                     filePath: _c.tempFilePath
        //                 }).then(saveRes => {
        //                     console.log(" saveImageToPhotosAlbum函数 then", saveRes)
        //                     wx.hideLoading()
        //                     wx.showModal({
        //                         title: '温馨提示',
        //                         content: '图片保存成功，可在相册中查看',
        //                         showCancel: false,
        //                         success(cc) {
        //                             wx.clear
        //                         }
        //                     })
        //                 })
        //             })
        //         }, 1599)
        //     })
        // })
    },
    getTemFile() {
        let t = this
        return new Promise((resolve, reject) => {
            wx.canvasToTempFilePath({
                canvasId: "tempCanvas",
            }).then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
                t.getTemFile()
            })
        })
    }
})