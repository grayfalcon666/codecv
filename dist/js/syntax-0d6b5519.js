import{s as h}from"./index-8daee967.js";import{r as p,b as m,a6 as k,d as i,o as e,c as t,a as d,$ as F,R as C,u as l,n as M,M as B,I as _,ad as D,P as v,S as A,a0 as x}from"./@vue-b6ad969b.js";import{c as w}from"./@vueuse-089d0217.js";import{a as b,E as T}from"./index-dc3f48e4.js";import"./element-plus-42b11d9d.js";import"./lodash-es-f12a6db5.js";import"./@element-plus-6a99cdea.js";import"./async-validator-604317c1.js";import"./@popperjs-432deaea.js";import"./@ctrl-bfd40a1f.js";import"./dayjs-e514b1ee.js";import"./aos-80360ef4.js";import"./memoize-one-dd606afd.js";import"./normalize-wheel-es-5e9aec41.js";import"./@floating-ui-1f831770.js";import"./pinia-2dc60150.js";import"./vue-demi-3c8f99f1.js";import"./picture-verification-code-77c40e50.js";import"./axios-30a98c9d.js";import"./vue-router-0650dbbf.js";import"./nprogress-6c9d9548.js";function H(){const n=p(0),o=w(function(){n.value=(document.documentElement||document.body).scrollTop},50);return m(()=>{document.addEventListener("scroll",o)}),k(()=>{document.removeEventListener("scroll",o)}),n}const N=["level"],I=i({__name:"menuBarItem",props:{MenuItem:{}},setup(n){const o=H();return(a,u)=>(e(),t("div",{class:"o_menu-bar_title",level:n.MenuItem.level},[d("span",{class:C({o_active:l(o)>=n.MenuItem.offset&&l(o)<n.MenuItem.offsetMax})},F(n.MenuItem.title),3)],8,N))}});const L=b(I,[["__scopeId","data-v-ccdd5969"]]);function Y(n){const o=p([]);return M(()=>{o.value=f(n)}),B(()=>{o.value=f(n)}),o}function f(n){const o=[];return E(o,document.querySelector(n)),$(o),o}function E(n,o,a){const u=o==null?void 0:o.tagName.toLowerCase();if((o==null?void 0:o.nodeType)==1&&u[0]==="h"){const s={offsetMax:0};s.title=o.textContent+"",s.level=+u[1],s.offset=S(o),s.target=o,n.push(s)}else{if(!o||o.nodeType!=1)return;const s=Array.from(o.children);for(const c of s)E(n,c)}}function S(n){let o=n==null?void 0:n.offsetTop,a=n.offsetParent;for(;a!==null;)o+=a.offsetTop,a=a.offsetParent;return o}function $(n){for(let o=0,a=n.length;o<a;o++)o+1<a?n[o].offsetMax=n[o+1].offset:n[o].offsetMax=1/0}const P={class:"o_menu_title"},z={key:0,class:"o_menu_bar_container"},O=i({__name:"MenuBar",props:{body:{},menuTitle:{},style:{type:[Boolean,null,String,Object,Array]}},emits:["MenuBarClick"],setup(n,{emit:o}){const a=n,u=o,s=Y(a.body);function c(r){h(r.offset),u("MenuBarClick",r)}return(r,R)=>(e(),t("div",{class:"o_navigator_menu",style:A(n.style)},[d("h3",P,F(n.menuTitle||"\u76EE\u5F55"),1),l(s).length?(e(),t("div",z,[(e(!0),t(_,null,D(l(s),(g,y)=>(e(),v(L,{key:y,MenuItem:g,onClick:U=>c(g)},null,8,["MenuItem","onClick"]))),128))])):(e(),v(T,{key:1,title:"\u6682\u65E0\u6807\u9898"}))],4))}});const V=b(O,[["__scopeId","data-v-0f9a0dee"]]);const j=`<h2 style="background:var(--background); color: var(--font-color); margin-bottom: 10px;">
<span style="color: var(--font-color); background:(--background); ">\u524D\u8A00</span>
</h2>
<p style="background:var(--background); color: var(--font-color)">
<span style="line-height: 28px; color: var(--font-color)"
  >\u5982\u679C\u4F60\u60F3\u7F16\u5199\u4E00\u6B3E<strong>\u6BD4\u8F83\u597D\u7684\u7B80\u5386\u6392\u7248</strong>\uFF0C\u90A3\u4F60\u53EF\u4EE5\u5B66\u4E60\u4E00\u4E0B\u4E0B\u9762\u8FD9\u4E9B\u8BED\u6CD5\uFF0C\u653E\u5FC3\uFF0C\u4E0D\u4F1A\u82B1\u8D39\u591A\u5C11\u65F6\u95F4.</span
>
</p>
<h2 style="background:var(--background); color: var(--font-color); margin: 20px 0 10px 0;">
<span style="color: var(--font-color); background:(--background)">\u5F39\u6027\u5E03\u5C40</span>
</h2>
<p style="background:var(--background); color: var(--font-color)">
<span style="line-height: 28px"
  ><span style="color: var(--font-color); background:(--background)">\u5B83\u4F1A\u88AB\u6E32\u67D3\u4E3A\u5E26</span
  ><code
    style="
      font-family: 'Microsoft YaHei Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      color: rgb(229, 61, 14);
    "
    >flex-layout</code
  ><span style="color: var(--font-color); background:(--background)">\u7C7B\u540D\u7684\u5F39\u6027\u76D2\uFF0C\u800C\u5728</span
  ><code
    style="
      font-family: 'Microsoft YaHei Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      color: rgb(229, 61, 14);
    "
    >:::</code
  ><span style="color: var(--font-color); background:(--background)"
    >\u4E2D\u95F4\u7684\u5185\u5BB9\u5C06\u4F1A\u88AB\u6E32\u67D3\u4E3A\u4E00\u4E2A\u5F39\u6027\u5143\u7D20, \u4F60\u53EF\u4EE5\u4F7F\u7528\u5B83\u6765\u6784\u9020\u591A\u5217\u5E03\u5C40\uFF0C\u5982\u4E0B.</span
  ></span
>
</p>
<pre
lang=""
theme="dark"
class="tb-pre"
><div style="width:2.5em" class="tb-code-line-number-bg"></div><div class="tb-code-content"><div class="tb-code-line">::: start</div><div class="tb-code-line">content...</div><div class="tb-code-line">:::</div><div class="tb-code-line">content...</div><div class="tb-code-line">:::</div><div class="tb-code-line">content...</div><div class="tb-code-line">::: end</div></div><span class="tb-pre-lang"></span></pre>
<p style="background:var(--background); color: var(--font-color)">
<span style="line-height: 28px"
  ><span style="color: var(--font-color); background:(--background)">\u4E0A\u9762\u7684&nbsp;</span
  ><code
    style="
      font-family: 'Microsoft YaHei Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      color: rgb(229, 61, 14);
    "
    >Markdown</code
  ><span style="color: var(--font-color); background:(--background)">&nbsp;\u8BED\u6CD5\u5C06\u4F1A\u88AB\u8F6C\u5316\u4E3A\u4E0B\u9762\u7684&nbsp;</span
  ><code
    style="
      font-family: 'Microsoft YaHei Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      color: rgb(229, 61, 14);
    "
    >HTML</code
  ><span style="color: var(--font-color); background:(--background)">&nbsp;\u4EE3\u7801.</span></span
>
</p>
<pre
lang="HTML"
theme="dark"
class="tb-pre"
><div style="width:2.5em" class="tb-code-line-number-bg"></div><div class="tb-code-content"><div class="tb-code-line">&lt;<span class="tb-hl-tag">div&nbsp;</span><span class="tb-hl-attr-name">class</span>="<span class="tb-hl-attr-value">flex-layout</span>"&gt;</div><div class="tb-code-line">&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="tb-hl-tag">div&nbsp;</span><span class="tb-hl-attr-name">class</span>="<span class="tb-hl-attr-value">flex-layout-item</span>"&gt;content...&lt;/<span class="tb-hl-tag">div</span>&gt;</div><div class="tb-code-line">&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="tb-hl-tag">div&nbsp;</span><span class="tb-hl-attr-name">class</span>="<span class="tb-hl-attr-value">flex-layout-item</span>"&gt;content...&lt;/<span class="tb-hl-tag">div</span>&gt;</div><div class="tb-code-line">&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="tb-hl-tag">div&nbsp;</span><span class="tb-hl-attr-name">class</span>="<span class="tb-hl-attr-value">flex-layout-item</span>"&gt;content...&lt;/<span class="tb-hl-tag">div</span>&gt;</div><div class="tb-code-line">&lt;<span class="tb-hl-tag">div</span>&gt;</div></div><span class="tb-pre-lang">HTML</span></pre>
<h2 style="background:var(--background); color: var(--font-color); margin: 20px 0 10px 0;">
<span style="color: var(--font-color); background:(--background)">\u4E2A\u4EBA\u4FE1\u606F\u5E03\u5C40</span>
</h2>
<p style="background:var(--background); color: var(--font-color)">
<span style="line-height: 28px"
  ><span style="color: var(--font-color); background:(--background)"
    >\u5982\u679C\u4F60\u60F3\u5355\u72EC\u5BF9\u7B80\u5386\u5934\u90E8\u7684\u4E2A\u4EBA\u4FE1\u606F\u8FDB\u884C\u6392\u7248\uFF0C\u90A3\u4F60\u53EF\u4EE5\u8003\u8651\u4F7F\u7528&nbsp;</span
  ><code
    style="
      font-family: 'Microsoft YaHei Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      color: rgb(229, 61, 14);
    "
    >Head</code
  ><span style="color: var(--font-color); background:(--background)"
    >&nbsp;\u5E03\u5C40\uFF0C\u9488\u5BF9\u6027\u7684\u5BF9\u4E2A\u4EBA\u4FE1\u606F\u8FDB\u884C\u6837\u5F0F\u8BBE\u7F6E\uFF0C\u548C\u5F39\u6027\u5E03\u5C40\u5DEE\u4E0D\u591A\uFF0C\u4F60\u9700\u8981\u4F7F\u7528&nbsp;</span
  ><code
    style="
      font-family: 'Microsoft YaHei Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      color: rgb(229, 61, 14);
    "
    >:::</code
  ><span style="color: var(--font-color); background:(--background)"
    >&nbsp;\u8BED\u6CD5\u5BF9\u5176\u8FDB\u884C\u5206\u5272\uFF0C\u5E76\u7ED9\u51FA\u5F00\u59CB\u548C\u7ED3\u675F\u6807\u5FD7.</span
  ></span
>
</p>
<pre
lang=""
theme="dark"
class="tb-pre"
><div style="width:2.5em" class="tb-code-line-number-bg"></div><div class="tb-code-content"><div class="tb-code-line">::: headStart</div><div class="tb-code-line">content....</div><div class="tb-code-line">::: headEnd</div></div><span class="tb-pre-lang"></span></pre>
<p style="background:var(--background); color: var(--font-color)">
<span style="line-height: 28px"
  ><span style="color: var(--font-color); background:(--background)">\u4E0A\u9762\u7684&nbsp;</span
  ><code
    style="
      font-family: 'Microsoft YaHei Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      color: rgb(229, 61, 14);
    "
    >Markdown</code
  ><span style="color: var(--font-color); background:(--background)">&nbsp;\u8BED\u6CD5\u5C06\u4F1A\u88AB\u8F6C\u5316\u4E3A\u4E0B\u9762\u7684&nbsp;</span
  ><code
    style="
      font-family: 'Microsoft YaHei Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      color: rgb(229, 61, 14);
    "
    >HTML</code
  ><span style="color: var(--font-color); background:(--background)">&nbsp;\u4EE3\u7801.</span></span
>
</p>
<pre
lang="HTML"
theme="dark"
class="tb-pre"
><div style="width:2.5em" class="tb-code-line-number-bg"></div><div class="tb-code-content"><div class="tb-code-line">&lt;<span class="tb-hl-tag">div&nbsp;</span><span class="tb-hl-attr-name">class</span>="<span class="tb-hl-attr-value">head-layout</span>"&gt;</div><div class="tb-code-line">&nbsp;&nbsp;&nbsp;&nbsp;content....</div><div class="tb-code-line">&lt;<span class="tb-hl-tag">div</span>&gt;</div></div><span class="tb-pre-lang">HTML</span></pre>
<h2 style="background:var(--background); color: var(--font-color); margin: 20px 0 10px 0;">
<span style="color: var(--font-color); background:(--background)">\u5185\u7F6E\u56FE\u6807</span>
</h2>
<p style="background:var(--background); color: var(--font-color)">
<span style="line-height: 28px; color: var(--font-color)"
  >\u6211\u4E5F\u5185\u7F6E\u4E86\u4E00\u4E9B\u56FE\u6807\uFF0C\u5982\u679C\u4F60\u60F3\u4F7F\u7528\u5B83\uFF0C\u4F60\u53EF\u4EE5\u901A\u8FC7\u4EE5\u4E0B\u8BED\u6CD5\u4F7F\u7528\uFF0C<strong>\u5EFA\u8BAE\u4F7F\u7528\u7A7A\u683C\u7ED3\u5C3E</strong>.</span
>
</p>
<pre
lang=""
theme="dark"
class="tb-pre"
><div style="width:2.5em" class="tb-code-line-number-bg"></div><div class="tb-code-content"><div class="tb-code-line">icon:github&nbsp;</div></div><span class="tb-pre-lang"></span></pre>
<p style="background:var(--background); color: var(--font-color)">
<span style="line-height: 28px"
  ><span style="color: var(--font-color); background:(--background)">\u4E0A\u9762\u7684&nbsp;</span
  ><code
    style="
      font-family: 'Microsoft YaHei Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      color: rgb(229, 61, 14);
    "
    >Markdown</code
  ><span style="color: var(--font-color); background:(--background)">&nbsp;\u8BED\u6CD5\u5C06\u4F1A\u88AB\u8F6C\u5316\u4E3A\u4E0B\u9762\u7684&nbsp;</span
  ><code
    style="
      font-family: 'Microsoft YaHei Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      color: rgb(229, 61, 14);
    "
    >HTML</code
  ><span style="color: var(--font-color); background:(--background)">&nbsp;\u4EE3\u7801.</span></span
>
</p>
<pre
lang="HTML"
theme="dark"
class="tb-pre"
><div style="width:2.5em" class="tb-code-line-number-bg"></div><div class="tb-code-content"><div class="tb-code-line">&lt;<span class="tb-hl-tag">i&nbsp;</span><span class="tb-hl-attr-name">class</span>="<span class="tb-hl-attr-value">iconfont\xA0icon-github</span>"&gt;&lt;/<span class="tb-hl-tag">i</span>&gt;</div></div><span class="tb-pre-lang">HTML</span></pre>
<h2 style="background:var(--background); color: var(--font-color); margin: 20px 0 10px 0;">
<span style="color: var(--font-color); background:(--background)">over</span>
</h2>
<p style="background:var(--background); color: var(--font-color)">
<span style="line-height: 28px"
  ><span style="color: var(--font-color); background:(--background)"
    >\u4EE5\u4E0A\u5C31\u662F\u8BE5\u7B80\u5386\u6240\u652F\u6301\u7684\u4E00\u4E9B\u7279\u6B8A\u8BED\u6CD5\uFF0C\u5176\u4ED6\u7684\u8BED\u6CD5\u4E0E \u539F\u751F</span
  ><code
    style="
      font-family: 'Microsoft YaHei Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      color: rgb(229, 61, 14);
    "
    >Markdown</code
  ><span style="color: var(--font-color); background:(--background)"
    >&nbsp;\u540C\u6B65\uFF0C<strong>\u5982\u679C\u4F60\u6709\u4E0D\u9519\u7684\u60F3\u6CD5</strong>\uFF0C\u53EF\u4EE5\u5411\u6211\u63D0\u51FA\uFF0C</span
  ><code
    style="
      font-family: 'Microsoft YaHei Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      color: rgb(229, 61, 14);
    "
    >\u6B22\u8FCE\u7ED9\u8FD9\u4E2A\u9879\u76EE\u63D0\u4F9B\u4E0D\u540C\u7684\u7B80\u5386\u6A21\u677F</code
  ><span style="color: var(--font-color); background:(--background)"
    >\uFF0C\u611F\u8C22.&nbsp;<a target="null" href="https://github.com/acmenlei/markdown-resume-to-pdf"
      >\u4ED3\u5E93\u5730\u5740</a
    ></span
  ></span
>
</p>`,q={id:"syntax",class:"flex noto-sans-sc","data-aos":"fade-right"},G=i({__name:"syntax",setup(n){const o=p();return m(()=>{o.value.innerHTML=j}),(a,u)=>(e(),t("div",q,[d("div",{class:"syntax-helper",ref_key:"helper",ref:o},null,512),x(V,{class:"slider",body:".syntax-helper",style:{width:"400px"}})]))}});const fo=b(G,[["__scopeId","data-v-24650066"]]);export{fo as default};
