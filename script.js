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
var count_descon = 0;
          

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
      document.getElementById('tablaLexicoCuerpo').innerHTML = '';
    } else {
      const arr = analizadorlexico(texto);   
      var arr_sintactico = [];    
      var arrayDeCadenas = [];
      if(arr.length > 0)
      {
        document.getElementById('tablaLexicoCuerpo').innerHTML = '';
        for (let i = 0; i < arr.length; i++) 
        {
            arrayDeCadenas = arr[i].split('%');
            arr_sintactico.push(arrayDeCadenas[1]);
            agregarFilaLexico(arrayDeCadenas[1], arrayDeCadenas[0], arrayDeCadenas[2]);
        }
        var arr_sin = analizadorSintactico(arr_sintactico);
      }
      consolaResultado.innerHTML = "";
      consolaResultado.innerHTML = arr_sin; 
    }
  });
});

function stringToArray(texto) {
    return texto.split('');
}

function agregarFilaLexico(token, tipo, linea) {
  const estadoClase = tipo != "DESCONOCIDO" ? 'text-green-600' : 'text-red-600';
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
  //controles
  let val_agrup = [false,false,false];
  //contadores
  count_res = 0;
  count_simbol = 0;
  count_string = 0;
  count_number = 0;
  count_descon = 0;
  //arrays
  let arr = [];
  let tab_lex = [];

  for (let i = 0; i < arrChart.length; i++) 
  {
    result_regex = validar_regex(arrChart[i]);
    if( (result_regex == "d" || result_regex == "e") && !val_agrup[0] )
    {
      arr.push(arrChart[i]);
      tab_lex.push(crear_token(result_regex,arrChart[i],contar_regex(result_regex)));
      val_agrup[0] = true;
    }
    else if ( result_regex == "b" || result_regex == "c" )
    {
      concat += arrChart[i];
    }
    else if(arrChart[i] != " ")
    {
      if(concat != "")
      {
        arr.push(concat);
        tab_lex.push(crear_token(validar_regex(concat),concat,contar_regex(validar_regex(concat))));
        concat = ""; 
      }
      val_agrup[0] = val_agrup[0] && result_regex == "d" || result_regex == "e"? false : val_agrup[0] ;
      arr.push(arrChart[i]);
      tab_lex.push(crear_token(validar_regex(arrChart[i]),arrChart[i],contar_regex(validar_regex(arrChart[i]))));
    }
    else
    {
      if(concat != "")
      {
        arr.push(concat);
        tab_lex.push(crear_token(validar_regex(concat),concat,contar_regex(validar_regex(concat))));
        concat = ""; 
      }
    }
  }//for

  if (concat !== "") {
    arr.push(concat);
    tab_lex.push(crear_token(validar_regex(concat), concat, contar_regex(validar_regex(concat))));
  }

  return tab_lex;
}

function validar_regex(texto) {
  switch (true) {
    case st_rev.includes(texto.toUpperCase()):
      return "a";
    case /[a-zA-Z_]/.test(texto):
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
    case /[a-zA-Z0-9_]/.test(texto):
      return "m";
    case /\W/.test(texto):
      return "n";
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
      case op == "n": count_descon++; return count_descon
      default: count_simbol++; return count_simbol;   
    }
}

function crear_token(op, valor,count)
{
    let token = {
      a: `RESERV%${valor}%${count}`,
      b: `ID%${valor}%${count}`,
      c: `NÚMERO%${valor}%${count}`,
      d: `AGRP%${valor}%${count}`,
      e: `AGRUP%${valor}%${count}`,
      f: `DELIM%${valor}%${count}`,
      g: `ASIGN%${valor}%${count}`,
      h: `COMPARA%${valor}%${count}`,
      i: `COMPARA%${valor}%${count}`,
      j: `OPERADORLOG%${valor}%${count}`,
      m: `ID%${valor}%${count}`,
      n: `DESCONOCIDO%${valor}%${count}`,
  };
  return token[op];
}


