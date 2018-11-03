<template>
  <div id="app" class="claro">    
    <TracePlayer ref="traceplayer" :tracedata="tracedata" class="traceplayer"></TracePlayer>
    <div id="nav"></div>
    <div class="funcPane">    	
    <ul class="btnPane">
    	<li><button @click="hideNav">隐藏地图导航</button></li>
    	<li><button @click="showNav">显示地图导航</button></li>    	
    	<li><button id="InitScalebar">比例尺</button></li>
    	<li><button id="InitCoordinate">鼠标位置</button></li>
    	<li><button id="InitOverview">鹰眼</button></li>
    	<li><button id="StartMeasureDistance">测量距离</button></li>    	
    	<li><button id="StartMeasureArea">测量面积</button></li>
    	<li><button id="clearMeasureDistance">清除测量</button></li>
    	<li><button id="InitLayerList" >图层管理</button></li>
    </ul>
    <br />
    <ul class="btnPane1">
      <li><button id="GetMap">获取地图对象</button></li>
      <li><button id="IsLayerToEmpty">图层存在</button></li>
      <li><button id="FindLayer">查找图层</button></li>
      <li><button id="removeLayer" v-on:click="removeMapLayer">移除图层</button></li>
      <li><button id="reorderLayer" v-on:click="reorderLayer">调整图层层级</button></li>
      <li><button id="isFindGraphicByAttr">判断要素存在</button></li>
      <li><button id="setMousePointer">设置鼠标样式</button></li>
      <li><button id="EnterviewLayer">定位图层</button></li>
      <li><button id="RectQuery">拉框查询</button></li>
      <li><button id="Search">搜索定位</button></li>
      <li><button id="ShowLayer">显示图层</button></li>
      <li><button id="HideLayer">隐藏图层</button></li>
      <li><button id="PanTo">地图漫游</button></li>
      <li><button id="SetZoom">地图缩放</button></li>
      <li><button id="AddGraphics">批量增加要素</button></li>
      <li><button id="EditGraphics">批量修改要素</button></li>
      <li><button id="RemoveGraphics">批量删除要素</button></li>
      <li><button id="Twinkle">闪烁要素</button></li>
      <li><button id="Highlight">高亮要素</button></li>
      <li><button id="InitTraceManager" @click="traceplay">轨迹播放管理</button></li>
      <li><button id="InitTraceManager" @click="tracehide">轨迹播放关闭</button></li>
      <li><button id="InitClusteringLayer">生成聚合图层1</button></li>
      <li><button id="printButton" >导出地图图片</button></li>
      <li><button id="Query">空间/属性查询</button></li>
      <li><button id="LocationCenterAt">地图定位</button></li>
      <li><button id="ShowPopup" >弹出冒泡窗口</button></li>
      <li><button id="HidePopup">隐藏冒泡窗口</button></li>
      <li><button id="ShowLabels">显示图层标注</button></li>
      <li><button id="DrawPoint">绘制点</button></li>
      <li><button id="DrawLine">绘制线</button></li>
      <li><button id="DrawPolygon">绘制面</button></li>
      <li><button v-on:click="mouseclick">触发点击事件</button></li>
    </ul>
    
    </div>
    <div ref="map" class="map" id="mapDiv">
    	<!--地图导航div-->
			<div id="nav"></div>
			<!--实时位置div-->
			<p id="loctip" class="loctip" ref="loctip"></p>
			<!--鹰眼div-->
			<div id="overViewDiv"></div>
			<!--测量工具-->
			<div id="measureDiv"></div>
			<!--图层管理div-->
			<div id="layerListDiv"></div>
    </div>
    
  </div>
</template>

<script>
	import * as mapUtils from './mapUtils'
	import TracePlayer from './components/TracePlayer'
	import ElementUI from '../node_modules/element-ui'
	import { loadModules } from 'esri-loader'
	import config from'./config/config'
	
