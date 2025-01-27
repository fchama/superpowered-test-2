/** 
 * Class: AudioInMemory
 * https://docs.superpowered.com/reference/latest/audio-in-memory/?lang=js
 */


import { useEffectOnce } from 'react-use';
import { useSplitFile } from './use-split-file';
import { useCallback, useRef, useState } from 'react';
import { useDownloadAudio } from './use-download-audio';
import silentAudio from './silent-audio';

// The location of the processor from the browser to fetch.
const sineToneProcessorUrl = "/sineToneProcessor-v5.js";
const minimumSampleRate = 48000;

export const useSuper = ({ url }: { url: string }): any => {
  const [data, setData] = useState({});
  const [buffers, setBuffers] = useState<string[]>([]);
  const { loadAndSplitBuffers } = useSplitFile()
  const { loadAudio } = useDownloadAudio()

  let webaudioManager = useRef<any>(null);
  let superpowered = useRef<any>(null);
  let generatorProcessorNode = useRef<any>(null);

  const boot = useCallback(async () => {
    await setupSuperpowered();
    await loadProcessor();
  }, [])

  const play = useCallback(() => {
    generatorProcessorNode.current.sendMessageToAudioScope({
      type: "controls",
      payload: 'play'
    });
  }, [])

  const pause = useCallback(() => {
    generatorProcessorNode.current.sendMessageToAudioScope({
      type: "controls",
      payload: 'pause'
    });
  }, [])

  const onMessageProcessorAudioScope = useCallback((message: any) => {
    // console.log(message);
    // Here is where we receive serialisable message from the audio scope.
    // We're sending our own ready event payload when the proeccesor is fully innitialised
    if (message.event === "ready") {
      console.log('ready');
    } else if (message.event === "assetLoaded") {
      // enabledControls = true
    } else if (message.event === "progress") {
      setData(message.payload)
    }
  }, [])

  const setupSuperpowered = useCallback(async () => {
    const { SuperpoweredGlue, SuperpoweredWebAudio } = await import('@superpoweredsdk/web');

    superpowered.current = await SuperpoweredGlue.Instantiate(
      'ExampleLicenseKey-WillExpire-OnNextUpdate'
    );
    webaudioManager.current = new SuperpoweredWebAudio(
      minimumSampleRate,
      superpowered.current
    );
    console.log(`Running Superpowered v${superpowered.current.Version()}`);
  }, [])

  const loadProcessor = useCallback(async () => {
    // Now create the AudioWorkletNode, passing in the AudioWorkletProcessor url, it's registered name (defined inside the processor) and a callback then gets called when everything is up a ready
    generatorProcessorNode.current = await webaudioManager.current.createAudioNodeAsync(
      sineToneProcessorUrl,
      "SineToneProcessor",
      onMessageProcessorAudioScope
    );

    // Connect the AudioWorkletNode to the WebAudio destination (speakers);
    generatorProcessorNode.current.connect(
      webaudioManager.current.audioContext.destination
    );
    webaudioManager.current.audioContext.suspend();
  }, [])

  const resumeContext = useCallback(() => {
    console.log("resuming");
    webaudioManager.current.audioContext.resume();
  }, [])

  const onParamChange = useCallback((id: any, value: any) => {
    if (!generatorProcessorNode.current) return
    // console.log('onParamChange', id, value);
    // First, we update the label in the dom with the new value.
    // document.getElementById(id).innerHTML = value;

    // Then we send the parameter id and value over to the audio thread via sendMessageToAudioScope.
    generatorProcessorNode.current.sendMessageToAudioScope({
      type: "parameterChange",
      payload: {
        id,
        value: Number(value) // we are typecasting here to keep the processor script as clean as possible
      }
    });
  }, [])

  const loadBuffer = useCallback((buffer: string) => {
    generatorProcessorNode.current.sendMessageToAudioScope({
      type: "bufferTransfer",
      payload: {
        buffer
      }
    });
  }, [])

  const loadTrack = useCallback(async () => {
    resumeContext()

    /**
     * carrega audio em silêncio
     */
    // const bufferSilentAudio = silentAudio()
    // generatorProcessorNode.current.sendMessageToAudioScope({
    //   type: "bufferTransfer",
    //   payload: {
    //     buffer: bufferSilentAudio
    //   }
    // });

    /**
     * fetch com streaming do file e envio de chunks para o processor
     * envia primeiro 20 segundos do audio e depois o áudio completo
     */
    const minimalChunkSize = 524000 // em torno de 20 segundos
    let loaded = false

    const onMessageProcessorBuffer = (arrayBuffer) => {
      if (arrayBuffer.byteLength > minimalChunkSize && !loaded) {
        loaded = true
        console.log('onMessageProcessorBuffer arrayBuffer', arrayBuffer);
        generatorProcessorNode.current.sendMessageToAudioScope({
          type: "bufferTransfer",
          payload: {
            buffer: arrayBuffer
          }
        });
      }
    }

    const response = await loadAudio({ url, onMessageProcessorBuffer })
    console.log('@@@@ carrega a música completa1 ', response);

    generatorProcessorNode.current.sendMessageToAudioScope({
      type: "bufferTransfer",
      payload: {
        buffer: response
      }
    });
    onMessageProcessorBuffer(response)

    /**
     * faz fetch do áudio pela API criada para dividir o arquivo em chunks
     */
    // await loadAndSplitBuffers({ url }).then((_buffers: string[]) => {
    //   setBuffers(_buffers)
    //   generatorProcessorNode.current.sendMessageToAudioScope({
    //     type: "bufferTransfer",
    //     payload: {
    //       buffer: _buffers[0]
    //     }
    //   });
    // })

    /**
     * fetch regular do áudio e envio direto para o superpowered
     */
    // // fetch audio file and decode it
    // fetch("/other.mp3").then((response) => {
    //   return response.arrayBuffer();
    // }).then((arrayBuffer) => {
    //   // For MP3 file, we don't need to decode it
    //   return arrayBuffer

    //   // // Copy the ArrayBuffer to WebAssembly Linear Memory.
    //   // let audiofileInWASMHeap = superpowered.arrayBufferToWASM(arrayBuffer);

    //   // // Decode the entire file.
    //   // let decodedAudio = superpowered.Decoder.decodeToAudioInMemory(audiofileInWASMHeap, arrayBuffer.byteLength);
    //   // return decodedAudio

    // }).then((arrayBuffer) => {
    //   generatorProcessorNode.sendMessageToAudioScope({
    //     type: "bufferTransfer",
    //     payload: {
    //       buffer: arrayBuffer
    //     }
    //   });
    // })
  }, [url, loadAudio])

  useEffectOnce(() => {
    boot()
  })

  return {
    data,
    buffers,
    onParamChange,
    loadTrack,
    loadBuffer,
    play,
    pause
  }
}
