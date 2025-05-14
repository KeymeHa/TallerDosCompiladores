
%lex
%%

\s+                    /* skip whitespace */
"DELETE"               return 'DELETE';
"FROM"                 return 'FROM';
"WHERE"                return 'WHERE';
"AND"                  return 'AND';
"OR"                   return 'OR';
"="                    return '=';
"<>"                   return 'NEQ';
";"                    return ';';
[0-9]+                 return 'NUMBER';
["'][a-zA-Z_0-9]+["']  return 'STRING';
[a-zA-Z_][a-zA-Z_0-9]* return 'IDENTIFIER';
<<EOF>>                return 'EOF';
.                      return 'INVALID';

/lex

%start input

%%

input
    : statement EOF
    ;

statement
    : DELETE FROM table where_clause_opt ';'
    ;

table
    : IDENTIFIER
    ;

where_clause_opt
    : /* empty */
    | WHERE conditions
    ;

conditions
    : condition
    | condition AND conditions
    | condition OR conditions
    ;

condition
    : IDENTIFIER '=' value
    | IDENTIFIER NEQ value
    ;

value
    : NUMBER
    | STRING
    ;