export default {
  name: 'app',
  components:{
  	 TracePlayer
  },
  data () {
    return {
      count: 1,
      initmap:mapUtils.createMap('mapDiv',{
	  		center: [118.66, 37.085],
	      zoom: 9
	  },this.getMap),
	  arrowimage: require("./assets/arrow.png"),
	  playimage: require("./assets/play.png"),
	  pauseimage: require("./assets/pause.png"),
	  tracedata: [{id:1, x:118, y:37, time:new Date(2018,5,1,0,0,0)},
          {id:3, x:119.7, y:37, time:new Date(2018,5,1,6,0,0)},{id:2, x:119, y:38, time:new Date(2018,5,1,2,0,0)}
          ,{id:3, x:118.7, y:36.2, time:new Date(2018,5,1,20,0,0)},
          {id:4, x:118.5, y:36.5, time:new Date(2018,5,2,0,0,0)}]
    }
  }, 
  methods:{
  	getMap(res){  	
  			this.count = this.count + 1;
  			console.log(this.count);		  		  			
	  		if(res.status !=="success") return;
	  		//map = res.data;
	  		//console.log("map", map);
	  		/*底图的添加移到地图对象初始化中
	  		let boptions = {
		  		url: config.basemapUrl,
		  		layerid:'blayer',
		  		type:mapUtils.LayerType.ArcGISTile
		  	}
	  		mapUtils.addLayer(boptions);
	  		*/
		  	let doptions= {
		  		url: config.dynamicMapUrl,
		  		layerid:'dlayer',
		  		type:mapUtils.LayerType.ArcGISDynamic
		  	}
		  	let foptions= {
		  		url: config.dynamicMapUrl+"/1",
		  		layerid:'flayer',
		  		type:mapUtils.LayerType.FeatureLayer
		  	}
		  	let coptions= {
		  		url: config.dynamicMapUrl+"/4",
		  		layerid:'clayer',
		  		type:mapUtils.LayerType.FeatureLayer
		  	}
		  	let g1options= {
		  		layerid:'glayer1',
		  		type:mapUtils.LayerType.GraphicsLayer
		  	}
		  	let g2options= {
		  		layerid:'glayer2',
		  		type:mapUtils.LayerType.GraphicsLayer
		  	}
		  	let g3options= {
		  		layerid:'glayer3',
		  		type:mapUtils.LayerType.GraphicsLayer
		  	}
		  	let llayeroptions ={
		  		layerid:'labelLayer',
		  		type:mapUtils.LayerType.GraphicsLayer
		  	}
		  	/*let hlayeroptions ={
		  		layerid:'highlightLayer',
		  		type:mapUtils.LayerType.GraphicsLayer
		  	}
		  	let tlayeroptions ={
		  		layerid:'twinkleLayer',
		  		type:mapUtils.LayerType.GraphicsLayer
		  	}
		  	let mlayeroptions ={
		  		layerid:'measureLayer',
		  		type:mapUtils.LayerType.GraphicsLayer
		  	}*/
		  	
				mapUtils.addLayer(doptions);
				mapUtils.addLayer(foptions);
				mapUtils.addLayer(coptions);
				
				mapUtils.addLayer(g1options);
				mapUtils.addLayer(g2options);
				mapUtils.addLayer(g3options);
				
				mapUtils.addLayer(llayeroptions);
				//mapUtils.addLayer(hlayeroptions);
				//mapUtils.addLayer(tlayeroptions);
				//mapUtils.addLayer(mlayeroptions);
				
		  	//mapUtils.addLayer(hlayeroptions);
			//	mapUtils.addLayer(tlayeroptions);
			//	mapUtils.addLayer(mlayeroptions);
		  	
		  	mapUtils.InitNavSlider("nav");
		  	
		  					
			/*var myPoint1 = {"geometry":{"x":119.4140625,"y":37.2578125,
    "spatialReference":{"wkid":4326}},"attributes":{"id":'12' ,"XCoord":119.4140625,
    "YCoord":37.2578125,"Name":"银河号"},"symbol":{"color":[255,0,0,128],
    "size":22,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSCross","outline":{"color":[255,0,0,255],"width":5,
    "type":"esriSLS","style":"esriSLSSolid"}},
    "infoTemplate":{"title":"船舶位置","content":"纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}"}};
    var myPoint2 = {"geometry":{"x":118.4140625,"y":37.2578125,
    "spatialReference":{"wkid":4326}},"attributes":{"id":'13',"XCoord":119.4140625,
    "YCoord":37.2578125,"Name":"月球号"},"symbol":{"color":[255,0,0,128],
    "size":22,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSCross","outline":{"color":[255,0,0,255],"width":5,
    "type":"esriSLS","style":"esriSLSSolid"}},
    "infoTemplate":{"title":"船舶位置","content":"纬度: ${YCoord} <br>经度: ${XCoord} <br> 船舶名字:${Name}"}};*/
    
    		var myPoint1 = mapUtils.createPointGraphic({
    			"x":119.4140625,
    			"y":37.2578125,
    			"attributes":{"id":'12' ,"XCoord":119.4140625,"YCoord":37.2578125,"Name":"银河号"},
    			"picurl": config.basepicurl + "BluePin1LargeB.png",
    			"picsize": 22,
    			"template": {title:"船舶位置",content:"纬度: 37.2578125 <br/>经度: 119.4140625 <br/> 船舶名字: 银河号"},
    			"callback": (ptgraphic)=>{
	    			mapUtils.addGraphic({layerid:'glayer1',graphic: ptgraphic});
	    		}
    		});
    		
    		var myPoint2 = mapUtils.createPointGraphic({
    			"x":118.4140625,
    			"y":37.2578125,
    			"attributes":{"id":'13',"XCoord":119.4140625,"YCoord":37.2578125,"Name":"月球号"},
    			"picurl": config.basepicurl + "BluePin1LargeB.png",
    			"picsize": 26,
    			"template": {"title":"船舶位置","content":"纬度: 119.4140625 <br/>经度: 37.2578125 <br/> 船舶名字:月球号"},
    			"callback": (ptgraphic)=>{
	    			mapUtils.addGraphic({layerid:'glayer2', graphic: ptgraphic});
	    		}
    		});
    		
    		var myLine1 = mapUtils.createLineGraphic({
    			"points": [{"x":118.4140625,"y":37.2578125},{"x":119.4140625,"y":37.2578125}],
    			"attributes":{"id":'13',"XCoord":119.4140625,"YCoord":37.2578125,"Name":"月球号"},
    			"color": "#ff0000",
    			"width": 3,
    			"template": {"title":"船舶位置","content":"纬度: 119.4140625 <br/>经度: 37.2578125 <br/> 船舶名字:月球号"},
    			"callback": (ptgraphic)=>{
	    			mapUtils.addGraphic({layerid:'glayer2', graphic: ptgraphic});
	    		}
    		});
    		
    		var polygon1 = mapUtils.createPolygonGraphic({
    			"points": [{"x":118.4140625,"y":37.2578125},{"x":119.4140625,"y":37.2578125}, {"x":119.4140625,"y":38.2578125}, {"x":118.4140625,"y":37.2578125}],
    			"attributes":{"id":'13',"XCoord":119.4140625,"YCoord":37.2578125,"Name":"月球号"},
    			"color": "#ffff00",
    			"alpha": 0.8,
    			"linecolor": "#ff0000",
    			"linewidth": 1,
    			"template": {"title":"船舶位置","content":"纬度: 119.4140625 <br/>经度: 37.2578125 <br/> 船舶名字:月球号"},
    			"callback": (ptgraphic)=>{
	    			mapUtils.addGraphic({layerid:'glayer2', graphic: ptgraphic});
	    		}
    		});
				
  	},
  	
  	//显示导航条
  	showNav:function(){  		
  		mapUtils.ShowNavSlider();
  	},
  	//隐藏导航条
  	hideNav:function(){
  		mapUtils.HideNavSlider();
  	},
  	//调整图层顺序
  	reorderLayer:function(){
  		mapUtils.reorderLayer('glayer2',2 ,(res)=>{
					console.log('reordered layer info',res);
					this.testZYY();
				});
  	},
  	
		removeMapLayer:function(){
			console.log("移除前的map对象图层",mapUtils.GetMap().getLayersVisibleAtScale());
				mapUtils.removeLayer('glayer2');
				alert("移除id为glayer2的图层");
		},
		traceplay: function(){
				this.$refs.traceplayer.duration = 100;
				this.$data.tracedata = this.$data.tracedata.splice(1);
				this.$refs.traceplayer.traceplay();
		},
		tracehide: function(){
			this.$refs.traceplayer.close();
		},
		//鼠标单击事件
		mouseclick: function(){
			mapUtils.MouseClick({
				layer : "glayer1",
				id : "12",
				callback: (graphic)=>{
					this.test(graphic);
					console.log("测试作用域",this.$data.tracedata)
				}
			});
		},
		test: function(graphic){
			console.log(graphic.geometry);
		},
		testZYY:function(){
			console.log("测试作用域");
		}
		
  },
  mounted(){
  	console.log('this.$data',this.$data);
  	var mapOptions = {
  		center: [118.66, 37.085],
      zoom: 9
  	}
  	 	this.$data.map = mapUtils.GetMap();
  	 	console.log("this.$data.map", this.$data.map);
  	
  	//测试数据
  var myPoint1 = {"geometry":{"x":119.4140625,"y":37.2578125,
    "spatialReference":{"wkid":4326}},"attributes":{"id":'12' ,"XCoord":119.4140625,
    "YCoord":37.2578125,"Name":"银河号"},"symbol":{"color":[255,0,0,128],
    "size":22,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSCross","outline":{"color":[255,0,0,255],"width":5,
    "type":"esriSLS","style":"esriSLSSolid"}},
    "infoTemplate":{"title":"船舶位置","content":"纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}"}};
    var myPoint2 = {"geometry":{"x":118.4140625,"y":37.2578125,
    "spatialReference":{"wkid":4326}},"attributes":{"XCoord":119.4140625,
    "YCoord":37.2578125,"Name":"月球号"},"symbol":{"color":[255,0,0,128],
    "size":22,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSCross","outline":{"color":[255,0,0,255],"width":5,
    "type":"esriSLS","style":"esriSLSSolid"}},
    "infoTemplate":{"title":"船舶位置","content":"纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}"}};
    var p1 = {"geometry":{"x":118.140625,"y":36.8578125,
    "spatialReference":{"wkid":4326}},"attributes":{"id":"p1","XCoord":119.4140625,
    "YCoord":37.2578125,"Name":"托马斯"},"symbol":{"color":[255,0,0,128],
    "size":22,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSCross","outline":{"color":[255,0,0,255],"width":5,
    "type":"esriSLS","style":"esriSLSSolid"}},
    "infoTemplate":{"title":"船舶位置","content":"纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}"}};
    var p2 = {"geometry":{"x":118.4140625,"y":36.8578125,
    "spatialReference":{"wkid":4326}},"attributes":{"id":"p2","XCoord":119.4140625,
    "YCoord":37.2578125,"Name":"爱德华"},"symbol":{"color":[255,0,0,128],
    "size":22,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSCross","outline":{"color":[255,0,0,255],"width":5,
    "type":"esriSLS","style":"esriSLSSolid"}},
    "infoTemplate":{"title":"船舶位置","content":"纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}"}};
    var p3 = {"geometry":{"x":118.8140625,"y":36.8578125,
    "spatialReference":{"wkid":4326}},"attributes":{"id":"p3","XCoord":119.4140625,
    "YCoord":37.2578125,"Name":"亨利"},"symbol":{"color":[255,0,0,128],
    "size":22,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSCross","outline":{"color":[255,0,0,255],"width":5,
    "type":"esriSLS","style":"esriSLSSolid"}},
    "infoTemplate":{"title":"船舶位置","content":"纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}"}};
    var p3m = {"geometry":{"x":118.8140625,"y":36.8578125,
    "spatialReference":{"wkid":4326}},"attributes":{"id":"p3","XCoord":119.4140625,
    "YCoord":37.2578125,"Name":"亨利"},"symbol":{"color":[255,0,0,128],
    "size":22,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSCross","outline":{"color":[255,0,0,255],"width":5,
    "type":"esriSLS","style":"esriSLSSolid"}},
    "infoTemplate":{"title":"船舶位置","content":"纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}"}};
    var p4m = {"geometry":{"x":118.8940625,"y":36.8578125,
    "spatialReference":{"wkid":4326}},"attributes":{"id":"p3","XCoord":119.4140625,
    "YCoord":37.2578125,"Name":"亨利"},"symbol":{"color":[255,0,0,128],
    "size":22,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSCross","outline":{"color":[255,0,0,255],"width":5,
    "type":"esriSLS","style":"esriSLSSolid"}},
    "infoTemplate":{"title":"船舶位置","content":"纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}"}};
    var p5m = {"geometry":{"x":118.8640625,"y":36.9978125,
    "spatialReference":{"wkid":4326}},"attributes":{"id":"p2","XCoord":119.4140625,
    "YCoord":37.2578125,"Name":"亨利"},"symbol":{"color":[255,0,0,128],
    "size":22,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSCross","outline":{"color":[255,0,0,255],"width":5,
    "type":"esriSLS","style":"esriSLSSolid"}},
    "infoTemplate":{"title":"船舶位置","content":"纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}"}};
  	
		//mapUtils.createMap('mapDiv1',mapOptions, function(map){
			
						
			
			/*绑定事件来测试*/
			
			
			//初始化比例尺
			document.getElementById('InitScalebar').onclick = function(){
				mapUtils.InitScalebar({attachTo:'bottom-left'})
			}
			//初始化实时坐标
			document.getElementById('InitCoordinate').onclick = function(){
				mapUtils.InitCoordinate('loctip')
			}
			//初始化鹰眼图
			document.getElementById('InitOverview').onclick = function(){
				mapUtils.InitOverview()
			}
			//初始化测距
			document.getElementById('StartMeasureDistance').onclick = function(){
				mapUtils.StartMeasureDistance({unit:'KILOMETERS'})
			}
			//clearMeasureDistance
			//清除测距
			document.getElementById('clearMeasureDistance').onclick = function(){
				mapUtils.clearMeasureDistance();
			}
			//初始化测面积
			document.getElementById('StartMeasureArea').onclick = function(){
				mapUtils.StartMeasureArea({unit:'SQUARE_KILOMETERS'})
			}
			//初始化图层列表
			document.getElementById('InitLayerList').onclick = function(){
				mapUtils.InitLayerList('layerListDiv')
			}
			//获取地图对象
			document.getElementById('GetMap').onclick = function(){
				var map = mapUtils.GetMap();
				console.log("获取地图对象", map);
			}
			//图层存在
			document.getElementById('IsLayerToEmpty').onclick = function(){
				var flag = mapUtils.IsLayerToEmpty('operationlayer')
				alert("operationlayer图层存在状态为:"+flag)
			}
			//查找图层
			document.getElementById('FindLayer').onclick = function(){
				var layer = mapUtils.FindLayer('glayer1')
				alert("glayer1该图层存在",layer)
			}

			
			//判断要素存在
			document.getElementById('isFindGraphicByAttr').onclick = function(){
				var flag = mapUtils.isFindGraphicByAttr('glayer1','12');
				alert("id为12的graphic查找结果"+flag);
			}
			//设置鼠标样式
			document.getElementById('setMousePointer').onclick = function(){
				mapUtils.setMousePointer('http://ncportal.esrichina.com.cn/testImg/pen_m.cur');
			}
			//定位图层
			document.getElementById('EnterviewLayer').onclick = function(){
				mapUtils.EnterviewLayer('flayer')
			}
			//拉框查询
			document.getElementById('RectQuery').onclick = function(){
				
				mapUtils.RectQuery({
					layer:'flayer',
					spatialRelationship:mapUtils.spatialRelType.INTERSECTS,
					callback:(res)=>{
						console.log("拉框查询结果",res, this.$data.map);
							
					}
				})
			}
			//搜索定位
			document.getElementById('Search').onclick = function(){
				mapUtils.Search({
					layers:[{layerid:'glayer2',attribute:'13',keyword:'id'},{layerid:'glayer1',attribute:'12',keyword:'id'}],
					callback:(graphics) =>{
						alert(graphics.length);
					}
				})
			}
			
			
			//显示图层
			document.getElementById('ShowLayer').onclick = function(){
				mapUtils.ShowLayer('glayer1')
			}
			//隐藏图层
			document.getElementById('HideLayer').onclick = function(){
				mapUtils.HideLayer('glayer1')
			}
			//地图漫游
			document.getElementById('PanTo').onclick = function(){
				mapUtils.PanTo({x:119,y:40})
			}
			//地图缩放
			document.getElementById('SetZoom').onclick = function(){
				mapUtils.SetZoom(5);
			}
			//批量增加要素
			document.getElementById('AddGraphics').onclick = function(){
				mapUtils.AddGraphics({layerid:'glayer2',graphics:[p1, p2, p3]})
			}
			//批量修改要素
			document.getElementById('EditGraphics').onclick = function(){
				mapUtils.EditGraphics({layerid:'glayer2',graphics:[p4m,p5m]})
			}
			//批量删除要素
			document.getElementById('RemoveGraphics').onclick = function(){
				mapUtils.RemoveGraphics({layerid:'glayer2',graphics:[p1,p2]})
			}
			//闪烁要素
			document.getElementById('Twinkle').onclick = function(){
				mapUtils.Twinkle({"graphics":[{"geometry":{"x":119.8140625,"y":37.2578125,
    "spatialReference":{"wkid":4326}},"attributes":{"XCoord":-104.4140625,
    "YCoord":69.2578125,"Plant":"Mesa Mint"},"symbol":{"color":[255,0,0,128],
    "size":12,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSSquare","outline":{"color":[0,0,0,255],"width":1,
    "type":"esriSLS","style":"esriSLSSolid"}}},{"geometry":{"x":119.6140625,"y":37.2578125,
    "spatialReference":{"wkid":4326}},"attributes":{"XCoord":-104.4140625,
    "YCoord":69.2578125,"Plant":"Mesa Mint"},"symbol":{"color":[255,0,0,128],
    "size":12,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSSquare","outline":{"color":[0,0,0,255],"width":1,
    "type":"esriSLS","style":"esriSLSSolid"}}},{"geometry":{"x":119.140625,"y":37.5578125,
    "spatialReference":{"wkid":4326}},"attributes":{"XCoord":-104.4140625,
    "YCoord":69.2578125,"Plant":"Mesa Mint"},"symbol":{"color":[255,0,0,128],
    "size":12,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSSquare","outline":{"color":[0,0,0,255],"width":1,
    "type":"esriSLS","style":"esriSLSSolid"}}},{"geometry":{"x":118.8140625,"y":37.2578125,
    "spatialReference":{"wkid":4326}},"attributes":{"XCoord":-104.4140625,
    "YCoord":69.2578125,"Plant":"Mesa Mint"},"symbol":{"color":[255,0,0,128],
    "size":12,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSSquare","outline":{"color":[0,0,0,255],"width":1,
    "type":"esriSLS","style":"esriSLSSolid"}}}],"duration":1})
			}
			
			
			//高亮要素
			document.getElementById('Highlight').onclick = function(){
				mapUtils.Highlight({"graphics":[{"geometry":{"x":119.4140625,"y":37.2578125,
    "spatialReference":{"wkid":4326}},"attributes":{"XCoord":119.4140625,
    "YCoord":37.2578125,"Plant":"Mesa Mint"},"symbol":{"color":[255,0,0,128],
    "size":12,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSSquare","outline":{"color":[0,0,0,255],"width":1,
    "type":"esriSLS","style":"esriSLSSolid"}}}, {"geometry":{"x":118.4140625,"y":37.2578125,
    "spatialReference":{"wkid":4326}},"attributes":{"XCoord":118.4140625,
    "YCoord":37.2578125,"Plant":"Mesa Mint"},"symbol":{"color":[255,0,0,128],
    "size":12,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSSquare","outline":{"color":[0,0,0,255],"width":1,
    "type":"esriSLS","style":"esriSLSSolid"}}}, {"geometry":{"x":117.4140625,"y":37.2578125,
    "spatialReference":{"wkid":4326}},"attributes":{"XCoord":117.4140625,
    "YCoord":37.2578125,"Plant":"Mesa Mint"},"symbol":{"color":[255,0,0,128],
    "size":12,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    "style":"esriSMSSquare","outline":{"color":[0,0,0,255],"width":1,
    "type":"esriSLS","style":"esriSLSSolid"}}}],layer:'highlightLayer'});
			}
			//轨迹播放管理
			document.getElementById('InitTraceManager').onclick = function(){
				
			}
			//生成聚合图层
			document.getElementById('InitClusteringLayer').onclick = function(){
				mapUtils.InitClusteringLayer({layer: 'clayer', distance: 50});
			}
			//导出地图图片
			document.getElementById('printButton').onclick = function(){
				mapUtils.ExportMap()
			}
			//空间/属性查询
			document.getElementById('Query').onclick = function(){
				mapUtils.Query({layer:"glayer1", geometry:null,where:"id=12",spatialRelationship:mapUtils.spatialRelType.INTERSECTS,callback:function(results){
					alert("查询结果数量： "+results.length)
				}})
			}
			//地图定位
			document.getElementById('LocationCenterAt').onclick = function(){
				mapUtils.LocationCenterAt(119,39,8)
			}
			//弹出冒泡窗口
			document.getElementById('ShowPopup').onclick = function(){
				mapUtils.ShowPopup({layer:'glayer1',id:'12',title:'测试', template:'<p>测试html片段</p>'});
			}
			//隐藏冒泡窗口
			document.getElementById('HidePopup').onclick = function(){
				mapUtils.HidePopup();
			}			
			
			//显示图层标注
			document.getElementById('ShowLabels').onclick = function(){
				mapUtils.ShowLabels({layer:'glayer2',attribute:'Name'},'labelLayer')
			}
						
			//测试绘制点
			document.getElementById('DrawPoint').onclick = function(){
				mapUtils.DrawPoint({layer:'glayer1'});
			}
			//测试绘制线
			document.getElementById('DrawLine').onclick = function(){
				mapUtils.DrawLine({layer:'glayer2'});
			}
			//测试绘制面
			document.getElementById('DrawPolygon').onclick = function(){
				mapUtils.DrawPolygon({layer:'glayer3'});
			}
			
	//	});
  	
  	
  },
  
}
</script>

