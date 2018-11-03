import Vue from 'vue'
import VueRouter from 'vue-router'
import { loadScript, loadCss } from 'esri-loader'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import BaseApp from './BaseApp.vue'
import Navigation from './components/Navigation.vue'
import HomeButton from './components/HomeButton.vue'
import LocateButton from './components/LocateButton.vue'
import TracePlayer from './components/TracePlayer.vue'
import BusinessApp from './components/BusinessApp.vue'
import App from './App.vue'


Vue.use(ElementUI);
Vue.use(VueRouter)

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
    { path: '/components/home-button', component: HomeButton },
    { path: '/components/locate-button', component: LocateButton },
    { path: '/components/navigation', component: Navigation },
    { path: '/businessapp', component: BusinessApp },
    { path: '/baseapp', component: BaseApp },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
    routes // short for `routes: routes`
})

var basePathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
//var dojoConfig = {
//  packages:[
//			{name:"extras", location:basePathUrl+"/extras"}
//		]
//};
//// tell Dojo where to load other packages
//dojoConfig: {
//  async: true,
//  packages: [
//    {
//      location: '/extras',
//      name: 'extras'
//    }
//  ]
//},

// 加载ArcGIS JS API
loadCss("http://ncportal.esrichina.com.cn/jsapi/3.24/dijit/themes/claro/claro.css");
const options = {
    dojoConfig: {
        async: false,
        packages: [{
            //location: "./extras",
            location: location.pathname.replace(/\/[^/]+$/, "") + "src/extras",
            name: 'extras'
        }]
    },
    url: 'http://ncportal.esrichina.com.cn/jsapi/3.24/'
        //url:'../src/jscompact/init.js'
};
loadScript(options)


// render the app
new Vue({
    el: '#app',
    data: {
        show: true
    },
    props: ['map'],
    router,
    render: h => h(App)
})