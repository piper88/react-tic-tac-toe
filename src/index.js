import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

//when is everything re-rendered? when there's a change in state?

//Since Square doesn't have it's own state, can rewrite it as the following:
function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
      </button>
  )
}


class Board extends React.Component {
  //since state is considered private to the component that defines it, we can't update the board's state directly from the square. So instead we pass a function from the board to the square, and the the square will then call that function when a square is clicked.



// Rewrite Board to use two loops to make the squares instead of hardcoding them.
renderSquare(i) {
  console.log('renderSquare')
  return  (
    <Square
    value={this.props.squares[i]}
    //pass this function to square, so that square can call it, and in doing so can update board's state.
    onClick={() => this.props.onClick(i)}
    />
  );
}

renderSquares(row) {
  // array is [0,3,6]
  let newArray = [];

  for (let i = row; i < row + 3; ++i) {
    newArray.push(i);
  }
  return newArray.map((square) => {
    return this.renderSquare(square);
  })
}

renderRow() {
  let array = [0,3,6];

  return array.map((row) => {
    return (
      <div key = {row} className="board-row">
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
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];

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

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

//map accepts as arguments to callback 1.) element currently being processed 2.) index of that element
    const moves = history.map((step, move) => {
      //when history.length - 1 === move, make desc bold

      let thingClicked = step.squareClicked;
      let row;
      let column;

      //assign row
      switch (true) {
        case (thingClicked === null):
          row = 'none';
          break;
        case (thingClicked < 3 && thingClicked >= 0):
          row = 1;
          break;
        case (thingClicked >= 3 && thingClicked < 6):
          row = 2;
          break;
        default:
          row = 3;
      }

      //assign column
      switch (true) {
        case (thingClicked === null):
          column = 'none';
          break;
        case (thingClicked % 3 === 0):
          column = 1;
          break;
        case (thingClicked === 1 || thingClicked === 4 || thingClicked === 7):
          column = 2;
          break;
        default:
          column = 3;
      }

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



    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ?  'X' : 'O')
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
          squares = {current.squares}
          //passes the handleClick function to board as a prop called onClick. board will then pass this along to square, so that when user clicks on square, the function is called
          onClick = {(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

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
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
