const isEmailValid = (email) => {
	let pattern = /^[\w.-]+@[\w.-]+\.\w+$/;
	return pattern.test(email);
}

function PasswordStrengthAssesser() {
	this._config = {
		passwordLength: {
			value: 8,
			weight: 1,
			valid: false
		},
		nbOfLowerChars: {
			value: 1,
			weight: 1,
			valid: false
		},
		nbOfUpperChars: {
			value: 1,
			weight: 1,
			valid: false
		},
		nbOfSpecials: {
			value: 1,
			weight: 1,
			valid: false
		},
		nbOfDigits: {
			value: 1,
			weight: 1,
			valid: false
		}
	};
	this._config.passwordLength.message = `Should be at least ${this._config.passwordLength.value} characters long`;
	this._config.nbOfLowerChars.message = `Should contain at least ${this._config.nbOfLowerChars.value} lower-case character(s)`;
	this._config.nbOfUpperChars.message = `Should contain at least ${this._config.nbOfUpperChars.value} upper-case character(s)`;
	this._config.nbOfSpecials.message = `Should contain at least ${this._config.nbOfSpecials.value} special character(s)`;
	this._config.nbOfDigits.message = `Should contain at least ${this._config.nbOfDigits.value} digit(s)`;
	this.strength = 0;
	this.progressBarInfo = {},
	this._passwordStrengthCheckList = document.querySelector('#passwordStrengthCheckList');
	this._assessLength = function(password) {
		this._config.passwordLength.valid = false;
		if (password.length >= this._config.passwordLength.value) {
			this.strength += this._config.passwordLength.weight;
			this._config.passwordLength.valid = true;
		}
	};
	this._assessLowerChars = function(password) {
		this._config.nbOfLowerChars.valid = false;
		let matches = password.match(/[a-z]/g);
		matches = matches ? matches.length : 0;
		if (matches >= this._config.nbOfLowerChars.value) {
			this.strength += this._config.nbOfLowerChars.weight;
			this._config.nbOfLowerChars.valid = true;
		}
	};
	this._assessUpperChars = function(password) {
		this._config.nbOfUpperChars.valid = false;
		let matches = password.match(/[A-Z]/g);
		matches = matches ? matches.length : 0;
		if (matches >= this._config.nbOfUpperChars.value) {
			this.strength += this._config.nbOfUpperChars.weight;
			this._config.nbOfUpperChars.valid = true;
		}
	};
	this._assessNbOfSpecials = function(password) {
		this._config.nbOfSpecials.valid = false;
		if (password.replace(/[A-Za-z0-9\s]/g, '').length >= this._config.nbOfSpecials.value) {
			this.strength += this._config.nbOfSpecials.weight;
			this._config.nbOfSpecials.valid = true;
		}
	};
	this._assessNbOfDigits = function(password) {
		this._config.nbOfDigits.valid = false;
		if (password.replace(/[^0-9\s]/g, '').length >= this._config.nbOfDigits.value) {
			this.strength += this._config.nbOfDigits.weight;
			this._config.nbOfDigits.valid = true;
		}
	};
	this._updateProgressBarInfo = function() {
		if (this.strength <= 25) {
			this.progressBarInfo.class = 'progress-bar-red';
			this.progressBarInfo.label = 'Very Weak';
		} else if (this.strength <= 50) {
			this.progressBarInfo.class = 'progress-bar-orange';
			this.progressBarInfo.label = 'Weak';
		} else if (this.strength <= 75) {
			this.progressBarInfo.class = 'progress-bar-yellow';
			this.progressBarInfo.label = 'Moderate';
		} else if (this.strength <= 100) {
			this.progressBarInfo.class = 'progress-bar-green';
			this.progressBarInfo.label = 'Good';
		}
	};
	this._updateChecklist = function() {
		this._passwordStrengthCheckList.innerHTML = '';
		for (const prop in this._config) {
			let txt = document.createElement('small');
			txt.innerHTML = this._config[prop].message;
			txt.className = 'help-block d-block';
			if (this._config[prop].valid) {
				txt.classList.add('validated');
			}
			this._passwordStrengthCheckList.append(txt);
		}
	};
	this.assess = function(password) {
		this.strength = 0;
		this.errors = [];

		this._assessLength(password);
		this._assessLowerChars(password);
		this._assessUpperChars(password);
		this._assessNbOfSpecials(password);
		this._assessNbOfDigits(password);

		let weights = Object.values(this._config)
			.reduce((accumulator, { weight }) => accumulator + weight, 0);

		this.strength = (this.strength * 100) / weights;

		this._updateProgressBarInfo();
		this._updateChecklist();
	};
}

window.onload = () => {
	let form = document.getElementById('registerForm');

	let emailField = form.querySelector('#emailField');
	let emailFieldHelpBlock = document.querySelector('.emailField-container')
		.querySelector('.help-block');

	let passwordField = form.querySelector('#passwordField');
	let passwordFieldHelpBlock = document.querySelector('.passwordField-container')
		.querySelector('.help-block');

	let passwordStrengthBarContainer = document.getElementById('passwordStrengthBar');
	let passwordStrengthBar = passwordStrengthBarContainer.querySelector('.progress-bar');
	let psa = new PasswordStrengthAssesser();

	let submitBtn = document.getElementById('submitBtn');

	passwordField.addEventListener('keyup', function (e) {
		if (this.value.length < 1) {
			passwordStrengthBarContainer.style = 'display: none';
		} else {
			passwordStrengthBarContainer.style = 'display: block';
		}

		psa.assess(passwordField.value);
		passwordStrengthBar.style = `width: ${psa.strength}%`;
		passwordStrengthBar.ariaValueNow = `${psa.strength}`;

		passwordStrengthBar.className = `progress-bar ${psa.progressBarInfo.class}`;
		passwordStrengthBar.innerHTML = psa.progressBarInfo.label;
	})

	submitBtn.addEventListener('click', function (e) {
		e.preventDefault();
		let submit = true;
		emailFieldHelpBlock.innerHTML = '';
		passwordFieldHelpBlock.innerHTML = '';

		if (emailField.value.length < 1) {
			emailFieldHelpBlock.innerHTML = 'Email cannot be blank';
			submit = false;
		} else if (!isEmailValid(emailField.value)) {
			emailFieldHelpBlock.innerHTML = 'Email has to be a valid email address';
			submit = false;
		}

		if (passwordField.value.length < 1) {
			passwordFieldHelpBlock.innerHTML = 'Password cannot be blank';
			submit = false;
		} else if (psa.strength != 100) {
			passwordFieldHelpBlock.innerHTML = 'Password does not meet minimum requirements';
			submit = false;
		}

		var captchResponse = document.getElementById('g-recaptcha-response').value;
		if(captchResponse.length == 0 ) {
			submit = false
		}

		if (submit) {
			form.submit();
		}
	})
}