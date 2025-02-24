'use strict';

const fs = require('fs');

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', (inputStdin) => {
  inputString += inputStdin;
});

process.stdin.on('end', function () {
  inputString = inputString
    .replace(/\s*$/, '')
    .split('\n')
    .map((str) => str.replace(/\s*$/, ''));

  main();
});

function readLine() {
  return inputString[currentLine++];
}

function whichIsIt(inputLine) {
  if (/^\d+$/.test(inputLine)) {
    return 'SKIP';
  }
  if (/^\d+$/.test(inputLine.split(' ')[0])) {
    return 'ALTERNATIVA';
  }
  return 'PERGUNTA';
}

function main() {
  let perguntasCounter = 0;

  const perguntas = [];
  let inputLine = '';
  let pergunta = '';
  const perguntasComRespostas = [];

  while ((inputLine = readLine()) !== 'Fácil') {
    continue;
  }

  while ((inputLine = readLine()) !== undefined && perguntasCounter < 300) {
    if (whichIsIt(inputLine) === 'SKIP') {
      pergunta = '';
      continue;
    } else if (whichIsIt(inputLine) === 'PERGUNTA') {
      pergunta = pergunta.concat(' ' + inputLine);
    } else if (whichIsIt(inputLine) === 'ALTERNATIVA') {
      const alternativa1 = inputLine.split(' ').splice(1).join(' ');
      const alternativa2 = readLine().split(' ').splice(1).join(' ');
      const alternativa3 = readLine().split(' ').splice(1).join(' ');
      const alternativa4 = readLine().split(' ').splice(1).join(' ');

      perguntas.push({
        pergunta: pergunta,
        alternativas: [alternativa1, alternativa2, alternativa3, alternativa4],
      });

      pergunta = '';
      perguntasCounter++;
    }
  }

  while ((inputLine = readLine()) !== 'Quadro de Respostas') {
    continue;
  }

  let respostasCounter = 0;
  while ((inputLine = readLine()) !== undefined && respostasCounter < 300) {
    let resposta = inputLine.split('.................');
    if (resposta.length > 1) {
      const index = parseInt(resposta[0]);
      const ans = resposta[1].replace(/\./g, '');

      let dificuldade;
      if (index < 100) dificuldade = 'Fácil';
      else if (index < 200) dificuldade = 'Média';
      else dificuldade = 'Difícil';

      perguntasComRespostas.push({
        ...perguntas[index - 1],
        resposta: +ans,
        dificuldade,
      });
      respostasCounter++;
    }
  }

  console.log('const perguntas = [');
  perguntasComRespostas.forEach((pergunta) => {
    console.log(' {');
    console.log(`   "pergunta": "${pergunta.pergunta.trim()}",`);
    console.log(`   "alternativas": [`);
    pergunta.alternativas.forEach((alternativa, i) => {
      console.log(`     "${alternativa}",`);
    });
    console.log('   ],');
    console.log(`   "dificuldade": "${pergunta.dificuldade}",`);
    console.log(`   "resposta": "${pergunta.resposta}"`);
    console.log(` },`);
  });
  console.log(']');

  return 0;
}
