import { useCallback } from "react";

const decodeBase64ToArrayBuffer = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const useSplitFile = (): any => {

  const loadAndSplitBuffers = useCallback(async ({ url }: { url: string }) => {
    const response = await fetch('/api/split-audio-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
      }),
    });
  
    if (response.ok) {
      const res = await response.json();
      console.log('res =', res);

      const arrayBuffers = res.buffers.map(decodeBase64ToArrayBuffer);
      return arrayBuffers;
      return []
    } else {
      console.error('Error:', await response.json());
    }
  }, [])

  return {
    loadAndSplitBuffers,
  }
}
