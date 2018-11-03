import { loadModules } from 'esri-loader'
import config from'./config/config'


export const LayerType = {                       
    "ArcGISDynamic": "ArcGISDynamicMapServiceLayer", 
    "ArcGISTile": "ArcGISTiledMapServiceLayer",    
    "ClusterLayer": "ClusterLayer",
    "CSVLayer": "CSVLayer", 
    "FeatureLayer": "FeatureLayer",    
    "GraphicsLayer": "GraphicsLayer",    
    "WFSLayer": "WFSLayer",
    "WMSLayer": "WMSLayer",
    "WMTSLayer": "WMTSLayer"  
};
//空间关系类型
export const spatialRelType = {
    "CONTAINS": "esriSpatialRelContains", 
    "CROSS": "esriSpatialRelCrosses",    
    "INTERSECTS": "esriSpatialRelIntersects",
    "OVERLAPS": "esriSpatialRelOverlaps", 
    "TOUCHES": "esriSpatialRelTouches",    
    "WITHIN": "esriSpatialRelWithin"  
};
//距离单位
export const units = {
    "KILOMETERS": "kilometer", 
    "METERS": "meters",    
    "SQUARE_KILOMETERS": "square_kilometers",
    "SQUARE_METERS": "square_meters"
};
//#region 全局变量
export default class HJRMap {
	map:null,
  	navToolbar:null,//导航工具

  	RmapExtent:null,//地图范围和地图基本
  	RmapZoom:0,

 	textLayer:"text",//文本
  	alertLayer:"alert",//报警

  	isBlink:false,//是否闪烁
  	blinkLayer:"RblinkLayer",//闪烁图层名称
  	resizeInterval:[],//闪烁定时器组
  	blinkGraphic:[],//闪烁要素
  	beaconBlink:"beacon",//航标闪烁
  	locationBlink:"location",//航标闪烁
  	curBlink:"",	//当前的闪烁key
  	blinkStyle:{},	//闪烁属性
	toolbar : null,
	popup : null,
	printer : null,
	addlayer : null,
	measureEvent : null,
	dbmeasureEvent : null,
	measuremoveEvent : null,
	moveMeasureFlag : false,
	tracePlayer : null,
	twinkleTimer : null,
	highlightTimer : null,
	//图层类型枚举
	
  	
  	/*创建地图对象，并且增加底图，设置好冒泡窗口
  	* divId是装载地图的div容器id
  	* mapOptions是地图初始化参数，json格式
  	*      center是初始化地图中心点
  	*      zoom是初始化地图的缩放级别
  	* callback是地图创建以后的回调函数
  	*/
  	createMap: function(divId, mapOptions, callback){
  		
  		loadModules([
  			"esri/map",
  			"esri/layers/ArcGISTiledMapServiceLayer",
  			"esri/layers/ArcGISDynamicMapServiceLayer",
  			"esri/dijit/Popup",
  			"esri/config",
  			"dijit/registry"
  		]).then(([
  			Map,
  			ArcGISTiledMapServiceLayer,
  			ArcGISDynamicMapServiceLayer,
  			Popup,
  			esriConfig,
  			registry
  		])=>{
  			esriConfig.defaults.map.panDuration = 50;
  			if(!popup){
  				popup = new Popup(null, document.createElement("div",{
  				  	id:"popuWindow"
  				}));
  			}		
  			//map_zoom_slider 
  			if(registry.byId(divId+'_zoom_slider')){
  				registry.byId(divId+'_zoom_slider').destroy();
  			}
  			
  			if(HJRMap.map){
  				HJRMap.map.destroy();
  			}
  			
  			HJRMap.map = new Map(divId, {
  				center: mapOptions.center|| config.mapcenter,
  	            zoom: mapOptions.zoom || config.maplevel,
  	            logo:false,            
  	            infoWindow:popup,
  	            optimizePanAnimation:false,
  	            showLabels:true,
  				sliderStyle:'large'

  			});
  			HJRMap.map.disableDoubleClickZoom();
  			addLayer({
  		  		url: config.basemapUrl,
  		  		layerid:'blayer',
  		  		type:LayerType.ArcGISTile
  		  	});
  			addLayer({
  		  		layerid:'twinkleLayer',
  		  		type:LayerType.GraphicsLayer
  			});
  			
  			addLayer({
  		  		layerid:'highlightLayer',
  		  		type:LayerType.GraphicsLayer
  		  	});
  			addLayer({
  		  		layerid:'measureLayer',
  		  		type:LayerType.GraphicsLayer
  		  	});
  			
  			HJRMap.map.on('load',function(){
  				callback && callback({status:'success',data:HJRMap.map});
  				
  			});
  			
  							
  		}).catch(err =>{
  			callback && callback({status:'error',message:"创建地图失败", error: err});
  			errorHandler({message: '创建地图失败', error:err});
  		});
  		
  	},


  	//获取地图对象
  	GetMap: function (){
  		console.log("map", HJRMap.map);
  		return HJRMap.map;
  	  	 
  	},

  	/**
  	 * 创建点graphic
  	 * params是创建点graphic的参数
  	 *      -x: 点横坐标
  	 *      -y: 点纵坐标
  	 *      -picurl: 图片符号地址
  	 *      -attributes: 点要素的属性对象
  	 *      -picsize: 符号大小
  	 *      -template: 点击点要素弹框的html内容
  	 * 		-callback是graphic创建以后的回调函数
  	 * 
  	 */
  	createPointGraphic: function(params){
  		if(params && params.x && params.y && params.picurl && params.attributes && params.picsize){
  			loadModules(['esri/geometry/Point', 'esri/graphic', "esri/symbols/PictureMarkerSymbol", "esri/SpatialReference"]).then(([
  				Point, Graphic, PictureMarkerSymbol, SpatialReference]) => {
  				var geometry = new Point(params.x, params.y, new SpatialReference(config.geowkid));
  				var pointsymbol = new PictureMarkerSymbol(params.picurl, params.picsize, params.picsize);
  				var graphic = new Graphic(geometry, pointsymbol, params.attributes);
  				var gjson = graphic.toJson();
  				gjson && params.template && (gjson.infoTemplate = params.template);
  				params.callback && params.callback(gjson);
  			})
  		}else{
  			errorHandler({message: '创建点要素参数错误'});
  			params.callback && params.callback(null);
  		}
  	},

  	/**
  	 * 创建线graphic
  	 * params是创建点graphic的参数
  	 *      -points: 组成线的点坐标数组
  	 *      -color: 线符号颜色
  	 *      -attributes: 线要素的属性对象
  	 *      -width: 线符号粗细
  	 *      -template: 点击线要素弹框的html内容
  	 * 		-callback是graphic创建以后的回调函数
  	 * 
  	 */
  	createLineGraphic: function(params){
  		if(params && params.points && params.color && params.attributes && params.width){
  			loadModules(['esri/geometry/Point', 'esri/geometry/Polyline', 'esri/graphic', "esri/symbols/SimpleLineSymbol", 
  				"esri/Color", "esri/SpatialReference"]).then(([
  				Point, Polyline, Graphic, SimpleLineSymbol, Color, SpatialReference]) => {
  				var geometry = new Polyline(new SpatialReference(config.geowkid));
  				var path = params.points.map(function(pt){
  					return new Point(pt.x, pt.y, new SpatialReference(config.geowkid));
  				});
  				geometry.addPath(path);
  				var linesymbol = new SimpleLineSymbol(
  					SimpleLineSymbol.STYLE_SOLID,
  				    new Color(params.color),
  				    params.width
  				);
  				var graphic = new Graphic(geometry, linesymbol, params.attributes);
  				var gjson = graphic.toJson();
  				gjson && params.template && (gjson.infoTemplate = params.template);
  				params.callback && params.callback(gjson);
  			})
  		}else{
  			errorHandler({message: '创建线要素参数错误'});
  			params.callback && params.callback(null);
  		}
  	},

  	/**
  	 * 创建面graphic
  	 * params是创建点graphic的参数
  	 *      -points: 组成面的点坐标数组
  	 *      -color: 面填充颜色
  	 *      -alpha: 透明度 0-1
  	 *      -attributes: 面要素的属性对象
  	 *      -linecolor: 面的边界线的颜色
  	 *      -linewidth: 面的边界线符号粗细
  	 *      -template: 点击面要素弹框的html内容
  	 * 		-callback是graphic创建以后的回调函数
  	 * 
  	 */
  	createPolygonGraphic: function(params){
  		if(params && params.points && params.linecolor && params.linewidth){
  			loadModules(['esri/geometry/Point', 'esri/geometry/Polygon', 'esri/graphic', "esri/symbols/SimpleLineSymbol", 
  				"esri/symbols/SimpleFillSymbol", "esri/Color", "esri/SpatialReference"]).then(([
  				Point, Polygon, Graphic, SimpleLineSymbol, SimpleFillSymbol, Color, SpatialReference]) => {
  				var geometry = new Polygon(new SpatialReference(config.geowkid));
  				!params.color && (params.color = new Color([0,0,0,0]));
  				if(params.color && params.alpha){
  					params.color = new Color(params.color);
  					params.color.a = params.alpha;
  				}
  				var path = params.points.map(function(pt){
  					return [pt.x, pt.y];
  				});
  				geometry.addRing(path);
  				var linesymbol = new SimpleLineSymbol(
  					SimpleLineSymbol.STYLE_SOLID,
  				    new Color(params.linecolor),
  				    params.linewidth
  				);
  				var polysymbol = new SimpleFillSymbol(
  						SimpleFillSymbol.STYLE_SOLID, 
  						linesymbol, 
  						new Color(params.color)
  				);
  				var graphic = new Graphic(geometry, polysymbol, params.attributes);
  				var gjson = graphic.toJson();
  				gjson && params.template && (gjson.infoTemplate = params.template);
  				params.callback && params.callback(gjson);
  			})
  		}else{
  			errorHandler({message: '创建面要素参数错误'});
  			params.callback && params.callback(null);
  		}
  	},


  	//地图上移
  	panUp: function(){
  		HJRMap.map && HJRMap.map.panUp();
  	},

  	//地图下移
  	panDown: function(){
  		HJRMap.map && HJRMap.map.panDown();
  	},

  	//地图左移
  	panLeft: function(){
  		HJRMap.map && HJRMap.map.panLeft();
  	},

  	//地图右移
  	panRight: function(){	
  		HJRMap.map && HJRMap.map.panRight();
  	},

