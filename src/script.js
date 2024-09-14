const puppeteer = require("puppeteer");
const fs = require("fs");

const cams = JSON.parse(fs.readFileSync("src/db/cams.json"));

(async () => {
  for (const cam of cams) {
    let browser;
    try {
      console.log(`Acessando câmera: ${cam.ip} (${cam.brand})`);

      browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();

      await page.authenticate({
        username: cam.username,
        password: cam.password,
      });

      console.log(`Verificando dados da câmera:`, cam);
      if (cam.brand === "axis") {
        await accessAxisCam(page, cam.ip);
      } else if (cam.brand === "wisenet") {
        await accessWisenetCam(page, cam.ip); // Passando o IP da câmera
      }
    } catch (error) {
      console.error(`Erro ao acessar a câmera ${cam.ip}:`, error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
})();

async function clickSelector(page, selector) {
  return page.evaluate(async (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.click();
      return true;
    }
    return false;
  }, selector);
}

async function accessAxisCam(page, camIp) {
  console.log("Executando script para câmera Axis");

  const axisUrl = `http://${camIp}`;

  try {
    await page.goto(axisUrl, { waitUntil: "networkidle2", timeout: 60000 });
    console.log(
      `Acessou a página de configuração da câmera Axis (${camIp}) com sucesso!`
    );
  } catch (err) {
    console.error(`Erro ao navegar para a URL Axis (${camIp}): ${err.message}`);
    return;
  }

  await page.waitForSelector("a#settings-toggle-up", {
    visible: true,
    timeout: 60000,
  });
  const foundSettings = await clickSelector(page, "a#settings-toggle-up");
  if (foundSettings) {
    console.log("Cliquei no botão de Configurações com sucesso!");
  } else {
    console.log("O botão de Configurações não foi encontrado.");
    return;
  }

  await page.waitForSelector("#overlayMenuItem > a", {
    visible: true,
    timeout: 60000,
  });
  const foundOverlay = await clickSelector(page, "#overlayMenuItem > a");
  if (foundOverlay) {
    console.log("Cliquei no botão de Overlay com sucesso!");

    // Verifica se a mensagem de resolução adaptativa está presente
    try {
      // Aguarda até que a mensagem seja exibida ou 10 segundos
      await page.waitForSelector("#overlayPanel > div.no-settings > h2", {
        visible: true,
        timeout: 30000,
      });
      const messagePresent = await page.evaluate(() => {
        const message = document.querySelector(
          "#overlayPanel > div.no-settings > h2"
        ); // Substitua '.message-class' pelo seletor correto da mensagem
        return (
          message &&
          message.textContent.includes(
            "To use dynamic overlay, turn off adaptive resolution"
          )
        );
      });

      if (messagePresent) {
        console.log(
          "Mensagem de resolução adaptativa encontrada. Desligando resolução adaptativa..."
        );

        await page.waitForSelector(
          "#videocontainerWrap > aside > div.livePanel > div.control.videoSettings > button",
          { visible: true, timeout: 60000 }
        );
        const foundMenuLive = await clickSelector(
          page,
          "#videocontainerWrap > aside > div.livePanel > div.control.videoSettings > button"
        );
        if (foundMenuLive) {
          console.log("Cliquei no botão de live com sucesso!");
        } else {
          console.log("O botão de live não foi encontrado.");
        }

        await page.waitForSelector(
          "#AXIS-adaptiveResolution-OnOffSwitch > div > label",
          { visible: true, timeout: 60000 }
        );
        const foundAdaptive = await clickSelector(
          page,
          "#AXIS-adaptiveResolution-OnOffSwitch > div > label"
        );
        if (foundAdaptive) {
          console.log("Cliquei no botão de adaptive com sucesso!");
        } else {
          console.log("O botão de adaptive não foi encontrado.");
        }
      } else {
        console.log("Mensagem de resolução adaptativa não encontrada.");

        await page.waitForSelector(
          "#overlayPanel > div > div.carousel-outer > div > div > a:nth-child(1)",
          { visible: true, timeout: 60000 }
        );

        const foundDataAndHour = await clickSelector(
          page,
          "#overlayPanel > div > div.carousel-outer > div > div > a:nth-child(1)"
        );
        if (foundDataAndHour) {
          console.log("Cliquei no botão de data e hora com sucesso!");
        } else {
          console.log("O botão de data e hora não foi encontrado.");
        }

        const foundDateAndHourActive = await page.evaluate(() => {
          const buttons = Array.from(
            document.querySelectorAll("a.component-icon.icon-state")
          );
          for (const button of buttons) {
            if (button.textContent.includes("Texto")) {
              button.click();
              return true;
            }
          }
          return false;
        });
        if (foundDateAndHourActive) {
          console.log("Cliquei no botão de data e hora ativo com sucesso!");
        } else {
          console.log("O botão de data e hora ativo não foi encontrado.");
        }

        await page.waitForSelector(
          "#peripheralWrap > div.editOverlayDialog.dialog > div > div.dialogButtons > button.btn.remove",
          { visible: true, timeout: 60000 }
        );
        const foundRemove = await clickSelector(
          page,
          "#peripheralWrap > div.editOverlayDialog.dialog > div > div.dialogButtons > button.btn.remove"
        );
        if (foundRemove) {
          console.log("Cliquei no botão de remover com sucesso!");
        } else {
          console.log("O botão de remover não foi encontrado.");
        }
      }
    } catch (error) {
      console.log(
        "Mensagem de resolução adaptativa não apareceu dentro do tempo esperado."
      );
    }
  } else {
    console.log("O botão de Overlay não foi encontrado.");
  }

  await page.waitForSelector("#AXIS-DynamicOverlay1Delete > button", {
    visible: true,
    timeout: 60000,
  });
  const foundRemove = await clickSelector(
    page,
    "#AXIS-DynamicOverlay1Delete > button"
  );
  if (foundRemove) {
    console.log("Cliquei no botão de remover com sucesso!");
  } else {
    console.log("O botão de remover não foi encontrado.");
  }

  await page.waitForSelector("#AXIS-DynamicOverlay1Delete > button", {
    visible: true,
    timeout: 10000,
  });
  const foundRemove2 = await clickSelector(
    page,
    "#AXIS-DynamicOverlay1Delete > button"
  );
  if (foundRemove2) {
    console.log("Cliquei no botão de remover2 com sucesso!");
  } else {
    console.log("O botão de remover2 não foi encontrado.");
  }
}

async function accessWisenetCam(page, camIp) {
  console.log("Executando script para câmera Wisenet");

  const wisenetUrl = `http://${camIp}/wmf/index.html#/setup/videoAudio_cameraSetup`;

  try {
    await page.goto(wisenetUrl, { waitUntil: "networkidle2", timeout: 60000 });
    console.log(
      `Acessou a página de configuração da câmera Wisenet (${camIp}) com sucesso!`
    );
  } catch (err) {
    console.error(
      `Erro ao navegar para a URL Wisenet (${camIp}): ${err.message}`
    );
    return;
  }

  await page.waitForSelector(
    "#camerasetuppage > form > div:nth-child(3) > div > div:nth-child(4) > div > ul > li:nth-child(7) > a",
    { visible: true, timeout: 60000 }
  );
  const foundOsd = await clickSelector(
    page,
    "#camerasetuppage > form > div:nth-child(3) > div > div:nth-child(4) > div > ul > li:nth-child(7) > a"
  );
  if (foundOsd) {
    console.log("Cliquei no botão de OSD de Cam com sucesso!");
  } else {
    console.log("O botão de OSD de Cam não foi encontrado.");
  }

  await page.waitForSelector("#DateOSDEnable", {
    visible: true,
    timeout: 60000,
  });
  const foundCheckBox = await clickSelector(page, "#DateOSDEnable");
  if (foundCheckBox) {
    console.log("Cliquei no Check Box de Cam com sucesso!");
  } else {
    console.log("O Check Box não foi encontrado.");
  }

  await page.waitForSelector(
    "#camerasetuppage > form > div.wn5-setup-common-button > button.btn.cm-btn-point.ng-binding",
    { visible: true, timeout: 60000 }
  );
  const foundApply = await clickSelector(
    page,
    "#camerasetuppage > form > div.wn5-setup-common-button > button.btn.cm-btn-point.ng-binding"
  );
  if (foundApply) {
    console.log("Cliquei no botão de apply com sucesso!");
  } else {
    console.log("O botão de apply não foi encontrado.");
  }

  await page.waitForSelector(
    "body > div.modal.fade.ng-isolate-scope.modal-position-middle.in > div > div > form > div.modal-footer.modal-setup > button.btn.cm-btn-point.ng-binding",
    { visible: true, timeout: 60000 }
  );
  const foundOk = await clickSelector(
    page,
    "body > div.modal.fade.ng-isolate-scope.modal-position-middle.in > div > div > form > div.modal-footer.modal-setup > button.btn.cm-btn-point.ng-binding"
  );
  if (foundOk) {
    console.log("Cliquei no botão de OK com sucesso!");
  } else {
    console.log("O botão de OK não foi encontrado.");
  }
}
