var errores = "";
var op_symb = ["=","<>","!=",">=","<=",">","<"];
var st_rev = [ "ABORT","ACCESS","ACTION","ADD","AGGREGATE","ALTER","ANALYSE","ANALYZE","AND","ANY","ARRAY","AS","ASC",
                    "ASYMMETRIC","AT","AUTHORIZATION","BACKUP","BEFORE","BEGIN","BETWEEN","BIGINT","BINARY","BOTH","BY","CASCADE",
                    "CASE","CAST","CHECK","COLLATE","COLUMN","CONCURRENTLY","CONSTRAINT","CREATE","CROSS","CURRENT","CURRENT_DATE","CURRENT_ROLE",
                    "CURRENT_TIME","CURRENT_TIMESTAMP","CURRENT_USER","DEFAULT","DEFERRABLE","DEFERRED","DELETE","DESC","DISTINCT","DO","ELSE","END","EXCEPT",
                    "EXCLUDE","EXISTS","EXPLAIN","FETCH","FOR","FOREIGN","FROM","FULL","GRANT","GROUP","HAVING","ILIKE","IN","INITIALLY","INNER","INSERT","INTERSECT",
                    "INTO","IS","ISNULL","JOIN","LEADING","LEFT","LIKE","LIMIT","LISTEN","LOAD","LOCAL","LOCK","MATCH","MINUS","NATURAL","NOT","NOTNULL","NULL","OFFSET",
                    "ON","ONLY","OR","ORDER","OUTER","OVER","OVERLAPS","PLACING","PRIMARY","REFERENCES","RETURNING","RIGHT","ROLLBACK","ROW","ROWS","SELECT","SESSION_USER",
                    "SET","TABLE","TABLESAMPLE","THEN","TO","TRAILING","TRANSACTION","TRIGGER","UNION","UNIQUE","USER","USING","VERBOSE","WHEN","WHERE","WITH","WITHOUT" ];
//contadores
var count_res = 0;
var count_simbol = 0;
var count_string = 0;
var count_number = 0;
          

document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("inputQuery");
  const btnAnalizar = document.getElementById("btnAnalizar");
  const btnLimpiar = document.getElementById("btnLimpiar");
  const lexicoResultado = document.getElementById("lexicoResultado");
  const sintacticoResultado = document.getElementById("sintacticoResultado");
  const consolaResultado = document.getElementById("consolaResultado");

  btnAnalizar.addEventListener("click", () => {
    const texto = textarea.value;
    if (texto === "") {
      consolaResultado.textContent = "⚠️ No hay datos para analizar.";
    } else {
      let arr = analizadorlexico(texto);       
      if(arr.length > 0)
      {
        document.getElementById('tablaLexicoCuerpo').innerHTML = '';
        for (let i = 0; i < arr.length; i++) 
        {
            var arrayDeCadenas = arr[i].split('%');
            console.log(arrayDeCadenas);
            agregarFilaLexico(arrayDeCadenas[1], arrayDeCadenas[0], arrayDeCadenas[2]);
        }
      }
      consolaResultado.innerHTML = "";
      consolaResultado.innerHTML = errores; 
    }
  });
});

function stringToArray(texto) {
    return texto.split('');
}

