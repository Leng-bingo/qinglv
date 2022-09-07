// pages/My/my.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        API_root: getApp().globalData.API_URL,
        userOpenID: '',
        // 用户所有信息
        userInfo: '',
        coupleOpenID: '',
        coupleInfo: ''
    },

    // 跳转绑定另一半页面
    bindCouple() {
        wx.navigateTo({
            url: '/pages/BindCouple/index'
        })
    },

    // 跳转反馈页面
    toFankui() {
        wx.navigateTo({
            url: '/pages/Fankui/index'
        })
    },
    
    // 跳转修改信息页面
    toChangeUserInfo(){
        wx.navigateTo({
            url: '/pages/ChangeUserInfo/index'
        })
    },

    // 清除缓存
    toClearStorage() {
        wx.showModal({
            title: '想清楚哟～',
            content: '点击确定清除缓存！',
            success(res) {
                if (res.confirm) {
                    console.log('用户点击确定清除缓存')
                    try {
                        wx.clearStorageSync()
                    } catch (e) {
                        // Do something when catch error
                    }
                    wx.switchTab({
                        url: '/pages/MainPage/index'
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消，不清除缓存了')
                }
            }
        })

    },

    //读取另一半的详细信息
    getAnotherInfo() {
        var that = this

        var submit = that.data.API_root + 'getuserInfo'
        wx.request({
            url: submit,
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            data: {
                openID: that.data.coupleOpenID
            },
            success: function (ress) {
                try {
                    wx.setStorageSync('coupleInfo', ress.data.data[0])
                    that.setData({
                        coupleInfo: ress.data.data[0]
                    })
                } catch (e) {
                    console.log(e)
                }
            },
            fail: function (ress) {}
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {



    },

    onShow() {
        // 如果有缓存，加载缓存
        // 如果没有缓存，弹出登陆注册界面
        var that = this
        var userinfo = wx.getStorageSync('userInfo')
        if (userinfo != null && userinfo != '') {
            // 判断是否存在coupleOpenID
            if (userinfo.spouseOpenID != null) {
                that.setData({
                    coupleOpenID: userinfo.spouseOpenID
                })
                try {
                    wx.setStorageSync('coupleOpenID', userinfo.spouseOpenID)
                } catch (e) {
                    console.log(e)
                }
                that.getAnotherInfo()
            } else {
                try {
                    var value = wx.getStorageSync('coupleOpenID')
                    if (value) {
                        that.setData({
                            coupleOpenID: value
                        })
                        that.getAnotherInfo()
                    }
                } catch (e) {
                    console.log(e)
                }
            }

            that.setData({
                userOpenID: userinfo.openID,
                userInfo: userinfo
            })
            console.log(that.data)
        } else {
            wx.showModal({
                title: '还没有登录呦～',
                content: '点击确定进入登陆界面',
                success(res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                        wx.navigateTo({
                            url: '/pages/Register/index'
                        })
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
        }
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