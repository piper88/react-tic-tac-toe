import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {

  render () {
    return (
      <button className={this.props.className} onClick={this.props.onClick}>
        {this.props.value}
        </button>
    )
  }
}

class Board extends React.Component {
  //since state is considered private to the component that defines it, we can't update the board's state directly from the square. So instead we pass a function from the board to the square, and the the square will then call that function when a square is clicked.

  //this.props.winningPlacement is array of winning squares e.g. [0,1,2]
  renderSquare(i) {
    console.log(this.props.squares[i]);
    if (this.props.winningPlacement) {
      //if there is a winner, return a Square with a winningSquare attribute for each time i === this.props.winninPlacement[0, 1, 2]
      //otherwise return a Square with no winningSquare attribute
        return  (
          <Square
          key = {i}
          value={this.props.squares[i]}
          className={i === this.props.winningPlacement[0] || i === this.props.winningPlacement[1] || i === this.props.winningPlacement[2] ? 'winningSquare' : this.props.squares[i] || 'square'}
          //pass this function to square, so that square can call it, and in doing so can update board's state.
          onClick={() => this.props.onClick(i)}
          />
        );
      }
    //if no winner is declared
    return  (
      <Square
      key = {i}
      value={this.props.squares[i]}
      className={this.props.squares[i] ? this.props.squares[i] : 'square'}
      //pass this function to square, so that square can call it, and in doing so can update board's state.
      onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderSquares(row) {
    let oneRow = [];

    for (let i = row; i < row + 3; ++i) {
      oneRow.push(i);
    }
    return oneRow.map((square) => {
      return this.renderSquare(square);
    })
  }

  renderRow() {
    let firstElementInRows = [0,3,6];

    return firstElementInRows.map((row) => {
      return (
        <div key={row} className="board-row">
          {this.renderSquares(row)}
        </div>
      )
    })
  }


  render() {
    return (
      <div>
        {this.renderRow()}
      </div>
    )
  }
}



class Game extends React.Component {
  constructor (props) {
    super(props);
    //to collect data from multiple children (squares), declare the shared state in the parent
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        squareClicked: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      ascending: true,
    };
  }

handleMoveOrder() {
  this.setState({
    ascending: !this.state.ascending,
  })
}

  handleClick(i) {
    //creates copy of history from first move, to but not including the current move
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];

    //creates copy of original squares array
    const squares = current.squares.slice();
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    //sets the value of squares[i] to X (i being the one that was clicked)
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    //sets the this.state.squares value to X
    this.setState({
      //concat is like push without mutating original array
      //each time a move is made, the newest move is added to history. The stepNumber is assigned to the history.length, so in effect stepNumber is incremented with each click
      history: history.concat([{
        squares: squares,
        squareClicked: i,
      }]),
      //keeps track of which step we're currently viewing
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });

  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  displayRowAndColumn(step) {
    let thingClicked = step.squareClicked;

    //location = [row, column]
    let location = []
    //assign row
    switch (true) {
      case (thingClicked === null):
        location[0] = 'none';
        break;
      case (thingClicked < 3 && thingClicked >= 0):
        location[0] = 1;
        break;
      case (thingClicked >= 3 && thingClicked < 6):
        location[0] = 2;
        break;
      default:
        location[0] = 3;
    }
    //assign column
    switch (true) {
      case (thingClicked === null):
        location[1] = 'none';
        break;
      case (thingClicked % 3 === 0):
        location[1] = 1;
        break;
      case (thingClicked === 1 || thingClicked === 4 || thingClicked === 7):
        location[1] = 2;
        break;
      default:
        location[1] = 3;
    }
    return location;
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    //now winner is [[placement of winning symbols], winning symbol]
    const winner = calculateWinner(current.squares);
    const xIsNext = this.state.xIsNext;

//map accepts as arguments to callback 1.) element currently being processed 2.) index of that element
  const movesForward = history.map((step, move) => {

    let row = this.displayRowAndColumn(step)[0];
    let column = this.displayRowAndColumn(step)[1];

    //when history.length - 1 === move, make desc bold
    let style;
    if (history.length - 1 === move) {
      style = "bold";
    }

    const desc = move ?
    `Go to move # ${move}` :
    'Go to game start';

        return (
          //assign a key property to items in dynamically created lists. This allows for react to keep track of which items have changed etc. between renderings
          // Display the location for each move in the format (col, row) in the move history list.
          <li key = {move}>
          <button className = {style} onClick = {() => this.jumpTo(move)}>{desc}</button>
          {`Row: ${row} Column: ${column}`}
          </li>
        )
  })

    const reverseHistory = history.slice().reverse();

    const movesInReverse = reverseHistory.map((step, move) => {

      let row = this.displayRowAndColumn(step)[0];
      let column = this.displayRowAndColumn(step)[1];

      //when history.length - 1 === move, make desc bold
      let style;
      if (history.length - 1 === move) {
        style = "bold";
      }

      const desc = reverseHistory.length - move - 1 ?
      `Go to move # ${reverseHistory.length - move - 1}` :
      `Go to game start`;
        return (
          <li key = {move}>
            <button className = {style} onClick = {() => this.jumpTo(reverseHistory.length - move - 1)}>{desc}</button>
              {`Row: ${row} Column: ${column}`}
          </li>
        )
    });

    let status;
    if (winner) {
      status = `Winner: ${winner[1]}`;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ?  'X' : 'O')
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
          winningPlacement = {winner ? winner[0] : null}
          xIsNext = {xIsNext}
          squares = {current.squares}
          //passes the handleClick function to board as a prop called onClick. board will then pass this along to square, so that when user clicks on square, the function is called
          onClick = {(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <button onClick={() => this.handleMoveOrder()}>{this.state.ascending ? `Ascending` : `Descending`}</button>
          <div>{status}</div>
          <ul>{this.state.ascending ? movesForward : movesInReverse}</ul>
        </div>
      </div>
    );
  }
}

//squares is the array of length 9
// [X, X, X, null, null, null...]
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    //const [a,b,c] = [0,1,2]
    const [a, b, c] = lines[i];
    const result = [];
    //if the symbol that's at the first place is the same as the symbol in the second and third place, then that symbol is the winner;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      result.push([a,b,c], squares[a])
      return result;
      // return squares[a];
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
