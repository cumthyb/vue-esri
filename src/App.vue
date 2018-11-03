<template>
  <div id="app">
    <ul>
      <li>
        <router-link to="/baseapp">通用接口功能演示</router-link>
      </li>
      <li>
        <router-link to="/businessapp">业务接口功能演示</router-link>
      </li>
    </ul>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      msg: '接口封装'
    }
  }
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

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
