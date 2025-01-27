/** 
 * 
 */

import { useCallback } from "react"

export const useDownloadAudio = (): any => {
  // Concatena todos os chunks em um único ArrayBuffer
  const concatChunks = useCallback(({ chunks, totalLength }: { chunks: any[]; totalLength: number }) => {
    // const audioBuffer = new Uint8Array(totalLength);
    // let offset = 0;
    // for (const chunk of chunks) {
    //   audioBuffer.set(chunk, offset);
    //   offset += chunk.length;
    // }
    // return audioBuffer.buffer;
    const audioBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // console.log("Áudio carregado:", audioBuffer);
    return audioBuffer.buffer;
  }, [])


  const loadAudio = useCallback(async ({ url, onMessageProcessorBuffer }) => {
    try {
      // Faz a requisição fetch do áudio
      const response = await fetch(url);

      // Cria um reader para ler os chunks do corpo da resposta
      const reader = response.body.getReader();

      // Array para armazenar os chunks recebidos
      const chunks = [];

      // Variável para armazenar o tamanho total
      let totalLength = 0;

      // Lê os chunks até o final
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("Download completo!");
          break;
        }

        // Armazena o chunk no array
        chunks.push(value);

        // Atualiza o tamanho total
        totalLength += value.length;

        const arrayBuffer1 = concatChunks({chunks, totalLength});
        onMessageProcessorBuffer(arrayBuffer1);

        // console.log(`Chunk recebido: ${value.length} bytes`, value);
      }

      // Concatena todos os chunks em um único ArrayBuffer
      const audioBuffer = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        audioBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      console.log("Áudio carregado:", audioBuffer);
      return audioBuffer.buffer;
    } catch (error) {
      console.error("Error to load audio:", error);
    }
  }, [])


  return {
    loadAudio
  }
}