function analizadorSintactico(arr)
{
  //DELETE FROM TABLE
  let delete_syntax = [false, false, false];
  //WHERE COLUMNA SIMBOLO VALOR
  let condicional_syntax = [false, false, false, false];
  let terminacion = false;
  let agrupacion = [false,false,false];
  let esValido = true; 
  let mensaje = "SE ESPERABA UN ";
  let count = arr.length;
  let pib = 0;
  let pibote = "";
  let concat = "";

  while( count > 0 && esValido)
  {
    //DELETE
    if(!delete_syntax[0])
    {
      concat += arr[pib];
      if(!(/DELETE/.test(arr[pib])))
      {
        esValido = false;
        mensaje = `${mensaje} DELETE EN ----> ${concat}`; 
      }
      delete_syntax[0] = true;
    }
    //FROM
    else if(!delete_syntax[1])
    {
      concat += " "+arr[pib]+" ";
      if(!(/FROM/.test(arr[pib])))
      {
        esValido = false;
        mensaje = `${mensaje} FROM EN ----> ${concat}`; 
      }
      delete_syntax[1] = true;
    }
    //NOMBRE TABLA
    else if(!delete_syntax[2])
    {
      if(arr[pib] == "\"")
      {
        concat+= arr[pib];
        if(agrupacion[0])
        {
          if(agrupacion[1])
          {
            agrupacion[2] = true;
            delete_syntax[2] = true;
          }
          else
          {
            esValido = false;
            mensaje = `${mensaje} comilla doble o existe una agrupación invalida en el nombre de la tabla ----> ${concat}`; 
          }
        }
        else
        {
          agrupacion[0] = true;
          mensaje = `${mensaje} comilla doble o existe una agrupación invalida en el nombre de la tabla ----> ${concat}`; 
        }
      }
      else if(/^[a-zA-Z]$/.test(arr[pib])  || /^[a-zA-Z][a-zA-Z0-9_]*$/.test(arr[pib]))
      {
        if( st_rev.includes(arr[pib].toUpperCase()) )
        {
           esValido = false;
           mensaje = `${mensaje} nombre valido, más no una palabra reservada ----> ${concat}`; 
        }
        else
        {
          concat += arr[pib];
          agrupacion[1] = true;
          if( arr[pib+1] !== undefined )
          {
            if( agrupacion[0] == agrupacion[2]  )
            {
              delete_syntax[2] = true;
            }
          }
          else
          {
            agrupacion[1] = true;
            delete_syntax[2] = true;

          }
        }
      }
      else if(arr[pib] == "\'")
      {
        esValido = false;
        mensaje = `${mensaje} comilla doble para agrupar el nombre de la tabla ----> ${concat}`; 
      }
      else if(arr[pib] == ";")
      {
        terminacion = true;
        debugger;
        if(agrupacion[1] && agrupacion[0] == agrupacion[2])
        {
          delete_syntax[2] = true;
        }
        else
        {
          esValido = false;
          mensaje = `${mensaje} caracter valido para el nombre de la tabla ----> ${concat}`; 
        }

      }
      else
      {
        esValido = false;
        mensaje = `${mensaje} caracter valido para el nombre de la tabla ----> ${concat}`; 
      }
    }
    //WHERE
    else if(!condicional_syntax[0])
    {
      concat += " "+arr[pib] + " " ;
      debugger;
      if(/WHERE/.test(arr[pib]))
      {
        terminacion = false;
        condicional_syntax[0] = true;
        agrupacion = [false,false,false];
        pibote = "";
        concat += " ";
      }
      else if(/;/.test(arr[pib]) && agrupacion[1]  )
      {
        agrupacion = [false,false,false];
        terminacion = true;
      }
      else
      {
        esValido = false;
        terminacion = false;
        mensaje = `${mensaje} ; o una condición con WHERE despues de ----> ${concat} [COLUMNA] [SIMBOLO] [VALOR]`;
      }

    }
    //COLUMNA
    else if(!condicional_syntax[1])
    {
      if(arr[pib] == "\"")
      {
        concat+= arr[pib];
        if(agrupacion[0])
        {
          if(agrupacion[1])
          {
            agrupacion[2] = true;
            condicional_syntax[1] = true;
          }
          else
          {
            esValido = false;
            mensaje = `${mensaje} comilla doble o existe una agrupación invalida en el nombre de la tabla ----> ${concat}`; 
          }
        }
        else
        {
          agrupacion[0] = true;
          mensaje = `${mensaje} comilla doble o existe una agrupación invalida en el nombre de la tabla ----> ${concat}`; 
        }
      }
      else if(/^[a-zA-Z]$/.test(arr[pib])  || /^[a-zA-Z][a-zA-Z0-9_]*$/.test(arr[pib]))
      {
        if(st_rev.includes(arr[pib].toUpperCase()))
        {
          esValido = false;
          mensaje = `${mensaje} nombre valido, más no una palabra reservada ----> ${concat}`; 
        }
        else
        {
          concat += arr[pib];
          agrupacion[1] = true;
          if( arr[pib+1] !== undefined )
          {
            if( agrupacion[0] == agrupacion[2]  )
            {
              condicional_syntax[1] = true;
            }
          }
          else
          {
            agrupacion[1] = true;
            condicional_syntax[1] = true;
          }
        }
      }
      else if(arr[pib] == "\'")
      {
        esValido = false;
        mensaje = `${mensaje} comilla doble para agrupar el nombre de las columnas ----> ${concat}`; 
      }
      else
      {
        esValido = false;
        mensaje = `${mensaje} caracter valido para el nombre de la columna ----> ${concat}`; 
      }
    }
    //SIMBOLO
    else if(!condicional_syntax[2])
    {
      concat += " " + arr[pib] + " ";
      pibote = arr[pib];
      debugger;
      if(!(/\=/.test(arr[pib])))
      {
        agrupacion= [false,false,false];
        esValido = false;
        mensaje = `${mensaje} SIMBOLO EN ----> ${concat}`; 
      }
      condicional_syntax[2] = true;
    }
    //VALOR
    else if(!condicional_syntax[3])
    {
      if(arr[pib] == "\'")
      {
        concat+= arr[pib];
        if(agrupacion[0])
        {
          if(agrupacion[1])
          {
            agrupacion[2] = true;
            condicional_syntax[3] = true;
            if( arr[pib+1] !== undefined )
            {
              if(arr[pib+1] == ";" )
              {
                terminacion = true;
                condicional_syntax[4] = true;
              }
            }
            else
            {
              condicional_syntax[4] = true;
            }
          }
          else
          {
            esValido = false;
            mensaje = `${mensaje} comilla simple o existe una agrupación invalida en el valor ----> ${concat}`; 
          }
        }
        else
        {
          agrupacion[0] = true;
          mensaje = `${mensaje} comilla simple o existe una agrupación invalida en el valor ----> ${concat}`; 
        }
      }
      else if(/^[a-zA-Z0-9_. ]+$/.test(arr[pib]))
      {
        concat += arr[pib];
        agrupacion[1] = true;
        if( arr[pib+1] !== undefined )
        {
          if( agrupacion[0] == agrupacion[2]  )
          {
            condicional_syntax[3] = true;
          }
        }
        else
        {
          agrupacion[1] = true;
          condicional_syntax[3] = true;
        }
      }
      else if(arr[pib] == "\"")
      {
        esValido = false;
        mensaje = `${mensaje} comilla simple para agrupar el nombre de las columnas ----> ${concat}`; 
      }
      else
      {
        esValido = false;
        mensaje = `${mensaje} caracter valido para el valor ----> ${concat}`; 
      }
    }
    //OPERADOR
    else
    {
      if(!condicional_syntax[4])
      {
        concat += " "+arr[pib]+ " " ;
        if(  /^AND$/.test(arr[pib]) || /^OR$/.test(arr[pib])  )
        {
          terminacion = false;
          agrupacion = [false,false,false];
          condicional_syntax = [ condicional_syntax[0], false, false, false];
          delete_syntax = [true, true, true];
        }
        else if(/^;$/.test(arr[pib]))
        {
          terminacion = true;
          condicional_syntax[4] = true;
          concat = "";
        }
        else
        {
          esValido = false;
          mensaje = `${mensaje} caracter valido despues de  ----> ${concat}`; 
        }
      }
    }

    pib++;
    count--; 
  }
  pib = 0;

  while(pib < delete_syntax.length && esValido )
  {
    esValido = delete_syntax[pib];
    mensaje = errorValidadorSintactico(pib) + " despues --------> " + concat;
    pib++;
  }
  if(!terminacion && delete_syntax.every(Boolean) )
  {
     if( condicional_syntax[0] && (!condicional_syntax[1] || !condicional_syntax[2]) )
     {
        esValido = false;
        mensaje = `Se esperaba una condición correcta despues de ----> ${concat}  --------- \[COLUMNA\] \[SIMBOLO\] \[VALOR\]`; 
     }     
  }

  if(esValido)
  {
    return `LA CONSULTA ES VALIDA.`; 
  }
  else
  {
    return mensaje;
  } 

}

function errorValidadorSintactico(op)
{
  let mensaje = "se esperaba un(a) ";
    switch(op)
    {
      case 0: ; return `${mensaje} DELETE `
      case 1: ; return `${mensaje} FROM `
      case 2: ; return `${mensaje} nombre de una tabla `
      default: ; return "" ;   
    }
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
}


document.getElementById('btnLimpiar').addEventListener('click', () => {
  document.getElementById('inputQuery').value = '';
  document.getElementById('tablaLexicoCuerpo').innerHTML = '';
  document.getElementById('tablaSintacticoCuerpo').innerHTML = '';
  document.getElementById('consolaResultado').innerHTML = '';
});

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