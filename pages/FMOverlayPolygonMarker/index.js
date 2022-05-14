// pages/FMOverlayPolygonMarker/index.js
import { fengmap } from '../../utils/fengmap.miniprogram.min.js';
import { coords } from '../../utils/coordinates';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mapLoaded: false, //地图是否加载完成
    hasMarker: false, //控制是否可添加图片标注
    clickedBtn: 0, //点击哪一个按钮
  },
  // 定义全局map变量
  fmap: null,
  // 定义多边形图层
  layer: null,
  // 矩形标注
  rectangleMarker: null,
  // 圆形标注
  circleMaker: null,
  // 自定义形状标注
  polygonMarker: null,

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
            mapLoaded: true,
          })
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
   * 添加多边形标注按钮事件
   */
  addMarkerFunc(e) {
    if (this.data.hasMarker) return;
    //添加多边形标注
    this.addPolygonMarker();

    //修改可添加状态
    this.setData({
      hasMarker: true,
      clickedBtn: e.currentTarget.dataset.type
    })
  },

  /**
   * 删除多边形标注按钮事件
   */
  deleteMarkerFunc(e) {
    if (this.layer) {
      //移除该层的所有标注
      this.layer.removeAll();
    }

    //修改可添加状态
    this.setData({
      hasMarker: false,
      clickedBtn: e.currentTarget.dataset.type
    })
  },

  /**
   * 为第一层的模型添加多边形标注图层
   */
  addPolygonMarker() {
    //获取当前聚焦楼层
    let group = this.fmap.getFMGroup(this.fmap.focusGroupID);
    //返回当前层中第一个polygonMarker,如果没有，则自动创建
    this.layer = group.getOrCreateLayer('polygonMarker');

    //创建矩形标注
    this.createRectangleMaker();
    this.layer.addMarker(this.rectangleMarker);

    //创建圆形标注
    this.createCircleMaker();
    this.layer.addMarker(this.circleMaker);

    //创建自定义形状标注
    this.createPolygonMaker(coords);
    this.layer.addMarker(this.polygonMarker);
  },

  /**
   * 创建矩形标注
   * fengmap.FMPolygonMarker 自定义图片标注对象
   */
  createRectangleMaker() {
    this.rectangleMarker = new fengmap.FMPolygonMarker({
      //设置颜色
      color: '#9F35FF',
      //设置透明度
      alpha: 0.3,
      //设置边框线的宽度
      lineWidth: 3,
      //设置高度
      height: 5,
      //多边形的坐标点集数组
      points: {
        //设置为矩形
        type: 'rectangle',
        //设置此形状的中心坐标
        center: {
          x: 1.2961583E7,
          y: 4861865.0
        },
        //矩形的起始点设置，代表矩形的左上角。优先级大于center。
        /*startPoint: {
         x: 1.2961583E7,
         y: 4861865.0
         },*/
        //设置矩形的宽度
        width: 30,
        //设置矩形的高度
        height: 30
      }
    });
  },

  /**
   * 创建圆形标注
   */
  createCircleMaker() {
    this.circleMaker = new fengmap.FMPolygonMarker({
      //设置颜色
      color: '#3CF9DF',
      //设置透明度
      alpha: .3,
      //设置边框线的宽度
      lineWidth: 3,
      //设置高度
      height: 6,
      //多边形的坐标点集数组
      points: {
        //设置为圆形
        type: 'circle',
        //设置此形状的中心坐标
        center: {
          x: 1.2961644E7,
          y: 4861874.0
        },
        //设置半径
        radius: 30,
        //设置段数，默认为40段
        segments: 40
      }
    });
  },

  /**
   * 创建自定义形状标注
   * @param {*} coords 多边形的坐标点集数组
   */
  createPolygonMaker(coords) {
    //实例化polygonMarker
    this.polygonMarker = new fengmap.FMPolygonMarker({
      //设置透明度
      alpha: 0.5,
      //设置边框线的宽度
      lineWidth: 3,
      //设置高度
      height: 7,
      //多边形的坐标点集数组
      points: coords
    });
  },
})