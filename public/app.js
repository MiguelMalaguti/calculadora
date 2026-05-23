/**
 * NEXUS CALC - LOGICAL ENGINE & FRONTEND CONTROLLER
 * Desenvolvido com carinho e precisão para uma experiência premium de computação.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- ESTADO GLOBAL DA APLICAÇÃO ---
  let currentMode = 'scientific'; // scientific, graphing, programmer, converter
  let expression = '';            // Expressão científica atual
  let programmerValue = '0';      // Valor atual do modo programador (guardado como decimal string)
  let programmerBase = 10;        // Base atual selecionada no modo programador (10, 16, 8, 2)
  let historyVisible = true;      // Controle de exibição da barra de histórico
  
  // --- CONFIGURAÇÃO DO MODO GRÁFICO (Canvas) ---
  const canvas = document.getElementById('graphCanvas');
  const ctx = canvas.getContext('2d');
  let graphScale = 40;            // Pixels por unidade matemática
  let graphOffsetX = 0;          // Deslocamento X do centro em pixels
  let graphOffsetY = 0;          // Deslocamento Y do centro em pixels
  let currentGraphFunc = 'sin(x)'; // Função matemática padrão para plotagem

  // --- ELEMENTOS DO DOM ---
  // Geral/Header
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const historyToggleBtn = document.getElementById('historyToggleBtn');
  const historySidebar = document.getElementById('historySidebar');
  const modeSelector = document.getElementById('modeSelector');
  
  // Displays
  const displayContainer = document.getElementById('displayContainer');
  const displayModeLabel = document.getElementById('displayModeLabel');
  const displayExpression = document.getElementById('displayExpression');
  const displayResult = document.getElementById('displayResult');
  
  // Teclados / Containers de Modo
  const keypadScientific = document.getElementById('keypadScientific');
  const keypadGraphing = document.getElementById('keypadGraphing');
  const keypadProgrammer = document.getElementById('keypadProgrammer');
  const keypadConverter = document.getElementById('keypadConverter');
  
  // Botões de Ações Científicas
  const btnClear = document.getElementById('btnClear');
  const btnBackspace = document.getElementById('btnBackspace');
  const btnEquals = document.getElementById('btnEquals');
  
  // Componentes Gráficos
  const graphFuncInput = document.getElementById('graphFuncInput');
  const btnPlotGraph = document.getElementById('btnPlotGraph');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnResetZoom = document.getElementById('btnResetZoom');
  const btnGraphClear = document.getElementById('btnGraphClear');
  
  // Componentes Programador
  const valDec = document.getElementById('valDec');
  const valHex = document.getElementById('valHex');
  const valOct = document.getElementById('valOct');
  const valBin = document.getElementById('valBin');
  const rowDec = document.getElementById('rowDec');
  const rowHex = document.getElementById('rowHex');
  const rowOct = document.getElementById('rowOct');
  const rowBin = document.getElementById('rowBin');
  const btnProgClear = document.getElementById('btnProgClear');
  const btnProgBackspace = document.getElementById('btnProgBackspace');
  const btnProgEquals = document.getElementById('btnProgEquals');
  
  // Componentes Conversor
  const convCategory = document.getElementById('convCategory');
  const convUnitFrom = document.getElementById('convUnitFrom');
  const convUnitTo = document.getElementById('convUnitTo');
  const convValueFrom = document.getElementById('convValueFrom');
  const convValueTo = document.getElementById('convValueTo');
  const btnConvSwap = document.getElementById('btnConvSwap');
  
  // Histórico
  const historyList = document.getElementById('historyList');
  const btnClearHistory = document.getElementById('btnClearHistory');

  // Tabela de Configuração e Fatores de Conversão do Conversor (Declarado antes da inicialização)
  const conversionData = {
    length: {
      label: 'Comprimento',
      units: {
        m: { name: 'Metro (m)', factor: 1 },
        km: { name: 'Quilômetro (km)', factor: 1000 },
        cm: { name: 'Centímetro (cm)', factor: 0.01 },
        mm: { name: 'Milímetro (mm)', factor: 0.001 },
        inch: { name: 'Polegada (in)', factor: 0.0254 },
        foot: { name: 'Pé (ft)', factor: 0.3048 },
        mile: { name: 'Milha (mi)', factor: 1609.34 }
      }
    },
    weight: {
      label: 'Peso',
      units: {
        kg: { name: 'Quilograma (kg)', factor: 1 },
        g: { name: 'Grama (g)', factor: 0.001 },
        mg: { name: 'Miligrama (mg)', factor: 0.000001 },
        lb: { name: 'Libra (lb)', factor: 0.453592 },
        oz: { name: 'Onça (oz)', factor: 0.0283495 }
      }
    },
    temperature: {
      label: 'Temperatura',
      units: {
        C: { name: 'Grau Celsius (°C)' },
        F: { name: 'Grau Fahrenheit (°F)' },
        K: { name: 'Kelvin (K)' }
      }
    },
    speed: {
      label: 'Velocidade',
      units: {
        kmh: { name: 'Quilômetros por hora (km/h)', factor: 1 },
        ms: { name: 'Metros por segundo (m/s)', factor: 3.6 },
        mph: { name: 'Milhas por hora (mph)', factor: 1.60934 },
        knot: { name: 'Nós (kt)', factor: 1.852 }
      }
    }
  };

  // --- INICIALIZAÇÃO ---
  initTheme();
  initHistory();
  initConverterOptions();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // ==========================================
  // 1. GERENCIAMENTO DE TEMAS
  // ==========================================
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
      document.body.classList.replace('dark-theme', 'light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.replace('light-theme', 'dark-theme');
      localStorage.setItem('theme', 'dark');
    }
    // Repintar gráfico para ajustar cor de grade conforme tema
    if (currentMode === 'graphing') {
      drawGraph();
    }
  });

  // ==========================================
  // 2. ALTERNADOR DE MODOS
  // ==========================================
  modeSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('.mode-btn');
    if (!btn) return;

    // Desativar botões e layouts anteriores
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Mudar Modo Ativo
    currentMode = btn.dataset.mode;
    
    // Ocultar todos os layouts
    keypadScientific.classList.remove('active');
    keypadGraphing.classList.remove('active');
    keypadProgrammer.classList.remove('active');
    keypadConverter.classList.remove('active');
    
    // Habilitar display principal por padrão (oculta no conversor e programador tem displays dedicados)
    displayContainer.style.display = 'flex';

    if (currentMode === 'scientific') {
      keypadScientific.classList.add('active');
      displayModeLabel.textContent = 'Modo Científico';
      updateScientificDisplay();
    } else if (currentMode === 'graphing') {
      keypadGraphing.classList.add('active');
      displayModeLabel.textContent = 'Modo Gráfico';
      updateScientificDisplay();
      setTimeout(() => {
        resizeCanvas();
        drawGraph();
      }, 50); // Delay sutil para aguardar transição CSS
    } else if (currentMode === 'programmer') {
      keypadProgrammer.classList.add('active');
      displayContainer.style.display = 'none'; // Programador usa painel de bases
      updateProgrammerDisplay();
    } else if (currentMode === 'converter') {
      keypadConverter.classList.add('active');
      displayContainer.style.display = 'none'; // Conversor usa cards interativos
      runConversion();
    }
  });

  // Alternador do Histórico Lateral
  historyToggleBtn.addEventListener('click', () => {
    historyVisible = !historyVisible;
    if (historyVisible) {
      historySidebar.classList.remove('hidden');
    } else {
      historySidebar.classList.add('hidden');
    }
  });

  // ==========================================
  // 3. MOTOR DE CÁLCULO CIENTÍFICO
  // ==========================================
  function updateScientificDisplay() {
    displayExpression.textContent = expression || '';
    if (expression === '') {
      displayExpression.innerHTML = '<span style="opacity: 0.35">Digite uma expressão...</span>';
    }
  }

  // Interceptar cliques no teclado matemático
  document.querySelectorAll('#keypadScientific .btn[data-val], #keypadGraphing .btn[data-val]').forEach(button => {
    button.addEventListener('click', () => {
      const val = button.dataset.val;

      // Se for o modo gráfico digitando atalhos
      if (currentMode === 'graphing') {
        const start = graphFuncInput.selectionStart;
        const end = graphFuncInput.selectionEnd;
        const text = graphFuncInput.value;
        graphFuncInput.value = text.substring(0, start) + val + text.substring(end);
        graphFuncInput.focus();
        graphFuncInput.setSelectionRange(start + val.length, start + val.length);
        return;
      }

      // Modo Científico
      if (val === '^2') {
        expression += '^2';
      } else {
        expression += val;
      }
      updateScientificDisplay();
    });
  });

  btnClear.addEventListener('click', () => {
    expression = '';
    displayResult.textContent = '0';
    updateScientificDisplay();
  });

  btnBackspace.addEventListener('click', () => {
    if (expression.length > 0) {
      // Exclui funções inteiras se clicado backspace nelas (ex: sin(, cos( )
      const funcList = ['asin(', 'acos(', 'atan(', 'sqrt(', 'log(', 'sin(', 'cos(', 'tan(', 'ln('];
      let matched = false;
      for (const fn of funcList) {
        if (expression.endsWith(fn)) {
          expression = expression.slice(0, -fn.length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        expression = expression.slice(0, -1);
      }
      updateScientificDisplay();
    }
  });

  btnEquals.addEventListener('click', evaluateScientificExpression);

  // Capturar teclas físicas para modo científico e programador
  document.addEventListener('keydown', (e) => {
    // Evita conflitos com inputs (Modo Gráfico ou de Conversão)
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
      // Se pressionar Enter no input gráfico, plota o gráfico
      if (e.key === 'Enter' && document.activeElement === graphFuncInput) {
        e.preventDefault();
        btnPlotGraph.click();
      }
      return;
    }

    if (currentMode === 'scientific') {
      if (e.key >= '0' && e.key <= '9' || ['+', '-', '*', '/', '(', ')', '.', '%', '^'].includes(e.key)) {
        expression += e.key;
        updateScientificDisplay();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        evaluateScientificExpression();
      } else if (e.key === 'Backspace') {
        btnBackspace.click();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        btnClear.click();
      }
    } else if (currentMode === 'programmer') {
      // Entrada por teclado para base do programador
      handleProgrammerKeyboardInput(e);
    }
  });

  function evaluateScientificExpression() {
    if (!expression) return;
    
    if (typeof math === 'undefined') {
      displayResult.textContent = 'Erro: Motor offline';
      return;
    }
    
    try {
      // Limpeza amigável de sintaxe antes de mandar para o Math.js
      let parsedExpr = expression
        .replace(/÷/g, '/')
        .replace(/×/g, '*');

      const result = math.evaluate(parsedExpr);
      
      // Formatação de precisão (limita casas decimais gigantes)
      let formattedResult;
      if (typeof result === 'number') {
        if (isNaN(result) || !isFinite(result)) {
          throw new Error('Resultado indefinido');
        }
        // Evita erro de floating point como 0.1 + 0.2 = 0.3000000000004
        formattedResult = Number(math.format(result, { precision: 14 }));
      } else {
        formattedResult = result.toString();
      }

      displayResult.textContent = formattedResult;
      
      // Salvar cálculo no histórico do Node.js
      saveToHistory(expression, formattedResult, 'scientific');
    } catch (error) {
      console.error(error);
      displayResult.textContent = 'Erro de Sintaxe';
    }
  }

  // ==========================================
  // 4. MODO GRÁFICO (CANVAS 2D INTERATIVO)
  // ==========================================
  function resizeCanvas() {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 320; // Fixo no CSS mas sincronizado aqui
    if (currentMode === 'graphing') {
      drawGraph();
    }
  }

  // Desenhar eixos, grades e função
  function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2 + graphOffsetX;
    const centerY = height / 2 + graphOffsetY;

    const isDark = document.body.classList.contains('dark-theme');
    
    // Cores baseadas no tema
    const colorGrid = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const colorGridSub = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';
    const colorAxis = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
    const colorLabels = isDark ? '#94a3b8' : '#475569';
    const colorLine = '#6366f1'; // Indigo Premium

    // 1. DESENHAR GRADE DE COORDENADAS
    ctx.lineWidth = 1;
    
    // Linhas verticais
    const startX = Math.floor((-centerX) / graphScale);
    const endX = Math.ceil((width - centerX) / graphScale);
    
    for (let xVal = startX; xVal <= endX; xVal++) {
      const px = centerX + xVal * graphScale;
      ctx.beginPath();
      ctx.strokeStyle = xVal === 0 ? colorAxis : colorGrid;
      ctx.lineWidth = xVal === 0 ? 2 : 1;
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();

      // Rótulos do Eixo X
      if (xVal !== 0 && xVal % 2 === 0) {
        ctx.fillStyle = colorLabels;
        ctx.font = '10px Fira Code';
        ctx.textAlign = 'center';
        ctx.fillText(xVal, px, centerY + 15);
      }
    }

    // Linhas horizontais
    const startY = Math.floor((-centerY) / graphScale);
    const endY = Math.ceil((height - centerY) / graphScale);
    
    for (let yVal = startY; yVal <= endY; yVal++) {
      const py = centerY - yVal * graphScale; // Plano cartesiano Y cresce para cima
      ctx.beginPath();
      ctx.strokeStyle = yVal === 0 ? colorAxis : colorGrid;
      ctx.lineWidth = yVal === 0 ? 2 : 1;
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();

      // Rótulos do Eixo Y
      if (yVal !== 0 && yVal % 2 === 0) {
        ctx.fillStyle = colorLabels;
        ctx.font = '10px Fira Code';
        ctx.textAlign = 'right';
        ctx.fillText(yVal, centerX - 8, py + 3);
      }
    }

    // Marcação da Origem (0, 0)
    ctx.fillStyle = colorLabels;
    ctx.font = '10px Fira Code';
    ctx.fillText('0', centerX - 8, centerY + 12);

    // 2. DESENHAR A CURVA DA FUNÇÃO f(x)
    if (!currentGraphFunc) return;

    if (typeof math === 'undefined') {
      ctx.fillStyle = isDark ? '#ef4444' : '#dc2626';
      ctx.font = '13px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('Motor matemático offline indisponível.', width / 2, centerY - 20);
      return;
    }

    ctx.beginPath();
    ctx.strokeStyle = colorLine;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    
    let isDrawing = false;
    
    try {
      const compileFunc = math.compile(currentGraphFunc);

      // Iterar pixel por pixel no eixo X para traçar a função de forma suave
      for (let px = 0; px < width; px++) {
        // Converter coordenada de pixel para valor matemático X
        const mathX = (px - centerX) / graphScale;
        
        try {
          const mathY = compileFunc.evaluate({ x: mathX });
          
          // Se Y for um valor numérico válido
          if (typeof mathY === 'number' && !isNaN(mathY) && isFinite(mathY)) {
            // Converter coordenada matemática Y para pixel
            const py = centerY - mathY * graphScale;

            // Desenhar apenas se os pixels estiverem no limite visível estendido
            if (py >= -100 && py <= height + 100) {
              if (!isDrawing) {
                ctx.moveTo(px, py);
                isDrawing = true;
              } else {
                ctx.lineTo(px, py);
              }
            } else {
              isDrawing = false;
            }
          } else {
            isDrawing = false;
          }
        } catch (e) {
          // Ignora erros pontuais (como assíntotas em tan(x) ou divisões por zero)
          isDrawing = false;
        }
      }
      ctx.stroke();
    } catch (e) {
      console.error('Erro ao compilar/desenhar função:', e);
    }
  }

  // Plotar função digitada
  btnPlotGraph.addEventListener('click', () => {
    const val = graphFuncInput.value.trim();
    if (!val) return;
    
    try {
      // Testar parsing matemático antes de plotar de verdade
      const test = math.compile(val);
      test.evaluate({ x: 1 });
      
      currentGraphFunc = val;
      drawGraph();
      
      // Opcionalmente salvar ação de gráfico no histórico do servidor
      saveToHistory(`Plotar: f(x) = ${val}`, 'Gráfico renderizado', 'graphing');
    } catch (e) {
      alert('Erro na função: verifique se os parênteses, multiplicadores e sintaxes estão corretos. Ex: 4*x em vez de 4x.');
    }
  });

  // Controles de Visualização de Gráfico (Zoom & Pan)
  btnZoomIn.addEventListener('click', () => {
    graphScale = Math.min(graphScale * 1.3, 300);
    drawGraph();
  });

  btnZoomOut.addEventListener('click', () => {
    graphScale = Math.max(graphScale / 1.3, 10);
    drawGraph();
  });

  btnResetZoom.addEventListener('click', () => {
    graphScale = 40;
    graphOffsetX = 0;
    graphOffsetY = 0;
    drawGraph();
  });

  btnGraphClear.addEventListener('click', () => {
    graphFuncInput.value = '';
    currentGraphFunc = '';
    drawGraph();
  });

  // Funcionalidade de clicar e arrastar (Pan) no Canvas
  let isDragging = false;
  let startDragX = 0;
  let startDragY = 0;

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startDragX = e.clientX - graphOffsetX;
    startDragY = e.clientY - graphOffsetY;
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = 'crosshair';
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    graphOffsetX = e.clientX - startDragX;
    graphOffsetY = e.clientY - startDragY;
    drawGraph();
  });

  // ==========================================
  // 5. MODO PROGRAMADOR (CONVERSOR DE BASES)
  // ==========================================
  
  // Mudar base selecionada ao clicar na linha correspondente
  [rowDec, rowHex, rowOct, rowBin].forEach(row => {
    row.addEventListener('click', () => {
      rowDec.classList.remove('active');
      rowHex.classList.remove('active');
      rowOct.classList.remove('active');
      rowBin.classList.remove('active');
      
      row.classList.add('active');
      programmerBase = parseInt(row.dataset.base);
      updateProgrammerKeyboardAccessibility();
    });
  });

  // Habilitar ou desabilitar teclas baseado na base selecionada
  function updateProgrammerKeyboardAccessibility() {
    const isHex = programmerBase === 16;
    const isDec = programmerBase === 10;
    const isOct = programmerBase === 8;
    const isBin = programmerBase === 2;

    // Controlar dígitos hexadecimais (A-F)
    document.querySelectorAll('.btn-hex').forEach(btn => {
      btn.disabled = !isHex;
    });

    // Controlar dígitos numéricos normais
    document.querySelectorAll('.btn-prog-digit').forEach(btn => {
      const val = parseInt(btn.dataset.val);
      if (isBin) {
        btn.disabled = val > 1;
      } else if (isOct) {
        btn.disabled = val > 7;
      } else if (isDec) {
        btn.disabled = val > 9;
      } else {
        btn.disabled = false; // HEX habilita tudo (0-9)
      }
    });
  }

  // Tratamento de cliques nos botões do modo programador
  document.querySelectorAll('#keypadProgrammer .btn-prog-digit, #keypadProgrammer .btn-hex').forEach(button => {
    button.addEventListener('click', () => {
      const val = button.dataset.val;

      if (programmerValue === '0' || programmerValue === 'Erro') {
        programmerValue = val;
      } else {
        // Validar limites razoáveis de representação binária (ex: 64 bits)
        if (programmerValue.length < 20) {
          programmerValue += val;
        }
      }
      convertAndDisplayProgrammer(programmerValue, programmerBase);
    });
  });

  // Operadores Lógicos e Bitwise
  document.querySelectorAll('#keypadProgrammer .btn-sci:not(.btn-hex)').forEach(button => {
    button.addEventListener('click', () => {
      const op = button.dataset.val;
      
      // Tratamento rápido para bitwise NOT (unário)
      if (op === 'NOT') {
        try {
          const decVal = BigInt(parseInt(programmerValue, programmerBase));
          // NOT Bitwise de 32 bits aproximado
          const result = ~decVal;
          programmerValue = result.toString(programmerBase).toUpperCase();
          convertAndDisplayProgrammer(programmerValue, programmerBase);
        } catch (e) {
          programmerValue = 'Erro';
          updateProgrammerDisplay();
        }
        return;
      }
      
      // Operações binárias complexas
      if (['AND', 'OR', 'XOR', '<<', '>>', 'mod'].includes(op)) {
        // Guarda na expressão para processar
        programmerValue += ` ${op} `;
        updateProgrammerDisplay();
      }
    });
  });

  btnProgClear.addEventListener('click', () => {
    programmerValue = '0';
    updateProgrammerDisplay();
  });

  btnProgBackspace.addEventListener('click', () => {
    if (programmerValue.length > 1) {
      programmerValue = programmerValue.slice(0, -1);
    } else {
      programmerValue = '0';
    }
    convertAndDisplayProgrammer(programmerValue, programmerBase);
  });

  btnProgEquals.addEventListener('click', evaluateProgrammerExpression);

  function evaluateProgrammerExpression() {
    if (!programmerValue) return;

    try {
      // Limpeza e processamento de operadores bitwise no JS
      // Expressões são inseridas em formato legível, ex: "15 AND 3"
      let tokens = programmerValue.trim().split(/\s+/);
      if (tokens.length < 3) return;

      let leftVal = parseTokenValue(tokens[0], programmerBase);
      let op = tokens[1];
      let rightVal = parseTokenValue(tokens[2], programmerBase);

      let result;
      switch (op) {
        case 'AND': result = leftVal & rightVal; break;
        case 'OR': result = leftVal | rightVal; break;
        case 'XOR': result = leftVal ^ rightVal; break;
        case '<<': result = leftVal << rightVal; break;
        case '>>': result = leftVal >> rightVal; break;
        case 'mod': result = leftVal % rightVal; break;
        default: throw new Error('Op não suportado');
      }

      const finalDec = result.toString(10);
      programmerValue = BigInt(finalDec).toString(programmerBase).toUpperCase();
      convertAndDisplayProgrammer(programmerValue, programmerBase);
      
      saveToHistory(`Bitwise: ${tokens.join(' ')}`, `DEC: ${finalDec}`, 'programmer');
    } catch (e) {
      programmerValue = 'Erro';
      updateProgrammerDisplay();
    }
  }

  function parseTokenValue(token, base) {
    return BigInt(parseInt(token, base));
  }

  // Efetua a conversão da entrada ativa nas outras 3 bases numéricas
  function convertAndDisplayProgrammer(valueStr, fromBase) {
    try {
      // Ignorar expressões complexas no cálculo instantâneo
      if (valueStr.includes(' ')) {
        updateProgrammerDisplay();
        return;
      }

      const cleanVal = valueStr.replace(/[^0-9A-Fa-f-]/g, '');
      if (!cleanVal) {
        programmerValue = '0';
        updateProgrammerDisplay();
        return;
      }

      // Converte para decimal primeiro usando BigInt
      const decBigInt = BigInt(parseInt(cleanVal, fromBase));
      
      if (isNaN(Number(decBigInt))) throw new Error();

      valDec.textContent = decBigInt.toString(10);
      valHex.textContent = decBigInt.toString(16).toUpperCase();
      valOct.textContent = decBigInt.toString(8);
      
      // Formatação de binário com espaçamento a cada 4 bits para premium UX
      const rawBin = decBigInt.toString(2);
      valBin.textContent = formatBinString(rawBin);
    } catch (e) {
      valDec.textContent = 'Erro';
      valHex.textContent = 'Erro';
      valOct.textContent = 'Erro';
      valBin.textContent = 'Erro';
    }
  }

  function formatBinString(str) {
    if (str.startsWith('-')) {
      return '-' + formatBinString(str.slice(1));
    }
    // Pad com zeros para múltiplo de 4 bits
    const padLength = Math.ceil(str.length / 4) * 4;
    const padded = str.padStart(padLength, '0');
    
    // Insere espaços
    return padded.match(/.{1,4}/g).join(' ');
  }

  function updateProgrammerDisplay() {
    // Exibe o valor do programador formatado de acordo com a base ativa
    if (programmerValue.includes(' ')) {
      // É uma expressão intermediária, exibe direto no painel principal ativo
      valDec.textContent = programmerValue;
      valHex.textContent = '--';
      valOct.textContent = '--';
      valBin.textContent = '--';
      return;
    }
    convertAndDisplayProgrammer(programmerValue, programmerBase);
  }

  function handleProgrammerKeyboardInput(e) {
    const isHex = programmerBase === 16;
    const isDec = programmerBase === 10;
    const isOct = programmerBase === 8;
    const isBin = programmerBase === 2;

    const key = e.key.toUpperCase();

    if (e.key === 'Backspace') {
      btnProgBackspace.click();
      return;
    }
    if (e.key === 'Escape') {
      btnProgClear.click();
      return;
    }
    if (e.key === 'Enter') {
      btnProgEquals.click();
      return;
    }

    // Validar teclas baseadas no modo ativo
    let allowedKeys = [];
    if (isBin) allowedKeys = ['0', '1'];
    else if (isOct) allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7'];
    else if (isDec) allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    else if (isHex) allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

    if (allowedKeys.includes(key)) {
      if (programmerValue === '0' || programmerValue === 'Erro') {
        programmerValue = key;
      } else {
        if (programmerValue.length < 20) {
          programmerValue += key;
        }
      }
      convertAndDisplayProgrammer(programmerValue, programmerBase);
    }
  }

  // ==========================================
  // 6. MODO CONVERSOR DE UNIDADES
  // ==========================================

  function initConverterOptions() {
    const category = convCategory.value;
    const data = conversionData[category];
    
    // Limpar selects
    convUnitFrom.innerHTML = '';
    convUnitTo.innerHTML = '';
    
    // Preencher selects
    Object.keys(data.units).forEach((key, idx) => {
      const optFrom = new Option(data.units[key].name, key);
      const optTo = new Option(data.units[key].name, key);
      
      // Destinos iniciais diferentes para melhor UX
      if (idx === 1) {
        optTo.selected = true;
      }
      
      convUnitFrom.add(optFrom);
      convUnitTo.add(optTo);
    });

    runConversion();
  }

  function runConversion() {
    const category = convCategory.value;
    const fromUnit = convUnitFrom.value;
    const toUnit = convUnitTo.value;
    const fromValue = parseFloat(convValueFrom.value);

    if (isNaN(fromValue)) {
      convValueTo.textContent = '0';
      return;
    }

    if (fromUnit === toUnit) {
      convValueTo.textContent = fromValue.toString();
      return;
    }

    let result;

    if (category === 'temperature') {
      // Regras de conversão de temperatura customizadas
      if (fromUnit === 'C') {
        if (toUnit === 'F') result = (fromValue * 9/5) + 32;
        else if (toUnit === 'K') result = fromValue + 273.15;
      } else if (fromUnit === 'F') {
        if (toUnit === 'C') result = (fromValue - 32) * 5/9;
        else if (toUnit === 'K') result = (fromValue - 32) * 5/9 + 273.15;
      } else if (fromUnit === 'K') {
        if (toUnit === 'C') result = fromValue - 273.15;
        else if (toUnit === 'F') result = (fromValue - 273.15) * 9/5 + 32;
      }
    } else {
      // Conversões métricas genéricas baseadas nos fatores em relação à base 1.0
      const data = conversionData[category];
      const valInBaseUnit = fromValue * data.units[fromUnit].factor;
      result = valInBaseUnit / data.units[toUnit].factor;
    }

    // Arredondar resultado de forma profissional
    if (result !== undefined) {
      convValueTo.textContent = parseFloat(result.toFixed(6)).toString();
    }
  }

  // Listeners do Conversor
  convCategory.addEventListener('change', initConverterOptions);
  convUnitFrom.addEventListener('change', runConversion);
  convUnitTo.addEventListener('change', runConversion);
  convValueFrom.addEventListener('input', runConversion);

  // Troca rápida de unidades
  btnConvSwap.addEventListener('click', () => {
    const temp = convUnitFrom.value;
    convUnitFrom.value = convUnitTo.value;
    convUnitTo.value = temp;
    runConversion();
  });

  // ==========================================
  // 7. SISTEMA DE HISTÓRICO INTEGRADO COM API NODEJS
  // ==========================================
  
  // Buscar histórico ao inicializar
  async function initHistory() {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const history = await res.json();
        renderHistoryList(history);
      }
    } catch (e) {
      console.warn('Backend indisponível. Rodando em modo histórico offline.');
    }
  }

  // Salvar entrada de cálculo no backend
  async function saveToHistory(expression, result, type) {
    const payload = {
      expression,
      result,
      type,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newEntry = await res.json();
        // Recarregar histórico
        initHistory();
      }
    } catch (e) {
      console.warn('Não foi possível gravar no backend. Usando histórico de sessão local.');
    }
  }

  // Renderizar itens no DOM
  function renderHistoryList(history) {
    if (!history || history.length === 0) {
      historyList.innerHTML = `
        <div class="history-empty-state">
          <i class="fa-solid fa-folder-open"></i>
          <p>Nenhum cálculo recente</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = '';
    history.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'history-item';
      itemDiv.dataset.expr = item.expression;
      itemDiv.dataset.res = item.result;
      itemDiv.dataset.type = item.type;

      // Tag de tradução amigável
      let typeLabel = 'Científico';
      if (item.type === 'graphing') typeLabel = 'Gráfico';
      if (item.type === 'programmer') typeLabel = 'Bits';

      itemDiv.innerHTML = `
        <span class="history-item-type">${typeLabel}</span>
        <div class="history-item-exp">${escapeHtml(item.expression)}</div>
        <div class="history-item-res">${escapeHtml(item.result)}</div>
      `;

      // Clicar no item preenche o display da calculadora
      itemDiv.addEventListener('click', () => {
        if (item.type === 'scientific') {
          expression = item.expression;
          displayResult.textContent = item.result;
          updateScientificDisplay();
        } else if (item.type === 'graphing') {
          // Extrai o valor do plot, ex: "Plotar: f(x) = sin(x)" -> "sin(x)"
          const cleaned = item.expression.replace('Plotar: f(x) = ', '');
          graphFuncInput.value = cleaned;
          currentGraphFunc = cleaned;
          drawGraph();
        }
      });

      historyList.appendChild(itemDiv);
    });
  }

  // Limpar Histórico Completo
  btnClearHistory.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        renderHistoryList([]);
      }
    } catch (e) {
      console.warn('Erro ao conectar ao backend para limpar o histórico.');
    }
  });

  // Auxiliar para escapar HTML
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
