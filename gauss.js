let inputField = document.querySelector("#input");
let outputField = document.querySelector("#output");
let eliminateButton = document.querySelector("#eliminate");
let head = document.querySelector("#head");
let copyicon = document.querySelector("#copyicon");
let latexoutput = document.querySelector("#latexoutput");

let queryString = window.location.search;

let buttonQuotes = ["ELIMINATING!", "CHOOSING HIGHLANDER!", "MURDERING ROWS!"];
let outputQuotes = [
  "Eliminating...",
  "Choosing highlander...",
  "Murderings rows...",
];

console.log(document.location);

function Christmas() {
  let date = new Date();

  if (date.getDate() >= 17 && date.getMonth() == 11) {
    console.log("Merry Christmas!");
    eliminateButton.textContent = "MERRY CHRISTMAS!";
    if (date.getDate() == 31) {
      console.log("And a happy new year!");
      eliminateButton.textContent = "HAPPY NEW YEAR!";
    }
  }
}

Christmas();

function renderOutput() {
  while (latexoutput.firstChild) {
    latexoutput.removeChild(latexoutput.firstChild);
  }

  katex.render(`${outputField.value}`, latexoutput, {
    throwOnError: false,
    displayMode: true,
  });
}

LoadInput();

if (queryString.length > 1) {
  queryString = queryString.substring(1);
  loadQuery(queryString);
}

function loadQuery(query) {
  let l = query.split(";");
  let output = "";
  for (let i = 0; i < l.length; i++) {
    output += l[i].split("&").join(" ");
    if (i != l.length - 1) output += "\n";
  }

  inputField.value = output;
}

function getQuery() {
  let output = "";
  let inputSplit = inputField.value.split("\n");

  for (let i = 0; i < inputSplit.length; i++) {
    let line = inputSplit[i];

    line = line.replaceAll(" ", "&");
    output += line;
    if (i != inputSplit.length - 1) output += ";";
  }

  return output;
}

copyicon.addEventListener("click", () => {
  try {
    navigator.clipboard.writeText(result);
  } catch (e) {
    //console.error("Could not copy to clipboard");
  }
});

rows = [
  [1, 1, 1, 0],
  [1, 0, 6, 1],
  [1, -1, 5, 1],
  [2, 1, 7, 1],
];

let operations = [];

let startResult = "\\begin{align*}  \n & ";
let result = startResult;

let lineIndex = 0;

let calculating = false;

let evaluateOutput = false;

let standardOptions = {
  divideVariables: true,
  matrixOpen: " \\left[ ",
  matrixClose: " \\right] ",
  printLink: true,
  spacing: "6pt",
  switch: false,
  inverse: false,
  equalSign: "\\sim",
  steps: true,
  plain: false,
  help: false,
  resultOnly: false,
};

let options = { ...standardOptions };

let arrayStructure = "";

function StartElimination() {
  if (calculating) return;
  calculating = true;
  eliminateButton.classList.toggle("calculating");
  head.classList.toggle("active");
  let r = Math.floor(Math.random() * buttonQuotes.length);
  eliminateButton.textContent = buttonQuotes[r];
  outputField.value = outputQuotes[r];
  return new Promise((res, rej) => {
    setTimeout(() => {
      Eliminate();
      res();
    }, 100);
  }).then(() => {
    calculating = false;
    eliminateButton.classList.toggle("calculating");
    eliminateButton.textContent = "ELIMINATE!";
    Christmas();
    head.classList.toggle("active");
  });
}

eliminateButton.addEventListener("click", StartElimination);

addEventListener("keypress", async (e) => {
  if (e.ctrlKey && e.code == "Enter") StartElimination();
  if (e.shiftKey && e.code == "Enter") {
    evaluateOutput = true;
    await StartElimination();
    evaluateOutput = false;
  }
});

Eliminate();

function Eliminate() {
  try {
    Main();
  } catch (e) {
    //console.error(e);
  }
}

function help() {
  options.help = true;
  outputField.value = availableOptionsText;
}

