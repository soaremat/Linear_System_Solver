function solve() {
    // Obter o valor do textarea
    const input = document.getElementById('equations').value.trim();
    const equations = input.split('\n').filter(eq => eq.trim() !== '');

    // Verificar se há equações válidas
    if (equations.length === 0 || equations.length > 10) {
        document.getElementById('result').textContent = "Por favor, insira entre 1 e 10 equações válidas.";
        return;
    }

    // Converter as equações para matriz aumentada
    let matrix = [];
    for (let eq of equations) {
        let coefficients = eq.match(/[-+]?\d*\.?\d+/g); // Extrair coeficientes
        if (!coefficients || coefficients.length !== equations.length + 1) {
            document.getElementById('result').textContent = "Formato de equação inválido ou número incorreto de coeficientes.";
            return;
        }
        matrix.push(coefficients.map(Number)); // Converter para números
    }

    // Exibir a matriz original
    displayMatrix(matrix, 'originalMatrix');

    // Aplicar o método de Gauss
    try {
        const { solution, systemType, escalonadaMatrix } = gauss(matrix);

        // Exibir a matriz escalonada
        displayMatrix(escalonadaMatrix, 'escalonadaMatrix');

        let resultText = "Tipo do sistema: " + systemType + "\n";
        if (solution) {
            resultText += "Solução:\n" + solution.map((val, i) => `x${i + 1} = ${val.toFixed(2)}`).join('\n');
        }
        document.getElementById('result').textContent = resultText;
    } catch (error) {
        document.getElementById('result').textContent = "Erro: " + error.message;
    }
}

function gauss(matrix) {
    const n = matrix.length;
    let escalonadaMatrix = JSON.parse(JSON.stringify(matrix)); // Cópia da matriz original

    // Eliminação de Gauss
    for (let i = 0; i < n; i++) {
        // Encontrar o pivô máximo
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(escalonadaMatrix[j][i]) > Math.abs(escalonadaMatrix[maxRow][i])) {
                maxRow = j;
            }
        }

        // Trocar linhas
        [escalonadaMatrix[i], escalonadaMatrix[maxRow]] = [escalonadaMatrix[maxRow], escalonadaMatrix[i]];

        // Verificar se o pivô é zero
        if (Math.abs(escalonadaMatrix[i][i]) < 1e-10) {
            // Verificar se o sistema é impossível
            if (Math.abs(escalonadaMatrix[i][n]) > 1e-10) {
                return { solution: null, systemType: "Sistema Impossível", escalonadaMatrix };
            } else {
                return { solution: null, systemType: "Sistema Possível Indeterminado", escalonadaMatrix };
            }
        }

        // Zerar os elementos abaixo do pivô
        for (let j = i + 1; j < n; j++) {
            const factor = escalonadaMatrix[j][i] / escalonadaMatrix[i][i];
            for (let k = i; k < n + 1; k++) {
                escalonadaMatrix[j][k] -= factor * escalonadaMatrix[i][k];
            }
        }
    }

    // Substituição regressiva
    const solution = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        solution[i] = escalonadaMatrix[i][n] / escalonadaMatrix[i][i];
        for (let j = i - 1; j >= 0; j--) {
            escalonadaMatrix[j][n] -= escalonadaMatrix[j][i] * solution[i];
        }
    }

    return { solution, systemType: "Sistema Possível Determinado", escalonadaMatrix };
}

// Função para exibir a matriz
function displayMatrix(matrix, elementId) {
    const matrixElement = document.getElementById(elementId);
    matrixElement.textContent = matrix.map(row => row.join('\t')).join('\n');
}

// Função para limpar a tela
function clearScreen() {
    document.getElementById('equations').value = ''; // Limpa o campo de texto
    document.getElementById('originalMatrix').textContent = ''; // Limpa a matriz original
    document.getElementById('escalonadaMatrix').textContent = ''; // Limpa a matriz escalonada
    document.getElementById('result').textContent = ''; // Limpa a área de resultados
}