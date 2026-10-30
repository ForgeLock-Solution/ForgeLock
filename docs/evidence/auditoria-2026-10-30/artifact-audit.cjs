const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {JSDOM}=require(process.cwd()+'/node_modules/jsdom');
const root=process.argv[2];const missing=[],brokenFragments=[];
for (const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){const doc=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:'https://forgelock-solution.github.io/ForgeLock/'+file}).window.document;
for(const e of doc.querySelectorAll('[href],[src]')) {const v=e.getAttribute('href')||e.getAttribute('src');if(!v||v==='#')continue;const u=new URL(v,doc.baseURI);if(u.origin!=='https://forgelock-solution.github.io'||!u.pathname.startsWith('/ForgeLock/'))continue;let relative=decodeURIComponent(u.pathname.slice('/ForgeLock/'.length));if(!relative)relative='index.html';let f=path.join(root,relative);if(!fs.existsSync(f))missing.push({file,url:u.href});if(u.hash&&fs.existsSync(f)&&f.endsWith('.html')){const target=new JSDOM(fs.readFileSync(f,'utf8')).window.document;if(!target.getElementById(decodeURIComponent(u.hash.slice(1))))brokenFragments.push({file,url:u.href});}}}
console.log(JSON.stringify({missing,brokenFragments},null,2));
const recurse=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?recurse(path.join(d,e.name)):[path.join(d,e.name)]);
const sensitiveFiles=recurse(root).filter(f=>/(?:^|[\\/])\.env(?:\.|$)|supabase-config\.js$|package-lock|[\\/]\.git[\\/]/.test(f));const secretPatterns=[/sb_secret_[A-Za-z0-9_-]{10,}/g,/gh[pousr]_[A-Za-z0-9]{25,}/g,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,/eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/g];const secretFiles=[];
for(const f of recurse(root).filter(f=>/\.(js|html|css|json|xml|txt)$/.test(f))){const text=fs.readFileSync(f,'utf8');if(secretPatterns.some(p=>{p.lastIndex=0;return p.test(text)}))secretFiles.push(path.relative(root,f));}
console.log(JSON.stringify({sensitiveFiles,secretFiles}));
