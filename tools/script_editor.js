document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const toolbarButtons = document.querySelectorAll('.toolbar button[data-command]');
    const saveHtmlBtn = document.getElementById('saveHtmlBtn');
    const loadHtmlInput = document.getElementById('loadHtmlInput');
    const loadHtmlBtn = document.getElementById('loadHtmlBtn');
    const viewHtmlBtn = document.getElementById('viewHtmlBtn');
    const htmlViewer = document.getElementById('htmlViewer');
    const htmlOutput = document.getElementById('htmlOutput');
    const closeHtmlViewer = document.getElementById('closeHtmlViewer');
    const foreColorPicker = document.getElementById('foreColorPicker');
    const backColorPicker = document.getElementById('backColorPicker');
    const insertImageBtn = document.getElementById('insertImageBtn');
    const extractImagesBtn = document.getElementById('extractImagesBtn');

    // Habilita a edição da div
    editor.focus();

    // Adiciona event listeners para os botões da barra de ferramentas
    toolbarButtons.forEach(button => {
        button.addEventListener('click', () => {
            const command = button.dataset.command;
            const value = button.dataset.value || null;

            if (command === 'createLink') {
                const url = prompt('Digite a URL do link:', 'http://');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else {
                document.execCommand(command, false, value);
            }
            editor.focus(); // Mantém o foco no editor após a ação
        });
    });

    // Listener para a cor do texto
    foreColorPicker.addEventListener('change', (event) => {
        document.execCommand('foreColor', false, event.target.value);
        editor.focus();
    });

    // Listener para a cor de fundo
    backColorPicker.addEventListener('change', (event) => {
        document.execCommand('backColor', false, event.target.value);
        editor.focus();
    });

    // Listener para inserir imagem (simples, via URL)
    insertImageBtn.addEventListener('click', () => {
        const imageUrl = prompt('Digite a URL da imagem:');
        if (imageUrl) {
            document.execCommand('insertImage', false, imageUrl);
        }
        editor.focus();
    });

    // Evento para salvar o conteúdo HTML
    saveHtmlBtn.addEventListener('click', () => {
        const htmlContent = editor.innerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'minha_nota_formatada.html'; // Nome do arquivo
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Conteúdo HTML salvo com sucesso!');
    });

    // Evento para carregar o conteúdo HTML
    loadHtmlBtn.addEventListener('click', () => {
        loadHtmlInput.click();
    });

    loadHtmlInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                editor.innerHTML = e.target.result;
                alert('Conteúdo HTML carregado com sucesso!');
            };
            reader.readAsText(file);
        }
    });

    // Evento para visualizar o código HTML
    viewHtmlBtn.addEventListener('click', () => {
        htmlOutput.value = editor.innerHTML;
        htmlViewer.style.display = 'block';
    });

    // Evento para fechar o visualizador de HTML
    closeHtmlViewer.addEventListener('click', () => {
        htmlViewer.style.display = 'none';
        htmlOutput.value = '';
    });

    // Função para extrair e oferecer download de imagens (Data URLs)
    extractImagesBtn.addEventListener('click', () => {
        const images = editor.querySelectorAll('img');
        if (images.length === 0) {
            alert('Nenhuma imagem encontrada no editor para extrair.');
            return;
        }

        let imagesExtractedCount = 0;
        images.forEach((img, index) => {
            const src = img.getAttribute('src');
            // Verifica se é um Data URL (começa com 'data:')
            if (src && src.startsWith('data:')) {
                // Exemplo: data:image/png;base64,iVBORw0KGgo...
                const parts = src.split(';');
                const mimeType = parts[0].replace('data:', ''); // image/png
                const base64Data = parts[1].replace('base64,', ''); // iVBORw0KGgo...

                // Converte Base64 para Blob
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: mimeType });

                // Oferece o download da imagem
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                // Sugere um nome de arquivo baseado no tipo MIME
                const extension = mimeType.split('/')[1] || 'bin';
                a.download = `imagem_extraida_${index + 1}.${extension}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                imagesExtractedCount++;
            }
        });

        if (imagesExtractedCount > 0) {
            alert(`${imagesExtractedCount} imagem(ns) extraída(s) para download.`);
        } else {
            alert('Nenhuma imagem no formato Data URL encontrada para extrair.');
        }
    });
});
