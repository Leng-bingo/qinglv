# 全栈开发情侣互动微信小程序（做任务，攒积分，换商品）（前端微信小程序客户端，后端NodeJS，数据库MySql）
## 序言
微信搜索《**小冷小洋的爱情杂货铺**》或扫码即可使用
![gh_0121fd309ebe_258](https://user-images.githubusercontent.com/44319750/205475191-2e3e6673-ed5e-4146-8a09-8517a13015a1.jpg)

这是使用**NodeJS后台**和**mysql数据库**构建的情侣互动小程序，可以跟女朋友互动哦。

## 准备工作

- 要想每个人都能用，微信小程序的后台接口要有https的网站，可以去阿里云购买域名，然后申请免费证书。
- 图片储存在阿里云oss，可以购买一个一个月好像是几块钱，不太贵。
- 然后注册小程序即可

## 后台nodejs设计

- node nodejs/wxapi.js安装缺少的包即可
- 上传图片使用阿里OSS，需要在wxapi.js文件中添加自己的用户信息

```js
let client = new OSS({ // 链接oss 这里面的配置最好是放在单独的文件，引入如果要上传的git的话账号密码最好不要传到git
  region: 'oss-cn-hangzhou', // oss地区，只需要把 hangzhou 改为相应地区即可，可以在oss上随便找一个文件链接就知道是哪个地区的了
  accessKeyId: '', // oss秘钥
  accessKeySecret: '', // oss秘钥的密码
  bucket: 'wx-photo', // 存储库名称
});
const endPoint = '' // 自己的oss链接名，可以在oss上随便找一个文件链接就知道了
const bucket = 'wx-photo';
```

- 添加自己小程序的id和密码

```js
  var APP_ID = ''  //自己小程序的app id ，在公众开发者后台可以看到
  var APP_SECRET = ''  //自己小程序的app secrect，在公众开发者后台可以看到
```

- 数据库mysql改成自己的用户名密码

## 数据库设计（按顺序导入）

- ![用户数据表](https://leng-mypic.oss-cn-beijing.aliyuncs.com/mac-img/20220907203113.png)

- ![](https://leng-mypic.oss-cn-beijing.aliyuncs.com/mac-img/20220907203408.png)
- ![](https://leng-mypic.oss-cn-beijing.aliyuncs.com/mac-img/20220907203425.png)
- ![](https://leng-mypic.oss-cn-beijing.aliyuncs.com/mac-img/20220907203525.png)
- ![](https://leng-mypic.oss-cn-beijing.aliyuncs.com/mac-img/20220907203541.png)
- ![](https://leng-mypic.oss-cn-beijing.aliyuncs.com/mac-img/20220907203600.png)
- ![](https://leng-mypic.oss-cn-beijing.aliyuncs.com/mac-img/20220907203614.png)
- ![](https://leng-mypic.oss-cn-beijing.aliyuncs.com/mac-img/20220907203258.png)



## 使用逻辑
- 女朋友发布任务->男朋友接受（拒绝）任务->女朋友来做任务->做完后由你来确认完成->女朋友收到积分
- 你发布商品(洗碗券)->女朋友使用积分购买->商品进入到女朋友的库存->女朋友拿着洗碗券叫你洗碗->你洗碗->女朋友将物品(洗碗券)标记为已使用(不可逆)
## 版本说明
- 将所有函数变为**后端API接口**
- 新增了**日程事情提醒**，可以新增事件，包括倒计时和正计时，并在首页显示最新的五条信息。
- 新增了**签到功能**，每日签到增加一积分。
- 新增了**位置打卡**，打开小程序会显示当前位置，如果已经绑定伴侣，点击后可以显示双方的位置、距离和地图坐标显示。
- 新增了**常用工具**，通信形成卡和随申码，防止女票找不到小程序。
- 新增**我的页面**
  - 更改用户信息：修改包括用户头像以及背景图片、昵称和在一起的时间。
  - 绑定伴侣：输入对方页面上的ID即可绑定伴侣。
  - 意见反馈：加入群或填写表单进行反馈哟～
---

- 更新**任务逻辑**，加入待审核功能，双方审核后任务再被执行，如果不满意任务要求，对方可以删除任务。

## 效果图
![](https://leng-mypic.oss-cn-beijing.aliyuncs.com/mac-img/20220907204246.png)

![](https://leng-mypic.oss-cn-beijing.aliyuncs.com/mac-img/20220907203740.png)

## 声明
- 小程序内所有图片均来自网络，此项目非商用，侵删。
- 若想使用此项目为商用，请先告知我，谢谢。
