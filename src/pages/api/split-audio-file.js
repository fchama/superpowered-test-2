/**
 * https://github.com/briansunter/chunk-audio/tree/master
 * https://chunk-audio.netlify.app/
 */

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({
  log: false,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    // Read the file
    const before1 = Date.now();
    const fileName = "input.m4a";
    const audioData = await fetchFile(url); // Baixa o arquivo
    ffmpeg.FS("writeFile", fileName, audioData);

    const after1 = Date.now();
    console.log("fetch file", (after1 - before1) / 1000);

    // Split file
    const before3 = Date.now();
    await ffmpeg.run(
      "-i",
      fileName,
      "-f",
      "segment",
      "-segment_time",
      "180",
      "-c",
      "copy",
      "out%03d.m4a"
    );

    // Iterate over the chunks
    const chunkFiles = ffmpeg
      .FS("readdir", "/")
      .filter((f) => f.startsWith("out"));

    // console.log("chunkFiles", chunkFiles);

    const buffers = [];
    for (let file1 of chunkFiles) {
      // Read the chunk
      const data = ffmpeg.FS("readFile", file1);
      buffers.push(data);
    }
    const after3 = Date.now();
    console.log("split file", (after3 - before3) / 1000);

    const buffersAsBase64 = buffers.map((buffer) => {
      const uint8Array = new Uint8Array(buffer);
      return Buffer.from(uint8Array).toString("base64");
    });
    res.status(200).json({ buffers: buffersAsBase64 });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
