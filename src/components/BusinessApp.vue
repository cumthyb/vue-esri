<template>
	<div id="app" class="claro">
		<TracePlayer ref="traceplayer" :tracedata="tracedata" class="traceplayer"></TracePlayer>
		<div id="nav"></div>
		<div class="funcPane">
			<ul class="btnPane1">
				<li>
					<button id="AddGraphics">加载航标数据</button>
				</li>
				<li>
					<button id="ShowNavs">显示航标图层</button>
				</li>
				<li>
					<button id="HideNavs">隐藏航标图层</button>
				</li>
				<li>
					<button id="ShowNavsLabel">显示航标名称</button>
				</li>
				<li>
					<button id="LocateNav">定位航标</button>
				</li>
				<li>
					<button id="AddNavAndMouseClick">添加并定位单个航标</button>
				</li>
				<!--<li><button id="BeaconClickById" >定位航标要素</button></li>-->
				<li>
					<button id="ShowNavMarkPopup">航标信息展示</button>
				</li>
				<li>
					<button id="NavMarkTracePlay" @click="navtraceplay">开始航标轨迹</button>
				</li>
				<li>
					<button id="NavMarkTraceStop" @click="tracehide">停止航标轨迹展示</button>
				</li>
				<hr />
				<li>
					<button id="ShowAisInit">加载AIS数据</button>
				</li>
				<li>
					<button id="ShowAISLayer">显示AIS图层</button>
				</li>
				<li>
					<button id="HideAISLayer">隐藏AIS图层</button>
				</li>

				<li>
					<button id="AisMouseClickById">定位ais船舶</button>
				</li>
				<li>
					<button id="AddOneAisShip">添加并定位</button>
				</li>
				<li>
					<button id="RAisClick">查看AIS详情</button>
				</li>
				<li>
					<button id="AISTracePlay" @click="aistraceplay">播放AIS轨迹</button>
				</li>
				<li>
					<button id="AISTraceStop" @click="tracehide">停止AIS播放</button>
				</li>

				<hr />
				<li>
					<button id="ShowVideoInMap">加载所有视频数据</button>
				</li>
				<li>
					<button id="VideoClick">视频点击</button>
				</li>
				<li>
					<button id="VideoCluster">视频图层聚合</button>
				</li>

				<li>
					<button id="DrawPlottingPoint">增加标绘点</button>
				</li>
				<li>
					<button id="DrawPlottingLine">增加标绘线</button>
				</li>
				<li>
					<button id="DrawPlottingPolygon">增加标绘面</button>
				</li>
				<li>
					<button id="ShowPlottings">展示标绘列表</button>
				</li>
				<li>
					<button id="HidePlottings">隐藏标绘图层</button>
				</li>
				<li>
					<button id="EditPlotting">编辑标绘</button>
				</li>
				<li>
					<button id="RemovePlotting">删除标绘</button>
				</li>
				<hr />
				<li>
					<button id="ShowWaterStationInMap">加载所有水位站</button>
				</li>
				<li>
					<button id="HideGaugingStations">隐藏水位站</button>
				</li>
				<li>
					<button id="ShowGaugingStations">显示水位站</button>
				</li>

				<li>
					<button id="PeopleWaterStatinonClick">高亮单个人工水位站</button>
				</li>
				<li>
					<button id="LocateWaterStation">水位站定位</button>
				</li>
				<li>
					<button id="WaterStationClick">水位站点击</button>
				</li>

			</ul>
		</div>
		<div id="map" ref="map" class="map">
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
import * as mapUtils from '../mapUtils'
import TracePlayer from './TracePlayer'
import ElementUI from 'element-ui'
import * as BusinessMapUtils from '../businessMapUtils'
import config from '../config/config'


