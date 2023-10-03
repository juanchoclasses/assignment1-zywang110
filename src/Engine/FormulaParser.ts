/**
 * This class implements the Shunting Yard algorithm to parse and calculate a formula.
 * It exports the calculate method that returns the result of the formula for the FormulaEvaluator class.
 */ 
import { ErrorMessages } from "./GlobalDefinitions";

export class FormulaParser {
  private formula: FormulaType;
  private index: number;

  /**
   * Initialize the input formula and sets initial index to 0.
   * @param formula a formula to be parsed and calculated.
   */
  constructor(formula: FormulaType) {
    this.formula = formula;
    this.index = 0;
  }

  /**
   * Gets the current token and increments the index.
   * @returns the next token in the formula.
   */
  private getToken(): string {
    return this.formula[this.index++];
  }

  /**
   * Parses a factor in the formula.
   * A factor can be a number, a parenthesized expression, or an invalid token.
   * @returns the value of the factor as a float.
   * @throws an error if the token is neither an expression nor a numerical value.
   */
  private parseFactor(): number {
    const token = this.getToken();
    // check if the token is an opening parenthesis and recursively parse the expression inside the parentheses
    if (token === "(") {
      const result = this.parseExpression();
      if (this.getToken() !== ")") {
        throw new Error(ErrorMessages.missingParentheses);
      }
      return result;
    } else if (/[0-9]/.test(token)) {
      let numStr = token;
      while (this.index < this.formula.length && /[0-9.]/.test(this.formula[this.index])) {
        numStr += this.getToken();
      }
      return parseFloat(numStr);
    } else {
      throw new Error(ErrorMessages.invalidFormula);
    }
  }

  /**
   * Parses a term in the expression.
   * A term is a factor followed by zero or more multiplication or division operators.
   * @returns the value of the term or Infinity if the term contains a division by zero.
   */
  private parseTerm(): number {
    let leftValue = this.parseFactor();
    let operator = this.getToken();
    while (operator === "*" || operator === "/") {
      const rightValue = this.parseFactor();
      if (operator === "*") {
        leftValue *= rightValue;
      } else {
        if (rightValue !== 0) {
          leftValue /= rightValue;
        } else {
          return Infinity;
        }
      }
      operator = this.getToken();
    }
    this.index--; // Revert the index for the next parsing level
    return leftValue;
  }

  /**
   * Parses an expression in the expression.
   * An expression is a term followed by zero or more addition or subtraction operators.
   * @returns the value of the expression.
   */
  private parseExpression(): number {
    let leftValue = this.parseTerm();
    let operator = this.getToken();
    while (operator === "+" || operator === "-") {
      const rightValue = this.parseTerm();
      if (operator === "+") {
        leftValue += rightValue;
      } else {
        leftValue -= rightValue;
      }
      operator = this.getToken();
    }
    this.index--; // Revert the index for the next parsing level
    return leftValue;
  }

  /**
   * Parses and calculates the formula.
   * @returns the result of the formula.
   * @throws an error if the index is not at the end.
   */
  public calculate(): number {
    const result = this.parseExpression();
    if (this.index !== this.formula.length) {
      throw new Error(ErrorMessages.invalidFormula);
    }
    return result;
  }
}