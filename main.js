// Все глобальные переменные
//Счётчик плохих точек
unavaliablePoints = [];
//Номер хода
turnCount = 0;
//Имя Пользователя
userName = '';
//ХП
userHp = 20;
aiHp = 20;
//Запрещаем точки для хода компьютеру
aiCantShoot = [];
//Скорость компьютера, задаётся на ползунке, по умолчанию 2
speedRange = 2;
//Массив объектов - кораблей пользователя и компьютера
userShips = [];
aiShips = [];

//Начинаем
$(document).ready(function() {
    makeBattlefields();
    setUserName();
});

//Главные функции
//Начинаем игру, проверяем установлено ли имя пользователя
function startGame() {
  if (userName === '') {
    $('#input-name').addClass('error');
  } else {
    $('.memo-span').remove();
    $('.memo-head').append($('<span class="memo-span">Сражение началось..</span>'));
    $('.memo-head').addClass('animated-bg');
    setTimeout(function () {
      $('.memo-span').remove();
      $('.memo-head').append($('<span class="memo-span">Ход боя</span>'));
      return false;
    }, 2000);
    startRealBattle();
    setSettings();
    return false;
  }
}
//Сбрасывает все глобальные переменные, обновляет поля игроков, украшательства
function refreshBattlefields() {
  unavaliablePoints = [];
  turnCount = 0;
  userHp = 20;
  aiHp = 20;
  aiCantShoot = [];
  userShips = [];
  aiShips = [];
  $('.battlefield').html('');
  $('.memo-head').removeClass('animated-bg');
  $('.memo-span').html('Информация');
  $('.memo-body').children().not('.memo-start-info').remove();
  $("input").removeAttr("disabled");
  makeBattlefields();
}
//Начинаем сражение, т.е. игрок делает клик
function startRealBattle() {
  $('#user-turn-indicator').removeClass('hide');  //ставим пользователю индикатор
  $('.ai-battlefield').find($('.square')).on( "click", function() {
    var attr = $(this).attr('turn-number');
    if (typeof attr !== typeof undefined && attr !== false) { //если у ячейки есть атрибут с номером хода - ничего не делаем
      console.log('Вы уже сюда ходили..');
      return false;
    } else {
      turnCount++;
      $(this).attr('turn-number', turnCount);
      if ( $(this).hasClass("ai-ship-square") ) {
        aiHp--;
        addHistory('player', turnCount, 'попал');// добавляем плашку с информацией о ходе
        $(this).addClass('defeated-square');// Визуально уничатажаем ячейку
        isShipDestroyed($(this), 'player');// Если корабль уничтожен, закрываем ячейку вокруг него.
        if (aiHp === 0) {
          return gameOver('win');
        }
        return false;
      } else {
        addHistory('player', turnCount, 'промахнулся');
        $(this).addClass('miss-square');
        $('#user-turn-indicator').addClass('hide');
        $('#ai-turn-indicator').removeClass('hide');
        $('#ai-battlefield').find($('.square')).addClass('unclickable');
        $('#refresh-btn').attr("disabled", true);
        return setTimeout( function() { aiFire(); }, speedRange);//Передаем ход компьютеру, тот с установленной задержкой ходит
      }
    }
  });
}
//Ход компьютера
function aiFire() {
  turnCount++;
  var aiTarget = new Point(randomInteger(1, 10), randomInteger(1, 10));// Рандомит точку пока она не станет валидной для хода
  while (contains(aiCantShoot, aiTarget)) {
    aiTarget = new Point(randomInteger(1, 10), randomInteger(1, 10));
  }
  aiCantShoot.push(aiTarget);// Добавляем в массив недоступных для хода компьютера точек
  var targetOnField = $('#user-battlefield').find($('[coord-x ="' +aiTarget.x+ '"][coord-y ="' +aiTarget.y+ '"]'));
  if (targetOnField.hasClass('user-ship-square')) {
    targetOnField.addClass('defeated-square');
    targetOnField.attr('turn-number', turnCount);
    addHistory('ai', turnCount, 'попал');
    isShipDestroyed(targetOnField, 'ai');
    userHp--;
    if (userHp === 0) {
      return gameOver('lose');
    }
    return aiFire();
  } else {
    targetOnField.addClass('miss-square');
    targetOnField.attr('turn-number', turnCount);
    addHistory('ai', turnCount, 'промахнулся');
  }
  $('#ai-turn-indicator').addClass('hide');
  $('#user-turn-indicator').removeClass('hide');
  $('#ai-battlefield').find($('.square')).removeClass('unclickable');
  $('#refresh-btn').removeAttr('disabled');
  return false;
}
//Создает размеченные поля и наполняет кораблями
function makeBattlefields() {
  var userField = $('.user-battlefield');
  var aiField = $('.ai-battlefield');
  for (var i = 1; i < 11; i++) {
    for (var j = 1; j < 11; j++) {
      var userElement = $('<div class="square"></div>');
      userElement.attr('coord-x', j);
      userElement.attr('coord-y', i);
      var aiElement = $('<div class="square"></div>');
      aiElement.attr('coord-x', j);
      aiElement.attr('coord-y', i);
      userField.append(userElement);
      aiField.append(aiElement);
    }
  }
  createUserShip('battleship');
  createUserShip('cruiser');
  createUserShip('cruiser');
  createUserShip('destroyer');
  createUserShip('destroyer');
  createUserShip('destroyer');
  createUserShip('boat');
  createUserShip('boat');
  createUserShip('boat');
  createUserShip('boat');
  console.log(unavaliablePoints);
  unavaliablePoints = [];
  createAiShip('battleship');
  createAiShip('cruiser');
  createAiShip('cruiser');
  createAiShip('destroyer');
  createAiShip('destroyer');
  createAiShip('destroyer');
  createAiShip('boat');
  createAiShip('boat');
  createAiShip('boat');
  createAiShip('boat');
}

