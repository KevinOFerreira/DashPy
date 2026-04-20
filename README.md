# ✦ MilhasDash

Dashboard pessoal para gerenciar contas de milhas e registrar emissões.

## Funcionalidades

- Cadastro de contas com nome, programa, pontos, passageiros e milheiro
- Cálculo automático da **média por emissão** (pontos ÷ passageiros)
- Registro de emissões com localizador, passageiros, pontos e data
- Dedução automática de pontos e passageiros ao registrar emissão
- Histórico completo de emissões por conta
- Busca rápida por nome ou programa
- Dados salvos no navegador (localStorage) — sem servidor necessário

---

## Como publicar no GitHub Pages (passo a passo)

### 1. Crie uma conta no GitHub
Acesse [github.com](https://github.com) e crie uma conta gratuita se ainda não tiver.

### 2. Crie um repositório novo
- Clique no botão **"New"** (ou **"+"** no topo)
- Nome sugerido: `milhas-dash`
- Deixe como **Public**
- Clique em **"Create repository"**

### 3. Faça upload dos arquivos
Na página do repositório recém-criado:
- Clique em **"uploading an existing file"**
- Arraste os 3 arquivos: `index.html`, `style.css`, `app.js`
- Clique em **"Commit changes"**

### 4. Ative o GitHub Pages
- Vá em **Settings** (engrenagem) do repositório
- No menu lateral, clique em **Pages**
- Em **Source**, selecione **"Deploy from a branch"**
- Em **Branch**, selecione **"main"** e pasta **"/ (root)"**
- Clique em **Save**

### 5. Acesse o site
Após 1-2 minutos, seu site estará disponível em:
```
https://SEU-USUARIO.github.io/milhas-dash/
```

---

## Arquivos do projeto

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Estrutura da página |
| `style.css` | Estilos e visual |
| `app.js` | Lógica e banco de dados |

---

## Observações

- Os dados ficam salvos **somente no navegador** que você usar.
- Se trocar de computador ou limpar o histórico do navegador, os dados serão perdidos.
- Para fazer backup, abra o console do navegador (F12) e rode:
  ```js
  copy(localStorage.getItem('milhas_dash_v2'))
  ```
  Isso copia os dados para a área de transferência. Guarde em um arquivo `.txt`.
