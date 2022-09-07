Page({
    data: {
        screenWidth: 1000,
        screenHeight: 1000,

        search: "",

        doPeople: 0,
        whoDo: 0,

        allMissions: [],
        unfinishedMissions: [],
        finishedMissions: [],
        tocheckMissions: [],

        API_root: getApp().globalData.API_URL,
        userOpenID: '',
        userInfo: '',
        coupleInfo: '',

        slideButtons: [{
                extClass: 'markBtn',
                text: '标记',
                src: "Images/icon_mark.svg"
            },
            {
                extClass: 'starBtn',
                text: '星标',
                src: "Images/icon_star.svg"
            },
            {
                extClass: 'removeBtn',
                text: '删除',
                src: 'Images/icon_del.svg'
            }
        ],
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

    updateUserData() {
        var that = this
        var submit = that.data.API_root + 'getuserInfo'
        wx.request({
            url: submit,
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            data: {
                openID: that.data.userInfo.openID
            },
            success: function (ress) {
                try {
                    wx.setStorageSync('userInfo', ress.data.data[0])
                    that.setData({
                        userInfo: ress.data.data[0]
                    })
                } catch (e) {
                    console.log(e)
                }
            },
            fail: function (ress) {}
        })
    },

    //页面加载时运行
    async onShow() {
        this.getID()
        this.updateUserData()
        var uuu = this.data.API_root + 'getList'
        var that = this
        wx.request({
            url: uuu,
            data: {
                openID: that.data.userInfo.openID
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (ress) {
                that.setData({
                    allMissions: ress.data.mysql
                })
                // console.log(that.data.allMissions)
                that.filterMission()
                that.getScreenSize()
            },
        })
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

    //转到任务详情
    async toDetailPage(element, isUpper) {
        const missionIndex = element.currentTarget.dataset.index
        if (isUpper === 'true') {
            var mission = this.data.unfinishedMissions[missionIndex]
        } else if (isUpper === 'false') {
            var mission = this.data.finishedMissions[missionIndex]
        } else if (isUpper === 'check') {
            var mission = this.data.tocheckMissions[missionIndex]
        }

        wx.navigateTo({
            url: '../MissionDetail/index?id=' + mission._id
        })
    },
    //转到任务详情[check]
    async toDetailPageCheck(element) {
        this.toDetailPage(element, 'check')
    },
    //转到任务详情[上]
    async toDetailPageUpper(element) {
        this.toDetailPage(element, 'true')
    },
    //转到任务详情[下]
    async toDetailPageLower(element) {
        this.toDetailPage(element, 'false')
    },
    //转到添加任务
    async toAddPage() {
        wx.navigateTo({
            url: '../MissionAdd/index'
        })
    },

    //设置搜索
    onSearch(element) {
        this.setData({
            search: element.detail.value
        })

        this.filterMission()
    },

    //将任务划分为：完成，未完成
    filterMission() {
        let missionList = []
        if (this.data.search != "") {
            for (let i in this.data.allMissions) {
                if (this.data.allMissions[i].title.match(this.data.search) != null) {
                    missionList.push(this.data.allMissions[i])
                }
            }
        } else {
            missionList = this.data.allMissions
        }

        this.setData({
            unfinishedMissions: missionList.filter(item => item.available === 'true' && item.tocheck === 'false'),
            finishedMissions: missionList.filter(item => item.available === 'false'),
            tocheckMissions: missionList.filter(item => item.tocheck === 'true')
        })
    },

    //响应左划按钮事件[待审核]
    async slideButtonTapcheck(element) {
        this.slideButtonTap(element, 'check')
    },

    //响应左划按钮事件[上]
    async slideButtonTapUpper(element) {
        this.slideButtonTap(element, 'true')
    },

    //响应左划按钮事件[下]
    async slideButtonTapLower(element) {
        this.slideButtonTap(element, 'false')
    },

    //响应左划按钮事件逻辑
    async slideButtonTap(element, isUpper) {
        //得到UI序号,为操作按钮的顺序
        const {
            index
        } = element.detail

        //根据序号获得任务
        const missionIndex = element.currentTarget.dataset.index
        if (isUpper === 'true') {
            var mission = this.data.unfinishedMissions[missionIndex]
        } else if (isUpper === 'false') {
            var mission = this.data.finishedMissions[missionIndex]
        } else if (isUpper === 'check') {
            var mission = this.data.tocheckMissions[missionIndex]
        }

        //处理完成点击事件
        if (index === 0) {
            if (isUpper === 'true') {
                this.finishMission(element)
            } else if (isUpper === 'check') {
                this.checkMission(element)
            } else {
                wx.showToast({
                    title: '任务已经完成',
                    icon: 'error',
                    duration: 2000
                })
            }
            // 处理自己发布的任务
        } else if (mission.openID === this.data.userInfo.openID) {
            //处理星标按钮点击事件
            if (index === 1) {
                if (mission.star == 'false') {
                    mission.star = 'true'
                } else {
                    mission.star = 'false'
                }
                wx.request({
                    url: this.data.API_root + 'editStar',
                    method: 'GET',
                    header: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        _id: mission._id,
                        start_value: mission.star
                    },
                    success: function (res) {
                        console.log(res)
                    }
                })

                //更新本地数据
                this.filterMission()
            }

            //处理删除按钮点击事件
            else if (index === 2) {

                wx.request({
                    url: this.data.API_root + 'deleteElement',
                    method: 'GET',
                    header: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        _id: mission._id,
                    },
                    success: function (res) {
                        console.log(res)
                    }
                })


                if (isUpper === 'true') {
                    this.data.unfinishedMissions.splice(missionIndex, 1)
                } else if (isUpper === 'false') {
                    this.data.finishedMissions.splice(missionIndex, 1)
                } else if (isUpper === 'check') {
                    this.data.tocheckMissions.splice(missionIndex, 1)
                }

                //如果删除完所有事项，刷新数据，让页面显示无事项图片
                if (this.data.unfinishedMissions.length === 0 && this.data.finishedMissions.length === 0 && this.data.tocheckMissions.length === 0) {
                    this.setData({
                        allMissions: [],
                        unfinishedMissions: [],
                        finishedMissions: [],
                        tocheckMissions: []
                    })
                }
            }

            //触发显示更新
            this.setData({
                finishedMissions: this.data.finishedMissions,
                unfinishedMissions: this.data.unfinishedMissions,
                tocheckMissions: this.data.tocheckMissions

            })

            //如果编辑的不是自己的任务，显示提醒
        } else if (mission.openID != this.data.userInfo.openID) {
            //处理星标按钮点击事件
            if (index === 1) {
                if (mission.star == 'false') {
                    mission.star = 'true'
                } else {
                    mission.star = 'false'
                }
                wx.request({
                    url: this.data.API_root + 'editStar',
                    method: 'GET',
                    header: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        _id: mission._id,
                        start_value: mission.star
                    },
                    success: function (res) {
                        console.log(res)
                    }
                })
                //更新本地数据
                this.filterMission()
            }

            //处理删除按钮点击事件
            else if (index === 2) {
                //可以删除审核的任务
                if (isUpper === 'check') {
                    wx.request({
                        url: this.data.API_root + 'deleteElement',
                        method: 'GET',
                        header: {
                            'Content-Type': 'application/json'
                        },
                        data: {
                            _id: mission._id,
                        },
                        success: function (res) {
                            console.log(res)
                        }
                    })

                    //更新本地数据
                    this.data.tocheckMissions.splice(missionIndex, 1)
                    //如果删除完所有事项，刷新数据，让页面显示无事项图片
                    if (this.data.unfinishedMissions.length === 0 && this.data.finishedMissions.length === 0 && this.data.tocheckMissions.length === 0) {
                        this.setData({
                            allMissions: [],
                            unfinishedMissions: [],
                            finishedMissions: [],
                            tocheckMissions: []
                        })
                    }
                } else {
                    wx.showToast({
                        title: '不是自己的哟～',
                        icon: 'error',
                        duration: 2000
                    })
                }
            }

            //触发显示更新
            this.setData({
                finishedMissions: this.data.finishedMissions,
                unfinishedMissions: this.data.unfinishedMissions,
                tocheckMissions: this.data.tocheckMissions

            })
        } else {
            wx.showToast({
                title: '只能编辑自己的任务',
                icon: 'error',
                duration: 2000
            })
        }

    },

    //审核任务
    async checkMission(element) {
        //根据序号获得触发切换事件的待办
        const missionIndex = element.currentTarget.dataset.index
        const mission = this.data.tocheckMissions[missionIndex]
        // 审核自己要接受的任务
        var that = this
        if (mission.openID != that.data.userInfo.openID) {
            //审核对方任务
            var uuu = that.data.API_root + 'checkAvailable'
            wx.request({
                url: uuu,
                data: {
                    _id: mission._id,
                },
                header: {
                    'Content-Type': 'application/json'
                },
                success: function (ress) {
                    // console.log(ress)
                },
            })
            //触发显示更新
            mission.tocheck = 'false'
            that.filterMission()

            //显示提示
            wx.showToast({
                title: '审核完成',
                icon: 'success',
                duration: 2000
            })
        } else {
            wx.showToast({
                title: '不能自己审批',
                icon: 'error',
                duration: 2000
            })
        }

    },

    //完成任务
    async finishMission(element) {
        var that = this
        //根据序号获得触发切换事件的待办
        const missionIndex = element.currentTarget.dataset.index
        const mission = this.data.unfinishedMissions[missionIndex]


        if (mission.openID == that.data.userInfo.openID && mission.doPeople == 1) {
            //完成自己发布给自己的任务，奖金打入自己账号
            //自己发布的任务，是给自己的，确认后奖金打入自己账号
            var uuu = this.data.API_root + 'editAvailable'
            wx.request({
                url: uuu,
                data: {
                    _id: mission._id,
                    credit: 'false'
                },
                header: {
                    'Content-Type': 'application/json'
                },
                success: function (ress) {
                    console.log('完成任务')
                },
            })
            // 给自己加分
            var uuu1 = this.data.API_root + 'editCredit'
            wx.request({
                url: uuu1,
                data: {
                    _openid: that.data.userInfo.openID,
                    credit: mission.credit
                },
                header: {
                    'Content-Type': 'application/json'
                },
                success: function (ress) {
                    console.log(ress)
                },
            })

            //触发显示更新
            mission.available = 'false'
            this.filterMission()

            //显示提示
            wx.showToast({
                title: '任务完成',
                icon: 'success',
                duration: 2000
            })

        } else if (mission.openID == that.data.userInfo.openID && mission.doPeople == 0) {
            //自己发布的任务，是给对面的，确认后奖金打入对方账号
            var uuu = this.data.API_root + 'editAvailable'
            wx.request({
                url: uuu,
                data: {
                    _id: mission._id,
                },
                header: {
                    'Content-Type': 'application/json'
                },
                success: function (ress) {
                    console.log(ress)
                },
            })
            // 给对方加分
            var spouseOpenID = wx.getStorageSync('coupleOpenID')
            var uuu1 = this.data.API_root + 'editCredit'
            wx.request({
                url: uuu1,
                data: {
                    _openid: spouseOpenID,
                    credit: mission.credit
                },
                header: {
                    'Content-Type': 'application/json'
                },
                success: function (ress) {
                    console.log(ress)
                },
            })

            //触发显示更新
            mission.available = 'false'
            this.filterMission()

            //显示提示
            wx.showToast({
                title: '任务完成',
                icon: 'success',
                duration: 2000
            })

        } else {
            wx.showToast({
                title: '不要想当然哦～',
                icon: 'error',
                duration: 2000
            })
        }

    },
})