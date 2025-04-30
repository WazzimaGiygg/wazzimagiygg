<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WZZM - Wiki Zone Zero Mod</title>

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="favicon.png">

  <!-- Material Design Lite CSS -->
  <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
  <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>

  <style>
    /* Estilo para o iframe */
    #contentFrame {
      width: 100%;
      height: calc(100vh - 112px); /* altura da janela menos header e footer */
      border: none;
    }
  </style>
</head>
<body>
  <!-- Layout com header fixo e drawer fixo -->
  <div class="mdl-layout mdl-js-layout mdl-layout--fixed-drawer mdl-layout--fixed-header">

    <!-- Cabeçalho -->
    <header class="mdl-layout__header">
      <div class="mdl-layout__header-row">
        <span class="mdl-layout-title">WZZM WIKI ZONE ZERO MOD</span>
        <div class="mdl-layout-spacer"></div>
      </div>
    </header>

    <!-- Menu lateral (Drawer) -->
    <div class="mdl-layout__drawer">
      <!-- Logo acima do menu -->
      <div style="text-align: center; padding: 16px;">
        <img src="logo.png" alt="Logo WZZM" style="max-width: 100px;">
      </div>

      <span class="mdl-layout-title">Menu</span>
      <nav class="mdl-navigation">
        <a class="mdl-navigation__link" href="#artigos.html" onclick="loadPage('artigos.html')">Artigos</a>
        <a class="mdl-navigation__link" href="#imagens.html" onclick="loadPage('imagens.html')">Imagens</a>
        <a class="mdl-navigation__link" href="#" onclick="loadPage('autores.html')">Autores</a>
        <a class="mdl-navigation__link" href="#" onclick="loadPage('contato.html')">Contato</a>
        <a class="mdl-navigation__link" href="#ferramentasuteis" onclick="loadPage('ferramentasuteis.html')">Contato</a>
      </nav>
    </div>

    <!-- Conteúdo principal -->
    <main class="mdl-layout__content">
      <div class="page-content">
        <iframe id="contentFrame" src="artigos.html"></iframe>
      </div>
    </main>
  </div>

  <!-- Rodapé -->
  <footer class="mdl-mini-footer">
    <div class="mdl-mini-footer__left-section">
      <div class="mdl-logo">Meu Site © 2025</div>
      <ul class="mdl-mini-footer__link-list">
        <li><a href="#">Privacidade</a></li>
        <li><a href="#">Termos</a></li>
      </ul>
    </div>
  </footer>

  <!-- Script para carregar páginas no iframe -->
  <script>
    function loadPage(page) {
      document.getElementById('contentFrame').src = page;
    }
  </script>
</body>
</html>
