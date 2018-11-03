/**
 * 针对graphicslayer进行空间查询和简单条件属性查询
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/query",
        "dojo/on",
        "dojo/topic",
        "dojo/dom",
        "esri/graphic",
        "esri/layers/GraphicsLayer",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dijit/form/HorizontalSlider",
        "esri/geometry/Point",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/PictureMarkerSymbol",
        "esri/Color",
        "esri/SpatialReference",
        "esri/geometry/Polyline",
        "esri/geometry/webMercatorUtils",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./TracePlayer.html"
    ],
    function(
        declare,
        lang,
        query,
        on,
        topic,
        dom,
        Graphic,
        GraphicsLayer,
        domConstruct,
        domStyle,
        HorizontalSlider,
        Point,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        PictureMarkerSymbol,
        Color,
        SpatialReference,
        Polyline,
        WebMercatorUtils,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        template
    ) {
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

            traceTimer: null, //定时器
            traceLayer: null, //轨迹展示图层
            playLayer: null, //轨迹播放图层
            traceLayerId: "tracelayer", //轨迹展示图层id
            playLayerId: "traceplaylayer", //轨迹播放图层id
            timeattrname: "time", //轨迹数据中默认的时间字段名字
            defaultduration: 50, //默认的轨迹播放时间间隔
            defaultpointcolor: "#5B9BD5", //默认轨迹数据的点符号颜色 
            defaultpointsize: 10, //默认轨迹数据的点符号大小
            defaultpointstyle: "circle", //默认轨迹数据的点符号类型
            defaultlinecolor: "#ff0000", //默认轨迹数据的线符号颜色
            defaultlinewidth: 1, //默认轨迹数据的线符号粗细
            defaultlinestyle: "solid", //默认轨迹数据的线符号类型
            defaulttracelinecolor: "#5B9BD5", //默认轨迹播放的线符号颜色
            defaulttracelinewidth: 3, //默认轨迹播放的线符号粗细
            defaulttracelinestyle: "solid", //默认轨迹播放的线符号类型
            currenttime: null, //记录轨迹播放的当前时间
            playbuttonclickevent: null, //播放按钮的点击事件
            pausebuttonclickevent: null, //暂停按钮的点击事件
            defaultanimationpointpicture: "/dist/arrow.png", //默认动画轨迹箭头的图片
            defaultwkid: 4326, //默认轨迹数据的空间参考wkid
            animationstartindex: null, //动画开始点
            animationendindex: null, //动画结束点
            animationline: null, //动画线
            currentpoint: null, //箭头点
            currentpointgraphic: null, //箭头graphic
            graphics: null, //所有的轨迹数据
            templateString: template,
            valuesetter: null,
            mintime: null,
            maxtime: null,
            speed: 24 * 60 * 60 * 1000, //和时间有关，是每秒钟前进多长时间，默认一天
            map: null,
            stopcallback: null, //停止时回调控制界面

            postCreate: function() {
                this.inherited(arguments);
            },

            startup: function() {
                this.init();
            },

            _bindEvent: function() {

            },

            init: function() {
                var timeattrname = this.timeattrname;
                this.playbutton = dojo.byId("playbutton");
                this.pausebutton = dojo.byId("pausebutton");
                //初始化轨迹播放图层
                if (!this.map.getLayer(this.traceLayerId)) {
                    this.traceLayer = new GraphicsLayer({ id: this.traceLayerId });
                    this.playLayer = new GraphicsLayer({ id: this.playLayerId });
                    this.map.addLayer(this.traceLayer);
                    this.map.addLayer(this.playLayer);
                } else {
                    this.traceLayer = this.map.getLayer(this.traceLayerId);
                    this.playLayer = this.map.getLayer(this.playLayerId);
                }


                //记录时间范围
                this.mintime = new Date(2999, 1, 1, 0, 0, 0);
                this.maxtime = new Date(1000, 1, 1, 0, 0, 0);


                //按照时间字段进行排序
                if (this.graphics && this.graphics.length && this.graphics.length > 1)
                    this.graphics.sort(this._compareFun(timeattrname));

                for (var i = 0; i < this.graphics.length; i++) {
                    var graphic = this.graphics[i];
                    if (graphic && graphic.id &&
                        graphic.x && graphic.y && graphic[timeattrname]) {
                        if (graphic[timeattrname] < this.mintime)
                            this.mintime = graphic[timeattrname];
                        if (graphic[timeattrname] > this.maxtime)
                            this.maxtime = graphic[timeattrname];
                        this.drawTracePoint(i);
                        //添加点之间的线
                        if (i > 0) {
                            this.drawTraceLine(this.traceLayer, new Point(this.graphics[i - 1].x, this.graphics[i - 1].y, new SpatialReference(this.defaultwkid)),
                                new Point(this.graphics[i].x, this.graphics[i].y, new SpatialReference(this.defaultwkid)), new SimpleLineSymbol(
                                    this.defaultlinestyle,
                                    new Color(this.defaultlinecolor),
                                    this.defaultlinewidth
                                ));
                        }
                    }
                }
            },

            _compareFun: function(propertyName) {
                return dojo.hitch(propertyName, function(object1, object2) {
                    var value1 = object1[propertyName];
                    var value2 = object2[propertyName];

                    if (value1 < value2) {
                        return -1;
                    } else if (value1 > value2) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            },

            TracePlay: function(param) {
                this.defaultduration = (param && param.duration) || this.defaultduration;
                this.speed = (param && param.speed) || this.speed;
                this.currenttime = (param && param.currenttime) || this.currenttime;
                if (this.traceTimer)
                    this.TraceStop();
                this.traceTimer = setInterval(dojo.hitch(this, this.play), this.defaultduration);

            },

            TraceReplay: function(param) {
                this.TraceStop();
                this.currenttime = this.mintime;
                this.TracePlay(param);
            },

            play: function() {
                var duration = this.defaultduration;
                var starttime = this.currenttime || this.mintime;
                var nexttime = new Date(starttime.valueOf() + this.speed * duration / 1000);
                if (nexttime > this.maxtime) {
                    this.drawArrowAtTime(this.maxtime);
                    this.currenttime = this.maxtime;
                    dojo.hitch(this, this.TraceStop());
                    if (this.stopcallback)
                        this.stopcallback(false);
                } else {
                    if (!this.traceLayer) {
                        console.log("请先初始化轨迹管理器");
                        return;
                    }

                    if (!this.graphics || !this.graphics.length || this.graphics.length < 2) {
                        console.log("请先添加轨迹数据");
                        return;
                    }
                    if (this.valuesetter)
                        this.valuesetter(100 * (nexttime.valueOf() - this.mintime.valueOf()) / (this.maxtime.valueOf() - this.mintime.valueOf()));
                    this.drawArrowAtTime(nexttime);
                    this.currenttime = nexttime;
                }
            },

            drawArrowAtTime: function(time) {
                //查找在哪两个点的中间
                var startandcurrent = this.computePointAtTime(time);
                var start = startandcurrent && startandcurrent.start;
                var current = startandcurrent && startandcurrent.current;
                if (start && current) {
                    this.playLayer.clear();
                    //如果当前的点超出了地图显示范围，则平移
                    var extent = this.map && this.map.extent;
                    if (extent && current && current.x && current.y) {
                        var blpoint = WebMercatorUtils.xyToLngLat(extent.xmin, extent.ymin);
                        var trpoint = WebMercatorUtils.xyToLngLat(extent.xmax, extent.ymax);
                        var xmin = blpoint && blpoint[0];
                        var ymin = blpoint && blpoint[1];
                        var xmax = trpoint && trpoint[0];
                        var ymax = trpoint && trpoint[1];

                        if ((current.x <= xmin && current.y > ymin && current.y < ymax) || (current.x >= xmax && current.y > ymin && current.y < ymax) ||
                            (current.x <= xmin && current.y >= ymax) || (current.x >= xmax && current.y >= ymax) ||
                            (current.y <= ymin && current.x > xmin && current.x < xmax) || (current.y >= ymax && current.x > xmin && current.x < xmax) ||
                            (current.x <= xmin && current.y <= ymin) || (current.x >= xmax && current.y <= ymin)) {
                            this.map.centerAt(new Point(current.x, current.y, new SpatialReference(this.defaultwkid)));
                        }
                    }
                    this.drawTraceInTimes(this.playLayer, this.mintime, start[this.timeattrname]);
                    if (current) {
                        var ptsymbol = new PictureMarkerSymbol(this.defaultanimationpointpicture, 20, 20);
                        var angle = this.computeArrowAngle(start, current);
                        if (angle)
                            ptsymbol.setAngle(angle);
                        var pointgraphic = new Graphic(new Point(current.x, current.y, new SpatialReference(this.defaultwkid)),
                            ptsymbol);
                        this.playLayer.add(pointgraphic);
                        this.drawTraceLine(this.playLayer, start, current, null, null);
                    }
                }


            },

            computePointAtTime: function(time) {
                var startandcurrent = {};
                for (var i = 0; i < this.graphics.length; i++) {
                    var graphic = this.graphics[i];
                    var nextgraphic = this.graphics[i + 1];
                    if (graphic && graphic[this.timeattrname] && graphic.x && graphic.y &&
                        nextgraphic && nextgraphic[this.timeattrname] && nextgraphic.x && nextgraphic.y) {
                        if (graphic[this.timeattrname] < time && nextgraphic[this.timeattrname] >= time) {
                            //根据时间计算坐标
                            var deltatime = nextgraphic[this.timeattrname] - graphic[this.timeattrname];
                            var deltax = nextgraphic.x - graphic.x;
                            var deltay = nextgraphic.y - graphic.y;
                            var rate = (time - graphic[this.timeattrname]) / deltatime;
                            var x = graphic.x + deltax * rate;
                            var y = graphic.y + deltay * rate;
                            startandcurrent.start = graphic;
                            startandcurrent.current = { x: x, y: y, time: new Date(time.valueOf() + deltatime) };
                            return startandcurrent;
                        }
                    }
                }
            },

            computeArrowAngle: function(startgraphic, endgraphic) {
                var angle;
                var startx = startgraphic && startgraphic.x;
                var endx = endgraphic && endgraphic.x;
                if (!startx || !endx)
                    console.log("轨迹数据异常，请检查轨迹横坐标");
                var deltax = Math.round(1000 * (endx - startx) * (this.defaultduration / 1000)) / 1000;
                var starty = startgraphic && startgraphic.y;
                var endy = endgraphic && endgraphic.y;
                if (!starty || !endy)
                    console.log("轨迹数据异常，请检查轨迹纵坐标");
                var deltay = Math.round(1000 * (endy - starty) * (this.defaultduration / 1000)) / 1000;

                if (deltax == 0) {
                    if (deltay == 0) {
                        return;
                    } else {
                        angle = deltay > 0 ? 90 : -90;
                    }
                } else if (deltay == 0) {
                    angle = deltax > 0 ? 0 : 180;
                } else {
                    angle = Math.atan(deltay / deltax) * (180 / Math.PI);
                    if (angle < 90 && angle > 0 && deltay > 0 && deltax > 0)
                        angle = -1 * angle;
                    if (angle < 90 && angle > 0 && deltay < 0 && deltax < 0)
                        angle = 180 - angle;
                    if (angle > -90 && angle < 0 && deltay < 0 && deltax > 0)
                        angle = -1 * angle;
                    if (angle > -90 && angle < 0 && deltay > 0 && deltax < 0)
                        angle = 180 - angle;
                }
                return angle;
            },

            drawTracePoint: function(index) {
                var graphic = this.graphics[index];
                var indexobj = { index: index }
                var pointgraphic = new Graphic(new Point(graphic.x, graphic.y, new SpatialReference(this.defaultwkid)),
                    new SimpleMarkerSymbol(this.defaultpointstyle, this.defaultpointsize,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new Color([255, 255, 255]), 0), this.defaultpointcolor),
                    indexobj);
                this.traceLayer.add(pointgraphic);
            },

            drawTraceInTimes: function(layer, time1, time2, linesymbol) {
                time1 = time1 < this.mintime ? this.mintime : time1;
                time2 = time2 > this.maxtime ? this.maxtime : time2;
                if (this.graphics && this.graphics.length) {
                    var graphicsintimes = this.graphics.filter(dojo.hitch(this, function(graphic) {
                        var time = graphic[this.timeattrname];
                        if (graphic && time && graphic.x && graphic.y && time >= time1 && time <= time2) {
                            return true;
                        }
                    }));
                    for (var i = 0; i < graphicsintimes.length; i++) {
                        var graphic = graphicsintimes[i];
                        if (i > 0) {
                            var p1 = new Point(graphicsintimes[i - 1].x, graphicsintimes[i - 1].y, new SpatialReference(this.defaultwkid));
                            var p2 = new Point(graphic.x, graphic.y, new SpatialReference(this.defaultwkid));
                            this.drawTraceLine(layer, p1, p2, linesymbol ? linesymbol : null);
                        }
                    }
                }
            },

            drawTraceLine: function(layer, point1, point2, linesymbol, callback) {
                var line = new Polyline(new SpatialReference(4326));
                line.addPath([point1, point2]);
                linesymbol = linesymbol || new SimpleLineSymbol(
                    this.defaulttracelinestyle,
                    new Color(this.defaulttracelinecolor),
                    this.defaulttracelinewidth
                );
                var linegraphic = new Graphic(line, linesymbol);
                layer.add(linegraphic);
                if (callback)
                    dojo.hitch(this, callback(linegraphic));
            },

            clear: function() {
                this.traceLayer.clear();
                this.playLayer.clear();
            },

            TraceStop: function() {
                dojo.hitch(this, this.clearTraceTimeout());
            },

            clearTraceTimeout: function() {
                clearInterval(this.traceTimer);
                delete this.traceTimer;
            }


        });
    });