function ParseInput() {
  arrayStructure = "";
  options = { ...standardOptions };
  rows = [];

  let lines = inputField.value.split("\n");

  for (let i = lines.length - 1; i > -1; i--) {
    if (lines[i] == "") lines.splice(i, 1);
  }

  if (
    lines.length > 0 &&
    lines[lines.length - 1].toLowerCase().startsWith("opt")
  ) {
    let optionInput = lines[lines.length - 1].split(" ");
    lines.splice(lines.length - 1, 1);

    if (optionInput.length == 1 && lines.length == 0) {
      help();
      return;
    }

    for (let i = 1; i < optionInput.length; i++) {
      let option = optionInput[i];

      if (option.toLowerCase() == "nonzero") options.divideVariables = true;
      if (option.toLowerCase() == "zero") options.divideVariables = false;

      if (option == "bmatrix") {
        options.matrixOpen = "\\left[";
        options.matrixClose = "\\right]";
      }
      if (option == "Bmatrix") {
        options.matrixOpen = "\\left\\{";
        options.matrixClose = "\\right\\}";
      }
      if (option == "vmatrix") {
        options.matrixOpen = "\\left|";
        options.matrixClose = "\\right|";
      }
      if (option == "Vmatrix") {
        options.matrixOpen = "\\left|\\left|";
        options.matrixClose = "\\right|\\right|";
      }
      if (option == "matrix") {
        options.matrixOpen = "";
        options.matrixClose = "";
      }
      if (option == "pmatrix") {
        options.matrixOpen = "\\left(";
        options.matrixClose = "\\right)";
      }

      if (option.toLowerCase() == "switch") options.switch = true;
      if (option.toLowerCase() == "noswitch") options.switch = false;

      if (option.toLowerCase() == "link") options.printLink = true;
      if (option.toLowerCase() == "nolink") options.printLink = false;

      if (option.toLowerCase() == "nosteps") options.steps = false;
      if (option.toLowerCase() == "steps") options.steps = true;

      if (option.toLowerCase() == "plain") options.plain = true;
      if (option.toLowerCase() == "result") {
        options.resultOnly = true;
        options.steps = false;
      }

      if (option.toLowerCase() == "help") {
        help();
        return;
      }

      if (option.toLowerCase().startsWith("vspace")) {
        options.spacing = option.split("=")[1];
      }

      if (option.toLowerCase().startsWith("equal")) {
        options.equalSign = option.split("=")[1];
      }

      if (option.toLowerCase() == "inverse") options.inverse = true;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let split = lines[i].split(" ");
    let columns = [];
    for (let j = 0; j < split.length; j++) {
      if (split[j] == "help") {
        help();
        return;
      }
      if (split[j] == "") continue;
      if (split[j] == "|") {
        if (i == 0) arrayStructure += "|";
        continue;
      } else {
        if (i == 0) arrayStructure += "c";
        columns.push(split[j]);
      }
    }

    rows[i] = columns;
  }

  if (options.inverse) {
    let longestRow = -1;

    for (let row = 0; row < rows.length; row++) {
      if (rows[row].length > longestRow) longestRow = rows[row].length;
      let rowLength = rows[row].length;
      for (let column = 0; column < rowLength; column++) {
        rows[row].push(row == column ? "1" : "0");
      }
    }

    for (let i = 0; i < longestRow; i++) {
      arrayStructure += "c";
    }
  }
}

function Main() {
  //GetLines();
  result = startResult;
  ParseInput();
  SaveInput();

  // console.log(rows);

  operations = [];
  fillOperations();

  if (options.help == false) {
    if (options.resultOnly == false) SaveStatus();
    if (options.plain == false) {
      Gauss();
      CompleteOperations(true);
      if (options.steps == false) SaveStatus(options.resultOnly == false);
    }

    let link = document.location.host + document.location.pathname;
    link = link.substring(0, link.length - 1);

    if (link != "gauss.notrasmus.com") link = "gauss.notrasmus.com " + link;

    result +=
      "\n\\end{align*}" +
      "%" +
      link +
      (options.printLink ? `/?` + getQuery() : "") +
      (evaluateOutput ? " . Numerical evaluation, might not be exact." : "");

    outputField.value = result;
    //console.log(result);
  }

  try {
    renderOutput();
  } catch (e) {}

  // try {
  //   navigator.clipboard.writeText(result);
  // } catch (e) {
  //   //console.error("Could not copy to clipboard");
  // }
}

function Gauss() {
  let column = 0;

  for (let row = 0; row < rows.length; row++) {
    if (column >= rows[0].length) break;

    let candidate = -1;
    let numValue = math.Infinity;
    let potential = null;

    for (let j = row; j < rows.length; j++) {
      let check = rows[j][column];
      let isCandidate;
      try {
        isCandidate =
          math.evaluate("abs(" + check + ") < " + numValue) &&
          !math.evaluate(check + " == 0");
        numValue = isCandidate ? math.evaluate("abs(" + check + ")") : numValue;
      } catch (e) {
        isCandidate = false;
        // isCandidate = 1 < numValue;
        // numValue = isCandidate ? 1 : numValue;
        potential = j;
      }

      if (isCandidate) {
        candidate = j;
      }
    }

    if (candidate == -1) {
      if (potential != null && options.divideVariables) {
        candidate = potential;
      } else {
        column++;
        row--;
        continue;
      }
    }

    SwapRows(row, candidate);
    candidate = row;
    CompleteOperations();

    let lead = rows[candidate][column];
    let inverse = math.simplify("1/(" + lead + ")");

    multiplyRow(candidate, inverse);
    CompleteOperations();

    for (let j = 0; j < rows.length; j++) {
      if (j == candidate) continue;
      if (rows[j][column] != 0) {
        addRow(j, candidate, math.simplify("-1*(" + rows[j][column] + ")"));
      }
    }
    CompleteOperations();

    column++;
  }
}

function SwapRows(a, b) {
  if (a == b) return;
  let temp = rows[a];
  rows[a] = rows[b];
  rows[b] = temp;

  if (options.steps == false) return;

  operations[a] += options.switch
    ? "R_{" + (a + 1) + "}\\leftrightarrow R_{" + (b + 1) + "}"
    : "=R_{" + (b + 1) + "}";
  operations[b] += options.switch
    ? "R_{" + (b + 1) + "}\\leftrightarrow R_{" + (a + 1) + "}"
    : "=R_{" + (a + 1) + "}";
}

function createOperation(op) {
  let operation = [];
  for (let row = 0; row < rows.length; row++) {
    operation[row] = op[row];
  }

  return operation;
}

function multiplyRow(index, scalar) {
  try {
    if (math.evaluate(scalar + "== 0") || math.evaluate(scalar + "== 1"))
      return;
  } catch (e) {}

  for (let i = 0; i < rows[index].length; i++) {
    rows[index][i] = math.simplify("(" + scalar + ")*(" + rows[index][i] + ")");
  }

  let para;
  try {
    para = math.evaluate(scalar + " < 0");
  } catch (e) {
    para = false;
  }

  if (options.steps == false) return;

  operations[index] +=
    " \\cdot " +
    (para ? "\\left(" : "") +
    math.simplify(scalar + "").toTex() +
    (para ? "\\right)" : "");
}

function addRow(addTo, addFrom, addFromScalar) {
  try {
    if (math.evaluate(addFromScalar + " == 0")) return;
  } catch (e) {}

  for (let i = 0; i < rows[addTo].length; i++) {
    let expression =
      "(" +
      rows[addTo][i] +
      ") + (" +
      addFromScalar +
      ") * (" +
      rows[addFrom][i] +
      ")";

    rows[addTo][i] = math.simplify(
      math.simplify(
        expression,
        [],
        {},
        {
          context: math.simplify.realContext,
          exactFractions: true,
        }
      )
    );
  }

  let lessThanZero;

  try {
    lessThanZero = math.evaluate(addFromScalar + " < 1");
  } catch (e) {
    lessThanZero = false;
  }

  let numericOne;

  let complex = false;

  try {
    complex = math.evaluate("im(" + addFromScalar + ") != 0");
  } catch (e) {}

  try {
    numericOne = math.evaluate("abs(" + addFromScalar + ") == 1") && !complex;
    console.log(numericOne);
  } catch (e) {
    numericOne = false;
  }

  let cantEvaluate = false;

  try {
    math.evaluate("" + addFromScalar);
  } catch (e) {
    cantEvaluate = true;
  }

  if (options.steps == false) return;

  operations[addTo] +=
    (lessThanZero ? "-" : "+") +
    (!numericOne && !cantEvaluate
      ? (complex
          ? "(" + math.simplify("" + addFromScalar).toTex() + ")"
          : math.simplify("abs(" + addFromScalar + ")").toTex()) + "\\cdot "
      : "") +
    (cantEvaluate
      ? "(" + math.simplify(addFromScalar).toTex() + ") \\cdot "
      : "") +
    "R_{" +
    (addFrom + 1) +
    "}";
}

function StringifyOperation(matrix) {
  let result = " \\begin{array}{c} ";

  for (let row = 0; row < matrix.length; row++) {
    result += matrix[row];
    if (row < matrix.length - 1) result += " \\\\[6pt]";
  }

  result += " \\end{array}";

  return result;
}

function StringifyMatrix(matrix) {
  let result = ` ${options.matrixOpen}\\begin{array}{${arrayStructure}} `;

  for (let row = 0; row < matrix.length; row++) {
    for (let column = 0; column < matrix[row].length; column++) {
      if (column != 0) result += " & ";
      let value = math.simplify(matrix[row][column]);

      try {
        if (!evaluateOutput) throw new Error("Evaluation off");
        result += math.evaluate(value.toString());
      } catch (e) {
        result += value.toTex();
        // console.error(e);
      }
    }

    if (row < matrix.length - 1) result += " \\\\[6pt]";
  }

  result += ` \\end{array}${options.matrixClose}`;

  return result;
}

function SaveStatus(inbetween = false) {
  if (inbetween) result += `\\\\[${options.spacing}] \n ${options.equalSign} &`;
  result += StringifyMatrix(rows);
}

function CompleteOperations() {
  if (!isNewOperations()) return;
  result += "\\!\\!\\! " + StringifyOperation(createOperation(operations));
  fillOperations();
  SaveStatus(true);
}

function fillOperations() {
  for (let row = 0; row < rows.length; row++) {
    operations[row] = "\\;";
  }
}

function isNewOperations() {
  for (let row = 0; row < rows.length; row++) {
    if (operations[row] != "\\;") return true;
  }

  return false;
}

function SaveInput() {
  let toSave = JSON.stringify({ input: inputField.value });
  try {
    setCookie("savedinput", toSave, 30);
  } catch (e) {
    //console.error("Could not set cookie");
  }
}

function LoadInput() {
  let cookieInput = null;
  try {
    cookieInput = JSON.parse(getCookie("savedinput"));
  } catch (e) {
    //console.error("Could not load cookie");
  }

  if (cookieInput) inputField.value = cookieInput.input;
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Initialising the canvas
var canvas = document.querySelector("canvas"),
  ctx = canvas.getContext("2d");

// Setting the width and height of the canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Setting up the letters
var letters = "RASMUS";
letters = letters.split("");

// Setting up the columns
var fontSize = 10,
  columns = canvas.width / fontSize;

// Setting up the drops
var drops = [];
for (var i = 0; i < columns; i++) {
  drops[i] = 1;
}

// Setting up the draw function
function draw() {
  ctx.fillStyle = "rgba(0, 0, 0, .1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < drops.length; i++) {
    var text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillStyle = "#0f0";

    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    drops[i]++;
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
      drops[i] = 0;
    }
  }
}

