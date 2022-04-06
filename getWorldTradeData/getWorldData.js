const ws = require('puppeteer');
const { readFileSync, writeFileSync } = require('fs');
const allCointries = JSON.parse(readFileSync('world.json')).map(c => c.name.toLowerCase());
const alleLandData = {};

(async url => {
    const browser = await ws.launch();
    for(const land of allCointries){
    // for(let i=224; i<230; ++i){
    //     const land = allCointries[i];
        console.log(`Henter data fra ${land}`);
        try{
            const page = await browser.newPage();

            await page.goto(`${url}/${land.replaceAll(" ", "-")}/`);

            // Henter prosent per land den eksorterer til.
            var xpath = `/html/body/div[1]/div[1]/div[2]/main/div[2]/section/div/div/div[2]/div[6]/div[26]/p/text()`;
            var [el] = await page.$x(xpath);
            var getText = await el.getProperty("textContent");
            var text = await getText.jsonValue();
            const rareLand = "united arab emirates,united states,somalia,guam,french polynesia,eritrea,venezuela".split(",");
            // Hender vi havner i feil div, må da bruke den nye
            if(text.includes("note: data are in current year dollars") || rareLand.includes(land)){
                xpath = `/html/body/div[1]/div[1]/div[2]/main/div[2]/section/div/div/div[2]/div[6]/div[27]/p`;
                [el] = await page.$x(xpath);
                getText = await el.getProperty("textContent");
                text = await getText.jsonValue();
            }

            // Henter ut total eksport
            var [eltot] = await page.$x(`/html/body/div[1]/div[1]/div[2]/main/div[2]/section/div/div/div[2]/div[6]/div[26]/p/text()[1]`);
            var getTotText = await eltot.getProperty("textContent");
            var totText = await getTotText.jsonValue();

            // Hender vi havner i feil div, må da bruke den nye
            if(!totText.startsWith("$")){
                var [eltot] = await page.$x(`/html/body/div[1]/div[1]/div[2]/main/div[2]/section/div/div/div[2]/div[6]/div[25]/p/text()[1]`);
                var getTotText = await eltot.getProperty("textContent");
                var totText = await getTotText.jsonValue();
            }

            // Total eksprt i billon USD. 
            const tot = totText.split(" ")[0].replace("$", "").replaceAll(".", "").replaceAll(",", "");

            // Eksport per land. 
            const eksport = {tot};
            
            // Sorterer strengen som feks ser slik ut: Switzerland 23%, India 17%, China 12%, United Arab Emirates 8%, South Africa 8% (2019)
            /** Til: {
                "Switzerland ": "23",
                "India ": "17",
                "China ": "12",
                "United Arab Emirates ": "8",
                "South Africa": "8"
            }
            */
            text.split(",").forEach(e => {
                const p = e.match(/(\d+)/gm)[0];
                const l = e.replace(/(\d+)/g, "").replace("%", "").replace(" : ", ": ").replace("  ()", "").replace(". ()", "").toLowerCase();
                eksport[l] = p

            })
            // Dytter landet inn i alleLandData objektet
            alleLandData[land] = {};
            alleLandData[land]["eksport"] = eksport;
        }
        catch(e){ 
            // Noen land finnes ikke på cia sine sider. 
            console.log(`Kunne ikke hente data fra ${land}\n`);
         }
    }
    browser.close();
    // Skriver til json fil.
    writeFileSync('WorldData.json', JSON.stringify(alleLandData, null, 2));
    console.log("\n ========================= \n \tFERDIG! \n ========================= \n");


})("https://www.cia.gov/the-world-factbook/countries/");