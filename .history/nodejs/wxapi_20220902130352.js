var express = require('express'); //express框架模块
var path = require('path'); //系统路径模块
var fs = require('fs'); //文件模块
var bodyParser = require('body-parser'); //对post请求的请求体进行解析模块
var app = express();
var sd = require('silly-datetime'); // 获取系统时间包
var mysql = require('mysql');  //导入mysql包
var cors = require("cors"); // 这个比较重要，解决跨域问题.npm install cors 装一下
// querystring这个模块，用来做url查询参数的解析
const querystring = require('querystring');
const request = require('request');
const { type } = require('os');
const nodemailer = require('nodemailer');
const moment = require('moment')
//随机昵称
const random_name = require('./need_files/random_name.js')
app.use(bodyParser.urlencoded({ extended: false })); //bodyParser.urlencoded 用来解析request中body的 urlencoded字符，只支持utf-8的编码的字符，也支持自动的解析gzip和 zlib。返回的对象是一个键值对，当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。

// 阿里云上传OSS配置
const multer = require('multer'); // multer是一个node.js文件上传中间件,有了他才能读取到文件
let co = require('co'); // co 模块，它基于 ES6 的 generator 和 yield ，让我们能用同步的形式编写异步代码。
let OSS = require('ali-oss'); // oss上传所需模块
let client = new OSS({ // 链接oss 这里面的配置最好是放在单独的文件，引入如果要上传的git的话账号密码最好不要传到git
  region: 'oss-cn-hangzhou', // oss地区，只需要把 hangzhou 改为相应地区即可，可以在oss上随便找一个文件链接就知道是哪个地区的了
  accessKeyId: 'LTAI5t6ncXTcjtq1THEsGaDa', // oss秘钥
  accessKeySecret: 'eOMHShbRVAqgEX2F1pwgswizwTtjZ5', // oss秘钥的密码
  bucket: 'wx-photo', // 存储库名称
});
const endPoint = 'wx-photo.oss-cn-hangzhou.aliyuncs.com' // 自己的oss链接名，可以在oss上随便找一个文件链接就知道了
const bucket = 'wx-photo';
let upload = multer({ // 不太清楚这是什么，但是必须有这一段
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads'); // 必须在上一级有public文件夹，public文件夹内也必须有uploads，当然，文件夹的名称可以随便修改，只需要写对就可以了
    },
    filename: function (req, file, cb) {
      var changedName = new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname;
      cb(null, changedName);
    }
  })
});

//跨域
app.use(cors({}))


var connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'lgn970722',
  port: '3306',
  database: 'vxapi',
  useConnectionPooling: true,
  timezone: '08:00'
});


//连接微博爬虫mysql数据库
// var connection = mysql.createPool({
//   // host: '10.8.21.166',
//   host: '49.234.84.95',
//   user: 'vxapi',
//   password: 'lgn970722',
//   port: '3306',
//   database: 'vxapi',
//   useConnectionPooling: true,
//   timezone: '08:00',
//   multipleStatements: true // 支持执行多条 sql 语句
// });


app.post('/openid', function (req, res, next) {

  var code = req.body.code //解析前端传递过来的参数js_code
  var APP_URL = 'https://api.weixin.qq.com/sns/jscode2session'
  var APP_ID = 'wx730a510b158d6295'  //自己小程序的app id ，在公众开发者后台可以看到
  var APP_SECRET = '56355198c295f37ea020f0120ca77b59'  //自己小程序的app secrect，在公众开发者后台可以看到
  console.log(code, APP_ID, APP_SECRET)


  if (!!code) {
    request(`${APP_URL}?appid=${APP_ID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`, (error, response, body) => {
      console.log('------用户信息------')
      console.log(body)
      res.send(body)
    })
  }
});

