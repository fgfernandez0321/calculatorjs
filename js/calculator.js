const calculationsInSession = 10;

class Calculator {
    constructor() {
        // currentExpression will be defined as array in order to have like tokens speaking in compilers terms.
        this.currentExpression = [];
        this.calculations = [];
    }

    /**
     * This function can be used to get the last calculation registered by the user.
     * @returns {*}
     */
    getLastCalculation() {
        if (this.calculations.length > 0) {
            const index = this.calculations.length - 1;
            return this.calculations[index];

        } else {
            return null;
        }
    }

    /**
     * This function can be used to evaluate the expression typed by the user.
     * @returns {*}
     */
    evaluate() {
        try {
            const fixedExpression = this._fixExpression();
            const resultExpression = math.eval(fixedExpression);

            return {
                tokenResult: Calculator._toToken(resultExpression),
                beautyResult: resultExpression
            }

        } catch (e) {
            return "Error";
        }
    }

    /**
     * This function can be use to save calculations in memory and local using web local storage.
     * @param displayedExpression Friendly expression displayed to the user.
     * @param resultExpression  Result expression obtained from evaluation process.
     */
    save(displayedExpression, resultExpression) {
        this.calculations.push({
            displayedExpression: displayedExpression,
            tokenExpression: this.currentExpression,
            beautyExpression: this.currentExpression.join(''),
            tokenResult: resultExpression.tokenResult,
            beautyResult: resultExpression.beautyResult
        });

        if (this.calculations.length <= calculationsInSession) {
            Calculator._saveSession("calculations", JSON.stringify(this.calculations));

        } else {
            alert("The calculator will save the last 10 calculations performed by the user.");
        }
    }

    /**
     * This function can be used to reload the calculations saved in session storage.
     */
    reloadCalculations() {
        const calculationsInSession = Calculator._getSession("calculations");
        if (calculationsInSession) {
            this.calculations = JSON.parse(calculationsInSession);
        }        
    }

    /**
     * This function can be used to validate, balance... the expression before evaluation process.
     * @returns {string}
     * @private
     */
    _fixExpression() {
        // return math.eval('sqrt(3^2 + 4^2)');
        // let fixedExpression = [];
        // for (let i = 0; i < this.currentExpression.length; i++) {
        //
        // }
        return this.currentExpression.join('');
    }

    /**
     * This function can be used to separate a value in characters in order to have tokens.
     * @param value
     * @returns {Array}
     * @private
     */
    static _toToken(value) {
        let tokens = [];
        let valueStr = value.toString();

        for (let i = 0; i < valueStr.length; i++) {
            tokens.push(valueStr.charAt(i))
        }

        return tokens;
    }

    /**
     * This function can be used to save calculations array in session storage in order to preserve them.
     * @private
     */
    static _saveSession(key, value) {
        if (sessionStorage) {
            sessionStorage.setItem(key, value);

        } else {
            alert("Sorry, your browser doesn't support session storage.");
        }
    }

    static _getSession(key) {
        if (sessionStorage) {
            return sessionStorage.getItem(key);

        } else {
            alert("Sorry, your browser doesn't support session storage.");
        }
    }

    _removeSession(key) {
        if (sessionStorage) {
            localStorage.removeItem(key);

        } else {
            alert("Sorry, your browser doesn't support session storage.");
        }
    };

    /**
     * This function can be used to clear the expression.
     */
    clear() {
        this.currentExpression = [];
    }
}


$(function() {
    let calculator = new Calculator();
    let calculations = $(".calculations");
    let display = $(".display");
    let displayedExpression = '';
    let calculationTemplate = '<div class="col-9">{{ expression }}</div><div class="col-3 text-right">= {{ result }}</div>';

    /**
     * This function can be used to update the display calculator and expression to evaluate behind the scenes.
     * @param beautyValue Friendly value displayed to the user.
     * @param realValue Real value used behind the scenes to handle behaviours.
     */
    function update(beautyValue, realValue) {
        displayedExpression = display.val();

        if (realValue === "Backspace") {
            displayedExpression = displayedExpression.slice(0, -1);
            calculator.currentExpression.splice(-1, 1)

        } else if (realValue === "sqrt") {
            displayedExpression += beautyValue + '(';
            calculator.currentExpression.push(realValue);
            calculator.currentExpression.push('(');

        } else if (realValue === '=') {
            displayedExpression = beautyValue.beautyResult;
            calculator.currentExpression = beautyValue.tokenResult;
            updateHistoricalCalculation(calculator.getLastCalculation());

        } else {
            displayedExpression += beautyValue;
            calculator.currentExpression.push(realValue);
        }

        display.val(displayedExpression);
    }

    /**
     * This function can be used to update historical calculation in HTML code.
     * @param calculation
     */
    function updateHistoricalCalculation(calculation) {
        const calculationHTML = calculationTemplate
            .replace("{{ expression }}", calculation.displayedExpression)
            .replace("{{ result }}", calculation.beautyResult);

        // scrollTop property to put scroll to bottom.
        calculations.append(calculationHTML).animate({scrollTop: calculations.height() * 2});
    }

    /**
     * This function can be used to reload the historical calculations saved in session storage.
     */
    function reloadHistoricalCalculations() {
        calculator.reloadCalculations();

        for (let i = 0; i < calculator.calculations.length; i++) {
            updateHistoricalCalculation(calculator.calculations[i]);
        }
    }

    /**
     * This function can be used to clear all resources related to current calculation.
     */
    function clear() {
        calculator.clear();
        display.val('');
        displayedExpression = '';
    }

    $(".btn").click(function(event) {
        switch(this.innerText) {
            case '×':
                update(this.innerText, '*');
                break;

            case '÷':
                update(this.innerText, '/');
                break;

            case '−':
                update(this.innerText, '-');
                break;

            case '^':
                update(this.innerText, '^');
                break;

            case '√':
                // keeping in mind sqrt(9) I mean () behind the scenes
                update(this.innerText, 'sqrt');
                break;

            case '=':
                const result = calculator.evaluate();
                calculator.save(displayedExpression, result);
                clear();
                update(result, '=');
                break;

            case 'C':
                clear();
                break;

            case '⌫':
                update(this.innerText, 'Backspace');
                break;

            default:
                update(this.innerText, this.innerText);
        }
    });

    // Reloading calculations if there are in session.
    reloadHistoricalCalculations();

});