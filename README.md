## Getting Started

```bash
npm run dev
```

## Tests

- [http://localhost:3000/](http://localhost:3000/)

## How works

- carrega o buffer por chunks

- quando receber cerca de 500 bytes (~20 seg), passa o buffer para o sp.
  Após fazer o download do arquivo completo passa pro superpowered o
  buffer completo

- configure 'Fast 4G' no network para facilitar o entendimento do fluxo
  acima

- tem outras formas de carregamento de áudio e uma API local que faz split do áudio ao fazer o download, para testar esse cenário utilize o node versão 16. Siga os comentários no método `loadTrack` no arquivo use-super-v5.js