  	//地图放大
  	zoomIn: function(callback){	
  	  	let zoom = null;
  		if(HJRMap && HJRMap.map){
  			var zoomInEvent = HJRMap.map.on('zoom-end',function(evt){
  				callback && callback({map:HJRMap.map, anchor:evt.anchor,extent:evt.extent,level:evt.level,zoomFactor:evt.zoomFactor});
  				zoomInEvent.remove();
  				zoomInEvent = null;
  			});
  			zoom = HJRMap.map.getZoom();
  			if(!zoom)
  				errorHandler({message: '地图尚未初始化完毕'});
  			HJRMap.map.setZoom(zoom+1);
  			
  		}else{
  			errorHandler({message: '地图尚未初始化完毕'});
  		}
  	},
  	//地图缩小
  	zoomOut: function(callback){
  		let zoom = null;
  		if(HJRMap && HJRMap.map){
  			var zoomOutEvent = HJRMap.map.on('zoom-end',function(evt){
  				callback && callback({map:HJRMap.map, anchor:evt.anchor,extent:evt.extent,level:evt.level,zoomFactor:evt.zoomFactor});
  				zoomOutEvent.remove();
  				zoomOutEvent = null;
  			});
  			zoom = HJRMap.map.getZoom();
  			if(!zoom)
  				errorHandler({message: '地图尚未初始化完毕'});
  			HJRMap.map.setZoom(zoom-1);
  			
  		}else{
  			errorHandler({message: '地图尚未初始化完毕'});
  		}
  	},

  	//添加图层
  	addLayer: function(opts, callback){
  	  if(HJRMap.map){
  		 	var mapevent = 	HJRMap.map.on('layer-add-result',dojo.hitch(this,function(resp){
  				if(resp && resp.layer){
  					callback && callback({status:'success',data:resp.layer})
  				}else{
  					callback && callback({status:'error'})
  				}
  				mapevent && mapevent.remove();
  				mapevent = null;
  			}));
  			//判断地图类型
  			switch (opts.type) {
  				case LayerType["ArcGISDynamic"]:
  				  addDynamicLayer(opts);
  				  break;
  				case LayerType["ArcGISTile"]://arcgis瓦片服务
  				  addTileLayer(opts);      
  				  break;
  				case LayerType["WMSLayer"]:
  				  addWMSLayer(opts);
  				  break;
  				case LayerType["WFSLayer"]:
  				  addWFSLayer(opts);
  				  break;
  				case LayerType["WMTSLayer"]:
  				  addWMTSLayer(opts);
  				  break;
  				case LayerType["FeatureLayer"]:
  				  addFeatureLayer(opts);
  				  break;
  				case LayerType["GraphicsLayer"]:
  				  addGraphicsLayer(opts);
  				  break;
  				default:
  					mapevent && mapevent.remove();
  					mapevent = null;
  					errorHandler({message: '图层类型错误'});
  					callback && callback({status:'error',message:"图层类型错误"});
  					return;
  			}
  	  	}
  	},
  	
  	/* 增加WMS图层
  	*  opts: 增加图层的参数
  	*     -layerid:图层的标识
  	*     -url: 图层服务地址
  	*     -resourceInfo: resourceInfo对象
  	*/
  	addWMSLayer: function(opts){
  	  loadModules(['esri/layers/WMSLayer']).then(([ WMSLayer]) => {
  	  	var wmsLayer = null
  	    if (IsLayerToEmpty(opts.layerid)) {
  		    wmsLayer = FindLayer(opts.layerid);	    
  		  } else {
  		    wmsLayer = new WMSLayer(opts.url,{
  		    	resourceInfo:opts.resourceInfo
  		    });
  		    	    	
  		    if (opts.layerid != null || opts.layerid != undefined) {
  		      wmsLayer.id = opts.layerid
  		    }
  		    HJRMap.map.addLayer(wmsLayer);
  		    
  		  }	    		
  		}).catch(err => {
  			errorHandler({message: '添加wms服务失败', error: err});
  		});
  		
  	},
  	/********************************************************/
  	/* 增加WFS图层
  	*  opts: 增加图层的参数
  	*     -layerid:图层的标识
  	*     -url: 图层服务地址
  	*     -mode:WFS图层的查询模式， snapshot ondemand
  	* 	  -name:图层的名字
  	*  	  -version:OGC WFS的版本
  	*  	  -wkid:坐标参考
  	*/
  	addWFSLayer: function(opts){
  	  loadModules(['esri/layers/WFSLayer']).then(([WFSLayer]) => {
  	  	var wfsLayer = null
  	    if (IsLayerToEmpty(opts.layerid)) {
  		    wfsLayer = FindLayer(opts.layerid);	    
  		  } else if(opts.url) {
  		    wfsLayer = new WFSLayer(opts);
  		    if (opts.layerid != null || opts.layerid != undefined) {
  		      wfsLayer.id = opts.layerid
  		    }
  		    HJRMap.map.addLayer(wfsLayer);
  		    
  		  }	    		
  		}).catch(err => {
  			errorHandler({message: '添加wfs服务失败', error: err});
  		});
  		
  	},
  	/********************************************************/
  	/* 增加WMTS图层
  	*  opts: 增加图层的参数
  	*     -layerid:图层的标识
  	*     -url: 图层服务地址
  	*     -resourceInfo:WMTS图层的资源信息
  	*     -serviceMode:服务的类型，KVP或者RESTful
  	*/
  	addWMTSLayer: function(opts){
  	  loadModules(['esri/layers/WMTSLayer']).then(([WMTSLayer]) => {
  	  	var wmtsLayer = null
  	    if (IsLayerToEmpty(opts.layerid)) {
  		    wmtsLayer = FindLayer(opts.layerid);	    
  		  } else if(opts.url && opts.layerid) {
  		    wmtsLayer = new WMTSLayer(opts.url,{
  		    	resourceInfo:opts.resourceInfo,
  		    	serviceMode:opts.serviceMode||"RESTful"
  		    });
  		    if (opts.layerid != null || opts.layerid != undefined) {
  		      wmtsLayer.id = opts.layerid
  		    }
  		    HJRMap.map.addLayer(wmtsLayer);
  		    
  		  }	    		
  		}).catch(err => {
  			errorHandler({message: '添加wmts服务失败', error: err});
  		});
  		
  	},
  	/********************************************************/
  	/* 增加动态图层
  	*  opts: 增加图层的参数
  	*     -layerid:图层的标识
  	*     -url: 图层服务地址
  	*     -minScale: 图层显示的最小比例尺
  	*     -maxScale: 图层显示的最大比例尺 
  	*/
  	addDynamicLayer: function(opts){
  	  loadModules(['esri/layers/ArcGISDynamicMapServiceLayer']).then(([ ArcGISDynamicMapServiceLayer]) => {
  	  	var arcgisDynamic = null
  	    if (IsLayerToEmpty(opts.layerid)) {
  		    arcgisDynamic = FindLayer(opts.layerid);	    
  		  } else {
  		    arcgisDynamic = new ArcGISDynamicMapServiceLayer(opts.url);	
  		    if (opts.minScale) {
  		      arcgisDynamic.minScale = opts.minScale
  		    }
  		    if (opts.maxScale) {
  		      arcgisDynamic.maxScale = opts.maxScale
  		    }
  		    if (opts.layerid) {
  		      arcgisDynamic.id = opts.layerid
  		    }
  		    HJRMap.map.addLayer(arcgisDynamic);
  		    
  		  }	    		
  		}).catch(err => {
  			errorHandler({message: '添加动态服务失败', error: err});
  		});
  		
  	},
  	/********************************************************/

  	/* 增加切片图层
  	*  opts: 增加图层的参数
  	*     -layerid:图层的标识
  	*     -url: 图层服务地址
  	*     -minScale: 图层显示的最小比例尺
  	*     -maxScale: 图层显示的最大比例尺 
  	*/
  	addTileLayer: function(opts) {
  	  loadModules(['esri/layers/ArcGISTiledMapServiceLayer']).then( ([ArcGISTiledMapServiceLayer]) => {
  	    var arcgisTiled = null
  	    if (IsLayerToEmpty(opts.layerid)) {
  		    arcgisTiled = FindLayer(opts.layerid)
  		  } else {
  		    arcgisTiled = new ArcGISTiledMapServiceLayer(opts.url)
  		    if (opts.minScale != null || opts.minScale != undefined) {
  		      arcgisTiled.minScale = opts.minScale
  		    }
  		    if (opts.layerid != null || opts.layerid != undefined) {
  		      arcgisTiled.id = opts.layerid
  		    }
  		    HJRMap.map.addLayer(arcgisTiled)
  		  } 
  	  	}).catch(err => {
  			errorHandler({message: '添加切片图层失败', error: err});
  		})
  	},

  	/* 增加要素图层
  	*  opts: 增加图层的参数
  	*     -layerid:图层的标识
  	*     -url: 图层服务地址
  	*     -minScale: 图层显示的最小比例尺
  	*     -maxScale: 图层显示的最大比例尺 
  	*     -featureCollection: 图层的要素集合
  	*            -layerDefinition: 图层的定义信息
  	*            -featureSet: 要素集合
  	*/
  	addFeatureLayer: function(opts){
  		loadModules(["esri/layers/FeatureLayer"]).then(([FeatureLayer])=>{
  			var featureLayer = null;
  		    if (IsLayerToEmpty(opts.layerid)) {
  		      featureLayer = FindLayer(opts.layerid);
  		      featureLayer.clear();
  		    } else {	    	
  		    	if (opts.url !== null || opts.url !== undefined || opts.url !== '') {
  		    		featureLayer = new FeatureLayer(opts.url,{
  				      	id:opts.layerid,
  				      	mode: FeatureLayer.MODE_ONDEMAND,
  				      	outFields: ["*"]
  				     });
  			    	
  				}else if(opts.featureCollection && opts.featureCollection.layerDefinition && opts.featureCollection.featureSet){
  					featureLayer = new FeatureLayer(opts.featureCollection ,{
  				      	id:opts.layerid,
  				      	mode: FeatureLayer.MODE_ONDEMAND,
  				      	outFields: ["*"]
  				      });
  				}
  		      	opts.maxScale && featureLayer.setMaxScale(scale);
  	      		opts.minScale && featureLayer.setMinScale(scale)
  		      	HJRMap.map.addLayer(featureLayer);
  		    }
  		}).catch(err => {
  			errorHandler({message: '添加要素图层失败', error: err});
  		})
  	},

