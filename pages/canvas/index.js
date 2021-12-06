// pages/canvas/index.js
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        ctx: null,
        canvas: null,
        imgSrc: null, 
        width:150,//宽度
        height:150,//高度
        limit_move:false,
        show_cropper:false
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.cropper = this.selectComponent("#image-cropper");
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        console.log(app)
        if(!app.globalData.userInfo) {
            wx.login({
                timeout: 5000,
            }).then(res => {
                wx.request({
                    url: `${app.globalData.baseUrl}/wx/login`,
                    data: {
                        code: res.code
                    },
                    success: (res) => {
                       console.log(res)
                        app.globalData.userInfo = {
                            ...res.data.result
                        }
                        console.log(app.globalData)
                    }
                })
            })
        }
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () { },
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
    chooseImage: function () {
        let _this = this;
        wx.chooseImage({
            count: 1,
            sizeType: ["original", "compressed"],
            sourceType: ["album", "camera"]
        }).then(res => {
            console.log("chooseImage res",res, res.tempFilePaths[0])
            wx.uploadFile({
                filePath: res.tempFilePaths[0],
                name: 'file',
                url: `${app.globalData.baseUrl}/wx/photo/getForeground`,
                formData: {
                    openId: app.globalData.userInfo.openId
                },
                success: (fileRes => {
                    console.log("success",fileRes)
                    let _data = JSON.parse(fileRes.data)
                    _this.setData({
                        show_cropper:true,
                        imgSrc: `data:image/png;base64,${_data.result}`
                    })
                    _this.drawImage("current", this.data.imgSrc, 80, 80)
                })
            })
        })
    },
    drawImage: function (id, imageSrc, width, height, color = "wdhite") {
        const {
            ctx,
            canvas
        } = this.data
        let img = canvas.createImage()
        img.id = id
        img.src = imageSrc
        img.width = width
        img.height = height
        img.onload = function () {
            console.log("图片加载完成")
            ctx.drawImage(img, 0, 0, width, height)
        }
    },
    cropperload(e) {
        console.log("cropper初始化完成")
    },
    loadimage(e) {
        console.log("图片加载完成",e,e.detail);
        wx.hideLoading();
    },
    clickcut(e) {
        console.log(e.detail);
        wx.previewImage({
            current: e.detail.url, // 当前显示图片的http链接
            urls: [e.detail.url] // 需要预览的图片http链接列表
        })
    }
})