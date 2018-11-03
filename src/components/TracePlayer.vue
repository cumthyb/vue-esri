
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<template>
  <div id="traceplayer" v-show="isshow">
     <div id="playbutton" v-show="!isplay" v-bind:style="{ backgroundImage:playimage, float:'left',width:'25px',height:'25px',backgroundSize:'100% 100%' }" @click.stop="play" @mouseover="onmouseover" @mouseout="onmouseout"></div>
     <div id="pausebutton" v-show="isplay" v-bind:style="{ backgroundImage:pauseimage,float:'left',width:'25px',height:'25px',backgroundSize: '100% 100%' }" @click.stop="pause" @mouseover="onmouseover" @mouseout="onmouseout"></div>
     <div id="quitbutton" v-bind:style="{ backgroundImage:quitimage,float:'left',width:'25px',height:'25px',backgroundSize: '100% 100%' }" @click.stop="close" @mouseover="onmouseover" @mouseout="onmouseout"></div>
     <div id="replaybutton" v-bind:style="{ backgroundImage:replayimage,float:'left',width:'25px',height:'25px',backgroundSize: '100% 100%' }" @click.stop="replay" @mouseover="onmouseover" @mouseout="onmouseout"></div>
     <div id="speeddownbutton" v-bind:style="{ backgroundImage:speeddownimage,float:'left',width:'25px',height:'25px',backgroundSize: '100% 100%' }" @click.stop="speeddown" @mouseover="onmouseover" @mouseout="onmouseout"></div>
     <div id="tracesliderdiv" class="tracesliderdiv">
           <el-slider v-model="slidervalue" :show-tooltip="false" :min="1" :max="8" @onchange="setslidervalue"></el-slider>
     </div>
     <div id="speedupbutton" v-bind:style="{ backgroundImage:speedupimage,float:'left',width:'25px',height:'25px', margin:'0 0 0 20px', backgroundSize: '100% 100%' }" @click="speedup" @mouseover="onmouseover" @mouseout="onmouseout"></div>
  </div>
</template>

<script>
import * as mapUtils from '../mapUtils'
export default {
  name: 'trace-player',
  props: ['tracedata'],
  data: function() {
      return {
      	  isshow: false,
          slidervalue: 2,
          slidervalues: [1,2,4,8,12,24,48,72],
          arrowimage: 'url(' + require('../assets/arrow.png') + ')',
          playimage: 'url(' + require('../assets/play.png') + ')',
          playoverimage: 'url(' + require('../assets/play_mousemove.png') + ')',
          pauseimage: 'url(' + require('../assets/stop.png') + ')',
          pauseoverimage: 'url(' + require('../assets/stop_mousemove.png') + ')',
          quitimage: 'url(' + require('../assets/exit.png') + ')',
          quitoverimage: 'url(' + require('../assets/exit_mousemove.png') + ')',
          replayimage: 'url(' + require('../assets/repeat.png') + ')',
          replayoverimage: 'url(' + require('../assets/repeat_mousemove.png') + ')',
          speeddownimage: 'url(' + require('../assets/slow.png') + ')',
          speeddownoverimage: 'url(' + require('../assets/slow_mousemove.png') + ')',
          speedupimage: 'url(' + require('../assets/fast.png') + ')',
          speedupoverimage: 'url(' + require('../assets/fast_mousemove.png') + ')',
          isplay: false,
          duration: 50
      }
  },
  methods:{
      traceplay: function(param){
      	  this.isshow = true;
          mapUtils.InitTraceManager({
          	defaultanimationpointpicture: this.$data.arrowimage, 
          	tracedata: this.$parent.tracedata, 
          	duration: this.$data.duration, 
          	speed: this.$data.slidervalues[this.$data.slidervalue-1]*3600*1000,
          	valuesetter: this.setslidervalue, 
          	div: document.getElementById("traceplayer"),
          	stopcallback:this.setisplay
          });
      },
      close: function(){
      	  this.isshow = false;
      	  this.pause();
      	  this.clear();
      },
      play: function(){
          this.setisplay(true);
          mapUtils.TracePlay(this.$data.slidervalues[this.$data.slidervalue-1]*3600*1000);
      },
      pause: function(){
          this.setisplay(false);
          mapUtils.TraceStop();
      },
      clear: function(){
      	  mapUtils.TraceClear();
      },
      replay: function(){
      	  this.setisplay(true);
		  mapUtils.TraceReplay(this.$data.slidervalues[this.$data.slidervalue-1]*3600*1000);
      },
      speedup: function(){
      	  this.$data.slidervalue = (this.$data.slidervalue == 8)? 8 : (this.$data.slidervalue + 1)
      },
      speeddown: function(){
      	  this.$data.slidervalue = (this.$data.slidervalue == 1)? 1 : (this.$data.slidervalue - 1)
      },
      setslidervalue: function(value){
          mapUtils.TracePlay(this.$data.slidervalues[this.$data.slidervalue-1]*3600*1000);
      },
      setisplay: function(isplay){
      	  this.isplay = isplay;
      },
      setisshow: function(isshow){
      	this.isshow = isshow;
      },
      onmouseover: function(e){
      	  var target = e.target;
      	  if(target.style.backgroundImage){
      	  	var parts = target.style.backgroundImage.split(".");
      	  	target.style.backgroundImage = parts[0] + "_mousemove." + parts[1];
      	  }
      },
      onmouseout: function(e){
         var target = e.target;
      	  if(target.style.backgroundImage){
      	  	target.style.backgroundImage = target.style.backgroundImage.replace("_mousemove","");
      	  }
      }
  },
  mounted: function () {
     
  }
}
</script>

<style>

.tracesliderdiv {
  float:left;
  margin-left: 10px;
  padding-top:10px;
  width:190px
}
.el-slider__button {
  width:8px;
  height:8px;
  border: 1px solid #000000
}
.el-slider__runway {
  margin: 0 0;
  padding: 0 5px
}

.buttonhide {
  display: none
}
</style>
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">