// 判断是否存在该用户
app.get('/isUserExist', function (req, res) {
  //判断用户是否存在，连接数据库查询

  var mysqlItem = "SELECT * from User WHERE email =? and openID!='' and phoneNumber != '' and serect != '' and emailCode != '' limit 1"
  // console.log(mysqlItem)
  var mysqlParam = [req.query.email]
  connection.getConnection(function (err, connection) {
    connection.query(mysqlItem, mysqlParam, function (err, result) {
      if (err) {
        console.log('[login ERROR] - ', err.message)
        return
      } else {
        console.log("----开始查询用户是否存在----")
        // console.log(result.length)
        // 如果有用户，以后再加。
        if (result.length > 0) {
          console.log('查询到该用户')
          res.send(JSON.stringify({
            data: 1
          }))
          // 没有用户就返回前端0，跳转新建用户界面
        } else if (result.length == 0) {
          console.log('该用户不存在')
          res.send(JSON.stringify({
            data: 0
          }))
        }
      }
    });
    connection.release();
  });


})

// 通过userid获取用户所有信息
app.get('/getuserInfo', function (req, res) {
  //判断用户是否存在，连接数据库查询

  var mysqlItem = "SELECT * from User WHERE email !='' and openID=? and phoneNumber != '' and serect != '' and emailCode != '' limit 1"
  // console.log(mysqlItem)
  var mysqlParam = [req.query.openID]
  connection.getConnection(function (err, connection) {
    connection.query(mysqlItem, mysqlParam, function (err, result) {
      if (err) {
        console.log('[login ERROR] - ', err.message)
        return
      } else {
        console.log("----开始查询用户是否存在----")
        // 如果有用户，以后再加。
        if (result.length > 0) {
          console.log('查询到该用户')
          res.send(JSON.stringify({
            data: result
          }))
          // 没有用户就返回前端0，跳转新建用户界面
        } else if (result.length == 0) {
          console.log('该用户不存在')
          res.send(JSON.stringify({
            data: 0
          }))
        }
      }
    });
    connection.release();
  })

})

// 登陆
app.get('/login', function (req, res) {
  let openID = req.query.openID
  let email = req.query.email
  let firstSerect = req.query.firstSerect
  var mysqlItem = "SELECT * from User WHERE email=? and serect=? and phoneNumber !='' and emailCode !='' and openID != '' limit 1"
  let mysqlParam = [email, firstSerect]
  console.log(mysqlItem)
  console.log(mysqlParam)
  connection.getConnection(function (err, connection) {
    connection.query(mysqlItem, mysqlParam, function (err, result) {
      if (err) {
        console.log('[login ERROR] - ', err.message)
        return
      } else {
        console.log("----开始查询用户是否存在并且登陆----")
        // console.log(result.length)
        // 如果有用户，以后再加。
        console.log(result.length)
        res.end(JSON.stringify({
          mysql: result
        }));
      }
    });
    connection.release();
  });

})

// 邮箱配置信息
var transporter = nodemailer.createTransport({
  // host: 'smtp.ethereal.email',
  service: '163', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
  port: 465, // SMTP 端口
  secureConnection: true, // 使用了 SSL
  auth: {
    user: 'leng_xiaochengxu@163.com',
    // 这里密码不是qq密码，是你设置的smtp授权码
    pass: 'PAGGOKWUOAXJHECP',
  }
});

// 发送意见反馈
app.get('/getFankui', function (req, res) {

  let from = req.query.from
  let message = req.query.message
  let openID = req.query.openID

  let mailOptions = {
    from: '"爱情杂货铺" <leng_xiaochengxu@163.com>', // sender address
    // to: '805477481@qq.com', // list of receivers
    to: '805477481@qq.com', // list of receivers
    subject: '【爱情杂货铺】意见反馈', // Subject line
    // 发送text或者html格式
    // text: 'Hello world?', // plain text body
    // html: '<b>Hello world?</b>' // html body
    html: `
            <p>来自用户${from},id为${openID}</p>
            <p>${message}</p>
        `
  };


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("发送邮件失败");
      res.end(JSON.stringify({
        data: false
      }));
      // return console.log(error);
    } else {
      console.log("邮件发送成功", info.messageId);
      res.end(JSON.stringify({
        data: true
      }));
    }
    // console.log('Message sent: %s', info.messageId);
    // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
  });


})

