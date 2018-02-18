$(document).ready(function(){
	// Today in Google doodles history
	// Go back in Google doodles history and get doodles for this date
	// Google doodles history starts on 1998/8/30
	// https://en.wikipedia.org/wiki/Google_Doodle

	// Parse current date for year, month, date
	let currentDate = getFormattedDate(new Date());

	// Change background colors on hover
	$("body").on('mouseenter', '.btn-primary, button', function(){
		let bgColor = getRandGoogleColor(); // + '!important';
		$(this).css('background-color', bgColor);
	});
	
	$("body").on('mouseleave', '.btn-primary, button', function(){
		let bgColor = getRandGoogleColor(); // + ' !important';
		$(this).css('background-color', bgColor);
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

	

	renderPageTitle();
	renderDoodles(currentDate);

	
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

		let row = ""; // Variable to hold our row

		doodles.sort(sortDoodlesByDate)

		doodles.forEach(function(doodle){
			let card = $(createDoodleCard(doodle));

			// Show 3 doodles per row if we can
			if (doodlesCount <= 3){
				
				if (doodlesCount === 0){
					// Create a new row
					row = $('<div>').addClass('row');
				}

				var col = $('<div>').addClass('col-xs-12 col-sm-6 col-md-4');
				col.html(card);
				row.append(col);
				doodlesCount++;
			}

			if (doodlesCount === 3){
				doodlesCount = 0;
				container.append(row);
			}
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
			url: 'https://www.google.com/doodles/json/' + year + '/' + month + '?hl=en',
			method: 'GET'
		}).then(function(doodles){
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
					url: parseImgUrl(doodle.hires_url),
					title: doodle.query,
					sub_title: getFormattedDateString(doodleDate),
					google_query: 'https://www.google.com/search?q=' + doodle.query + ' ' + doodleDate.day + ' ' + doodleDate.monthAsNumber + ' ' + doodleDate.year
				}

				todaysDoodles.push(newDoodle);
			})

			if (filteredDoodles.length){
				showDoodles(todaysDoodles);
			}
			
			
		});
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
			year: date.getFullYear(),
			monthAsNumber: date.getMonth() + 1,
			monthAsString: date.toLocaleString('en-us', {month:'long'}),
			day: date.getDate()
		}
	}

	function getDoodleDate(doodle){
		// The doodle date is in the run_date_array property
		// {run_date_array:[YYY, MM, DD]}
		let doodleDateString = doodle.run_date_array.reduce(function(acc, next){
			return acc += next + '/'
		}, '');
		return new Date(doodleDateString);
	}

	function isPast(date1, date2){
		if (date1.year < date2.year || date1.monthAsNumber < date2.monthAsNumber || date1.day < date2.day){
			return true;
		}else{
			return false;
		}
	}

	function getConsecutiveDate(doodleDate, type){
		let tempCurrentDate = new Date(getFormattedDateString(doodleDate));

		if (type === 'next'){
			tempCurrentDate = tempCurrentDate.setDate(tempCurrentDate.getDate() + 1);
		}else if (type == 'prev'){
			tempCurrentDate = tempCurrentDate.setDate(tempCurrentDate.getDate() - 1);
		}else{}
		
		return getFormattedDate(new Date(tempCurrentDate));
	}

})
