import React from 'react';
type State={error:Error|null};
export default class AppErrorBoundary extends React.Component<React.PropsWithChildren,State>{
 state:State={error:null};
 static getDerivedStateFromError(error:Error):State{return{error}};
 componentDidCatch(error:Error,info:React.ErrorInfo){console.error('HomeLab UI error',error,info.componentStack)}
 render(){if(!this.state.error)return this.props.children;
 return <main className="hcc-error-screen" role="alert"><div className="hcc-error-panel"><small>HOMELAB COMMAND CENTER / RECOVERY</small><h1>Ein Fehler ist aufgetreten.</h1><p>Dein gespeicherter Rack-Bestand wurde nicht gelöscht. Du kannst die Konfiguration vorsichtshalber exportieren, bevor du die Ansicht neu lädst.</p><pre>{this.state.error.message}</pre><div className="hcc-error-actions"><button onClick={()=>{const entries=['hcc-demo-v1','hcc-links','hcc-services','hcc-device-templates-v1'];const payload=Object.fromEntries(entries.map(k=>[k,localStorage.getItem(k)]));const url=URL.createObjectURL(new Blob([JSON.stringify({format:'hcc-recovery-v1',exportedAt:new Date().toISOString(),data:payload},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='homelab-rack-backup.json';a.click();URL.revokeObjectURL(url)}}>Rackdaten sichern (JSON)</button><button onClick={()=>window.location.reload()}>Ansicht neu laden</button></div></div></main>}
}
