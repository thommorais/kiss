parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"cP00":[function(require,module,exports) {
var define;
var e;function t(e){return(t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}!function(){var o,n,r,a={frameRate:150,animationTime:400,stepSize:100,pulseAlgorithm:!0,pulseScale:4,pulseNormalize:1,accelerationDelta:350,accelerationMax:3,keyboardSupport:!0,arrowScroll:50,fixedBackground:!0,excluded:""},i=a,l=!1,c=!1,u={x:0,y:0},s=!1,d=document.documentElement,f=[],m=/^Mac/.test(navigator.platform),p={left:37,up:38,right:39,down:40,spacebar:32,pageup:33,pagedown:34,end:35,home:36},w={37:1,38:1,39:1,40:1};function h(){if(!s&&document.body){s=!0;var e=document.body,t=document.documentElement,a=window.innerHeight,u=e.scrollHeight;if(d=document.compatMode.indexOf("CSS")>=0?t:e,o=e,i.keyboardSupport&&O("keydown",x),top!=self)c=!0;else if(Z&&u>a&&(e.offsetHeight<=a||t.offsetHeight<=a)){var f,m=document.createElement("div");m.style.cssText="position:absolute; z-index:-10000; top:0; left:0; right:0; height:"+d.scrollHeight+"px",document.body.appendChild(m),r=function(){f||(f=setTimeout(function(){l||(m.style.height="0",m.style.height=d.scrollHeight+"px",f=null)},500))},setTimeout(r,10),O("resize",r);if((n=new R(r)).observe(e,{attributes:!0,childList:!0,characterData:!1}),d.offsetHeight<=a){var p=document.createElement("div");p.style.clear="both",e.appendChild(p)}}i.fixedBackground||l||(e.style.backgroundAttachment="scroll",t.style.backgroundAttachment="scroll")}}var y=[],b=!1,v=Date.now();function g(e,t,o){var n,r;if(n=(n=t)>0?1:-1,r=(r=o)>0?1:-1,(u.x!==n||u.y!==r)&&(u.x=n,u.y=r,y=[],v=0),1!=i.accelerationMax){var a=Date.now()-v;if(a<i.accelerationDelta){var l=(1+50/a)/2;l>1&&(l=Math.min(l,i.accelerationMax),t*=l,o*=l)}v=Date.now()}if(y.push({x:t,y:o,lastX:t<0?.99:-.99,lastY:o<0?.99:-.99,start:Date.now()}),!b){var c=e===document.body;q(function n(r){for(var a=Date.now(),l=0,u=0,s=0;s<y.length;s++){var d=y[s],f=a-d.start,m=f>=i.animationTime,p=m?1:f/i.animationTime;i.pulseAlgorithm&&(p=I(p));var w=d.x*p-d.lastX>>0,h=d.y*p-d.lastY>>0;l+=w,u+=h,d.lastX+=w,d.lastY+=h,m&&(y.splice(s,1),s--)}c?window.scrollBy(l,u):(l&&(e.scrollLeft+=l),u&&(e.scrollTop+=u)),t||o||(y=[]),y.length?q(n,e,1e3/i.frameRate+1):b=!1},e,0),b=!0}}function S(e){s||h();var t=e.target;if(e.defaultPrevented||e.ctrlKey)return!0;if(L(o,"embed")||L(t,"embed")&&/\.pdf/i.test(t.src)||L(o,"object")||t.shadowRoot)return!0;var n=-e.wheelDeltaX||e.deltaX||0,r=-e.wheelDeltaY||e.deltaY||0;m&&(e.wheelDeltaX&&N(e.wheelDeltaX,120)&&(n=e.wheelDeltaX/Math.abs(e.wheelDeltaX)*-120),e.wheelDeltaY&&N(e.wheelDeltaY,120)&&(r=e.wheelDeltaY/Math.abs(e.wheelDeltaY)*-120)),n||r||(r=-e.wheelDelta||0),1===e.deltaMode&&(n*=40,r*=40);var a=X(t);return a?!!function(e){if(!e)return;f.length||(f=[e,e,e]);return e=Math.abs(e),f.push(e),f.shift(),clearTimeout(T),T=setTimeout(function(){try{localStorage.SS_deltaBuffer=f.join(",")}catch(e){}},1e3),!P(120)&&!P(100)}(r)||(Math.abs(n)>1.2&&(n*=i.stepSize/120),Math.abs(r)>1.2&&(r*=i.stepSize/120),g(a,n,r),e.preventDefault(),void H()):!c||!G||(Object.defineProperty(e,"target",{value:window.frameElement}),parent.wheel(e))}function x(e){var t=e.target,n=e.ctrlKey||e.altKey||e.metaKey||e.shiftKey&&e.keyCode!==p.spacebar;if(e.keyCode!==p.spacebar){document.body.contains(o)||(o=document.activeElement);var r=/^(button|submit|radio|checkbox|file|color|image)$/i;if(e.defaultPrevented||/^(textarea|select|embed|object)$/i.test(t.nodeName)||L(t,"input")&&!r.test(t.type)||L(o,"video")||t.isContentEditable||n)return!0;if((L(t,"button")||L(t,"input")&&r.test(t.type))&&e.keyCode===p.spacebar)return!0;if(L(t,"input")&&"radio"==t.type&&w[e.keyCode])return!0;var a=0,l=0,u=X(o);if(!u)return!c||!G||parent.keydown(e);var s=u.clientHeight;switch(u==document.body&&(s=window.innerHeight),e.keyCode){case p.up:l=-i.arrowScroll;break;case p.down:l=i.arrowScroll;break;case p.spacebar:l=-(e.shiftKey?1:-1)*s*.9;break;case p.pageup:l=.9*-s;break;case p.pagedown:l=.9*s;break;case p.home:l=-u.scrollTop;break;case p.end:var d=u.scrollHeight-u.scrollTop-s;l=d>0?d+10:0;break;case p.left:a=-i.arrowScroll;break;case p.right:a=i.arrowScroll;break;default:return!0}g(u,a,l),e.preventDefault(),H()}else window.scrollTo(window.innerHeight,0)}function k(e){o=e.target}var D,M,T,E=(D=0,function(e){return e.uniqueID||(e.uniqueID=D++)}),C={};function H(){clearTimeout(M),M=setInterval(function(){C={}},1e3)}function z(e,t){for(var o=e.length;o--;)C[E(e[o])]=t;return t}function X(e){var t=[],o=document.body,n=d.scrollHeight;do{var r=C[E(e)];if(r)return z(t,r);if(t.push(e),n===e.scrollHeight){var a=A(d)&&A(o)||B(d);if(c&&Y(d)||!c&&a)return z(t,V())}else if(Y(e)&&B(e))return z(t,e)}while(e=e.parentElement)}function Y(e){return e.clientHeight+10<e.scrollHeight}function A(e){return"hidden"!==getComputedStyle(e,"").getPropertyValue("overflow-y")}function B(e){var t=getComputedStyle(e,"").getPropertyValue("overflow-y");return"scroll"===t||"auto"===t}function O(e,t){window.addEventListener(e,t,{passive:!1})}function K(e,t){window.removeEventListener(e,t,{passive:!1})}function L(e,t){return(e.nodeName||"").toLowerCase()===t.toLowerCase()}if(window.localStorage&&localStorage.SS_deltaBuffer)try{f=localStorage.SS_deltaBuffer.split(",")}catch(oe){}function N(e,t){return Math.floor(e/t)==e/t}function P(e){return N(f[0],e)&&N(f[1],e)&&N(f[2],e)}var j,q=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(e,t,o){window.setTimeout(e,o||1e3/60)},R=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver,V=(j=!1,function(){if(!j){var e=document.createElement("div");e.classList.add("dummy"),e.style.cssText="height:10000px;width:1px;",document.body.appendChild(e);var t=document.body.scrollTop;document.documentElement.scrollTop,window.scrollBy(0,3),j=document.body.scrollTop!=t?document.body:document.documentElement,window.scrollBy(0,-3),document.body.removeChild(e)}return j});function F(e){var t,o;return(e*=i.pulseScale)<1?t=e-(1-Math.exp(-e)):(e-=1,t=(o=Math.exp(-1))+(1-Math.exp(-e))*(1-o)),t*i.pulseNormalize}function I(e){return e>=1?1:e<=0?0:(1==i.pulseNormalize&&(i.pulseNormalize/=F(1)),F(e))}var _,W=window.navigator.userAgent,$=/Edge/.test(W),G=/chrome/i.test(W)&&!$,J=/safari/i.test(W)&&!$,Q=/mobile/i.test(W),U=/Windows NT 6.1/i.test(W)&&/rv:11/i.test(W),Z=J&&(/Version\/8/i.test(W)||/Version\/9/i.test(W)),ee=(G||J||U)&&!Q;function te(e){for(var t in e)a.hasOwnProperty(t)&&(i[t]=e[t])}"onwheel"in document.createElement("div")?_="wheel":"onmousewheel"in document.createElement("div")&&(_="mousewheel"),_&&ee&&(O(_,S),O("mousedown",k),O("load",h)),te.destroy=function(){n&&n.disconnect(),K(_,S),K("mousedown",k),K("keydown",x),K("resize",r),K("load",h)},window.SmoothScrollOptions&&te(window.SmoothScrollOptions),"function"==typeof e&&e.amd?e(function(){return te}):"object"==("undefined"==typeof exports?"undefined":t(exports))?module.exports=te:window.SmoothScroll=te}();
},{}]},{},["cP00"], null)
//# sourceMappingURL=smoothscroll.7278d923.js.map