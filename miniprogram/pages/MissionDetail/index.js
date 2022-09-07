Page({
    // 保存任务的 _id 和详细信息
    data: {
        _id: '',
        mission: null,
        dateStr: '',
        timeStr: '',
        whoDo: 0,
        creditPercent: 0,

        userInfo: '',
        coupleInfo: '',
        maxCredit: getApp().globalData.maxCredit,
        list: getApp().globalData.collectionMissionList,
        API_root: getApp().globalData.API_URL,
    },

    onLoad(options) {
        // 保存上一页传来的 _id 字段，用于查询任务
        if (!!options.id) {
            this.setData({
                _id: options.id
            })
        }
        this.getID()

        var that = this
        if (that.data._id.length > 0) {
            // 根据 _id 拿到任务
            wx.request({
                url: that.data.API_root + 'getMissionDetail',
                method: 'GET',
                header: {
                    'Content-Type': 'application/json'
                },
                data: {
                    _id: that.data._id
                },
                success: function (res) {
                    console.log(typeof(res.data.mysql[0].date))
                    that.setData({
                        mission: res.data.mysql[0],
                        whoDo: res.data.mysql[0].doPeople,
                        // dateStr: that.getDate(res.data.mysql[0].date).toDateString(),
                        // timeStr: that.getDate(res.data.mysql[0].date).toTimeString(),
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


    },

    getDate(dateStr) {
        const milliseconds = Date.parse(dateStr)
        const date = new Date()
        date.setTime(milliseconds)
        return date
    },


    // 根据 _id 值查询并显示任务
    async onShow() {
        // var that = this
        // if (that.data._id.length > 0) {
        //     // 根据 _id 拿到任务
        //     wx.request({
        //         url: that.data.API_root + 'getMissionDetail',
        //         method: 'GET',
        //         header: {
        //             'Content-Type': 'application/json'
        //         },
        //         data: {
        //             _id: that.data._id
        //         },
        //         success: function (res) {
        //             that.setData({
        //                 mission: res.data.mysql[0],
        //                 whoDo: res.data.mysql[0].doPeople,
        //                 dateStr: that.getDate(res.data.mysql[0].date).toDateString(),
        //                 timeStr: that.getDate(res.data.mysql[0].date).toTimeString(),
        //                 creditPercent: (res.data.mysql[0].credit / getApp().globalData.maxCredit) * 100,
        //             })
        //             console.log(that.data)
        //         },
        //         fail: function (res) {
        //             console.log(res)
        //         }
        //     })
        // }
    },
})