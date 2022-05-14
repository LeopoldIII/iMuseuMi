// pages/FMNaviReal/index.js

import { fengmap } from '../../utils/fengmap.miniprogram.min.js';
import { locationCoords, naviRealPoints } from '../../utils/coordinates';


Page({
  data: {
    mapLoaded: false, //地图是否加载完成
    focusGroupID: 1,
    mapGroupIDs: [],
    expand: true, //展开控件
    enableExpand: true, //是否允许展开控件操作
    distance: 0,
    minutes: 0,
    seconds: 0,
    prompt: '',
    naviStoped: false,  //导航是否结束
  },
  // 定义全局map变量
  fmap: null,
  // 定位点marker
  locationMarker: null,
  // 导航前地图缩放比例
  startNaviScaleLevel: 20,
  // 导航过程中地图缩放比例
  naviScaleLevel: 22,
  // 导航对象
  navi: null,
  // 导航开关
  naviSwitch: true,
  // 距离终点的最大距离，结束导航 单位：米
  maxEndDistance: 5,
  // 路径偏移的最大距离，单位：米
  maxOffsetDis: 15,
  // 路径偏移的最小距离，在最小距离以内坐标点自动约束到路径线上
  minOffsetDis: 3,
  // 路径线真实坐标点数据
  coordsData: [],
  //定位点下标
  coordIndex: 0,
  // 当前定位点原始坐标
  currentCoord: null,
  // 导航请求定位点定时器
  naviInt: null,

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
          // defaultControlsPose: 90,
          // 地图默认倾斜角
          // defaultTiltAngle: 60,
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

          //加载楼层切换控件
          this.initFloorControl();

          //添加初始定位点图标
          this.addlocationMarker(naviRealPoints[0]);

          //地图加载完执行画导航路径
          this.createNavi(naviRealPoints);

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
      clearTimeout(this.naviInt);
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
  ///////////////////////////////////////////////
  // 楼层控件回调事件(start)
  //////////////////////////////////////////////
  /**
   * 设置楼层数据
   */
  initFloorControl() {
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
  switchGroup(e, groupID) {
    if (this.fmap) {
      let focusGroupID = groupID !== undefined ? groupID : e.detail
      this.fmap.focusGroupID = focusGroupID;
      this.setData({
        focusGroupID: focusGroupID
      })
    }
  },
  ///////////////////////////////////////////////
  //楼层控件回调事件(end)
  //////////////////////////////////////////////

  /**
   * 添加定位点marker
   */
  addlocationMarker(coord) {

    this.locationMarker = new fengmap.FMLocationMarker(this.fmap, {
      //设置图片的路径
      url: '../../images/pointer.png',
      //设置图片显示尺寸
      size: 43,
      //设置图片高度
      height: 3
    });

    //添加定位点标注
    this.fmap.addLocationMarker(this.locationMarker);

    //设置定位图标位置
    this.setLocationMakerPosition(coord);
  },

  /**
   * 设置定位标注点位置信息
   */
  setLocationMakerPosition(coord, angle) {
    //设置定位图标旋转角度
    if (angle) {
      //定位点方向始终与路径线保持平行
      this.locationMarker.rotateTo({
        to: -angle,
        duration: 0.5
      });
      //第一人称需旋转地图角度
      this.fmap.rotateTo({
        to: angle,
        time: 0.5
      });
    }

    //不同楼层
    let currentGid = this.fmap.focusGroupID;
    if (currentGid !== coord.groupID) {
      //重新设置聚焦楼层
      this.switchGroup(null, coord.groupID)

      //设置locationMarker的位置
      this.locationMarker.setPosition({
        //设置定位点的x坐标
        x: coord.x,
        //设置定位点的y坐标
        y: coord.y,
        //设置定位点所在楼层
        groupID: coord.groupID
      });
    }

    //移动locationMarker
    let data = {
      //设置定位点的x坐标
      x: coord.x,
      //设置定位点的y坐标
      y: coord.y,
      //设置定位点所在楼层
      groupID: coord.groupID,
      time: 0.5
    };

    //移动地图
    this.fmap.moveTo({
      x: coord.x,
      y: coord.y,
      groupID: coord.groupID,
      time: 1
    });
    //移动locationMarker
    this.locationMarker.moveTo(data);
  },

  /**
   * 创建导航
   * fengmap.FMNavigation 导航相关的控制类,封装了自动设置起始点标注，路径分析，模拟导航，导航动画的功能。
   */
  createNavi(coords) {
    if (!this.navi) {
      //初始化导航对象
      this.navi = new fengmap.FMNavigation({
        //地图对象
        map: this.fmap,
        //导航结果文字描述内容的语言类型参数, 目前支持中英文。参考FMLanguaeType。
        naviLanguage: fengmap.FMLanguageType.ZH,
        //导航中路径规划模式, 支持最短路径、最优路径两种。默认为MODULE_SHORTEST, 最短路径。
        naviMode: fengmap.FMNaviMode.MODULE_SHORTEST,
        //导航中的路线规划梯类优先级, 默认为PRIORITY_DEFAULT, 详情参考FMNaviPriority。
        naviPriority: fengmap.FMNaviPriority.PRIORITY_DEFAULT,
        //调用drawNaviLine绘制导航线时, 是否清除上次调用drawNaviLine绘制的导航线, 默认为true
        autoClearNaviLine: true,
        //导航线与楼层之间的高度偏移设置。默认是1。
        lineMarkerHeight: 1.5,
        // 设置导航线的样式
        lineStyle: {
          // 导航线样式
          lineType: fengmap.FMLineType.FMARROW,
          // 设置线的宽度
          lineWidth: 6,
          //设置线动画,false为动画
          noAnimate: true
        }
      });
    }

    //添加起点
    this.navi.setStartPoint({
      x: coords[0].x,
      y: coords[0].y,
      groupID: coords[0].groupID,
      url: '../../images/start.png',
      size: 32
    });

    //添加终点
    this.navi.setEndPoint({
      x: coords[1].x,
      y: coords[1].y,
      groupID: coords[1].groupID,
      url: '../../images/end.png',
      size: 32
    });

    // 画出导航线
    this.navi.drawNaviLine();

    //解析定位点数据
    this.analyseLocationData(0);

    //监听导航事件
    this.navi.on('walking', (data) => {

      /**
       * 当定位点偏离路径线大于约定的最大偏移距离时，进行路径重新规划
       */
      if (data.distance > this.minOffsetDis) {
        //在最小和最大偏移距离之间，坐标点用原始定位坐标
        data.point = this.currentCoord;
      }

      //更新导航信息
      this.setNaviDescriptions(data);

      //更新定位图标的位置及旋转角度
      this.setLocationMakerPosition(data.point, data.angle);
      if (data.distance > this.maxOffsetDis) {
        console.log('路径偏移，重新规划路线');
        clearTimeout(this.naviInt);
        //重新设置起终点坐标，画路径线，重新开始导航
        this.resetNaviRoute(data.point);
        return;
      }

      /**
       * 当剩余距离小于设置的距离终点的最小距离时，自动结束导航
       */
      if (data.remain < this.maxEndDistance || data.remain == 0) {
        console.log('距离小于设置的距离终点的最小距离，导航自动结束');
        //结束导航
        this.stopNavi();
        this.setData({
          naviStoped: true
        })
        return;
      }
    });
  },

  /**
   * 定位点数据解析，模拟数据点
   * 真实项目中应该通过定位接口进行实时定位
   * firstRoute:路径偏移前定位点集合
   * seconedRoute:路径偏移后重新路径规划定位点集合
   */
  analyseLocationData(type) {
    if (type === 0) {
      //第一条路径线模拟坐标点
      this.coordsData = locationCoords['firstRoute'];
    } else {
      //重新规划后路径线模拟坐标点
      this.coordsData = locationCoords['seconedRoute'];
    }
  },

  /**
   * 定位真实导航坐标
   */
  changeCoord() {
    clearTimeout(this.naviInt);
    //定时器
    this.naviInt = setTimeout(() => {
      if (!this.fmap || !this.navi) return;

      if (this.coordIndex >= this.coordsData.length || this.data.naviStoped) {
        this.stopNavi();
        return;
      }
      this.currentCoord = this.coordsData[this.coordIndex];

      /**
       * 1.用于真实导航，设置定位系统所返回的真实定位坐标，内部自动路径约束，同时触发walking事件
       * 返回如下结果： {remain: 到终点的剩余距离, walk: 已经走过的距离, distanceToNext: 是下一个转角处的距离,
       * angle: 当前路线与正北方向的角度, index: 当前路段的索引, point: 路径约束后的点, groupID, 当前的楼层id}
       */
      this.navi.locate(this.currentCoord);

      /**
       * 2.用于真实导航，设置定位系统所返回的真实定位坐标，内部无路径约束，同时触发walking事件，
       * 返回如下结果： {remain: 到终点的剩余距离, walk: 已经走过的距离, distanceToNext: 是下一个转角处的距离,
       * angle: 当前路线与正北方向的角度, index: 当前路段的索引, point: 路径约束后的点, groupID, 当前的楼层id}
       * 此方法与locate的区别为内部不在内部自动计算约束
       */
      /*this.navi.locateNoConstraint(this.currentCoord);*/

      this.coordIndex++;
      this.changeCoord();
    }, 500);
  },

  /**
   * 路径偏移，进行路径重新规划
   */
  resetNaviRoute(coordItem) {

    if (!this.navi) {
      return;
    }

    //重置导航参数
    this.coordIndex = 0;

    //更新起点坐标
    this.navi.setStartPoint({
      x: coordItem.x,
      y: coordItem.y,
      groupID: coordItem.groupID,
      url: '../../images/start.png',
      size: 32
    });

    //更新终点坐标
    this.navi.setEndPoint({
      x: naviRealPoints[1].x,
      y: naviRealPoints[1].y,
      groupID: naviRealPoints[1].groupID,
      url: '../../images/end.png',
      size: 32
    });

    //画路径线
    this.navi.drawNaviLine();

    //初始化第二段路径线的起点
    this.analyseLocationData(1);

    //导航开始
    this.changeCoord();
  },

  /**
   * 开始导航
   */
  startNavi() {

    if (!this.naviSwitch) {
      return;
    }

    //导航结束之后再次点击开始导航，需重新进行路线规划及模拟定位点
    if (this.data.naviStoped) {
      this.createNavi(naviRealPoints);
      this.setData({
        naviStoped: false
      })
    }

    //导航开关为true且已经加载完locationMarker是可进行导航操作
    if (this.naviSwitch && this.locationMarker) {
      this.naviSwitch = false;
      this.coordIndex = 0;
      //切换聚焦楼层为起点开始楼层
      if (this.navi.startMarker.groupID !== this.fmap.focusGroupID) {
        this.switchGroup(null, this.navi.startMarker.groupID)
      }
      //将定位点定位到起点楼层
      if (this.locationMarker.groupID != this.navi.startMarker.groupID) {
        //设置locationMarker的位置
        this.locationMarker.setPosition({
          //设置定位点的x坐标
          x: this.navi.startMarker.x,
          //设置定位点的y坐标
          y: this.navi.startMarker.y,
          //设置定位点所在楼层
          groupID: this.navi.startMarker.groupID
        });
      }
      //获取地图开始导航前地图缩放比例
      this.startNaviScaleLevel = this.fmap.mapScaleLevel;
      //放大导航地图
      this.fmap.mapScaleLevel = {
        level: this.naviScaleLevel,
        duration: 0.5,
        callback: function () { }
      };
      //禁用楼层切换控件
      this.setData({
        expand: false,
        enableExpand: false
      })
      //将地图的倾斜角度缓动至
      this.fmap.tiltTo({
        to: 80,
        duration: 1
      });
      //导航开始
      this.changeCoord();

    }
  },

  /**
   * 结束导航，重置导航开关参数
   */
  stopNavi() {
    //修改导航状态
    this.naviSwitch = true;
    this.setData({
      naviStoped: true,
      enableExpand: true
    })
    //还原导航前地图缩放比例
    this.fmap.mapScaleLevel = {
      level: this.startNaviScaleLevel,
      duration: 0.5,
      callback: function () { }
    };
    clearTimeout(this.naviInt);
  },

  /**
   * 距离、时间信息展示
   */
  setNaviDescriptions(data) {
    //距终点的距离
    let distance = data.remain;
    //路线提示信息
    let prompt = this.navi.naviDescriptions[data.index];
    if (distance < this.maxEndDistance) {
      // 导航结束
      this.stopNavi();
      this.setData({
        naviStoped: true
      })
      return;
    }
    //普通人每分钟走80米。
    let time = distance / 80;
    let m = parseInt(time);
    let s = Math.floor((time % 1) * 60);

    //距离终点距离、时间信息展示
    this.setData({
      naviStoped: false,
      distance: distance.toFixed(1),
      minutes: m,
      seconds: s,
      prompt: prompt,
    })
  },
})
