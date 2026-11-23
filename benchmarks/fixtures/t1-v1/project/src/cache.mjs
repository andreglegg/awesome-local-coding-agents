const entries=new Map();export function getOrFetch(key,loader){if(!entries.has(key))entries.set(key,loader());return entries.get(key);}
