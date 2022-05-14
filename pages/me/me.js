var app = getApp
Page({
  
 /**
  * 页面的初始数据
  */
 data: {
  //用户个人信息
  userInfo:{
   avatarUrl:"",//用户头像
   nickName:"",//用户昵称
  },
  mHidden_1:true,
  mHidden_2:true,
  mHidden_3:true,
  mHidden_4:true,
 },
 //按钮触发1
 changeModel_1:function(){
  this.setData(
    {
      mHidden_1:true
    }
  );
},
modelCancel_1:function(){
 this.setData(
   {
     mHidden_1:true
   }
 );
},
btnTap_1:function(){
 this.setData(
   {
     mHidden_1:false
   }
 );
},


//按钮触发2
changeModel_2:function(){
  this.setData(
    {
      mHidden_2:true
    }
  );
},
modelCancel_2:function(){
 this.setData(
   {
     mHidden_2:true
   }
 );
},
btnTap_2:function(){
 this.setData(
   {
     mHidden_2:false
   }
 );
},


//按钮触发3
changeModel_3:function(){
  this.setData(
    {
      mHidden_3:true
    }
  );
},
modelCancel_3:function(){
 this.setData(
   {
     mHidden_3:true
   }
 );
},
btnTap_3:function(){
 this.setData(
   {
     mHidden_3:false
   }
 );
},


//按钮触发4
changeModel_4:function(){
  this.setData(
    {
      mHidden_4:true
    }
  );
},
modelCancel_4:function(){
 this.setData(
   {
     mHidden_4:true
   }
 );
},
btnTap_4:function(){
 this.setData(
   {
     mHidden_4:false
   }
 );
},


 /**
  *点击添加地址事件
  */
 add_address_fun:function(){
  wx.navigateTo({
   url: 'add_address/add_address',
  })
 },
  
 /**
  * 生命周期函数--监听页面加载
  */
 onLoad: function (options) 
 {
  var that=this;
  /**
   * 获取用户信息
   */
  wx.getUserInfo({
   success:function(res){
    console.log(res);
    var avatarUrl = 'userInfo.avatarUrl';
    var nickName = 'userInfo.nickName';
    that.setData({
     [avatarUrl]: res.userInfo.avatarUrl,
     [nickName]:res.userInfo.nickName,
    })
   }
  })
},
/** 
 * 生命周期函数--监听页面初次渲染完成
*/
onReady:function(){
},
})

