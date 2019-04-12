export function setNumber (number) {
  const numberEl = document.querySelector('.number');

  if (numberEl) {
    numberEl.innerHTML = number;
  }
}
