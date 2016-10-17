'use strict';

/* For use with NodeJS
import React from 'react';
import { render } from 'react-dom';
import { List, Map } from 'immutable';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
*/

// Use in brower/codepen
var _React = React;
var PropTypes = _React.PropTypes;
var _ReactDOM = ReactDOM;
var render = _ReactDOM.render;
var _Immutable = Immutable;
var List = _Immutable.List;
var Map = _Immutable.Map;
var _Redux = Redux;
var createStore = _Redux.createStore;
var _ReactRedux = ReactRedux;
var Provider = _ReactRedux.Provider;
var connect = _ReactRedux.connect;

// Utility functions
// Generates a grid. Users input height, width, whether cells should be filled in randomly

var gridGen = function gridGen(width, height) {
  var random = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
  var skyline = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

  var temp = [];
  var isPopulated = false;

  for (var y = 0; y < height; y++) {
    var row = [];

    for (var x = 0; x < width; x++) {
      if (random) {
        isPopulated = Math.random() * 10 > 5;
      }

      var color = undefined;

      // Option to make the background look like a pixel, urban landscape (NOT USED CURRENTLY)
      if (skyline) {
        color = skylineColor(x, y, width, height);
      } else {
        color = ['red', 'blue', 'green', 'yellow', 'white'][(x + y) % 5];
      }

      row = row.concat({
        x: x,
        y: y,
        populated: isPopulated,
        color: color
      });
    }
    temp = temp.concat([row]);
  }

  return temp;
};

// Currently unused function to determine the color of cell to make the grid appear like a skyline
var skylineColor = function skylineColor(x, y, width, height) {
  var cloudCenter = undefined;
  var buildingCenter = undefined;

  var buildingSpread = 8;
  var cloudSpread = 10;

  var cloudRadius = 3;
  var buildingWidth = 2;
  // let triangleWidth = 0;

  var wallTop = height * (2 / 3) - height * 0.20;
  // let currentI = Math.ceil(wallTop - 3);

  if ((x + buildingWidth) % buildingSpread === 0) {
    buildingCenter = x + buildingWidth;
  }

  if ((x + cloudRadius) % cloudSpread === 0) {
    cloudCenter = x + cloudRadius;
  }

  // Painting for all above ground
  if (y <= height * (2 / 3)) {
    if (buildingCenter - buildingWidth <= x && x <= buildingCenter + buildingWidth && y >= wallTop) {
      // Paint walls
      if ((x % 2 && y % 2) === 0) return 'red';
      // Paint windows
      if ((x % 2 && y % 2) !== 0) return 'yellow';
    }
    // Paint clouds
    if (y >= 2 && y <= height * 0.10 && x >= cloudCenter - cloudRadius && x <= cloudCenter + cloudRadius) {
      return 'white';
    }
    // Paint sky
    return 'blue';
  } else if (y > height * (2 / 3)) {
    // Paint grass
    return 'green';
  }
};

// Find the mininum and maximum areas to check the surrounding cells
var getMinMax = function getMinMax(value, limit) {
  return {
    min: Math.abs((limit + value - 1) % limit),
    max: Math.abs((limit + value + 1) % limit)
  };
};

// Checks the surrounding cells of a specified cell to see how many are populated (Returns array)
var checkSurroundingCells = function checkSurroundingCells(grid, x, y) {
  try {
    var limitX = getMinMax(x, grid[0].length);
    var limitY = getMinMax(y, grid.length);
    // Gets all 8 surrounding blocks and returns only the populated ones
    return [grid[limitY.min][limitX.min], grid[limitY.min][x], grid[limitY.min][limitX.max], grid[y][limitX.min], grid[y][limitX.max], grid[limitY.max][limitX.min], grid[limitY.max][x], grid[limitY.max][limitX.max]].filter(function (cell) {
      return cell.populated;
    });
  } catch (e) {
    return [];
  }
};

