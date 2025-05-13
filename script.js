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
      lexicoResultado.textContent = "⚠️ No hay datos para analizar.";
    } else {
      let arr = analizador(texto);       
      if(arr.length > 0)
      {
        let tabla = [];

        lexicoResultado.textContent = `${tabla}`; 
        for (let i = 0; i < arr.length; i++) 
        {
            tabla += `${arr[i]}\n`; 
        }
        lexicoResultado.innerHTML = "";
        lexicoResultado.textContent = `${tabla}`; 
      }
      consolaResultado.innerHTML = "";
      consolaResultado.textContent = errores; 
    }
  });

  btnLimpiar.addEventListener("click", () => {
    textarea.value = "";
    lexicoResultado.textContent = "";
  });
});

function stringToArray(texto) {
    return texto.split('');
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
    let column = [false,false,false];

    while(count > 0 && esValido )
    {
        switch (pib) {
        case 0:
            regex = /^DELETE$/;
            esValido = regex.test(arr[pib]);
            if(esValido){
                count_res++;
                tab_lex.push("\(id,DELETE\)");
            }
            else
            {
                error = mensaje + "DELETE";
            }
            break;
        case 1:
            regex = /^FROM$/;
            esValido = regex.test(arr[pib]);
            if(esValido){ count_res++; tab_lex.push("\(id,FROM\)");}
            else{error = mensaje + "FROM";}
            break;
        case 2:
            esValido = st_rev.includes(arr[pib]);
            concat = "";
            if(!esValido){
                if(arr[pib].length == 1)
                { 
                    regex = /^[a-zA-Z]$/;
                    esValido = regex.test(arr[pib]);
                    if(esValido)
                    {
                        count_tb++;
                        tab_lex.push(`\(str,${arr[pib]}\)`);
                    }
                    else
                    {
                        error = mensaje + "<<string>>";
                    }
                }
                else if (arr[pib].length == 2)
                {
                    regex = /^[a-zA-Z]+[a-zA-Z0-9_]$/;
                    esValido = regex.test(arr[pib]);
                    if(esValido)
                    {
                        count_tb++;
                        tab_lex.push(`\(str,${arr[pib]}\)`);
                    }
                    else
                    {
                        error = mensaje + "<<string>>";
                    }
                }
                else
                {
                    arrayDeCaracteres = stringToArray(arr[pib]);
                    let sym = false;
                    tam = arrayDeCaracteres.length - 1;
                    for (var i = 0; i < arrayDeCaracteres.length; i++) 
                    {
                        if( i == 0 && arrayDeCaracteres[i] == "\"" || arrayDeCaracteres[i] == "\'")
                        {
                            if(arrayDeCaracteres[i] == "\'")
                            {
                                esValido = false;
                                error = mensaje + `"`;
                            }
                            else
                            {
                                count_simbol++;
                                tab_lex.push(`\(AGRUP,${arrayDeCaracteres[0]}\)`);
                                sym = true;   
                            }

                        }
                        else if(i != tam)
                        {
                            regex = i == 1 ? /^[a-zA-Z]$/ : /^[a-zA-Z0-9_]+$/ ;
                            esValido = regex.test(arrayDeCaracteres[i]);
                            
                            if(esValido)
                            {
                                concat += arrayDeCaracteres[i];
                            }
                        }
                        
                        if(i == tam)
                        {
                            if(esValido)
                            {
                                count_tb++;
                                tab_lex.push(`\(TABLE,${concat}\)`);
                                regex = /^\W$/ ;
                                esValido = regex.test(arrayDeCaracteres[i]);
                            }
                            
                            if(sym)
                            {
                                if(arrayDeCaracteres[tam] == arrayDeCaracteres[0] && esValido)
                                {
                                    count_simbol++;
                                    tab_lex.push(`\(AGRUP,${arrayDeCaracteres[i]}\)`);
                                }
                                else
                                {
                                    esValido = false;
                                    error = mensaje + `${arrayDeCaracteres[0]}`;
                                }
                            }   
                            else if(regex.test(arrayDeCaracteres[i]))
                            {
                                error = mensaje + `" en ${arr[pib]}`;
                                esValido = false;
                            }
                        }
                    }
                }
            }
            else
            {
                error = mensaje + `<<string>>, NO la palabra reservada: ${arr[pib]} `;
            }
            break;
        case 3:
            if(esValido)
            {
                regex = /^WHERE$/;
                esValido = regex.test(arr[pib]);
                if(esValido){
                    count_res++;
                    tab_lex.push("\(id,WHERE\)");
                    sw_cond = true;
                }
                else if(arr[pib] == ";")
                {
                    count_res++;
                    tab_lex.push("\(DELIM,\";\"\)");
                }
                else{
                    error = mensaje + "WHERE o un \";\" ";
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
                            tab_lex.push(`\(str,${arr[pib]}\)`);
                        }
                        else
                        {
                            error = mensaje + `<<string>>, NO la palabra reservada: ${arr[pib]} `;
                        }
                    }
                    else
                    {
                        error = mensaje + `<<string>>`;
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
                                error = mensaje + `<<string>>, NO la palabra reservada: ${arrayDeCaracteres[0]} `;
                            }
                            
                            regex = /^[a-zA-Z]$/;
                            if(regex.test(arrayDeCaracteres[1]))
                            {
                                concat += arrayDeCaracteres[1]
                                count_string++;
                                column[0] = true;
                                tab_lex.push(`\(str,${concat}\)`);
                            }
                            else if(arrayDeCaracteres[1] === "=")
                            {
                                count_string++;
                                tab_lex.push(`\(str,${concat}\)`);
                                column[0] = true;
                                column[1] = true;
                                tab_lex.push(`\(ASIG,\=\)`);
                            }
                            else
                            {
                                 error = mensaje + `=`;
                            }
                        }
                        else
                        {
                            //se soluciona realizando las 3 validaciones
                            error = !column[0] ? mensaje + "<<string>>": ""; 
                            error = !column[1] ? mensaje + `=`: "";
                            error = !column[2] ? mensaje + `valor`: "";
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

    if(error != ""){
        errores = `⚠️ \n ${error}`;
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