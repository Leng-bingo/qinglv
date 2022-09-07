Page({
    data: {
        screenWidth: 1000,
        screenHeight: 1000,

        search: "",
        credit: 0,
        user: "",
        userInfo: '',
        coupleInfo: '',

        doPeople: 1,
        allItems: [], //所有商品
        unboughtItems: [], //上架商品
        boughtItems: [], //下架商品

        API_root: getApp().globalData.API_URL,

        slideButtons: [{
                extClass: 'buyBtn',
                text: '购买',
                src: "Images/icon_buy.svg"
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
        var that = this
        wx.request({
            url: that.data.API_root + 'getMarketList',
            data: {
                openID: that.data.userInfo.openID,
                soupleOpenID: that.data.userInfo.spouseOpenID
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (ress) {
                that.setData({
                    allItems: ress.data.mysql
                })
                // console.log(that.data.allMissions)
                that.filterItem()
                that.getScreenSize()
                console.log(that.data)
            },
            fail: function (ress) {
                console.log(ress)
            }
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

    //转到商品详情
    async toDetailPage(element, isUpper) {
        const itemIndex = element.currentTarget.dataset.index
        const item = isUpper ? this.data.unboughtItems[itemIndex] : this.data.boughtItems[itemIndex]
        wx.navigateTo({
            url: '../MarketDetail/index?id=' + item._id
        })
    },
    //转到商品详情[上]
    async toDetailPageUpper(element) {
        this.toDetailPage(element, true)
    },
    //转到商品详情[下]
    async toDetailPageLower(element) {
        this.toDetailPage(element, false)
    },
    //转到添加商品
    async toAddPage() {
        wx.navigateTo({
            url: '../MarketAdd/index'
        })
    },

    //设置搜索
    onSearch(element) {
        this.setData({
            search: element.detail.value
        })

        this.filterItem()
    },

    //将商品划分为：完成，未完成
    filterItem() {
        let itemList = []
        if (this.data.search != "") {
            for (let i in this.data.allItems) {
                if (this.data.allItems[i].title.match(this.data.search) != null) {
                    itemList.push(this.data.allItems[i])
                }
            }
        } else {
            itemList = this.data.allItems
        }

        this.setData({
            unboughtItems: itemList.filter(item => item.available === 'true'),
            boughtItems: itemList.filter(item => item.available === 'false'),
        })
    },

    //响应左划按钮事件[上]
    async slideButtonTapUpper(element) {
        this.slideButtonTap(element, true)
    },

    //响应左划按钮事件[下]
    async slideButtonTapLower(element) {
        this.slideButtonTap(element, false)
    },

    //响应左划按钮事件逻辑
    async slideButtonTap(element, isUpper) {
        //得到UI序号
        const {
            index
        } = element.detail
        console.log(element)

        //根据序号获得商品
        const itemIndex = element.currentTarget.dataset.index
        const item = isUpper === true ? this.data.unboughtItems[itemIndex] : this.data.boughtItems[itemIndex]
        console.log(item)


        // 商品是对方上架的
        // 先判断是不是我的商品，如果是，可以删除和星标。如果不是我的商品，可以购买
        if (this.data.userInfo.openID == item._openid) {
            if (index === 1) {
                if (item.star == 'false') {
                    item.star = 'true'
                } else {
                    item.star = 'false'
                }
                wx.request({
                    url: this.data.API_root + 'editMarketStar',
                    method: 'GET',
                    header: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        _id: item._id,
                        start_value: item.star
                    },
                    success: function (res) {
                        console.log(res)
                    }
                })

            }
            //处理删除按钮点击事件
            else if (index === 2) {

                wx.request({
                    url: this.data.API_root + 'deleteMarketElement',
                    method: 'GET',
                    header: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        _id: item._id,
                    },
                    success: function (res) {
                        console.log(res)
                    }
                })

                //更新本地数据
                if (isUpper) this.data.unboughtItems.splice(itemIndex, 1)
                else this.data.boughtItems.splice(itemIndex, 1)
                //如果删除完所有事项，刷新数据，让页面显示无事项图片
                if (this.data.unboughtItems.length === 0 && this.data.boughtItems.length === 0) {
                    this.setData({
                        allItems: [],
                        unboughtItems: [],
                        boughtItems: []
                    })
                }
            }else{
                wx.showToast({
                    title: '只能编辑自己的商品',
                    icon: 'error',
                    duration: 2000
                })
            }
            //触发显示更新
            this.setData({
                boughtItems: this.data.boughtItems,
                unboughtItems: this.data.unboughtItems
            })
        }else if (this.data.userInfo.openID != item._openid){
            if (index === 0) {
                if (isUpper) {
                    this.buyItem(element)
                } else {
                    wx.showToast({
                        title: '物品已被购买',
                        icon: 'error',
                        duration: 2000
                    })
                }
            }else if(index === 2) {
                wx.showToast({
                    title: '只能删除自己',
                    icon: 'error',
                    duration: 2000
                })
            }else if(index === 1) {
                wx.showToast({
                    title: '只能星标自己',
                    icon: 'error',
                    duration: 2000
                })
            }
             else {
                wx.showToast({
                    title: '只能购买对方的商品',
                    icon: 'error',
                    duration: 2000
                })
            }
        }





        

    },

    //购买商品
    async buyItem(element) {
        var that = this
        //根据序号获得商品
        const itemIndex = element.currentTarget.dataset.index
        const item = that.data.unboughtItems[itemIndex]


        //如果购买自己的物品，显示提醒
        if (that.data.userInfo.openID == item._openid) {
            wx.showToast({
                title: '不能购买自己的物品',
                icon: 'error',
                duration: 2000
            })
            //如果没有积分，显示提醒
        } else if (that.data.userInfo.credit < item.credit) {
            wx.showToast({
                title: '积分不足...',
                icon: 'error',
                duration: 2000
            })
        } else {
            //购买对方物品，奖金从自己账号扣除，并添加物品到自己的库里
            wx.request({
                url: that.data.API_root + 'editMarketAvailable',
                data: {
                    _id: item._id,
                },
                header: {
                    'Content-Type': 'application/json'
                },
                success: function (ress) {
                    console.log(ress)
                },
            })

            wx.request({
                url: that.data.API_root + 'deleteCredit',
                data: {
                    _openid: that.data.userInfo.openID,
                    credit: item.credit
                },
                header: {
                    'Content-Type': 'application/json'
                },
                success: function (ress) {
                    console.log(ress)
                },
            })

            wx.request({
                url: that.data.API_root + 'addStroge',
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    openID: that.data.userInfo.openID,
                    title: item.title,
                    credit: item.credit,
                    descc: item.desc
                },
                success: function (res) {
                    console.log(res)
                    if (res.data.mysql == 1) {
                        wx.showToast({
                            title: '购买成功',
                            icon: 'success',
                            duration: 2000
                        })
                    } else {
                        wx.showToast({
                            title: '购买失败',
                            icon: 'error',
                            duration: 1000
                        })
                        return
                    }
                }
            })

            //触发显示更新
            that.setData({
                userInfo: {
                    credit: that.data.userInfo.credit - item.credit
                }
            })

            item.available = 'false'
            that.filterItem()
        }

    },
})