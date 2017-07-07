const AV = require('../../libs/av-weapp-min.js');
var stocklist = require('../../utils/stocklist.js')
var util = require('../../utils/util.js')
var moment = require('../../utils/moment.js')

//index.js
//获取应用实例
var app = getApp()
var t
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    test: {},
    num10: {
      "1": "一",
      "2": "二",
      "3": "三",
      "4": "四",
      "5": "五",
      "6": "六",
      "7": "七",
      "8": "八",
      "9": "九",
      "10": "十"
    },
    buyColor10:[],
    sellColor10:[],
    nowStyle:{},
    stockM:'',
    stockCode:'',
    stockCode1:'',
    draft:'',
    errmsg:'',
    history: [{ 'code': '000001', 'name': '平安银行' }, { 'code': '600519','name':'贵州茅台'}],
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    //console.log(util.formatTime(new Date()))
    //console.log(util.formatNumber(0))
    var that = this
    
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      console.log(userInfo)
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
    that.getlf('000001', that)
    that.getStockName('000001', that)
  },
  getlf: function (code,that){
    var result = false;
    wx.request({
      url: 'https://app.leverfun.com/timelyInfo/timelyOrderForm',
      data: { stockCode: code },
      success: function (res) {
        //console.log(res.data)
        var buyColor =[]
        var sellColor = []
        if (res.data.data.buyPankou == null){
          that.setData({
            errmsg: '取得失败'
          })
          return result
        }
        else if (res.data.data.buyPankou[0] == null){
          that.setData({
            errmsg: '取得失败'
          })
          return result
        }

        for (var i = 0; i < res.data.data.buyPankou.length ;i++){
            buyColor.push(that.getColor(Math.round(res.data.data.preClose * 1000) / 1000,res.data.data.buyPankou[i].price))
            sellColor.push(that.getColor(Math.round(res.data.data.preClose * 1000) / 1000, res.data.data.sellPankou[i].price))
        }

        //console.log(listT)
        that.setData({
          test: res.data,
          buyColor10: buyColor,
          sellColor10: sellColor,
          nowStyle: that.getNowStyle(res.data.data),
          stockCode: code,
          date: moment().format('MM-DD HH:mm:ss'),
          stockM: that.data.stockCode1,
        })
        //that.getStockName(code)
        clearTimeout(t)
        if (that.checkTradeTime()){
          t = setTimeout(function () { that.getlf(code, that); }, 5000)
        }

        result = true;
      },
      fail: function (res) {
        //console.log(res.data)
        that.setData({
          errmsg: '取得失败'
        })
      }
    })

    return result;
  },
  getColor: function (preClose, newPrice) {
    if(newPrice==0) {
      return "gray";
    }
    if (preClose - newPrice < 0)
    {
      return "red";
    }
    else if (preClose - newPrice> 0) {
      return "green";
    }
		else{
      return "gray";
    }
  },
  getNowStyle:function(data){
    //昨收
    var a = data.preClose;
    //涨幅（差额）
    var a1 = Math.round( (data.match - a)*1000)/1000;
    //涨幅（百分比）
    var a2 = Math.round((a1 * 100 / a)*100)/100 + "%";
    //文字颜色
    var fontcolor = "";
    if (a1 < 0) {
      fontcolor = "green";
    } else if (a1 > 0) {
      a1 = "+" + a1;
      a2 = "+" + a2;
      fontcolor = "red";
    }
    return {zhangfu1:a1,zhangfu2:a2,nowColor:fontcolor}
  },
  addTodo:function(){
    var code = this.data.draft && this.data.draft.trim()
    var that = this

    var reg = /^[0-9]{6}$/g;
    if (!reg.test(code)) {
      that.setData({ errmsg: '请输入6位数股票代码' })
      return 
    }else{
      that.setData({ errmsg: '' })
    }
    //console.log(code)
    clearTimeout(t)
    that.getlf(code,that)
    that.getStockName(code, that)

    //保存最近五个搜索履历
    var h = that.data.history
    var d = { 'code': code, 'name': that.data.stockCode1 }
    var flg = false
    for (var i=0;i<h.length;i++){
      if (h[i].code== code){
        //搜索履历中存在，不再添加
        flg=true
      }
    }
    if (!flg){
      h.push(d)
      if (h.length > 5) {
        h.splice(0, 1)
      }
      that.setData({
        history: h,
      })
    }
  },
  getHistory:function(e){
    //console.log(e.currentTarget.id)
    var that = this
    clearTimeout(t)
    that.getlf(e.currentTarget.id, that)
    that.getStockName(e.currentTarget.id, that)
  },
  updateDraft: function (e) {
    this.setData({ draft: e.detail.value })
  },
  getStockName: function (code,that) {
    var listT = stocklist.getStockList()
    //console.log(listT[code])
    if (listT[code]) {
      that.setData({
        stockCode1: listT[code],
      })
    }else{
      that.setData({
        stockCode1: '****',
      })
    }
    /*
    var query = new AV.Query('Stock');
    
    query.equalTo('code', code);
    query.select(['name']);
    query.first().then(function (name) {
      //this.setData({ stockName: todo.attributes.name })
      //console.log(todo.attributes.name) // √
      //return todo.attributes.name
    }, function (error) {
      // 异常处理
    });
    //return ''
    */
    /*
    new AV.Query('Stock')
      .equalTo('code', code)
      .find()
      .then(name => this.setData({ name }))
      .catch(console.error);
    console.log(name)
    */
  },
  checkTradeTime:function (){
    var myDate = new Date();
    var arr =['9', '10', '11', '13', '14'];
    for(var k = 0, length = arr.length; k<length; k++)
    {
      if (myDate.getHours() == arr[k]) {
        return true;
      }
    }
    return false;
  },
})
