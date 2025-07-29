document.addEventListener('DOMContentLoaded', () => {
    const equationInput = document.getElementById('equationInput');
    const calculateBtn = document.getElementById('calculateBtn');
    const historyList = document.getElementById('historyList');
    const saveHistoryBtn = document.getElementById('saveHistoryBtn');
    const loadHistoryBtn = document.getElementById('loadHistoryBtn');
    const loadHistoryInput = document.getElementById('loadHistoryInput');

    let history = []; // Array para armazenar o histórico de cálculos

    // Função para adicionar um cálculo ao histórico e atualizar a interface
    function addCalculationToHistory(equation, result) {
        const timestamp = new Date().toLocaleString();
        const entry = { equation, result, timestamp };
        history.push(entry);

        const listItem = document.createElement('li');
        listItem.textContent = `${timestamp}: ${equation} = ${result}`;
        historyList.prepend(listItem); // Adiciona no início da lista para mostrar os mais recentes primeiro
        
        // Mantém a lista com um número razoável de itens (opcional)
        // if (historyList.children.length > 50) {
        //     historyList.removeChild(historyList.lastChild);
        // }
    }

    // Função para calcular a expressão
    function calculateExpression(expression) {
        try {
            // Usar eval() é perigoso em produção se a entrada não for controlada,
            // mas para uma calculadora simples, é o caminho mais direto.
            // Para maior segurança, você precisaria de um parser de expressões.
            const result = eval(expression); 
            if (isNaN(result) || !isFinite(result)) {
                return 'Erro: Cálculo inválido';
            }
            return result;
        } catch (error) {
            return `Erro: ${error.message}`;
        }
    }

    // Evento para o botão "Calcular"
    calculateBtn.addEventListener('click', () => {
        const equation = equationInput.value.trim();
        if (equation) {
            const result = calculateExpression(equation);
            addCalculationToHistory(equation, result);
            equationInput.value = ''; // Zera a caixa de equação
        } else {
            alert('Por favor, digite uma equação para calcular.');
        }
    });

    // Evento para salvar o histórico em um arquivo JSON
    saveHistoryBtn.addEventListener('click', () => {
        const jsonContent = JSON.stringify(history, null, 2); // Formata o JSON com indentação
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'historico_calculadora.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Libera o objeto URL
    });

    // Evento para carregar o histórico de um arquivo JSON
    loadHistoryBtn.addEventListener('click', () => {
        loadHistoryInput.click(); // Simula o clique no input de arquivo oculto
    });

    loadHistoryInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const loadedHistory = JSON.parse(e.target.result);
                    if (Array.isArray(loadedHistory)) {
                        history = loadedHistory; // Substitui o histórico atual
                        // Limpa a lista atual e renderiza o novo histórico
                        historyList.innerHTML = ''; 
                        history.forEach(item => {
                            const listItem = document.createElement('li');
                            listItem.textContent = `${item.timestamp}: ${item.equation} = ${item.result}`;
                            historyList.appendChild(listItem); // Adiciona no final para manter a ordem original do JSON
                        });
                        alert('Histórico carregado com sucesso!');
                    } else {
                        alert('Erro: O arquivo JSON não contém um histórico válido.');
                    }
                } catch (error) {
                    alert('Erro ao analisar o arquivo JSON: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    });
});