// Loops through grid to determine how the next generation should be updated
var checkGrid = function checkGrid(grid) {
  var tempGrid = [];

  // Using for loops instead of .map because of need to call setTimeout
  for (var y = 0; y < grid.length; y++) {
    var row = [];
    for (var x = 0; x < grid[0].length; x++) {
      var cell = Object.assign({}, grid[y][x]);
      var neighbors = checkSurroundingCells(grid, x, y).length;

      // Change cell state based on rules of game
      if (cell.populated && (neighbors < 2 || neighbors > 3)) {
        cell.populated = !cell.populated;
      } else if (!cell.populated && neighbors === 3) {
        cell.populated = !cell.populated;
      }

      row = row.concat(cell);
    }
    tempGrid = tempGrid.concat([row]);
  }

  return tempGrid;
};

// Checks the screen size to adjust the grid size on phones
var checkScreenSize = function checkScreenSize(sizes) {
  if (window.screen.availWidth <= 700) {
    return sizes.map(function (obj) {
      return {
        width: Math.floor(obj.height / 2),
        height: Math.floor(obj.width / 2)
      };
    });
  } else {
    return sizes;
  }
};

// Object for storing types of actions used below
var actions = {
  START_GAME: 'START_GAME',
  STOP_GAME: 'STOP_GAME',
  TOGGLE_CELL: 'TOGGLE_CELL',
  INCREASE_GENERATION: 'INCREASE_GENERATION',
  CLEAR_GENERATION: 'CLEAR_GENERATION',
  UPDATE_GRID: 'UPDATE_GRID',
  CHANGE_SPEED: 'CHANGE_SPEED',
  TOGGLE_RANDOM: 'TOGGLE_RANDOM',
  TOGGLE_OPTIONS: 'TOGGLE_OPTIONS',
  TOGGLE_FIRST_LOAD: 'TOGGLE_FIRST_LOAD'
};

// Actions
function _startGame(id) {
  return {
    type: actions.START_GAME,
    id: id
  };
}

function _stopGame(id) {
  return {
    type: actions.STOP_GAME,
    id: id
  };
}

function _toggleCell(x, y) {
  return {
    type: actions.TOGGLE_CELL,
    x: x,
    y: y
  };
}

function _increaseGeneration() {
  return {
    type: actions.INCREASE_GENERATION
  };
}

function clearGeneration() {
  return {
    type: actions.CLEAR_GENERATION
  };
}

function _updateGrid(grid) {
  return {
    type: actions.UPDATE_GRID,
    grid: grid
  };
}

function changeSpeed(speed) {
  return {
    type: actions.CHANGE_SPEED,
    speed: speed
  };
}

// Toggle random bool
function _toggleRandom() {
  return {
    type: actions.TOGGLE_RANDOM
  };
}

// Toggle view of the options
function _toggleOptions() {
  return {
    type: actions.TOGGLE_OPTIONS
  };
}

// Determines if this is the first run through of the script
function _toggleFirstLoad() {
  return {
    type: actions.TOGGLE_FIRST_LOAD
  };
}

var sizes = checkScreenSize([{ height: 30, width: 50 }, { height: 50, width: 70 }, { height: 70, width: 100 }]);

// Reducers
var initialState = Map({
  grid: gridGen(sizes[1].width, sizes[1].height, true),
  running: true,
  speed: 100,
  sizes: sizes,
  isRandom: true,
  optionsVisible: false,
  generation: 0,
  firstLoad: true
});

// Reducer
function gameOfLifeApp() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
  var action = arguments[1];

  switch (action.type) {

    case actions.START_GAME:
      return state.set('running', action.id);

    case actions.STOP_GAME:
      return state.set('running', false);

    case actions.TOGGLE_CELL:
      var temp = Object.assign([], state.get('grid'));
      temp[action.y][action.x].populated = !temp[action.y][action.x].populated;
      return state.set('grid', temp);

    case actions.INCREASE_GENERATION:
      return state.set('generation', state.get('generation') + 1);

    case actions.CLEAR_GENERATION:
      return state.set('generation', 0);

    case actions.UPDATE_GRID:
      if (action.grid) {
        return state.set('grid', action.grid);
      } else {
        return state.set('grid', checkGrid(state.get('grid')));
      }

    case actions.CHANGE_SPEED:
      return state.set('speed', action.speed);

    case actions.TOGGLE_RANDOM:
      return state.set('isRandom', !state.get('isRandom'));

    case actions.TOGGLE_OPTIONS:
      return state.set('optionsVisible', !state.get('optionsVisible'));

    case actions.TOGGLE_FIRST_LOAD:
      return state.set('firstLoad', false);

    default:
      return state;
  }
}

