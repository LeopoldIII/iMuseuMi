// pages/FMLocationMarker/index.js

import { fengmap } from '../../utils/fengmap.miniprogram.min.js';
import LocSDK from '../../utils/locSDK';
var words = ""
Page({
  
  data: {
    mapLoaded: false, //地图是否加载完成
  },
  // 定义全局map变量
  fmap: null,
  //定义定位点marker
  locationMarker: null,
  // 定位sdk实例
  locSDK: null,


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 获取canvas
    wx.createSelectorQuery().select('#fengMap').node().exec((res) => {
      const canvas = res[0].node;
      this.canvas = canvas

      wx.createSelectorQuery().select("#temp").node().exec((tempRes) => {
        const tmpCanvas = tempRes[0].node;

        const fmapID = "1521348558101258241";

        const mapOptions = {
          //必要，地图容器
          canvas: canvas,
          // 必要，2d画布
          tempCanvas: tmpCanvas,
          // 地图默认旋转角度
          defaultControlsPose: 90,
          // 地图默认倾斜角
          defaultTiltAngle: 60,
          //必要，地图应用名称，通过蜂鸟云后台创建
          appName: 'ibeacon室内导航',
          //必要，地图应用密钥，通过蜂鸟云后台获取
          key: '4cc2015750ea1d092def10640abf697c',
        };

        //初始化地图对象
        this.fmap = new fengmap.FMMap(mapOptions);

        //打开Fengmap服务器的地图数据和主题
        this.fmap.openMapById(fmapID, function (error) {
          //打印错误信息
          // console.log(error);
        });

        //地图加载完成事件
        this.fmap.on('loadComplete', () => {
          console.log('地图加载完成');
          this.setData({
            mapLoaded: true
          })

        })
      })
    })

    // 初始化定位sdk
    this.locSDK = new LocSDK();
    // 实时定位
    this.locSDK.updateLocation((data) => {
      if (this.data.mapLoaded) {
        this.addOrMoveLocationMarker(data)
        //wx.startAccelerometer(data)
        this.accelerate(data)
      }
    })


  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.fmap) {
      this.fmap.dispose();
      this.fmap = null;
    }
    if (this.locSDK) {
      this.locSDK.stopUpdateLocation();
    }
  },
  // 手指触摸动作开始
  touchStart(e) {
    this.canvas.dispatchTouchEvent({
      ...e,
      type: 'touchstart'
    })
  },
  // 手指触摸后移动
  touchMove(e) {
    this.canvas.dispatchTouchEvent({
      ...e,
      type: 'touchmove'
    })
  },
  // 手指触摸动作结束
  touchEnd(e) {
    this.canvas.dispatchTouchEvent({
      ...e,
      type: 'touchend'
    })
  },
  // locationMarker
  addOrMoveLocationMarker(data) {
    if (!this.locationMarker) {
      /**
       * fengmap.FMLocationMarker 自定义图片标注对象，为自定义图层
       */
      this.locationMarker = new fengmap.FMLocationMarker(this.fmap, {
        //x坐标值
        x: data.x,
        //y坐标值
        y: data.y,
        //图片地址
        url: '../../images/location.png',
        //楼层id
        groupID: 1,
        //图片尺寸
        size: 48,
        //marker标注高度
        height: 3,
        callback: function () {
          //回调函数
          console.log('定位点marker加载完成！');
        }
      });
      //添加定位点marker
      this.fmap.addLocationMarker(this.locationMarker);
    } else {
      //旋转locationMarker
      this.locationMarker.rotateTo({
        to: data.angle,
        duration: 1
      });
      //移动locationMarker
      this.locationMarker.moveTo({
        x: data.x,
        y: data.y,
        groupID: 1
      });
    }
  },
  
  

  accelerate(data) {
    if(data.iindex < 4 || data.iindex > 17){
      words = "A展厅"
    }
    if(data.iindex>5 && data.iindex<10){
      words = "B展厅"
    }
    if(data.iindex>11 && data.iindex<16){
      words = "C展厅"
    }
    wx.startAccelerometer({
      interval: 'game',
      success:function(){
        console.log('调取成功')
        wx.onAccelerometerChange(function(res){
          if(res.x > 3 || res.y >3 || res.z>3){
            console.log('进来了')
            wx.showToast({
              title: words,
              icon: 'success',
              duration: 2000
            })


          }
        })
      }
    })
  }
  

})

