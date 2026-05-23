const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Iniciando teste automatizado do Playwright...');
  
  // Iniciar browser chromium headless
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capturar logs do console do navegador
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE - ${msg.type()}]: ${msg.text()}`);
  });

  // Capturar erros não tratados da página
  page.on('pageerror', err => {
    console.error('[BROWSER RUNTIME ERROR]:', err.stack || err.message);
  });

  try {
    console.log('Navegando para http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log('Verificando se a página carregou...');
    const title = await page.title();
    console.log('Título da página:', title);

    // Tirar screenshot inicial
    const ssPath = path.join('C:\\Users\\Migue\\.gemini\\antigravity-ide\\brain\\234a04d9-04a4-4339-bfb9-c72e7fca70d8\\scratch', 'initial_screenshot.png');
    await page.screenshot({ path: ssPath });
    console.log('Screenshot inicial salvo em:', ssPath);

    // Testar cliques no teclado científico
    console.log('Clicando nos botões: 7, +, 5, =...');
    
    // Clicar no botão do número 7
    await page.click('button[data-val="7"]');
    let expr = await page.locator('#displayExpression').textContent();
    console.log('Após clicar em 7, Display Expressão:', expr);
    
    // Clicar no botão +
    await page.click('button[data-val="+"]');
    expr = await page.locator('#displayExpression').textContent();
    console.log('Após clicar em +, Display Expressão:', expr);
    
    // Clicar no botão do número 5
    await page.click('button[data-val="5"]');
    expr = await page.locator('#displayExpression').textContent();
    console.log('Após clicar em 5, Display Expressão:', expr);
    
    // Clicar no botão =
    await page.click('#btnEquals');
    
    // Aguardar pequeno intervalo para atualização do DOM
    await page.waitForTimeout(300);
    
    // Ler expressão e resultado finais
    expr = await page.locator('#displayExpression').textContent();
    const result = await page.locator('#displayResult').textContent();
    
    console.log('=== RESULTADOS DO TESTE ===');
    console.log('Display Expressão Final:', expr);
    console.log('Display Resultado Final:', result);
    console.log('============================');

    // Tirar screenshot após o cálculo
    const resultSSPath = path.join('C:\\Users\\Migue\\.gemini\\antigravity-ide\\brain\\234a04d9-04a4-4339-bfb9-c72e7fca70d8\\scratch', 'calculated_screenshot.png');
    await page.screenshot({ path: resultSSPath });
    console.log('Screenshot de resultado salvo em:', resultSSPath);

  } catch (error) {
    console.error('Falha catastrófica durante o teste da interface:', error);
  } finally {
    await browser.close();
    console.log('Teste concluído, navegador fechado.');
  }
})();