// Create Store/Reducer
var store = createStore(gameOfLifeApp);

// Components
// Main grid
var Grid = function Grid(_ref) {
  var grid = _ref.grid;
  var toggleCell = _ref.toggleCell;

  var HEIGHT = 400;
  var WIDTH = 600;
  var tableMargin = 10;
  var tableWidth = WIDTH;
  var tableHeight = HEIGHT;

  // Makes the grid smaller for small screens and changes to portrait view
  if (window.screen.availWidth <= 700) {
    tableWidth = HEIGHT / 2;
    tableHeight = WIDTH / 2;
  }

  var borderStyle = {
    margin: tableMargin + 'px auto',
    width: tableWidth + tableMargin * 4 * 2 + 'px',
    height: tableHeight + tableMargin * 4 * 2 + 'px'
  };

  var bezelStyle = {
    margin: tableMargin * 3 + 'px auto',
    width: tableWidth + tableMargin * 2 + 'px',
    height: tableHeight + tableMargin * 2 + 'px'
  };

  var tableStyle = {
    margin: tableMargin + 'px auto',
    width: tableWidth + 'px',
    height: tableHeight + 'px'
  };

  var cells = [];

  for (var y = 0; y < grid.length; y++) {
    var row = [];

    var _loop = function _loop(x) {
      var cell = Object.assign({}, grid[y][x]);
      row = row.concat(React.createElement('td', {
        id: cell.x + '' + cell.y,
        className: cell.populated ? 'cell populated ' + cell.color : 'cell',
        onClick: function onClick() {
          return toggleCell(cell.x, cell.y);
        }
      }));
    };

    for (var x = 0; x < grid[y].length; x++) {
      _loop(x);
    }
    cells = cells.concat(React.createElement(
      'tr',
      { className: 'row' },
      row
    ));
  }

  return React.createElement(
    'div',
    { style: borderStyle, className: 'table-screen-border' },
    React.createElement(GenerationCounter, null),
    React.createElement(
      'div',
      { style: bezelStyle, className: 'table-bezel' },
      React.createElement(
        'table',
        { style: tableStyle, id: 'grid' },
        React.createElement(
          'tbody',
          null,
          cells
        )
      )
    )
  );
};

var mapStateToGrid = function mapStateToGrid(state) {
  return {
    grid: state.get('grid')
  };
};

var mapDispatchToGrid = function mapDispatchToGrid(dispatch) {
  return {
    toggleCell: function toggleCell(x, y) {
      dispatch(_toggleCell(x, y));
    }
  };
};

Grid = connect(mapStateToGrid, mapDispatchToGrid)(Grid);

var GenerationCounter = function GenerationCounter(_ref2) {
  var generation = _ref2.generation;

  return React.createElement(
    'div',
    { className: 'generation-counter' },
    generation
  );
};

var mapStateToGenerationCounter = function mapStateToGenerationCounter(state) {
  return {
    generation: state.get('generation')
  };
};

GenerationCounter = connect(mapStateToGenerationCounter)(GenerationCounter);

var StartButton = function StartButton(_ref3) {
  var running = _ref3.running;
  var speed = _ref3.speed;
  var firstLoad = _ref3.firstLoad;
  var startGame = _ref3.startGame;
  var stopGame = _ref3.stopGame;
  var updateGrid = _ref3.updateGrid;
  var increaseGeneration = _ref3.increaseGeneration;
  var toggleFirstLoad = _ref3.toggleFirstLoad;

  var text = running ? 'Stop' : 'Start';
  var click = undefined;

  if (firstLoad) {
    toggleFirstLoad();
    startGame(setInterval(function () {
      updateGrid();
      increaseGeneration();
    }, speed));
  }

  if (!running) {
    click = function click() {
      startGame(setInterval(function () {
        updateGrid();
        increaseGeneration();
      }, speed));
    };
  } else {
    click = function click() {
      clearInterval(running);
      stopGame();
    };
  }

  return React.createElement(
    'button',
    { type: 'button', className: running ? 'btn btn-go' : 'btn', onClick: click },
    text
  );
};

