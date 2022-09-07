// pages/Didian/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fullAddress: {}, //详细位置，注意初始化为Array而不是String
    stre: '',
    lat: '',
    lng: '',
    our_dis: '',
    couple_fullAddress: {},
    couple_stre: '',
    couple_lat: '',
    couple_lng: '',
    coupleInfo: '',
    userInfo: '',
    API_root: getApp().globalData.API_URL,

    longitude: '', 
    latitude: '',
    scale: 5,
    markers: [{
      iconPath: "../../images/img/zuobiao-2.png",
      id: 0,
      latitude: '',
      longitude: '121.2',
      width: 25,
      height: 25
    },{
      iconPath: "../../images/img/zuobiao-3.png",
      id: 1,
      latitude: '',
      longitude: '',
      width: 25,
      height: 25
    },
  ],
    controls: '',
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
    this.getID()
    this.setData({
      fullAddress: wx.getStorageSync('add'),
      stre: wx.getStorageSync('stre'),
      lat: wx.getStorageSync('lat'),
      lng: wx.getStorageSync('lng'),
    })
    this.getWeather()

  },

  // 方法定义 lat,lng 
  GetDistance(lat1, lng1, lat2, lng2) {
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137; // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    return s;
  },

  doDIstance() {
    var dis = this.GetDistance(this.data.lat, this.data.lng, this.data.couple_lat, this.data.couple_lng)
    this.setData({
      our_dis: dis,
      longitude: (Number(this.data.lng) + Number(this.data.couple_lng)) / 2,
      latitude: (Number(this.data.lat) + Number(this.data.couple_lat)) /2,
      ["markers[0].latitude"]: this.data.lat,
      ["markers[0].longitude"]: this.data.lng,
      ["markers[1].latitude"]: this.data.couple_lat,
      ["markers[1].longitude"]: this.data.couple_lng,
    })
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

  getWeather() {
    var that = this
    wx.request({
      url: that.data.API_root + 'getWeather',
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        openID: that.data.userInfo.spouseOpenID,
      },
      success: function (res) {
        that.setData({
          couple_fullAddress: JSON.parse(res.data.mysql[0].address),
          couple_stre: res.data.mysql[0].street,
          couple_lat: res.data.mysql[0].latitude,
          couple_lng: res.data.mysql[0].longitude,
        })
        that.doDIstance()
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