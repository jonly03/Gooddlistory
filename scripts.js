$(document).ready(function(){
	// Today in Google doodles

	// Parse current date for year, month, date
	let currentDate = getFormattedDate(new Date("2017/1/28"));
	

	// Go back in Google doodles history and get today's doodles
	// start: 1998/8/30
	// https://en.wikipedia.org/wiki/Google_Doodle
	getDoodlesByDay(currentDate);
	

	function getDoodlesByDay(date){
		$.ajax({
			url: 'https://www.google.com/doodles/json/' + date.year + '/' + date.monthAsNumber + '?hl=en',
			method: 'GET'
		}).then(function(doodles){
			let todayDoodles = filterDoodlesByDay(doodles, date.day);
			showDoodles(todayDoodles);
			
		});
	}

	function filterDoodlesByDay(doodles, day){
		// doodles are arrays of objects
		// Each doodle has a run_date_array key which is an array
		// { run_date_array: [YYYY, MM, DD] }
		return doodles.filter(function(doodle){
			return doodle.run_date_array[2] === day;
		})
	}

	
	/************
	UI Helpers
	************/
	function showDoodles(doodles){
		let doodlesCount = 0;
		let container = $('.container');

		let row = ""; // Variable to hold our row

		doodles.forEach(function(doodle){
			let card = $(createDoodleCard(doodle));

			if (doodlesCount === 0){
				// Create a new row
				row = $('<div>').addClass('row');
			}

			// Show 4 doodles per row if we can
			if (doodlesCount < 4){
				var col = $('<div>').addClass('col-xs-12 col-sm-6 col-md-4');
				col.html(card);
				row.append(col)
				doodlesCount++;
			}else{
				doodlesCount = 0;
			}
			
			
		});

		container.append(row);
	}

	function createDoodleCard(doodle){
		let doodleDate = getDoodleDate(doodle);

		let googleQuery = 'https://www.google.com/search?q=' + doodle.query + ' ' + doodleDate.day + ' ' + doodleDate.monthAsNumber + ' ' + doodleDate.year;

		let doodleSubTitle = '' + doodleDate.monthAsString + ' '

		// let verb = isPast(doodleDate, getFormattedDate(new Date()))? 'Was' : 'Is';

		let cardImgSrc = 'http://' + doodle.hires_url;

		let card = '<div class="card">' +
		  				'<img class="card-img-top" src="' + cardImgSrc + '" alt="Card image cap">' +
		  				'<div class="card-body">' + 
					    '<h5 class="card-title">' + doodle.query + '</h5>' +
					    '<p class="card-text">' + doodle.title + '</p>' +
					    '<a href="' + googleQuery + '"target="_blank" class="btn btn-primary">' + 'What in the doodle?' + '</a>' +
					  '</div>' +
					'</div>';
		return card;
	}

	/************
	Date Helpers
	*************/
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
		return getFormattedDate(new Date(doodleDateString));
	}

	function isPast(date1, date2){
		if (date1.year < date2.year || date1.monthAsNumber < date2.monthAsNumber || date1.day < date2.day){
			return true;
		}else{
			return false;
		}
	}

})
