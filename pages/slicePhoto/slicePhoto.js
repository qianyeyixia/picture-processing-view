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
        deviceRatio: 1,
        readuSave: true,
        imgSrc: "",
        frameSrc: "",
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
                        data: res.data.result
                    })
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
            const prmises = async () => {
                console.log("prmises 函数触发");
                const imgaeSrcInfo = await wx.getImageInfo({
                    src: res.result.picturePath,
                });
                const frameInfo = await wx.getImageInfo({
                    src: this.data.frameSrc,
                });
                console.log("imgaeSrcInfo", imgaeSrcInfo);
                console.log("frameInfo", frameInfo);
                t.setData({
                    imgSrc: res.result.picturePath,
                    photoWidth:
                        (imgaeSrcInfo.width / frameInfo.height) * frameInfo.width - 40,
                    photoHeight:
                        (imgaeSrcInfo.height / frameInfo.height) * frameInfo.width - 40,
                });
                wx.hideLoading();
            };
            prmises();
        });
    },
    /**
     * @description: 将图片保存到本地
     * @param {*}
     * @return {*}
     */
    async saveImgToPhone() {
        const t = this;
        const i = wx.createCanvasContext("tempCanvas", t);
        wx.showLoading({
            title: "生成图片中",
        });
        console.log("t", t, i, "i");
        if (!t.data.frameSrc)
            return wx.showToast({
                title: "请选择相框",
                icon: "error",
            });
        const frameInfo = await wx.getImageInfo({
            src: t.data.frameSrc,
        });
        if (!t.data.imgSrc)
            return wx.showToast({
                title: "请选择图片",
                icon: "error",
            });
        const imgInfo = await wx.getImageInfo({
            src: t.data.imgSrc,
        });
        console.log("imgInfo", imgInfo);
        console.log("frameInfo", frameInfo);
        let _width =
            frameInfo.width > imgInfo.width
                ? frameInfo.width
                : (imgInfo.width / frameInfo.height) * frameInfo.width;
        let _height =
            frameInfo.height > imgInfo.height
                ? frameInfo.height
                : (imgInfo.height / frameInfo.width) * frameInfo.height;
        await i.drawImage(frameInfo.path, 0, 0, _width, _height);
        t.setData({
            totalHeight: Math.max(imgInfo.height, frameInfo.height),
            totalWidth: Math.max(imgInfo.width, frameInfo.width),
        });
        let _offsetX = Math.abs((frameInfo.width - imgInfo.width) / 2);
        let _offsetY = Math.abs((frameInfo.height - imgInfo.height) / 2);
        await i.drawImage(
            imgInfo.path,
            _offsetX,
            _offsetY,
            imgInfo.width,
            imgInfo.height
        );
        await i.draw();
        const _tempFilePath = await t.getTemFile();
        await wx.saveImageToPhotosAlbum({
            filePath: _tempFilePath.tempFilePath,
        });
        wx.hideLoading();
        wx.showModal({
            title: "温馨提示",
            content: "图片保存成功，可在相册中查看",
            showCancel: false,
            success(cc) {
                wx.clear;
            },
        });
        // t.getTemFile().then((_c) => {
        //     console.log("getTemFile", _c);
        //     wx.saveImageToPhotosAlbum({
        //         filePath: _c.tempFilePath
        //     }).then(saveRes => {
        //         console.log(" saveImageToPhotosAlbum函数 then", saveRes)
        //         wx.hideLoading()
        //         wx.showModal({
        //             title: '温馨提示',
        //             content: '图片保存成功，可在相册中查看',
        //             showCancel: false,
        //             success(cc) {
        //                 wx.clear
        //             }
        //         })
        //     })
        // })
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
        let t = this;
        return new Promise((resolve, reject) => {
            wx.canvasToTempFilePath({
                canvasId: "tempCanvas",
            })
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                    t.getTemFile();
                });
        });
    },
});
