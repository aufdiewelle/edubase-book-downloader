const puppeteer = require("puppeteer");

const login = async (browser, loginUrl, loginData) => {
  const page = await browser.newPage();
  console.log(new Date().toISOString(), " --- try to log in");
  await page.goto(loginUrl);
  await page.waitForTimeout(10000);
  await page.keyboard.type(loginData.email);
  await page.keyboard.press("Tab");
  await page.keyboard.type(loginData.password);
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(10000);
  console.log(new Date().toISOString(), " --- logged in");
  return;
};

const generatePDF = async (browser, urlDescriptor, requestToWaitFor) => {
  const page = await browser.newPage();

  for (
    let index = urlDescriptor.startPage;
    index <= urlDescriptor.endPage;
    index++
  ) {
    if (index === urlDescriptor.startPage) {
      await page.goto(
        urlDescriptor.base.replace(urlDescriptor.pageIndicator, index)
      );
      console.log(new Date().toISOString(), " --- opened page with book");
    } else {
      page.$$eval(
        "i.svg-icon-arrow.svg-icon-arrow_right.pointer.footer-page-navigation",
        (buttons) => buttons.forEach((button) => button.click())
      );
      console.log(new Date().toISOString(), " --- clicked next page");
    }

    if (index === urlDescriptor.startPage) {
      await page.waitForTimeout(5000); // just wait a couple of seconds more
    }

    const pdfConfig = {
      path: `page-${index}.pdf`, // Saves pdf to disk.
      format: "A4",
      printBackground: true,
    };
    await page.emulateMediaType("print");
    const pdf = await page.pdf(pdfConfig); // Return the pdf buffer. Useful for saving the file not to disk.
    console.log(new Date().toISOString(), " --- downloaded pdf");
  }
};

(async () => {
  const loginUrl = "https://app.edubase.ch/#promo?popup=login";
  const loginData = {
    email: "mein benutzer", //hier zwischen "" dein benutzer eingeben
    password: "mein passwort", //hier zwischen "" dein passwort eingeben
  };
  const urlDescriptor = {
   // Beispiel: Leadership und Kommunikation
   //2. Auflage 2019, Seiten 344, ISBN 2000100821480
    base: "https://app.edubase.ch/#doc/49469/${page}",
	pageIndicator: "${page}",
    startPage: 1,
    endPage: 344,

  };
  const requestToWaitForBeforeGeneratingPDF = {
    urlStartsWith: "https://reader.edubase.ch/lookup/srv/d4.2/statistics/info",
    method: "GET",
  };
  const browser = await puppeteer.launch({ headless: true }); // Puppeteer can only generate pdf in headless mode.
  await login(browser, loginUrl, loginData);
  await generatePDF(
    browser,
    urlDescriptor,
    requestToWaitForBeforeGeneratingPDF
  );
  await browser.close();
})();
