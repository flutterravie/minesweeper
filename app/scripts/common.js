$(function () {

	var face = $('.js-face');

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
			this.field.off();
			isEndGame = true;
		}	else if (!this.nonBombCells.filter('.active').size()) {
			face.addClass('sweeper-face_win');
			this.bombCells.addClass('caution');
			this.field.off();
			isEndGame = true;
		}
	}

	function initField () {
		clearField();
		buildField();

		face.removeClass().addClass('sweeper-face');

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

		this.cells.each(function (){
			var cell = $(this);

			switch ($(this).data('nearBombs')){
				case 1:
					cell.addClass('mines mines-1');
					break
				case 2:
					cell.addClass('mines mines-2');
					break
				case 3:
					cell.addClass('mines mines-3');
					break
				case 4:
					cell.addClass('mines mines-4');
					break
				case 5:
					cell.addClass('mines mines-5');
					break
				case 6:
					cell.addClass('mines mines-6');
					break
				case 7:
					cell.addClass('mines mines-7');
					break
				case 8:
					cell.addClass('mines mines-8');
					break
			}
		});
		
		this.field.mousedown(function (event) {
			onClick(event);
			face.addClass('sweeper-face_wow');
			return(false);
		});
	}

	function onClick (event) {
		var target = $(event.target);

		if (!target.is('.active')){
			return;
		} else {
			switch (event.which) {
				case 1:
					if (target.is('.caution')){
						return;
					} else {
						revealCell(target);
					}
					checkEndGame();
					break;
				case 3:
					toggleCaution(target);
					break;
			}
		};
	};

	function restart () {
		this.field.on();
		initField();
	}

	function revealField () {
		this.bombCells.addClass('bombed').removeClass('caution active');

		face.addClass('sweeper-face_bomb');

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
			return false;
		} else if (!cell.is('.bomb')) {
			cell.data('near')
				.filter('.active').each(function (index, cellNode){
					revealCell($(this));
				});
		}
	}

	function toggleCaution (cell) {
		cell.toggleClass('caution');
	}

	mineSweeper($('.js-minesweeper'), 9, 9, 10);

	$(document).mouseup(function (){
		face.removeClass('sweeper-face_wow');
	});

	face.mousedown(function (){
		$(this).addClass('sweeper-face_active');
	}).mouseup(function (){
		$(this).removeClass('sweeper-face_active');
		restart();
	});

	//disable right click
	$(document).ready(function() {
		$(document)[0].oncontextmenu = function (){
			return false
		};
	});

	var dropdown = $('.js-menu-dropdown');

	$('.js-menu-btn').click(function (){
		dropdown.toggle();
	});

	$('.js-menu-item').click(function (){
		dropdown.hide();
	});

	$('html').click(function (){
		dropdown.hide();		
	});

	$('.js-menu').click(function (event){
		event.stopPropagation();
	});

	$('.js-diff-1').click(function (){
		mineSweeper($('.js-minesweeper'), 9, 9, 10);
	});

	$('.js-diff-2').click(function (){
		mineSweeper($('.js-minesweeper'), 16, 16, 40);
	});

	$('.js-diff-3').click(function (){
		mineSweeper($('.js-minesweeper'), 30, 16, 99);
	});

	$('.js-custom').click(function (){
		$('.js-settings').show();
	})

	$('.js-btn-ok').click(function (){
		mineSweeper($('.js-minesweeper'),
			$('.js-rows').val(),
			$('.js-cols').val(),
			$('.js-bombs').val()
		);
		$('.js-settings').hide();
	})

	$('.js-btn-cancel').click(function (){
		$('.js-settings').hide();
	})


});
