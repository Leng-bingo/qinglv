App({
    data: {
        API_URL: 'http://127.0.0.1:8080/',

    },
  async onLaunch() {
    // this.initcloud()
    this.get_OpenID()
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })
    this.globalData = {
      //最多单次交易积分
      maxCredit: 500,

      API_URL: 'http://127.0.0.1:8080/',
      userOpenID: '',
      userExist: '',
    }
  },
  flag: false,


  saveUserData(){
    var api = API_URL + 'saveUserData'

  },

  //获取openID
  async get_OpenID() {
    return new Promise((resolve, reject) => {
        let _this = this
        var uuu = _this.data.API_URL + 'openid'
        wx.login({
            success(res) {
                if (res.code) {
                    //发起网络请求
                    wx.request({
                        url: uuu,
                        method: 'POST',
                        header: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: {
                            code: res.code
                        },
                        success: function (ress) {
                            try {
                                wx.setStorageSync('userOpenid', ress.data.openid)
                            } catch (e) {
                                console.log(e)
                            }
                            resolve(ress.data.openid)
                        },
                        fail: function (ress) {
                            console.log('fail')
                        }
                    })
                } else {
                    console.log('登录失败！' + res.errMsg)
                }
            }
        })
    })

},
})

