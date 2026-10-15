// Keep the enquiry menu's colours consistent across operating systems.
const subject = document.getElementById('contact-subject');
const wrapper = document.createElement('div');
wrapper.className = 'contact-select';
subject.before(wrapper);
wrapper.append(subject);
subject.classList.add('contact-select-native');
subject.tabIndex = -1;
subject.setAttribute('aria-hidden', 'true');
const trigger = document.createElement('button');
trigger.type = 'button';
trigger.id = 'contact-subject-trigger';
trigger.className = 'contact-select-trigger';
trigger.setAttribute('aria-haspopup', 'listbox');
trigger.setAttribute('aria-expanded', 'false');
trigger.setAttribute('aria-controls', 'contact-subject-options');
trigger.setAttribute('aria-labelledby', 'contact-subject-label contact-subject-trigger');
document.querySelector('label[for="contact-subject"]').id = 'contact-subject-label';
document.querySelector('label[for="contact-subject"]').htmlFor = trigger.id;
const menu = document.createElement('ul');
menu.id = 'contact-subject-options';
menu.className = 'contact-select-options';
menu.setAttribute('role', 'listbox');
menu.setAttribute('aria-labelledby', 'contact-subject-label');
menu.tabIndex = -1;
menu.hidden = true;
const options = Array.from(subject.options).filter(option => !option.disabled);
let active = 0;
function highlight(index) {
  active = (index + options.length) % options.length;
  Array.from(menu.children).forEach((item, i) => item.classList.toggle('is-active', i === active));
  menu.setAttribute('aria-activedescendant', menu.children[active].id);
  menu.children[active].scrollIntoView({ block: 'nearest' });
}
function closeMenu(returnFocus = false) {
  menu.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
  if (returnFocus) trigger.focus();
}
function syncValue() {
  trigger.textContent = subject.options[subject.selectedIndex].textContent;
  Array.from(menu.children).forEach((item, i) => item.setAttribute('aria-selected', String(options[i].value === subject.value)));
}
function choose(index) {
  subject.value = options[index].value;
  subject.dispatchEvent(new Event('change', { bubbles: true }));
  trigger.removeAttribute('aria-invalid');
  closeMenu(true);
}
options.forEach((option, index) => {
  const item = document.createElement('li');
  item.id = `contact-subject-option-${index}`;
  item.setAttribute('role', 'option');
  item.textContent = option.textContent;
  item.addEventListener('pointerenter', () => highlight(index));
  item.addEventListener('click', () => choose(index));
  menu.append(item);
});
wrapper.append(trigger, menu);
subject.addEventListener('change', syncValue);
subject.addEventListener('invalid', event => {
  event.preventDefault();
  trigger.setAttribute('aria-invalid', 'true');
  trigger.focus();
});
function openMenu() {
  menu.hidden = false;
  trigger.setAttribute('aria-expanded', 'true');
  menu.focus();
  highlight(Math.max(0, options.findIndex(option => option.value === subject.value)));
}
trigger.addEventListener('click', () => menu.hidden ? openMenu() : closeMenu());
trigger.addEventListener('keydown', event => {
  if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
    event.preventDefault();
    openMenu();
  }
});
menu.addEventListener('keydown', event => {
  if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' ', 'Escape'].includes(event.key)) event.preventDefault();
  if (event.key === 'ArrowDown') highlight(active + 1);
  else if (event.key === 'ArrowUp') highlight(active - 1);
  else if (event.key === 'Home') highlight(0);
  else if (event.key === 'End') highlight(options.length - 1);
  else if (event.key === 'Enter' || event.key === ' ') choose(active);
  else if (event.key === 'Escape') closeMenu(true);
  else if (event.key === 'Tab') { closeMenu(); trigger.focus(); }
  else if (event.key.length === 1) {
    const match = options.findIndex(option => option.textContent.toLowerCase().startsWith(event.key.toLowerCase()));
    if (match >= 0) highlight(match);
  }
});
document.addEventListener('click', event => {
  if (!wrapper.contains(event.target)) closeMenu();
});
wrapper.addEventListener('focusout', event => {
  if (!wrapper.contains(event.relatedTarget)) closeMenu();
});
syncValue();

// Align the note's first text baseline with the enquiry control on wider screens.
const contactNote = document.querySelector('.contact-note');
function alignContactNote() {
  contactNote.style.marginTop = '0px';
  if (window.matchMedia('(max-width: 600px)').matches) return;
  const controlStyle = getComputedStyle(trigger);
  const textTop = trigger.getBoundingClientRect().top
    + parseFloat(controlStyle.borderTopWidth) + parseFloat(controlStyle.paddingTop);
  contactNote.style.marginTop = `${textTop - contactNote.getBoundingClientRect().top}px`;
}
new ResizeObserver(alignContactNote).observe(document.getElementById('contact-form'));
window.addEventListener('resize', alignContactNote);
document.fonts.ready.then(alignContactNote);

const contactForm = document.getElementById('contact-form');
contactForm.noValidate = true;
const errorMessages = new Map();
Array.from(contactForm.elements).filter(field => field.required).forEach(field => {
  const label = field.closest('.contact-field').querySelector('label');
  const error = document.createElement('span');
  error.className = 'contact-field-error';
  error.id = `${field.id}-error`;
  error.setAttribute('role', 'alert');
  error.hidden = true;
  label.append(error);
  const control = field === subject ? trigger : field;
  control.setAttribute('aria-describedby', error.id);
  const originalPlaceholder = field.getAttribute('placeholder');
  function resetError() {
    error.hidden = true;
    error.textContent = '';
    control.removeAttribute('aria-invalid');
    if (field === subject) syncValue();
    else if (originalPlaceholder === null) field.removeAttribute('placeholder');
    else field.setAttribute('placeholder', originalPlaceholder);
  }
  errorMessages.set(field, { error, control, resetError });
  function clearError() {
    if (field.validity.valid || (field.value && field.validity.valueMissing === false)) resetError();
  }
  field.addEventListener('input', clearError);
  field.addEventListener('change', clearError);
});

// Demonstrate validation locally until the production enquiry endpoint is supplied.
contactForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const status = document.getElementById('contact-status');
  status.hidden = true;
  const invalid = Array.from(errorMessages.keys()).find(field => !field.validity.valid);
  errorMessages.forEach(({ resetError }) => resetError());
  if (invalid) {
    const { error, control } = errorMessages.get(invalid);
    error.textContent = invalid.validity.valueMissing
      ? (invalid.id === 'contact-name' ? 'Please fill this field in with your name.' : 'Please fill in this field.')
      : 'Please enter a valid email address.';
    error.hidden = false;
    control.setAttribute('aria-invalid', 'true');
    if (invalid.validity.valueMissing) {
      if (invalid === subject) trigger.textContent = error.textContent;
      else invalid.setAttribute('placeholder', error.textContent);
    }
    control.focus();
    return;
  }
  status.hidden = false;
  status.textContent = 'Your form is ready for review. This prototype has not sent your enquiry.';
});