var mapStateToStartButton = function mapStateToStartButton(state) {
  return {
    running: state.get('running'),
    speed: state.get('speed'),
    firstLoad: state.get('firstLoad')
  };
};

var mapDispatchToStartButton = function mapDispatchToStartButton(dispatch) {
  return {
    startGame: function startGame(id) {
      dispatch(_startGame(id));
    },
    stopGame: function stopGame() {
      dispatch(_stopGame());
    },
    updateGrid: function updateGrid() {
      dispatch(_updateGrid());
    },
    increaseGeneration: function increaseGeneration() {
      dispatch(_increaseGeneration());
    },
    toggleFirstLoad: function toggleFirstLoad() {
      dispatch(_toggleFirstLoad());
    }
  };
};

StartButton = connect(mapStateToStartButton, mapDispatchToStartButton)(StartButton);

var ClearButton = function ClearButton(_ref4) {
  var running = _ref4.running;
  var height = _ref4.height;
  var width = _ref4.width;
  var stopGame = _ref4.stopGame;
  var clearGrid = _ref4.clearGrid;

  var click = undefined;

  if (!running) {
    click = function click() {
      clearGrid(width, height);
    };
  } else {
    click = function click() {
      clearInterval(running);
      stopGame();
      clearGrid(width, height);
    };
  }

  return React.createElement(
    'button',
    { type: 'button', className: 'btn btn-clear', onClick: click },
    'Clear'
  );
};

var mapStateToClearButton = function mapStateToClearButton(state) {
  return {
    running: state.get('running'),
    height: state.get('grid').length,
    width: state.get('grid')[0].length
  };
};

var mapDispatchToClearButton = function mapDispatchToClearButton(dispatch) {
  return {
    stopGame: function stopGame() {
      dispatch(_stopGame());
    },
    clearGrid: function clearGrid(width, height, random) {
      dispatch(clearGeneration());
      dispatch(_updateGrid(gridGen(width, height, random)));
    }
  };
};

ClearButton = connect(mapStateToClearButton, mapDispatchToClearButton)(ClearButton);

var SizeButtons = function SizeButtons(_ref5) {
  var height = _ref5.height;
  var width = _ref5.width;
  var sizes = _ref5.sizes;
  var running = _ref5.running;
  var isRandom = _ref5.isRandom;
  var setSize = _ref5.setSize;

  return React.createElement(
    'div',
    { className: 'size-buttons' },
    sizes.map(function (size) {
      var isActive = '';
      if (width === size.width) {
        isActive = ' btn-active';
      }
      return React.createElement(
        'button',
        {
          className: 'btn' + isActive,
          disabled: running,
          onClick: function onClick() {
            return setSize(size.width, size.height, isRandom);
          }
        },
        size.width,
        ' x ',
        size.height
      );
    })
  );
};

var mapStateToSizeButtons = function mapStateToSizeButtons(state) {
  return {
    height: state.get('grid').length,
    width: state.get('grid')[0].length,
    sizes: state.get('sizes'),
    running: state.get('running'),
    isRandom: state.get('isRandom')
  };
};

var mapDispatchToSizeButtons = function mapDispatchToSizeButtons(dispatch) {
  return {
    setSize: function setSize(width, height, random) {
      dispatch(clearGeneration());
      dispatch(_updateGrid(gridGen(width, height, random)));
    }
  };
};

SizeButtons = connect(mapStateToSizeButtons, mapDispatchToSizeButtons)(SizeButtons);

var SpeedButtons = function SpeedButtons(_ref6) {
  var speed = _ref6.speed;
  var running = _ref6.running;
  var setSpeed = _ref6.setSpeed;

  var speeds = [{ Slow: 300 }, { Medium: 200 }, { Fast: 100 }];

  return React.createElement(
    'div',
    { className: 'speed-buttons' },
    speeds.map(function (speedObj) {
      var key = Object.keys(speedObj);
      var value = speedObj[key];
      var isActive = '';
      if (speed === value) {
        isActive = ' btn-active';
      }
      return React.createElement(
        'button',
        {
          className: 'btn' + isActive,
          disabled: running,
          onClick: function onClick() {
            return setSpeed(value);
          }
        },
        key
      );
    })
  );
};