//Классы
//Просто класс для точки
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
//Класс корабль с методами
class Ship {
  constructor(name) {
    this.name = name;
    this.defeated = 0;
    switch (name) {
      case 'battleship':
      this.size = 4;
      break;
      case 'cruiser':
      this.size = 3;
      break;
      case 'destroyer':
      this.size = 2;
      break;
      case 'boat':
      this.size = 1;
      break;
    }
  }
  //Сначала рандомим позицию корабля - вертикальная или горизонтальная
  setRandomPosition() {
    var rand = randomInteger(1, 2);
    switch (rand) {
      case 1:
      this.position = 'horizontal';
      break;
      case 2:
      this.position = 'vertical';
      break;
    }
  }
  //Потом на основе длины корабля ограничиваем верхнюю границу для рандома
  setRandomCoords() {
    var direction;
    var startPoint = [];
    var limitX = 10;
    var limitY = 10;
    switch (this.position) {
      case 'horizontal':
      limitX = limitX - this.size + 1;
      direction = 'right';
      break;
      case 'vertical':
      limitY = limitY - this.size +1;
      direction = 'down';
    }
    startPoint = new Point(randomInteger(1, limitX), randomInteger(1, limitY));
    var restPoints = addPoints(startPoint, direction, this.size);
    this.points = restPoints;
  }
  //После того как корабль с кординатами и уместился на поле, баним его квадраты и квадраты вокруг него
  banClosePoints() {
    var points = this.points;
    var bannedPoints = [];
    var startPoint = points[0];
    var endPoint = points[this.size - 1];
    if (this.position === 'horizontal') {
      console.log(startPoint);
      console.log(endPoint);
      points.forEach(function(element) {
        bannedPoints.push(new Point(element.x, element.y));
        bannedPoints.push(new Point(element.x, element.y + 1));
        bannedPoints.push(new Point(element.x, element.y - 1));
      });
      bannedPoints.push(new Point(startPoint.x - 1, startPoint.y));
      bannedPoints.push(new Point(startPoint.x - 1, startPoint.y + 1));
      bannedPoints.push(new Point(startPoint.x - 1, startPoint.y - 1));
      bannedPoints.push(new Point(endPoint.x + 1, endPoint.y));
      bannedPoints.push(new Point(endPoint.x + 1, endPoint.y + 1));
      bannedPoints.push(new Point(endPoint.x + 1, endPoint.y - 1));
    } else {
      points.forEach(function(element) {
        bannedPoints.push(new Point(element.x, element.y));
        bannedPoints.push(new Point(element.x + 1, element.y));
        bannedPoints.push(new Point(element.x - 1, element.y));
      });
      bannedPoints.push(new Point(startPoint.x, startPoint.y - 1));
      bannedPoints.push(new Point(startPoint.x - 1, startPoint.y - 1));
      bannedPoints.push(new Point(startPoint.x + 1, startPoint.y - 1));
      bannedPoints.push(new Point(endPoint.x, endPoint.y + 1));
      bannedPoints.push(new Point(endPoint.x - 1, endPoint.y + 1));
      bannedPoints.push(new Point(endPoint.x + 1, endPoint.y + 1));
    }
    bannedPoints.forEach(function(element) {
      unavaliablePoints.push(element);
    });
  }
  //Проверяем есть ли точка в массиве недоступных точек
  checkPointsLegit() {
    var points = this.points;
    var counter = 0;
    for (var i = 0; i < points.length; i++) {
      if (contains(unavaliablePoints, points[i])) return false;
    }
    return true;
  }
}

