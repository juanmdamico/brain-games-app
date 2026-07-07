import fs from 'fs';
import { translate } from '@vitalets/google-translate-api';

const filePath = './src/data/periodicTableData.js';
const raw = fs.readFileSync(filePath, 'utf8');
const jsonStr = raw.replace('export const elementsData = ', '').replace(/;$/, '');
const data = JSON.parse(jsonStr);

const categoryMap = {
  "diatomic nonmetal": "no metal diatómico",
  "noble gas": "gas noble",
  "alkali metal": "metal alcalino",
  "alkaline earth metal": "metal alcalinotérreo",
  "metalloid": "metaloide",
  "polyatomic nonmetal": "no metal poliatómico",
  "post-transition metal": "metal del bloque p",
  "transition metal": "metal de transición",
  "lanthanide": "lantánido",
  "actinide": "actínido",
  "unknown, probably transition metal": "desconocido, prob. metal de transición",
  "unknown, probably post-transition metal": "desconocido, prob. metal del bloque p",
  "unknown, probably metalloid": "desconocido, prob. metaloide",
  "unknown, predicted to be noble gas": "desconocido, gas noble teórico",
  "unknown, but predicted to be an alkali metal": "desconocido, metal alcalino teórico"
};

const phaseMap = {
  "Gas": "Gas",
  "Solid": "Sólido",
  "Liquid": "Líquido"
};

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log("Starting translation of " + data.length + " elements...");
  for (let i = 0; i < data.length; i++) {
    const el = data[i];
    
    if (el.category && categoryMap[el.category]) el.category = categoryMap[el.category];
    if (el.phase && phaseMap[el.phase]) el.phase = phaseMap[el.phase];
    
    try {
      if (el.name) {
        const resName = await translate(el.name, { to: 'es' });
        el.name = resName.text;
      }
      if (el.summary) {
        const resSum = await translate(el.summary, { to: 'es' });
        el.summary = resSum.text;
      }
      console.log(`Translated ${i+1}/${data.length}: ${el.name}`);
    } catch (e) {
      console.error('Error translating', el.name || el.symbol, e.message);
      await sleep(2000); // Wait longer if rate limited
    }
    await sleep(200); // Prevent rate limit
  }
  
  const out = `export const elementsData = ${JSON.stringify(data, null, 2)};`;
  fs.writeFileSync(filePath, out, 'utf8');
  console.log('Finished writing translated data to file.');
}

run();
