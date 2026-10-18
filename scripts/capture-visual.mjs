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
 // Functional smoke checks follow the untouched reference screenshot.
 try{
  const deviceButton=page.locator('.item-select').first();
  const selectedName=(await deviceButton.locator('strong').innerText()).trim();
  await deviceButton.click();
  await page.waitForTimeout(250);
  const inspector=await page.locator('.right').innerText();
  if(!inspector.includes(selectedName))failures.push('Device list selection did not update the inspector');
 }catch(e){failures.push('Device selection smoke check: '+String(e))}
 try{
  await page.getByRole('button',{name:/DISPLAY \+ RASPBERRY PI/i}).click();
  const prior=await page.locator('.items .item').count();
  const field=page.getByRole('dialog').getByRole('textbox');
  await field.fill('Test Monitor');
  await field.press('Enter');
  if(await page.locator('.items .item').count()!==prior)failures.push('LCD/Pi auto-created while typing');
  await page.getByRole('button',{name:/LCD \+ Pi montieren/i}).click();
  await page.waitForTimeout(250);
  if(await page.locator('.items .item').count()!==prior+1)failures.push('LCD/Pi mount did not create exactly one device');
 }catch(e){failures.push('LCD/Pi mounting smoke check: '+String(e))}

 if(!size||size.width<150||size.height<200)failures.push('Missing rack viewport');
 if(failures.length)throw Error('Browser errors: '+failures.join('; '));
}finally{await browser.close()}
