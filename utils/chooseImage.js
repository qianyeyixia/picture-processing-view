function chooseImg(el, app, uploadSuccess) {
    wx.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
    }).then(res => {
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
                el.setData({
                    imgSrc: `data:image/png;base64,${_data.result}`,
                });
                // app.globalData.imgaeSrc = el.data.imgSrc
            },
            fail: (res) => {
                console.log("fail res", res);
            },
        });
        uploadTask.onProgressUpdate((t) => {
            console.log("上传进度", t.progress);
            if (res.progress == 100) {
                uploadSuccess({...t,...res})
            }
            console.log("已经上传的数据长度", t.totalBytesSent);
            console.log("预期需要上传的数据总长度", t.totalBytesExpectedToSend);
        });
    })
}








module.exports = {
    chooseImg
}