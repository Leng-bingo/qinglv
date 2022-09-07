// pages/RiCheng/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hiddenTog: false,
        screenWidth: 1000,
        screenHeight: 1000,
        tianshu: '',
        userInfo: '',
        coupleInfo: '',
        API_root: getApp().globalData.API_URL,
        richeng: [],
        slideButtons: [
            {
                extClass: 'removeBtn',
                text: '删除',
                src: 'Images/icon_del.svg'
            }
        ],
        futureMissions: [],
        memmoryMissions: []
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
        // console.log(this.data)
    },

    //响应左划按钮事件[已经完成的事情]
    async slideButtonTaptop(element) {
        this.slideButtonTap(element, 'true')
    },

    async slideButtonTapDown(element) {
        this.slideButtonTap(element, 'false')
    },

    slideButtonTap(element, isUpper){
        //得到UI序号,为操作按钮的顺序
        const {
            index
        } = element.detail

        //根据序号获得任务
        const missionIndex = element.currentTarget.dataset.index
        if (isUpper === 'true') {
            var mission = this.data.memmoryMissions[missionIndex]
        } else if (isUpper === 'false') {
            var mission = this.data.futureMissions[missionIndex]
        }
        console.log(mission)
        if (index == 0) {
            wx.request({
                url: this.data.API_root + 'deleteMatter',
                method: 'GET',
                header: {
                    'Content-Type': 'application/json'
                },
                data: {
                    id: mission.id
                },
                success: function (res) {
                    console.log(res)
                }
            })

            if (isUpper === 'true') {
                this.data.memmoryMissions.splice(missionIndex, 1)
            } else if (isUpper === 'false') {
                this.data.futureMissions.splice(missionIndex, 1)
            } 

            this.setData({
                memmoryMissions: this.data.memmoryMissions,
                futureMissions: this.data.futureMissions

            })
        }
    },

    //将日程划分为：纪念日，未来日
    filterMission() {
        let missionList = this.data.richeng
        this.setData({
            futureMissions: missionList.filter(item => item.do === '0'),
            memmoryMissions: missionList.filter(item => item.do === '1')
        })
        this.doFuture()
        this.doMemory()
    },

    doFuture() {
        var nowDate = this.formatDateTime()
        this.data.futureMissions.forEach((item, index) => {
            // console.log(item, index)
            this.setData({
                ["futureMissions[" + index + "].date"]: item.date.slice(0, 4) + '年' + item.date.slice(5, 7) + '月' + item.date.slice(8, 10) + '日',
                ["futureMissions[" + index + "].chazhi"]: this.GetNumberOfDays(nowDate, item.date.slice(0, 10))
            })
        });
    },

    doMemory() {
        var nowDate = this.formatDateTime()
        this.data.memmoryMissions.forEach((item, index) => {
            this.setData({
                ["memmoryMissions[" + index + "].date"]: item.date.slice(0, 4) + '年' + item.date.slice(5, 7) + '月' + item.date.slice(8, 10) + '日',
                ["memmoryMissions[" + index + "].chazhi"]: this.GetNumberOfDays(item.date.slice(0, 10), nowDate)
            })
        });

    },

    GetNumberOfDays(date1, date2) { //获得天数
        //date1：开始日期，date2结束日期
        var a1 = Date.parse(new Date(date1));
        var a2 = Date.parse(new Date(date2));
        var day = parseInt((a2 - a1) / (1000 * 60 * 60 * 24)); //核心：时间戳相减，然后除以天数
        return day
    },

    formatDateTime() {
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        minute = minute < 10 ? ('0' + minute) : minute;
        return y + '-' + m + '-' + d;
    },

    toAddRicheng() {
        wx.navigateTo({
            url: '/pages/RiChengAdd/index',
        })
    },

    searchMatter() {
        var that = this
        var uuu = that.data.API_root + 'searchMatter'
        wx.request({
            url: uuu,
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            data: {
                openID: that.data.userInfo.openID,
                coupleID: that.data.userInfo.spouseOpenID
            },
            success: function (res) {
                console.log(res.data.mysql)
                that.setData({
                    richeng: res.data.mysql
                })
                that.filterMission()
                // if (res.data.mysql == 1) {
                //     wx.showToast({
                //         title: '添加成功',
                //         icon: 'success',
                //         duration: 1500
                //     })
                // } else {
                //     wx.showToast({
                //         title: '添加失败',
                //         icon: 'error',
                //         duration: 1000
                //     })
                //     return
                // }
            }
        })
        // setTimeout(function () {
        //     wx.navigateBack()
        // }, 300)
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

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
        this.getScreenSize()
        this.getID()
        this.searchMatter()
    },

    //获取页面大小
    async getScreenSize() {
        wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    screenWidth: res.windowWidth,
                    screenHeight: res.windowHeight
                })
            }
        })
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