// Loop the animation
setInterval(draw, 33);

let availableOptionsText = `
\\text{To use advanced options, type opt on the last line of your input} 
\\\\
\\text{followed by the options you want (seperated with spaces)}
\\\\
\\text{Like this:}
\\\\\\\\
\\begin{array}{c} \\text{1 2 3} \\\\[6pt]\\text{4 5 6} \\\\[6pt] \\text{opt inverse switch pmatrix} \\end{array}
\\\\\\\\
\\text{Available Options:}
\\\\\\\\
\\begin{align*}  
\\begin{array}{|c|c|c|c|}  
\\hline
\\text{Option} & \\text{Description} & \\text{Example Usage} & \\text{How it looks} \\\\\\hline\\\\
\\text{|} & \\text{Adds vertical line to matrix (must be on first row!)} & \\begin{array}{c} \\text{1 | 2} \\\\ \\text{3 4} \\end{array} & \\left[ \\begin{array}{c|c} 1 & 2 \\\\[6pt]3 & 4 \\end{array} \\right] \\\\\\hline\\\\
\\text{bmatrix} & \\text{Uses square brackets for matrices (default)} & \\text{opt bmatrix} & \\left[\\begin{array}{cc} 1 & 2 \\\\[6pt]3 & 4 \\end{array}\\right] \\\\\\hline\\\\
\\text{Bmatrix} & \\text{Uses square brackets for matrices} & \\text{opt Bmatrix} & \\left\\{\\begin{array}{cc} 1 & 2 \\\\[6pt]3 & 4 \\end{array}\\right\\} \\\\\\hline\\\\
\\text{pmatrix} & \\text{Uses normal brackets for matrices} & \\text{opt pmatrix} & \\left(\\begin{array}{cc} 1 & 2 \\\\[6pt]3 & 4 \\end{array}\\right) \\\\\\hline\\\\
\\text{vmatrix} & \\text{Uses line brackets for matrices} & \\text{opt vmatrix} & \\left|\\begin{array}{cc} 1 & 2 \\\\[6pt]3 & 4 \\end{array}\\right| \\\\\\hline\\\\
\\text{Vmatrix} & \\text{Uses line brackets for matrices} & \\text{opt Vmatrix} & \\left|\\left|\\begin{array}{cc} 1 & 2 \\\\[6pt]3 & 4 \\end{array}\\right|\\right| \\\\\\hline\\\\
\\text{matrix} & \\text{Uses no brackets for matrices} & \\text{opt matrix} & \\begin{array}{cc} 1 & 2 \\\\[6pt]3 & 4 \\end{array} \\\\\\hline\\\\
\\text{noswitch} & \\text{Uses equal signs for switching rows (default)} & \\text{opt noswitch} & \\begin{array}{c} \\;=R_{2} \\\\[6pt]\\;=R_{1} \\end{array} \\\\\\hline\\\\
\\text{switch} & \\text{Uses arrows for switching rows} & \\text{opt switch} & \\begin{array}{c} \\;R_{1}\\leftrightarrow R_{2} \\\\[6pt]\\;R_{2}\\leftrightarrow R_{1} \\end{array} \\\\\\hline\\\\
\\text{equal} & \\text{Sets equal sign between matrices} & \\text{opt equal=}\\backslash \\text{to} & \\to \\left[ \\begin{array}{cc} 1 & 2 \\\\[6pt]3 & 2 \\end{array} \\right] \\\\\\hline\\\\
\\text{zero} & \\text{Disables division with variables} & \\text{opt zero} & \\text{N/A} \\\\\\hline\\\\
\\text{nonzero} & \\text{Enables division with variables (default)} & \\text{opt nonzero} & \\text{N/A} \\\\\\hline\\\\
\\text{vspace} & \\text{Add specified spaces between lines} & \\text{opt vspace=6pt} & \\text{N/A} \\\\\\hline\\\\
\\text{inverse} & \\text{Adds identity matrix to input, to calculate inverse} & \\text{opt inverse} & \\text{N/A} \\\\\\hline\\\\
\\text{nosteps} & \\text{Hides steps and just shows start and result} & \\text{opt nosteps} & \\text{N/A} \\\\\\hline\\\\
\\text{steps} & \\text{Shows steps (default)} & \\text{opt steps} & \\text{N/A} \\\\\\hline\\\\
\\text{plain} & \\text{Just shows input and does not calculate anything} & \\text{opt plain} & \\text{N/A} \\\\\\hline\\\\
\\text{result} & \\text{Just shows result} & \\text{opt result} & \\text{N/A} \\\\\\hline
\\end{array}
\\end{align*}%gauss.notrasmus.com/?opt
`;
