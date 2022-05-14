// pages/FMSearchAnalysisBaseInfo/index.js

import { fengmap } from '../../utils/fengmap.miniprogram.min.js';

Page({
  data: {
    mapLoaded: false, //地图是否加载完成
    isSearchPage: false,  //是否显示搜索页面
    searchResult: [], //搜索结果
    searchValue: '', //搜索框value
    isTypePage: false,  //是否是分类搜索结果页面
    typeResult: [],  //分类搜索结果
    typeText: '', //点击的类型名称
  },
  // 定义全局map变量
  fmap: null,
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
            * 创建FMSearchAnalyser
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
   * 输入框监听事件
   */
  bindSearchInput(e) {
    const keyword = e.detail.value;
    let searchResult = [];
    if (keyword !== '') {
      //通过查询条件进行地图数据搜索
      const params = {};
      params.keyword = keyword;
      params.nodeType = fengmap.FMNodeType.MODEL;
      let result = this.searchByParams(params);
      // 筛选出要显示的信息，防止堆栈溢出
      searchResult = result.map(item => ({
        name: item.name,
        ename: item.ename,
        groupID: item.groupID,
        FID: item.FID,
        typeID: item.typeID,
        nodeType: item.nodeType
      }))
    }
    this.setData({
      searchResult: searchResult,
      searchValue: keyword
    })

  },
  /**
   * 输入框点击事件
   */
  bindClickInput() {
    this.setData({
      isSearchPage: true
    })
  },

  /**
   * 根据参数信息进行搜索
   * keyword: 搜索关键字
   * gids： 楼层id，默认为'all':所有楼层
   * nodeType：fengmap.FMNodeType
   * fid: 模型FID,整个建筑内唯一ID。
   */
  searchByParams(params) {
    if (this.fmap == null) {
      return;
    }

    /**
     * fengmap.FMSearchRequest 是可设置查询类型，查询关键字的请求类
     */
    const searchRequest = new fengmap.FMSearchRequest();

    //配置keyword参数
    if (params.keyword && params.keyword != '') {
      searchRequest.keyword = params.keyword;
    }

    //配置groupID参数
    if (params.groupID) {
      searchRequest.groupID = params.groupID
    }

    //配置FID参数
    if (params.FID) {
      searchRequest.FID = params.FID;
    }
    //配置typeID参数
    if (params.typeID != null) {
      searchRequest.typeID = params.typeID;
    }

    //配置nodeType参数
    if (params.nodeType != null) {
      searchRequest.nodeType = params.nodeType;
    }

    /*
     //设置模糊搜索的语言类型，只针对keyword类型的搜索
     searchRequest.keywordLanguageTypes([fengmap.FMLanguageType.EN,fengmap.FMLanguageType.ZH]);
     */

    /*//周边查询
    searchRequest.circle = {
        //查询范围中心点坐标
        center: {
            x: map.center.x,
            y: map.center.y
        },
        radius: 50  //查询范围半径
    };*/

    /**
     * 根据请求对象查询分析方法
     */
    let sortRes = this.searchAnalyser.getQueryResult(searchRequest, ['SINGLE']);
    console.log('search', sortRes);
    return sortRes;
  },

  /**
   * 根据FID搜索地图
   */
  searchByFID(e) {
    this.backToSearch()

    // 搜索FID
    let params = {};
    params.FID = e.currentTarget.dataset.fid;
    params.nodeType = fengmap.FMNodeType.MODEL;
    let result = this.searchByParams(params);
    let name = '';
    if (result.length > 0) {
      let model = result[0];
      //打印model信息
      console.log('选中model信息', model);
      if (model != null) {
        name = model.name;

        //视野中心移动到指定位置,如果不是当前聚焦层，将先设置目标层为聚焦层在跳转
        const coord = {
          x: model.mapCoord.x,
          y: model.mapCoord.y,
          groupID: model.groupID
        };
        this.fmap.moveTo(coord);

        //添加marker
        this.addMarkers(model);

        //模型节点对象
        const target = model.target;
        //渲染当前设置的模型元素处于高亮状态
        if (target) {
          if (this.selectedModel && this.selectedModel.FID != target.FID) {
            this.selectedModel.selected = false;
          }
          target.selected = true;
          this.selectedModel = target;
        }

        this.setData({
          searchValue: name,  //搜索框显示名称
        })

      }

      // 筛选出要显示的信息，防止堆栈溢出
      let searchResult = result.map(item => ({
        name: item.name,
        ename: item.ename,
        groupID: item.groupID,
        FID: item.FID,
        typeID: item.typeID,
        nodeType: item.nodeType
      }))

      //收起下拉列表
      this.setData({
        searchResult: searchResult,
        isSearchPage: false
      })

    }
  },

  /**
   * 根据分类ID搜索地图数据
   */
  searchByTypeID(e) {

    //调用搜索方法
    let params = {};
    params.groupID = this.fmap.focusGroupID; //当前聚焦楼层
    params.typeID = Number(e.currentTarget.dataset.type);
    params.nodeType = fengmap.FMNodeType.MODEL;
    let result = this.searchByParams(params);
    console.log('分类搜索结果：', result);

    // 筛选出要显示的信息，防止堆栈溢出
    let searchResult = result.map(item => ({
      name: item.name,
      ename: item.ename,
      groupID: item.groupID,
      FID: item.FID,
      typeID: item.typeID,
      nodeType: item.nodeType
    }))


    this.setData({
      typeResult: searchResult,
      isTypePage: true,
      typeText: e.currentTarget.dataset.label
    })

  },

  /**
   * 根据model对象添加Marker
   */
  addMarkers(model) {
    //移除上次渲染的marker
    this.removeMarkers();
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
   * 返回搜索页面
   */
  backToSearch() {
    this.setData({
      isTypePage: false,
      typeText: '',
      typeResult: [],
    })
  },

  /**
   * 返回地图页面
   */
  backToMap() {
    if (!this.data.isSearchPage) return;
    this.setData({
      isSearchPage: false,
      searchValue: '',
      searchResult: [],
    })
  }

})