function agregarFilaLexico(token, tipo, linea, valido = true) {
  const estadoClase = valido ? 'text-green-600' : 'text-red-600';
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td class="border px-4 py-2 ${estadoClase}">${token}</td>
    <td class="border px-4 py-2 ${estadoClase}">${tipo}</td>
    <td class="border px-4 py-2">${linea}</td>
  `;
  document.getElementById('tablaLexicoCuerpo').appendChild(fila);
}

function analizadorlexico(texto_in)
{
  //variables y otros
  let texto = texto_in.trim();  
  let arrChart = stringToArray(texto);
  let concat = ""; 
  let result_regex;
  //pibotes
  let sim_agrup;
  let char_pibot;
  //controles
  let val_agrup = [false,false,false];
  //contadores
  count_res = 0;
  count_simbol = 0;
  count_string = 0;
  count_number = 0;
  //arrays
  let arr = [];
  let tab_lex = [];

  for (let i = 0; i < arrChart.length; i++) 
  {
    result_regex = validar_regex(arrChart[i]);

    if( (result_regex == "d" || result_regex == "e") && !val_agrup[0] )
    {
      console.log("primer comilla")
      arr.push(arrChart[i]);
      tab_lex.push(crear_token(result_regex,arrChart[i],contar_regex(result_regex)));
      val_agrup[0] = true;
      console.log("push");
    }
    else if ( result_regex == "b" || result_regex == "c" )
    {
      concat += arrChart[i];
      console.log(concat);
    }
    else if(arrChart[i] != " ")
    {
      if(concat != "")
      {
        arr.push(concat);
        tab_lex.push(crear_token(validar_regex(concat),concat,contar_regex(concat)));
        console.log("push");
        concat = ""; 
      }
      val_agrup[0] = val_agrup[0] && result_regex == "d" || result_regex == "e"? false : val_agrup[0] ;
      arr.push(arrChart[i]);
      console.log(arrChart[i]);
      tab_lex.push(crear_token(result_regex,arrChart[i],contar_regex(result_regex)));
      console.log("push");
    }
    else
    {
      if(concat != "")
      {
        arr.push(concat);
        console.log("distinto concat: "+ concat);
        console.log("distinto char: "+ arrChart[i]);
        console.log("push");
        result_regex = validar_regex(concat)
        tab_lex.push(crear_token(result_regex,concat,contar_regex(result_regex)));
        concat = ""; 
      }
    }
  }//for

  if (concat !== "") {
    arr.push(concat);
    result_regex = validar_regex(concat);
    tab_lex.push(crear_token(result_regex, concat, contar_regex(result_regex)));
  }

  return tab_lex;
}

function validar_regex(texto) {
  switch (true) {
    case st_rev.includes(texto.toUpperCase()):
      return "a";
    case /[a-zA-Z]/.test(texto):
      return "b";
    case /[0-9]/.test(texto):
      return "c";
    case /\"/.test(texto):
      return "d";
    case /\'/.test(texto):
      return "e";
    case /\;/.test(texto):
      return "f";
    case /\=/.test(texto):
      return "g";
    case /\</.test(texto):
      return "h";
    case /\>/.test(texto):
      return "i";
    case /\!/.test(texto):
      return "j";
    case /\"?[a-zA-Z][a-zA-Z0-9_]+\"?/.test(texto):
      return "k";
    case /\'?[a-zA-Z][a-zA-Z0-9_]+\'?/.test(texto):
      return "l";
    default:
      return "";
  }
}


function contar_regex(op)
{


    switch(true)
    {
      case op == "a": count_res++; return count_res
      case op == "b" || op == "k" || op == "l" : count_string++; return count_string
      case op == "c": count_number++; return count_number
      default: count_simbol++; return count_simbol;   
    }
}

function crear_token(op, valor,count)
{
    let token = {
      a: `RESERV%${valor}%${count}`,
      b: `LITERAL%${valor}%${count}`,
      c: `NÚMERO%${valor}%${count}`,
      d: `AGRP%${valor}%${count}`,
      e: `AGRUP%${valor}%${count}`,
      f: `DELIM%${valor}%${count}`,
      g: `ASIGN%${valor}%${count}`,
      h: `COMPARA%${valor}%${count}`,
      i: `COMPARA%${valor}%${count}`,
      j: `OPERADORLOG%${valor}%${count}`,
  };
  return token[op];
}





function agregarFilaSintactico(regla, descripcion, estado) {
  const estadoClase = estado.toLowerCase() === 'correcto' ? 'text-green-600' : 'text-red-600';
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td class="border px-4 py-2">${regla}</td>
    <td class="border px-4 py-2">${descripcion}</td>
    <td class="border px-4 py-2 font-semibold ${estadoClase}">${estado}</td>
  `;
  document.getElementById('tablaSintacticoCuerpo').appendChild(fila);
}


function agregarFilaSemantico(simbolo, tipo, valor, estado) {
  const estadoClase = estado.toLowerCase() === 'válida' || estado.toLowerCase() === 'compatible' || estado.toLowerCase() === 'existe' || estado.toLowerCase() === 'válido'
    ? 'text-green-600'
    : 'text-red-600';
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td class="border px-4 py-2">${simbolo}</td>
    <td class="border px-4 py-2">${tipo}</td>
    <td class="border px-4 py-2">${valor}</td>
    <td class="border px-4 py-2 font-semibold ${estadoClase}">${estado}</td>
  `;
  document.getElementById('tablaSemanticoCuerpo').appendChild(fila);
}


document.getElementById('btnLimpiar').addEventListener('click', () => {
  document.getElementById('inputQuery').value = '';
  document.getElementById('tablaLexicoCuerpo').innerHTML = '';
  document.getElementById('tablaSintacticoCuerpo').innerHTML = '';
  document.getElementById('tablaSemanticoCuerpo').innerHTML = '';
  document.getElementById('consolaResultado').innerHTML = '';
});

agregarFilaSintactico('DELETE → DELETE FROM tabla', 'Falta condición WHERE', 'Error');
agregarFilaSemantico('"DEL3TE"', 'Palabra Reservada', '', 'Invalido');


    // Modal
    const openModalBtn = document.getElementById('openModal');
    const closeModalBtn = document.getElementById('closeModal');
    const closeModalFooterBtn = document.getElementById('closeModalFooter');
    const modal = document.getElementById('modal');

    openModalBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    closeModalFooterBtn.addEventListener('click', () => modal.classList.add('hidden'));

    // Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const target = button.getAttribute('data-tab');

        tabButtons.forEach(btn => {
          btn.classList.remove('text-blue-600', 'font-semibold', 'border-b-2', 'border-blue-600');
          btn.classList.add('text-gray-600');
        });

        button.classList.add('text-blue-600', 'font-semibold', 'border-b-2', 'border-blue-600');

        tabContents.forEach(content => {
          content.classList.add('hidden');
        });

        document.getElementById(target).classList.remove('hidden');
      });
    });