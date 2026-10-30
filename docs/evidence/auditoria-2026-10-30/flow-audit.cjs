const assert=require('node:assert/strict');
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright-core');
(async()=>{
const root=process.argv[2];const server=http.createServer((req,res)=>{const f=path.join(root,new URL(req.url,'http://localhost').pathname);fs.readFile(f,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2'}[path.extname(f)]||'application/octet-stream'});res.end(e?'Missing':b)});});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage({viewport:{width:375,height:900}});const origin='http://127.0.0.1:'+server.address().port;
const results=[];const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route(/googletagmanager.com/,r=>r.fulfill({status:200,contentType:'text/javascript',body:'/* intercepted for local audit */'}));
for (const route of ['index.html','servicios.html']) {
 await page.goto(origin+'/'+route);await page.evaluate(()=>localStorage.clear());await page.reload();
 await page.locator('#cookie-reject').click();await page.reload();
 results.push({route,step:'reject-reload',loaded:await page.locator('script[src*="googletagmanager.com"]').count()});
 await page.locator('#cookie-settings').click();await page.locator('#cookie-accept').click();await page.waitForFunction(()=>document.documentElement.dataset.forgeLockAnalytics==='loaded');
 // Prevent actual contact or navigation.
 await page.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('a[href*="wa.me"]'))e.preventDefault();},true));
 await page.locator('a:visible[href*="wa.me"]').first().click();
 results.push({route,step:'accept-click',events:await page.evaluate(()=>dataLayer.filter(x=>x[0]==='event'&&x[1]==='whatsapp_click').length),configs:await page.evaluate(()=>dataLayer.filter(x=>x[0]==='config').length)});
 await page.locator('#cookie-settings').click();await Promise.all([page.waitForEvent('load'),page.locator('#cookie-reject').click()]);
 results.push({route,step:'revoke-reload',choice:await page.evaluate(()=>localStorage.getItem('forgelock_analytics_consent')),loaded:await page.locator('script[src*="googletagmanager.com"]').count()});
}
await page.goto(origin+'/index.html');await page.locator('#mobile-menu-btn').click();if(await page.locator('#mobile-menu-btn').getAttribute('aria-expanded')!=='true')throw Error('menu not open');await page.keyboard.press('Escape');results.push({step:'menu-escape',expanded:await page.locator('#mobile-menu-btn').getAttribute('aria-expanded'),focus:await page.evaluate(()=>document.activeElement.id)});
await page.locator('#idea-textarea').fill('Necesito una pagina para mi barberia con precios y WhatsApp');await page.locator('#btn-generate').click();await page.waitForFunction(()=>document.querySelector('#btn-whatsapp')?.dataset.ideaReady==='true');
await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});results.push({step:'generated-proposal',axe:await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));})});
assert.deepEqual(errors,[]);for(const r of results){if(r.step==='accept-click'){assert.equal(r.events,1);assert.equal(r.configs,1);}if('loaded' in r)assert.equal(r.loaded,0);if(r.step==='revoke-reload')assert.equal(r.choice,'rejected');if(r.step==='menu-escape'){assert.equal(r.expanded,'false');assert.equal(r.focus,'mobile-menu-btn');}if(r.step==='generated-proposal')assert.deepEqual(r.axe,[]);}
console.log(JSON.stringify(results,null,2));fs.writeFileSync(path.join(process.env.TEMP,'forgelock-audit-flows.json'),JSON.stringify(results,null,2));await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
