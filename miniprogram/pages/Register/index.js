const md5 = require('../../utils/md5');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        current: 1,
        codeText: '获取验证码',
        counting: false,
        phoneNumber: '',
        email: '',
        firstSerect: '',
        secondSerect: '',
        code: '',
        userOpenID: '',
        login_number: '',
        login_serect: '',
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

    //获取用户当前openid，并且进行缓存
    async setOpenid() {
        var openid = await getApp().get_OpenID()
        try {
            wx.setStorageSync('userOpenid', openid)
        } catch (e) {
            console.log(e)
        }

        this.setData({
            userOpenID: openid
        })
        console.log('成功缓存用户openid:', openid)
    },
    //判断是否存在用户
    userExist() {
        // console.log(getApp().globalData.userOpenID)
        var that = this
        var uuu = that.data.API_root + 'isUserExist'
        wx.request({
            url: uuu,
            method: 'GET',
            header: {
                'Content-Type': 'application/json'
            },
            data: {
                email: that.data.email,
            },
            success: function (res) {
                if (res.data.data == 1) {
                    console.log('该邮箱已经注册，请登录或点击忘记密码')
                    wx.showModal({
                        title: '提示',
                        content: '该邮箱已被注册或目前使用微信已被人注册，请尝试登录、忘记密码。如被他人恶意注册，请联系管理员VX：Leng_bingo',
                        success(res) {
                            if (res.confirm) {
                                console.log('用户点击确定，跳转登录页面')
                                wx.redirectTo({
                                    url: '/pages/Register/index'
                                })
                            } else if (res.cancel) {
                                console.log('用户点击取消，该邮箱已经注册')
                            }
                        }
                    })
                } else {
                    that.getEmailCode()
                    wx.showToast({
                        title: '验证码已发送',
                    })
                    //开始倒计时60秒
                    that.countDown(that, 60);

                }
            },
            fail: function (res) {
                console.log('fail')
            }

        })
    },

    //获取验证码 
    getCode() {
        var that = this;
        try {
            var openid = wx.getStorageSync('userOpenid')
            if (openid) {
                that.setData({
                    userOpenID: openid
                })
            }
        } catch (e) {
            console.log(e)
        }
        // 验证手机号和邮箱正确性
        if (that.checkPhoneNumber(that.data.phoneNumber) && that.checkEmail(that.data.email)) {
            if (!that.data.counting) {
                that.userExist()
            }
        }

    },
    //倒计时60秒
    countDown(that, count) {
        if (count == 0) {
            that.setData({
                codeText: '获取验证码',
                counting: false
            })
            return;
        }
        that.setData({
            counting: true,
            codeText: count + '秒后重新获取',
        })
        setTimeout(function () {
            count--;
            that.countDown(that, count);
        }, 1000);
    },

    //检验邮箱
    inputEmail(e) {
        this.setData({
            email: e.detail.value
        })
    },
    checkEmail(email) {
        let str = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
        if (str.test(email)) {
            return true;
        } else {
            //提示邮箱格式不正确
            wx.showToast({
                title: '邮箱格式不正确',
                icon: 'error',
                // image: '/images/warn.png',
            })
            return false;
        }
    },

    // 登陆信息手机号/邮箱
    login_user(e) {
        this.setData({
            login_number: e.detail.value
        })
    },

    //打开忘记密码选项
    click_forget(e) {
        wx.navigateTo({
            url: '/pages/ForgetSerect/index'
        })
    },

    login_serect(e) {
        this.setData({
            login_serect: e.detail.value
        })
    },

    // 校验手机号
    inputPhoneNumber(e) {
        this.setData({
            phoneNumber: e.detail.value
        })
    },
    checkPhoneNumber(phoneNumber) {
        let str = /^1\d{10}$/
        if (str.test(phoneNumber)) {
            return true
        } else {
            wx.showToast({
                title: '手机号不正确',
                icon: 'error'
            })
            return false
        }

    },

    //校验密码复杂度
    inputSerect(e) {
        this.setData({
            firstSerect: e.detail.value
        })
    },
    checkSerect(firstSerect) {
        let str = /(?=.*[0-9])(?=.*[a-zA-Z]).{8,20}/
        if (str.test(firstSerect)) {
            return true
        } else {
            wx.showModal({
                title: '提示',
                content: '您的密码复杂度太低（密码中必须包含字母、数字），请重新修改密码！',
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
            return false
        }

    },

    inputSerect2(e) {
        this.setData({
            secondSerect: e.detail.value
        })
    },
    checkSerect2(firstSerect, secondSerect) {
        if (firstSerect == secondSerect) {
            return true
        } else {
            wx.showToast({
                title: '两次密码不同',
                icon: 'error'
            })
            return false
        }
    },

    //验证验证码，并将验证码存入数据库
    getEmailCode() {
        var uuu = this.data.API_root + 'getEmailCode'
        if (this.checkPhoneNumber(this.data.phoneNumber) &&
            this.checkEmail(this.data.email)
        ) {
            wx.request({
                url: uuu,
                method: 'GET',
                header: {
                    'Content-Type': 'application/json'
                },
                data: {
                    openID: this.data.userOpenID,
                    to_email: this.data.email
                },
                success: function (ress) {
                    console.log(ress)
                },
                fail: function (ress) {
                    console.log('fail')
                }
            })
        }
    },

    //注册新用户
    zhuce() {
        if (this.checkPhoneNumber(this.data.phoneNumber) &&
            this.checkEmail(this.data.email)
        ) {
            if (this.data.code.length != 6) {
                //提示应该输入验证码
                wx.showToast({
                    title: '输入6位验证码',
                    icon: 'error',
                })
                return
            }
        } else {
            wx.showToast({
                title: '请获取验证码',
                icon: 'error',
            })
            return
        }

        if (this.data.firstSerect == '') {
            //提示应该输入密码
            wx.showToast({
                title: '请输入密码',
                icon: 'error',
            })
            return
        } else {
            if (!this.checkSerect(this.data.firstSerect)) {
                return
            }
        }

        if (this.data.secondSerect == '') {
            //提示应该输入密码
            wx.showToast({
                title: '请确认密码',
                icon: 'error',
            })
            return
        } else {
            if (!this.checkSerect2(this.data.firstSerect, this.data.secondSerect)) {
                return
            }
        }

        var submit = this.data.API_root + 'verify_code'
        wx.request({
            url: submit,
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                // openID: this.data.userOpenID,
                openID: this.data.userOpenID,
                phoneNumber: this.data.phoneNumber,
                email: this.data.email,
                emailCode: this.data.code,
                firstSerect: md5.hexMD5(this.data.firstSerect)
            },
            success: function (ress) {
                if (ress.data.mysql == 1) {
                    wx.showModal({
                        title: '提示',
                        content: '感谢注册爱情杂货铺，点击跳转登陆界面！',
                        success: function (res) {
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/Register/index'
                                })

                                console.log('用户点击确定')
                            } else if (res.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                } else if (ress.data.mysql == 0) {
                    wx.showModal({
                        title: '提示',
                        content: '请检查网络或稍后再试！',
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定')
                            } else if (res.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                }


            },
            fail: function (ress) {
                console.log('fail')
            }
        })
    },

    // 成功登陆后，缓存用户信息。
    login() {
        var _this = this
        // 正则表达式检测
        if (!_this.checkEmail(this.data.login_number)) {
            console.log('请输入邮箱')
            return
        }
        if (_this.data.login_serect == '') {
            wx.showToast({
                title: '请输入密码',
                icon: 'error',
            })
            return
        }
        var submit_login = this.data.API_root + 'login'
        wx.request({
            url: submit_login,
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            data: {
                openID: this.data.userOpenID,
                email: this.data.login_number,
                firstSerect: md5.hexMD5(this.data.login_serect)
            },
            success: function (res) {
                if (res.data.mysql.length == 1) {
                    try {
                        wx.setStorageSync('userInfo', res.data.mysql[0])
                    } catch (e) {
                        console.log(e)
                    }
                    wx.switchTab({
                        url: '../My/index'
                    })

                } else if (res.data.mysql.length == 0) {
                    wx.showModal({
                        title: '提示',
                        content: '密码错误或账号输入错误，如没有账号请点击注册',
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定,密码错误或账号输入错误')
                            } else if (res.cancel) {
                                console.log('用户点击取消,密码错误或账号输入错误')
                            }
                        }
                    })

                    return
                } else {
                    wx.showToast({
                        title: '请检查网络',
                        icon: 'error',
                    })
                    return
                }
            },
            fail: function (res) {
                wx.showToast({
                    title: '请检查网络',
                    icon: 'error',
                })
            }
        })
    },




    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        //页面加载时，获取当前缓存的用户openid
        try {
            var userOpenid = wx.getStorageSync('userOpenid')
            if (userOpenid) {
                this.setData({
                    userOpenID: userOpenid
                })
            }
        } catch (e) {
            console.log('错误为：', e)
            console.log('没有获取到缓存用户openid，重启一下试试～')
            wx.showModal({
                title: '有点小问题，但不大',
                content: '重启小程序试试吧～',
                success(res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.setOpenid()
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