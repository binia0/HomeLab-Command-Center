import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1720,height:900},deviceScaleFactor:1});
 const failures=[];
 page.on('pageerror',e=>failures.push(e.message));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:/3D SHOWCASE ANSEHEN/i}).click();
 await page.waitForTimeout(2300);
 const canvas=page.locator('canvas').first();
 const size=await canvas.boundingBox();
 if(!size||size.width<150||size.height<200)throw Error('Missing rack render viewport');
 await mkdir('visual-artifacts',{recursive:true});
 await page.screenshot({path:'visual-artifacts/rack-showcase.png',fullPage:true});
 console.log('Browser viewport rendered:',JSON.stringify(size));
 if(failures.length)throw Error('Browser errors: '+failures.join('; '));
}finally{await browser.close()}
