// pages/FMOverlayLineMarker/index.js
import { fengmap } from '../../utils/fengmap.miniprogram.min.js';
import { naviResults, naviResults2 } from '../../utils/coordinates';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    mapLoaded: false, //地图是否加载完成
    addLineState: true, //是否能画线状态开关
    clickedBtn: 0, //点击哪一个按钮
  },
  // 定义全局map变量
  fmap: null,
  // 当前的路线
  naviLines: [],

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
   * 添加线标注按钮事件
   */
  addMarkerFunc(e) {
    if (!this.data.addLineState) return;

    //配置第一条路径线的线型、线宽、透明度等参数
    let lineStyle1 = {
      //设置线的宽度
      lineWidth: 5,
      //关闭平滑线功能
      smooth: false,
      //设置FMARROW线型线的颜色，十六进制颜色值
      // godColor: '#FF0000',
      //设置FMARROW线型线边线的颜色,十六进制颜色值
      // godEdgeColor: '#FF0000',
      //设置线的类型为导航线
      lineType: fengmap.FMLineType.FMARROW,
      //设置线动画,false为动画
      noAnimate: true
    };

    //绘制第一条路径线
    this.drawLines(naviResults, lineStyle1);

    //配置第二条路径线的线型、颜色、线宽、透明度等
    let lineStyle2 = {
      //设置线的宽度
      lineWidth: 5,
      //设置线的类型
      lineType: fengmap.FMLineType.FULL,
      //设置线的颜色, 只支持修改非FMARROW线型的线的颜色
      color: '#FF0000'
    };
    //绘制第二条路径线
    this.drawLines(naviResults2, lineStyle2);

    this.setData({
      addLineState: false,
      clickedBtn: e.currentTarget.dataset.type
    })
  },

  /**
   * 删除线标注按钮事件
   */
  deleteMarkerFunc(e) {
    //清除线标注
    this.clearNaviLines();

    this.setData({
      addLineState: true,
      clickedBtn: e.currentTarget.dataset.type
    })
  },

  /**
   * 绘制线图层
   * fengmap.FMLineMarker为线图层，可包含很多条折线类FMSegment。
   */
  drawLines(results, lineStyle) {
    //创建路径线图层
    let line = new fengmap.FMLineMarker();
    //循环results中坐标点集合，通过坐标点绘制路径线
    for (let i = 0; i < results.length; i++) {
      let result = results[i];
      let gid = result.groupId;
      let points = result.points;
      //创建FMSegment点集，一个点集代表一条折线
      let seg = new fengmap.FMSegment();
      seg.groupId = gid;
      seg.points = points;
      //将FMSegment绘制到线图层上
      line.addSegment(seg);
      //绘制线
      this.fmap.drawLineMark(line, lineStyle);
      this.naviLines.push(line);
    }
  },
  /**
   * 清除路径线
   */
  clearNaviLines() {

    //方法一：清除所有路径线
    this.fmap.clearLineMark();

    //方法二：清除所有路径线
    /*if (this.naviLines.length != 0) {
        for (let i = 0; i < this.naviLines.length; i++) {
            if (this.naviLines[i])
                this.fmap.clearLineMark(this.naviLines[i]);
        }
        this.naviLines = [];
    }*/

    //方法三：清除所有路径线
    /*if (this.naviLines.length != 0) {
        for (let i = 0; i < this.naviLines.length; i++) {
            if (this.naviLines[i]) {
                //移除路径线
                this.fmap.removeLineMarker(this.naviLines[i]);
            }
        }
        this.naviLines = [];
    }*/
  },
})