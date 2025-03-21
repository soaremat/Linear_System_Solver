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

    // Aplicar o método de Gauss
    try {
        const { solution, systemType } = gauss(matrix);
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

    // Eliminação de Gauss
    for (let i = 0; i < n; i++) {
        // Encontrar o pivô máximo
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(matrix[j][i]) > Math.abs(matrix[maxRow][i])) {
                maxRow = j;
            }
        }

        // Trocar linhas
        [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];

        // Verificar se o pivô é zero
        if (Math.abs(matrix[i][i]) < 1e-10) {
            // Verificar se o sistema é impossível
            if (Math.abs(matrix[i][n]) > 1e-10) {
                return { solution: null, systemType: "Sistema Impossível" };
            } else {
                return { solution: null, systemType: "Sistema Possível Indeterminado" };
            }
        }

        // Zerar os elementos abaixo do pivô
        for (let j = i + 1; j < n; j++) {
            const factor = matrix[j][i] / matrix[i][i];
            for (let k = i; k < n + 1; k++) {
                matrix[j][k] -= factor * matrix[i][k];
            }
        }
    }

    // Substituição regressiva
    const solution = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        solution[i] = matrix[i][n] / matrix[i][i];
        for (let j = i - 1; j >= 0; j--) {
            matrix[j][n] -= matrix[j][i] * solution[i];
        }
    }

    return { solution, systemType: "Sistema Possível Determinado" };
}

// Função para limpar a tela
function clearScreen() {
    document.getElementById('equations').value = ''; // Limpa o campo de texto
    document.getElementById('result').textContent = ''; // Limpa a área de resultados
}