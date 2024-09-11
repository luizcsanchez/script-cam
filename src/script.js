const puppeteer = require("puppeteer");
const fs = require("fs");

const cams = JSON.parse(fs.readFileSync("cams.json"));

(async () => {
  for (const cam of cams) {
    try {
      console.log(`Acessando câmera: ${cam.ip} (${cam.brand})`);

      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();

      await page.authenticate({
        username: cam.username,
        password: cam.password,
      });

      await page.goto(cam.ip, { waitUntil: "networkidle2" });

      const pageTitle = await page.title();
      console.log(`Título da página: ${pageTitle}`);

      if (cam.brand === "axis") {
        // Execução para Axis
        await accessAxisCam(page);
      } else if (cam.brand === "wisenet") {
        // Execução para Wisenet
        await accessWisenetCam(page);
      }

      // Fecha o navegador após as operações
      await browser.close();
    } catch (error) {
      console.error(`Erro ao acessar a câmera ${cam.ip}:`, error);
    }
  }
})();

// Função para acessar câmeras Axis
async function accessAxisCam(page) {
  console.log("Executando script para câmera Axis");
  // Espera o botão de configurações estar visível e clica
  await page.waitForXPath('//*[@id="settings-toggle-up"]');
  const [settingsButton] = await page.$x('//*[@id="settings-toggle-up"]');
  if (settingsButton) {
    await settingsButton.click();
    console.log("Cliquei no botão de Configurações com sucesso!");
  } else {
    console.log("O botão de Configurações não foi encontrado.");
  }

  // Espera o botão de Overlay e clica
  await page.waitForXPath('//*[@id="overlayMenuItem"]/a');
  const [overlayButton] = await page.$x('//*[@id="overlayMenuItem"]/a');
  if (overlayButton) {
    await overlayButton.click();
    console.log("Cliquei no botão de Overlay com sucesso!");
  } else {
    console.log("O botão de Overlay não foi encontrado.");
  }

  // Espera o botão de data e hora e clica
  await page.waitForXPath('//*[@id="overlayPanel"]/div/div[1]/div/div/a[1]');
  const [dateAndHourButton] = await page.$x(
    '//*[@id="overlayPanel"]/div/div[1]/div/div/a[1]'
  );
  if (dateAndHourButton) {
    await dateAndHourButton.click();
    console.log("Cliquei no botão de data e hora com sucesso!");
  } else {
    console.log("O botão de data e hora não foi encontrado.");
  }

  // Espera o botão de data e hora ativo e clica
  await page.waitForXPath('//*[@id="overlayPanel"]/div/div[1]/div/div/a[2]');
  const [dateAndHourActiveButton] = await page.$x(
    '//*[@id="overlayPanel"]/div/div[1]/div/div/a[2]'
  );
  if (dateAndHourActiveButton) {
    await dateAndHourActiveButton.click();
    console.log("Cliquei no botão de data e hora ativo com sucesso!");
  } else {
    console.log("O botão de data e hora ativo não foi encontrado.");
  }

  // Espera o botão de remover e clica
  await page.waitForXPath(
    '//*[@id="peripheralWrap"]/div[3]/div/div[2]/button[1]'
  );
  const [removeButton] = await page.$x(
    '//*[@id="peripheralWrap"]/div[3]/div/div[2]/button[1]'
  );
  if (removeButton) {
    await removeButton.click();
    console.log("Cliquei no botão de remover com sucesso!");
  } else {
    console.log("O botão de remover não foi encontrado.");
  }
}

// Função para acessar câmeras Wisenet
async function accessWisenetCam(page) {
  console.log("Executando script para câmera Wisenet");

  const [settingsButton] = await page.$x('//*[@id="wisenet-settings-toggle"]');
  if (settingsButton) {
    await settingsButton.click();
    console.log("Cliquei no botão de Configurações (Wisenet) com sucesso!");
    await page.waitForNavigation({ waitUntil: "networkidle2" });
  } else {
    console.log("O botão de Configurações (Wisenet) não foi encontrado.");
  }
}
