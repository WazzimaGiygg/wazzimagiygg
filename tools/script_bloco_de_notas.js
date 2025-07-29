document.addEventListener('DOMContentLoaded', () => {
    const noteContent = document.getElementById('noteContent');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const loadNoteBtn = document.getElementById('loadNoteBtn');
    const loadNoteInput = document.getElementById('loadNoteInput');
    const clearNoteBtn = document.getElementById('clearNoteBtn');

    // Função para salvar a nota atual em um arquivo JSON
    saveNoteBtn.addEventListener('click', () => {
        const content = noteContent.value;
        const noteData = {
            timestamp: new Date().toLocaleString(),
            content: content
        };

        const jsonContent = JSON.stringify(noteData, null, 2); // Formata com indentação
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'minha_nota.json'; // Nome padrão do arquivo
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Libera o objeto URL
        alert('Nota salva com sucesso!');
    });

    // Função para carregar a nota de um arquivo JSON
    loadNoteBtn.addEventListener('click', () => {
        loadNoteInput.click(); // Abre a janela de seleção de arquivo
    });

    loadNoteInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const loadedData = JSON.parse(e.target.result);
                    // Verifica se o JSON carregado tem o formato esperado
                    if (loadedData && typeof loadedData.content === 'string') {
                        noteContent.value = loadedData.content;
                        alert(`Nota de ${loadedData.timestamp || 'data desconhecida'} carregada com sucesso!`);
                    } else {
                        alert('Erro: O arquivo JSON não contém um formato de nota válido.');
                    }
                } catch (error) {
                    alert('Erro ao analisar o arquivo JSON: ' + error.message);
                }
            };
            reader.readAsText(file); // Lê o conteúdo do arquivo como texto
        }
    });

    // Função para limpar a área de texto
    clearNoteBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar a nota atual? Todo o conteúdo será perdido se não for salvo.')) {
            noteContent.value = '';
        }
    });

    // Opcional: Salvar e carregar automaticamente a última nota no localStorage
    // Isso permite que a nota persista mesmo se o navegador for fechado.
    // window.addEventListener('beforeunload', () => {
    //     localStorage.setItem('blocoDeNotasContent', noteContent.value);
    // });

    // if (localStorage.getItem('blocoDeNotasContent')) {
    //     noteContent.value = localStorage.getItem('blocoDeNotasContent');
    // }
});
