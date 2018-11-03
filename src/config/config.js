export default {
	map:null,
 	
	//切片底图图层服务地址
	basemapUrl:"http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer",
	
	//动态服务地址
	dynamicMapUrl:"http://58.87.90.133:6080/arcgis/rest/services/boatriver/MapServer",
	//地图打印服务
	exportmapUrl:"https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
	
	//默认图片的基础目录
	basepicurl: "../src/assets/",
  
  tileLayerURL: 'https://www.arcgis.com/sharing/rest/content/items/86d5ed4b6dc741de9dad5f0fbe09ae95/resources/styles/root.json',
  geowkid:4326,
  prjwkid:102100,
  /***聚合图层的默认参数****/
  //聚合点图层的默认距离
  clusterDistance:20,
  //小聚合点
  sclusterPic:"../../src/assets/BluePin1LargeB.png", 
  //中聚合点
   mclusterPic:"../../src/assets/GreenPin1LargeB.png",  
  //大聚合点
  lclusterPic:"../../src/assets/RedPin1LargeB.png",
  
  defaultPntSymbol:{
		"type": "esriSMS",
		 "style": "esriSMSSquare",
		 "color": [0,255,0,155],
		 "size": 8,
		 "angle": 0,
		 "xoffset": 0,
		 "yoffset": 0,
		 "outline": 
		  {
		  "color": [255,0,0],
		   "width": 1
		}
	},
	highlightPntSymbol:{
		"type": "esriSMS",
		 "style": "esriSMSSquare",
		 "color": [250,15,0,155],
		 "size": 18,
		 "angle": 0,
		 "xoffset": 0,
		 "yoffset": 0,
		 "outline": 
		  {
		  "color": [250,25,25],
		   "width": 1
		}
	},
	highlightPicPntSymbol:{
		"type" : "esriPMS", 
		  "url" : "../../src/assets/defaultFlicker.png", 		  
		  "contentType" : "image/png", 
		  "width" : 35, 
		  "height" : 35, 
		  "angle" : 0, 
		  "xoffset" : 0, 
		  "yoffset" : 0
	},
	measurePntSymbol:{
		"type": "esriSMS",
		 "style": "esriSMSCircle",
		 "color": [250,15,0,155],
		 "size": 10,
		 "angle": 0,
		 "xoffset": 0,
		 "yoffset": 0,
		 "outline": 
		  {
		  "color": [250,25,25],
		   "width": 2
		}
	},
	defaultLineSymbol: {
		"type": "esriSLS",
		"style": "esriSLSDot",
		"color": [255,0,0],
		"width": 2
	},
	highlightLineSymbol: {
		"type": "esriSLS",
		"style": "esriSLSSolid",
		"color": [0,250,250],
		"width": 2
	},
	measureLineSymbol:{
		"type": "esriSLS",
		"style": "esriSLSSolid",
		"color": [255,0,0],
		"width": 2
	},
	defaultFillSymbol: {
	  "type": "esriSFS",
	  "style": "esriSFSSolid",
	  "color": [255,255,0,155],
	    "outline": {
	     "type": "esriSLS",
	     "style": "esriSLSSolid",
	     "color": [255,0,0],
	     "width": 2
		 }
	},
	highlightFillSymbol: {
	  "type": "esriSFS",
	  "style": "esriSFSSolid",
	  "color": [55,255,0,155],
	    "outline": {
	     "type": "esriSLS",
	     "style": "esriSLSSolid",
	     "color": [0,250,250],
	     "width": 2
		 }
	},
	defaultTextSymbol:{
	     "type": "esriTS",
	     "color": [78,78,78,255],
	     "backgroundColor": [0,0,0,0],
	     "borderLineSize": 2,
	     "borderLineColor": [255,0,255,255],
	     "haloSize": 2,
	     "haloColor": [0,255,0,255],
	     "verticalAlignment": "bottom",
	     "horizontalAlignment": "left",
	     "rightToLeft": false,
	     "angle": 0,
	     "xoffset": 0,
	     "yoffset": 0,
	     "kerning": true,
	     "font": {
	      "family": "Arial",
	      "size": 12,
	      "style": "normal",
	      "weight": "bold",
	      "decoration": "none"
	     }
	},
	labelTextSymbol:{
	     "type": "esriTS",
	     "color": [255,255,255,205],
	     "haloSize": 2,
	     "haloColor": [0,25,46,205],
	     "verticalAlignment": "bottom",
	     "horizontalAlignment": "left",
	     "rightToLeft": false,
	     "angle": 0,
	     "xoffset": 10,
	     "yoffset": 0,
	     "kerning": true,
	     "font": {
	      "family": "Arial",
	      "size": 12,
	      "style": "normal",
	      "weight": "bold",
	      "decoration": "none"
	     }
	},
	//航标的symbol
	hangbiaoSymbol:{
	  "type" : "esriPMS", 
	  "url" : "../src/assets/航标.png", 
	  "contentType" : "image/png", 
	  "width" : 19.5, 
	  "height" : 19.5, 
	  "angle" : 0, 
	  "xoffset" : 0, 
	  "yoffset" : 0
	},
	//航标的symbol
	aisSymbol:{
	  "type" : "esriPMS", 
	  "url" : "../src/assets/ais.png", 
	  "contentType" : "image/png", 
	  "width" : 19.5, 
	  "height" : 19.5, 
	  "angle" : 0, 
	  "xoffset" : 0, 
	  "yoffset" : 0
	},//视频的symbol
	spSymbol:{
	  "type" : "esriPMS", 
	  "url" : "../src/assets/摄像头.png", 
	  "contentType" : "image/png", 
	  "width" : 19.5, 
	  "height" : 19.5, 
	  "angle" : 0, 
	  "xoffset" : 0, 
	  "yoffset" : 0
	},//水位站的symbol
	swSymbol:{
	  "type" : "esriPMS", 
	  "url" : "../src/assets/水位站.png", 
	  "contentType" : "image/png", 
	  "width" : 19.5, 
	  "height" : 19.5, 
	  "angle" : 0, 
	  "xoffset" : 0, 
	  "yoffset" : 0
	},
	//闪烁的毫秒单位
	delta:1000,
	//默认地图中心点
	mapcenter: [118.66, 37.085],
	//默认地图缩放级别
	maplevel: 9,
	//默认标注字体颜色
	textcolor: "#fff",
	//默认标注字体大小
	textsize: "20pt",
	//默认字体
	fontfamily: "arial",
	
	
	
}
