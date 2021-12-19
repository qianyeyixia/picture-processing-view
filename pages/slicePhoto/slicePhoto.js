// pages/slicePhoto/slicePhoto.js
const app = getApp();
var cImg = require("../../utils/chooseImage");
var getUser = require("../../utils/login")
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
        totalWidth: 15,
        frame_path: "http://www.shazhibin.top/frame_path"
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
            console.log("device", device);
            let deviceRatio = Math.round(device.windowWidth / 750)
            this.setData({
                device: device,
                deviceRatio: deviceRatio,
                page: "photoFrame",
                longImageSrcs: [],
                imgViewHeight: device.windowHeight - 160 * deviceRatio
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
                var i = a.width / (750 * t.data.deviceRatio);
                console.log("i", i);
                t.setData({
                    frameWidth: a.width / i,
                    frameHeight: a.height / i,
                    isFrameChoose: !1,
                    frameSrc: e.currentTarget.dataset.src,
                    readuSave: !0
                });
            }
        });
    },
    chooseImags() {
        let t = this;
        cImg.chooseImg(this, app, res => {
            console.log("then", res);
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
                    photoWidth: imgaeSrcInfo.width / t.data.device.devicePixelRatio,
                    photoHeight: imgaeSrcInfo.height / t.data.device.devicePixelRatio
                })
            }
            prmises()
        })
    },
    saveImgToPhone() {
        const t = this;
        const i = wx.createCanvasContext("tempCanvas", t);
        wx.showLoading({
            title: '生成图片中',
        })
        wx.getImageInfo({
            src: t.data.frameSrc
        }).then(res => {
            console.log("外边框", res);
            // i.drawImage(t.data.frameSrc, 0, 0 ,res.width,res.height)
            t.setData({
                totalHeight: res.height + 40,
                totalWidth: res.width + 40,
            })
            i.drawImage(res.path, 0, 0, res.width, res.height)
            wx.getImageInfo({
                src: t.data.imgSrc,
            }).then(_res => {
                console.log("头像大小", _res)
                const _width = res.width;
                const _height = Math.round(_width * res.width / res.height)
                i.drawImage(_res.path, 0, 0, _width - 20, _height - 20)
                i.draw()
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
                }, 1599)
            })
        })
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