var errores = "";

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
      let arr = analizador(texto);       
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

function analizador(texto_in)
{
    let texto = texto_in.trim();  
    let arrayDeCaracteres = stringToArray(texto);
    let tam = arrayDeCaracteres.length;
    let st_rev = [ "ABORT","ACCESS","ACTION","ADD","AGGREGATE","ALTER","ANALYSE","ANALYZE","AND","ANY","ARRAY","AS","ASC",
                    "ASYMMETRIC","AT","AUTHORIZATION","BACKUP","BEFORE","BEGIN","BETWEEN","BIGINT","BINARY","BOTH","BY","CASCADE",
                    "CASE","CAST","CHECK","COLLATE","COLUMN","CONCURRENTLY","CONSTRAINT","CREATE","CROSS","CURRENT","CURRENT_DATE","CURRENT_ROLE",
                    "CURRENT_TIME","CURRENT_TIMESTAMP","CURRENT_USER","DEFAULT","DEFERRABLE","DEFERRED","DELETE","DESC","DISTINCT","DO","ELSE","END","EXCEPT",
                    "EXCLUDE","EXISTS","EXPLAIN","FETCH","FOR","FOREIGN","FROM","FULL","GRANT","GROUP","HAVING","ILIKE","IN","INITIALLY","INNER","INSERT","INTERSECT",
                    "INTO","IS","ISNULL","JOIN","LEADING","LEFT","LIKE","LIMIT","LISTEN","LOAD","LOCAL","LOCK","MATCH","MINUS","NATURAL","NOT","NOTNULL","NULL","OFFSET",
                    "ON","ONLY","OR","ORDER","OUTER","OVER","OVERLAPS","PLACING","PRIMARY","REFERENCES","RETURNING","RIGHT","ROLLBACK","ROW","ROWS","SELECT","SESSION_USER",
                    "SET","TABLE","TABLESAMPLE","THEN","TO","TRAILING","TRANSACTION","TRIGGER","UNION","UNIQUE","USER","USING","VERBOSE","WHEN","WHERE","WITH","WITHOUT" ];
    let arr = [];
    let tab_lex = [];
    let concat = "";
    let op_log = ["AND","OR"];
    let op_symb = ["=","<>","!=",">=","<=",">","<"];

    for (var i = 0; i < tam; i++) {
    if(arrayDeCaracteres[i] != " ")
    {
        concat += arrayDeCaracteres[i];
    }
    else{
        arr.push(concat);
        concat = "";
    }
    }
    arr.push(concat);
    concat = "";
    let count = arr.length;
    let pib = 0;
    let esValido = true; 
    let count_res = 0;
    let count_tb = 0;
    let count_simbol = 0;
    let count_string = 0;
    let count_number = 0;
    let error = "" ;
    let mensaje = "ERROR: Se esperaba un: " ;
    let sw_cond = false;
    let regex;
    let delete_query = [false,false,false];
    let column = [false,false,false];
    /* valTabla
    1) cuenta con una comilla doble al inicio?
    2) cuenta con una letra al inicio?
    3) cuenta con una comilla al final?
    4) cuenta con ; al final?
    */
    let valTabla = [false,false,false,false];

    while(count > 0 && esValido )
    {
        switch (pib) {
        case 0:
            regex = /^DELETE$/;
            if(regex.test(arr[pib])){
                count_res++;
                tab_lex.push("id%DELETE%"+count_res);
                delete_query[pib] = true;
            }
            else
            {
                error = mensaje + "DELETE";
            }
            break;
        case 1:
            regex = /^FROM$/;
            if(regex.test(arr[pib])){ count_res++; tab_lex.push("id%FROM%"+count_res);delete_query[pib] = true;}
            else{error = mensaje + "FROM";}
            break;
        case 2:
            let arrChart = stringToArray(arr[pib]);
            concat = "";
            for (let i = 0; i < arrChart.length; i++) 
            {
                if(i == 0 && ( arrChart[i] == "\"" || arrChart[i] == "\'" ) )
                {
                    count_simbol++;
                    tab_lex.push(`AGRUP%${arrChart[0]}%${count_simbol}`);
                    if(arrChart[i] == "\""){valTabla[0] = true;}
                    else{error = `${mensaje} \"`;}
                }
                else
                {
                    regex = !valTabla[1] ? /^[a-zA-Z]$/ : /^[a-zA-Z0-9_]+$/ ;


                    if(!valTabla[1])
                    {
                        if( regex.test(arrChart[i]) )
                        {
                            valTabla[1] = true;
                            concat += arrChart[i];
                        }
                        else
                        {
                            error = `\nCaracteres invalidos en el nombre de la tabla -> ${arr[pib]}.`;
                        }
                    }
                    else if(!valTabla[3])
                    {
                        if( regex.test(arrChart[i]) && !valTabla[2] )
                        {
                            valTabla[1] = true;
                            concat += arrChart[i];
                        }
                        else if(arrChart[i] == ";") 
                        {
                            valTabla[3] = true;
                        }
                        else if(arrChart[i] == "\"")
                        {
                            valTabla[2] = true;
                        }
                        else
                        {
                            error += `\nCaracteres invalidos en el nombre de la tabla -> ${arr[pib]}.`;
                        }
                    }
                    else
                    {
                        error += `\nCaracteres invalidos en el nombre de la tabla -> ${arr[pib]}.`;
                    }
                }
            }

            if(concat != "")
            {
                count_tb++;
                tab_lex.push(`TABLE%${concat}%${count_tb}`);
                delete_query[2] = true;
                regex = /^\W$/ ;
                if(valTabla[2])
                {
                    count_simbol++;
                    tab_lex.push(`AGRUP%\"%${count_simbol}`);
                }
                if(valTabla[3])
                {
                    count_simbol++;
                    tab_lex.push(`LIM%;%${count_simbol}`);
                }
                error += st_rev.includes(arr[pib]) ? `\nCaracteres invalidos en el nombre de la tabla -> ${arr[pib]}.`: "" ;
            }

            error += valTabla[0] != valTabla[2] ? `${mensaje} \"` : "";

            break;
        case 3:
            if(esValido)
            {
                if(!valTabla[3])
                {
                    regex = /^WHERE$/;
                    esValido = regex.test(arr[pib]);
                    valTabla[3] = true;
                    if(esValido){
                        count_res++;
                        tab_lex.push("id%WHERE%"+count_res);
                        sw_cond = true;
                    }
                    else if(arr[pib] == ";")
                    {
                        count_res++;
                        tab_lex.push("DELIM%\;%"+count_res);
                    }
                    else{
                        error = "\n"+mensaje + "WHERE o un \";\" ";
                    }
                }
                else
                {

                }
            }
            break;
        default:
            if(esValido)
            {
                tam = arr[pib].length;
                
                if(tam == 1)
                {
                    regex = /^[a-zA-Z]$/;
                    esValido = regex.test(arr[pib]);
                    if(esValido)
                    {
                        if(!st_rev.includes(arr[pib]))
                        {
                            count_string++;
                            tab_lex.push(`str%${arr[pib]}%${count_string}`);
                        }
                        else
                        {
                            error = "\n"+mensaje + `<<string>>, NO la palabra reservada: ${arr[pib]} `;
                        }
                    }
                    else
                    {
                        error = "\n"+mensaje + `<<string>>`;
                    }
                }
                else
                {
                    concat = "";
                    arrayDeCaracteres = stringToArray(arr[pib]);
                    if(tam == 2)
                    {
                        regex = /^[a-zA-Z]$/;
                        esValido = regex.test(arrayDeCaracteres[0]);
                        if(esValido)
                        {
                            if(!st_rev.includes(arrayDeCaracteres[0]))
                            {
                                concat += arrayDeCaracteres[0]
                            }
                            else
                            {
                                error = "\n"+mensaje + `<<string>>, NO la palabra reservada: ${arrayDeCaracteres[0]} `;
                            }
                            
                            regex = /^[a-zA-Z]$/;
                            if(regex.test(arrayDeCaracteres[1]))
                            {
                                concat += arrayDeCaracteres[1]
                                count_string++;
                                column[0] = true;
                                tab_lex.push(`str%${concat}%${count_string}`);
                            }
                            else if(arrayDeCaracteres[1] === "=")
                            {
                                count_string++;
                                tab_lex.push(`str%${concat}%${count_string}`);
                                column[0] = true;
                                column[1] = true;
                                tab_lex.push(`ASIG%\=%${count_simbol}`);
                            }
                            else
                            {
                                 error = "\n"+mensaje + `=`;
                            }
                        }
                        else
                        {
                            //se soluciona realizando las 3 validaciones
                            error += !column[0] ? `\n ${mensaje} <<string>>`: ""; 
                            error += !column[1] ? `\n ${mensaje} =`: "";
                            error += !column[2] ? `\n ${mensaje} valor`: "";
                        }
                    }
                    else
                    {
                        
                    }
                }
            }
            break;
        }
        pib++;
        count--; 
    }

    if(sw_cond && arr.length <= 4 )
    {
        errores = "Se esperaba al menos una condición despues del WHERE ";   
    }

    error += !delete_query[1] ? `\n ${mensaje} FROM `: "";
    error += delete_query[1] && !delete_query[2] ? `\n ${mensaje} un nombre de una tabla.`: "";

    if(error != ""){
        errores = `⚠️ \n ${error}`;
    }
    else
    {
        errores = ``;
    }

    return tab_lex;


    //console.log("--------------TABLA------------\n");
    //console.log(tab_lex);

    
    //console.log("\n--------------CONTADORES------------\n");
    //console.log("id:"+count_res);
    //console.log("TABLE:"+count_tb);
    //console.log("sym:"+count_simbol);
    //console.log("str:"+count_string);
    //console.log("int:"+count_number);

    //console.log(column)

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