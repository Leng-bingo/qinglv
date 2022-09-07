var QQMapWX = require('../JS/qqmap-wx-jssdk.min');
/* Main page of the app */
Page({
  data: {
    //位置和天气
    locate: '', //市+区信息
    fullAddress: {}, //详细位置，注意初始化为Array而不是String
    street: '', //街道信息
    Latitude: '', //经纬度
    Longtitude: '',
    temp: '', //气温
    weather: '', //天气状况

    screenWidth: 1000,
    screenHeight: 1000,
    button_onclick: 'sign_in',
    nowDate: '',
    sign_in: "签到",
    sign_in_color: "rgb(255, 182, 211)",
    towDaysBetween: '',
    API_root: getApp().globalData.API_URL,
    is_new_user: '',
    coupleOpenID: '',
    coupleInfo: '',
    userOpenid: '',
    userInfo: '',
    content: '',
    author: '',
    richeng: [],
  },

  //发请求得到经纬度
  getLocation() {
    var qqmapsdk;
    qqmapsdk = new QQMapWX({
      key: "J3WBZ-RHHKU-ZKLVW-2U2EP-WDE5E-INB7V"
    })
    var that = this;
    wx.getLocation({
      isHighAccuracy: true,
      type: 'gcj02',
      success: (res) => {
        let {
          latitude,
          longitude
        } = res
        wx.setStorageSync('lat', latitude)
        wx.setStorageSync('lng', longitude)
        that.setData({
          Latitude: latitude,
          Longitude: longitude,
        })
        that.getWeather(Math.floor(latitude * 100) / 100, Math.floor(longitude * 100) / 100)
        // 调用腾讯地图api获取当前位置
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success(res) {
            var loc = res.result.address_component.city + ' ' + res.result.address_component.district
            var stre = res.result.address_component.street
            var add = res.result.ad_info
            wx.setStorageSync('add', add)
            wx.setStorageSync('stre', stre)
            that.setData({
              locate: loc,
              street: stre,
              fullAddress: add
            })
          },
        });
      }
    })
    this.setLocation()
  },

  //获得天气
  getWeather(latitude, longitude) {
    var that = this;
    var url = "https://devapi.qweather.com/v7/weather/now";
    var params = {
      location: longitude + ',' + latitude,
      key: "3b2359accbb64bee881635c262053c37",
    };
    wx.request({
      //请求天气数据，通过经纬度
      url: url,
      data: params,
      success: (res) => {
        // wx.setStorageSync('weather', res.data.now.text)
        // wx.setStorageSync('temp', res.data.now.temp)
        that.setData({
          weather: res.data.now.text,
          temp: res.data.now.temp,
        })
        // console.log(that.data.temp)
      },
    })
  },

  //上传位置信息
  setLocation() {
    var that = this
    var uuu = that.data.API_root + 'insertWeather'
    if (!!wx.getStorageSync('add')) {
      var myaddress = wx.getStorageSync('add')
    } else {
      var myaddress = {}
    }
    wx.request({
      url: uuu,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openID: that.data.userInfo.openID,
        address: myaddress,
        street: wx.getStorageSync('stre'),
        latitude: wx.getStorageSync('lat'),
        longitude: wx.getStorageSync('lng'),
      },
      success: function (res) {
        // console.log(res.data)
      }
    })
  },

  onLoad() {
    this.getJuzi()
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

  async onShow() {
    //如果缓存存在，正常加载我的页面
    //没有缓存，跳转我的界面
    var that = this
    var userinfo = wx.getStorageSync('userInfo')
    if (userinfo != null && userinfo != '') {
      that.setData({
        userInfo: userinfo
      })
      that.searchMatter()
      that.getLocation()
      that.getAnotherInfo()
      that.getUserInfo()
      that.select_signIN()
      that.getScreenSize()
    } else {
      wx.switchTab({
        url: '../My/index'
      })
    }
  },

  //每日金句
  getJuzi() {
    var that = this
    wx.request({
      url: 'https://saying.api.azwcl.com/saying/get',
      header: {
        'Content-Type': 'application/json'
      },
      success: function (ress) {
        that.setData({
          content: ress.data.data.content,
          author: ress.data.data.author
        })
      },
    })
  },

  toXingcheng() {
    wx.navigateToMiniProgram({
      appId: 'wx8f446acf8c4a85f5', // 需要跳转到指定的小程序appid
      path: '', // 不填写默认为首页
      envVersion: 'release', //
      success(res) {
        // 打开成功
        // console.log(res);
      }
    })
  },

  toSuishenma() {
    wx.navigateToMiniProgram({
      appId: 'wxc5059c3803665d9c', // 需要跳转到指定的小程序appid
      path: '', // 不填写默认为首页
      envVersion: 'release', //
      success(res) {
        // 打开成功
        // console.log(res);
      }
    })
  },

  // 查找日程
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
        // console.log(res.data.mysql.slice(0,5))

        that.setData({
          richeng: res.data.mysql.slice(0,4)
        })
        var nowDate = that.formatDateTime()
        var ddd = Array.from(res.data.mysql);
        ddd.forEach((item, index) => {
          // console.log(item, index)
          if (item.do == '1') {
            that.setData({
              ["richeng[" + index + "].date"]: item.date.slice(0, 4) + '/' + item.date.slice(5, 7) + '/' + item.date.slice(8, 10),
              ["richeng[" + index + "].chazhi"]: that.GetNumberOfDays(item.date.slice(0, 10), nowDate)
            })
          } else if (item.do == '0') {
            that.setData({
              ["richeng[" + index + "].date"]: item.date.slice(0, 4) + '/' + item.date.slice(5, 7) + '/' + item.date.slice(8, 10),
              ["richeng[" + index + "].chazhi"]: that.GetNumberOfDays(nowDate, item.date.slice(0, 10))
            })
          }
        });
      }
    })
    // setTimeout(function () {
    //     wx.navigateBack()
    // }, 300)
  },

  getTogether() {
    var nowDate = this.formatDateTime()
    var towDaysBetween = this.GetNumberOfDays(this.data.userInfo.together.substring(0, 10), nowDate)
    // var towDaysBetween = this.GetNumberOfDays('2021-11-21', nowDate)
    this.setData({
      nowDate: nowDate,
      towDaysBetween: towDaysBetween
    })
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

  toRicheng() {
    wx.navigateTo({
      url: '/pages/RiCheng/index'
    })
  },

  toDaka() {
    wx.navigateTo({
      url: '/pages/Daka/index'
    })
  },

  toDidian() {
    wx.navigateTo({
      url: '/pages/Didian/index'
    })
  },

  async sign_new_in() {
    var that = this
    wx.request({
      url: that.data.API_root + 'addNewSignIn',
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        _openid: that.data.userOpenid,
      },
      success: function (res) {
        // 给自己加分
        var uuu1 = that.data.API_root + 'editCredit'
        wx.request({
          url: uuu1,
          data: {
            _openid: that.data.userOpenid,
            credit: 1
          },
          header: {
            'Content-Type': 'application/json'
          },
          success: function (ress) {
            that.getCreditA()
            that.getCreditB()
            wx.showToast({
              title: '签到成功！获得1积分。❤',
              icon: 'none', //当icon：'none'时，没有图标 只有文字
              duration: 3000
            })
            that.setData({
              sign_in: "已签到",
              sign_in_color: "#c3c9c7",
              button_onclick: ''
            })
          },
        })
      },
      fail: function (res) {
        console.log('fail')
      }
    })

  },

  async sign_in() {
    var that = this
    if (that.data.is_new_user) {
      that.sign_new_in()
    } else {
      wx.request({
        url: that.data.API_root + 'getSignIn',
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          _openid: that.data.userOpenid,
          date: that.data.nowDate
        },
        success: function (res) {
          // 给自己加分
          var uuu1 = that.data.API_root + 'editCredit'
          wx.request({
            url: uuu1,
            data: {
              _openid: that.data.userOpenid,
              credit: 1
            },
            header: {
              'Content-Type': 'application/json'
            },
            success: function (ress) {
              that.getUserInfo()
              that.getAnotherInfo()
              wx.showToast({
                title: '签到成功！获得1积分。❤',
                icon: 'none', //当icon：'none'时，没有图标 只有文字
                duration: 3000
              })
              that.setData({
                sign_in: "已签到",
                sign_in_color: "#c3c9c7",
                button_onclick: ''
              })
            },
          })
        },
        fail: function (res) {
          console.log('fail')
        }
      })
    }

  },

  async select_signIN() {
    var that = this
    // 查询待签到的用户是不是第一次签到
    wx.request({
      url: that.data.API_root + 'isSignIn',
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        _openid: that.data.userOpenid,
      },
      success: function (res) {
        // 如果用户存在，则查询是否签到过
        if (res.data.mysql == 1) {
          wx.request({
            url: that.data.API_root + 'getSignDate',
            method: 'GET',
            header: {
              'Content-Type': 'application/json'
            },
            data: {
              _openid: that.data.userOpenid
            },
            success: function (res) {
              if (res.data.mysql[0].date.substring(0, 10) == that.formatDateTime()) {
                that.setData({
                  sign_in: "已签到",
                  sign_in_color: "#c3c9c7",
                  button_onclick: ''
                })
              }
            },
            fail: function (res) {
              console.log('fail')
            }
          })
        } else if (res.data.mysql == 0) {
          that.setData({
            is_new_user: true
          })
        }
      },
      fail: function (res) {
        console.log('fail')
      }
    })
  },


  getAnotherInfo() {
    var that = this
    try {
      var value = wx.getStorageSync('coupleOpenID')
      if (value) {
        that.setData({
          coupleOpenID: value
        })
      }
    } catch (e) {
      console.log(e)
    }

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

  getUserInfo() {
    var that = this
    try {
      var value = wx.getStorageSync('userOpenid')
      if (value) {
        that.setData({
          userOpenid: value
        })
      }
    } catch (e) {
      console.log(e)
    }

    var submit = that.data.API_root + 'getuserInfo'
    wx.request({
      url: submit,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openID: that.data.userOpenid
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
        that.getTogether()
        // that.getLocation()
      },
      fail: function (ress) {}
    })
  },
})