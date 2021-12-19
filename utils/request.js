const app = getApp()


const request = (url, options) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${app.globalData.baseUrl}${url}`,
            ...options,
            success: (res) => {
                
            },
            fail: (err => {

            })
        })
    })
}