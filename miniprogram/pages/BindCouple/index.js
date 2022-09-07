const md5 = require('../../utils/md5');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        current: 1,
        codeText: '获取验证码',
        counting: false,
        inputID: '',
        userOpenID: '',
        API_root: getApp().globalData.API_URL,
        forget: false
    },
    // 登陆注册监听
    click(e) {
        let index = e.currentTarget.dataset.code;
        this.setData({
            current: index,
            forget: false
        })
    },

    inputCode(e) {
        this.setData({
            code: e.detail.value
        })
    },

    // 登陆信息手机号/邮箱
    login_user(e) {
        this.setData({
            login_number: e.detail.value
        })
    },


    // 校验手机号
    inputPhoneNumber(e) {
        this.setData({
            phoneNumber: e.detail.value
        })
        console.log(this.data.phoneNumber)
    },

    inputID(e) {
        this.setData({
            inputID: e.detail.value
        })
    },

    //立即绑定
    bind() {
        var that = this
        if (that.data.phoneNumber == '') {
            wx.showToast({
                title: '请输入ID号',
                icon: 'error',
            })
            return
        }
        var submit = that.data.API_root + 'bind_another'        
        wx.request({
            url: submit,
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                userOpenID: that.data.userOpenID,
                inputID: that.data.inputID
            },
            success: function (ress) {
                if (ress.data.mysql == true) {
                    wx.showModal({
                        title: '提示',
                        content: '绑定另一半成功，点击跳转我的界面～',
                        success: function (res) {
                            if (res.confirm) {
                                try {
                                    wx.setStorageSync('coupleOpenID', that.data.inputID)
                                } catch (e) {
                                    console.log(e)
                                }
                                wx.navigateBack({
                                    delta: 1
                                })
                            } else if (res.cancel) {
                                console.log('用户点击取消,修改密码成功')
                            }
                        }
                    })
                } else if (ress.data.mysql == false) {
                    wx.showModal({
                        title: '提示',
                        content: '请检查ID号是否正确！',
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定,请检查网络')
                            } else if (res.cancel) {
                                console.log('用户点击取消,请检查网络')
                            }
                        }
                    })
                }
            },
            fail: function (ress) {
                console.log('fail')
                wx.showModal({
                    title: '提示',
                    content: '请检查网络或稍后重试！',
                    success: function (res) {
                        if (res.confirm) {
                            console.log('用户点击确定,请检查网络')
                        } else if (res.cancel) {
                            console.log('用户点击取消,请检查网络')
                        }
                    }
                })
            }
        })

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {},

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        try {
            var openid = wx.getStorageSync('userOpenid')
            if (openid) {
                this.setData({
                    userOpenID: openid
                })
            }
            console.log(this.data.userOpenID)
        } catch (e) {
            console.log(e)
        }
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
    onShareAppMessage: function (res) {
        //可以先看看页面数据都有什么，得到你想要的数据
        var shareData = this.data
        console.log(shareData)

        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline'],
        })

        // if (res.from === 'button') {
        //   // 来自页面内转发按钮
        //   return {
        //     title: "标题",
        //     desc: "描述2",
        //     imageUrl: "分享要显示的图片，如果不设置就会默认截图当前页面的图片",
        //     path: '/page/test_details/test_d?housesid=' + 123,
        //   }
        // }

        // return {
        //   title: "爱情杂货铺",
        //   desc: "登陆/注册",
        //   imageUrl: "分享要显示的图片，如果不设置就会默认截图当前页面的图片",
        //   path: '../../../Pics/Animation.gif',

        //   success: function (res) {
        //     // 转发成功
        //     console.log("转发成功:" + JSON.stringify(res));
        //   },
        //   fail: function (res) {
        //     // 转发失败
        //     console.log("转发失败:" + JSON.stringify(res));
        //   }
        // }

    },


})