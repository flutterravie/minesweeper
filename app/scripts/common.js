$(function () {

	//клонирование строчки
	$.repeatString = function (value, count) {
        return (
            (new Array(count + 1)).join(value)
        );
    }

    $.randRange = function (minValue, maxValue) {
    	var diff = (maxValue - minValue);
    	var randomValue = Math.floor(Math.random() * diff);
    	return(minValue + randomValue);
    }

    $.fn.randomFilter = function (size) {
    	size = Math.min(size, this.size());

    	var indexes = new Array(this.size());

    	for (var i = 0; i < this.size(); i++){
    		indexes[i] = i;
    	}

    	var randomIndexes = {};

    	for (var i = 0; i < size; i++){
    		randomIndex = $.randRange(0, (indexes.length - 1));
    		randomIndexes[indexes[randomIndex]] = true;
    		indexes.splice(randomIndex, 1);
    	}

    	return(
    		this.filter(
    			function(index) {
    				return(index in randomIndexes);
    			}
    		)
    	);
    }

    $.fn.near = function () {
    	var nearNodes = $([]),
    	currentCell = $(this),
    	currentRow = currentCell.parent('tr'),
    	tbody = currentRow.parent(),
    	prevRow = currentRow.prev(),
    	nextRow = currentRow.next(),
    	currentCellIndex = currentRow.find('td').index(currentCell);

    	if (prevRow.size()){
    		var prevRowCell = prevRow.find('td:eq('+currentCellIndex+')');

    		nearNodes = nearNodes
    			.add(prevRowCell.prev())
    			.add(prevRowCell)
    			.add(prevRowCell.next());
    	};

    	nearNodes = nearNodes
    		.add(currentCell.prev())
    		.add(currentCell.next());

    	if (nextRow.size()){
    		var nextRowCell = nextRow.find('td:eq('+currentCellIndex+')');

    		nearNodes = nearNodes
    			.add(nextRowCell.prev())
    			.add(nextRowCell)
    			.add(nextRowCell.next());
    	};

    	return(nearNodes);
    }

    function countFilter (input) {
    	input = parseInt(input);
    	if (input < 0) {
    		input = Math.abs(input);
    	};
		return(input);
    }

	function mineSweeper(selector, colCount, rowCount, bombCount) {
		var self = this;
		this.field = $(selector);
		this.colCount = (countFilter(colCount) || 10);
		this.rowCount = (countFilter(rowCount) || 10);
		this.bombCount = (countFilter(bombCount) || 10);

		this.field.mousedown(function (event) {
			onClick(event);
			return(false);
		});
		
		initField();
	}

	function clearField () {
		this.field.empty();
	}

	function buildField () {
		var rowCode = ('<tr>' + $.repeatString('<td class=\'active\'/>', this.colCount) + '</tr>');
		var fieldCode = $.repeatString(rowCode, this.rowCount);
		this.field.html(fieldCode);
	}

	function checkEndGame () {
		var message = '';
		var isEndGame = false;

		if (this.bombCells.filter('.bombed').size()) {
			isEndGame = true;
		}	else if (!this.nonBombCells.filter('.active').size()) {
			isEndGame = true;
		}
	}

	function initField () {
		clearField();
		buildField();

		this.cells = this.field.find('td');
		this.cells.data('nearBombs',0);

		this.cells.each(
			function(index, cellNode){
				var cell = $(this);
				cell.data('near', cell.near());
			}
		);

		this.bombCells = this.cells
			.randomFilter(this.bombCount)
			.addClass('bomb');

		this.nonBombCells = this.cells.filter(function (index) {
			return(self.bombCells.index(this) == -1);
		});

		this.bombCells.each(function (index, node){
			var cell = $(this),
			nearCells = cell.data('near');

			nearCells.each(function () {
				var nearCell = $(this);
				nearCell.data('nearBombs',(nearCell.data('nearBombs')+1));
			});
		});
	}

	function onClick (event) {
		var target = $(event.target);
		switch (event.which) {
			case 1:
				if (!target.is('td.active')){
					return;
				}
				if (event.altKey){
					toggleCaution(target);
				} else {
					revealCell(target);
				}
				checkEndGame();
				break;
			case 3:
				toggleCaution(target);
				return false;
				break;
		}
	};

	function restart () {
		initField();
	}

	function revealField () {
		this.cells
			.removeClass('caution');

		this.bombCells.addClass('bombed').removeClass('active');

		$('.js-face').addClass('sweeper-face_bomb');

		/*this.cells.each(function (index, cellNode){
			var cell = $(this);
			if (cell.data('nearBombs')){
				cell.html(cell.data('nearBombs'));
			}

			if (cell.is('.bomb')){
				cell.html('&nbsp;');
			}
		});*/
	}

	function revealCell (cell) {
		var self = this;

		cell
			.removeClass('active')
			.removeClass('caution');

		if ((cell).is('.bomb')){
			revealField();
		}

		if ((!cell.is('.bomb')) && (cell.data('nearBombs'))){
			cell.html(cell.data('nearBombs'));
		} else {
			cell.html('&nbsp;');
			cell.data('near')
				.filter('.active').each(function (index, cellNode){
					revealCell($(this));
				});
		}
	}

	function toggleCaution (cell) {
		cell.toggleClass('caution');
	}

	$('.js-start').on('click', function () {
		$('.js-minesweeper').empty();
		mineSweeper($('.js-minesweeper'),
			$('.js-rows').val(),
			$('.js-cols').val(),
			$('.js-bombs').val()
		);
	});

	mineSweeper($('.js-minesweeper'), 9, 9, 10);

	$(document).ready(function() {
		$(document)[0].oncontextmenu = function() {return false};
	});

});
