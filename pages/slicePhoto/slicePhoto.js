// pages/slicePhoto/slicePhoto.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        readuSave: true,
        imgSrc:null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
			imgSrc: options.imgSrc
		})
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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

    }
})