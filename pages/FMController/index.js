// pages/FMController/index.js

import { fengmap } from '../../utils/fengmap.miniprogram.min.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mapLoaded: false, //地图是否加载完成
    focusGroupID: 1,
    mapGroupIDs: [],
    is3D: true,
    isAllLayer: false,
  },
  // 定义全局map变量
  fmap: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
  },

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
          // 初始二维/三维状态,默认3D显示
          defaultViewMode: this.data.is3D ? fengmap.FMViewMode.MODE_3D : fengmap.FMViewMode.MODE_2D,
          // 设置初始指南针的偏移量
          compassOffset: [40, 40],
          // 设置指南针大小
          compassSize: 48,
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

          // 设置楼层数据
          this.loadScrollFloorCtrl();

          // 显示指北针
          this.showCompass();
        })
      })
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

  /**
   * 显示指北针
   */
  showCompass() {
    /**
     * 显示指北针，设置背景色需要在加载指北针之前设置
     * */
    this.fmap.compass.setBgImage('../../images/compass_bg.png'); //设置背景图片
    this.fmap.compass.setFgImage('../../images/compass_fg.png'); //设置前景图片
    this.fmap.showCompass = true;

    // 点击指北针事件, 使角度归0
    this.fmap.on('mapClickCompass', () => {
      this.fmap.rotateTo({
        //设置角度
        to: 0,
        //动画持续时间，默认为。3秒
        duration: 0.3,
        callback: function () { //回调函数
          console.log('rotateTo complete!');
        }
      })
    });
  },

  /**
   * 2D/3D切换
   */
  changeMode() {
    if (this.fmap) {
      if (!this.data.is3D) {
        // 切换地图为三维模式
        this.fmap.viewMode = fengmap.FMViewMode.MODE_3D;
      } else {
        // 切换地图为二维模式
        this.fmap.viewMode = fengmap.FMViewMode.MODE_2D;
      }
    }
    //更改状态
    this.setData({
      is3D: !this.data.is3D
    })
  },


  ///////////////////////////////////////////////
  // 楼层控件回调事件(start)
  //////////////////////////////////////////////
  // 设置楼层数据
  loadScrollFloorCtrl: function () {
    // 获取楼层id
    let groupIDs = [];
    this.fmap.listGroups.map((ls) => {
      let obj = {
        alias: ls.alias,
        gid: ls.gid,
        gname: ls.gname
      }
      groupIDs.push(obj);
      return obj;
    });

    this.setData({
      mapGroupIDs: groupIDs.reverse(),
      focusGroupID: this.fmap.focusGroupID
    })

  },
  // 切换楼层
  switchGroup(e) {
    if (this.fmap) {
      this.fmap.focusGroupID = e.detail;
      this.setData({
        focusGroupID: e.detail
      })
    }
  },

  /**
  * 切换单、多层
  * @param {*} e 
  */
  switchLayers() {
    if (this.fmap) {
      if (!this.data.isAllLayer) {
        this.fmap.visibleGroupIDs = this.fmap.groupIDs;
      } else {
        this.fmap.visibleGroupIDs = [this.fmap.focusGroupID];
      }
    }
    //更改状态
    this.setData({
      isAllLayer: !this.data.isAllLayer
    })
  }

  ///////////////////////////////////////////////
  //楼层控件回调事件(end)
  //////////////////////////////////////////////
})