function wxChooseImage(el, app, uploadSuccess) {
    console.log("wxChooseImage");
    return new Promise((resolve, reject) => {
        wx.chooseImage({
            count: 1,
            sizeType: ["original", "compressed"],
            sourceType: ["album", "camera"],
        }).then(res => {
            wx.showLoading({
                title: "上传中~~"
            })
            console.log("wx.chooseImage success", res);
            const uploadTask = wx.uploadFile({
                filePath: res.tempFilePaths[0],
                name: "file",
                url: `${app.globalData.baseUrl}/wx/photo/getForeground`,
                formData: {
                    openId: app.globalData.userInfo.openId,
                },
                success: (fileRes) => {
                    console.log("success", fileRes);
                    let _data = JSON.parse(fileRes.data);
                    console.log(_data);
                    el.setData({
                        imgSrc: _data.result.picturePath,
                    });
                    resolve(_data)
                    uploadSuccess(_data)
                },
                fail: (error) => {
                    console.log("fail res", res);
                    reject(error)
                },
                complete: () => {
                    wx.hideLoading()
                }
            });
            uploadTask.onProgressUpdate((t) => {
                console.log("上传进度", t.progress);
                if (res.progress == 100) {
                    wx.hideLoading().then(() => {
                        uploadSuccess({
                            ...t,
                            ...res
                        })
                    })
                    resolve({
                        ...t,
                        ...res
                    })

                }
                console.log("已经上传的数据长度", t.totalBytesSent);
                console.log("预期需要上传的数据总长度", t.totalBytesExpectedToSend);
            });
        })
    })
}

async function chooseImg(el, app, uploadSuccess) {
    console.log("!app.globalData.hasUserInfo", app.globalData);
    if (!app.globalData.hasUserInfo) {
        wx.setStorageSync({
            key: "userInfo",
            data: null
        })
        wx.getUserProfile({
            desc: '用户登录',
            lang: 'zh_CN',
            success: (res) => {
                console.log("wx.getUserProfile res", res);
                wx.login({
                    timeout: 5000,
                }).then(_r => {
                    console.log(_r);
                    wx.request({
                        url: `${app.globalData.baseUrl}/wx/login`,
                        data: {
                            code: _r.code
                        },
                        success: (_res => {
                            const {
                                result
                            } = _res.data
                            console.log(_res);
                            let userInfo = {
                                ...res.userInfo,
                                openId: result.openId
                            }
                            wx.setStorageSync('userInfo', userInfo)
                            app.globalData.userInfo = userInfo
                            app.globalData.hasUserInfo = true
                            wx.request({
                                url: app.globalData.baseUrl + '/wx/save',
                                data: userInfo,
                                method: 'POST',
                                success: (_res => {
                                    console.log("save _res", _res);
                                    console.log(wxChooseImage);
                                    return wxChooseImage(el, app, uploadSuccess)
                                })
                            })
                        }),
                        fail: (err => {
                            console.log(err);
                        })
                    })
                })

            }
        })
    } else {
        return wxChooseImage(el, app, uploadSuccess)
    }
}



module.exports = {
    chooseImg
}