//Вторые по важности функции
function setSettings() {
  speedRange = document.getElementById("speed-range").value;
  switch (speedRange) {
    case '0':
    speedRange = 3000;
    break;
    case '1':
    speedRange = 2000;
    break;
    case '2':
    speedRange = 1000;
    break;
    case '3':
    speedRange = 0;
    break;
  }
  $('input').attr("disabled", true);
  return false;
}
//Проверяет все ли точки корабля уничтожены
function isShipDestroyed(square, turn) {
  var point = new Point(+square.attr('coord-x'), +square.attr('coord-y'));
  var whichShips;
  switch (turn) {
    case 'player':
    whichShips = aiShips;
    break;
    case 'ai':
    whichShips = userShips;
    break;
  }
  for (var i = 0; i < 10; i++) {
    if (contains(whichShips[i].points, point)) {
      console.log('Удаляем точку');
      removePoint(whichShips[i].points, point);
      whichShips[i].defeated++;
      if (whichShips[i].size === whichShips[i].defeated) {
        console.log('Корабль уничтожен');
        addDefeatedShip(whichShips[i].defeated, turn);
        noNeedToShot(whichShips[i], turn);
      }
    }
  }
}
//Отрисовывает и запрещает для компьютера точки, появляющиеся вокруг корабля после его уничтожения
function noNeedToShot(ship, turn) {
  var checkedPoints = [];
  var points = ship.points;
  var startPoint = ship.points[0];
  var endPoint = ship.points[ship.size - 1];
  var needleBattlefield;
  switch (turn) {
    case 'player':
    needleBattlefield = '#ai-battlefield';
    break;
    case 'ai':
    needleBattlefield = '#user-battlefield';
    break;
  }
  console.log('Ship pos - '+ship.position);
  if (ship.position === 'horizontal') {
    points.forEach(function(element) {
      checkedPoints.push(new Point(element.x, element.y + 1));
      checkedPoints.push(new Point(element.x, element.y - 1));
    });
    checkedPoints.push(new Point(startPoint.x - 1, startPoint.y));
    checkedPoints.push(new Point(startPoint.x - 1, startPoint.y + 1));
    checkedPoints.push(new Point(startPoint.x - 1, startPoint.y - 1));
    checkedPoints.push(new Point(endPoint.x + 1, endPoint.y));
    checkedPoints.push(new Point(endPoint.x + 1, endPoint.y + 1));
    checkedPoints.push(new Point(endPoint.x + 1, endPoint.y - 1));
  } else {
    points.forEach(function(element) {
      checkedPoints.push(new Point(element.x + 1, element.y));
      checkedPoints.push(new Point(element.x - 1, element.y));
    });
    checkedPoints.push(new Point(startPoint.x, startPoint.y - 1));
    checkedPoints.push(new Point(startPoint.x - 1, startPoint.y - 1));
    checkedPoints.push(new Point(startPoint.x + 1, startPoint.y - 1));
    checkedPoints.push(new Point(endPoint.x, endPoint.y + 1));
    checkedPoints.push(new Point(endPoint.x - 1, endPoint.y + 1));
    checkedPoints.push(new Point(endPoint.x + 1, endPoint.y + 1));
  }
  checkedPoints.forEach( function(element) {
    var x = element.x;
    var y = element.y;
    if (turn === 'ai') {
      aiCantShoot.push(element);
    }
    var square = $(needleBattlefield).find($('[coord-x ="' +x+ '"][coord-y ="' +y+ '"]'));
    if (!square.hasClass('miss-square') && !square.hasClass('defeated-square')) {
      square.addClass('checked-square unclickable');
    }
  });
  console.log(checkedPoints);
  console.log('Корабль вокруг которого убрать точки');
  console.log(ship);
  return false;
}
//Удаляет точку (метит)
function removePoint(array, point) {
    var x = point.x;
    var y = point.y;
    array.forEach( function(element) {
      if (element.x === x && element.y === y) {
        element.status = 'defeated';
      }
    });
    return false;
}

