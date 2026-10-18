import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1720,height:900},deviceScaleFactor:1});
 const failures=[];
 await mkdir('visual-artifacts',{recursive:true});
 page.on('pageerror',e=>failures.push(e.message));
 let opened=false;
 for(let attempt=0;attempt<30;attempt++){try{await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});opened=true;break}catch{await new Promise(resolve=>setTimeout(resolve,250))}}
 if(!opened)throw Error('Preview HTTP server did not start');
 try{await page.getByRole('button',{name:/3D SHOWCASE ANSEHEN/i}).click({timeout:5000})}catch(e){failures.push('Showcase click: '+String(e))}
 await page.waitForTimeout(2300);
 const canvas=page.locator('canvas').first();
 const size=await canvas.boundingBox();
 await page.screenshot({path:'visual-artifacts/rack-showcase.png',fullPage:true});
 console.log('Browser viewport rendered:',JSON.stringify(size));
 if(!size||size.width<150||size.height<200)failures.push('Missing rack viewport');
 if(failures.length)throw Error('Browser errors: '+failures.join('; '));
}finally{await browser.close()}
