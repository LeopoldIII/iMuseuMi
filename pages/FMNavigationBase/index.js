// pages/FMNavigationBase/index.js

import { fengmap } from '../../utils/fengmap.miniprogram.min.js';

var washroom = 0
var elevator = 0
var exit = 0
var path = 0
var demostrate = 0
Page({
  data: {
    mapLoaded: false, //地图是否加载完成
    focusGroupID: 1,
    mapGroupIDs: [],
    is3D: true,
    isAllLayer: false,
  },
  // 定义全局map变量
  fmap: null,
  // 定义路径规划对象
  naviAnalyser: null,
  /**
   * 定义点击次数变量
   * 第一次获取起点，第二次获取终点，获取终点之后用户必须再次点击计算路线按钮才能开始拾取新的起点和终点
   */
  clickCount: 0,
  // 判断起点是否是同一处坐标
  lastCoord: null,
  // 起终点坐标
  coords: [],
  tmp_coords: {},
  // 定义markert图层数组
  layers: [],

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
          /**
           * fengmap.FMNaviAnalyser 是可分析最短路径、最快路径并返回分析结果的路径类
           */
          this.naviAnalyser = new fengmap.FMNaviAnalyser(this.fmap);

        })

        /**
         * 地图点击事件
         * 第一次点击选取为起点，第二次点击选取为终点，再次点击路径规划按钮重新选取起点、终点
         */
        
        this.fmap.on('mapClickNode', (event) => {
          this.showRoute();
          if(path >0){

            if (path>1){
              path = 0;
              this.resetNaviRoute();
              demostrate = 0;
            }
            else{
              if(demostrate!=4){
                demostrate = 4;
                this.resetNaviRoute();
                exit = 0;
                washroom = 0;
                elevator = 0;
              }
              if (event.target && event.target.nodeType == fengmap.FMNodeType.MODEL && this.naviAnalyser) {
                //封装点击坐标，模型中心点坐标
                //this.resetNaviRoute();
      
                // var coord = this.data.tmp_coords;
      
                const coord = {
                  x: event.target.mapCoord.x,
                  y: event.target.mapCoord.y,
                  groupID: event.target ? event.target.groupID : 1,
                  //print(groupID)
                };
                //第一次点击
                if (this.clickCount === 0) {
                  //记录点击坐标
                  this.lastCoord = coord;
                  //设置起点坐标
                  this.coords[0] = coord;
      
                  //添加起点imageMarker
                  this.addMarker(coord, 'start');
                } else if (this.clickCount === 1) {
                  //第二次点击，添加终点并画路线
                  //判断起点和终点是否相同
                  if (this.lastCoord.x === coord.x && this.lastCoord.y === coord.y) {
                    return;
                  }
      
                  //设置终点坐标
                  this.coords[1] = coord;
                  //添加终点imageMarker
                  this.addMarker(coord, 'end');
      
                  //设置完起始点后，调用此方法画出导航线
                  this.drawNaviLine();
                } else {
                  //第三次点击，重新开始选点进行路径规划
                  //重置路径规划
                  this.resetNaviRoute();
      
                  //记录点击坐标
                  this.lastCoord = coord;
                  //设置起点坐标
                  this.coords[0] = coord;
                  //添加起点imageMarker
                  this.addMarker(coord, 'start');
                }
                this.clickCount++;
              
              }
            }
          }
        });

        //点击按钮

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

  showRoute(){

    if (washroom>0){  //选择洗手间
      if (demostrate !=1){
        demostrate =1;
        path = 0;
        elevator = 0;
        exit = 0;
        this.resetNaviRoute();
        const coord0 = {
          
          x: 12949093,
          y: 4866577,
          groupID: 1
        };
        this.coords[0] = coord0;
        this.addMarker(coord0, 'start');
        const coord1 = {
          x: 12949143.298,
          y: 4866592.376,
          groupID: 1
        };
        this.coords[1] = coord1;
        this.addMarker(coord1, 'end');
        //设置完起始点后，调用此方法画出导航线
        this.drawNaviLine();
        //this.clickCount=2;
        
        
      }
      else{
        if (washroom >1){
          washroom = 0;
          this.resetNaviRoute();
          demostrate = 0;
        }
      }
      
    }
    if(elevator >0){  //选择电梯
      if (demostrate !=2){
        demostrate =2;
        path = 0;
        washroom = 0;
        exit = 0;
        this.resetNaviRoute();
        const coord0 = {    //应改为：读取当前坐标
          
          x: 12949093,
          y: 4866577,
          groupID: 1
        };
        this.coords[0] = coord0;
        this.addMarker(coord0, 'start');
        const coord1 = {   //电梯在图中位置坐标
          x: 12949133.399,
          y: 4866583.074,
          groupID: 1
        };
        this.coords[1] = coord1;
        this.addMarker(coord1, 'end');
        //设置完起始点后，调用此方法画出导航线
        this.drawNaviLine();
        //this.clickCount=2;
      }
      
      else{
        if (elevator >1){
          this.resetNaviRoute();
          demostrate = 0;
          elevator = 0;
        }
      }
    }
    if(exit >0){   //选择安全出口
      if (demostrate!=3){
        demostrate=3;
        this.resetNaviRoute();
        path = 0;
        washroom = 0;
        elevator = 0;
        const coord0 = {
          x: 12949093,
          y: 4866577,
          groupID: 1
        };
        this.coords[0] = coord0;
        this.addMarker(coord0, 'start');
        const coord1 = {
          x: 12949122.992,
          y: 4866575.344,
          
          groupID: 1
        };
        this.coords[1] = coord1;
        this.addMarker(coord1, 'end');
        //设置完起始点后，调用此方法画出导航线
        this.drawNaviLine();
        //this.clickCount=2;
      }
      
      
      else{
        if (exit>1){
          exit = 0;
          this.resetNaviRoute();
          demostrate = 0;
        }
      }
      
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

  
  searchPublicPlace1() {
    washroom ++;
    this.showRoute();
  },
  searchPublicPlace2() {
    elevator ++;
    this.showRoute();
  },
  searchPublicPlace3() {
    exit ++;
    this.showRoute();
  },
  searchPublicPlace4() {
    path ++;
    if (path>1){
      path = 0;
      this.resetNaviRoute();
      demostrate = 0;
    }
    if(demostrate!=4){
      demostrate = 4;
      this.resetNaviRoute();
      exit = 0;
      washroom = 0;
      elevator = 0;
    }
  },
  /**
   * 画导航线
   */
  drawNaviLine() {

    //根据已加载的fengmap.FMMap导航分析，判断路径规划是否成功
    const analyzeNaviResult = this.naviAnalyser.analyzeNavi(this.coords[0].groupID, this.coords[0], this.coords[1].groupID, this.coords[1], fengmap.FMNaviMode.MODULE_SHORTEST);
    if (fengmap.FMRouteCalcuResult.ROUTE_SUCCESS != analyzeNaviResult) {
      return;
    }

    //获取路径分析结果对象，所有路线集合
    let results = this.naviAnalyser.getNaviResults();

    //初始化线图层
    let line = new fengmap.FMLineMarker();
    for (let i = 0; i < results.length; i++) {
      let result = results[i];
      //楼层id
      let gid = result.groupId;
      //路径线点集合
      let points = result.getPointList();

      let points3d = [];
      points.forEach(function (point) {
        points3d.push({
          //x坐标点
          'x': point.x,
          //y坐标点
          'y': point.y,
          //线标注高度
          'z': 1
        });
      });

      /**
       * fengmap.FMSegment点集，一个点集代表一条折线
       */
      let seg = new fengmap.FMSegment();
      seg.groupId = gid;
      seg.points = points3d;
      line.addSegment(seg);
    }

    //配置线型、线宽、透明度等
    let lineStyle = {
      //设置线的宽度
      lineWidth: 6,
      //设置线的透明度
      alpha: 0.8,
      //设置线的类型为导航线
      lineType: fengmap.FMLineType.FMARROW,
      //设置线动画,false为动画
      noAnimate: true
    };

    //画线
    this.fmap.drawLineMark(line, lineStyle);
  },

  /**
   * 重置路径规划
   */
  resetNaviRoute() {
    //清空导航线
    console.log("clean");
    this.clearNaviLine();
    //清空起点、终点marker
    this.deleteMarker();
    //重置地图点击次数
    this.clickCount = 0;
    //重置上一次点击坐标对象
    this.lastCoord = null;
  },

  /**
   * 清空导航线
   */
  clearNaviLine() {
    //清空导航线
    this.fmap.clearLineMark();
  },

  /**
   * 添加起点终点marker
   * coord: 模型中心点坐标
   * type: start-起点坐标， end-终点坐标
   */
  addMarker(coord, type) {
    //获取目标点层
    let group = this.fmap.getFMGroup(coord.groupID);
    //创建marker，返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
    let layer = group.getOrCreateLayer('imageMarker');
    //判断该楼层layer是否存在，清除marker时需要将所有楼层marker都清除
    let isExistLayer = this.layers.some(function (item, index, array) {
      return item.groupID === coord.groupID;
    });
    if (!isExistLayer) {
      this.layers.push(layer);
    }
    let markerUrl = '';
    if (type === 'start') {
      markerUrl = '../../images/start.png';
    } else {
      markerUrl = '../../images/end.png';
    }
    //图标标注对象，默认位置为该楼层中心点
    let im = new fengmap.FMImageMarker(this.fmap, {
      x: coord.x,
      y: coord.y,
      //设置图片路径
      url: markerUrl,
      //设置图片显示尺寸
      size: 32,
      //marker标注高度
      height: 2
    });
    //添加imageMarker
    layer.addMarker(im);
  },

  /**
   * 清空图片marker事件
   */
  deleteMarker() {
    //删除layer上所有Marker
    this.layers.forEach(function (layer, index) {
      if (layer) {
        layer.removeAll();
      }
    });
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
