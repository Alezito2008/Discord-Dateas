const cheerio = require('cheerio');

const dateas = async (query) => {
    try {
        const response = await fetch("https://www.dateas.com/es/consulta_cuit_cuil", {
            method: 'POST',
            headers: {
              "content-type": "application/x-www-form-urlencoded",
            },
            referrer: "https://www.dateas.com/es/consulta_cuit_cuil?name=CUIL",
            body: `name=${query.replaceAll(' ', '+')}&cuit=&tipo=fisicas-juridicas`,
        });
        const data = await response.text();
    
        const $ = cheerio.load(data);
    
        const firstOddRow = $('tr.odd').first();
    
        const nombre = firstOddRow.find('td[data-label="Razón Social"] a').text();
        const cuil = firstOddRow.find('td[data-label="CUIT / CUIL / CDI"] a').text();
        const dni = cuil.split('-')[1]
        const link = 'https://www.dateas.com' + firstOddRow.find('td a.button').attr('href');
        
        return {
            nombre,
            cuil,
            dni,
            link
        }
    } catch(error) {
        throw new Error('No se encontraron resultados');
    }
}

module.exports = dateas
