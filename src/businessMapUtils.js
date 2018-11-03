import * as mapUtils from './mapUtils'
import { loadModules } from 'esri-loader'
import config from './config/config'


//#region 全局变量

let bs_navlayer = null; //业务航标图层
export const bs_navlayer_id = "航标图层";
let bs_navlabellayer = null; //业务航标标注图层
export const bs_navlabellayer_id = "航标标注图层";

let bs_AISlayer = null; //业务AIS图层
export const bs_AISlayer_id = "AIS图层";
let bs_AISlabellayer = null; //业务AIS标注图层
export const bs_AISlabellayer_id = "AIS标注图层";

let bs_videolayer = null; //业务视频图层
export const bs_videolayer_id = "视频图层";
let bs_videolabellayer = null; //业务视频标注图层
export const bs_videolabellayer_id = "视频标注图层";

let bs_plotlayer = null; //业务标绘图层
export const bs_plotlayer_id = "标绘图层";
let bs_plotlabellayer = null; //业务标绘标注图层
export const bs_plotlabellayer_id = "标绘标注图层";

let bs_waterstationlayer = null; //业务水位站图层
export const bs_waterstationlayer_id = "水位站图层";
let bs_waterstationlabellayer = null; //业务水位站标注图层
export const bs_waterstationlabellayer_id = "水位站标注图层";

let bs_highlightlayer = null;
export const bs_highlightlayer_id = "高亮图层";


let hbSymbol = null;
let aisSymbol = null;
let spSymbol = null;
let swSymbol = null;
let hbrender = null;
let aisrender = null;
let sprender = null;
var swrender = null;
//添加四个业务图层及其标注图层和高亮图层
export function addBSLayers(res, callback) {
    if (res.status == 'success') {
        var map = res.data;
        if (map) {
            loadModules([
                "esri/layers/GraphicsLayer",
                "esri/renderers/SimpleRenderer",
                "esri/symbols/PictureMarkerSymbol"
            ]).then(([
                GraphicsLayer,
                SimpleRenderer,
                PictureMarkerSymbol
            ]) => {

                hbSymbol = new PictureMarkerSymbol(config.hangbiaoSymbol);
                aisSymbol = new PictureMarkerSymbol(config.aisSymbol);
                spSymbol = new PictureMarkerSymbol(config.spSymbol);
                swSymbol = new PictureMarkerSymbol(config.swSymbol);
                hbrender = new SimpleRenderer(hbSymbol);
                aisrender = new SimpleRenderer(aisSymbol);
                sprender = new SimpleRenderer(spSymbol);
                swrender = new SimpleRenderer(swSymbol);

                bs_navlayer = new GraphicsLayer({
                    id: bs_navlayer_id
                });
                bs_AISlayer = new GraphicsLayer({
                    id: bs_AISlayer_id
                });
                bs_videolayer = new GraphicsLayer({
                    id: bs_videolayer_id
                });
                bs_plotlayer = new GraphicsLayer({
                    id: bs_plotlayer_id
                });
                bs_waterstationlayer = new GraphicsLayer({
                    id: bs_waterstationlayer_id
                });
                bs_highlightlayer = new GraphicsLayer({
                    id: bs_highlightlayer_id
                });

                bs_navlayer.setRenderer(hbrender);
                bs_AISlayer.setRenderer(aisrender);
                bs_videolayer.setRenderer(sprender);
                bs_waterstationlayer.setRenderer(swrender);

                //加入标注图层
                bs_navlabellayer = new GraphicsLayer({
                    id: bs_navlabellayer_id
                });
                bs_AISlabellayer = new GraphicsLayer({
                    id: bs_AISlabellayer_id
                });
                bs_videolabellayer = new GraphicsLayer({
                    id: bs_videolabellayer_id
                });
                bs_plotlabellayer = new GraphicsLayer({
                    id: bs_plotlabellayer_id
                });
                bs_waterstationlabellayer = new GraphicsLayer({
                    id: bs_waterstationlabellayer_id
                });

                var addlayersevent = map.on("layers-add-result", function(evt) {
                    callback && res && callback(res);
                    addlayersevent.remove();
                    addlayersevent = null;
                })
                map.addLayers([bs_highlightlayer, bs_navlayer, bs_AISlayer, bs_videolayer, bs_waterstationlayer, bs_plotlayer, , bs_navlabellayer, bs_AISlabellayer, bs_videolabellayer, bs_waterstationlabellayer, bs_plotlabellayer]);

            });
        }
    }
}

//显示航标图层
export function ShowNavs() {
    mapUtils.ShowLayer(bs_navlayer_id);
    mapUtils.ShowLayer(bs_navlabellayer_id);
}

