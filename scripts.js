$(document).ready(function(){
	// Today in Google doodles history
	// Go back in Google doodles history and get doodles for this date
	// Google doodles history starts on 1998/8/30
	// https://en.wikipedia.org/wiki/Google_Doodle

	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	// Parse current date for year, month, date
	let currentDate = getFormattedDate(moment());

	// Change background colors on hover
	$("body").on('mouseenter', '.btn-primary, button', function(){
		$(this).css('background-color', getRandGoogleColor());
	});
	
	$("body").on('mouseleave', '.btn-primary, button', function(){
		
		$(this).css('background-color', getRandGoogleColor());
	});

	$('body').on('click', '#prev button', function(event){
		event.preventDefault();

		currentDate = getConsecutiveDate(currentDate, 'prev');
		renderDoodles(currentDate);
	})

	$('body').on('click', '#next button', function(event){
		event.preventDefault();

		currentDate = getConsecutiveDate(currentDate, 'next');
		renderDoodles(currentDate);
	})

	$('body').on('mouseenter', '#current-date', function(evernt){
		$('#static-date').addClass('hide');
		$('#edit-date').removeClass('hide');
		$('#submit').css('background-color', getRandGoogleColor());
		$('#user-input').css('background-color', getRandGoogleColor());

		if (!$('.alert').hasClass('error')){
			$('#user-input').val(formatCurrentDateForUserInput());
		}
	})

	$('body').on('mouseleave', '#edit-date', function(event){
		if (!$('.alert').hasClass('error')){
			$('#edit-date').addClass('hide');
			$('#static-date').removeClass('hide');
		}
	})

	$('body').on('click', function(event){
		if (!$('.alert').hasClass('error')){
			$('#edit-date').addClass('hide');
			$('#static-date').removeClass('hide');
		}
	})

	// Handle clicking Enter key when editing the date
	$('#user-input').keydown(function (e) {
	  if (e.keyCode == 13) {
	    $('#submit').click();
	  }
	});

	$('body').on('click', '#submit', function(event){
		event.preventDefault();

		$('.alert').remove();

		$('#edit-date').addClass('hide');
		$('#static-date').removeClass('hide');

		let userInput = $('#user-input').val();
		let isValidDate = isValidDateString(userInput);
		if (isValidDate.status){

			// if ($('.alert'))
			// $('.alert').removeClass('error');

			// Parse user input
			let userInputParts = userInput.split('/');
			currentDate.monthAsNumber = Number(userInputParts[0]);
			currentDate.monthAsString = months[currentDate.monthAsNumber - 1];
			currentDate.day = Number(userInputParts[1]);
			currentDate.year = Number(userInputParts[2]);

			renderDoodles(currentDate);

		}else{
			let alert = $('<div class="alert alert-danger alert-dismissible error">' +
					    	'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + 
					    	'<strong>Error! </strong>' +  isValidDate.msg + ' Try a different date.' +
					  	'</div>');
			$('#edit-date').append(alert).removeClass('hide');
			$('#static-date').addClass('hide');
		}
	})

	
	renderPageTitle();
	renderDoodles(currentDate);

	/************
	Validation Helpers
	************/
	function isValidDateString(dateString){
		// Addapted from https://stackoverflow.com/questions/6177975/how-to-validate-date-with-format-mm-dd-yyyy-in-javascript

	    // First check for the pattern
	    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)){
	        return {status:false, msg:'The date has to be in MM/DD/YYYY format.'};
	    }

	    // Parse the date parts to integers
	    var parts = dateString.split("/");
	    var month = parseInt(parts[0], 10);
	    var day = parseInt(parts[1], 10);
	    var year = parseInt(parts[2], 10);

	    // Check the ranges of month and days
	    if(month == 0 || month > 12){
	        return {status:false, msg:'The month has to be between 01 and 12.'};
	    }else{
	    	// Check the range of the day
		    let monthLengths = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

		    // Adjust for leap years
		    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)){
		        monthLengths[1] = 29;
		    }

	    	if (day <= 0 || day > monthLengths[month - 1]){
	    		return {status:false, msg:'The day has to be between 01 and ' + monthLengths[month - 1] + ' for ' + months[month - 1] + ' ' + year + '.'};
	    	}else{
	    		return {status: true};
	    	}
	    };
	};

	/************
	UI Helpers
	************/
	function renderDoodles(date){

		renderPageSubTitle(date);

		$('.container').empty();
		getTodaysDoodlesInHistory(date);
	}

	function showDoodles(doodles){
		let doodlesCount = 0;
		let container = $('.container');

		container.empty();

		let row = $('<div>').addClass('row'); 
		// ""; // Variable to hold our row

		doodles.sort(sortDoodlesByDate)

		doodles.forEach(function(doodle){
			let card = $(createDoodleCard(doodle));

			var col = $('<div>').addClass('col-xs-12 col-md-4');
			col.html(card);

			row.append(col);

			container.append(row);
		});

		container.append(row);
	}

	function createDoodleCard(doodle){
		let card = '<div class="card">' +
		  				'<img class="card-img-top" src="' + doodle.url + '" alt="Card image cap">' +
		  				'<div class="card-body">' + 
					    '<h5 class="card-title">' + doodle.title + '</h5>' +
					    '<p class="card-text">' + doodle.sub_title + '</p>' +
					    '<a href="' + doodle.google_query + '"target="_blank" class="btn btn-primary ' + getRandGoogleColorClass() + '">' + 'What in the doodle?' + '</a>' +
					  '</div>' +
					'</div>';
		return card;
	}

	function getRandGoogleColorClass(){
		// Give our buttons random google colors
		let google_colors = ['google-blue', 'google-green', 'google-yellow', 'google-red'];
		let randColorIdx = Math.floor(Math.random() * google_colors.length);

		return google_colors[randColorIdx]
	}

	function getRandGoogleColor(){
		// Give our buttons random google colors
		let google_colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335'];
		let randColorIdx = Math.floor(Math.random() * google_colors.length);

		return google_colors[randColorIdx]
	}

	function parseImgUrl(url){
		// We get some urls in a 'https://url' and others in a '//url' format
		// Build urls ourselves uniformly to avoid confusion
		let urlParts = url.split('//');

		return 'https://' + urlParts[1];
	}

	function renderPageTitle(){
		// Color each letter of our header with a rondom Google brand color
		let header = 'Today in Google doodles history';
		let headerLetters = header.split('');
		let newHeader = '';
		headerLetters.forEach(function(letter){
			newHeader += '<span class="' + getRandGoogleColorClass() + '">' + letter + '</span>';
		})

		$('#title').html(newHeader);
	}

	function renderPageSubTitle(date){
		// Populate sub-title with current date
		$('#current-date').text(getFormattedDateString(date));

		// Give prev and next buttons random Google brand colors
		$('#prev button').addClass(getRandGoogleColorClass());
		$('#next button').addClass(getRandGoogleColorClass());
	}

	/************
	Date Helpers
	*************/

	function getTodaysDoodlesInHistory(date){
		// Google doodles history starts in 1998
		let todaysDoodles = [];
		for (let year=date.year; year >= 1998; year--){
			getDoodlesByDate(todaysDoodles, year, date.monthAsNumber, date.day);
		}
	}

	function getDoodlesByDate(todaysDoodles, year, month, day){
		$.ajax({
			url: 'https://google-doodles.herokuapp.com/doodles/' + year + '/' + month + '?hl=en',
			method: 'GET'
		}).then(function parseDoodlesResponse(doodles){
			
			let filteredDoodles = filterDoodlesByDay(doodles, day);
			
			filteredDoodles.forEach(function(doodle){
				let doodleDate = getFormattedDate(getDoodleDate(doodle));

				let newDoodle = {
					id: Number(getDoodleDate(doodle)),
					date:{
						year: doodleDate.year,
						month: doodleDate.monthAsNumber,
						day: doodleDate.day
					},
					url: parseImgUrl(doodle.high_res_url),
					title: doodle.query,
					sub_title: getFormattedDateString(doodleDate),
					google_query: 'https://www.google.com/search?q=' + doodle.query + ' ' + doodleDate.monthAsString + ' ' +doodleDate.day +  ' ' + doodleDate.year
				}

				todaysDoodles.push(newDoodle);
			})

			if (filteredDoodles.length){
				showDoodles(todaysDoodles);
			}		
		})
	}

	function getFormattedDateString(doodleDate){
		return doodleDate.monthAsString + ' ' + doodleDate.day + ', ' + doodleDate.year
	}

	function filterDoodlesByDay(doodles, day){
		// doodles are arrays of objects
		// Each doodle has a run_date_array key which is an array
		// { run_date_array: [YYYY, MM, DD] }
		return doodles.filter(function(doodle){
			return doodle.run_date_array[2] === day;
		})
	}

	function sortDoodlesByDate(doodle1, doodle2){
		return doodle2.id - doodle1.id;
	}

	function generateDoodleYearsUntil(date){
		// Doodles years starts in 1998
		let doodleYears = [];
		for (let year=date.year; year >= 1998; year--){
			doodleYears.push(year);
		}
		return doodleYears;
	}

	function getFormattedDate(date){
		return {
			year: date.year(),
			monthAsNumber: date.month() + 1,
			monthAsString: date.month(date.month()).format('MMMM'),
			day: date.date()
		}
	}

	function getDoodleDate(doodle){
		// The doodle date is in the run_date_array property
		// {run_date_array:[YYY, M, D]}
		// Return a short full date moment supported ISO 8601 e.g.20130208
		let doodleDateString = doodle.run_date_array.reduce(function(acc, curr, currIdx){
			let currVal = curr;
			if ( curr < 10){
				currVal = '0' + curr;
			}

			return acc += currVal
		}, '');
		return moment(doodleDateString);
	}

	function isPast(date1, date2){
		if (date1.year < date2.year || date1.monthAsNumber < date2.monthAsNumber || date1.day < date2.day){
			return true;
		}else{
			return false;
		}
	}

	function getConsecutiveDate(doodleDate, type){
		let momentISO8601 = ''+ doodleDate.year;

		if (doodleDate.monthAsNumber < 10) momentISO8601 += '0';
		momentISO8601 += doodleDate.monthAsNumber;

		if (doodleDate.day < 10) momentISO8601 += '0';
		momentISO8601 += doodleDate.day;


		let tempCurrentDate = moment(momentISO8601);

		if (type === 'next'){
			tempCurrentDate.add(1, 'days');
		}else if (type == 'prev'){
			tempCurrentDate.subtract(1, 'days');
		}else{}
		
		return getFormattedDate(moment(tempCurrentDate));
	}

	function formatCurrentDateForUserInput(){
		return (currentDate.monthAsNumber < 10 ? '0' + currentDate.monthAsNumber : currentDate.monthAsNumber) + '/' + (currentDate.day < 10 ? '0' + currentDate.day : currentDate.day)  + '/' + currentDate.year;
	}



})
