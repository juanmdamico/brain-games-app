export const WORDS = [
    "ACTOR", "AGUAS", "AGUDO", "ALMAS", "ALTOS", "AMIGO", "AMPLA", "ANDAR", "ANGEL", "ANIMO", 
    "ANTES", "APOYO", "ARBOL", "ARMAS", "ASTRO", "ATRAS", "AUTOR", "AVISO", "AZUL", "BAJAR", 
    "BALON", "BANCO", "BARCO", "BASES", "BEBER", "BELLO", "BESOS", "BRAZO", "BUENO", "BUSCA", 
    "CAJON", "CALMA", "CAMPO", "CANTO", "CAPAZ", "CARNE", "CARTA", "CASAS", "CAUSA", "CENAR", 
    "CERCA", "CESTA", "CHICA", "CHICO", "CICLO", "CIEGO", "CIELO", "CINCO", "CINTA", "CITAS", 
    "CLARA", "CLARO", "CLASE", "CLIMA", "COCHE", "COGER", "COLOR", "COMER", "COMUN", "CORTO", 
    "COSAS", "COSTA", "CREER", "CRUDA", "CUEVA", "CULPA", "CURSO", "DADOS", "DANZA", "DATOS", 
    "DEBER", "DEDOS", "DEJAR", "DENSA", "DESDE", "DIETA", "DISCO", "DOBLE", "DOLOR", "DONDE",
    "DULCE", "DUROS", "ELLOS", "ENTRE", "ERROR", "ESTAR", "ESTOS", "EXITO", "EXTRA", "FALSO", 
    "FALTA", "FAVOR", "FELIZ", "FINAL", "FIRME", "FLACA", "FLOR",  "FONDO", "FORMA", "FRASE", 
    "FUEGO", "FUERA", "GANAR", "GENTE", "GOLPE", "GRADO", "GRITO", "GRUPO", "HABER", "HABIL", 
    "HACER", "HASTA", "HECHO", "HEROE", "HIJOS", "HOGAR", "HORAS", "HUESO", "HUEVO", "HUMOR", 
    "IDEAS", "IGUAL", "JOVEN", "JUEGO", "JUSTO", "LABIO", "LADOS", "LARGO", "LECHE", "LENTO", 
    "LETRA", "LIBRE", "LIBRO", "LIDER", "LINEA", "LISTO", "LOCAL", "LUGAR", "LUNES", "MADRE",
    "MALOS", "MANOS", "MARCA", "MASAS", "MAYOR", "MEDIO", "MEJOR", "MENOR", "MENOS", "MENTE", 
    "MESES", "METAL", "METAS", "MIEDO", "MILES", "MISMO", "MITAD", "MODO", "MORIR", "MOVER", 
    "MUCHO", "MUJER", "MUNDO", "NACER", "NADIE", "NARIZ", "NEGRO", "NIVEL", "NOCHE", "NORTE", 
    "NOTAS", "NUEVO", "NUNCA", "OBRAS", "OCHO", "PADRE", "PAGAR", "PALOS", "PAPEL", "PARAR", 
    "PARED", "PARTE", "PASAR", "PASOS", "PAUSA", "PECHO", "PEDIR", "PELOS", "PENAS", "PERRO", 
    "PESAR", "PESOS", "PIANO", "PIEZA", "PISTA", "PLACA", "PLANO", "PLATA", "PLAYA", "PLAZA", 
    "PODER", "POETA", "POLVO", "PONER", "PUNTO", "REGLA", "RELOJ", "RESTO", "RITMO", "ROBAR", 
    "ROCAS", "RUBIO", "RUIDO", "SABER", "SABOR", "SACAR", "SALIR", "SALTO", "SALUD", "SANTO", 
    "SECOS", "SELLO", "SEÑOR", "SERIO", "SIGLO", "SILLA", "SITIO", "SOBRE", "SUCIO", "SUELO", 
    "SUEÑO", "SUPER", "TABLA", "TARDE", "TAREA", "TEMAS", "TENER", "TEXTO", "TIRAR", "TOCAR", 
    "TOMAR", "TONTO", "TOTAL", "TRAER", "TRAGO", "TRAJE", "TRATO", "VALOR", "VASOS", "VECES", 
    "VELOZ", "VENIR", "VERBO", "VERDE", "VIAJE", "VIDAS", "VIEJO", "VISTA", "VOCES", "VOLAR", 
    "VUELO", "ZONAS"
];

export const getRandomWord = () => {
    // Filter only 5 letter words just in case
    const validWords = WORDS.filter(w => w.length === 5);
    return validWords[Math.floor(Math.random() * validWords.length)];
};

export const checkGuess = (guess, solution) => {
    const result = Array(5).fill('absent');
    const solutionChars = solution.split('');
    const guessChars = guess.split('');

    // Check for correct letters in correct positions (green)
    guessChars.forEach((char, i) => {
        if (char === solutionChars[i]) {
            result[i] = 'correct';
            solutionChars[i] = null; // mark as used
        }
    });

    // Check for correct letters in wrong positions (yellow)
    guessChars.forEach((char, i) => {
        if (result[i] === 'absent' && solutionChars.includes(char)) {
            result[i] = 'present';
            solutionChars[solutionChars.indexOf(char)] = null; // mark as used
        }
    });

    return result;
};