//隐藏航标图层
export function HideNavs() {
    mapUtils.HideLayer(bs_navlayer_id);
    mapUtils.HideLayer(bs_navlabellayer_id);
}

//显示AIS图层
export function ShowAISLayer() {
    mapUtils.ShowLayer(bs_AISlayer_id);
    mapUtils.ShowLayer(bs_AISlabellayer_id);
}

//隐藏AIS图层
export function HideAISLayer() {
    mapUtils.HideLayer(bs_AISlayer_id);
    mapUtils.HideLayer(bs_AISlabellayer_id);
}

//显示视频图层
export function ShowVideoLayer() {
    mapUtils.ShowLayer(bs_videolayer_id);
    mapUtils.ShowLayer(bs_videolabellayer_id);
}

//隐藏视频图层
export function HideVideoLayer() {
    mapUtils.HideLayer(bs_videolayer_id);
    mapUtils.HideLayer(bs_videolabellayer_id);
}

//显示标绘图层
export function ShowPlottingLayer() {
    mapUtils.ShowLayer(bs_plotlayer_id);
    mapUtils.ShowLayer(bs_plotlabellayer_id);
}

//隐藏标绘图层
export function HidePlottingLayer() {
    mapUtils.HideLayer(bs_plotlayer_id);
    mapUtils.HideLayer(bs_plotlabellayer_id);
}

//显示水位站图层
export function ShowGaugingStations() {
    mapUtils.ShowLayer(bs_waterstationlayer_id);
    mapUtils.ShowLayer(bs_waterstationlabellayer_id);
}
//显示水位站图层
export function HideGaugingStations() {
    mapUtils.HideLayer(bs_waterstationlayer_id);
    mapUtils.HideLayer(bs_waterstationlabellayer_id);
}

//添加航标数据
export function AddNavGraphics(graphics, attribute, callback) {
    try {
        if (graphics && graphics.length) {

            if (bs_navlayer && bs_navlayer.graphics.length > 0) bs_navlayer.clear();
            if (bs_navlabellayer && bs_navlabellayer.graphics.length > 0) bs_navlabellayer.clear();
            mapUtils.AddGraphics({ layerid: bs_navlayer_id, graphics: graphics, symbol: hbSymbol });
            mapUtils.ShowLabels({ layer: bs_navlayer_id, attribute: attribute }, bs_navlabellayer_id);
            callback && callback({ status: 'success', message: "航标数据添加成功" });
        } else {
            callback && callback({ status: 'error', message: "航标数据添加异常" });
        }
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '航标数据添加异常', error: err });
        callback && callback({ status: 'error', message: "航标数据添加异常" });
    }
}

//显示航标名称
export function ShowNavsLabel(params, callback) {
    try {
        if (params && params.attribute) {
            if (bs_navlabellayer && bs_navlabellayer.graphics.length > 0) {
                bs_navlabellayer.show();
            } else {
                mapUtils.ShowLabels({ layer: bs_navlayer_id, attribute: params.attribute }, bs_navlabellayer_id);
            }

            callback && callback({ status: 'success', message: "显示航标名称成功" });
        } else {
            callback && callback({ status: 'error', message: "显示航标名称异常" });
        }
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '显示航标名称异常', error: err });
        callback && callback({ status: 'error', message: "显示航标名称异常" });
    }
}

//定位航标
export function LocateNav(id, callback) {
    try {
        if (id !== null || id !== undefined || id !== '') {
            mapUtils.Search({
                layers: [{ layerid: bs_navlayer_id, attribute: id, keyword: 'id' }],
                callback: function(results) {
                    if (results && results.length > 0) {
                        bs_highlightlayer && bs_highlightlayer.clear();
                        var g = results[0];
                        var pnt = g.geometry;
                        mapUtils.Highlight({ graphics: [g.toJson()], layer: bs_highlightlayer_id });
                        mapUtils.GetMap().centerAt(pnt);
                        callback && callback({ status: 'success', data: g });
                    } else {
                        callback && callback({ status: 'error', message: "定位航标异常" });
                    }
                }
            })
        }
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '定位航标异常', error: err });
        callback && callback({ status: 'error', message: "定位航标异常" });
    }
}
//添加并定位单个航标
export function AddNavAndMouseClick(graphic, callback) {
    try {
        if (!graphic) return;
        mapUtils.AddGraphics({
            layerid: bs_navlayer_id,
            graphics: [graphic],
            symbol: hbSymbol,
            callback: function(results) {

                if (results && results.status == "success") {
                    bs_highlightlayer && bs_highlightlayer.clear();
                    var g = results.data[0];
                    var pnt = g.geometry;
                    mapUtils.Highlight({ graphics: [g.toJson()], layer: bs_highlightlayer_id });
                    mapUtils.GetMap().centerAt(pnt);
                    callback && callback({ status: 'success', data: g });
                    return;
                } else {
                    callback && callback({ status: 'error', message: "添加并定位单个航标异常" });
                    return;
                }
            }
        });
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '显示航标名称异常', error: err });
        callback && callback({ status: 'error', message: "添加并定位单个航标异常" });
    }
}
//根据航标的ID来定位航标要素
//同定位航标
//航标的浮云信息展示
export function ShowNavMarkPopup(graphic, infotemplate) {
    try {
        if (!graphic) return;
        mapUtils.ShowPopup({ layer: bs_navlayer_id, id: graphic.attributes.id, template: infotemplate });

    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '显示航标信息异常', error: err });
    }
}