  	/* 增加绘图图层
  	*  opts: 增加图层的参数
  	*     -layerid:图层的标识
  	*/
  	addGraphicsLayer: function(opts){
  		loadModules(["esri/layers/GraphicsLayer"]).then(([GraphicsLayer])=>{
  			var graphicLayer = null;
  		    if (IsLayerToEmpty(opts.layerid)) {
  		      	graphicLayer = FindLayer(opts.layerid);
  		      	graphicLayer.clear();
  		    } else {
  		    	graphicLayer = new GraphicsLayer({
  			    	id:opts.layerid
  			    });
  			    HJRMap.map.addLayer(graphicLayer);
  		    }
  		}).catch(err => {
  			errorHandler({message: '添加graphicslayer失败', error: err});
  		});
  	},

  	//判断图层是否为空
  	IsLayerToEmpty: function(layerid){
  		var flag = false;
  		try{
  			HJRMap.map.getLayer(layerid)?(flag = true):(flag = false);
  		}catch(e){
  			//TODO handle the exception
  			errorHandler({message: '图层判断失败', error: e});
  			return false;
  		}  	
  	  	return flag;
  	},

  	//查找图层
  	FindLayer: function(id){
  		var layer = null;
  		try{		
  	  		layer = HJRMap.map&&HJRMap.map.getLayer(id);
  		}catch(e){
  			//TODO handle the exception
  			errorHandler({message: '查找图层失败', error: e});
  			return null; 
  		}  	
  	  	return layer;
  	},
  	  
  	//移除图层
  	removeLayer: function(id){
  	  	var flag = false;
  	  	try{
  	  		var rlayer = HJRMap.map.getLayer(id);
  		  	if(rlayer) {
  		  		HJRMap.map.removeLayer(rlayer);
  		  		flag = true;
  		  	}  
  	  	}catch(e){
  	  		//TODO handle the exception
  	  		errorHandler({message: '移除图层失败', error: e});
  	  		return false;
  	  	}  		
  	  	return flag;
  	},

  	/* 调整图层层级
  	*  layerid: 图层的标识
  	*  index:图层在地图中的次序
  	*  callback: 重新调整图层次序以后的回调函数
  	*/
  	reorderLayer: function(layerid, index, callback){
  		try{
  			var rlayer = FindLayer(layerid); 		
  		  	//判断输入的index是否为数字
  		  	var numFlag = false;	  	
  		  	var reorderevent = HJRMap.map.on("layer-reorder",function(res){	
  		  		console.log('layer-reorder',res);
  		  		if(res && res.layer){
  		  			callback && callback({status:'success',data:{layer:res.layer,index:res.index}});		  		
  			  	}else{
  		  			errorHandler({message: '图层顺序调整失败'});
  		  			callback && callback({status:'error'});
  		  		}
  		  		reorderevent && reorderevent.remove();
  			  	reorderevent = null;
  		  	});
  		  	
  		  	(parseInt(index).toString()=='NaN')?(numFlag = fasle):(numFlag = true);
  		  	console.log("rlayer, numFlag", rlayer, numFlag);
  		  	if(rlayer&&numFlag){
  		  		console.log("调整之前layerindex", HJRMap.map.getLayersVisibleAtScale());
  		  		HJRMap.map.reorderLayer(rlayer,index);	  
  		  		console.log("调整之后layerindex", HJRMap.map.getLayersVisibleAtScale());
  		  		
  		  	}else{
  		  		console.log("图层顺序调整失败,请检查图层id和索引号");	  		
  		  	}
  		  	
  		  	
  		}catch(e){
  			//TODO handle the exception
  			errorHandler({message: '图层顺序调整失败', error:e});
  		}
  	  		
  	},

  	/* 通过json添加graphic对象
  	*  params: 添加参数
  	*  		-layerid: 图层标识
  	*  		-graphic: 增加的json格式的graphic
  	*/
  	addGraphic: function(params, callback){
  		loadModules(["esri/graphic"]).then(([Graphic])=>{
  			if(params && !params.layerid){
  				errorHandler({message: '请提供图层id'});
  				callback && callback({message: '请提供图层id'});
  				return;
  			}

  			var rlayer = FindLayer(params.layerid);
  			if(!rlayer){
  				callback && callback({message: '没有找到图层'});
  				return;
  			}
  			var g = new Graphic(params.graphic);
  			rlayer.add(g);
  			callback && callback({status:'success', data:g});
  		}).catch(err => {
  			errorHandler({message: '添加图形失败', error:err});
  			callback && callback({status:'error', error:err});
  		});
  		
  	},
  	/*判断要素是否存在,根据图层和graphic属性查找graphic对象
  	*	layerId: 查找的图层的唯一标识
  	*   id： 查找的graphic的id属性值
  	*/
  	isFindGraphicByAttr: function(layerId, id){
  		var flag = false;
  		try{
  			if(layerId !== ''&& layerId !== null && layerId !== undefined){
  				var olayer = HJRMap.map.getLayer(layerId);
  			  	if(olayer){
  			  		for(var i = 0; i<olayer.graphics.length;i++){
  			  			if(olayer.graphics[i].attributes['id'].trim() === id.trim()){  				
  							flag = true;
  							break;
  			  			}
  			  		}
  			  	}
  			}
  		}catch(e){
  			//TODO handle the exception
  			errorHandler({message: '判断要素是否存在异常', error:e});
  			flag = false;
  		}
  		return flag;
  	},

  	/*设置鼠标样式
  	*  url: 鼠标样式的图片地址
  	*/
  	setMousePointer: function(url){ 		
  		try{
  			if(url !== ''&& url !== null && url !== undefined){
  				if(url.indexOf(".")<0)
  					HJRMap.map.setMapCursor(url);
  				else
  					HJRMap.map.setMapCursor("url("+url+"),auto");
  			}
  		}catch(e){
  			//TODO handle the exception
  			errorHandler({message: '设置鼠标样式异常', error:e});
  		}	  	
  	},
  	 
  	/*根据图层的范围信息自动定位级别
  	*  layerid: 图层的唯一标识
  	*/
  	EnterviewLayer: function(layerid){
  		try{
  			var olayer = FindLayer(layerid);
  		  	if(olayer && (olayer.fullExtent||olayer.extent)){
  		  		var ext = olayer.fullExtent||olayer.extent;
  		  		HJRMap.map.setExtent(ext);
  		  	}
  		}catch(e){
  			//TODO handle the exception
  			errorHandler({message: '图层自动定位异常', error:e});
  		}
  	},

  	/*拉框查询图层，获得拉框范围内的要素信息
  	*	params：参数对象
  	*        -layer：查询的图层id
  	*        -spatialRelationship: 空间查询的空间关系，默认是相交关系
  	*        -callback: 查询执行完以后的回调函数，返回的参数是查询的结果，当空间关系异常或者查询异常时，返回空数组
  	*/
  	RectQuery: function(params){
  	  	let layerid = params.layer;
  	  	let spatialRef = params.spatialRelationship||'INTERSECTS';
  	  	HJRMap.map.graphics.clear();
  	  	loadModules([
  	  		"esri/toolbars/draw",
  	  		"esri/geometry/geometryEngine",
  	      	'esri/graphic',
  	      	"esri/Color",
  			"esri/tasks/query",
  			"esri/tasks/QueryTask",
  			"esri/symbols/SimpleMarkerSymbol",
  	      	"esri/symbols/SimpleFillSymbol", 
  	      	"esri/symbols/SimpleLineSymbol"])
  	  	.then(([
  	      	Draw, geometryEngine, 
  	      	Graphic,
  	      	Color, Query, QueryTask, SimpleMarkerSymbol, 
  	      	SimpleFillSymbol, SimpleLineSymbol])=>{
  	      	//初始化绘图工具
  	      	if(!toolbar){
  	      		toolbar = new Draw(HJRMap.map);
  	      	}			  	
  	      	setMousePointer("crosshair");
  		  	toolbar.activate(Draw.EXTENT);
  		  	var toolbarEvent = toolbar.on("draw-end", function(evtObj){
  		  		setMousePointer("default");
  		  		HJRMap.map.graphics.clear();
  		      	var geometry = evtObj.geometry;
  		      	// add the drawn graphic to the map
  		      	var symbol = new SimpleFillSymbol(config.defaultFillSymbol);
  		      	var graphic = new Graphic(geometry, symbol);
  		      	//HJRMap.map.graphics.add(graphic);
  		      	toolbar.deactivate();
  		      
  		      	let querylayer = HJRMap.map.getLayer(layerid);
  		      	let results = [];
  		      	querylayer.graphics.filter(function(graphic){
  	    			if(graphic.geometry && geometry){
  	    				switch(params.spatialRelationship){
  	    					case "esriSpatialRelContains":
  	    						var interresult = geometryEngine.contains(graphic.geometry, geometry);
  		                		if(interresult){
  		                          	results.push(graphic);
  		        				}else{
  			        			}
  	    						break;
  	    					case "esriSpatialRelCrosses":
  	    						var interresult = geometryEngine.crosses(graphic.geometry, geometry);
  		                		if(interresult){
  		                        	results.push(graphic);
  			        			}else{
  			        			}
  	    						break;
  	    					case "esriSpatialRelIntersects":
  	    						var interresult = geometryEngine.intersects(graphic.geometry, geometry);
  		                		if(interresult){
  		                          	results.push(graphic);
  		        				}else{
  			        			}
  	    						break;
  	    					case "esriSpatialRelOverlaps":
  	    						var interresult = geometryEngine.overlaps(graphic.geometry, geometry);
  		                		if(interresult){
  		                          	results.push(graphic);
  		        				}else{
  			        			}
  	    						break;
  	    					case "esriSpatialRelTouches":
  	    						var interresult = geometryEngine.touches(graphic.geometry, geometry);
  		                		if(interresult){
  		                       		results.push(graphic);
  		        				}else{
  			        			}
  	    						break;
  	    					case "esriSpatialRelWithin":
  	    						var interresult = geometryEngine.within(graphic.geometry, geometry);
  		                		if(interresult){
  		                          	results.push(graphic);
  		        				}else{
  			        			}
  	    						break;
  	    					default:
  	    						errorHandler({message: '空间关系类型错误'});
  	    						params.callback && params.callback([]);
  	    						toolbarEvent.remove();
  		  						toolbarEvent = null;
  	    						return;
  	    				}
  	    			}
  	        	});
  	        	HJRMap.map.graphics.clear();
  	        	let g = null;
  				for(var i = 0; i< results.length;i++){
  				  	var pt = results[i].geometry;
  				  	var attr = results[i].attributes;
  				  	var sms = new SimpleMarkerSymbol(config.defaultPntSymbol);
  					g = new Graphic(pt,sms);
  					HJRMap.map.graphics.add(g);
  				}
  				params.callback && params.callback(results);
  	        	toolbarEvent.remove();
  		  		toolbarEvent = null;
  	      	});
  	  	}).catch(err => {
  	  		errorHandler({message: '拉框查询异常', error: err});
  	  		params.callback && params.callback([]);
  	  	});
  	},

