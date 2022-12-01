let inputField = document.querySelector("#input");
let outputField = document.querySelector("#output");
let eliminateButton = document.querySelector("#eliminate");
let head = document.querySelector("#head");
let copyicon = document.querySelector("#copyicon");

copyicon.addEventListener("click", () => {
  navigator.clipboard.writeText(result);
});

rows = [
  [1, 1, 1, 0],
  [1, 0, 6, 1],
  [1, -1, 5, 1],
  [2, 1, 7, 1],
];

let operations = [];

let result = "\\begin{align*} \n &";

let lineIndex = 0;

let calculating = false;

let evaluateOutput = false;

function StartElimination() {
  if (calculating) return;
  calculating = true;
  eliminateButton.classList.toggle("calculating");
  head.classList.toggle("active");
  eliminateButton.textContent = "ELIMINATING!";
  outputField.value = "Eliminating...";
  return new Promise((res, rej) => {
    setTimeout(() => {
      Eliminate();
      res();
    }, 100);
  }).then(() => {
    calculating = false;
    eliminateButton.classList.toggle("calculating");
    eliminateButton.textContent = "ELIMINATE!";
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

LoadInput();

Eliminate();

function Eliminate() {
  try {
    Main();
  } catch (e) {
    console.log(e);
  }
}

function ParseInput() {
  rows = [];

  let lines = inputField.value.split("\n");

  for (let i = lines.length - 1; i > -1; i--) {
    if (lines[i] == "") lines.splice(i, 1);
  }

  for (let i = 0; i < lines.length; i++) {
    let split = lines[i].split(" ");
    let columns = [];
    for (let j = 0; j < split.length; j++) {
      if (split[j] == "") continue;
      columns.push(split[j]);
    }

    rows[i] = columns;
  }
}

function Main() {
  //GetLines();
  result = "\\begin{align*} \n &";
  ParseInput();
  SaveInput();

  console.log(rows);

  operations = [];
  fillOperations();

  SaveStatus();
  Gauss();
  CompleteOperations();

  result +=
    "\n\\end{align*}" +
    "%gauss.notrasmus.com" +
    (evaluateOutput ? ". Numerical evaluation, might not be exact." : "");

  outputField.value = result;
  console.log(result);

  navigator.clipboard.writeText(result);

  //   Console.WriteLine("Copy the following into a begin align block in LaTeX:");
  //   Console.WriteLine(result);
  //   Console.WriteLine("");
  //   Console.WriteLine("Press Any Key to exit");
  //   Console.ReadLine();
}

function Gauss() {
  let column = 0;

  for (let row = 0; row < rows.length; row++) {
    if (column >= rows[0].length) break;

    let candidate = -1;
    let numValue = math.Infinity;

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
      }

      if (isCandidate) {
        candidate = j;
      }
    }

    if (candidate == -1) {
      column++;
      row--;
      continue;
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

  //string[] op = new string[rows.Length];

  //for(int row = 0; row < rows.Length; row++)
  //{
  //    if (row != a && row != b) op[row] = "\\;";
  //    if (row == a) op[row] = "R" + b.ToString();
  //    if (row == b) op[row] = "R" + a.ToString();
  //}

  //operations += StringifyMatrix(createOperation(op));

  operations[a] += "=R" + (b + 1);
  operations[b] += "=R" + (a + 1);
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

  //string[] op = new string[rows.Length];

  //for(int row = 0; row < rows.Length; row++)
  //{
  //    if (row != index) op[row] = "\\;";
  //    else { op[row] = " \\cdot " + scalar.ToString(); }
  //}

  //operations += StringifyMatrix(createOperation(op));

  let para;
  try {
    para = math.evaluate(scalar + " < 0");
  } catch (e) {
    para = false;
  }

  operations[index] +=
    " \\cdot " +
    (para ? "\\left(" : "") +
    math.simplify(scalar + "") +
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

  try {
    numericOne = !math.evaluate("abs(" + addFromScalar + ") == 1");
  } catch (e) {
    numericOne = false;
  }

  operations[addTo] +=
    (lessThanZero ? "-" : "+") +
    (numericOne
      ? math.simplify("abs( + " + addFromScalar + ")") + "\\cdot "
      : "") +
    "R" +
    (addFrom + 1);
}

function StringifyOperation(matrix) {
  let result = " \\begin{matrix} ";

  for (let row = 0; row < matrix.length; row++) {
    result += matrix[row];
    if (row < matrix.length - 1) result += " \\\\";
  }

  result += " \\end{matrix}";

  return result;
}

function StringifyMatrix(matrix) {
  let result = " \\begin{bmatrix} ";

  for (let row = 0; row < matrix.length; row++) {
    for (let column = 0; column < matrix[row].length; column++) {
      if (column != 0) result += " & ";
      let value = math.simplify(matrix[row][column]);

      try {
        if (!evaluateOutput) throw new Error("Evaluation off");
        result += math.evaluate(value.toString());
      } catch (e) {
        result += value.toTex();
        console.log(e);
      }
    }

    if (row < matrix.length - 1) result += " \\\\";
  }

  result += " \\end{bmatrix}";

  return result;
}

function SaveStatus() {
  result += StringifyMatrix(rows);
}

function CompleteOperations() {
  if (!isNewOperations()) return;
  result += "" + StringifyOperation(createOperation(operations));
  fillOperations();
  result += "\\\\ \n \\sim &";
  SaveStatus();
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
  setCookie("savedinput", toSave, 30);
}

function LoadInput() {
  let cookieInput = JSON.parse(getCookie("savedinput"));
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