// Функции по визуальной части
//Выводим плашку с информацией о ходе
function addHistory(turn, turnCount, action) {
  var playerTurn = '<div class="turn-info" data-turn="'+turnCount+'">Игрок <span class="history-turn-name">'+userName+'</span> на ходу №<span class="history-turn-number">'+turnCount+ '</span> ' +action+'</div>';
  var aiTurn = '<div class="turn-info" data-turn="'+turnCount+'">Компьютер на ходу №<span class="history-turn-number">'+turnCount+ '</span> ' +action+'</div>';
  switch (turn) {
    case 'player':
    $('.memo-body').prepend(playerTurn);
    historySight();
    break;
    case 'ai':
    $('.memo-body').prepend(aiTurn);
    historySight();
    break;
  }
  return false;
}
//Отдельная функция для плашек с информацией о потопленных кораблях
function addDefeatedShip(size, turn) {
  var deck = 0;
  var user;
  var turnInfo;
  switch (size) {
    case 4:
    deck = 'линкор';
    break;
    case 3:
    deck = 'крейсер';
    break;
    case 2:
    deck = 'эсминец';
    break;
    case 1:
    deck = 'торпедный катер';
  }
  switch (turn) {
    case 'player':
    user = 'Игрок <span class="history-turn-name">'+userName+'</span>';
    break;
    case 'ai':
    user = 'Компьютер';
  }
  turnInfo = '<div class="turn-info">'+user+' потопил <span class="history-turn-ship">'+deck+'</span> соперника!</div>';
  $('.memo-body').prepend(turnInfo);
  return false;
}
//При завершении игры выводит попап
function gameOver(result) {
  var gifNumber = randomInteger(1, 6);
  switch (result) {
    case 'win':
    $('.page-wrapper').addClass('blur-filter');
    $('#win-gif-container').html('');
    $('#win-gif-container').append($('<img class="gif-animation" src="./gif/'+gifNumber+'-win.gif"/>'));
    $('#win-popup').removeClass('no-display');
    break;
    case 'lose':
    $('.page-wrapper').addClass('blur-filter');
    $('#lose-gif-container').html('');
    $('#lose-gif-container').append($('<img class="gif-animation" src="./gif/'+gifNumber+'-lose.gif"/>'));
    $('#lose-popup').removeClass('no-display');
    break;
  }
  return false;
}
//Запрещает делать ходы пользователю, если тот после победы или поражения закроет попап, чтобы посмотреть историю ходов
function freezeBattlefield() {
  $('#ai-battlefield').find($('.square')).addClass('unclickable');
  return false;
}
//При наведении на плашку с информацией о ходе, подсвечиваем ячейку на поле, которая была поражена на соответственном ходу
function historySight() {
  $(".turn-info")
  .mouseenter(function() {
    var dataTurn = $(this).attr('data-turn');
    $('[turn-number="' +dataTurn+ '"]').addClass('lightup');
  })
  .mouseleave(function() {
    var dataTurn = $(this).attr('data-turn');
    $('[turn-number="' +dataTurn+ '"]').removeClass('lightup');
  });
}
//Закрывает попап
function closePopup(id) {
  $(id).addClass('no-display');
  $('.page-wrapper').removeClass('blur-filter');
}
//Отображаем корабли на поле пользователя
function renderUserShip(shipObj) {
  var ship = shipObj;
  var renderPoints = ship.points;
  renderPoints.forEach(function(element) {
    var x = element.x;
    var y = element.y;
    $('#user-battlefield').find($('[coord-x ="' +x+ '"][coord-y ="' +y+ '"]')).addClass('user-ship-square');
  });
}
//"Отображаем" корабли на поле компьютера
function renderAiShip(shipObj) {
  var ship = shipObj;
  var renderPoints = ship.points;
  renderPoints.forEach(function(element) {
    var x = element.x;
    var y = element.y;
    $('#ai-battlefield').find($('[coord-x ="' +x+ '"][coord-y ="' +y+ '"]')).addClass('ai-ship-square');
  });
}
//Устанавливаем имя пользователя
function setUserName() {
  $('#name-submit').on( "click", function() {
    var name = $("#input-name").val();
    if (name === '') {
      $("#input-name").addClass('error');
    } else {
      $('#user-player-name').html(name);
      $("#input-name").addClass('no-display');
      $("#name-submit").addClass('no-display');
      userName = name;
    }
  });
}

