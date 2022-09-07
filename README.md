# 前后端开发情侣互动小程序（做任务，攒积分，换商品）
## 序言
这是使用**NodeJS后台**和**mysql数据库**构建的情侣互动小程序，可以跟女朋友互动哦。

## 后台nodejs设计

- node wxapi.js安装缺少的包即可

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