//加载可视范围内ais数据
export function ShowAisInit(graphics, attribute, callback) {
    try {
        if (graphics && graphics.length) {
            mapUtils.AddGraphics({ layerid: bs_AISlayer_id, graphics: graphics, symbol: aisSymbol });
            mapUtils.ShowLabels({ layer: bs_AISlayer_id, attribute: attribute }, bs_AISlabellayer_id);
            callback && callback({ status: 'success', message: "ais数据添加成功" });
        }
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: 'ais数据添加异常', error: err });
        callback && callback({ status: 'error', message: "aix数据添加异常" });
    }

}
//根据船舶id定位ais船舶
export function AisMouseClickById(id, infotemplate, callback) {
    try {
        if (id !== null || id !== undefined || id !== '') {
            /*mapUtils.Search({layers:[{layerid:bs_AISlayer_id, attribute:id,keyword:'id'}],callback:function(results){
            	if(results && results.length>0){
            		var g = results[0];
            		var pnt = g.geometry;
            		mapUtils.Highlight({graphics:[g.toJson()],layer:bs_highlightlayer_id });
            		mapUtils.GetMap().centerAt(pnt);
            		callback && callback({status:'success', data:g});
            	}else{
            		callback && callback({status:'error', message:"定位ais船舶异常"});
            	}
            }})*/
            mapUtils.MouseClick({
                layer: bs_AISlayer_id,
                id: id,
                infotemplate: infotemplate,
                callback: callback
            });
        }
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '定位ais船舶异常', error: err });
        callback && callback({ status: 'error', message: "定位ais船舶异常" });
    }
}
//添加并定位单个ais船舶
export function AddOneAisShip(graphic, callback) {
    try {
        if (!graphic) return;
        mapUtils.AddGraphics({
            layerid: bs_AISlayer_id,
            graphics: [graphic],
            symbol: aisSymbol,
            callback: function(results) {
                console.log("results", results);
                if (results && results.status == "success") {
                    var g = results.data[0];
                    var pnt = g.geometry;
                    mapUtils.Highlight({ graphics: [g.toJson()], layer: bs_highlightlayer_id });
                    mapUtils.GetMap().centerAt(pnt);
                    callback && callback({ status: 'success', data: g });
                } else {
                    callback && callback({ status: 'error', message: "添加并定位单个ais船舶异常" });
                }
            }
        });
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '添加并定位单个ais船舶异常', error: err });
        callback && callback({ status: 'error', message: "添加并定位单个ais船舶异常" });
    }
}
//点击可查看AIS详情
export function RAisClick(id, infotemplate) {
    try {
        if (id !== null || id !== undefined || id !== '')
            mapUtils.ShowPopup({ layer: bs_AISlayer_id, id: id, template: infotemplate });

    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '显示航标信息异常', error: err });
    }
}


//加载所有视频数据到地图
export function ShowVideoInMap(graphics, attribute, callback) {
    try {
        if (graphics && graphics.length) {
            mapUtils.AddGraphics({ layerid: bs_videolayer_id, graphics: graphics });
            mapUtils.ShowLabels({ layer: bs_videolayer_id, attribute: attribute }, bs_videolabellayer_id);
            callback && callback({ status: 'success', message: "视频数据添加成功" });
        }
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '视频数据添加异常', error: err });
        callback && callback({ status: 'error', message: "视频数据添加异常" });
    }

}

//视频点击事件
export function VideoClick(id, infotemplate) {
    try {
        if (id !== null || id !== undefined || id !== '') {
            mapUtils.ShowPopup({ layer: bs_videolayer_id, id: id, template: infotemplate });
        };

    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '显示视频点击事件', error: err });
    }

}

