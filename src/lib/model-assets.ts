/** Persistent per-browser 3D asset store. Survives reloads; independent of localStorage quota. */
const DB='hcc-model-assets-v1',STORE='models';
function openDB():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE)};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
export async function saveModelAsset(deviceId:string,file:File){const db=await openDB();try{await new Promise<void>((resolve,reject)=>{const transaction=db.transaction(STORE,'readwrite');transaction.objectStore(STORE).put(file,deviceId);transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error)})}finally{db.close()}}
export async function loadModelAsset(deviceId:string):Promise<Blob|null>{const db=await openDB();try{return await new Promise((resolve,reject)=>{const request=db.transaction(STORE,'readonly').objectStore(STORE).get(deviceId);request.onsuccess=()=>resolve((request.result as Blob)||null);request.onerror=()=>reject(request.error)})}finally{db.close()}}
export async function deleteModelAsset(deviceId:string){const db=await openDB();try{await new Promise<void>((resolve,reject)=>{const transaction=db.transaction(STORE,'readwrite');transaction.objectStore(STORE).delete(deviceId);transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error)})}finally{db.close()}}

/** The device's original GLB filename for display in the editor. */
export async function modelAssetName(deviceId:string):Promise<string|null>{
 const db=await openDB();try{return await new Promise((resolve,reject)=>{
  const request=db.transaction(STORE,'readonly').objectStore(STORE).get(deviceId);
  request.onsuccess=()=>resolve(request.result instanceof File?request.result.name:request.result?'3D-Modell.glb':null);
  request.onerror=()=>reject(request.error);
 })}finally{db.close()}
}
