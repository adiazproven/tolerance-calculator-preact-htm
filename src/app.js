// Initialize htm with Preact
const html = htm.bind(preact.h);
const React = preactCompat,
    ReactDOM = preactCompat;

import i18n from './utils/i18n.js';

import { CalculateTolerance, maxDiameter } from './utils/ToleranceCalculator.js';
import UseWindowDimensions from './utils/UseWindowDimensions.js';
import { getItems, setItem, deleteItem } from './utils/storage.js';

const { useState } = React;

function App() {
    const [letters, setLetters] = useState([
      "A",
      "B",
      "C",
      "CD",
      "D",
      "E",
      "EF",
      "F",
      "FG",
      "G",
      "H",
      "J",
      "JS",
      "K",
      "M",
      "N",
      "P",
      "R",
      "S",
      "T",
      "U",
      "V",
      "X",
      "Y",
      "Z",
      "ZA",
      "ZB",
      "ZC",
    ]);
  
    // Calculated Tolerances
    // const [calculations, setCalculations] = useState([]);
    const [calculations, setCalculations] = useState(getItems());
  
    // Form inputs
    const [diameter, setDiameter] = useState(0);
    const [letter, setLetter] = useState("A");
    const [number, setNumber] = useState("IT01");
  
    // Form validation
    const [alert, setAlert] = useState(0);
    const validate = (inputChanged, v) => {
  
      const value = v > maxDiameter ? maxDiameter : v;
      setDiameter(value);
  
      let letterUsed = inputChanged === "letter" ? value : letter;
      let numberUsed = parseInt(inputChanged === "number" ? value : number);
      let diameterUsed = parseInt(inputChanged === "diameter" ? value : diameter);
  
      // check diameter input
      if (diameterUsed <= 0) {
        setAlert(1);
        return;
      }
  
      console.log("Calculating " + letterUsed + " - " + numberUsed + " - " + diameterUsed);
  
      // calculate
      let toleranceCalculation = CalculateTolerance(letterUsed, numberUsed, diameterUsed);
  
      // check for calculation error
      if (toleranceCalculation === -1) {
        setAlert(2);
        console.log("letter-number combination not found");
        return;
      }
  
      setAlert(0);
    };
  
    const [showResult, setShowResult] = useState(
      getItems().map(x => x =
      {
        "id": x.id,
        "showingMore": false
      })
    );
  
    const calculate = event => {
  
      event.preventDefault();
  
      // check diameter input
      if (diameter <= 0) {
        setAlert(1);
        return;
      }
  
      // calculate
      let toleranceCalculation = CalculateTolerance(letter, parseInt(number), parseInt(diameter));
  
      // check for calculation error
      if (toleranceCalculation === -1) {
        setAlert(2);
        console.log("letter-number combination not found");
        return;
      }
  
      toleranceCalculation.id = Date.now();
  
      const showResults2 = [...showResult];
      showResults2.push({
        "id": toleranceCalculation.id,
        "showingMore": false
      });
      setShowResult(showResults2);
  
      add(toleranceCalculation);
      setAlert(0);
    }
  
    // Button active
    const [holesSelected, setHolesSelected] = useState(true);
  
    // Change letters minus or mayus
    const changeType = (type) => {
      console.log("changeType value = " + type);
      setLetters(() => {
        if (type === "holes") {
          setHolesSelected(true);
          const letters2 = letters.map(x => x = x.toUpperCase());
          setLetter(letter.toUpperCase());
          return (letters2)
        }
        else {
          setHolesSelected(false);
          const letters2 = letters.map(x => x = x.toLowerCase());
          setLetter(letter.toLowerCase());
          return (letters2)
        }
      })
      // validate();
    }
  
    // Add and Remove calculation to the list
    const add = (toleranceCalculation) => {
      setItem(toleranceCalculation);
      setCalculations(() => {
        return getItems();
      })
    }
  
    const remove = (id) => {
      deleteItem(id);
      setCalculations(() => {
        return getItems();
      })
    }
  
    // const spacing = (number) => {
    //   let spaces = [];
    //   for (let i = 0; i < number; i++) spaces.push(html`<span>    </span>`);
    //   return spaces;
    // }
  
    const hideShow = (id) => {
      let showResult2 = [...showResult];
      let sr = showResult2.find(x => x.id === id);
      if (sr === undefined) {
        showResult2.push({
          "id": id,
          "showingMore": true
        });
        setShowResult(showResult2);
      }
      else {
        sr.showingMore = !sr.showingMore;
        setShowResult(showResult2);
      }
    }
  
    const { width } = UseWindowDimensions();
  
    const showTheResult = (toleranceCalculation) => {
  
      // deconstruct the toleranceCalculation object
      const { id, diameter: dia, lowerDeviation: low, upperDeviation: upp, avg, number: num, letter: lett } = toleranceCalculation;
  
      // prepare the variables that will be used in the jsx
  
      // functions to keep everything more organized
      const roundToHowManyDecilams = 2; // to how many decimals do you want to round the results ?
    
      const roundToDecimals = (number) => {
        const mult = Math.pow(10, roundToHowManyDecilams);
        return Math.round(number * mult) / mult;
      }
  
      /*more-less-close --> return the number as a string and with its sign +/- right next to it*/
      const mlc = (number) => {
        number = roundToDecimals(number);
        return number < 0 ? `${number}` : `+${number}`;
      }
    
      /*more-less-far --> return the number as a string and with its sign +/- one space away*/
      const mlf = (number) => {
        number = roundToDecimals(number);
        return number < 0 ? `- ${number*-1}` : `+ ${number}`;
      }
  
      // the data shown will depend on the window width and the calculation
      let main, min, max, inferior, superior, average, range;

      if (width > 1100) {
        main = html`<p><b><span class="tc-space-right">${dia}</span><span class="tc-space-right">${lett}${num}</span></b><span class="tc-space-right">${mlc(low)} ${mlc(upp)} µm</span></p>`;
        inferior = html`<p><b>${i18n("inferior-measure")}</b> = ${roundToDecimals(dia + low * 0.001)} µm</p>`;
        superior = html`<p><b>${i18n("superior-measure")}</b> = ${roundToDecimals(dia + upp * 0.001)} µm</p>`;
        min = html`<p><b>${i18n("inferior-measure-expanded")}</b> = ${dia} ${mlf(low * 0.001)} = ${roundToDecimals(dia + low * 0.001)} mm</p>`;
        max = html`<p><b>${i18n("superior-measure-expanded")}</b> = ${dia} ${mlf(upp * 0.001)} = ${roundToDecimals(dia + upp * 0.001)} mm</p>`;
        average = html`<p><b>${i18n("average")}</b> = ${dia} ${mlf(avg * 0.001)} = ${roundToDecimals(dia + avg * 0.001)} mm</p>`;
        range = html`<p><b>${i18n("tolerance-range-expanded")}</b> = ${upp * 0.001} - ${low < 0 ? html`<span>(${roundToDecimals(low * 0.001)})</span>` : roundToDecimals(low * 0.001)} = ${roundToDecimals(upp * 0.001 - low * 0.001)} mm</p>`;
      } else {
        main = html`<p><b><span class="tc-space-right">${lett}${num}</span><span class="tc-space-right">${dia}mm</span></b>${mlc(low)} ${mlc(upp)} µm</p>`;
        inferior = html`<p>${mlc(dia + low * 0.001)} µm</p>`;
        superior = html`<p>${mlc(dia + upp * 0.001)} µm</p>`;
        min = html`<p><b>${i18n("inferior-measure")}</b> = ${roundToDecimals(dia + low * 0.001)} mm</p>`;
        max = html`<p><b>${i18n("superior-measure")}</b> = ${roundToDecimals(dia + upp * 0.001)} mm</p>`;
        average = html`<p><b>${i18n("average")}</b> = ${roundToDecimals(dia + avg * 0.001)} mm</p>`;
        range = html`<p><b>${i18n("tolerance-range")}</b> = ${roundToDecimals(upp * 0.001 - low * 0.001)} mm</p>`;
      }
  
      let showMore = showResult.find(x => x.id === id).showingMore ? "active" : "";
  
      // return jsx
      return html`
        <div key=${id} className="tc-result-container">
  
          <div className=${"tc-result-subcontainer " + showMore}>
            <div className="tc-result-main">
              ${main}
            </div>
            <div className="result-min">${inferior}</div>
            <div className="result-max">${superior}</div>
            <div className="tc-result-show-hide">
              <button className="tc-result-show-hide-button"
                onClick=${() => hideShow(id)}>
                ${showMore ? "-" : "+"}
              </button>
            </div>
            <div className="tc-result-more">
              ${min}
              ${max}
              ${average}
              ${range}
            </div>
          </div>
  
          <div className="tc-result-delete">
            <button className="tc-button-delete-result" onClick=${() => remove(id)}>
            </button>
          </div>
  
        </div>`;
    }
  
    return html`
      <div className="tc-wrapper">
  
        <div className="tc-container">
          <div className="tc-title">
            <p>
              <b>${i18n("title-bold")}</b>
            </p>
            <p>${i18n("title-light")}</p>
          </div>
          <div className="holes-or-shafts">
            <div className="holes-or-shafts-title">
              <p>
                <b>${i18n("subtitle-bold")}</b>
              </p>
              <p>${i18n("subtitle-light")}</p>
            </div>
            <div className="holes-or-shafts-buttons">
  
                <button className=${"buttons-holes-or-shafts " +
                  (holesSelected ? "active" : "")}
                  onClick=${() => changeType("holes")}>${i18n("holes")}</button>
  
                <div className="button-divider"></div>
  
                <button className=${"buttons-holes-or-shafts " +
                  (holesSelected ? "" : "active")}
                  onClick=${() => changeType("shafts")}>${i18n("shafts")}</button>
  
            </div>
          </div>
          <div className="tc-inputs">
            <div className="inputs-diameter-title">${i18n("nominal-size")}
              <div className="input-label-underline"></div>
            </div>
            <div className="inputs-letter-title">${i18n("letter")}
              <div className="input-label-underline"></div>
            </div>
            <div className="inputs-number-title">${i18n("number")}
              <div className="input-label-underline"></div>
            </div>
            <div className="inputs-diameter-input">
              <div className="diameter-input">
                <input type="number" id="diameter" name="diameter" autoComplete="off"
                  onChange=${
                    event => {
                      // max value = 160
                      const value = event.target.value > maxDiameter ? maxDiameter : event.target.value;
                      event.target.value = value;
                      setDiameter(value);
  
                      validate("diameter", event.target.value);
                    }
                  } />
                  <div className="diameter-input-mm">mm</div>
              </div>
            </div>
            <div className="inputs-letter-input">
              <select id="letter" name="letter"
                onChange=${
                  event => {
                    setLetter(event.target.value);
                    // validate("letter", event.target.value);
                  }
                }>
                ${
                  letters.map((letter, index) => html`
                    <option key=${index}>
                      ${letter} </option>
                    `)
                } </select>
            </div>
            <div className="input-number-input">
              <select id="number" name="number"
                onChange=${
                  event => {
                    setNumber(event.target.value);
                    validate("number", event.target.value);
                  }
                }>
                <option>01</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
              </select>
            </div>
            <div></div>
            <div></div>
            <div className="inputs-calculate-button">
              <button className="button-calculate"
                onClick=${calculate}>${i18n("calculate")}</button>
            </div>
          </div>
          <div className="tc-error-message">
            ${alert === 1 && html`<div>${i18n("diameter-must-be-more-than-zero")}</div>`}
            ${alert === 2 && html`<div>${i18n("letter-number-combination-not-found")}</div>`}
          </div>
          <div className="tc-results-title">${i18n("results")}</div>
          <div className="tc-results">
            <ul>
              ${[...calculations].reverse().map(toleranceCalculation => (
                showTheResult(toleranceCalculation)
              ))}
            </ul>
          </div>
        </div>
  
      </div>`;
}
ReactDOM.render(html`<${App}/>`, document.getElementById("tolerance-calculator"));