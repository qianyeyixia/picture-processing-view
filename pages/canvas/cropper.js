// pages/canvas/cropper.js

const app = getApp()
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		imgSrc: "../../images/frame/frame11.png",
		width: 250, //宽度
		height: 250, //高度
		max_width: 300,
		max_height: 300,
		disable_rotate: false, //是否禁用旋转
		disable_ratio: false, //锁定比例
		limit_move: false, //是否限制移动
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (c) {
		this.cropper = this.selectComponent("#image-cropper");
		console.log(c, !!c.imgSrc)
		if (c.imgSrc === "null" || c.imgSrc === "undefined") {
			this.cropper.upload(); //上传图片
		} else {
			this.setData({
				imgSrc: c.imgSrc
			})
		}
	},
	clickcut(e) {
		console.log(e.detail);
		wx.previewImage({
			current: e.detail.url, // 当前显示图片的http链接
			urls: [e.detail.url], // 需要预览的图片http链接列表
		});
	},
	cropperload(e) {
		console.log("cropper初始化完成");
	},
	loadimage(e) {
		wx.hideLoading();
		console.log('图片');
		this.cropper.imgReset();
	},
	upload() {
		let that = this;
		wx.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success(res) {
				wx.showLoading({
					title: '加载中',
				})
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
						that.setData({
							imgSrc: `data:image/png;base64,${_data.result}`,
						});
						app.globalData.imgaeSrc = that.data.imgSrc
					},
					fail: (res) => {
						console.log("fail res", res);
					},
				});
				uploadTask.onProgressUpdate((res) => {
					console.log("上传进度", res.progress);
					console.log("已经上传的数据长度", res.totalBytesSent);
					console.log("预期需要上传的数据总长度", res.totalBytesExpectedToSend);
				});
				//重置图片角度、缩放、位置
				that.cropper.imgReset();
			}
		})
	},
	setWidth(e) {
		this.setData({
			width: e.detail.value < 10 ? 10 : e.detail.value
		});
		this.setData({
			cut_left: this.cropper.data.cut_left
		});
	},
	setHeight(e) {
		this.setData({
			height: e.detail.value < 10 ? 10 : e.detail.value
		});
		this.setData({
			cut_top: this.cropper.data.cut_top
		});
	},
	switchChangeDisableRatio(e) {
		//设置宽度之后使剪裁框居中
		this.setData({
			disable_ratio: e.detail.value
		});
	},
	setCutTop(e) {
		this.setData({
			cut_top: e.detail.value
		});
		this.setData({
			cut_top: this.cropper.data.cut_top
		});
	},
	setCutLeft(e) {
		this.setData({
			cut_left: e.detail.value
		});
		this.setData({
			cut_left: this.cropper.data.cut_left
		});
	},
	switchChangeDisableRotate(e) {
		//开启旋转的同时不限制移动
		if (!e.detail.value) {
			this.setData({
				limit_move: false,
				disable_rotate: e.detail.value
			});
		} else {
			this.setData({
				disable_rotate: e.detail.value
			});
		}
	},
	switchChangeLimitMove(e) {
		//限制移动的同时锁定旋转
		if (e.detail.value) {
			this.setData({
				disable_rotate: true
			});
		}
		this.cropper.setLimitMove(e.detail.value);
	},
	switchChangeDisableWidth(e) {
		this.setData({
			disable_width: e.detail.value
		});
	},
	switchChangeDisableHeight(e) {
		this.setData({
			disable_height: e.detail.value
		});
	},
	submit() {
		this.cropper.getImg((obj) => {
			console.log("obje", obj)
			app.globalData.imgSrc = obj.url;
			wx.navigateBack({
				delta: -1
			})
		});
	},
	rotate() {
		//在用户旋转的基础上旋转90°
		this.cropper.setAngle(this.cropper.data.angle += 90);
	},
	top() {
		this.data.top = setInterval(() => {
			this.cropper.setTransform({
				y: -3
			});
		}, 1000 / 60)
	},
	bottom() {
		this.data.bottom = setInterval(() => {
			this.cropper.setTransform({
				y: 3
			});
		}, 1000 / 60)
	},
	left() {
		this.data.left = setInterval(() => {
			this.cropper.setTransform({
				x: -3
			});
		}, 1000 / 60)
	},
	right() {
		this.data.right = setInterval(() => {
			this.cropper.setTransform({
				x: 3
			});
		}, 1000 / 60)
	},
	narrow() {
		this.data.narrow = setInterval(() => {
			this.cropper.setTransform({
				scale: -0.02
			});
		}, 1000 / 60)
	},
	enlarge() {
		this.data.enlarge = setInterval(() => {
			this.cropper.setTransform({
				scale: 0.02
			});
		}, 1000 / 60)
	},
	end(e) {
		clearInterval(this.data[e.currentTarget.dataset.type]);
	},
})