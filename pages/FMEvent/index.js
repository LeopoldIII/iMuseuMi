// pages/FMEvent/index.js

import { fengmap } from '../../utils/fengmap.miniprogram.min.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  // 定义全局map变量
  fmap: null,
  // 判断当前是否点击的是poi,控制点击公共设施的时候只弹出公共设施的信息框
  clickedPOI: false,
  // 点击事件ID
  eventID: null,
  // 定义选中模型
  selectedModel: null,

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
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
          //是否支持单击模型高亮，false为单击时模型不高亮
          modelSelectedEffect: false,
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
        })

        /**
         * 地图点击事件
         * 通过点击地图，获取位置坐标
         * */
        this.fmap.on('mapClickNode', (event) => {
          console.log(event);
          if (!event.nodeType) {
            if (this.selectedModel) {
              this.selectedModel.selected = false;
            }
          }
          //地图模型
          const target = event.target;
          if (!target) {
            return;
          }

          let info = '';

          //筛选点击类型,打印拾取信息
          switch (target.nodeType) {
            //地面模型
            case fengmap.FMNodeType.FLOOR:
              if (this.clickedPOI && event.eventInfo.eventID === this.eventID) return;
              info = `地图位置坐标：x:${event.eventInfo.coord.x}，y:${event.eventInfo.coord.y}`;
              if (this.selectedModel) {
                this.selectedModel.selected = false;
              }
              //弹出信息框
              wx.showModal({
                title: '拾取对象类型：地图',
                content: info,
                showCancel: false,
              })
              break;

            //model模型
            case fengmap.FMNodeType.MODEL:
              if (this.clickedPOI && event.eventInfo.eventID === this.eventID) {
                this.clickedPOI = false;
                return;
              }
              //过滤类型为墙的model
              if (target.typeID === 300000) {
                //其他操作
                return;
              }
              info = `FID：${target.FID}
                model中心点坐标：x: ${target.mapCoord.x}，y:${target.mapCoord.y}
                地图位置坐标：x: ${event.eventInfo.coord.x}，y:${event.eventInfo.coord.y}`

              //模型高亮
              if (this.selectedModel && this.selectedModel.FID != target.FID) {
                this.selectedModel.selected = false;
              }
              target.selected = true;
              this.selectedModel = target;

              //弹出信息框
              wx.showModal({
                title: '拾取对象类型：模型',
                content: info,
                showCancel: false,
              })
              break;

            //公共设施、图片标注模型
            case fengmap.FMNodeType.FACILITY:
            case fengmap.FMNodeType.IMAGE_MARKER:
              this.clickedPOI = true;
              this.eventID = event.eventInfo.eventID;
              info = `地图位置坐标：x: ${event.eventInfo.coord.x}，y: ${event.eventInfo.coord.y}`;
              if (this.selectedModel) {
                this.selectedModel.selected = false;
              }
              //弹出信息框
              wx.showModal({
                title: '拾取对象类型：公共设施',
                content: info,
                showCancel: false,
              })
              break;
          }
        })

        //过滤是否可触发点击事件mapClickNode方法的地图元素，返回true为可触发
        this.fmap.pickFilterFunction = function (event) {
          //如设置点击墙模型时不高亮
          if (event.typeID === 300000) {
            return false;
          }
          return true;
        };
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
  }
})