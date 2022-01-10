var WxLogin = require("./login")
async function getPhoteFrameList(el, app) {
    console.log("async function getPhoteFrameList", app);
    return new Promise((resolve, reject) => {
        if(!app.globalData.hasUserInfo) {
            WxLogin.getUserInfo(app).then(r => {
                wx.setStorageSync('userInfo', r.result)
                wx.request({
                    url: `${app.globalData.baseUrl}/wx/photo/getFrameList`,
                    method: "GET",
                    data: {
                        openId: app.globalData.userInfo.openId
                    },
                    success: (res => {
                        console.log("utils getPhoteFrameList", res);
                        const {
                            data
                        } = res
                        if (data.rtnCode === "-9999") {
                            app.globalData.hasUserInfo = false
                            wx.removeStorageSync("userInfo")
                            reject(res)
                        } else {
                            resolve(res)
                        }
                    }),
                    fail: (err => {
                        reject(err)
                    })
                })
            })
        } else {
            wx.request({
                url: `${app.globalData.baseUrl}/wx/photo/getFrameList`,
                method: "GET",
                data: {
                    openId: app.globalData.userInfo.openId
                },
                success: (res => {
                    console.log("utils getPhoteFrameList", res);
                    const {
                        data
                    } = res
                    if (data.rtnCode === "-9999") {
                        app.globalData.hasUserInfo = false
                        wx.removeStorageSync("userInfo")
                        reject(res)
                    } else {
                        resolve(res)
                    }
                }),
                fail: (err => {
                    reject(err)
                })
            })
        }
    })
}




module.exports = getPhoteFrameList