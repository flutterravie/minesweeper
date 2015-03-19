$(function () {

	var bombsLeft = 0,
	face = $('.js-face'), // блок лица сверху; изменяется при определённых событиях
	dropdown = $('.js-menu-dropdown'), // выпадающее меню
	timer = $('.js-timer'), // таймер (слева сверху)
	points = $('.js-points'); // счётчик очков (справа сверху)

	// повторяем одну и ту же строчку (value) указанное число раз (count)
	$.repeatString = function (value, count) {
		return (
			(new Array(count + 1)).join(value)
		);
	};

	// получаем случайное значение между minValue и maxValue
	$.randRange = function (minValue, maxValue) {
		var diff = (maxValue - minValue);
		var randomValue = Math.floor(Math.random() * diff);
		return (minValue + randomValue);
	};

	// выбираем опр. количество (size) случайных элементов из указанного множества элементов
	$.fn.randomFilter = function (size) {

		// проверяем, что больше — size или число элементов в указанном множестве
		size = Math.min(size, this.size());

		// массив индексов элементов
		var indexes = new Array(this.size());

		// назначаем каждому элементу массива его номер в качестве значения
		for (var i = 0; i < this.size(); i++) {
			indexes[i] = i;
		}

		// здесь будем хранить выбранные случайно индексы
		var randomIndexes = {};

		// выбираем size случайных элементов
		for (var i = 0; i < size; i++) {
			randomIndex = $.randRange(0, (indexes.length - 1));
			randomIndexes[indexes[randomIndex]] = true;
			indexes.splice(randomIndex, 1);
		}

		// возвращаем полученный список элементов
		return (
			this.filter(
				function (index) {
					return (index in randomIndexes);
				}
			)
		);
	};

	// обозначаем для каждой клетки все клетки, находящиеся рядом
	$.fn.near = function () {
		var nearNodes = $([]),
		currentCell = $(this),
		currentRow = currentCell.parent('tr'),
		prevRow = currentRow.prev(),
		nextRow = currentRow.next(),
		currentCellIndex = currentRow.find('td').index(currentCell);

		// если есть предыдущий ряд, добавляем клетки из него
		if (prevRow.size()) {
			var prevRowCell = prevRow.find('td:eq(' + currentCellIndex + ')');

			nearNodes = nearNodes
				.add(prevRowCell.prev())
				.add(prevRowCell)
				.add(prevRowCell.next());
		}

		// если есть клетки слева/справа, добавляем их
		nearNodes = nearNodes
			.add(currentCell.prev())
			.add(currentCell.next());

		// если есть предыдущий ряд, добавляем клетки из него
		if (nextRow.size()) {
			var nextRowCell = nextRow.find('td:eq(' + currentCellIndex + ')');

			nearNodes = nearNodes
				.add(nextRowCell.prev())
				.add(nextRowCell)
				.add(nextRowCell.next());
		}

		// возвращаем все соседние клетки
		return (nearNodes);
	};

	// фильтр вводимых в основную функцию значений
	// превращает строковые значения в цифры, а если они отрицательны, делает их положительными
	function countFilter(input) {
		input = parseInt(input);
		if (input < 0) {
			input = Math.abs(input);
		}
		return (input);
	}

	function mineSweeper(selector, colCount, rowCount, bombCount) {
		// вводим основные переменные: блок поля, количество колонок, столбцов и бомб
		this.field = $(selector);
		this.colCount = (countFilter(colCount) || 9);
		this.rowCount = (countFilter(rowCount) || 9);
		this.bombCount = (countFilter(bombCount) || 10);
		if (this.bombCount > (this.colCount * this.rowCount)) {
			this.bombCount = this.colCount * this.rowCount;
		}

		// запускаем создание поля
		initField();
	}

	// функция для очистки поля
	// при запуске удаляет всё содержимое this.field
	clearField = function () {
		this.field.empty();
	};

	// функция для построения кода поля
	// при запуске создаёт html-таблицу с указанным количеством столбцов и колонок
	buildField = function () {
		var rowCode = ('<tr>' + $.repeatString('<td class=\'active\'/>', this.colCount) + '</tr>');
		var fieldCode = $.repeatString(rowCode, this.rowCount);
		this.field.html(fieldCode);
	};

	// функция для проверки окончания игры
	checkEndGame = function () {
		var isEndGame = false;

		// если одна из бомб взорвалась
		if (this.bombCells.filter('.bombed').size()) {
			this.field.off();
			isEndGame = true;
		// если все клетки без бомб открыты
		} else if (!this.nonBombCells.filter('.active').size()) {
			face.addClass('sweeper-face_win');
			this.bombCells.addClass('caution');
			timer.addClass('js-timer-pause');
			bombsLeft = 0;
			points.attr('data-bombs', bombsLeft).text(bombsLeft);
			this.field.off();
			isEndGame = true;
		}
	};

	// функция для работы поля
	initField = function () {
		clearField();
		buildField();

		face.removeClass().addClass('sweeper-face');

		// находим все клетки поля и получаем доступ к ним через одну переменную
		this.cells = this.field.find('td');

		// начальное значение бомб в соседних клетках
		this.cells.data('nearBombs', 0);

		// для каждой клетки обозначаем соседей
		this.cells.each(
			function () {
				$(this).data('near', $(this).near());
			}
		);

		// «закладываем бомбы» в случайные клетки
		this.bombCells = this.cells
			.randomFilter(this.bombCount)
			.addClass('bomb');

		// находим все клетки без бомб
		this.nonBombCells = this.cells.filter(function (index) {
			return (self.bombCells.index(this) === -1);
		});

		// для всех клеток рядом с бомбами обозначаем количество бомб
		this.bombCells.each(function () {
			var cell = $(this),
			nearCells = cell.data('near');

			nearCells.each(function () {
				var nearCell = $(this);
				nearCell.data('nearBombs', (nearCell.data('nearBombs') + 1));
			});

		});

		// отображаем количество бомб при нажатии на клетку
		this.cells.each(function () {
			var cell = $(this);
			switch ($(this).data('nearBombs')){
				case 1:
					cell.addClass('mines mines-1');
					break;
				case 2:
					cell.addClass('mines mines-2');
					break;
				case 3:
					cell.addClass('mines mines-3');
					break;
				case 4:
					cell.addClass('mines mines-4');
					break;
				case 5:
					cell.addClass('mines mines-5');
					break;
				case 6:
					cell.addClass('mines mines-6');
					break;
				case 7:
					cell.addClass('mines mines-7');
					break;
				case 8:
					cell.addClass('mines mines-8');
					break;
			}
		});

		// обозначаем, сколько бомб есть на поле (левый счётчик сверху)
		bombsLeft = this.bombCount;
		points.text(bombsLeft).attr('data-bombs', bombsLeft);

		// при нажатии в область поля начинается отсчёт времени в таймере (правый счётчик сверху)
		this.field.on('mousedown', function () {
			face.addClass('sweeper-face_wow');
			timer.addClass('js-timer-active');
			return false;
		});

		// апускаем функцию нажатия на клетку при нажатии на клетку (sic!)
		this.cells.on('mousedown', function (event) {
			onClick(event);
		});
	};

	// функция нажатия на клетку
	onClick = function (event) {
		var target = $(event.target);

		// если на клетку нельзя нажать, то не нажимаем
		if (!target.is('.active')) {
			return;
		// если можно нажать…
		} else {
			switch (event.which) {
				// …и нажата ЛКМ (параметр 1 у функции switch), то открываем клетку, если на ней нет флажка и проверяем, не окончена ли игра
				case 1:
					if (target.is('.caution')) {
						return;
					} else {
						revealCell(target);
					}
					checkEndGame();
					break;
				// …и нажата ПКМ (параметр 3 у функции switch), то ставим/убираем флажок
				case 3:
					toggleCaution(target);
					break;
			}
		}
	};

	// функция перезапуска игры
	restart = function () {
		this.field.on();
		initField();
		timer.removeClass('js-timer-pause js-timer-active');
	};

	// функция открытия поля
	revealField = function () {
		// показываем клетки с бомбами
		this.bombCells.addClass('bombed').removeClass('caution active');

		face.addClass('sweeper-face_bomb');

		// останавливаем таймер
		timer.addClass('js-timer-pause');

		// запрещаем нажатие на поле
		this.cells.off();
	};

	// функция открытия клетки
	revealCell = function (cell) {

		// показываем, что клетка нажата
		cell.removeClass('active');

		// если в ней была бомба, показываем всё поле
		if ((cell).is('.bomb')) {
			revealField();
		}

		// если бомб нет, но они есть рядом, то открывается эта клетка
		if ((!cell.is('.bomb')) && (cell.data('nearBombs'))) {
			return false;
		} else if (!cell.is('.bomb')) {
		// а если рядом бомб тоже нет, то открываем каждую из соседних клеток;
		// клетки будут открываться, пока не образуется граница из клеток с соседями-бомбами
			cell.data('near')
				.filter('.active').each(function () {
					revealCell($(this));
				});
		}
	};

	// ставим на клетку флажок и изменяем счётчик бомб
	toggleCaution = function (cell) {
		if (!cell.hasClass('caution')) {
			cell.addClass('caution');
			bombsLeft--;
		} else {
			cell.removeClass('caution');
			bombsLeft++;
		}
		if (bombsLeft >= 0) {
			points.text(bombsLeft);
		}
		points.attr('data-bombs', bombsLeft);
	};

	// изначально игра запускается в стандартной раскладке 9х9 с 10 бомбами
	mineSweeper($('.js-minesweeper'), 9, 9, 10);

	$(document).mouseup(function () {
		face.removeClass('sweeper-face_wow');
	});

	// перезапуск игры при нажатии на лицо сверху
	face.mousedown(function () {
		$(this).addClass('sweeper-face_active');
	}).mouseup(function () {
		$(this).removeClass('sweeper-face_active');
		restart();
	});

	// выключаем нажатие ПКМ
	$(document).ready(function () {
		$(document)[0].oncontextmenu = function () {
			return false;
		};
	});

	// открываем/прячем меню
	$('.js-menu-btn').click(function () {
		dropdown.toggle();
	});

	$('.js-menu-item').click(function () {
		dropdown.hide();
	});

	$('html').click(function () {
		dropdown.hide();
	});

	$('.js-menu').click(function (event) {
		event.stopPropagation();
	});

	// перезапускаем игру при выборе одной из стандартных сложностей
	$('.js-diff-1').click(function () {
		mineSweeper($('.js-minesweeper'), 9, 9, 10);
		timer.removeClass('js-timer-pause js-timer-active');
	});

	$('.js-diff-2').click(function () {
		mineSweeper($('.js-minesweeper'), 16, 16, 40);
		timer.removeClass('js-timer-pause js-timer-active');
	});

	$('.js-diff-3').click(function () {
		mineSweeper($('.js-minesweeper'), 30, 16, 99);
		timer.removeClass('js-timer-pause js-timer-active');
	});

	// открываем окно запуска своей игры
	$('.js-custom').click(function () {
		$('.js-settings').show();
	});

	// при нажатии на OK запускаем игру со своими параметрами и закрываем окно запуска
	$('.js-btn-ok').click(function () {
		mineSweeper($('.js-minesweeper'),
			$('.js-rows').val(),
			$('.js-cols').val(),
			$('.js-bombs').val()
		);
		$('.js-settings').hide();
	});

	// открываем окно информации об игре
	$('.js-about-btn').click(function () {
		$('.js-about').show();
	});

	// закрываем окно при нажатии на кнопку закрытия
	$('.js-btn-cancel').click(function () {
		$('.js-settings').hide();
		$('.js-about').hide();
	});

});