//建立当前位置信息天气
app.get('/insertWeather', function(req, res) {
  let openID = req.query.openID
  let address = req.query.address
  let street = req.query.street
  let latitude = req.query.latitude
  let longitude = req.query.longitude
  mysqlItem = 'REPLACE INTO LocationList (openID, address, street, latitude, longitude) VALUES (?, ?, ?, ?, ?)'
  mysqlParam = [openID, address, street, latitude, longitude]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function(err,connection){
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {
      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        // console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  })

})

//根据ID查询位置信息天气
app.get('/getWeather', function(req, res) {
  let openID = req.query.openID
  mysqlItem = 'select * from LocationList where openID = ?'
  mysqlParam = [openID]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function(err,connection){
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {
      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        // console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  })

})

//根据ID搜索所有日程
app.get('/searchMatter', function(req, res) {
  let openID = req.query.openID
  let souple = req.query.coupleID
  mysqlItem = 'select * from MatterList where openID=? or openID=? order by date desc'
  mysqlParam = [openID, souple]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function(err,connection){
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {
      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        // console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  })

})

//根据ID删除日程
app.get('/deleteMatter', function(req, res) {
  let id = req.query.id
  mysqlItem = 'delete from MatterList where id=?'
  mysqlParam = [id]
  connection.getConnection(function(err,connection){
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {
      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        // console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  })

})

// 新建日程
app.get('/doMatter', function(req, res) {
  let title = req.query.title
  let doMatter = req.query.do
  let openID = req.query.openID
  let descc = req.query.descc
  let dateMatter = req.query.date
  let id = openID + Date.now()
  mysqlItem = 'insert into MatterList(openID,id,do,descc,title,date) values (?,?,?,?,?,?) '
  mysqlParam = [openID, id, doMatter, descc, title, dateMatter]
  connection.getConnection(function(err,connection){
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {
      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        // console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  })

})

// 发送邮件验证码，并存入openID对应的数据库
app.get('/getEmailCode', function (req, res) {
  //生成随机验证码
  let code = String(Math.floor(Math.random() * 1000000)).padEnd(6, '0')
  let to_email = req.query.to_email
  let openID = req.query.openID
  let mysqlItem = "replace into User(openID, email, emailCode) values(?, ?, ?);"
  let mysqlParam = [openID, to_email, code]

  let mailOptions = {
    from: '"爱情杂货铺" <leng_xiaochengxu@163.com>', // sender address
    // to: '805477481@qq.com', // list of receivers
    to: to_email, // list of receivers
    subject: '【爱情杂货铺】验证码', // Subject line
    // 发送text或者html格式
    // text: 'Hello world?', // plain text body
    // html: '<b>Hello world?</b>' // html body
    html: `
            <p>您好！</p>
            <p>您的验证码是：<strong style="color:orangered;">${code}</strong></p>
            <p>如果不是您本人操作，请无视此邮件</p>
        `
  };

  if (to_email != '') {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("发送邮件失败");
        res.end(JSON.stringify({
          data: false
        }));
        // return console.log(error);
      } else {
        console.log("邮件发送成功", info.messageId);
        connection.getConnection(function (err, connection) {
          // 插入邮件验证码
          connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {
            if (err) {
              console.log('MySql操作失败：', err.message)
              return
            } else {
              // console.log(mysql_res)
              // console.log(mysql_res.affectedRows)
              res.end(JSON.stringify({
                data: true,
                mysql: mysql_res.affectedRows
              }));
            }
          })
          connection.release();
        });


      }
      // console.log('Message sent: %s', info.messageId);
      // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
    });
  }

})

//验证验证码是否正确，并建立用户信息
app.post('/verify_code', function (req, res) {
  let openID = req.body.openID
  let phoneNumber = req.body.phoneNumber
  let email = req.body.email
  let emailCode = req.body.emailCode
  let firstSerect = req.body.firstSerect
  let nickname = random_name.getNickName()
  let mysqlItem = "UPDATE User SET phoneNumber=?, email=?, emailCode=?, serect=?, nickName=? , credit = 0 WHERE emailCode = ? and openID=?"
  let mysqlParam = [phoneNumber, email, emailCode, firstSerect, nickname, emailCode, openID]
  connection.getConnection(function (err, connection) {
    // 验证邮件验证码是否正确
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {
      console.log(mysqlItem, mysqlParam)
      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        // console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          data: true,
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 修改昵称
app.get('/editNick', function (req, res) {
  let openid = req.query.openid
  let nickName = req.query.nickName
  let mysqlItem = 'UPDATE User SET nickName=? where openID = ?'
  let mysqlParam = [nickName, openid]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 修改在一起的时间
app.get('/editTogether', function (req, res) {
  let openid = req.query.openid
  let together = req.query.together
  let mysqlItem = 'UPDATE User SET together=? where openID = ?'
  let mysqlParam = [together, openid]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 绑定两个人
app.post('/bind_another', function (req, res) {
  let openID = req.body.userOpenID
  let spouseOpenID = req.body.inputID
  let mysqlItem = "UPDATE User SET spouseOpenID=? where openID=? and phoneNumber != '' and emailCode != '' and serect != '';"
  let mysqlParam = [spouseOpenID, openID]
  let coupleParam = [openID, spouseOpenID]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function (err, connection) {
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        res.end(JSON.stringify({
          mysql: false
        }));
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        if (mysql_res.affectedRows == 1) {
          connection.query(mysqlItem, coupleParam, function (err2, mysql_res2) {
            if (err2) {
              console.log('MySql操作失败：', err.message)
              res.end(JSON.stringify({
                mysql: false
              }));
              return
            } else {
              console.log(mysql_res2)
              console.log('MySql操作元素个数：', mysql_res2.affectedRows)
              if (mysql_res2.affectedRows == 1) {
                res.end(JSON.stringify({
                  mysql: true
                }));
              } else {
                res.end(JSON.stringify({
                  mysql: false
                }));
              }

            }
          })
        } else {
          res.end(JSON.stringify({
            mysql: false
          }));
        }
      }
    })
    connection.release();
  });





})


//忘记密码获取验证码
app.get('/forget_serect', function (req, res) {
  //生成随机验证码
  let code = String(Math.floor(Math.random() * 1000000)).padEnd(6, '0')
  let to_email = req.query.to_email
  let openID = req.query.openID
  let mysqlItem = "UPDATE User SET emailCode=? where email=? and phoneNumber != '' and emailCode != '' and serect != '';"
  let mysqlParam = [code, to_email]
  console.log(mysqlItem, mysqlParam)
  let mailOptions = {
    from: '"爱情杂货铺" <leng_xiaochengxu@163.com>', // sender address
    // to: '805477481@qq.com', // list of receivers
    to: to_email, // list of receivers
    subject: '【爱情杂货铺】忘记密码', // Subject line
    // 发送text或者html格式
    // text: 'Hello world?', // plain text body
    // html: '<b>Hello world?</b>' // html body
    html: `
            <p>您好！</p>
            <p>您的验证码是：<strong style="color:orangered;">${code}</strong></p>
            <p>如果不是您本人操作，请无视此邮件</p>
        `
  };
  connection.getConnection(function (err, connection) {
    // 插入邮件验证码
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {
      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res.affectedRows)
        if (mysql_res.affectedRows == 1) {
          if (to_email != '') {
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log("发送邮件失败");
                res.end(JSON.stringify({
                  data: false
                }));
                // return console.log(error);
              } else {
                console.log("邮件发送成功", info.messageId);
              }
              // console.log('Message sent: %s', info.messageId);
              // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
            });
          }
          res.end(JSON.stringify({
            mysql: mysql_res.affectedRows
          }));
        } else if (mysql_res.affectedRows == 0) {
          res.end(JSON.stringify({
            mysql: mysql_res.affectedRows
          }));
        } else {

        }
        // console.log(mysql_res)
        // console.log(mysql_res.affectedRows)

      }
    })
    connection.release();
  });




})

//忘记密码提交，验证验证码是否正确，并建立用户信息
app.post('/forget_verify_code', function (req, res) {
  let openID = req.body.openID
  let phoneNumber = req.body.phoneNumber
  let email = req.body.email
  let emailCode = req.body.emailCode
  let firstSerect = req.body.firstSerect
  let mysqlItem = "UPDATE User SET phoneNumber=?, serect=? WHERE emailCode = ? and email=?"
  let mysqlParam = [phoneNumber, firstSerect, emailCode, email]
  connection.getConnection(function (err, connection) {
    // 验证邮件验证码是否正确
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {
      console.log(mysqlItem, mysqlParam)
      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        // console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          data: true,
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

//添加新商品
app.post('/addMarket', function (req, res) {
  console.log(req)
  let _id = req.body.openID + Date.now()//1661477806424
  let openID = req.body.openID
  let title = req.body.title
  let credit = req.body.credit
  let descc = req.body.descc
  let date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss') //2022-08-26 09:36:46
  let mysqlItem = 'insert into MarketList(_id,_openid,title,credit,date,descc) VALUES (?,?,?,?,?,?)'
  let mysqlParam = [_id, openID, title, credit, date, descc]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function (err, connection) {
    // 添加新任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        // console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });


})

//获取商品列表
app.get('/getMarketList', function (req, res) {
  let openID = req.query.openID
  let soupleOpenID = req.query.soupleOpenID
  let mysqlItem = 'SELECT * FROM MarketList where _openid = ? or _openid = ?'
  let mysqlParam = [openID, soupleOpenID]
  connection.getConnection(function (err, connection) {
    // 查询任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.length)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  });

})

// 修改商品购买情况
app.get('/editMarketAvailable', function (req, res) {
  let _id = req.query._id
  let mysqlItem = 'UPDATE MarketList SET available="false" where _id = ?'
  let mysqlParam = [_id]
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 减少积分，购买商品
app.get('/deleteCredit', function (req, res) {
  let credit = req.query.credit
  let openID = req.query._openid
  let mysqlItem = 'UPDATE User SET credit= credit-?  where openID = ?'
  let mysqlParam = [credit, openID]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 修改商品星标
app.get('/editMarketStar', function (req, res) {
  let _id = req.query._id
  let start_value = req.query.start_value
  let mysqlItem = 'UPDATE MarketList SET star=? where _id = ?'
  let mysqlParam = [start_value, _id]
  connection.getConnection(function (err, connection) {
    // 修改星标
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 删除商品
app.get('/deleteMarketElement', function (req, res) {
  let _id = req.query._id
  let mysqlItem = 'DELETE FROM MarketList WHERE _id=?'
  let mysqlParam = [_id]
  connection.getConnection(function (err, connection) {
    // 删除任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

//获取指定ID商品
app.get('/getMarketDetail', function (req, res) {
  let _id = req.query._id
  let mysqlItem = 'SELECT * FROM MarketList where _id=?'
  let mysqlParam = [_id]
  connection.getConnection(function (err, connection) {
    // 查询任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  });

})

//添加自己的库存
app.post('/addStroge', function (req, res) {
  console.log(req)
  let _id = req.body.openID + Date.now()//1661477806424
  let openID = req.body.openID
  let title = req.body.title
  let credit = req.body.credit
  let descc = req.body.descc
  let date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss') //2022-08-26 09:36:46
  let mysqlItem = 'insert into StrogeList(_id,_openid,title,credit,date,descc) VALUES (?,?,?,?,?,?)'
  let mysqlParam = [_id, openID, title, credit, date, descc]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function (err, connection) {
    // 添加新任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        // console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });


})

//获取库存列表
app.get('/getStrogetList', function (req, res) {
  let openID = req.query.openID
  let soupleOpenID = req.query.soupleOpenID
  let mysqlItem = 'SELECT * FROM StrogeList where _openid = ? or _openid = ?'
  let mysqlParam = [openID, soupleOpenID]
  connection.getConnection(function (err, connection) {
    // 查询任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.length)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  });

})

// 修改库存使用情况
app.get('/editStrogeAvailable', function (req, res) {
  let _id = req.query._id
  let mysqlItem = 'UPDATE StrogeList SET available="false" where _id = ?'
  let mysqlParam = [_id]
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 修改库存星标
app.get('/editStrogeStar', function (req, res) {
  let _id = req.query._id
  let start_value = req.query.start_value
  let mysqlItem = 'UPDATE StrogeList SET star=? where _id = ?'
  let mysqlParam = [start_value, _id]
  connection.getConnection(function (err, connection) {
    // 修改星标
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 删除库存
app.get('/deleteStrogeElement', function (req, res) {
  let _id = req.query._id
  let mysqlItem = 'DELETE FROM StrogeList WHERE _id=?'
  let mysqlParam = [_id]
  connection.getConnection(function (err, connection) {
    // 删除任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

//获取指定ID库存
app.get('/getStrogeDetail', function (req, res) {
  let _id = req.query._id
  let mysqlItem = 'SELECT * FROM StrogeList where _id=?'
  let mysqlParam = [_id]
  connection.getConnection(function (err, connection) {
    // 查询任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  });

})

//添加新任务
app.post('/addElement', function (req, res) {
  console.log(req)
  let _id = req.body.openID + Date.now()//1661477806424
  let openID = req.body.openID
  let title = req.body.title
  let credit = req.body.credit
  let doPeople = req.body.doPeople
  let descc = req.body.descc
  let date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss') //2022-08-26 09:36:46
  let mysqlItem = 'INSERT INTO MissionList(_id, openID, title, credit, available, doPeople,tocheck,date,descc,star) VALUES (?, ?, ?, ?, "true", ?, "true", ?, ?, "false")'
  let mysqlParam = [_id, openID, title, credit, doPeople, date, descc]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function (err, connection) {
    // 添加新任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        // console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });


})

//获取任务列表
app.get('/getList', function (req, res) {
  let openID = req.query.openID
  ""
  let mysqlItem = 'SELECT * FROM MissionList where openid = (select spouseOpenID from User where openID=?) or openid = ?'
  let mysqlParam = [openID, openID]
  connection.getConnection(function (err, connection) {
    // 查询任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.length)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  });

})

//获取指定ID任务
app.get('/getMissionDetail', function (req, res) {
  let _id = req.query._id
  let mysqlItem = 'SELECT * FROM MissionList where _id=?'
  let mysqlParam = [_id]
  connection.getConnection(function (err, connection) {
    // 查询任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  });

})

// 修改任务完成情况
app.get('/editAvailable', function (req, res) {
  let _id = req.query._id
  let mysqlItem = 'UPDATE MissionList SET available="false" where _id = ?'
  let mysqlParam = [_id]
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 修改任务审核情况
app.get('/checkAvailable', function (req, res) {
  let _id = req.query._id
  let mysqlItem = 'UPDATE MissionList SET tocheck="false" where _id = ?'
  let mysqlParam = [_id]
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 修改任务星标
app.get('/editStar', function (req, res) {
  let _id = req.query._id
  let start_value = req.query.start_value
  let mysqlItem = 'UPDATE MissionList SET star=? where _id = ?'
  let mysqlParam = [start_value, _id]
  connection.getConnection(function (err, connection) {
    // 修改星标
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 删除任务
app.get('/deleteElement', function (req, res) {
  let _id = req.query._id
  let mysqlItem = 'DELETE FROM MissionList WHERE _id=?'
  let mysqlParam = [_id]
  connection.getConnection(function (err, connection) {
    // 删除任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

//查询是否存在签到用户
app.get('/isSignIn', function (req, res) {
  let _openid = req.query._openid
  let mysqlItem = 'select count(*) as count from signIn where _openid=?'
  let mysqlParam = [_openid]
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res[0].count)
        res.end(JSON.stringify({
          mysql: mysql_res[0].count
        }));
      }
    })
    connection.release();
  });

})

//插入新的签到用户
app.get('/addNewSignIn', function (req, res) {
  let _openid = req.query._openid
  let now_date = moment(new Date()).format('YYYY-MM-DD')
  let mysqlItem = 'insert into signIn(_openid,date) values (?,?)'
  let mysqlParam = [_openid, now_date]
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 查询最新签到日期
app.get('/getSignDate', function (req, res) {
  let date = req.query.date
  let _openid = req.query._openid
  let now_date = moment(new Date()).format('YYYY-MM-DD')
  let mysqlItem = 'select date from signIn where _openid=?'
  let mysqlParam = [_openid]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  });

})

// 查询签到
app.get('/getSignIn', function (req, res) {
  let date = req.query.date
  let _openid = req.query._openid
  let now_date = moment(new Date()).format('YYYY-MM-DD')
  let mysqlItem = 'update signIn set date=? where date != ? and _openid=?'
  let mysqlParam = [date, now_date, _openid]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})

// 增加积分
app.get('/editCredit', function (req, res) {
  let credit = req.query.credit
  let openID = req.query._openid
  let mysqlItem = 'UPDATE User SET credit= credit+?  where openID = ?'
  let mysqlParam = [credit, openID]
  console.log(mysqlItem, mysqlParam)
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})


// 修改头像
app.get('/editTou', function (req, res) {
  let openID = req.query.openid
  let avatar = req.query.avatar
  let mysqlItem = 'update User set avatarUrl=? where openid=?'
  let mysqlParam = [avatar, openID]
  connection.getConnection(function (err, connection) {
    // 查询积分
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  });


})

// 修改首页
app.get('/editShouye', function (req, res) {
  let openID = req.query.openid
  let avatar = req.query.avatar
  let mysqlItem = 'update User set shouyeUrl=? where openid=?'
  let mysqlParam = [avatar, openID]
  connection.getConnection(function (err, connection) {
    // 查询积分
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  });


})

// 修改任务
app.get('/editRenwu', function (req, res) {
  let openID = req.query.openid
  let avatar = req.query.avatar
  let mysqlItem = 'update User set renwuUrl=? where openid=?'
  let mysqlParam = [avatar, openID]
  connection.getConnection(function (err, connection) {
    // 查询积分
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  });


})

// 修改商城
app.get('/editShangcheng', function (req, res) {
  let openID = req.query.openid
  let avatar = req.query.avatar
  let mysqlItem = 'update User set shangchengUrl=? where openid=?'
  let mysqlParam = [avatar, openID]
  connection.getConnection(function (err, connection) {
    // 查询积分
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res)
        res.end(JSON.stringify({
          mysql: mysql_res
        }));
      }
    })
    connection.release();
  });


})

// 修改任务审核情况
app.get('/checkAvailable', function (req, res) {
  let _id = req.query._id
  let mysqlItem = 'UPDATE MissionList SET tocheck="false" where _id = ?'
  let mysqlParam = [_id]
  connection.getConnection(function (err, connection) {
    // 修改任务
    connection.query(mysqlItem, mysqlParam, function (err, mysql_res) {

      if (err) {
        console.log('MySql操作失败：', err.message)
        return
      } else {
        console.log(mysql_res)
        console.log('MySql操作元素个数：', mysql_res.affectedRows)
        res.end(JSON.stringify({
          mysql: mysql_res.affectedRows
        }));
      }
    })
    connection.release();
  });

})


// 接下来就是接口部分了
// 如果你发现接口里面什么都没写报错500，多半是upload内的东西出问题了，最有可能的是文件夹，和前端传输文件的问题
app.post('/upload2', upload.single('file'), function (req, res, next) {
  // 文件路径
  console.log(req)
  var filePath = './' + req.file.path;
  // 文件类型
  var temp = req.file.originalname.split('.');
  var fileType = temp[temp.length - 1];
  var lastName = '.' + fileType;
  // 构建图片名
  var fileName = Date.now() + lastName;
  // 构建用户图片文件夹
  var userFile = req.body.openid
  var myfileName = req.body.param
  // var my = '/' + userFile + '/' + myfileName + lastName
  var my = '/' + userFile + '/' + fileName
  // 图片重命名
  var key = fileName;
  console.log(my, filePath)
  // 阿里云 上传文件 
  co(function* () {
    client.useBucket(bucket);
    // var result = yield client.put('/images/' + key, filePath); // 这是上传的代码
    var result = yield client.put(my, filePath);
    var imageSrc = `http://${endPoint}/` + result.name;
    // 上传之后删除本地文件
    fs.unlinkSync(filePath);
    res.end(JSON.stringify({ code: 1, msg: '上传成功', path: imageSrc }));
  }).catch(function (err) {
    // 上传之后删除本地文件
    // 如果你发现上传失败了，多检查一下配置参数是否有问题，参数出问题的可能性比较大
    fs.unlinkSync(filePath);
    res.end(JSON.stringify({ code: 0, msg: '上传失败', error: JSON.stringify(err) }));
  });
});





var server = app.listen(8080, function () {

  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)

})
