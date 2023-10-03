import Cell from "./Cell"
import SheetMemory from "./SheetMemory"
import { ErrorMessages } from "./GlobalDefinitions";
import { FormulaParser } from "./FormulaParser";


export class FormulaEvaluator {
  // Define a function called update that takes a string parameter and returns a number
  private _errorOccured: boolean = false;
  private _errorMessage: string = "";
  private _currentFormula: FormulaType = [];
  private _lastResult: number = 0;
  private _sheetMemory: SheetMemory;
  private _result: number = 0;


  constructor(memory: SheetMemory) {
    this._sheetMemory = memory;
  }

  /**
   * 
   * @param formula 
   * @returns the result of the formula and the error message
   */
  evaluate(formula: FormulaType) {
    let error: string = "";
    
    // if the formula is empty return 0 and set  error message to empty formula
    if (formula.length === 0) {
      this._result = 0;
      this._errorMessage = ErrorMessages.emptyFormula;
      return;
    }

    const newFormula = [];
    for (const token of formula) {
      // if the token is a number then push the number to the new formula
      if (this.isNumber(token)) {
        newFormula.push(Number(token));
        // if the token is a cell reference then push the value of the cell to the new formula
      } else if (this.isCellReference(token)) {
        error = this.getCellValue(token)[1];
        newFormula.push(this.getCellValue(token)[0]);
        // if the token is neither then push the token to the new formula
      } else {
        newFormula.push(token);
      }
    }

    // if the last token in the formula is an operator or closing parenthesis then remove it
    const invalidEnding = /[+\-*/(]$/; 
      for (let i = newFormula.length - 1; i >= 0; i--) {
        if (invalidEnding.test(newFormula[i])) {
          error = ErrorMessages.invalidFormula;
          newFormula.pop();
        } else {
          break;
        }
      }
    
    // call the calculate method from the FormulaParser class on the new formula
    // if the result is Infinity then set the error message to divide by zero
    const parser = new FormulaParser(newFormula);
    try {
      this._result = parser.calculate();
    } catch (err: any) {
      error = err.message;
    }
    if (this._result === Infinity) {
      error = ErrorMessages.divideByZero;
    }
    this._errorMessage = error;
  }

  public get error(): string {
    return this._errorMessage
  }

  public get result(): number {
    return this._result;
  }


  /**
   * 
   * @param token 
   * @returns true if the toke can be parsed to a number
   */
  isNumber(token: TokenType): boolean {
    return !isNaN(Number(token));
  }

  /**
   * 
   * @param token
   * @returns true if the token is a cell reference
   * 
   */
  isCellReference(token: TokenType): boolean {

    return Cell.isValidCellLabel(token);
  }

  /**
   * 
   * @param token
   * @returns [value, ""] if the cell formula is not empty and has no error
   * @returns [0, error] if the cell has an error
   * @returns [0, ErrorMessages.invalidCell] if the cell formula is empty
   * 
   */
  getCellValue(token: TokenType): [number, string] {

    let cell = this._sheetMemory.getCellByLabel(token);
    let formula = cell.getFormula();
    let error = cell.getError();

    // if the cell has an error return 0
    if (error !== "" && error !== ErrorMessages.emptyFormula) {
      return [0, error];
    }

    // if the cell formula is empty return 0
    if (formula.length === 0) {
      return [0, ErrorMessages.invalidCell];
    }


    let value = cell.getValue();
    return [value, ""];

  }


}

export default FormulaEvaluator;