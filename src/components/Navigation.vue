<template>
  	<div class="map_nav_bar">
	    <div class="top_panning">
	        <button class="pan_top" @click="panTop"></button>
	        <button class="pan_bottom" @click="panBottom"></button>
	        <button class="pan_left" @click="panLeft"></button>
	        <button class="pan_right" @click="panRight"></button>
	    </div>
	    <div id="zoomBar" class="bottom_zoom">
	        <button class="zoom_out" @click="zoomIn">
	            <div class="zoom_icon"></div>
	        </button>	        
	        <div class="guide_bar">	        	
	            <div id="navBar" class="bar_bg"></div>
	            <button id="navBtn" class="bar_btn"></button>
	        </div>	        
	        <button class="zoom_in" @click="zoomOut">
	            <div class="zoom_icon"></div>
	        </button>
	    </div>
	</div>
</template>

<script>
import * as mapUtils from '../mapUtils'
export default {
  	name: 'navigation',
  	//props:[''],
  	data(){
  		return {
  			ticks:17,
  			tick:9,
  			tickLen:10
  		}
  	},
  	methods:{
	  	panLeft:function(){
	  		this.$emit('map-operation','panleft');
	  	},
	  	panRight:function(){
	  		this.$emit('map-operation','panright');
	  	},
	  	panTop:function(){
	  		this.$emit('map-operation','pantop');
	  	},
	  	panBottom:function(){
	  		this.$emit('map-operation','panbottom');
	  	},
	  	zoomIn:function(){	  			  		
	  		this.$emit('map-operation','zoomin');
	  	},
	  	zoomOut:function(){
	  		
	  		this.$emit('map-operation','zoomout');
	  	},
	  	upTicks:function(){
	  		var zoom = mapUtils.GetMap().getZoom()+1;
	  		if(zoom  >=0 && zoom <= this.$data.ticks){
	  			var navbtnTop = (this.$data.ticks - zoom) * this.$data.tickLen;
	  			document.getElementById("navBtn").style.top = (30 + navbtnTop) +"px";
	  		}
	  		
	  		
	  	},
	  	downTicks:function(zoom){
	  		
	  		var zoom = mapUtils.GetMap().getZoom()-1;
	  		if(zoom  >=0 && zoom <= this.$data.ticks){
	  			var navbtnTop = (this.$data.ticks - zoom) * this.$data.tickLen;
	  			document.getElementById("navBtn").style.top = (30 + navbtnTop) +"px";
	  		}
	  			  		
	  	},
	  	
	  	InitScalebar:function(map){
			var tmap = map;
			var zoom = tmap.getZoom();
			var blayer = tmap.getLayer('blayer');
			var tileInfo = blayer && blayer.tileInfo;
			var ticks = tileInfo && tileInfo.lods.length;
			console.log("ticks", ticks);
			let tickLen = 0;
			if(ticks && zoom > -1){
				this.$data.ticks = ticks;
				this.$data.tick = zoom;			
				tickLen = 90/ticks;
				console.log("tickLen", tickLen);
				this.$data.tickLen = tickLen;
				var navbtnTop = (ticks - zoom) * tickLen;
				//console.log("navbtnTop", navbtnTop);
				document.getElementById("navBtn").style.top = (30 + navbtnTop) +"px";
				var ticksHtml = "<ul class='tickUl'>";
				for (var i=0;i<ticks;i++) {
					ticksHtml += "<li style='height:"+tickLen+"px;'></li>";
				}
				ticksHtml += "</ul>";
				document.getElementById('navBar').innerHTML = ticksHtml;
			}
			
			//定义刻度按钮拖动事件
			var tickBtn = document.getElementById('navBtn');
			var zoomBar = document.getElementById('zoomBar');
			let  startY, diffY;
		    // 是否拖动，初始为 false
		    let dragging = false;
		    // 鼠标按下
		    tickBtn.onmousedown = function(e) {
		        
		        startY = e.pageY;
		          
		        // 如果鼠标在 box 上被按下
		        if(e.target.className.match(/bar_btn/)) {
		                        		          		            		          
		            // 计算坐标差值
		           // diffX = startX - e.target.offsetLeft;
		           
		           if(tickLen > 0){
		           		// 允许拖动
		           		dragging = true;
		           		diffY = startY - e.target.offsetTop;
		           }
		          		            
		        }
		    };
		           
		    // 鼠标移动
		    tickBtn.onmousemove = function(e) {
		        // 移动，更新 box 坐标
		        if(tickBtn !== null && dragging) {
		            //console.log("e.pageY,diffY", e.pageY, diffY);
		            var topY = e.pageY - diffY;
		            if(topY > 30 && topY <120){
		            	tickBtn.style.top = topY + 'px';
		            
		            }
		            
		        }else{
		        	return;
		        }
		    };
		           
		    // 鼠标抬起
		    document.onmouseup= function(e){
		    	dragging = false;
		    };
		    zoomBar.onmouseup = function(e) {
		        // 禁止拖动
		        dragging = false;
				 var topY = e.target.offsetTop;		       
				if(topY > 30 && topY <120){
					var zoom = ticks -  Math.floor((topY-30)/tickLen);
					mapUtils.SetZoom(zoom);
	            
	            }else{
	            	return;
	            }
		        
		    };
		    tickBtn.onmouseup = function(e) {
		        // 禁止拖动
		        dragging = false;
		        var topY = e.target.offsetTop;		       
				if(topY > 30 && topY <120){
					var zoom = ticks -  Math.floor((topY-30)/tickLen);
					mapUtils.SetZoom(zoom);
	            
	            }else{
	            	return;
	            }
		    };
			
			//地图缩放时，导航条刻度变化
			map.on('zoom-end',function(evt){
				var zoom = evt.level;
				if(ticks && zoom > -1){								
					var navbtnTop = (ticks - zoom) * tickLen;
					//console.log("navbtnTop", navbtnTop);
					document.getElementById("navBtn").style.top = (30 + navbtnTop) +"px";
				}	
			});
				  		
	  	},
	  	
	  	
	  	doSomething:function(){
	  		//console.log("移除图层后显示子组件里地图对象的图层,this.$data",this.$data.map.getLayersVisibleAtScale());
	  		//console.log("移除图层后显示子组件里地图对象的图层,mapUtils.GetMap()",mapUtils.GetMap().getLayersVisibleAtScale());
	  		
	  		
	  	}
  },
  
  mounted(){
  	  	
  }
}
</script>