<style>
/* esri styles */
@import url('http://ncportal.esrichina.com.cn/jsapi/3.24/dijit/themes/claro/claro.css');
@import url('http://ncportal.esrichina.com.cn/jsapi/3.24/esri/css/esri.css');

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

h1, h2 {
  font-weight: normal;
}

.btnPane > ul {
	
  list-style-type: none;
  padding: 0;
}

.btnPane li {
  display: inline-block;
  margin: 10 10px;
  padding: 1px;
}
.btnPane1 > ul {
  list-style-type: none;
  padding: 0;
}

.btnPane1 li {
  display: inline-block;
  margin: 10 10px;
  padding: 1px;
}
.map{
	height: 700px;
	width:100%
}
a {
  color: #42b983;
}
.btnPane{
	position: absolute;
	z-index: 599;
	left: 150px
}
.btnPane1{
	position: absolute;
	z-index: 599;
	top: 30px;
}
.loctip{
	position: absolute;
  bottom: 55px;
  right: 10px;
  z-index: 55;
  padding: 2px;
  background-color: rgb(255,255,255);
  border: solid 1.5 dimgray;
  border-radius: 5px;
}
.nav {
	height:40px;
	width:40px;
	position: relative;
	z-index: 3;	
	left:20px;
	top:66px;
	background-image: url(./assets/zoom-maxextent-mini.png);
	background-repeat:no-repeat; 
	background-size:100% 100%;
	-moz-background-size:100% 100%;
}
.nav .button {
	position: absolute;
	width:33%;
	height:33%;
}
#north {
	left: 33%;
	top: 0px;
}
#west {
	left: 0px;
	top: 33%;
}
#south {
	left: 33%;
	bottom: 0px;
}
#east {
	right: 0px;
	top: 33%;
}
.esriLargeSliderTL{
	top:70px;
}

.funcPane{
	position: absolute;
	z-index: 55;
	width: 80%;
	left: 200px;
}
#navDiv:hover{
	cursor: pointer;
}
#overViewDiv{
	position: absolute;
	z-index: 99;
	bottom: 280px;
	left: 20px;
}
#measureDiv{
	position: absolute;
	z-index: 55;
	top: 200px;
	left: 20px;
	
}
#layerListDiv{
	position: absolute;
	z-index: 55;
	top: 250px;
	right: 20px;
	width:200px;
}


.traceplayer {
	position:absolute;
	top:20px;
	z-index:2
}
.dijitRuleMark{
	border: 1.5px solid white;
	left: -8px;
	width: 8px;
}
</style>
