// pages/ChangeUserInfo/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hiddenmodalput: true,
        hiddenTog: true,
        nic: '',
        together: '',
        fileList: [],
        touxiang: [],
        shouye: [],
        imageList: [], // 上传图片集合
        form: { // 用于其他功能提交的参数
            ossUrl: []
        },
        show: true,
        API_root: getApp().globalData.API_URL,
        userOpenID: '',
        userInfo: '',
        coupleInfo: '',
    },
    changeNick() {
        this.setData({
            hiddenmodalput: !this.data.hiddenmodalput
        })
    },
    //取消按钮  
    cancelNick() {
        this.setData({
            hiddenmodalput: true
        });
    },

    cancelTog() {
        this.setData({
            hiddenTog: true
        });
    },

    changeNic(e) {
        this.setData({
            nic: e.detail.value
        })
    },

    changeTogether() {
        this.setData({
            hiddenTog: !this.data.hiddenTog
        })
    },

    changeTog(e) {
        this.setData({
            together: e.detail.value
        })
    },

    checkTog(together) {
        let str = /(?!0000)[0-9]{4}-((0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-8])|(0[13-9]|1[0-2])-(29|30)|(0[13578]|1[02])-31)/;
        if (str.test(together)) {
            return true;
        } else {
            //提示邮箱格式不正确
            wx.showToast({
                title: '日期格式不正确',
                icon: 'error',
                // image: '/images/warn.png',
            })
            return false;
        }
    },


    //确认  
    confirmNick() {
        var that = this
        if (that.data.nic.length > 5) {
            wx.showToast({
                title: '最多五个字哟～',
                icon: 'error',
                duration: 2000
            })
            return
        }
        wx.request({
            url: that.data.API_root + 'editNick',
            data: {
                openid: that.data.userInfo.openID,
                nickName: that.data.nic
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (ress) {
                wx.showToast({
                    title: '修改成功',
                    icon: 'success',
                    duration: 2000
                })
            },
        })
        this.setData({
            hiddenmodalput: true
        })
    },

    //确认在一起的时间
    confirmTog() {
        var that = this
        if (that.checkTog(that.data.together)) {
            wx.request({
                url: that.data.API_root + 'editTogether',
                data: {
                    openid: that.data.userInfo.openID,
                    together: that.data.together
                },
                header: {
                    'Content-Type': 'application/json'
                },
                success: function (ress) {
                    wx.showToast({
                        title: '修改成功',
                        icon: 'success',
                        duration: 2000
                    })
                },
            })
            this.setData({
                hiddenTog: true
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
        // console.log(that.data)
    },

    onClose() {
        this.setData({
            show: false
        });
    },

    onSelect(event) {
        if (event.detail.index == 0) {
            // 从相册中选择
            _this.chooseWxImage('album')
        } else if (event.detail.index == 1) {
            // 使用相机
            _this.chooseWxImage('camera')
        }
    },

    afterRead(event) {
        var that = this
        const {
            file
        } = event.detail;
        // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
        wx.uploadFile({
            url: 'http://127.0.0.1:8080/upload2', // 仅为示例，非真实的接口地址
            filePath: file.url,
            name: 'file',
            //   formData: { user: 'test' },
            success(res) {
                // 上传完成需要更新 fileList
                const {
                    fileList = []
                } = that.data;
                fileList.push({
                    ...file,
                    url: res.data
                });
                that.setData({
                    fileList
                });
            },
        });
    },

    // 选择上传图片的方式
    chooseImageTap() {
        let _this = this;
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍一张'],
            // itemColor: "#f7982a",
            success(res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        // 从相册中选择
                        _this.chooseWxImage('album', 'touxiang')
                    } else if (res.tapIndex == 1) {
                        // 使用相机
                        _this.chooseWxImage('camera', 'touxiang')
                    }
                }
            }
        })
    },

    // 上传首页背景的方式
    shouyeImageTap() {
        console.log('上传首页')
        let _this = this;
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍一张'],
            // itemColor: "#f7982a",
            success(res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        // 从相册中选择
                        _this.chooseWxImage('album', 'shouye')
                    } else if (res.tapIndex == 1) {
                        // 使用相机
                        _this.chooseWxImage('camera', 'shouye')
                    }
                }
            }
        })
    },

    // 上传任务背景的方式
    renwuImageTap() {
        console.log('上传任务')
        let _this = this;
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍一张'],
            // itemColor: "#f7982a",
            success(res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        // 从相册中选择
                        _this.chooseWxImage('album', 'renwu')
                    } else if (res.tapIndex == 1) {
                        // 使用相机
                        _this.chooseWxImage('camera', 'renwu')
                    }
                }
            }
        })
    },

    // 上传任务背景的方式
    shangchengImageTap() {
        console.log('上传商城')
        let _this = this;
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍一张'],
            // itemColor: "#f7982a",
            success(res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        // 从相册中选择
                        _this.chooseWxImage('album', 'shangcheng')
                    } else if (res.tapIndex == 1) {
                        // 使用相机
                        _this.chooseWxImage('camera', 'shangcheng')
                    }
                }
            }
        })
    },

    // 选择图片
    chooseWxImage(type, ppp) {
        let _this = this;
        let imgs = this.data.imageList;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: [type],
            success(res) {
                if (imgs.length > 1) {
                    return wx.showToast({
                        title: '最多可上传一张图片',
                        icon: 'none'
                    })
                }
                _this.upload(res.tempFilePaths[0], ppp);
            }
        })
    },
    //上传图片到服务器
    upload: function (path, param) {
        let _this = this;
        wx.showToast({
                icon: "loading",
                title: "正在上传"
            }),
            //将本地资源上传到服务器
            wx.uploadFile({
                url: _this.data.API_root + 'upload2', // 开发者服务器地址
                formData: {
                    param: param,
                    openid: _this.data.userInfo.openID,
                },
                filePath: path, // 要上传文件资源的路径 (本地路径)
                name: 'file', // 文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容
                header: {
                    // HTTP 请求 Header，Header 中不能设置 Referer
                    "Content-Transfer-Encoding": "binary",
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": "form-data"
                },
                success: function (res) {
                    // 判断下
                    if (res && res.data) {
                        // 格式化JSON
                        const data = JSON.parse(res.data);
                        if (res.statusCode != 200) {
                            wx.showToast({
                                title: '上传失败',
                                icon: 'none'
                            })
                            return;
                        } else {
                            if (!!data) {

                                // 修改数据库连接
                                if (param == 'touxiang') {
                                    _this.setData({
                                        touxiang: []
                                    })
                                    _this.changeTou(data.path)
                                    _this.setData({
                                        touxiang: [data.path]
                                    })
                                } else if (param == 'shouye') {
                                    _this.changeShouye(data.path)
                                } else if (param == 'renwu') {
                                    _this.changeRenwu(data.path)
                                } else if (param == 'shangcheng') {
                                    _this.changeShangcheng(data.path)
                                }
                                try {
                                    wx.setStorageSync(param, data.path)
                                } catch (e) {
                                    console.log(e)
                                }

                                // _this.previewBigImage()
                            }
                        }
                    }
                },
                fail: function (e) {
                    wx.showToast({
                        title: '上传失败',
                        icon: 'none'
                    })
                },
                complete: function () {
                    wx.hideToast(); //隐藏Toast
                }
            })
    },

    //修改头像
    changeTou(par) {
        var that = this
        wx.request({
            url: that.data.API_root + 'editTou',
            data: {
                openid: that.data.userInfo.openID,
                avatar: par
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (ress) {
                wx.showToast({
                    title: '修改成功',
                    icon: 'success',
                    duration: 2000
                })
            },
        })
    },
    //修改首页
    changeShouye(par) {
        var that = this
        wx.request({
            url: that.data.API_root + 'editShouye',
            data: {
                openid: that.data.userInfo.openID,
                avatar: par
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (ress) {
                wx.showToast({
                    title: '修改成功',
                    icon: 'success',
                    duration: 2000
                })
            },
        })
    },
    //修改任务
    changeRenwu(par) {
        var that = this
        wx.request({
            url: that.data.API_root + 'editRenwu',
            data: {
                openid: that.data.userInfo.openID,
                avatar: par
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (ress) {
                wx.showToast({
                    title: '修改成功',
                    icon: 'success',
                    duration: 2000
                })
            },
        })
    },
    //修改商城
    changeShangcheng(par) {
        var that = this
        wx.request({
            url: that.data.API_root + 'editShangcheng',
            data: {
                openid: that.data.userInfo.openID,
                avatar: par
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (ress) {
                wx.showToast({
                    title: '修改成功',
                    icon: 'success',
                    duration: 2000
                })
            },
        })
    },
    // 删除图片
    removeChooseImage(e) {
        let imgs = this.data.form.ossUrl;
        let {
            index
        } = e.currentTarget.dataset;
        imgs.splice(index, 1);
        this.setData({
            'form.ossUrl': imgs,
            imageList: imgs
        })
    },
    // 预览图片
    previewBigImage(e) {
        let imgs = this.data.touxiang;
        console.log(imgs)
        wx.previewImage({
            //当前显示图片
            current: imgs,
            //所有图片
            urls: imgs
        })
    },

    //打开相册选取
    navToalbum() {
        var that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album'],
            success(res) {
                console.log(res.tempFilePaths)

            }
        })
    },

    toCut() {
        wx.navigateTo({
            url: '/pages/CutTou/index'
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
        if (!!wx.getStorageSync('touxiang')) {
            this.setData({
                touxiang: [wx.getStorageSync('touxiang')]
            })

        } else {

            this.setData({
                touxiang: [this.data.userInfo.avatarUrl]
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