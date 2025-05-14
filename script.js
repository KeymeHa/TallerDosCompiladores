
const baseDeDatos = {
    empleados: ["id", "nombre", "edad", "salario"],
    productos: ["codigo", "nombre", "precio"]
};


function analizadorLexico(texto) {
    const tokens = texto.match(/\w+|=|;|>/g);
    return tokens || [];
}


function analizadorSintactico(tokens) {
    if (tokens.length < 7) return false;
    return tokens[0].toUpperCase() === "DELETE" &&
        tokens[1].toUpperCase() === "FROM" &&
        tokens[3].toUpperCase() === "WHERE" &&
        tokens[5] === "=";
}


function analizadorSemantico(estructura) {
    const errores = [];

    const tabla = estructura.tabla.toLowerCase();
    const columna = estructura.columna.toLowerCase();

    if (!baseDeDatos.hasOwnProperty(tabla)) {
        errores.push(`Error semántico: la tabla '${tabla}' no existe.`);
    } else {
        if (!baseDeDatos[tabla].includes(columna)) {
            errores.push(`Error semántico: la columna '${columna}' no existe en la tabla '${tabla}'.`);
        }
    }

    return errores;
}


document.getElementById("btnAnalizar").addEventListener("click", () => {
    const entrada = document.getElementById("entrada").value.trim();
    const tokens = analizadorLexico(entrada);

    document.getElementById("lexico").innerText = tokens.join(" | ");
    document.getElementById("sintactico").innerText = "";
    document.getElementById("consola").innerText = "";

    if (!analizadorSintactico(tokens)) {
        document.getElementById("sintactico").innerText = "Error sintáctico en la sentencia.";
        document.getElementById("consola").innerText = "Sentencia inválida.";
        return;
    }

    const estructura = {
        tabla: tokens[2],
        columna: tokens[4]
    };

    const erroresSemanticos = analizadorSemantico(estructura);

    if (erroresSemanticos.length > 0) {
        document.getElementById("sintactico").innerText = erroresSemanticos.join("\n");
        document.getElementById("consola").innerText = "Sentencia inválida por errores semánticos.";
    } else {
        document.getElementById("sintactico").innerText = "Sentencia sintáctica válida.";
        document.getElementById("consola").innerText = "Sentencia válida. Sin errores léxicos, sintácticos ni semánticos.";
    }
});


document.getElementById("btnLimpiar").addEventListener("click", () => {
    document.getElementById("entrada").value = "";
    document.getElementById("lexico").innerText = "";
    document.getElementById("sintactico").innerText = "";
    document.getElementById("consola").innerText = "Consola";
});
