Page({
    //保存正在编辑的商品
    data: {
        title: '',
        desc: '',
        doPeopleIndex: 1,
        credit: 10,
        maxCredit: getApp().globalData.maxCredit,
        presetIndex: 0,

        API_root: getApp().globalData.API_URL,
        userOpenID: getApp().globalData.userOpenID,
        userInfo: '',
        coupleInfo: '',

        presets: [{
            name: "无预设",
            title: "",
            desc: "",
        }, {
            name: "薯片",
            title: "美味薯片",
            desc: "诱人的零食，夜宵绝佳伴侣，咔嘣脆！凭此商品可以向对方索要薯片。",
        }, {
            name: "奶茶券",
            title: "奶茶权限",
            desc: "凭此券可以向对方索要一杯奶茶。",
        }, {
            name: "夜宵券",
            title: "夜宵放开闸",
            desc: "凭此券可以让自己在夜里狂野干饭。",
        }, {
            name: "洗碗券",
            title: "洗碗券",
            desc: "凭此券可以让对方洗碗一次！若都有洗碗券则互相抵消。",
        }, {
            name: "做家务",
            title: "家务券",
            desc: "凭此券可以让对方做一次轻型家务，比如扔垃圾，打扫一个的房间，领一天外卖什么的。",
        }, {
            name: "不赖床",
            title: "早起券",
            desc: "凭此券可以让对方早起床一次。熬夜对身体很不好，还是要早点睡觉第二天才能有精神！",
        }, {
            name: "做运动",
            title: "减肥券",
            desc: "凭此券可以逼迫对方做一次运动，以此来达到减肥维持健康的目的。",
        }, {
            name: "给饭吃",
            title: "饭票",
            desc: "凭此券可以让对方做一次或请一次饭，具体视情况而定。",
        }, {
            name: "买小礼物",
            title: "小礼物盒",
            desc: "凭此券可以让对方买点小礼物，像泡泡马特什么的。",
        }, {
            name: "跑腿",
            title: "跑腿召唤",
            desc: "凭此券可以让对方跑腿一天，拿外卖，拿零食，开空调，开电视，在所不辞。",
        }],
        list: getApp().globalData.collectionMarketList,
    },

    //数据输入填写表单
    onTitleInput(e) {
        this.setData({
            title: e.detail.value
        })
    },
    onDescInput(e) {
        this.setData({
            desc: e.detail.value
        })
    },
    onCreditInput(e) {
        this.setData({
            credit: e.detail.value
        })
    },
    onPresetChange(e) {
        this.setData({
            presetIndex: e.detail.value,
            title: this.data.presets[e.detail.value].title,
            desc: this.data.presets[e.detail.value].desc,
        })
    },

    onShow() {
        this.getID()
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

    //保存商品
    async saveItem() {
        // 对输入框内容进行校验
        // console.log(this.data)
        if (this.data.userInfo.openID != '' && this.data.userInfo.openID != null && this.data.userInfo.openID != undefined) {
            if (this.data.title === '') {
                wx.showToast({
                    title: '标题未填写',
                    icon: 'error',
                    duration: 2000
                })
                return
            }
            if (this.data.title.length > 12) {
                wx.showToast({
                    title: '标题过长',
                    icon: 'error',
                    duration: 2000
                })
                return
            }
            if (this.data.desc.length > 100) {
                wx.showToast({
                    title: '描述过长',
                    icon: 'error',
                    duration: 2000
                })
                return
            }
            if (this.data.credit <= 0) {
                wx.showToast({
                    title: '一定要有积分',
                    icon: 'error',
                    duration: 2000
                })
                return
            } else {
                wx.request({
                    url: this.data.API_root + 'addMarket',
                    method: 'POST',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                        openID: this.data.userInfo.openID,
                        title: this.data.title,
                        credit: this.data.credit,
                        descc: this.data.desc
                    },
                    success: function (res) {
                        console.log(res)
                        if (res.data.mysql == 1) {
                            wx.showToast({
                                title: '添加成功',
                                icon: 'success',
                                duration: 1500
                            })
                        } else {
                            wx.showToast({
                                title: '添加失败',
                                icon: 'error',
                                duration: 1000
                            })
                            return
                        }
                    }
                })
                setTimeout(function () {
                    wx.navigateBack()
                }, 500)
            }
        } else {
            wx.showToast({
                title: '出了点问题',
                icon: 'error',
                duration: 2000
            })
            return
        }


    },



    userExist() {
        // console.log(getApp().globalData.userOpenID)
        var uuu = this.data.API_root + 'isUserExist'
        wx.request({
            url: uuu,
            method: 'GET',
            header: {
                'Content-Type': 'application/json'
            },
            data: {
                openid: this.data.userOpenID
                // openid: open
            },
            success: function (res) {
                console.log('然后判断用户是否存在', res.data)
                // getApp().globalData.userOpenID = ress.data.openid
                // console.log(getApp().globalData.userOpenID)
            },
            fail: function (res) {
                console.log('fail')
            }

        })
    },


    // 重置所有表单项
    resetItem() {
        // this.userExist()
        this.setData({
            title: '',
            desc: '',
            credit: 0,
            presetIndex: 0,
            list: getApp().globalData.collectionMarketList,
        })
    }
})