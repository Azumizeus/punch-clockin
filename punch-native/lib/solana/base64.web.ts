// Web : react-native-quick-base64 est un module natif JSI (crash à l'import
// sur web). Cette variante n'est résolue QUE sur la plateforme web (Metro
// choisit base64.web.ts) et utilise l'atob du navigateur — le seul appel
// (connectSeedVault) n'est de toute façon joignable que sur téléphone.
export function toByteArray(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
