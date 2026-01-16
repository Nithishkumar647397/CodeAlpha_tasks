(function () {
    "use strict";

    const exprEl = document.getElementById("expressionDisplay");
    const resultEl = document.getElementById("resultDisplay");
    const statusEl = document.getElementById("statusText");
    const dotEl = document.getElementById("statusDot");
    const bodyEl = document.getElementById("bodyRoot");

    // History elements
    const historyListEl = document.getElementById("historyList");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");

    let current = "0";
    let expression = "";
    let lastOperator = null;
    let lastValue = null;
    let justEvaluated = false;

    const history = [];
    const MAX_HISTORY = 10;

    function setStatus(text) {
        if (statusEl) statusEl.textContent = text;
    }

    function setBackgroundForOperator(op) {
        bodyEl.classList.remove(
            "bg-neutral",
            "bg-addition",
            "bg-subtraction",
            "bg-multiplication",
            "bg-division"
        );
        dotEl.classList.remove("sub", "mult", "div");

        if (!op) {
            bodyEl.classList.add("bg-neutral");
            return;
        }

        switch (op) {
            case "+":
                bodyEl.classList.add("bg-addition");
                break;
            case "-":
                bodyEl.classList.add("bg-subtraction");
                dotEl.classList.add("sub");
                break;
            case "*":
                bodyEl.classList.add("bg-multiplication");
                dotEl.classList.add("mult");
                break;
            case "/":
                bodyEl.classList.add("bg-division");
                dotEl.classList.add("div");
                break;
            default:
                bodyEl.classList.add("bg-neutral");
        }
    }

    function updateDisplay() {
        exprEl.textContent = expression || "0";
        resultEl.textContent = current;
    }

    function clearAll() {
        current = "0";
        expression = "";
        lastOperator = null;
        lastValue = null;
        justEvaluated = false;
        deactivateOps();
        setBackgroundForOperator(null);
        setStatus("Cleared • Ready");
        updateDisplay();
    }

    function clearEntry() {
        current = "0";
        setStatus("Entry cleared");
        updateDisplay();
    }

    function backspace() {
        if (justEvaluated || current === "Error") {
            clearEntry();
            return;
        }
        if (
            current.length <= 1 ||
            (current.length === 2 && current.startsWith("-"))
        ) {
            current = "0";
        } else {
            current = current.slice(0, -1);
        }
        setStatus("Editing value");
        updateDisplay();
    }

    function invertSign() {
        if (current === "0" || current === "Error") return;
        current = current.startsWith("-") ? current.slice(1) : "-" + current;
        setStatus("Sign toggled");
        updateDisplay();
    }

    function appendNumber(num) {
        if (current === "Error") {
            current = "0";
            expression = "";
            lastOperator = null;
            lastValue = null;
        }

        if (justEvaluated) {
            current = "0";
            expression = "";
            lastOperator = null;
            lastValue = null;
            justEvaluated = false;
            setBackgroundForOperator(null);
        }

        if (num === ".") {
            if (!current.includes(".")) {
                current += ".";
            }
        } else {
            if (current === "0") {
                current = num;
            } else {
                current += num;
            }
        }

        setStatus("Typing…");
        updateDisplay();
    }

    function deactivateOps() {
        document.querySelectorAll(".btn-op").forEach((btn) => {
            btn.classList.remove("active");
        });
    }

    function activateOp(opSymbol) {
        deactivateOps();
        const btn = document.querySelector(`.btn-op[data-op="${opSymbol}"]`);
        if (btn) btn.classList.add("active");
    }

    function toSymbolFromKey(key) {
        switch (key) {
            case "+":
                return "+";
            case "-":
                return "−";
            case "*":
                return "×";
            case "/":
                return "÷";
            default:
                return key;
        }
    }

    function toCalcOp(sym) {
        switch (sym) {
            case "×":
                return "*";
            case "÷":
                return "/";
            case "−":
                return "-";
            default:
                return sym;
        }
    }

    function chooseOperator(opSymbol) {
        if (current === "Error") return;

        const calcOp = toCalcOp(opSymbol);

        if (!expression) {
            expression = current + " " + opSymbol;
            lastValue = parseFloat(current);
        } else if (!justEvaluated) {
            evaluate();
            expression = current + " " + opSymbol;
            lastValue = parseFloat(current);
        } else {
            expression = current + " " + opSymbol;
            lastValue = parseFloat(current);
        }

        lastOperator = calcOp;
        current = "0";
        justEvaluated = false;
        activateOp(opSymbol);
        setBackgroundForOperator(calcOp);
        setStatus("Operator: " + opSymbol);
        updateDisplay();
    }

    /* ====== History Handling ====== */
    function addToHistory(exprText, resultText) {
        if (resultText === "Error") return; // don't log error

        history.unshift({
            expr: exprText,
            result: resultText,
        });
        if (history.length > MAX_HISTORY) {
            history.pop();
        }
        renderHistory();
    }

    function renderHistory() {
        if (!historyListEl) return;
        historyListEl.innerHTML = "";

        if (history.length === 0) {
            const p = document.createElement("p");
            p.className = "history-empty";
            p.textContent = "No calculations yet.";
            historyListEl.appendChild(p);
            return;
        }

        history.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "history-item";
            div.setAttribute("data-index", index);

            const exprDiv = document.createElement("div");
            exprDiv.className = "history-item-expression";
            exprDiv.textContent = item.expr;

            const resDiv = document.createElement("div");
            resDiv.className = "history-item-result";
            resDiv.textContent = item.result;

            div.appendChild(exprDiv);
            div.appendChild(resDiv);

            div.addEventListener("click", () => {
                // Load this result into calculator
                current = item.result;
                expression = "";
                lastOperator = null;
                lastValue = parseFloat(item.result);
                justEvaluated = true;
                setBackgroundForOperator(null);
                deactivateOps();
                setStatus("Loaded from history");
                updateDisplay();
            });

            historyListEl.appendChild(div);
        });
    }

    function clearHistory() {
        history.length = 0;
        renderHistory();
        setStatus("History cleared");
    }

    /* ====== Evaluation ====== */
    function evaluate() {
        if (!lastOperator || lastValue === null || justEvaluated) return;
        const a = lastValue;
        const b = parseFloat(current);

        let result;
        switch (lastOperator) {
            case "+":
                result = a + b;
                break;
            case "-":
                result = a - b;
                break;
            case "*":
                result = a * b;
                break;
            case "/":
                if (b === 0) {
                    result = "Error";
                } else {
                    result = a / b;
                }
                break;
            default:
                return;
        }

        const prettyOp =
            lastOperator === "*"
                ? "×"
                : lastOperator === "/"
                ? "÷"
                : lastOperator;
        const exprStr =
            expression && !expression.endsWith("=")
                ? expression + " " + current + " ="
                : a + " " + prettyOp + " " + b + " =";

        expression = exprStr;

        if (result === "Error") {
            current = "Error";
            lastValue = null;
            lastOperator = null;
            setBackgroundForOperator(null);
            setStatus("Error • Division by zero");
        } else {
            current = String(parseFloat(Number(result).toPrecision(12)));
            lastValue = result;
            setStatus("Result ready");
            // Add to history
            addToHistory(exprStr, current);
        }

        justEvaluated = true;
        deactivateOps();
        updateDisplay();
    }

    /* ====== Keyboard & UI ====== */
    function flashButton(selector) {
        const btn = document.querySelector(selector);
        if (!btn) return;
        btn.classList.add("flash");
        setTimeout(() => btn.classList.remove("flash"), 90);
    }

    function handleKeyDown(e) {
        const key = e.key;

        if (/^[0-9]$/.test(key)) {
            appendNumber(key);
            flashButton(`.btn[data-num="${key}"]`);
            return;
        }

        if (key === "." || key === ",") {
            appendNumber(".");
            flashButton(`.btn[data-num="."]`);
            return;
        }

        if (["+", "-", "*", "/"].includes(key)) {
            const sym = toSymbolFromKey(key);
            chooseOperator(sym);
            flashButton(`.btn-op[data-op="${sym}"]`);
            return;
        }

        if (key === "Enter" || key === "=") {
            evaluate();
            flashButton(`[data-action="equals"]`);
            return;
        }

        if (key === "Escape" || key === "Delete") {
            clearAll();
            flashButton(`[data-action="clear"]`);
            return;
        }

        if (key === "Backspace") {
            backspace();
            return;
        }
    }

    function bindButtons() {
        document.querySelectorAll(".btn").forEach((btn) => {
            const num = btn.getAttribute("data-num");
            const opSymbol = btn.getAttribute("data-op");
            const action = btn.getAttribute("data-action");

            if (num !== null) {
                btn.addEventListener("click", () => appendNumber(num));
            }

            if (opSymbol) {
                btn.addEventListener("click", () => chooseOperator(opSymbol));
            }

            if (action) {
                if (action === "clear") {
                    btn.addEventListener("click", clearAll);
                } else if (action === "clear-entry") {
                    btn.addEventListener("click", clearEntry);
                } else if (action === "invert") {
                    btn.addEventListener("click", invertSign);
                } else if (action === "equals") {
                    btn.addEventListener("click", evaluate);
                }
            }
        });

        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener("click", clearHistory);
        }
    }

    // Initialize SUNAssist Modern Calculator + History
    bindButtons();
    renderHistory();
    clearAll();
    window.addEventListener("keydown", handleKeyDown);
})();