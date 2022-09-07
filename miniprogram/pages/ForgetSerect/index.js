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
    login_number:'',
    login_serect:'',
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
  //获取验证码 
  getCode() {
    var that = this;
    // 获取缓存用户openid
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
        that.getEmailCode()
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
    var that = this
    var uuu = this.data.API_root + 'forget_serect'
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
          to_email: this.data.email
        },
        success: function (ress) {
          console.log(ress)
          if(ress.data.mysql == 1){
            wx.showToast({
              title: '验证码已发送',
            })
            //开始倒计时60秒
            that.countDown(that, 60);
          }else if(ress.data.mysql == 0){
            console.log('没有该用户，请注册用户')
            wx.showModal({
              title: '提示',
              content: '用户信息不存在，请注册',
              success(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.redirectTo({
                    url: '/pages/Register/index'
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }else if(ress.data.data == false){
            wx.showToast({
              title: '网络错误',
              icon: 'error',
            })
          }
        },
        fail: function (ress) {
          console.log('fail')
        }
      })
    }
  },

  //修改密码
  zhuce() {
    if (this.checkPhoneNumber(this.data.phoneNumber) &&
      this.checkEmail(this.data.email)
    ) {
      if (this.data.code.length != 6) {
        console.log(this.data.code.length, this.data.code)
        //提示应该输入验证码
        wx.showToast({
          title: '请输入验证码',
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
    var submit = this.data.API_root + 'forget_verify_code'
    wx.request({
      url: submit,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
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
            content: '修改密码成功，点击跳转登陆界面！',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/Register/index'
                })
              } else if (res.cancel) {
                console.log('用户点击取消,修改密码成功')
              }
            }
          })
        } else if (ress.data.mysql == 0) {
          wx.showModal({
            title: '提示',
            content: '请检查网络或稍后再试！',
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
      }
    })
  },




  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    try {
      var openid = wx.getStorageSync('userOpenid')
      if (openid) {
        this.setData({
          userOpenID: openid
        })
      }
    } catch (e) {
      console.log(e)
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