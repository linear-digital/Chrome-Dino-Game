const secret = 'SuperSuperSecretKey123456789012'; // Make sure this is 32 bytes
const iv = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes for AES-256-CBC

export async function encrypt(data) {
  if (!data) return null;
  const key = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  const keyBuffer = await crypto.subtle.importKey('raw', key, 'AES-CBC', true, ['encrypt']);
  const jsonData = JSON.stringify(data); // Convert the object/array to a JSON string
  const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, keyBuffer, new TextEncoder().encode(jsonData));
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const encryptedHex = Array.prototype.map.call(encryptedArray, x => ('00' + x.toString(16)).slice(-2)).join('');
  return {
    iv: Array.prototype.map.call(iv, x => ('00' + x.toString(16)).slice(-2)).join(''),
    encryptedData: encryptedHex
  };
}

export async function decrypt(data) {
  if (!data) return null;
  const key = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  const keyBuffer = await crypto.subtle.importKey('raw', key, 'AES-CBC', true, ['decrypt']);
  const ivBuffer = new Uint8Array(data.iv.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  const encryptedBuffer = new Uint8Array(data.encryptedData.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: ivBuffer }, keyBuffer, encryptedBuffer);
  const decryptedJson = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decryptedJson); // Convert the JSON string back to an object/array
}