# Hospedagem na Hostinger

Este projeto esta pronto para rodar como um app Node.js simples, sem dependencias externas.

## Arquivos principais

- `index.html`: site.
- `style.css`: estilos.
- `server.js`: servidor Node.js para Hostinger.
- `package.json`: comando de start.
- `api/google-reviews.js`: versao serverless alternativa, caso use Vercel no futuro.

## Configuracao na Hostinger

1. Crie um app Node.js no painel da Hostinger.
2. Envie todos os arquivos do projeto para a pasta do app.
3. Configure o arquivo de entrada como:

```txt
server.js
```

4. Configure o comando de inicializacao como:

```txt
npm start
```

5. Configure as variaveis de ambiente:

```txt
GOOGLE_PLACES_API_KEY=sua_chave_google_places
GOOGLE_PLACE_ID=place_id_da_agencia_zero18
```

## Avaliacoes do Google

A rota usada pelo site e:

```txt
/api/google-reviews
```

Sem as variaveis do Google, a pagina nao quebra. Ela mostra uma mensagem informando que as avaliacoes serao exibidas automaticamente.

Com as variaveis configuradas, o site busca o Google Places API e renderiza as avaliacoes retornadas pelo Google.

## Formulario

O formulario usa FormSubmit e envia para:

```txt
julio@agenciazero18.com.br
```

No primeiro envio real, o FormSubmit pode enviar um e-mail de confirmacao para ativar o destino.
