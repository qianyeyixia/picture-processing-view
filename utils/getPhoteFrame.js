var WxLogin = require("./login")
async function getPhoteFrameList(el, app) {
    const userInfo = await wx.getStorage({
        key: "userInfo"
    })
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${app.globalData.baseUrl}/wx/photo/getFrameList`,
            method: "GET",
            data: {
                openId: userInfo.data.openId
            },
            success: (res => {
                console.log("getPhoteFrameList", res);
                const {
                    data
                } = res
                if (data.rtnCode === "-9999") {
                    reject(res)
                    app.globalData.hasUserInfo = false
                    WxLogin.getUserInfo(app)
                } else {
                    resolve(res)
                }
            }),
            fail: (err => {
                reject(err)
            })
        })
    })
}

module.exports = getPhoteFrameList