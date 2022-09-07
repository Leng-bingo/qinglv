Page({
    // 保存物品的 _id 和详细信息
    data: {
        _id: '',
        item: null,
        dateStr: '',
        timeStr: '',
        creditPercent: 0,
        maxCredit: getApp().globalData.maxCredit,

        userInfo: '',
        coupleInfo: '',
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

    onLoad(options) {
        // 保存上一页传来的 _id 字段，用于查询物品
        console.log(options)
        this.getID()
        if (options.id !== undefined) {
            this.setData({
                _id: options.id
            })
        }
    },

    getDate(dateStr) {
        const milliseconds = Date.parse(dateStr)
        const date = new Date()
        date.setTime(milliseconds)
        return date
    },

    // 根据 _id 值查询并显示物品
    async onShow() {
        var that = this
        if (that.data._id.length > 0) {
            // 根据 _id 拿到物品
            wx.request({
                url: that.data.API_root + 'getStrogeDetail',
                method: 'GET',
                header: {
                    'Content-Type': 'application/json'
                },
                data: {
                    _id: that.data._id
                },
                success: function (res) {
                    console.log(res.data.mysql[0])
                    that.setData({
                        item: res.data.mysql[0],
                        dateStr: res.data.mysql[0].date.slice(0,10),
                        timeStr: res.data.mysql[0].date.slice(11,20),
                        creditPercent: (res.data.mysql[0].credit / getApp().globalData.maxCredit) * 100,
                    })
                },
                fail: function (res) {
                    console.log(res)
                }
            })
        }
    },
})