  	/*根据关键词搜搜业务图层的某些字段
  	*	params: 搜索接口的参数对象
  	*        -layers： 要搜索的图层列表，是一个数组，其中每一个对象包含下面两个属性
  	*             -layerid： 要搜索的图层id
  	*             -keyword： 要搜索的图层的属性名
  	*             -attribute： 要搜索的字符串型属性值
  	*/
  	Search: function(params){
  		try{
  			let results = [];
  		  	if(params&&params.layers.length > 0){
  		  		let olayer = null;
  		  		for(var i = 0; i<params.layers.length; i++){
  		  			olayer = FindLayer(params.layers[i].layerid);
  				  	if(olayer&&olayer.graphics){
  				  		for(var j = 0; j<olayer.graphics.length;j++){
  				  				if(olayer.graphics[j].attributes[params.layers[i].keyword].trim() === params.layers[i].attribute.trim()){  				
  								results.push(olayer.graphics[j]);
  								continue;
  				  			}
  				  		}
  				  	}
  		  		}
  		  	}else{
  		  		errorHandler({message: '搜索参数异常', error: err});
  		  	}
  		  	params.callback&&params.callback(results)
  		}catch(e){
  			//TODO handle the exception
  			console.log("搜索图层异常",e.message);
  		}
  		
  	},

  	/*设置某个图层为可见状态
  	*	layerid: 显示图层的id
  	*/
  	ShowLayer: function(layerid){
  		try{
  			var olayer = FindLayer(layerid);
  	  		olayer && olayer.show();
  	  		if(!olayer)
  	  			errorHandler({message: '设置图层可见时没有搜索到该图层', error: err});
  		}catch(e){
  			//TODO handle the exception
  			console.log("显示图层异常",e.message);
  		}
  	},

  	/*设置某个图层为不可见状态
  	*	layerid: 隐藏图层的id
  	*/
  	HideLayer: function(layerid){
  		try{
  			var olayer = FindLayer(layerid);
  	  		olayer && olayer.hide();
  	  		if(!olayer)
  	  			errorHandler({message: '设置图层不可见时没有搜索到该图层'});
  		}catch(e){
  			//TODO handle the exception
  			errorHandler({message: '隐藏图层异常', error: e});
  		}
  	  	
  	},

  	/*地图平移到指定坐标
  	*	params: 参数对象
  	*		-x: 平移到指定坐标的横坐标
  	*		-y：平移到指定坐标的纵坐标
  	*		-callback: 平移完成以后的回调函数
  	*/
  	PanTo: function(params){
  	  	loadModules(["esri/geometry/webMercatorUtils","esri/geometry/Point", "esri/SpatialReference"]).then(([webMercatorUtils, Point, SpatialReference])=>{
  	  		var pnt = new Point(params.x, params.y, new SpatialReference(config.geowkid));
  	  		var mappantoevent = HJRMap.map.on('pan-end',dojo.hitch(this,function(resp){
  				if(resp && resp.delta && resp.extent){
  					params.callback && params.callback({status:'success',data:resp})
  				}else{
  					params.callback && params.callback({status:'error',message: "地图平移异常"})
  				}
  				mappantoevent && mappantoevent.remove();
  				mappantoevent = null;
  			}));
  			//geographicToWebMercator(geometry)
  	  		HJRMap.map.centerAt(pnt);
  	  	}).catch(err => {
  	  		errorHandler({message: '地图平移异常', error: err});
  	  		params.callback && params.callback({status:'error',message: "地图平移异常"})
  	  	});
  	  	
  	},

  	/*地图放大缩小
  	*	zoom： 缩放级别
  	*	callback： 缩放完毕后的回调函数
  	*/
  	SetZoom: function(zoom,callback){
  	  	var mapzoomevent = HJRMap.map.on('zoom-end',dojo.hitch(this,function(resp){
  			if(resp && resp.anchor && resp.extent && resp.level){
  				callback && callback({status:'success',data:resp})
  			}else{
  				callback && callback({status:'error', message:"地图缩放发生异常"})
  			}
  			mapzoomevent && mapzoomevent.remove();
  			mapzoomevent = null;
  		}));
  	  	HJRMap.map.setZoom(zoom);
  	},
  	 