//视频图层聚合
export function VideoCluster(params) {
    try {
        mapUtils.InitClusteringLayer({ layer: bs_videolayer_id, distance: params.distance, spatialReference: params.spatialReference, singleTemplate: params.singleTemplate });
        HideVideoLayer();
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '视频点聚合异常', error: err });
    }

}
//增加标绘点
export function DrawPlottingPoint(callback) {
    try {
        mapUtils.DrawPoint({ layer: bs_plotlayer_id, callback: callback });
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '增加标绘点异常', error: err });
    }
}
//增加标绘线
export function DrawPlottingLine(callback) {
    try {
        mapUtils.DrawLine({ layer: bs_plotlayer_id, callback: callback });
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '增加标绘线异常', error: err });
    }
}
//增加标绘面
export function DrawPlottingPolygon(callback) {
    try {
        mapUtils.DrawPolygon({ layer: bs_plotlayer_id, callback: callback });
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '增加标绘线异常', error: err });
    }
}

//展示标绘列表-未完成
export function ShowPlottings() {
    try {
        if (bs_plotlayer && bs_plotlayer.graphics) return bs_plotlayer.graphics
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '返回标绘列表异常', error: err });
        return null;
    }
}
//编辑标绘-未完成
export function EditPlotting(graphic) {
    try {
        if (graphic && graphic.id) {
            mapUtils.EditGraphics({ layerid: bs_plotlayer_id, graphics: [graphic] });
        }
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '编辑标绘异常', error: err });
    }

}
//删除标绘
export function RemovePlotting(id, callback) {
    try {
        if (!bs_plotlayer) return;
        if (id !== null || id !== undefined || id !== '') {
            for (var i = 0; i < bs_plotlayer.graphics.length; i++) {
                if (bs_plotlayer.graphics[i].attributes['id'] === id) {
                    bs_plotlayer.remove(bs_plotlayer.graphics[i]);
                    break;
                }
            }
        }
        callback && callback({ status: 'success', id: id });

    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '删除标绘异常', error: err });
    }

}
//加载所有水文站到地图 bs_waterstationlayer_id
export function ShowWaterStationInMap(graphics, attribute, callback) {
    try {
        if (graphics && graphics.length) {
            mapUtils.AddGraphics({ layerid: bs_waterstationlayer_id, graphics: graphics, symbol: swSymbol });
            mapUtils.ShowLabels({ layer: bs_waterstationlayer_id, attribute: attribute }, bs_waterstationlabellayer_id);
            callback && callback({ status: 'success', message: "水位站添加成功" });
        }
    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '水位站添加异常', error: err });
        callback && callback({ status: 'error', message: "水位站添加异常" });
    }

}
//点击高亮单个人工水位站
export function PeopleWaterStationClick(id, callback) {
    try {
        if (!bs_waterstationlayer) return;
        if (id !== null || id !== undefined || id !== '') {
            let g = null;
            for (var i = 0; i < bs_waterstationlayer.graphics.length; i++) {
                if (bs_waterstationlayer.graphics[i].attributes["id"] == id) {
                    g = bs_waterstationlayer.graphics[i];
                    break;
                }
            }
            g && mapUtils.Highlight({
                "graphics": [g.toJson()],
                layer: bs_highlightlayer_id
            });
            callback && callback({ status: 'success', data: g });
        }

    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '点击高亮单个人工水位站异常', error: err });
        callback && callback({ status: 'error', message: "点击高亮单个人工水位站异常" });
    }

}
//水位站定位
export function LocateWaterStation(id, callback) {
    try {
        if (id !== null || id !== undefined || id !== '') {
            mapUtils.Search({
                layers: [{ layerid: bs_waterstationlayer_id, attribute: id, keyword: 'id' }],
                callback: function(results) {
                    if (results && results.length > 0) {
                        var g = results[0];
                        var pnt = g.geometry;
                        mapUtils.GetMap().centerAt(pnt);
                        g && mapUtils.Highlight({ "graphics": [g.toJson()], layer: bs_highlightlayer_id });
                        callback && callback({ status: 'success', data: g });
                    } else {
                        callback && callback({ status: 'error', message: "水位站定位异常" });
                    }
                }
            })
        }

    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '水位站定位异常', error: err });
    }

}
//水位站点击
export function WaterStationClick(id, infotemplate, callback) {
    try {
        if (id !== null || id !== undefined || id !== '')
            mapUtils.ShowPopup({
                layer: bs_waterstationlayer_id,
                id: id,
                template: infotemplate,
                callback: callback
            });

    } catch (err) {
        //TODO handle the exception
        errorHandler({ message: '显示航标信息异常', error: err });
    }
}



/*异常处理*/
function errorHandler(err) {
    err && err.message && console.log(err.message);
}