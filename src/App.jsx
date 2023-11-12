/* eslint-disable no-useless-escape */
import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [ext, setExt] = useState(null);
  const [nameFile, setNameFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    // const regex = /\.[^\.]*$/;
    setExt(e.target.files[0].name.match(/\.[^\.]*$/)[0]);
    setNameFile(e.target.files[0].name.match(/.*(?=\.[^\.]*$)/)[0]);
  };

  const uploadFile = () => {
    if (!file) return;

    const chunkSize = 1024 * 1024; // Tamanho do chunk, por exemplo, 1MB
    let offset = 0;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target.error && e.target.result) {
        uploadChunk(e.target.result, offset, ext, nameFile)
          .then(() => {
            offset += chunkSize;
            if (offset < file.size) {
              readChunk(offset, chunkSize);
            } else {
              console.log("Upload completo");
            }
          });
      } else {
        console.error("Erro ao ler o arquivo");
      }
    };

    const readChunk = (offset, length) => {
      const slice = file.slice(offset, offset + length);
      reader.readAsArrayBuffer(slice);
    };

    readChunk(offset, chunkSize);
  };

  async function uploadChunk(chunkData, offset, ext, nameFile) {
    const formData = new FormData();
    formData.append("chunk", new Blob([chunkData]));
    formData.append("offset", offset);
  
    await fetch('http://localhost:5000/upload', {
      method: 'POST',
      headers: {
        'data-ext': String(ext),
        'data-name-file': String(nameFile)
      },
      body: formData,
    });
  }

  console.log('Ext: ', ext);
  console.log('Name file: ', nameFile);

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload</button>
    </div>
  );
}

export default App;