export default {
	name: 'businessapp',
	components: {
		TracePlayer
	},
	data () {
		return {
			tracetimeattrname: "time",
			tracedata: []
			//,
			//initmap:mapUtils.createMap('map',{},this.maploaded)
		}
	},
	methods: {
		maploaded: function (res) {
			if (res.status !== "success") {
				console.log("业务地图初始化失败", res.error.stack);
				return;
			} else {

				mapUtils.InitScalebar({ attachTo: 'bottom-left' });
				mapUtils.InitCoordinate('loctip');
				mapUtils.InitOverview();
				mapUtils.InitNavSlider("nav");

				BusinessMapUtils.addBSLayers(res, function (res) {
					console.log("业务图层添加成功");
				});
			}
		},
		navtraceplay: function () {
			//设置航标数据
			mapUtils.Query({
				layer: BusinessMapUtils.bs_navlayer_id,
				callback: this.settracedata
			});
		},
		aistraceplay: function () {
			//设置航标数据
			mapUtils.Query({
				layer: BusinessMapUtils.bs_AISlayer_id,
				callback: this.settracedata
			});
		},
		settracedata: function (graphics) {
			if (graphics && graphics.length) {
				var tracetimeattrname = this.tracetimeattrname;
				this.tracedata = graphics.map((graphic) => {
					if (graphic && graphic.attributes && graphic.attributes.id && graphic.attributes.x
						&& graphic.attributes.y && graphic.attributes[tracetimeattrname]) {
						var obj = {
							id: graphic.attributes.id,
							x: graphic.attributes.x,
							y: graphic.attributes.y
						};
						obj[tracetimeattrname] = graphic.attributes[tracetimeattrname];
						return obj;
					} else {
						return;
					}
				})
				if (this.tracedata) {
					this.$refs.traceplayer.traceplay();
				}
			}
			BusinessMapUtils.ShowNavs();
		},
		tracehide: function () {
			this.$refs.traceplayer.close();
		}

	},
	mounted () {
		mapUtils.createMap('map', {}, this.maploaded);

		//测试数据
		var myP1 = {			"geometry": {				"x": 119.4140625, "y": 37.2578125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": '12', "x": 119.4140625, "y": 37.2578125, "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "振远1号", "time": new Date(2018, 5, 1, 0, 0, 0)			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "船舶位置", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}" }		};
		var myP2 = {			"geometry": {				"x": 118.4140625, "y": 37.2578125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": '13', "x": 118.4140625, "y": 37.2578125, "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "振远2号", "time": new Date(2018, 5, 1, 3, 0, 0)			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "船舶位置", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}" }		};
		var myP3 = {			"geometry": {				"x": 117.9140625, "y": 37.578125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": '14', "x": 117.9140625, "y": 37.578125, "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "振远3号", "time": new Date(2018, 5, 1, 6, 0, 0)			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "船舶位置", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}" }		};
		var p1 = {			"geometry": {				"x": 118.140625, "y": 36.8578125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": "p1", "x": 118.140625, "y": 36.8578125, "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "振远3号", "time": new Date(2018, 5, 1, 0, 0, 0)			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "船舶位置", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}" }		};
		var p2 = {			"geometry": {				"x": 118.4140625, "y": 36.8578125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": "p2", "x": 118.4140625, "y": 36.8578125, "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "爱德华", "time": new Date(2018, 5, 1, 2, 0, 0)			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "船舶位置", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}" }		};
		var p3 = {			"geometry": {				"x": 118.8140625, "y": 36.8578125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": "p3", "x": 118.8140625, "y": 36.8578125, "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "亨利", "time": new Date(2018, 5, 1, 6, 0, 0)			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "船舶位置", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}" }		};
		var p3m = {			"geometry": {				"x": 118.8140625, "y": 36.8578125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": "p3", "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "视频1"			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "船舶位置", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}" }		};
		var p4m = {			"geometry": {				"x": 118.8940625, "y": 36.8578125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": "p4", "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "视频2"			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "船舶位置", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}" }		};
		var p5m = {			"geometry": {				"x": 118.8640625, "y": 36.9978125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": "p5", "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "视频3"			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "船舶位置", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 船舶名字:${Name}" }		};
		var p5mm = {			"geometry": {				"x": 118.7640625, "y": 36.9978125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": "p5", "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "视频3"			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "船舶位置", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 视频:${Name}" }		};
		var s1 = {			"geometry": {				"x": 117.7640625, "y": 36.7978125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": "s1", "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "水位站1"			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "水位站信息", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 水位站名称:${Name}" }		};
		var s2 = {			"geometry": {				"x": 117.4640625, "y": 36.3978125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": "s2", "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "水位站2"			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "水位站信息", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 水位站名称:${Name}" }		};
		var s3 = {			"geometry": {				"x": 117.8640625, "y": 36.5978125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": "s3", "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "水位站3"			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "水位站信息", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 水位站名称:${Name}" }		};
		var s4 = {			"geometry": {				"x": 117.0640625, "y": 36.8978125,
				"spatialReference": { "wkid": 4326 }			}, "attributes": {				"id": "s4", "XCoord": 119.4140625,
				"YCoord": 37.2578125, "Name": "水位站4"			}, "symbol": {				"color": [255, 0, 0, 128],
				"size": 22, "angle": 0, "xoffset": 0, "yoffset": 0, "type": "esriSMS",
				"style": "esriSMSCross", "outline": {					"color": [255, 0, 0, 255], "width": 5,
					"type": "esriSLS", "style": "esriSLSSolid"				}			},
			"infoTemplate": { "title": "水位站信息", "content": "纬度: ${YCoord} <br/>经度: ${XCoord} <br/> 水位站名称:${Name}" }		};

		document.getElementById('AddGraphics').onclick = function () {
			BusinessMapUtils.AddNavGraphics([p1, p2, p3, p3m], 'Name', function (res) {
				console.log("添加航标和标注");
			})
		};
		document.getElementById('ShowNavs').onclick = function () {
			BusinessMapUtils.ShowNavs()
		}
		document.getElementById('HideNavs').onclick = function () {
			BusinessMapUtils.HideNavs()
		}
		document.getElementById('ShowNavsLabel').onclick = function () {
			BusinessMapUtils.ShowNavsLabel({ attribute: 'id' }, function (res) {
				console.log("显示航标名称");
			})
		}
		document.getElementById('LocateNav').onclick = function () {
			BusinessMapUtils.LocateNav('p2', function (res) {
				console.log("显示航标名称");
			})
		}
		//AddNavAndMouseClick
		document.getElementById('AddNavAndMouseClick').onclick = function () {
			BusinessMapUtils.AddNavAndMouseClick(myP1, function (res) {
				console.log("显示航标名称");
			})
		}
		document.getElementById('ShowNavMarkPopup').onclick = function () {
			BusinessMapUtils.ShowNavMarkPopup(p1, "<div><p>信息展示</p><img src='https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1526538528924&di=146745a4ce2b5528725b60e857a8d580&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fimgad%2Fpic%2Fitem%2F023b5bb5c9ea15ce38b29594bc003af33b87b2ca.jpg' style='width:250px;height:250px' ></div>")
		}
		document.getElementById('NavMarkTracePlay').onclick = function () {
			BusinessMapUtils.NavMarkTracePlay()
		}
		document.getElementById('NavMarkTraceStop').onclick = function () {
			BusinessMapUtils.NavMarkTraceStop()
		}
		//ais船舶测试**************
		document.getElementById('ShowAisInit').onclick = function () {
			BusinessMapUtils.ShowAisInit([myP1, myP2, myP3], 'Name', function (res) {
				console.log("加载ais船舶数据", res);
			})
		}
		document.getElementById('ShowAISLayer').onclick = function () {
			BusinessMapUtils.ShowAISLayer()
		}
		document.getElementById('HideAISLayer').onclick = function () {
			BusinessMapUtils.HideAISLayer()
		}
		document.getElementById('AisMouseClickById').onclick = function () {
			BusinessMapUtils.AisMouseClickById('13', "<div>${Name}</div>", (res) => {
				console.log("定位ais船舶", res);
			})
		}
		document.getElementById('AddOneAisShip').onclick = function () {
			BusinessMapUtils.AddOneAisShip(p1, function (res) {
				console.log("添加并定位单个ais船舶", res);
			})
		}
		document.getElementById('RAisClick').onclick = function () {
			BusinessMapUtils.RAisClick('13', "<div><p>信息展示</p><img src='http://img5.imgtn.bdimg.com/it/u=1785073115,381366714&fm=27&gp=0.jpg' style='width:250px;height:250px' ></div>")
		}
		document.getElementById('AISTracePlay').onclick = function () {
			BusinessMapUtils.AISTracePlay()
		}
		document.getElementById('AISTraceStop').onclick = function () {
			BusinessMapUtils.AISTraceStop()
		}
		/**********视频数据*****/
		document.getElementById('ShowVideoInMap').onclick = function () {
			BusinessMapUtils.ShowVideoInMap([p3m, p4m, p5m], 'Name', function (res) {
				console.log("加载视频数据到地图上", res);
			})
		}
		document.getElementById('VideoClick').onclick = function () {
			BusinessMapUtils.VideoClick('p4', "<div><p>信息展示</p><img src='https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1526550889671&di=78509ab7168f26ad722c05a4cc00a19c&imgtype=0&src=http%3A%2F%2Fwww.gxghj.cn%2FUserFiles%2FImage%2F201408%2F20140822-104635.jpg' style='width:250px;height:250px' ></div>")
		}
		document.getElementById('VideoCluster').onclick = function () {
			BusinessMapUtils.VideoCluster({ distance: 0.0005, spatialReference: 4326, singleTemplate: { "title": "测试", "description": "<div><p>信息展示</p><img src='https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1526550889671&di=78509ab7168f26ad722c05a4cc00a19c&imgtype=0&src=http%3A%2F%2Fwww.gxghj.cn%2FUserFiles%2FImage%2F201408%2F20140822-104635.jpg' style='width:250px;height:250px' ></div>" } })
		}
		/****标绘******/
		document.getElementById('DrawPlottingPoint').onclick = function () {
			BusinessMapUtils.DrawPlottingPoint(function (res) {
				console.log("标绘点", res)
			})
		}
		document.getElementById('DrawPlottingLine').onclick = function () {
			BusinessMapUtils.DrawPlottingLine(function (res) {
				console.log("标绘线", res)
			})
		}
		document.getElementById('DrawPlottingPolygon').onclick = function () {
			BusinessMapUtils.DrawPlottingPolygon(function (res) {
				console.log("标绘面", res)
			})
		}
		document.getElementById('ShowPlottings').onclick = function () {
			BusinessMapUtils.ShowPlottingLayer()
		}
		document.getElementById('HidePlottings').onclick = function () {
			BusinessMapUtils.HidePlottingLayer()
		}
		document.getElementById('EditPlotting').onclick = function () {
			BusinessMapUtils.EditPlotting(p5mm)
		}
		document.getElementById('RemovePlotting').onclick = function () {
			BusinessMapUtils.RemovePlotting('p5')
		}

		/**********水位站数据*****/
		document.getElementById('ShowWaterStationInMap').onclick = function () {
			BusinessMapUtils.ShowWaterStationInMap([s1, s2, s3, s4], 'Name', function (res) {
				console.log("添加水位站信息到地图上", res);
			})
		}
		document.getElementById('HideGaugingStations').onclick = function () {
			BusinessMapUtils.HideGaugingStations()
		}
		document.getElementById('ShowGaugingStations').onclick = function () {
			BusinessMapUtils.ShowGaugingStations()
		}


		document.getElementById('PeopleWaterStatinonClick').onclick = function () {
			BusinessMapUtils.PeopleWaterStationClick('s4')
		}
		document.getElementById('LocateWaterStation').onclick = function () {
			BusinessMapUtils.LocateWaterStation('s2')
		}
		document.getElementById('WaterStationClick').onclick = function () {
			BusinessMapUtils.WaterStationClick('s1', "<div><p>信息展示</p><img src='https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1526551913665&di=f7d69613e924d63518330d6c941fc16d&imgtype=jpg&src=http%3A%2F%2Fimg1.imgtn.bdimg.com%2Fit%2Fu%3D1787559786%2C3206582775%26fm%3D214%26gp%3D0.jpg' style='width:250px;height:250px' ></div>")
		}



	},
}
</script>

<style>
@import url('http://ncportal.esrichina.com.cn/jsapi/3.24/dijit/themes/claro/claro.css');
@import url('http://ncportal.esrichina.com.cn/jsapi/3.24/esri/css/esri.css');

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.map{
	height: 800px;
	width:100%
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
.dijitRuleMark{
	border: 1.5px solid white;
	left: -8px;
	width: 8px;
}
.nav {
	height:40px;
	width:40px;
	position: absolute;
	z-index: 3;
	left:25px;
	top:66px;
	background-image: url(../assets/zoom-maxextent-mini.png);
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
</style>
