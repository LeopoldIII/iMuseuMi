// pages/FMOverlayImageMarker/index.js
import { fengmap } from '../../utils/fengmap.miniprogram.min.js';

Page({
  data: {
    mapLoaded: false, //地图是否加载完成
    hasMarker: false, //控制是否可添加图片标注
    changedMarker: false, //控制是否可改变图片标注
    clickedBtn: 0, //点击哪一个按钮
  },
  // 定义全局map变量
  fmap: null,
  // imagemarker对象
  im: null,
  // marker图层
  layer: null,

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
   * 添加图片按钮事件
   */
  addMarkerFunc(e) {
    if (this.data.hasMarker) return;

    //添加图片标注
    this.addImageMarker();

    //修改是否可添加/可更改图片按钮状态
    this.setData({
      hasMarker: true,
      changedMarker: true,
      clickedBtn: e.currentTarget.dataset.type
    })
  },

  /**
   * 更改图片按钮事件
   */
  changeMarkerFunc(e) {
    if (!this.data.changedMarker) return;

    //通过im.url属性修改Marker图片
    this.im.url = '../../images/redImageMarker.png';

    //修改是否可更改图片按钮状态
    this.setData({
      changedMarker: false,
      clickedBtn: e.currentTarget.dataset.type
    })
  },

  /**
   * 更新图片位置(动画)按钮事件
   */
  moveMarkerFunc(e) {
    if (!this.data.hasMarker) return;
    //marker已存在，将imageMarker移动到指定的位置

    this.im.moveTo({
      x: this.im.x + 10,
      y: this.im.y + 10,
      time: 0.3,
      callback: function () {
        console.log("位置更新完毕");
      },
      //更新时的回调函数
      update: function (currentXY) {
        console.log("实时坐标：" + currentXY.x + "," + currentXY.y);
      }
    });

    //停止imageMarker的移动
    //this.im.stopMoveTo();

    this.setData({
      clickedBtn: e.currentTarget.dataset.type
    })
  },

  /**
   * 更新图片位置按钮事件
   */
  changePosFunc(e) {
    if (!this.data.hasMarker) return;
    //marker已存在，设置marker的位置，setPosition ( x, y, gid, height )
    this.im.setPosition(this.im.x + 10, this.im.y + 10, 1, 2)

    this.setData({
      clickedBtn: e.currentTarget.dataset.type
    })
  },

  /**
   * 删除图片按钮事件
   */
  deleteMarkerFunc(e) {
    // 删除layer上所有Marker
    if (this.layer) {
      this.layer.removeAll();
    }

    //修改是否可添加/可更改图片按钮状态
    this.setData({
      hasMarker: false,
      changedMarker: false,
      clickedBtn: e.currentTarget.dataset.type
    })

  },

  /**
   * fengmap.FMImageMarker 自定义图片标注对象，为自定义图层。
   */
  addImageMarker() {
    //获取当前聚焦楼层
    const group = this.fmap.getFMGroup(this.fmap.focusGroupID);

    /*//实例化方法1：自定义图片标注层
     this.layer = new fengmap.FMImageMarkerLayer();
     //添加图片标注层到模型层
     group.addLayer(this.layer);*/

    //实例化方法2：
    //返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
    this.layer = group.getOrCreateLayer('imageMarker');

    //图标标注对象，默认位置为该楼层中心点
    let gpos = group.mapCoord;
    this.im = new fengmap.FMImageMarker(this.fmap, {
      //标注x坐标点
      x: gpos.x,
      //标注y坐标点
      y: gpos.y,
      //设置图片路径
      url: '../../images/blueImageMarker.png',
      //设置图片显示尺寸
      size: 32,
      //标注高度，大于model的高度
      height: 4
    });

    /**
     * imageMarker添加自定义属性
     **/
    this.im.selfAttr = '自定义属性selfAttr';

    this.layer.addMarker(this.im);
  }
})