//Вспомогательные функции
//Проверяет содержится ли точка в массиве точек
function contains(arr, elem) {
  var point = [elem.x, elem.y];
  var counter = 0;
  arr.forEach(function(element){
      if (element.x === point[0] && element.y === point[1]) {
        counter++;
      }
  });
  result = (counter > 0) ? true : false;
  return result;
}
//Создаёт и отрисовывает корабль пользователя
function createUserShip(name) {
  var shippy = new Ship(name);
  var isLegit = false;
  while (isLegit === false) {
    shippy.setRandomPosition();
    shippy.setRandomCoords();
    isLegit = shippy.checkPointsLegit();
    console.log(isLegit);
  }
  shippy.banClosePoints();
  console.log(isLegit);
  console.log(shippy);
  userShips.push(shippy);
  renderUserShip(shippy);
}
//Создаёт и отрисовывает корабль компьютера
function createAiShip(name) {
  var shippy = new Ship(name);
  var isLegit = false;
  while (isLegit === false) {
    shippy.setRandomPosition();
    shippy.setRandomCoords();
    isLegit = shippy.checkPointsLegit();
    console.log(isLegit);
  }
  shippy.banClosePoints();
  console.log(isLegit);
  console.log(shippy);
  aiShips.push(shippy);
  renderAiShip(shippy);
}
//Рандом
function randomInteger(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}
//Добавляет точки кораблю в зависимости от направления и размера
function addPoints(startPoint, direction, size) {
  var resultCoords = [startPoint];
  var startX = startPoint.x;
  var startY = startPoint.y;
  switch (direction) {
    case 'right':
    for (var i = 1; i < size; i++) {
      var newPoint = new Point(startX + i, startY);
      resultCoords.push(newPoint);
    }
    break;
    case 'down':
    for (var i = 1; i < size; i++) {
      var newPoint = new Point(startX, startY + i);
      resultCoords.push(newPoint);
    }
    break;
  }
  return resultCoords;
}
