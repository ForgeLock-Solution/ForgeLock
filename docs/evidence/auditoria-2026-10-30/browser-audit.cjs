const {chromium} = require('playwright-core');
const fs = require('fs');
const path = require('path');
const http = require('http');
const root = process.argv[2];
const out = process.argv[3];
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');const f=path.join(root,decodeURIComponent(u.pathname)==='/'?'index.html':decodeURIComponent(u.pathname));if(!f.startsWith(root)){res.writeHead(403).end();return;}fs.readFile(f,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});res.end(e?'Missing':b);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const results=[];
 for (const route of ['index.html','servicios.html']) for(const width of [320,375,768,1024,1440]) {
  const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();const errors=[];const requests=[];
  page.on('pageerror',e=>errors.push(e.message)); page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>{if(/googletagmanager|google-analytics/.test(r.url()))requests.push(r.url());});
  await page.goto(`http://127.0.0.1:${server.address().port}/${route}`);await page.waitForTimeout(1000);
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const axe=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});
  const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)&&getComputedStyle(e).position!=='absolute';}).map(e=>e.tagName+'.'+e.className).slice(0,12)}));
  await page.screenshot({path:path.join(out,`${route}-${width}.png`),fullPage:true});
  results.push({route,width,layout,errors,requests,axe});
  await context.close();
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results.map(r=>({route:r.route,width:r.width,scrollWidth:r.layout.scrollWidth,errors:r.errors,requests:r.requests,axe:r.axe.map(v=>({id:v.id,count:v.nodes.length}))})),null,2));
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
