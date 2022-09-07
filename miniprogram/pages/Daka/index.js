Page({
  //保存正在编辑的任务
  data: {
      title: '',
      desc: '',
      date: '',

      credit: 5,
      maxCredit: getApp().globalData.maxCredit,
      presetIndex: 0,
      doPeopleIndex: 0,

      userInfo: '',
      coupleInfo: '',

      API_root: getApp().globalData.API_URL,
      userOpenID: '',
      doPeople: [{
          name: "倒计时"
      }, {
          name: "正计时"
      }],
      presets: [{
          name: "无预设",
          title: "",
          desc: "",
      }, {
          name: "早睡早起",
          title: "晚上要早睡，明天早起",
          desc: "熬夜对身体很不好，还是要早点睡觉第二天才能有精神！",
      }, {
          name: "打扫房间",
          title: "清扫房间，整理整理",
          desc: "有一段时间没有打扫房间了，一屋不扫，何以扫天下？",
      }, {
          name: "健康运动",
          title: "做些运动，注意身体",
          desc: "做一些健身运动吧，跳绳，跑步，训练动作什么的。",
      }, {
          name: "戒烟戒酒",
          title: "烟酒不解真愁",
          desc: "维持一段时间不喝酒，不抽烟，保持健康生活！",
      }, {
          name: "请客吃饭",
          title: "请客吃点好的",
          desc: "好吃的有很多，我可以让你尝到其中之一，好好享受吧！",
      }, {
          name: "买小礼物",
          title: "整点小礼物",
          desc: "买点小礼物，像泡泡马特什么的。",
      }, {
          name: "洗碗洗碟",
          title: "这碗碟我洗了",
          desc: "有我洗碗洗碟子，有你吃饭无它事。",
      }, {
          name: "帮拿东西",
          title: "帮拿一天东西",
          desc: "有了我，你再也不需要移动了。拿外卖，拿零食，开空调，开电视，在所不辞。",
      }, {
          name: "制作饭菜",
          title: "这道美食由我完成",
          desc: "做点可口的饭菜，或者专门被指定的美食。我这个大厨，随便下，都好吃。",
      }]
  },

  bindDateChange: function (e) {
      this.setData({
          date: e.detail.value
      })
  },

  //数据输入填写表单
  onTitleInput(e) {
      this.setData({
          title: e.detail.value
      })
  },
  onDescInput(e) {
      this.setData({
          desc: e.detail.value
      })
  },
  onCreditInput(e) {
      this.setData({
          credit: e.detail.value
      })
  },
  onDoPeople(e) {
      this.setData({
          doPeopleIndex: e.detail.value
      })
  },
  onPresetChange(e) {
      this.setData({
          presetIndex: e.detail.value,
          title: this.data.presets[e.detail.value].title,
          desc: this.data.presets[e.detail.value].desc,
      })
  },

  onShow() {
      this.getID()
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


  // nodejs保存任务
  async node_saveMission() {
      this.setData({
          userOpenID: this.data.userInfo.openID
      })

      // 对输入框内容进行校验
      if (this.data.title === '') {
          wx.showToast({
              title: '标题未填写',
              icon: 'error',
              duration: 2000
          })
          return
      }
      if (this.data.title.length > 12) {
          wx.showToast({
              title: '标题过长',
              icon: 'error',
              duration: 2000
          })
          return
      }
      if (this.data.desc.length > 100) {
          wx.showToast({
              title: '描述过长',
              icon: 'error',
              duration: 2000
          })
          return
      }
      if (this.data.date == '') {
          wx.showToast({
              title: '要选择时间',
              icon: 'error',
              duration: 2000
          })
          return
      } else {
          var uuu = this.data.API_root + 'doMatter'
          wx.request({
              url: uuu,
              method: 'GET',
              header: {
                  'content-type': 'application/json'
              },
              data: {
                  openID: this.data.userInfo.openID,
                  title: this.data.title,
                  date: this.data.date,
                  do: this.data.doPeopleIndex,
                  descc: this.data.desc
              },
              success: function (res) {
                  // console.log(res)
                  if (res.data.mysql == 1) {
                      wx.showToast({
                          title: '添加成功',
                          icon: 'success',
                          duration: 1500
                      })
                  } else {
                      wx.showToast({
                          title: '添加失败',
                          icon: 'error',
                          duration: 1000
                      })
                      return
                  }
              }
          })
          setTimeout(function () {
              wx.navigateBack()
          }, 300)
      }


  },

  // 重置所有表单项
  resetMission() {
      this.setData({
          title: '',
          desc: '',
          credit: 5,
          presetIndex: 0,
          doPeopleIndex: 0,
      })
  }
})