var mapStateToSpeedButtons = function mapStateToSpeedButtons(state) {
  return {
    speed: state.get('speed'),
    running: state.get('running')
  };
};

var mapDispatchToSpeedButtons = function mapDispatchToSpeedButtons(dispatch) {
  return {
    setSpeed: function setSpeed(speed) {
      dispatch(changeSpeed(speed));
    }
  };
};

SpeedButtons = connect(mapStateToSpeedButtons, mapDispatchToSpeedButtons)(SpeedButtons);

var RandomButton = function RandomButton(_ref7) {
  var running = _ref7.running;
  var isRandom = _ref7.isRandom;
  var toggleRandom = _ref7.toggleRandom;

  var isActive = 'check';
  var title = '';

  if (isRandom) {
    isActive += ' checked';
    title = 'X';
  }

  return React.createElement(
    'div',
    {
      disabled: running,
      className: 'checkbox',
      onClick: toggleRandom
    },
    React.createElement(
      'div',
      { className: isActive },
      title
    )
  );
};

var mapStateToRandomButton = function mapStateToRandomButton(state) {
  return {
    running: state.get('running'),
    isRandom: state.get('isRandom')
  };
};

var mapDispatchToRandomButton = function mapDispatchToRandomButton(dispatch) {
  return {
    toggleRandom: function toggleRandom() {
      dispatch(_toggleRandom());
    }
  };
};

RandomButton = connect(mapStateToRandomButton, mapDispatchToRandomButton)(RandomButton);

var Options = function Options(_ref8) {
  var expanded = _ref8.expanded;
  var toggleOptions = _ref8.toggleOptions;

  var inlineStyle = undefined;
  var innerHtmlArrow = '▲';

  if (expanded) {
    inlineStyle = {
      bottom: '-165px'
    };
    innerHtmlArrow = '▼';
  }

  return React.createElement(
    'div',
    { style: inlineStyle, className: 'all-buttons' },
    React.createElement(
      'div',
      { onClick: toggleOptions, className: 'toggle-arrow' },
      innerHtmlArrow
    ),
    React.createElement(
      'div',
      { className: 'option-box' },
      React.createElement(
        'div',
        { className: 'option-container' },
        React.createElement(
          'div',
          { id: 'start-clear-btn-area', className: 'option-button-container' },
          React.createElement(StartButton, null),
          React.createElement(ClearButton, null)
        ),
        React.createElement(
          'div',
          { id: 'size-btn-area', className: 'option-button-container' },
          React.createElement(
            'label',
            null,
            'Size'
          ),
          React.createElement(SizeButtons, null)
        ),
        React.createElement(
          'div',
          { id: 'speed-btn-area', className: 'option-button-container' },
          React.createElement(
            'label',
            null,
            'Speed'
          ),
          React.createElement(SpeedButtons, null)
        ),
        React.createElement(
          'div',
          { id: 'random-btn-area', className: 'option-button-container' },
          React.createElement(
            'label',
            null,
            'Random'
          ),
          React.createElement(RandomButton, null)
        )
      )
    )
  );
};

var mapStateToOptions = function mapStateToOptions(state) {
  return {
    expanded: state.get('optionsVisible')
  };
};

var mapDispatchToOptions = function mapDispatchToOptions(dispatch) {
  return {
    toggleOptions: function toggleOptions() {
      dispatch(_toggleOptions());
    }
  };
};

Options = connect(mapStateToOptions, mapDispatchToOptions)(Options);

// Put together
var App = function App() {
  return React.createElement(
    'div',
    { id: 'root' },
    React.createElement(Grid, null),
    React.createElement(Options, null)
  );
};

// Render in Provider to create state everywhere
render(React.createElement(
  Provider,
  { store: store },
  React.createElement(App, null)
), document.getElementById('app'));