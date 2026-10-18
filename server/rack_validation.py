"""Validation of rack documents before persistent storage.

Strict on topology/identifiers, tolerant of optional legacy presentation fields.
"""
import math
from urllib.parse import urlparse

def valid_rack_document(payload):
    if not isinstance(payload,dict):
        return False
    rack=payload.get('rack')
    if not isinstance(rack,dict) or type(rack.get('width')) is not int or rack['width'] not in (10,19):
        return False
    units=rack.get('units')
    if type(units) is not int or not 4<=units<=42:
        return False
    depth=rack.get('depthMm',600)
    if type(depth) not in (int,float) or not math.isfinite(depth) or not 250<=depth<=1500:
        return False
    devices=rack.get('devices')
    cables=payload.get('cables')
    services=payload.get('services')
    if not isinstance(devices,list) or len(devices)>500 or not isinstance(cables,list) or len(cables)>5000 or not isinstance(services,dict):
        return False
    ids=set()
    ports=set()
    for device in devices:
        if not isinstance(device,dict):
            return False
        device_id=device.get('id')
        if not isinstance(device_id,str) or not 1<=len(device_id)<=128 or '/' in device_id or device_id in ids:
            return False
        ids.add(device_id)
        u=device.get('u'); height=device.get('height')
        if type(u) is not int or type(height) is not int or u<1 or height<1 or u+height-1>units:
            return False
        if not isinstance(device.get('name'),str) or not device['name'].strip():
            return False
        device_ports=device.get('ports')
        if not isinstance(device_ports,list) or len(device_ports)>200:
            return False
        seen=set()
        for port in device_ports:
            if not isinstance(port,dict) or not isinstance(port.get('id'),str) or not port['id'] or '/' in port['id'] or port['id'] in seen:
                return False
            seen.add(port['id'])
            if not isinstance(port.get('type'),str) or not port['type']:
                return False
            if any(type(port.get(k)) not in (int,float) or not math.isfinite(port[k]) or not -1<=port[k]<=1 for k in ('x','y','z')):
                return False
            ports.add(device_id+'/'+port['id'])
    # Resolve physical rack relationships after collecting all device IDs.
    by_id={d['id']:d for d in devices}
    for device in devices:
        host=device.get('hostDeviceId')
        panel=device.get('panelId')
        if host:
            if host not in by_id or host==device['id']:
                return False
        if panel:
            container=by_id.get(panel)
            if not container or panel==device['id'] or not isinstance(container.get('slots'),list):
                return False
            slot=device.get('slotId')
            if not isinstance(slot,str) or slot not in [s.get('id') for s in container['slots'] if isinstance(s,dict)]:
                return False
            if sum(1 for d in devices if d.get('panelId')==panel and d.get('slotId')==slot)>1:
                return False
        visited={device['id']}
        current=device
        while current.get('hostDeviceId') or current.get('panelId'):
            ancestor=current.get('hostDeviceId') or current.get('panelId')
            if ancestor in visited or ancestor not in by_id:return False
            visited.add(ancestor)
            current=by_id[ancestor]
    # Free-standing equipment must not overlap on the same rack face.
    mounted=[d for d in devices if not d.get('hostDeviceId') and not d.get('panelId')]
    for i,left in enumerate(mounted):
        for right in mounted[i+1:]:
            if (left.get('mount') or 'front')!=(right.get('mount') or 'front'):
                continue
            if left['u']<=right['u']+right['height']-1 and right['u']<=left['u']+left['height']-1:
                return False
    occupied=set()
    port_types={}
    for device in devices:
        for port in device['ports']:
            port_types[device['id']+'/'+port['id']]=port['type']
    for link in cables:
        if not isinstance(link,dict) or not isinstance(link.get('a'),str) or not isinstance(link.get('b'),str):
            return False
        if link['a']==link['b'] or link['a'] not in ports or link['b'] not in ports or link['a'] in occupied or link['b'] in occupied:
            return False
        if port_types[link['a']]!=port_types[link['b']] or link['a'].split('/')[0]==link['b'].split('/')[0]:
            return False
        occupied.update((link['a'],link['b']))
    for key, entries in services.items():
        if key not in ids or not isinstance(entries,list) or len(entries)>50:
            return False
        for item in entries:
            if not isinstance(item,dict) or not isinstance(item.get('name'),str) or not isinstance(item.get('url'),str) or len(item['url'])>2048:
                return False
            parsed=urlparse(item['url'])
            if parsed.scheme not in ('http','https') or not parsed.netloc or not parsed.hostname or parsed.username or parsed.password:
                return False
    return True
