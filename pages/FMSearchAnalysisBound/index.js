// pages/FMSearchAnalysisBound/index.js

import { fengmap } from '../../utils/fengmap.miniprogram.min.js';

Page({
  data: {
    mapLoaded: false, //地图是否加载完成
    radius: '',
  },
  // 定义全局map变量
  fmap: null,
  // 定义多边形
  polygonLayer: null,
  // 搜索结果列表
  resTableDom: null,
  // 定义搜索分析类
  searchAnalyser: null,
  // 定义选中模型
  selectedModel: null,

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
          this.setData({
            mapLoaded: true
          })
          /**
           * fengmap.FMSearchAnalyser 是可根据类型、ID、楼层ID、名称、关键字模糊查找模型、公共设施、文本标签、自定义图层或所有图层的分析类。
           */
          this.searchAnalyser = new fengmap.FMSearchAnalyser(this.fmap);
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
   * 文本框事件
   */
  bindInput(e) {
    const value = e.detail.value;
    this.setData({
      radius: value
    })
  },
  /**
   * 周边查询
   */
  searchByRadius() {
    const { radius } = this.data;

    //重置页面渲染
    this.resetRender();

    if (radius === '') {
      return;
    }

    //创建搜索条件对象
    let requestParam = {};
    requestParam.groupID = this.fmap.focusGroupID;
    requestParam.nodeType = fengmap.FMNodeType.MODEL;
    requestParam.circle = {
      //查询范围中心点坐标
      center: {
        //x: this.fmap.center.x,
        //y: this.fmap.center.y
        x: 12951215,
        y: 4839299
      },
      radius: radius //查询范围半径
    };
    let searchRes = this.searchByParams(requestParam);

    console.log('周边查询结果', searchRes)

    //创建圆形标注
    this.addCircleMaker(radius);

    //添加marker
    if (searchRes.length > 0) {
      for (let i = 0; i < searchRes.length; i++) {
        let model = searchRes[i];
        //添加marker
        this.addMarkers(model);
      }
    }
  },

  /**
   * 重置页面渲染
   */
  resetRender() {

    //移除marker
    this.removeMarkers();

    //移除polygonMarker
    this.removePolygonMarkers();

  },

  /**
   * 根据参数信息进行搜索
   * keyword: 搜索关键字
   * gids： 楼层id，'all':所有楼层
   * nodeType：fengmap.FMNodeType
   * fid: 模型FID,整个建筑内唯一ID
   */
  searchByParams(params) {
    if (this.fmap == null) {
      return;
    }

    /**
     * fengmap.FMSearchRequest 是可设置查询类型，查询关键字的请求类
     */
    let searchRequest = new fengmap.FMSearchRequest();

    //配置groupID参数
    if (params.groupID) {
      searchRequest.groupID = params.groupID
    }

    //配置FID参数
    if (params.FID) {
      searchRequest.FID = params.FID;
    }

    //配置nodeType参数
    if (params.nodeType != null) {
      searchRequest.nodeType = params.nodeType;
    }

    //周边查询
    if (params.circle) {
      searchRequest.circle = params.circle;
    }

    /**
     * 根据请求对象查询分析方法
     */
    let searchType = ['SINGLE'];
    if (params.circle) {
      searchType.push('CIRCLE');
    }
    let sortRes = this.searchAnalyser.getQueryResult(searchRequest, searchType);

    return sortRes;
  },

  /**
   * 根据FID搜索地图
   */
  findModelByFid(fid) {
    let params = {};
    params.FID = fid;
    params.nodeType = fengmap.FMNodeType.MODEL;
    let result = searchByParams(params);
    if (result.length > 0) {
      let model = result[0];
      //打印model信息
      console.log('选中model信息', model);
      if (model != null) {

        //视野中心移动到指定位置,如果不是当前聚焦层，将先设置目标层为聚焦层在跳转
        let coord = {
          x: model.mapCoord.x,
          y: model.mapCoord.y,
          groupID: model.groupID
        };
        this.fmap.moveTo(coord);

        //渲染当前设置的模型元素处于高亮状态
        let target = model.target;
        if (target) {
          if (this.selectedModel && this.selectedModel.FID != target.FID) {
            this.selectedModel.selected = false;
          }
          target.selected = true;
          this.selectedModel = target;
        }
      }
    }
  },

  /**
   * 根据model对象添加Marker
   */
  addMarkers(model) {
    //获取当前聚焦楼层
    const group = this.fmap.getFMGroup(model.groupID);
    //返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
    const layer = group.getOrCreateLayer('imageMarker');
    //模型中心点坐标
    const coord = model.mapCoord;
    //创建imageMarker
    const im = new fengmap.FMImageMarker(this.fmap, {
      x: coord.x,
      y: coord.y,
      height: 2,
      url: '../../images/blueImageMarker.png',
      size: 32
    });
    layer.addMarker(im);
  },

  /**
   * 删除Marker
   */
  removeMarkers() {
    //获取多楼层Marker
    this.fmap.getLayerByAlias(this.fmap.focusGroupID, 'imageMarker', function (layer) {
      if (layer) {
        //移除该层的所有图片标注
        layer.removeAll();
      }
    });
  },

  /**
   * 删除FMPolygonMarker
   */
  removePolygonMarkers() {
    //获取多楼层Marker
    if (!this.polygonLayer) return;
    this.polygonLayer.removeAll();
  },

  /**
   * 渲染搜索结果列表展示
   */
  renderSearchResult(result) {
    let tableCont = document.getElementById('tableCont');
    if (result && result.length > 0) {
      let resultHtml = '';
      for (let i in result) {
        let model = result[i];
        let num = parseInt(i) + parseInt(1);
        let modelName = model.name ? model.name : '<空>';
        resultHtml += '<tr onClick="findModelByFid(\'' + model.FID + '\')"><td>' + num + '</td><td>' +
          modelName + '</td><td>' + model.FID + '</td><td>' + model.groupID + '</td><td>' + model.mapCoord
            .x + '</td><td>' + model.mapCoord.y + '</td><td>' + model.mapCoord.z + '</td></tr>';
      }
      tableCont.innerHTML = resultHtml;
      this.resTableDom.style.display = 'block';
    } else {
      tableCont.innerHTML = '';
      this.resTableDom.style.display = 'none';
    }

    //点击行选中行颜色
    let trDom = tableCont.childNodes;
    for (let i = 0; i < trDom.length; i++) {
      trDom[i].addEventListener("click", function (event) {
        let parentNode = event.target.parentNode;
        for (let j = 0; j < trDom.length; j++) {
          if (parentNode == trDom[j]) {
            trDom[j].classList.add("active");
          } else {
            trDom[j].classList.remove("active");
          }
        }
      })
    }
  },

  /**
   * 创建圆形标注
   */
  addCircleMaker(radius) {
    //获取当前聚焦楼层
    const group = this.fmap.getFMGroup(this.fmap.focusGroupID);
    //创建PolygonMarkerLayer
    if (!this.polygonLayer) {
      this.polygonLayer = new fengmap.FMPolygonMarkerLayer();
      group.addLayer(this.polygonLayer);
    } else {
      this.polygonLayer.removeAll();
    }
    const circleMaker = new fengmap.FMPolygonMarker({
      //设置颜色
      color: '#3CF9DF',
      //设置透明度
      alpha: 0.3,
      //设置边框线的宽度
      lineWidth: 3,
      //设置高度
      height: 3,
      //设置圆形中心点坐标
      points: {
        //设置为圆形
        type: 'circle',
        //设置此形状的中心坐标
        center: {
          x: this.fmap.center.x,
          y: this.fmap.center.y
        },
        //设置半径
        radius: radius,
        //设置段数，默认为40段
        segments: 40
      }
    });
    this.polygonLayer.addMarker(circleMaker);
  },
})
