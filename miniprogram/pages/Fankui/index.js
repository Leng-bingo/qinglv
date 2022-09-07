// pages/Fankui/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: '',
        coupleInfo: '',
        desc: '',
        phone: '',
        API_root: getApp().globalData.API_URL,
    },

    getID() {
        var that = this
        try {
            var value = wx.getStorageSync('userInfo')
            if (value) {
                that.setData({
                    userInfo: value
                })
            }
        } catch (e) {
            console.log(e)
        }

        try {
            var value = wx.getStorageSync('coupleInfo')
            if (value) {
                that.setData({
                    coupleInfo: value
                })
            }
        } catch (e) {
            console.log(e)
        }
        console.log(this.data)
    },
    onDescInput(e) {
        this.setData({
            desc: e.detail.value
        })
    },
    onCreditInput(e) {
        this.setData({
            phone: e.detail.value
        })
    },

    // nodejs保存任务
    async node_saveMission() {

        if (this.data.value === '') {
            wx.showToast({
                title: '意见未填写',
                icon: 'error',
                duration: 2000
            })
            return
        }

        if (this.data.phone === '') {
            wx.showToast({
                title: '方式未填写',
                icon: 'error',
                duration: 2000
            })
            return
        }

        if (this.data.userInfo.openID != null && this.data.userInfo.openID != '') {
            var uuu = this.data.API_root + 'getFankui'
            wx.request({
                url: uuu,
                method: 'GET',
                header: {
                    'content-type': 'application/json'
                },
                data: {
                    openID: this.data.userInfo.openID,
                    from: this.data.phone,
                    message: this.data.desc
                },
                success: function (res) {
                    if (res.data.data) {
                        wx.showToast({
                            title: '发送成功',
                            icon: 'success',
                            duration: 1500
                        })
                    } else {
                        wx.showToast({
                            title: '发送失败',
                            icon: 'error',
                            duration: 1000
                        })
                        return
                    }
                }
            })
        } else {
            wx.showToast({
                title: '请登录',
                icon: 'error',
                duration: 1000
            })
            return
        }
    },

    // 重置所有表单项
    resetMission() {
        this.setData({
            phone: '',
            desc: ''
        })
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.getID()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})