  	getFnName: function(fn){
  	    return typeof fn !== "function" ?
  	            undefined:
  	            fn.name || 
  	            /function (.+?)\(/.exec(fn + "")[1];
  	},

  	/*批量增加要素，只支持featurelayer和graphicslayer
  	*	params：批量增加要素的参数对象
  	*		-layerid：增加要素的图层的id
  	*		-graphics：要增加的要素的数组
  	*		-callback: 批量增加完的回调函数
  	*/
  	AddGraphics: function(params){	
  		console.log("params", params);
  		let flag = false;
  	  	var olayer = FindLayer(params.layerid);
  	  	if(!olayer) return;
  	  	let count = 0;
  	  	let gArr = [];
  		loadModules(["esri/graphic"]).then(([Graphic])=>{
  			if(params && params.graphics && params.graphics.length > 0){
  		  		for(var i = 0; i < params.graphics.length; i++){
  		  			gArr.push(new Graphic(params.graphics[i]).setSymbol(params.symbol||null));	  			
  		  		}
  		  	}else{
  		  		errorHandler({message: '批量增加要素参数异常'});
  		  		params && params.callback && params.callback({status:'error', message:"批量增加要素参数异常"});
  		  	}
  			
  			if(olayer.url && olayer !== ""){
  				olayer.applyEdits(gArr, null, null,function(){
  					flag = true;
  					params && params.callback && params.callback({status:'success', data:gArr});
  					console.log("要素添加成功");
  				},function(err){
  					flag = false;
  					errorHandler({message: '批量增加要素失败', error: err});
  					params && params.callback && params.callback({status:'error', message:"批量增加要素失败"});
  				});
  			}else{
  				console.log("gArr", gArr);
  				for(var j = 0; j<gArr.length;j++){
  					if(gArr[j]) olayer.add(gArr[j]);
  					count++;
  				}	
  				if(count == params.graphics.length){
  			  		flag = true;
  			  		params && params.callback && params.callback({status:'success', data:gArr});
  			  	}else{
  			  		params && params.callback && params.callback({status:'error', message:"批量增加要素异常"});
  			  	}
  				
  			}		
  		}).catch(err => {
  			errorHandler({message: '批量增加要素异常', error: err});
  			params && params.callback && params.callback({status:'error', message:"批量增加要素异常"});
  			flag = false;
  		});
  	},

  	/*批量修改要素，只支持featurelayer和graphicslayer
  	*	params：批量修改要素的参数对象
  	*		-layerid：修改要素的图层的id
  	*		-graphics：要修改的要素的数组
  	*		-callback: 批量修改完的回调函数
  	*/
  	EditGraphics: function(params){
  	  	let flag = false;
  	  	var olayer = FindLayer(params.layerid);
  	  	if(!olayer) return;
  	  	let count = 0;
  	  	let rArr = [];
  	  	let aArr = [];
  	  	
  	  	loadModules(["esri/graphic"]).then(([Graphic])=>{
  			if(params.graphics && params.graphics.length > 0){
  		  		for(var i = 0; i < params.graphics.length; i++){	  			
  		  			olayer.graphics && (olayer.graphics.length > 0)&& olayer.graphics.forEach(function(graphic){
  			  			if(graphic.attributes['id'] === params.graphics[i].attributes['id']){
  			  				rArr.push(graphic);
  			  				aArr.push(new Graphic(params.graphics[i]));
  			  			}
  			  		})
  		  			
  		  		}
  		  		
  			}
  			
  			if(olayer.url && olayer !== ""){
  				olayer.applyEdits(null, aArr, null,function(){
  					flag = true;
  					console.log("要素更新成功")
  				},function(err){
  					flag = false;
  					errorHandler({message: '要素更新失败', error: err});
  					params && params.callback && params.callback({status:'error', message:"要素更新失败"});
  				});
  				
  			}else{
  				for (var k in rArr) {
  			  		if(rArr[k]) olayer.remove(rArr[k]);
  			  	}
  				for (var m in aArr) {
  			  		if(aArr[m]) olayer.add(aArr[m]);
  			  		count++;
  			  	}
  				if(count == params.graphics.length){
  			  		flag = true;
  			  	}
  			}  	
  		}).catch(err => {
  			flag = false;
  			errorHandler({message: '批量修改要素异常', error: err});
  			params && params.callback && params.callback({status:'error', message:"批量修改要素异常"});
  		})
  	  	return flag;
  	},

  	/*批量删除要素，只支持featurelayer和graphicslayer
  	*	params：批量删除要素的参数对象
  	*		-layerid：删除要素的图层的id
  	*		-graphics：要删除的要素的数组
  	*		-callback: 批量删除完的回调函数
  	*/
  	RemoveGraphics: function(params){
  		let flag = false;
  		try{		
  		  	var olayer = FindLayer(params.layerid);
  		  	if(!olayer) return;
  		  	let count = 0;
  		  	let gArr = [];
  		  	for(var i = 0; i< params.graphics.length; i++){
  		  		olayer.graphics && (olayer.graphics.length > 0) && olayer.graphics.forEach(function(graphic){
  		  			if(graphic.attributes['id'] === params.graphics[i].attributes['id']){
  		  				gArr.push(graphic);
  		  			}
  		  		})
  		  	}
  		  	if(olayer.url && olayer !== ""){
  				olayer.applyEdits(null, aArr, null,function(){
  					flag = true;
  					console.log("要素删除成功")
  				},function(err){
  					flag = false;
  					errorHandler({message: '要素删除失败', error: err});
  					params && params.callback && params.callback({status:'error', message:"要素删除失败"});
  				});
  				
  			}else{
  				for (var j in gArr) {
  			  		if(gArr[j]) olayer.remove(gArr[j]);
  			  		count++;
  			  	}
  				if(count == params.graphics.length) flag = true
  			}
  		}catch(e){
  			//TODO handle the exception
  			errorHandler({message: '批量删除要素异常', error: err});
  			params && params.callback && params.callback({status:'error', message:"批量删除要素异常"});
  		}
  	},

  	/*闪烁要素
  	*	params: 参数对象
  	*		-graphics: 要闪烁的graphic数组
  	*		-duration：闪烁的时间间隔，默认一秒
  	*/
  	Twinkle: function(params){
  	  	var gJsons = params && params.graphics;
  	  	var m = (params && params.duration && params.duration*config.delta) || config.delta;	  
  	  	let tlayer = FindLayer('twinkleLayer');
  	  	let graphics = [];
  	  	if(twinkleTimer){
  	  		clearInterval(twinkleTimer);
  	  		twinkleTimer = null;
  	  		}
  		loadModules([
  			"esri/graphic",		
  	  		"esri/symbols/SimpleMarkerSymbol",
  	      	"esri/symbols/SimpleFillSymbol", 
  	      	"esri/symbols/SimpleLineSymbol",
  	      	"esri/symbols/PictureMarkerSymbol"
  		]).then(([
  			Graphic, SimpleMarkerSymbol, SimpleFillSymbol, 
  			SimpleLineSymbol, PictureMarkerSymbol
  		]) =>{
  			if(gJsons && gJsons.length > 0){
  				for(var i = 0; i< gJsons.length;i++){
  					var g = new Graphic(gJsons[i]);
  					switch(g.symbol.type){
  			  			case 'simplemarkersymbol':
  			  				g.setSymbol(new PictureMarkerSymbol(config.highlightPicPntSymbol));
  			  				break;
  			  			case 'simplelinesymbol':
  			  				g.setSymbol(new SimpleLineSymbol(config.highlightLineSymbol));
  			  				break;
  			  			case 'simplefillsymbol':
  			  				g.setSymbol(new SimpleFillSymbol(config.highlightFillSymbol));
  			  				break;
  			  		}
  					graphics.push(g);
  				}
  			}
  				
  			twinkleTimer = setInterval(function(){
  		     	tlayer && tlayer.clear();
  		     	setTimeout(function(){   
  		     		if(graphics.length >0){
  		     			graphics.forEach(function(g){
  		     				tlayer && tlayer.add(g);
  		     			})
  		     		}
  		     	}, m/2)
  	     	},m);
  	  		
  	  	}).catch(err => {
  	  		errorHandler({message: '闪烁异常', error: err});
  	  	});
  	  	
  	},

  	/*高亮要素
  	*	params: 参数对象
  	*		-graphics: 要闪烁的graphic数组
  	*/
  	Highlight: function(params){
  		
  	  	var gJsons = params.graphics;
  	  	var hlayer = FindLayer(params.layer);
  	  	hlayer && hlayer.clear();  	
  	  	if(!hlayer){
  	  		errorHandler({message: '没有找到闪烁图层', error: err});
  	  		return;
  	  	}
  		if(highlightTimer){
  	  		clearInterval(highlightTimer);
  	  		highlightTimer = null;
  	  		}
  	  	loadModules([
  	  		"esri/graphic",
  	  		"esri/symbols/SimpleMarkerSymbol",
  	      	"esri/symbols/SimpleFillSymbol", 
  	      	"esri/symbols/SimpleLineSymbol",      	
  	      	"esri/symbols/PictureMarkerSymbol"
  	  	]).then(([Graphic, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol,PictureMarkerSymbol])=>{
  	  		if(gJsons && gJsons.length >0){
  	  			
  	  			let graphics = [];
  	  			for(var i = 0; i<gJsons.length; i++){
  	  				var g = new Graphic(gJsons[i]);
  			  		switch(g.symbol.type){
  			  			case 'simplemarkersymbol':
  			  			case 'picturemarkersymbol':
  			  				g.setSymbol(new PictureMarkerSymbol(config.highlightPicPntSymbol));
  			  				break;
  			  			case 'simplelinesymbol':
  			  				g.setSymbol(new SimpleLineSymbol(config.highlightLineSymbol));
  			  				break;
  			  			case 'simplefillsymbol':
  			  				g.setSymbol(new SimpleFillSymbol(config.highlightFillSymbol));
  			  				break;
  			  			default:
  			  				break;
  			  				
  			  		}
  			  		graphics.push(g);
  			  		//hlayer && hlayer.add(g);
  	  			}
  	  			
  	  			highlightTimer = setInterval(function(){
  			     	hlayer && hlayer.clear();
  			     	setTimeout(function(){   
  			     		if(graphics.length >0){
  			     			graphics.forEach(function(g){
  			     				hlayer && hlayer.add(g);
  			     			})
  			     		}
  			     	}, 500)
  		     	},1000);
  	  			
  	  		}else{
  	  			errorHandler({message: '没有提供要高亮的图形数据'});
  	  		}
  	  	}).catch(err => {
  	  		errorHandler({message: '高亮要素异常', error: err});
  	  	});
  	},
  	 
  	/* 轨迹播放管理
  	*	params: 参数对象
  	*		-tracedata：轨迹数据数组
  	*		-duration：轨迹播放的间隔时间，单位是ms，默认是50ms
  	*		-speed：轨迹播放速度，即轨迹数据中time属性的值每秒钟播放的时间间隔，默认是一天24*3600*1000
  	*		-timeattrname: 数据中的时间属性字段名称，默认是time
  	*/
  	InitTraceManager: function(params){
  	 	let tracedata = params.tracedata || [];
  		let duration = params.duration || null;
  		let speed = params.speed || null;
  		let div = params.div || null;
  		let valuesetter = params.valuesetter || null;
  		let stopcallback = params.stopcallback || null;
  		let timeattrname = params.timeattrname || "time";

  		loadModules([
  			"extras/TracePlayer"
  		]).then(([TracePlayer])=>{
  	    	tracePlayer = new TracePlayer({
  	    		map: HJRMap.map, 
  	    		graphics: tracedata, 
  	    		duration: duration, 
  	    		speed: speed, 
  	    		valuesetter: valuesetter,
  	    		timeattrname: timeattrname,
  	    		stopcallback: stopcallback
  	    	});
  	    	tracePlayer.startup();
  		})
//  		.catch(err => {
//  			errorHandler({message: '轨迹播放器初始化异常', error: err});
//  		});
  	},

  	/* 播放轨迹
  	*	time：播放开始的时间，是JavaScript的Date类型
  	*/
  	TracePlay: function(speed){
  		tracePlayer.TracePlay({speed: speed});
  	},

  	/* 重新播放轨迹
  	*	time：播放速度，是每秒钟前进的时间
  	*/
  	TraceReplay: function(speed){
  		tracePlayer && tracePlayer.TraceReplay({speed: speed});
  	},

  	/* 停止播放轨迹*/
  	TraceStop: function(){
  		tracePlayer && tracePlayer.TraceStop();
  	},

  	TraceClear: function(){
  		tracePlayer && tracePlayer.clear();
  	},
  	//生成聚合图层
  	InitClusteringLayer: function(params){
  		let olayer = null;
  		let cdata = [];
  		let clusterLayer = null;
  		let sr = null;
  		
  		loadModules([
  			"extras/ClusterLayer",
  			"esri/SpatialReference",
  			"esri/symbols/SimpleMarkerSymbol",
  	        "esri/symbols/SimpleFillSymbol",
  	        "esri/symbols/PictureMarkerSymbol",
  	        "esri/renderers/ClassBreaksRenderer"
  	    ]).then(([ClusterLayer, SpatialReference,
  	    	SimpleMarkerSymbol, SimpleFillSymbol, PictureMarkerSymbol, ClassBreaksRenderer]
  	    )=>{
  	    	if(params.layer && params.layer.graphics){
  	    		olayer = params.layer;
  	    	}else{
  	    		olayer = FindLayer(params.layer);
  	    	}
  	    	if(params.spatialReference){
  	    		sr = new SpatialReference(params.spatialReference);
  	    	}
  	    	
  			if(olayer && olayer.graphics && olayer.graphics.length > 0){
  				for (var i = 0; i<olayer.graphics.length; i++) {
  					var obj = {
  						"x":olayer.graphics[i].geometry.x,
  						"y":olayer.graphics[i].geometry.y,
  						"attributes":olayer.graphics[i].attributes||{}
  					}
  					cdata.push(obj);
  				}
  				console.log("聚合的传入数据",cdata);
  				var resl = HJRMap.map.extent.getWidth() / HJRMap.map.width;
  				clusterLayer = new ClusterLayer({
  					"data":cdata,
  					"spatialReference":sr,
  					"distance":params.distance || config.clusterDistance,
  					"resolution":params.resolution || resl,
  					"singleTemplate":params.singleTemplate
  				});
  				var defaultSym = new SimpleMarkerSymbol().setSize(4);
  	            var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");

  	            var blue = new PictureMarkerSymbol( config.sclusterPic, 32, 32).setOffset(0, 15);
  	            var green = new PictureMarkerSymbol(config.mclusterPic, 64, 64).setOffset(0, 15);
  	            var red = new PictureMarkerSymbol(config.lclusterPic, 72, 72).setOffset(0, 15);
  	            renderer.addBreak(0, 2, blue);
  	            renderer.addBreak(2, 200, green);
  	            renderer.addBreak(200, 1001, red);

  	            clusterLayer.setRenderer(renderer);
  	            HJRMap.map.addLayer(clusterLayer);
  	            console.log("clusterLayer", clusterLayer);
  	            olayer.hide();
  			}
  		}).catch(err => {
  			errorHandler({message: '聚合要素异常', error: err});
  	  	});
  	},

  	/* 导出地图图片
  	*	extent: 导出地图图片的范围
  	*/
  	ExportMap: function(extent){
  	  	loadModules(["esri/dijit/Print",
  	  		"esri/tasks/PrintTemplate"
  	  	]).then(([Print, PrintTemplate])=>{
  	  		if(!printer){
  	  			printer = new Print({
  	          		map: HJRMap.map,
  	          		url: config.exportmapUrl
  	        	}, "printButton");
  	        	printer.startup();
  	  		}
  	  	}).catch(err =>{
  	  		errorHandler({message: '导出图片异常', error: err});
  	  	});
  	},

  	/*空间/属性查询
  	*	params: 查询参数对象
  	*		-layer： 要查询的图层的id
  	*		-geometry： 要查询输入的几何，可以是点、线、面
  	*		-where： 做属性查询时的筛选条件，形式为"属性名=属性值"
  	*		-spatialRelationship: 空间查询的空间关系
  	*		-callback: 查询后的回调函数，返回的参数是graphic的数组
  	*/
  	Query: function(params){
  	  	let qlayer = HJRMap.map.getLayer(params.layer);
  	  	let geometry = params.geometry;
  	  	let where = params.where||"1=1";
  	  	let field = where.split('=')[0];
  	  	let value = where.split('=')[1];
  	  	let spatialRel = params.spatialRelationship;
  	  	let filterGraphics = [], resultsData = [];
  	  	loadModules(["esri/geometry/geometryEngine"]).then(([geometryEngine])=>{
  	  		if(qlayer && qlayer.graphics && qlayer.graphics.length > 0){
  	  			if(where == '1=1'){
  	  				filterGraphics = qlayer.graphics;
  	  			}else{
  	  				for(var i = 0; i < qlayer.graphics.length; i++){
  		  				if(qlayer.graphics[i].attributes[field] == value){
  		  					filterGraphics.push(qlayer.graphics[i]);
  		  				}
  		  			}
  	  			}
  	  			  			
  	  			if(geometry&&geometry.type){
  	  				filterGraphics.filter(function(graphics){
  	  					if(graphic.geometry && geometry){
  	        				var interresult = geometryEngine.intersect(graphic.geometry, geometry);
  	                		if(interresult)
  	                          	resultsData.push(graphic);
  	        			}
  	  				});
  	  			}else{
  	  				resultsData = filterGraphics;
  	  			}
  	  			params.callback && params.callback(resultsData)
  	  		}
  	  	}).catch(err => {
  	  		errorHandler({message: '空间/属性要素查询异常', error: err});
  	 	});
  	},

  	/* 地图定位
  	*	x: 定位的坐标的横坐标
  	*	y: 定位的坐标的纵坐标
  	*	zoom: 定位的地图级别
  	*	callback: 地图定位完成后的回调函数，传回的参数是一个对象，包括delta是移动的x，y值，extent是移动后的地图范围
  	*			levelChange是地图缩放级别是否发生了变化
  	*/
  	LocationCenterAt: function(x, y, zoom, callback){
  	  	loadModules(["esri/geometry/Point", "esri/SpatialReference"]).then(([Point, SpatialReference])=>{
  	  		var mapPoint = new Point(x, y, new SpatialReference({wkid: config.geowkid}));
  	  		var mapextentchangeevent = 	HJRMap.map.on('extent-change',dojo.hitch(this,function(resp){
  				if(resp && resp.delta && resp.extent && resp.levelChange && resp.lod){
  					callback && callback({status:'success',data:resp})
  				}else{
  					callback && callback({status:'error'})
  				}
  				mapextentchangeevent && mapextentchangeevent.remove();
  				mapextentchangeevent = null;
  			}));
  	  		HJRMap.map.centerAndZoom(mapPoint, zoom);
  	  	}).catch(err => {
  	  		errorHandler({message: '地图定位异常', error: err});
  	  	});
  	  	
  	},

  	/* 弹出冒泡窗口
  	*	params：参数对象
  	*		-layer：弹出窗口依照的图层的id，目前只支持featurelayer、graphicslayer
  	*		id: 弹出框指定的graphic的id
  	*		title: 弹出框的顶部标题
  	*		point: 弹出窗口的位置
  	*		template: 弹出窗口的内容模板
  	*/
  	ShowPopup: function(params){
  	  	loadModules([
  	  		'esri/geometry/Point',
  	  		"esri/geometry/Polyline",
  	  		"esri/SpatialReference"
  	  	]).then(([Point, SpatialReference])=>{
  	  		var olayer = params && params.layer && FindLayer(params.layer);
  		  	var id = params && params.id && params.id.trim();
  		  	var title = params && (params.title || params.id );
  		  	var content = params && params.template||"无内容";
  		  	let g = null;
  		  	let pnt = null;
  		  	if(olayer&&olayer.graphics){
  		  		for(var i = 0; i< olayer.graphics.length;i++){
  		  			if(olayer.graphics[i].attributes['id'] == id){
  		  				g = olayer.graphics[i];
  		  				if(g && g.geometry && g.geometry.type=="point")
  		  					pnt = new Point(g.geometry.x, g.geometry.y);
  		  				else if(g && g.geometry && g.geometry.type=="polyline"){
  		  					var line = g.geometry;
  		  					var pathnum = g.geomtry && g.geometry.paths && g.geometry.paths.length;
  		  					var path = g.geomtry && g.geometry.paths && g.geometry.paths.length;
  		  				}else if(g && g.geometry && g.geometry.type=="polygon")
  		  					pnt = g.geometry.getCentroid();
  		  				break;
  		  			}
  		  		}
  		  		HJRMap.map.centerAt(pnt).then(function(){
  		  			popup.clearFeatures();	
  					popup.setFeatures([g]);
  					popup.setTitle(title);				
  					popup.setContent(content);								
  					popup.show(pnt);
  		  		});
  			}else{
  				errorHandler({message: '弹出冒泡窗口异常', error: err});
  			}
  	  	}).catch(err=>{
  	  		errorHandler({message: '弹出冒泡窗口异常', error: err});
  	  	});
  	},

  	//隐藏冒泡窗口
  	HidePopup: function(){
  	 	try{
  	 		popup && popup.hide();
  	 	}catch(e){
  	 		//TODO handle the exception
  	 		errorHandler({message: '隐藏弹出框异常', error: e});
  	 	}
  	},

  	/* 显示图层标注
  	 * 	params：参数对象
  	 * 		layer: 显示标注的图层id
  	 * 		attribute: 显示标注依赖的属性字段
  	 */
  	ShowLabels: function(params, labelLayer){
  	  	let olayer = FindLayer(params.layer);
  	  	let labellayer = FindLayer(labelLayer);
  	  	let field = params.attribute;
  	  	
  	  	loadModules([
  	  		"esri/layers/FeatureLayer",
  	  		"esri/graphic",
  	  		"esri/symbols/TextSymbol",
  	  		"esri/renderers/SimpleRenderer",
  		    "esri/layers/LabelClass",
  	    	"esri/Color",
  	  	]).then(([
  	  		FeatureLayer,
  	  		Graphic,
  	  		TextSymbol,
  	  		SimpleRenderer,
  	  		LabelClass,
  	  		Color
  	  	])=>{  		
  	  		  		
  	  		if(!olayer||!labellayer) return;
  	  		labellayer && labellayer.clear();
  	  		// 创建显示标注的字体样式
  		    
//  		    .setColor(new Color(config.textcolor));
//  		    strLabel.font.setSize(config.textsize);
//  		    strLabel.setHorizontalAlignment('left');
//  		    strLabel.font.setFamily(config.fontfamily);
  			
  			for(var i = 0; i< olayer.graphics.length;i++){
  				if(olayer.graphics[i].attributes[field]){
  					var strLabel = new TextSymbol(config.labelTextSymbol);
  					var str = olayer.graphics[i].attributes[field].toString();
  					strLabel.setText(str);
  					var g = new Graphic(olayer.graphics[i].geometry, strLabel);
  					labellayer.add(g);
  				}
  			}
  		    
  	  	}).catch(err=>{
  	  		errorHandler({message: '图层标注异常', error: err});
  	 	});
  	},
  	
  	//隐藏graphicslayer的图层标注
  	HideLabels: function(){
  		if(!FindLayer('labelLayer')) return;
  		let olayer = FindLayer('labelLayer');
  		olayer.clear();
  		
  	},

  	//针对featurelayer的图层标注显示
  	ShowLabelsforFeatureLayer: function(params){
  	  	let olayer = params.layer;
  	  	let field = params.attribute;
  	  	loadModules([
  	  		"esri/layers/FeatureLayer",
  	  		"esri/symbols/TextSymbol",
  	  		"esri/renderers/SimpleRenderer",
  		    "esri/layers/LabelClass",
  	    	"esri/Color",
  	  	]).then(([
  	  		FeatureLayer,
  	  		TextSymbol,
  	  		SimpleRenderer,
  	  		LabelClass,
  	  		Color
  	  	])=>{
  	  		// 创建显示标注的字体样式
  		    var strLabel = new TextSymbol().setColor(new Color(config.textcolor));
  		    strLabel.font.setSize(config.textsize);
  		    strLabel.font.setFamily(config.fontfamily);
  		
  		    //标注表达式  
  		    var exjson = {
  		      "labelExpressionInfo": {"value": "{"+field+"}"}
  		    };
  		
  		    //创建标注类
  		    var labelClass = new LabelClass(exjson);
  		    labelClass.symbol = strLabel; 
  		    HJRMap.map.getLayer(olayer).setLabelingInfo([ labelClass ]);
  		    //HJRMap.map.getLayer(olayer).redraw();
  	  	}).catch(err=>{
  	  		errorHandler({message: '图层标注异常', error: err});
  	 	});
  	},

  	/* 绘制点
  	 * 	params: 参数对象
  	 * 		layer: 绘制点的图层id
  	 * 		callback: 绘制点以后的回调函数，传回的参数是绘制的点graphic
  	 */
  	DrawPoint: function(params){
  	  	var olayer = HJRMap.map.getLayer(params.layer);
  	  	loadModules([
  	  		"esri/toolbars/draw",
  	      	'esri/graphic',
  	      	"esri/Color",
  			"esri/symbols/SimpleMarkerSymbol",
  	      	"esri/symbols/SimpleFillSymbol", 
  	      	"esri/symbols/SimpleLineSymbol"
  	  	]).then(([
  	  		Draw,Graphic,Color,SimpleMarkerSymbol,
  	  		SimpleFillSymbol, SimpleLineSymbol
  	  	])=>{
  	  		
  	  		if(!toolbar){
  	  			toolbar = new Draw(HJRMap.map);
  	  		}	  	
  	  		setMousePointer("crosshair");
  			toolbar.activate(Draw.POINT);
  			var toolbarEvent = toolbar.on("draw-end", function(evt){
  				setMousePointer("default");
  				var graphic = new Graphic(evt.geometry, new SimpleMarkerSymbol(config.defaultPntSymbol));
  			  	olayer.add(graphic);
  			  	toolbar.deactivate();
  			  	params.callback&&params.callback({status:"success",data:graphic});
  			  	toolbarEvent.remove();
  			  	toolbarEvent = null;
  			});
  	  	}).catch(err=>{
  	  		errorHandler({message: '绘制点异常', error: err});
  	  	});
  	},

  	/* 绘制线
  	 * 	params: 参数对象
  	 * 		layer: 绘制点的图层id
  	 * 		callback: 绘制线以后的回调函数，传回的参数是绘制的线graphic
  	 */
  	DrawLine: function(params){
  	  	loadModules([
  	  		"esri/toolbars/draw",
  	  		'esri/graphic',
  	  		"esri/Color",
  			"esri/symbols/SimpleMarkerSymbol",
  			"esri/symbols/SimpleFillSymbol", 
  			"esri/symbols/SimpleLineSymbol"
  	  	]).then(([
  	  		Draw,Graphic,Color,SimpleMarkerSymbol,
  	  		SimpleFillSymbol, SimpleLineSymbol
  	  	])=>{
  	  		let olayer = HJRMap.map.getLayer(params.layer);
  	  		if(!toolbar){
  	  			toolbar = new Draw(HJRMap.map);
  	  		}	  		
  	  		setMousePointer("crosshair");
  		  	toolbar.activate(Draw.POLYLINE);
  		  	var toolbarEvent = toolbar.on("draw-end", function(evt){
  		  		setMousePointer("default");
  		  		var graphic = new Graphic(evt.geometry, new SimpleLineSymbol(config.defaultLineSymbol));
  			  	olayer.add(graphic);
  			  	toolbar.deactivate();
  			  	params.callback&&params.callback({status:"success",data:graphic});
  			  	toolbarEvent.remove();
  			  	toolbarEvent = null;
  			  });
  	  	}).catch(err=>{
  	  		errorHandler({message: '绘制线异常', error: err});
  	  	});
  	},

  	/* 绘制面
  	 * 	params: 参数对象
  	 * 		layer: 绘制点的图层id
  	 * 		callback: 绘制线以后的回调函数，传回的参数是绘制的线graphic
  	 */
  	DrawPolygon: function(params){
  	  	
  	  	loadModules([
  	  		"esri/toolbars/draw",
  	  		'esri/graphic',
  	  		"esri/Color",
  			"esri/symbols/SimpleMarkerSymbol",
  			"esri/symbols/SimpleFillSymbol", 
  			"esri/symbols/SimpleLineSymbol"
  	  	]).then(([
  	  		Draw,Graphic,Color,SimpleMarkerSymbol,
  	  		SimpleFillSymbol, SimpleLineSymbol
  	  	])=>{
  	  		let olayer = HJRMap.map.getLayer(params.layer);
  	  		if(!toolbar){
  	  			toolbar = new Draw(HJRMap.map);
  	  		}	  		
  	  		setMousePointer("crosshair");
  		  	toolbar.activate(Draw.POLYGON);
  		  	var toolbarEvent = toolbar.on("draw-end", function(evt){
  		  		setMousePointer("default");
  		  		var graphic = new Graphic(evt.geometry, new SimpleFillSymbol(config.defaultFillSymbol));
  			  	olayer.add(graphic);
  			  	toolbar.deactivate();	  		
  			  	params.callback&&params.callback({status:"success",data:graphic});
  			  	toolbarEvent.remove();
  			  	toolbarEvent = null;
  			});
  	  	}).catch(err=>{
  	  		errorHandler({message: '绘制面异常', error: err});
  	 	});
  	},

  	/* 触发点击鼠标事件
  	 * 	params: 参数对象
  	 * 		layer: 绘制点的图层id
  	 * 		infotemplate: 点击
  	 * 		callback: 点击以后的回调函数，传回的参数是绘制的graphic
  	 */
  	MouseClick: function(params){
  		if(!params.layer) return;
  	  	var tlayer = FindLayer(params.layer);
  	  	var id = params.id;
  	  	var content = params.infotemplate;
  	  	let targetGraphic = null;
  	  	if(tlayer && tlayer.graphics){
  	  		for(var i = 0; i < tlayer.graphics.length; i++){
  	  			if(tlayer.graphics[i].attributes['id'] == id){
  	  				targetGraphic = tlayer.graphics[i];
  	  				var center = (targetGraphic && targetGraphic.geometry && targetGraphic.geometry.type=="point")?targetGraphic.geometry:targetGraphic.geometry.getExtent().getCenter();
  	  				if(center){
  	  					HJRMap.map.centerAt(center);
  		  				if(params && params.infotemplate)
  			  				ShowPopup({
  			  					layer: tlayer.id,
  			  					id: id,
  			  					title: "",
  			  					point: center,
  			  					template: params.infotemplate
  			  				});
  	  				}
  	  				break;
  	  			}
  	  		}
  	  	}
  	  	params.callback&&params.callback(targetGraphic);
  	},

  	/************组件************/
  	/* 创建导航条
  	 * 	container：导航条的div容器
  	 * 	options: 参数对象
  	 * 		
  	 */
  	InitNavSlider: function(container, options){
  		let navnode = null;
  		if(typeof(container)=="string"){
  			if(container && dijit.byId(container))
  				dijit.byId(container).destroy(true);
  			navnode = document.getElementById(container);
  		}else if(typeof(container)=="object"){
  			if(container && dijit.byId(container))
  				dijit.byId(container).destroy(true);
  			navnode = container;
  		}else if(!container){
  			errorHandler({message: '导航工具容器不存在'});
  			return;
  		}else{
  			errorHandler({message: '导航工具容器有错'});
  			return;
  		}
  		//如果容器是空的初始化
  		if(navnode && !navnode.innerHTML){
  			
  			loadModules([
  				"dojo/query",
  				"dojo/mouse",
  				"dojo/dom-style",
  				"dojo/dom-construct",
  				"dojo/dom-class"
  			]).then(([
  				query, mouse, domStyle, domConstruct, domClass
  			])=>{
  				
  				var ndiv = domConstruct.create("div", { id: "north" }, container);
  				var sdiv = domConstruct.create("div", { id: "south" }, container);
  				var wdiv = domConstruct.create("div", { id: "west" }, container);
  				var ediv = domConstruct.create("div", { id: "east" }, container);
  				domClass.add(ndiv, "button");
  				domClass.add(sdiv, "button");
  				domClass.add(wdiv, "button");
  				domClass.add(ediv, "button");
  				if(!domClass.contains(container, "nav")){
  					domClass.add(container, "nav");
  				}
  				ShowNavSlider();

  				query(".nav .button").on(mouse.enter, function(evt){
  					if(evt.target && evt.target.id){
  						domStyle.set("nav", "background-image", "url('" + config.basepicurl + evt.target.id+"-mini.png')");
  					}
  				})

  				query(".nav .button").on(mouse.leave, function(evt){
  					domStyle.set("nav", "background-image", "url('" +  config.basepicurl + "zoom-maxextent-mini.png')");
  				})

  				query(".nav .button").on("click", dojo.hitch(HJRMap.map, function(evt){
  					if(evt.target && evt.target.id){
  						if(evt.target.id == "north"){
  							HJRMap.map.panUp();
  						}else if(evt.target.id == "south"){
  							HJRMap.map.panDown();
  						}else if(evt.target.id == "west"){
  							HJRMap.map.panLeft();
  						}else if(evt.target.id == "east"){
  							HJRMap.map.panRight();
  						}
  					}
  				}))
  			})
  		}
  	},

  	/* 显示漫游组件 */
  	ShowNavSlider: function(){
  		loadModules([
  			"dojo/query","dojo/dom-style"]).then(([query, domStyle])=>{
  				domStyle.set("nav", "display", "");
  				query(".esriLargeSlider").style("display", "");
  			})
  	},

  	/* 隐藏漫游组件 */
  	HideNavSlider: function(){
  		loadModules([
  			"dojo/query","dojo/dom-style"]).then(([query, domStyle])=>{
  				domStyle.set("nav", "display", "none");
  				query(".esriLargeSlider").style("display", "none");
  			})
  		
  	},

  	/* 创建比例尺组件
  	 * 	options： 参数对象
  	 * 		attachTo: 比例尺组件所在的位置。"top-right","bottom-right","top-center",
  	 * 					"bottom-center","bottom-left","top-left"
  	 */
  	InitScalebar: function(options){
  		let attachTo = options.attachTo || "bottom-left";
  		loadModules(["esri/dijit/Scalebar"]).then(([Scalebar])=>{ 			
  	  		var scalebar = new Scalebar({
  			    map: HJRMap.map,
  			    attachTo: attachTo,
  			    scalebarStyle: "line",
  			    scalebarUnit: "metric"
  			});
  		});
  	},

  	//显示实时位置组价
  	InitCoordinate: function(domId){
  		HJRMap.map.on("mouse-move",function(evt){
  	    	let coords = evt.mapPoint;
  	    	var relCoords = "横坐标(x):"+ parseFloat(coords.x).toFixed(2) +";纵坐标(y):"+parseFloat(coords.y).toFixed(2);
  	    	if(document.getElementById(domId)){
  	    		document.getElementById(domId).innerHTML = relCoords;
  	    	}
  	    	
  	    });  		
  	},

  	//鹰眼
  	InitOverview: function(domId){
  	 	try{
  	 		loadModules(["esri/dijit/OverviewMap", "dojo/dom-class"]).then(([OverviewMap, domClass])=>{ 			
  		  		var overviewMapDijit = new OverviewMap({
  		          	map: HJRMap.map,
  		          	attachTo: "bottom-right",
  		          	visible: true
  		        });
  		  		//domClass.add(domId, "esriOverviewMap ovwTR");
  		        overviewMapDijit.startup();
  	  		});
  	 	}catch(e){
  	 		//TODO handle the exception
  	 		errorHandler({message: '初始化鹰眼组件异常', error: e});
  	 	}
  	},

  	//清除测量距离
  	clearMeasureDistance: function(){
  	 	measureEvent && measureEvent.remove() && (measureEvent = null)
  	 	dbmeasureEvent && dbmeasureEvent.remove() && (dbmeasureEvent = null)
  	 	if(FindLayer('measureLayer')){
  	 			FindLayer('measureLayer').clear();
  	 	}
  	},

  	//测量距离
  	StartMeasureDistance: function(options){
  	  	let unit = options.unit;
  	  	moveMeasureFlag = true;
  	  	loadModules([
  	  		"esri/toolbars/draw",
  	      	'esri/graphic',
  	      	"esri/Color",
  	      	"esri/geometry/mathUtils",
  	      	"esri/geometry/Polyline",
  			"esri/symbols/SimpleMarkerSymbol",
  			"esri/symbols/SimpleFillSymbol", 
  			"esri/symbols/SimpleLineSymbol",
  			"esri/symbols/TextSymbol"
  	  	]).then(([
  	  		Draw,Graphic,Color,mathUtils,
  	  		Polyline,
  	  		SimpleMarkerSymbol,
  	  		SimpleFillSymbol, SimpleLineSymbol, TextSymbol
  	  	])=>{
  	  		
  	  		if(!HJRMap.map) return; 		
  			let count = 0;
  			let startPnt = null;
  			let lastPnt = null;
  			let endPnt = null;
  			let tmplinestart = null;
  			let tmplineGraphic = null;
  			let totalLength = 0;
  			HJRMap.map.setMapCursor('crosshair');
  			measureEvent = HJRMap.map.on('click',function(evt){
  				if(measuremoveEvent){
  			 		measuremoveEvent.remove();
  			 		measuremoveEvent = null;
  			 	}
  				tmplinestart = evt.mapPoint;
  			 	var line = new Polyline(HJRMap.map.spatialReference);
  			 	var pntSym = new SimpleMarkerSymbol(config.measurePntSymbol);
  			 	var lineSym = new SimpleLineSymbol(config.measureLineSymbol);
  			 	var txtSym = new TextSymbol(config.defaultTextSymbol);
  			 	var length = 0;
  			 	var txtContent = '';
  			 	if(count == 0){
  			 		startPnt = evt.mapPoint;
  			 		txtSym.setText("起点");
  			 	}else{
  			 		line.addPath([lastPnt, evt.mapPoint]);
  			 		totalLength += mathUtils.getLength(lastPnt, evt.mapPoint);
  			 		if(unit){
  			 			switch(unit){
  			 				case "KILOMETERS":
  			 					length = Math.round((totalLength /1000)*100)/100;
  			 					txtContent = length + "公里";
  			 					break;
  			 				case "METERS":
  			 					length = Math.round(totalLength*100)/100;
  			 					txtContent = length + "米";
  			 					break;
  			 			}
  			 		}
  			 		
  			 		txtSym.setText(txtContent);
  			 	}
  			 	lastPnt = evt.mapPoint;
  			 	var g1 = new Graphic(evt.mapPoint,pntSym);
  			 	var g2 = new Graphic(evt.mapPoint,txtSym);
  			 	var g3 = new Graphic(line, lineSym);
  			 	console.log("测量线的节点",g2);
  			 	if(FindLayer('measureLayer')){
  			 		FindLayer('measureLayer').add(g3);
  			 		FindLayer('measureLayer').add(g1);
  			 		FindLayer('measureLayer').add(g2);
  			 	}
  			 	count++;
  			 	
  			 	measuremoveEvent = HJRMap.map.on('mouse-move',function(evt){
  					if(tmplinestart && evt.mapPoint){
  						if(tmplineGraphic)
  							FindLayer('measureLayer').remove(tmplineGraphic);
  						var lineSym = new SimpleLineSymbol(config.measureLineSymbol);
  						var line = new Polyline(HJRMap.map.spatialReference);
  						line.addPath([tmplinestart, evt.mapPoint]);
  						var tmpGraphic = new Graphic(line,lineSym);
  						tmplineGraphic = FindLayer('measureLayer').add(tmpGraphic);
  					}
  				});
  			});
  			
  			 
  			dbmeasureEvent = HJRMap.map.on('dbl-click',function(evt){
  			 	measureEvent && measureEvent.remove();
  			 	measureEvent = null;
  			 	//删除鼠标移动事件
  			 	measuremoveEvent && measuremoveEvent.remove();
  			 	measuremoveEvent = null;
  			 	if(tmplineGraphic)
  			 		FindLayer('measureLayer').remove(tmplineGraphic);
  				
  				HJRMap.map.setMapCursor('default');
  			 	var line = new Polyline(HJRMap.map.spatialReference);
  			 	var pntSym = new SimpleMarkerSymbol(config.measurePntSymbol);
  			 	var lineSym = new SimpleLineSymbol(config.measureLineSymbol);
  			 	var txtSym = new TextSymbol(config.defaultTextSymbol);
  			 	var length = 0;
  			 	var txtContent = '';
  			 	if(count == 0){
  			 		startPnt = evt.mapPoint;
  			 		txtSym.setText("起点");
  			 	}else{
  			 		line.addPath([lastPnt, evt.mapPoint]);
  			 		totalLength += mathUtils.getLength(lastPnt, evt.mapPoint);
  			 		if(unit){
  			 			switch(unit){
  			 				case "KILOMETERS":
  			 					length = Math.round((totalLength /1000)*100)/100;
  			 					txtContent = "终点: "+ length + "公里";
  			 					break;
  			 				case "METERS":
  			 					length = Math.round(totalLength*100)/100;
  			 					txtContent = "终点: " + length + "米";
  			 					break;
  			 			}
  			 		}		 		
  			 		txtSym.setText(txtContent);
  			 	}
  			 	lastPnt = evt.mapPoint;
  			 	var g1 = new Graphic(evt.mapPoint,pntSym);
  			 	var g2 = new Graphic(evt.mapPoint,txtSym);
  			 	var g3 = new Graphic(line, lineSym);
  			 	
  			 	if(FindLayer('measureLayer')){
  			 		FindLayer('measureLayer').add(g3);
  			 		FindLayer('measureLayer').add(g1);
  			 		FindLayer('measureLayer').add(g2);
  			 	}
  			 	dbmeasureEvent.remove();
  			 	dbmeasureEvent = null;
  			 	HJRMap.map.setMapCursor('default');
  			 });
  			 options.callback && options.callback({status:'success',data:totalLength});
  	  	}).catch(err=>{
  	  		console.log("测量距离组件异常",err);
  	  	});
  	},

  	//测量面积
  	StartMeasureArea: function(options){
  		let unit = options.unit;
  	  		loadModules([
  	  		"esri/toolbars/draw",
  	  		'esri/graphic',
  	  		"esri/Color",
  			"esri/symbols/SimpleMarkerSymbol",
  			"esri/symbols/SimpleFillSymbol", 
  			"esri/symbols/SimpleLineSymbol",
  			"esri/symbols/TextSymbol",
  			"esri/geometry/geometryEngine"
  	  	]).then(([
  	  		Draw,Graphic,Color,SimpleMarkerSymbol,
  	  		SimpleFillSymbol, SimpleLineSymbol,TextSymbol,
  	  		geometryEngine
  	  	])=>{
  	  		let olayer = FindLayer('measureLayer');
  	  		if(!toolbar){
  	  			toolbar = new Draw(HJRMap.map);
  	  		}	  		
  		  	toolbar.activate(Draw.POLYGON);
  		  	HJRMap.map.setMapCursor('crosshair');
  		  	var toolbarEvent = toolbar.on("draw-end", function(evt){
  			  	var graphic = new Graphic(evt.geometry, new SimpleFillSymbol(config.defaultFillSymbol));
  			  	var pnt = evt.geometry.getCentroid();
  			  	var txtSymbol = new TextSymbol(config.defaultTextSymbol);
  			  	txtSymbol.setHorizontalAlignment('center');
  			  	var area = 0;
  			  	
  			  	switch(unit){
  			  		case 'SQUARE_KILOMETERS':
  			  			area = geometryEngine.geodesicArea(evt.geometry,'square-kilometers');
  			  			txtSymbol.setText(Math.round(area*100)/100+"平方千米");
  			  			break;
  			  		case "SQUARE_METERS":
  			  			area = geometryEngine.geodesicArea(evt.geometry,'square-meters');
  			  			txtSymbol.setText(Math.round(area*100)/100+"平方米");
  			  			break;
  			  	}
  			  	var txtGraphic = new Graphic(pnt, txtSymbol);
  			  	olayer.add(graphic);
  			  	olayer.add(txtGraphic);
  			  	
  			  	toolbar.deactivate();	  		options.callback&&options.callback({status:"success",data:graphic});
  			  	toolbarEvent.remove();
  			  	toolbarEvent = null;
  			  	HJRMap.map.setMapCursor('default');
  			  });
  	  		
  	  	}).catch(err=>{
  	  		errorHandler({message: '测量面积组件异常', error: err});
  	  	});
  	},

  	//图层管理
  	InitLayerList: function(domId){  		
  		try{
  			loadModules(["esri/dijit/LayerList"]).then(([LayerList])=>{		 
  				let layers = [];
  		  		for(var i = 0; i< HJRMap.map.layerIds;i++){
  		  			var layer1 = {
  		  				layer:HJRMap.map.getLayer(i),
  		  				showSubLayers:true,
  		  				showOpacitySlider:true,
  		  				showLegend:true,
  		  				id:i,
  		  				title:i
  		  			}
  		  			layers.push(layer1);
  		  		}
  			 
  			 var layerList = new LayerList({
  				    map: HJRMap.map,				    
  				    layers: layers
  				  },domId);
  				  layerList.startup();
  			});
  		}catch(e){
  			//TODO handle the exception
  			errorHandler({message: '图层列表组件异常', error: err});
  		}
  			
  	},
  	/*异常处理*/
  	errorHandler: function(err){
  		err && err.message && console.log(err.message);
  		err && err.error && console.log(err.error.stack);
  	}
	
} 






export default{
	LayerType,
	spatialRelType,
	units,
	HJRMap
//	createMap,
//	GetMap,
//	panUp,
//	panDown,
//	panRight,
//	zoomIn,
//	zoomOut,
//	addLayer,
//	IsLayerToEmpty,
//	FindLayer,
//	removeLayer,
//	reorderLayer,
//	addGraphic,
//	isFindGraphicByAttr,
//	setMousePointer,
//	EnterviewLayer,
//	RectQuery,
//	Search,
//	ShowLayer,
//	HideLayer,
//	PanTo,
//	SetZoom,
//	AddGraphics,
//	EditGraphics,
//	RemoveGraphics,
//	Twinkle,
//	Highlight,
//	InitTraceManager,
//	TracePlay,
//	TraceReplay,
//	TraceStop,
//	TraceClear,
//	InitClusteringLayer,
//	ExportMap,
//	Query,
//	LocationCenterAt,
//	ShowPopup,
//	HidePopup,
//	ShowLabels,
//	HideLabels,
//	ShowLabelsforFeatureLayer,
//	DrawPoint,
//	DrawLine,
//	DrawPolygon,
//	MouseClick,
//	InitNavSlider,
//	ShowNavSlider,
//	HideNavSlider,
//	InitScalebar,
//	InitCoordinate,
//	InitOverview,
//	clearMeasureDistance,
//	StartMeasureDistance,
//	StartMeasureArea,
//	InitLayerList	
}
