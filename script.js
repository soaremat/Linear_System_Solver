function solve() {
    const input = document.getElementById('equations').value.trim();
    if (!input) {
        document.getElementById('result').textContent = "Por favor, insira equações antes de calcular.";
        return;
    }

    const equations = input.split('\n').filter(eq => eq.trim() !== '');
    const numEquations = equations.length;

    if (numEquations === 0 || numEquations > 10) {
        document.getElementById('result').textContent = "Por favor, insira entre 1 e 10 equações válidas.";
        return;
    }

    let matrix = [];
    let variableSet = new Set();
    let variablePattern = /([-+]?\d*\.?\d*)\s*([a-zA-Z]\d*)/g;
    
    for (let eq of equations) {
        let matches = [...eq.matchAll(variablePattern)];
        if (matches.length === 0) {
            document.getElementById('result').textContent = "Formato de equação inválido. Use variáveis como x1, x2 ou x, y, z.";
            return;
        }
        
        let coefficients = new Map();
        for (let match of matches) {
            let coef = match[1] === "" || match[1] === "+" ? 1 : match[1] === "-" ? -1 : parseFloat(match[1]);
            coefficients.set(match[2], coef);
            variableSet.add(match[2]);
        }

        let constantMatch = eq.match(/[-+]?\d+\.?\d*$/);
        let constant = constantMatch ? parseFloat(constantMatch[0]) : 0;
        coefficients.set("constante", constant);
        matrix.push(coefficients);
    }

    let variables = Array.from(variableSet).sort();
    let structuredMatrix = matrix.map(row => {
        return variables.map(v => row.get(v) || 0).concat(row.get("constante"));
    });

    if (variables.length !== structuredMatrix[0].length - 1) {
        document.getElementById('result').textContent = "Número de variáveis não corresponde ao esperado. Use um sistema coerente.";
        return;
    }

    displayMatrix(structuredMatrix, 'originalMatrix');

    try {
        const { solution, systemType, escalonadaMatrix } = gauss(structuredMatrix);
        displayMatrix(escalonadaMatrix, 'escalonadaMatrix');

        let resultText = "Tipo do sistema: " + systemType + "\n";
        if (solution) {
            resultText += "Solução:\n" + solution.map((val, i) => `${variables[i]} = ${val.toFixed(2)}`).join('\n');
        }
        document.getElementById('result').textContent = resultText;
    } catch (error) {
        document.getElementById('result').textContent = "Erro: " + error.message;
    }
}

function gauss(matrix) {
    const numRows = matrix.length;
    const numCols = matrix[0].length - 1;
    let escalonadaMatrix = JSON.parse(JSON.stringify(matrix));

    for (let i = 0; i < Math.min(numRows, numCols); i++) {
        let maxRow = i;
        for (let j = i + 1; j < numRows; j++) {
            if (Math.abs(escalonadaMatrix[j][i]) > Math.abs(escalonadaMatrix[maxRow][i])) {
                maxRow = j;
            }
        }
        [escalonadaMatrix[i], escalonadaMatrix[maxRow]] = [escalonadaMatrix[maxRow], escalonadaMatrix[i]];

        if (Math.abs(escalonadaMatrix[i][i]) < 1e-10) {
            if (Math.abs(escalonadaMatrix[i][numCols]) > 1e-10) {
                return { solution: null, systemType: "Sistema Impossível", escalonadaMatrix };
            }
            continue;
        }

        for (let j = i + 1; j < numRows; j++) {
            const factor = escalonadaMatrix[j][i] / escalonadaMatrix[i][i];
            for (let k = i; k < numCols + 1; k++) {
                escalonadaMatrix[j][k] -= factor * escalonadaMatrix[i][k];
            }
        }
    }

    for (let i = 0; i < numRows; i++) {
        let allZeros = escalonadaMatrix[i].slice(0, numCols).every(val => Math.abs(val) < 1e-10);
        if (allZeros && Math.abs(escalonadaMatrix[i][numCols]) > 1e-10) {
            return { solution: null, systemType: "Sistema Impossível", escalonadaMatrix };
        }
    }

    const solution = new Array(numCols).fill(0);
    for (let i = numCols - 1; i >= 0; i--) {
        if (i >= numRows || Math.abs(escalonadaMatrix[i][i]) < 1e-10) continue;
        let sum = escalonadaMatrix[i][numCols];
        for (let j = i + 1; j < numCols; j++) {
            sum -= escalonadaMatrix[i][j] * solution[j];
        }
        solution[i] = sum / escalonadaMatrix[i][i];
    }

    return { solution, systemType: "Sistema Possível Determinado", escalonadaMatrix };
}

function displayMatrix(matrix, elementId) {
    const matrixElement = document.getElementById(elementId);
    matrixElement.textContent = matrix.map(row => row.map(num => num.toFixed(2)).join('\t')).join('\n');
}

function clearScreen() {
    document.getElementById('equations').value = '';
    document.getElementById('originalMatrix').textContent = '';
    document.getElementById('escalonadaMatrix').textContent = '';
    document.getElementById('result').textContent = '';
}