<style>
div.map_nav_bar{
    position: relative;
	top: 125px;
	left: 20px;
	z-index: 50;
	height: 150px;
	width: 100px;
}
div.map_nav_bar div.top_panning{
    width:58px;
    height:58px;
    background-image:url("../assets/span_bg.png");
    position:absolute;
}
div.map_nav_bar div.top_panning button{
    position:absolute;
    width:12px;
    height:12px;
    border:none;
    background:transparent url("../assets/top_n.png") center center no-repeat;
}
div.map_nav_bar div.top_panning button.pan_top{
   top:6px;
   left:50%;
   margin-left:-7px; 
   background-image:url("../assets/top_n.png");
}
div.map_nav_bar div.top_panning button.pan_bottom{
   bottom:8px;
   left:50%;
   margin-left:-7px; 
   background-image:url("../assets/bottom_n.png");
}
div.map_nav_bar div.top_panning button.pan_left{
   top:22px;
   left:7px;
   background-image:url("../assets/left_n.png");
}
div.map_nav_bar div.top_panning button.pan_right{
   top:22px;
   right:8px;
   background-image:url("../assets/right_n.png");
}
div.map_nav_bar div.top_panning button:hover,
div.map_nav_bar div.top_panning button:active,
div.map_nav_bar div.top_panning button:focus{
    outline:none;
}
div.map_nav_bar div.top_panning button.pan_top:hover,
div.map_nav_bar div.top_panning button.pan_top:active,
div.map_nav_bar div.top_panning button.pan_top:focus{
    background-image:url("../assets/top_h.png");
}
div.map_nav_bar div.top_panning button.pan_bottom:hover,
div.map_nav_bar div.top_panning button.pan_bottom:active,
div.map_nav_bar div.top_panning button.pan_bottom:focus{
    background-image:url("../assets/bottom_h.png");
}
div.map_nav_bar div.top_panning button.pan_left:hover,
div.map_nav_bar div.top_panning button.pan_left:active,
div.map_nav_bar div.top_panning button.pan_left:focus{
    background-image:url("../assets/left_h.png");
}
div.map_nav_bar div.top_panning button.pan_right:hover,
div.map_nav_bar div.top_panning button.pan_right:active,
div.map_nav_bar div.top_panning button.pan_right:focus{
    background-image:url("../assets/right_h.png");
}
div.map_nav_bar div.bottom_zoom{
    position:absolute;
    top:65px;
    width:58px;
    height:160px;
}
div.map_nav_bar div.bottom_zoom button{
    border:none;
    box-shadow: 0px 1px 4px rgba(0,0,0,0.3);
    border-radius: 2px;
    display: block;
    height: 26px;
    left: 16px;
    overflow: hidden;
    position: absolute;
    cursor: pointer;
    width: 26px;
    z-index: 2;
    box-sizing: border-box;
    transition: background-color 0.16s ease-out;
    background:rgba(255,255,255,1) url("../assets/plus_n.png") center center no-repeat;
}
div.map_nav_bar div.bottom_zoom button div.zoom_icon{
    
}
div.map_nav_bar div.bottom_zoom button.zoom_out{
    top:0;
}
div.map_nav_bar div.bottom_zoom button.zoom_in{
    bottom:0;
    background-image:url("../assets/minus_n.png");
}
div.map_nav_bar div.bottom_zoom button:hover,
div.map_nav_bar div.bottom_zoom button:active,
div.map_nav_bar div.bottom_zoom button:focus{
    outline:none;
}
div.map_nav_bar div.bottom_zoom button.zoom_out:hover,
div.map_nav_bar div.bottom_zoom button.zoom_out:active,
div.map_nav_bar div.bottom_zoom button.zoom_out:focus{
    background-image:url("../assets/plus_h.png");
}
div.map_nav_bar div.bottom_zoom button.zoom_in:hover,
div.map_nav_bar div.bottom_zoom button.zoom_in:active,
div.map_nav_bar div.bottom_zoom button.zoom_in:focus{
    background-image:url("../assets/minus_h.png");
}
.tickUl{
	position:absolute;
    width:26px;   
    height: 90px; 
    top: 10px;
    text-align: center;
    list-style: none;
}
.tickUl li{
	position:relative;
	display: block;
    height: 12px;
    left: -15px;
    width: 8px;    
	border-bottom: solid 2px white;
}

div.map_nav_bar div.bottom_zoom div.guide_bar div.bar_bg{
    position:absolute;
    width:58px;
    height:140px;
    background:transparent url("../assets/guide_bar.png") center center no-repeat;  
}
div.map_nav_bar div.bottom_zoom div.guide_bar button.bar_btn{
    border:none;
    box-shadow: 0px 1px 4px rgba(0,0,0,0.3);
    border-radius: 2px;
    display: block;
    height: 10px;
    left: 16px;
    width: 26px;
    background:rgba(255,255,255,1) url("../assets/bar_btn.png") center center no-repeat;
    top: 30px;
}
div.map_nav_bar div.bottom_zoom div.guide_bar button.bar_btn:hover,
div.map_nav_bar div.bottom_zoom div.guide_bar button.bar_btn:active,
div.map_nav_bar div.bottom_zoom div.guide_bar button.bar_btn:focus{
    outline:none;
    background-image:url("../assets/bar_btn_h.png");
}
</style>
